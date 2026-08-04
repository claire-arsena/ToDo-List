import { useContext, useState, useMemo } from 'react';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS } from '../config/constants';
import '../styles/Agenda.css';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const STATUS_COLORS = {
  [ETATS.NOUVEAU]: '--color-status-new',
  [ETATS.EN_COURS]: '--color-status-progress',
  [ETATS.REUSSI]: '--color-status-done',
  [ETATS.EN_ATTENTE]: '--color-status-waiting',
  [ETATS.ABANDONNE]: '--color-status-cancelled',
};

const formatLocalDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function Agenda() {
  const { tasks } = useContext(TodoContext);
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const today = formatLocalDate(new Date());

  // Build map: date string → array of tasks covering that date
  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach(t => {
      const start = t.startDate || t.endDate;
      const end = t.endDate || t.startDate;
      if (!start) return;

      const startD = new Date(start + 'T12:00:00');
      const endD = new Date((end || start) + 'T12:00:00');
      const d = new Date(startD);

      // Limit iteration to prevent infinite loops on bad data
      let safety = 0;
      while (d <= endD && safety < 365) {
        const key = formatLocalDate(d);
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(t);
        d.setDate(d.getDate() + 1);
        safety++;
      }
    });
    return map;
  }, [tasks]);

  const undatedTasks = useMemo(() => tasks.filter(t => !t.startDate && !t.endDate), [tasks]);

  const days = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const start = first === 0 ? 6 : first - 1;
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();
    const result = [];

    for (let i = start - 1; i >= 0; i--)
      result.push({ day: prevLast - i, out: true });

    for (let d = 1; d <= lastDate; d++)
      result.push({
        day: d,
        out: false,
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      });

    while (result.length % 7 !== 0)
      result.push({ day: result.length - start - lastDate + 1, out: true });

    return result;
  }, [year, month]);

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <section className="agenda">
      <h1>Agenda</h1>
      <nav className="agenda-nav">
        <button className="btn btn-small btn-secondary" onClick={() => setCurrent(new Date(year, month - 1, 1))}>◀</button>
        <strong className="agenda-month">{MONTHS[month]} {year}</strong>
        <button className="btn btn-small btn-secondary" onClick={() => setCurrent(new Date(year, month + 1, 1))}>▶</button>
        <button className="btn btn-small btn-primary" onClick={() => setCurrent(new Date())}>Aujourd'hui</button>
      </nav>
      {undatedTasks.length > 0 && (
        <section className="undated-tasks">
          <h2>Sans date</h2>
          <ul>
            {undatedTasks.map(t => (
              <li key={t.id} style={{ backgroundColor: `var(${STATUS_COLORS[t.status] || '--color-pink-light'})` }}>{t.title}</li>
            ))}
          </ul>
        </section>
      )}
      <table className="agenda-grid">
        <thead>
          <tr>{DAYS.map(d => <th key={d}>{d}</th>)}</tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((cell, ci) => {
                const cellTasks = cell.date ? tasksByDate.get(cell.date) || [] : [];
                return (
                  <td
                    key={ci}
                    className={
                      (cell.out ? 'agenda-outside ' : '') +
                      (cell.date === today ? 'agenda-today ' : '') +
                      (cellTasks.length > 0 ? 'agenda-has-tasks' : '')
                    }
                  >
                    <em>{cell.day}</em>
                    {cellTasks.length > 0 && (
                      <ul>
                        {cellTasks.slice(0, 3).map(t => (
                          <li
                            key={t.id}
                            style={{ backgroundColor: `var(${STATUS_COLORS[t.status] || '--color-pink-light'})` }}
                          >
                            {t.title}
                          </li>
                        ))}
                        {cellTasks.length > 3 && (
                          <li className="agenda-more">+{cellTasks.length - 3}</li>
                        )}
                      </ul>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Agenda;