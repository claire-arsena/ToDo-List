import { useContext, useState, useMemo } from 'react';
import { TodoContext } from '../ctx/TodoContext';
import '../styles/Planning.css';

const STATUS_COLORS = {
  'Nouveau': 'var(--color-status-new)',
  'En cours': 'var(--color-status-progress)',
  'Réussi': 'var(--color-status-done)',
  'En attente': 'var(--color-status-waiting)',
  'Abandonné': 'var(--color-status-cancelled)',
};

const HOUR_HEIGHT = 60;
const START_HOUR = 6;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const formatLocalDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function Planning() {
  const { tasks } = useContext(TodoContext);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = formatLocalDate(selectedDate);
  const todayStr = formatLocalDate(new Date());
  const isToday = dateStr === todayStr;

  const formattedDate = `${DAYS_FR[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTHS_FR[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  // Tasks that fall on the selected day
  const dayTasks = useMemo(() => {
    return tasks.filter(t => {
      const start = t.startDate || t.endDate;
      const end = t.endDate || t.startDate;
      if (!start && !end) return false;
      return dateStr >= start && dateStr <= end;
    });
  }, [tasks, dateStr]);

  // Split into timed tasks (have time info) and all-day tasks
  const timedTasks = useMemo(() => {
    return dayTasks.filter(t => {
      if (t.startDate === dateStr && t.startTime) return true;
      if (t.endDate === dateStr && t.endTime) return true;
      // Multi-day tasks that span over this day entirely — show as all-day
      if (t.startDate < dateStr && t.endDate > dateStr) return false;
      return false;
    });
  }, [dayTasks, dateStr]);

  const allDayTasks = useMemo(() => {
    return dayTasks.filter(t => !timedTasks.includes(t));
  }, [dayTasks, timedTasks]);

  // Calculate position and height for timed tasks
  const getTaskPosition = (task) => {
    let startH, startM, endH, endM;

    if (task.startDate === dateStr && task.startTime) {
      [startH, startM] = task.startTime.split(':').map(Number);
    } else {
      startH = START_HOUR;
      startM = 0;
    }

    if (task.endDate === dateStr && task.endTime) {
      [endH, endM] = task.endTime.split(':').map(Number);
    } else if (task.endDate > dateStr) {
      endH = END_HOUR;
      endM = 0;
    } else {
      // No end time — default 1h block
      endH = Math.min(startH + 1, END_HOUR);
      endM = startM;
    }

    const top = Math.max(0, (startH - START_HOUR) * HOUR_HEIGHT + (startM / 60) * HOUR_HEIGHT);
    const bottom = (endH - START_HOUR) * HOUR_HEIGHT + (endM / 60) * HOUR_HEIGHT;
    const height = Math.max(28, bottom - top);

    return { top, height };
  };

  // Current time line
  const now = new Date();
  const nowH = now.getHours();
  const nowM = now.getMinutes();
  const showNowLine = isToday && nowH >= START_HOUR && nowH < END_HOUR;
  const nowTop = showNowLine
    ? (nowH - START_HOUR) * HOUR_HEIGHT + (nowM / 60) * HOUR_HEIGHT
    : 0;

  return (
    <section className="planning">
      <h1>Planning</h1>

      <nav className="planning-nav">
        <button className="btn btn-small btn-secondary" onClick={prevDay} aria-label="Jour précédent">◀</button>
        <strong className="planning-date">{formattedDate}</strong>
        <button className="btn btn-small btn-secondary" onClick={nextDay} aria-label="Jour suivant">▶</button>
        {!isToday && (
          <button className="btn btn-small btn-primary" onClick={() => setSelectedDate(new Date())}>
            Aujourd'hui
          </button>
        )}
      </nav>

      {allDayTasks.length > 0 && (
        <section className="planning-allday">
          <p className="planning-allday-label">Journée complète</p>
          <div className="planning-allday-tasks">
            {allDayTasks.map(t => (
              <div
                key={t.id}
                className="planning-allday-task"
                style={{ backgroundColor: STATUS_COLORS[t.status] }}
              >
                <strong>{t.title}</strong>
                {t.startDate !== t.endDate && (
                  <span className="planning-allday-range">
                    {new Date(t.startDate + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    {' → '}
                    {new Date(t.endDate + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="planning-timeline">
        <div className="planning-grid">
          <div className="planning-hours">
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div className="planning-hour-slot" key={i}>
                <span>{String(START_HOUR + i).padStart(2, '0')}:00</span>
              </div>
            ))}
          </div>
          <div className="planning-events-area" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
            {/* Hour grid lines */}
            {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
              <div
                key={i}
                className="planning-hour-line"
                style={{ top: i * HOUR_HEIGHT }}
              />
            ))}

            {/* Current time indicator */}
            {showNowLine && (
              <div className="planning-now-line" style={{ top: nowTop }}>
                <div className="planning-now-dot" />
              </div>
            )}

            {/* Events */}
            {timedTasks.map(t => {
              const pos = getTaskPosition(t);
              return (
                <div
                  key={t.id}
                  className="planning-event"
                  style={{
                    top: pos.top,
                    height: pos.height,
                    backgroundColor: STATUS_COLORS[t.status],
                  }}
                >
                  <strong className="planning-event-title">{t.title}</strong>
                  {pos.height > 35 && (
                    <span className="planning-event-time">
                      {t.startTime || ''}{t.startTime && t.endTime ? ' → ' : ''}{t.endTime || ''}
                    </span>
                  )}
                </div>
              );
            })}

            {timedTasks.length === 0 && allDayTasks.length === 0 && (
              <div className="planning-empty">
                <span>📋</span>
                <p>Aucune tâche prévue ce jour</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}

export default Planning;
