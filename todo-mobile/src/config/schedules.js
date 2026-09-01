import { ALLOWED_PROFILES } from '../ctx/ProfileContext';
import { formatLocalDate } from '../utils/planningTime';
import claireSchedule from '../data/schedules/claire.json';
import albanSchedule from '../data/schedules/alban.json';

// Un profil sans flux .ics configuré a un tableau vide ici — son
// interrupteur "Superposition des emplois du temps" et la détection de
// covoiturage restent sans effet tant que son lien n'a pas été ajouté
// (voir scripts/fetch-schedules.js).
const SCHEDULES_BY_PROFILE = {
  claire: claireSchedule,
  alban: albanSchedule,
};

const FALLBACK_COLOR = '#8e8e93';

export function getMergedSchedule(visibleSchedules) {
  const events = [];
  Object.entries(SCHEDULES_BY_PROFILE).forEach(([profileId, list]) => {
    if (visibleSchedules && visibleSchedules[profileId] === false) return;
    const profile = ALLOWED_PROFILES.find((p) => p.id === profileId);
    list.forEach((evt) => {
      events.push({
        ...evt,
        profileId,
        profileName: profile?.name || profileId,
        color: profile?.defaultColor || FALLBACK_COLOR,
      });
    });
  });
  return events;
}

// Tolérance d'écart de début/fin de journée pour proposer le covoiturage
// entre Claire et Alban.
const CARPOOL_TOLERANCE_MIN = 60;

// Première arrivée et dernier départ du jour pour un flux d'événements
// donné, ou null si ce profil n'a aucun cours ce jour-là.
function getDayBounds(events, dateStr) {
  let start = null;
  let end = null;
  events.forEach((evt) => {
    if (evt.allDay) return;
    if (formatLocalDate(new Date(evt.start)) !== dateStr) return;
    const evtStart = new Date(evt.start);
    const evtEnd = new Date(evt.end || evt.start);
    if (!start || evtStart < start) start = evtStart;
    if (!end || evtEnd > end) end = evtEnd;
  });
  return start && end ? { start, end } : null;
}

// Vrai si Claire et Alban ont tous deux cours le dateStr donné, avec des
// horaires de début et de fin proches à CARPOOL_TOLERANCE_MIN minutes près.
export function isCarpoolPossible(dateStr) {
  const claireBounds = getDayBounds(SCHEDULES_BY_PROFILE.claire, dateStr);
  const albanBounds = getDayBounds(SCHEDULES_BY_PROFILE.alban, dateStr);
  if (!claireBounds || !albanBounds) return false;

  const startDiffMin = Math.abs(claireBounds.start - albanBounds.start) / 60000;
  const endDiffMin = Math.abs(claireBounds.end - albanBounds.end) / 60000;
  return startDiffMin <= CARPOOL_TOLERANCE_MIN && endDiffMin <= CARPOOL_TOLERANCE_MIN;
}
