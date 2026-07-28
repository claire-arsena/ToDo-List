import { useContext, useMemo } from 'react';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS, ETAT_TERMINE } from '../config/constants';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const getCSSVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const getStatusColors = () => ({
  [ETATS.NOUVEAU]: getCSSVar('--color-status-new'),
  [ETATS.EN_COURS]: getCSSVar('--color-status-progress'),
  [ETATS.REUSSI]: getCSSVar('--color-status-done'),
  [ETATS.EN_ATTENTE]: getCSSVar('--color-status-waiting'),
  [ETATS.ABANDONNE]: getCSSVar('--color-status-cancelled'),
});

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function Dashboard() {
  const { tasks } = useContext(TodoContext);

  const stats = useMemo(() => {
    const total = tasks.length;
    const active = tasks.filter(t => !ETAT_TERMINE.includes(t.status)).length;
    const done = tasks.filter(t => t.status === ETATS.REUSSI).length;
    const today = getToday();
    const overdue = tasks.filter(t => {
      if (ETAT_TERMINE.includes(t.status)) return false;
      if (!t.endDate) return false;
      return t.endDate < today;
    }).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, active, done, overdue, completionRate };
  }, [tasks]);

  const chartData = useMemo(() => {
    const counts = {};
    Object.values(ETATS).forEach(status => {
      counts[status] = 0;
    });
    tasks.forEach(task => {
      if (counts[task.status] !== undefined) {
        counts[task.status]++;
      }
    });

    const labels = [];
    const data = [];
    const colors = [];
    const statusColors = getStatusColors();

    Object.entries(counts).forEach(([status, count]) => {
      if (count > 0) {
        labels.push(status);
        data.push(count);
        colors.push(statusColors[status]);
      }
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 0,
        borderRadius: 4,
      }],
    };
  }, [tasks]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: "'VendSans', sans-serif",
            size: 13,
            weight: 'bold',
          },
          color: '#555',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percent = Math.round((context.parsed / total) * 100);
            return ` ${context.label}: ${context.parsed} (${percent}%)`;
          },
        },
        titleFont: { family: "'VendSans', sans-serif", size: 13 },
        bodyFont: { family: "'VendSans', sans-serif", size: 13 },
      },
    },
  };

  return (
    <section className="dashboard">
      <h1>Dashboard</h1>

      <div className="dashboard-stats">
        <article className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </article>
        <article className="stat-card">
          <span className="stat-number">{stats.active}</span>
          <span className="stat-label">En cours</span>
        </article>
        <article className="stat-card stat-card-success">
          <span className="stat-number">{stats.done}</span>
          <span className="stat-label">Terminées</span>
        </article>
        {stats.overdue > 0 && (
          <article className="stat-card stat-card-danger">
            <span className="stat-number">{stats.overdue}</span>
            <span className="stat-label">En retard</span>
          </article>
        )}
      </div>

      {stats.total > 0 ? (
        <article className="chart-container">
          <div className="chart-wrapper">
            <div className="chart-center-label">
              <span className="chart-percent">{stats.completionRate}%</span>
              <span className="chart-percent-label">complété</span>
            </div>
            <figure className="pie-chart">
              <Doughnut data={chartData} options={chartOptions} />
            </figure>
          </div>
        </article>
      ) : (
        <div className="dashboard-empty">
          <span>📊</span>
          <p>Créez des tâches pour voir vos statistiques</p>
        </div>
      )}
    </section>
  );
}

export default Dashboard;
