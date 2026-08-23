#!/usr/bin/env node
/**
 * Récupère les emplois du temps universitaires (flux .ics) des profils
 * configurés ci-dessous et les convertit en JSON exploitable par l'app
 * (src/data/schedules/<profileId>.json), consommé par Planning.jsx et
 * Agenda.jsx en Mode universitaire.
 *
 * Étape de build (build:web) : si un flux est temporairement injoignable,
 * on n'écrase pas le fichier existant pour ne jamais casser le build ni
 * vider un emploi du temps déjà affiché en production.
 */

const fs = require('fs');
const path = require('path');

const SCHEDULE_SOURCES = {
  claire: 'https://agenda-web-consult.univ-amu.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?projectId=8&resources=42526&calType=ical&firstDate=2026-08-25&lastDate=2027-07-31',
};

const OUT_DIR = path.join(__dirname, '..', 'src', 'data', 'schedules');

function unfoldLines(raw) {
  const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rawLines = normalized.split('\n');
  const lines = [];
  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += line.slice(1);
    } else {
      lines.push(line);
    }
  }
  return lines;
}

function unescapeText(value) {
  return (value || '')
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function parseProperty(line) {
  const colonIdx = line.indexOf(':');
  if (colonIdx === -1) return null;
  const rawKey = line.slice(0, colonIdx);
  const value = line.slice(colonIdx + 1);
  const [name, ...paramParts] = rawKey.split(';');
  const params = {};
  paramParts.forEach((p) => {
    const eqIdx = p.indexOf('=');
    if (eqIdx !== -1) params[p.slice(0, eqIdx).toUpperCase()] = p.slice(eqIdx + 1);
  });
  return { name: name.toUpperCase(), params, value };
}

function parseIcsDate(value, params) {
  const isDateOnly = params.VALUE === 'DATE' || /^\d{8}$/.test(value);
  if (isDateOnly) {
    const y = value.slice(0, 4);
    const m = value.slice(4, 6);
    const d = value.slice(6, 8);
    return { iso: `${y}-${m}-${d}T00:00:00`, allDay: true };
  }
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!match) return { iso: null, allDay: false };
  const [, y, mo, d, h, mi, s, z] = match;
  if (z) {
    // Timestamp UTC explicite : on garde le suffixe Z, le rendu local du
    // navigateur fera la conversion vers l'heure de Paris.
    return { iso: `${y}-${mo}-${d}T${h}:${mi}:${s}Z`, allDay: false };
  }
  // Heure flottante (le cas le plus courant pour un EDT universitaire
  // français) : on la traite telle quelle, comme heure murale locale.
  return { iso: `${y}-${mo}-${d}T${h}:${mi}:${s}`, allDay: false };
}

function parseIcs(raw) {
  const lines = unfoldLines(raw);
  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current && current.start) events.push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    const prop = parseProperty(line);
    if (!prop) continue;

    switch (prop.name) {
      case 'UID':
        current.uid = prop.value;
        break;
      case 'SUMMARY':
        current.title = unescapeText(prop.value) || 'Cours';
        break;
      case 'LOCATION':
        current.location = unescapeText(prop.value);
        break;
      case 'DESCRIPTION':
        current.description = unescapeText(prop.value);
        break;
      case 'DTSTART': {
        const { iso, allDay } = parseIcsDate(prop.value, prop.params);
        current.start = iso;
        current.allDay = allDay;
        break;
      }
      case 'DTEND': {
        const { iso } = parseIcsDate(prop.value, prop.params);
        current.end = iso;
        break;
      }
      default:
        break;
    }
  }

  events.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  return events.map((e, i) => ({
    id: e.uid || `evt-${i}`,
    title: e.title || 'Cours',
    location: e.location || '',
    description: e.description || '',
    start: e.start,
    end: e.end || e.start,
    allDay: !!e.allDay,
  }));
}

async function fetchSchedule(profileId, url) {
  const outPath = path.join(OUT_DIR, `${profileId}.json`);
  try {
    const res = await fetch(url, { headers: { Accept: 'text/calendar' } });
    const contentType = res.headers.get('content-type') || '(inconnu)';
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();
    const events = parseIcs(raw);

    // Diagnostic : si 0 créneaux malgré une réponse HTTP OK, on affiche de quoi
    // comprendre pourquoi (mauvais format, page d'erreur déguisée en 200, etc.)
    // sans avoir à re-déboguer à l'aveugle depuis un environnement qui n'a pas
    // accès à ce flux.
    if (events.length === 0) {
      const veventCount = (raw.match(/BEGIN:VEVENT/g) || []).length;
      console.log(`   ↳ Diagnostic ${profileId} : HTTP ${res.status}, Content-Type: ${contentType}, taille ${raw.length} octets, ${veventCount} "BEGIN:VEVENT" trouvés dans la réponse brute.`);
      console.log(`   ↳ Aperçu des 300 premiers caractères :\n${raw.slice(0, 300).replace(/\n/g, '\\n')}`);
    }

    fs.writeFileSync(outPath, JSON.stringify(events, null, 2));
    console.log(`✅  Emploi du temps de ${profileId} mis à jour (${events.length} créneaux).`);
  } catch (e) {
    console.warn(`⚠️  Impossible de récupérer l'emploi du temps de ${profileId} (${e.message}). Fichier existant conservé.`);
    if (!fs.existsSync(outPath)) {
      fs.writeFileSync(outPath, '[]');
    }
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('📅  Récupération des emplois du temps universitaires…\n');
  for (const [profileId, url] of Object.entries(SCHEDULE_SOURCES)) {
    await fetchSchedule(profileId, url);
  }
  console.log('\n🎉  Emplois du temps synchronisés.');
}

if (require.main === module) {
  main();
}

module.exports = { parseIcs };
