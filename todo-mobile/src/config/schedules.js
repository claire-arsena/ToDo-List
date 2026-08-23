import { ALLOWED_PROFILES } from '../ctx/ProfileContext';
import claireSchedule from '../data/schedules/claire.json';

// Un profil sans flux .ics configuré n'a simplement pas d'entrée ici — son
// interrupteur "Superposition des emplois du temps" reste sans effet tant
// que son lien n'a pas été ajouté (voir scripts/fetch-schedules.js).
const SCHEDULES_BY_PROFILE = {
  claire: claireSchedule,
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
