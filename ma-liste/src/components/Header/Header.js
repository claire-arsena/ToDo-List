import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { TodoContext } from '../../ctx/TodoContext';
import './Header.css';

function Header() {
  const location = useLocation();
  const { resetData, loadBackup, tasks, getActiveTasks } = useContext(TodoContext);

  const titles = {
    '/': 'Liste de tâches',
    '/agenda': 'Agenda',
    '/folders': 'Dossiers',
    '/dashboard': 'Tableau de bord'
  };

  const currentTitle = titles[location.pathname] || 'Ma Liste';
  const totalTasks = tasks.length;
  const activeTasksCount = getActiveTasks().length;

  return (
    <header className="App-header">
        <h1>{currentTitle}</h1>
        <nav className="header-actions">
          <section className="task-stats">
            <p className="stat-item">Total: <strong>{totalTasks}</strong></p>
            <p className="stat-item">En cours: <strong>{activeTasksCount}</strong></p>
          </section>
          <button 
            className="btn btn-secondary"
            onClick={resetData}
            title="Réinitialiser les tâches"
          >
            Réinitialiser
          </button>
          <button 
            className="btn btn-secondary"
            onClick={loadBackup}
            title="Charger le backup"
          >
            Charger le backup
          </button>
        </nav>
    </header>
  );
}

export default Header;
