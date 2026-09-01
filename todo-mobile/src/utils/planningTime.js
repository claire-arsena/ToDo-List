// Constantes et helpers de positionnement temporel partagés entre la
// timeline mobile (Planning.jsx) et la vue semaine PC (PlanningWeekView.jsx).
export const HOUR_HEIGHT = 56;
export const START_HOUR = 6;
export const END_HOUR = 23;
export const TOTAL_HOURS = END_HOUR - START_HOUR;

export const formatLocalDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const formatHM = (iso) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const getPosition = (startH, startM, endH, endM, hourHeight = HOUR_HEIGHT) => {
  const top = Math.max(0, (startH - START_HOUR) * hourHeight + (startM / 60) * hourHeight);
  const bottom = (endH - START_HOUR) * hourHeight + (endM / 60) * hourHeight;
  const height = Math.max(30, bottom - top);
  return { top, height };
};

export const getEventPosition = (evt, hourHeight = HOUR_HEIGHT) => {
  const s = new Date(evt.start);
  const e = new Date(evt.end || evt.start);
  return getPosition(s.getHours(), s.getMinutes(), e.getHours(), e.getMinutes(), hourHeight);
};
