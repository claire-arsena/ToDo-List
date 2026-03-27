import { useContext, useMemo } from 'react';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS } from '../config/constants';
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

function Dashboard() {
  const { tasks } = useContext(TodoContext);

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
      }],
    };
  }, [tasks]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            family: "'ShadowsIntoLightTwo', cursive",
            size: 16,
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
        titleFont: {
          family: "'ShadowsIntoLightTwo', cursive",
          size: 14,
        },
        bodyFont: {
          family: "'ShadowsIntoLightTwo', cursive",
          size: 14,
        },
      },
    },
  };

  return (
    <section className="dashboard">
      <h1>Tableau de bord</h1>
      {tasks.length === 0 ? (
        <p>Aucune tâche à afficher</p>
      ) : (
        <article className="chart-container">
          <figure className="pie-chart">
            <Doughnut data={chartData} options={chartOptions} />
          </figure>
        </article>
      )}
    </section>
  );
}

export default Dashboard;
