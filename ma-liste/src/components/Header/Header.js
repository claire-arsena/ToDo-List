import React, { useContext } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import './Header.css';

function Header() {
  const { getActiveTasks } = useContext(TodoContext);
  const activeCount = getActiveTasks().length;

  return (
    <header className="App-header">
      <h1>Ma Liste</h1>
      <span className="header-badge">
        {activeCount} tâche{activeCount !== 1 ? 's' : ''} en cours
      </span>
    </header>
  );
}

export default Header;
