import { useContext, useState } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { ETAT_TERMINE } from '../../config/constants';

const STATUS_COLORS = {
  'Nouveau': 'var(--color-status-new)',
  'En cours': 'var(--color-status-progress)',
  'Réussi': 'var(--color-status-done)',
  'En attente': 'var(--color-status-waiting)',
  'Abandonné': 'var(--color-status-cancelled)',
};

function TasksItem({ task, index }) {
  const { toggleTaskDone, deleteTask } = useContext(TodoContext);
  const { openModal } = useContext(ModalContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const isDone = ETAT_TERMINE.includes(task.status);

  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const isOverdue = !isDone && task.endDate && task.endDate < getToday();

  const formatDateRange = () => {
    if (!task.startDate && !task.endDate) return null;
    const opts = { day: 'numeric', month: 'short' };
    const parts = [];

    if (task.startDate) {
      let s = new Date(task.startDate + 'T12:00:00').toLocaleDateString('fr-FR', opts);
      if (task.startTime) s += ` à ${task.startTime}`;
      parts.push(s);
    }

    if (task.endDate) {
      const sameDay = task.startDate === task.endDate;
      if (sameDay && task.endTime) {
        // Same day — just add end time
        parts[0] += ` → ${task.endTime}`;
      } else if (!sameDay) {
        let e = new Date(task.endDate + 'T12:00:00').toLocaleDateString('fr-FR', opts);
        if (task.endTime) e += ` à ${task.endTime}`;
        parts.push(e);
      }
    }

    return parts.join(' → ');
  };

  const durationLabel = () => {
    if (!task.startDate || !task.endDate || task.startDate === task.endDate) return null;
    const start = new Date(task.startDate + 'T00:00:00');
    const end = new Date(task.endDate + 'T00:00:00');
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    if (days <= 0) return null;
    return `${days + 1} jour${days > 0 ? 's' : ''}`;
  };

  return (
    <article
      className={`task-item ${isDone ? 'task-done' : ''} ${isOverdue ? 'task-overdue' : ''}`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <div className="task-item-row">
        <button
          className={`task-checkbox ${isDone ? 'task-checkbox-checked' : ''}`}
          onClick={() => toggleTaskDone(task.id)}
          aria-label={isDone ? 'Marquer comme non terminé' : 'Marquer comme terminé'}
        >
          {isDone && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="task-item-content" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="task-item-header">
            <h3 className={isDone ? 'task-title-done' : ''}>{task.title}</h3>
            <span
              className="task-status-badge"
              style={{ backgroundColor: STATUS_COLORS[task.status] || 'var(--color-status-new)' }}
            >
              {task.status}
            </span>
          </div>

          <div className="task-item-meta">
            {formatDateRange() && (
              <time className={`task-date ${isOverdue ? 'task-date-overdue' : ''}`}>
                {isOverdue && '⚠ '}{formatDateRange()}
              </time>
            )}
            {durationLabel() && (
              <span className="task-duration">{durationLabel()}</span>
            )}
          </div>
        </div>

        <button
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Réduire' : 'Développer'}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`toggle-icon ${isExpanded ? 'toggle-icon-open' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <section className="task-expanded">
          {task.description && <p className="task-description">{task.description}</p>}

          <footer className="task-actions">
            <button
              className="btn btn-secondary btn-small"
              onClick={() => openModal(task)}
            >
              ✏️ Modifier
            </button>
            <button
              className="btn btn-danger btn-small"
              onClick={() => deleteTask(task.id)}
            >
              🗑️ Supprimer
            </button>
          </footer>
        </section>
      )}
    </article>
  );
}

export default TasksItem;
