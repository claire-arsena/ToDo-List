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

function Agenda() {
  const { tasks } = useContext(TodoContext);
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const today = new Date().toISOString().split('T')[0];

  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach(t => {
      if (!t.dueDate) return;
      if (!map.has(t.dueDate)) map.set(t.dueDate, []);
      map.get(t.dueDate).push(t);
    });
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const start = first === 0 ? 6 : first - 1;
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();
    const result = [];

    for (let i = start - 1; i >= 0; i--)
      result.push({ day: prevLast - i, out: true });

    for (let d = 1; d <= lastDate; d++)
      result.push({ day: d, out: false, date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });

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
      <table className="agenda-grid">
        <thead>
          <tr>{DAYS.map(d => <th key={d}>{d}</th>)}</tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((cell, ci) => (
                <td key={ci} className={(cell.out ? 'agenda-outside ' : '') + (cell.date === today ? 'agenda-today' : '')}>
                  <em>{cell.day}</em>
                  {cell.date && tasksByDate.has(cell.date) && (
                    <ul>
                      {tasksByDate.get(cell.date).map(t => (
                        <li key={t.id} style={{ backgroundColor: `var(${STATUS_COLORS[t.status] || '--color-pink-light'})` }}>{t.title}</li>
                      ))}
                    </ul>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default Agenda;