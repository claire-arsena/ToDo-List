import React from 'react';
import tasks from '../assets/tasks.svg';

function Header() {
  return (
    <header className="App-header">
      <img src={tasks} className="App-logo" alt="logo" />
      <p>
        Gestionnaire de tâches
      </p>
    </header>
  );
}

export default Header;