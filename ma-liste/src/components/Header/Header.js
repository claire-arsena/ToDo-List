import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { TodoContext } from '../../ctx/TodoContext';
import './Header.css';

function Header() {
  const location = useLocation();
  const { resetData, loadBackup, taches, getActiveTasks } = useContext(TodoContext);

  const titles = {
    '/': 'Liste de tâches',
    '/agenda': 'Agenda',
    '/dossiers': 'Dossiers',
    '/dashboard': 'Tableau de bord'
  };

  const currentTitle = titles[location.pathname] || 'Ma Liste';
  const totalTasks = taches.length;
  const activeTasksCount = getActiveTasks().length;

  return (
    <header className="App-header">
        <h1>{currentTitle}</h1>
        <nav className="header-actions">
          <div className="task-stats">
            <span className="stat-item">Total: <strong>{totalTasks}</strong></span>
            <span className="stat-item">En cours: <strong>{activeTasksCount}</strong></span>
          </div>
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
