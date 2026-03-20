import React from 'react';
import { useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();

  const titles = {
    '/': 'Liste de tâches',
    '/agenda': 'Agenda',
    '/teams': 'Groupes',
    '/dashboard': 'Tableau de bord',
    '/settings': 'Réglages'
  };

  const currentTitle = titles[location.pathname] || 'Ma Liste';

  return (
    <header className="App-header">
        <h1>{currentTitle}</h1>
    </header>
  );
}

export default Header;
