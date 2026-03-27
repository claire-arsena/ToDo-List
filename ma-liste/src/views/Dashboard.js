import { useContext, useMemo } from 'react';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS } from '../config/constants';
import './Dashboard.css';

const STATUS_COLORS = {
  [ETATS.NOUVEAU]: 'var(--color-status-new)',
  [ETATS.EN_COURS]: 'var(--color-status-progress)',
  [ETATS.REUSSI]: 'var(--color-status-done)',
  [ETATS.EN_ATTENTE]: 'var(--color-status-waiting)',
  [ETATS.ABANDONNE]: 'var(--color-status-cancelled)',
};

function Dashboard() {
  const { tasks } = useContext(TodoContext);

  const statusData = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return { segments: [], total: 0 };

    const counts = {};
    Object.values(ETATS).forEach(status => {
      counts[status] = 0;
    });
    tasks.forEach(task => {
      if (counts[task.status] !== undefined) {
        counts[task.status]++;
      }
    });

    let cumulative = 0;
    const segments = Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => {
        const percent = (count / total) * 100;
        const start = cumulative;
        cumulative += percent;
        return { status, count, percent, start, end: cumulative };
      });

    return { segments, total };
  }, [tasks]);

  const gradientParts = statusData.segments.map(
    seg => `${STATUS_COLORS[seg.status]} ${seg.start}% ${seg.end}%`
  );
  const gradient = gradientParts.length > 0
    ? `conic-gradient(${gradientParts.join(', ')})`
    : 'none';

  return (
    <section className="dashboard">
      <h1>Tableau de bord</h1>
      {statusData.total === 0 ? (
        <p>Aucune tâche à afficher</p>
      ) : (
        <article className="chart-container">
          <figure
            className="pie-chart"
            style={{ background: gradient }}
            aria-label="Répartition des tâches par statut"
          ></figure>
          <figcaption className="chart-legend">
            {statusData.segments.map(seg => (
              <p key={seg.status} className="legend-item">
                <b
                  className="legend-color"
                  style={{ backgroundColor: STATUS_COLORS[seg.status] }}
                ></b>
                <strong className="legend-label">{seg.status}</strong>
                <small className="legend-value">
                  {seg.count} ({Math.round(seg.percent)}%)
                </small>
              </p>
            ))}
          </figcaption>
        </article>
      )}
    </section>
  );
}

export default Dashboard;
