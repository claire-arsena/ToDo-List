import { useContext, useState, useMemo } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import { ETAT_TERMINE } from '../../config/constants';
import TasksItem from './TasksItem';
import './Tasks.css';

function Tasks() {
  const { tasks } = useContext(TodoContext);
  const [filter, setFilter] = useState('active');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const counts = useMemo(() => ({
    active: tasks.filter(t => !ETAT_TERMINE.includes(t.status)).length,
    all: tasks.length,
    done: tasks.filter(t => ETAT_TERMINE.includes(t.status)).length,
  }), [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (filter === 'active') {
      result = result.filter(t => !ETAT_TERMINE.includes(t.status));
    } else if (filter === 'done') {
      result = result.filter(t => ETAT_TERMINE.includes(t.status));
    }

    result.sort((a, b) => {
      if (sortBy === 'title') {
        const valA = a.title.toLowerCase();
        const valB = b.title.toLowerCase();
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (!valA && !valB) return 0;
      if (!valA) return 1;
      if (!valB) return -1;
      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

    return result;
  }, [tasks, filter, sortBy, sortOrder]);

  return (
    <section className="tasks">
      <nav className="filter-bar" aria-label="Filtres et tri">
        <menu className="filter-tabs">
          <li>
            <button
              className={`filter-tab ${filter === 'active' ? 'filter-tab-active' : ''}`}
              onClick={() => setFilter('active')}
            >
              En cours
              <span className="filter-count">{counts.active}</span>
            </button>
          </li>
          <li>
            <button
              className={`filter-tab ${filter === 'all' ? 'filter-tab-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tout
              <span className="filter-count">{counts.all}</span>
            </button>
          </li>
          <li>
            <button
              className={`filter-tab ${filter === 'done' ? 'filter-tab-active' : ''}`}
              onClick={() => setFilter('done')}
            >
              Terminé
              <span className="filter-count">{counts.done}</span>
            </button>
          </li>
        </menu>

        <menu className="sort-options">
          <li>
            <button
              className={`sort-chip ${sortBy === 'startDate' ? 'sort-chip-active' : ''}`}
              onClick={() => handleSort('startDate')}
            >
              Date {sortBy === 'startDate' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </li>
          <li>
            <button
              className={`sort-chip ${sortBy === 'title' ? 'sort-chip-active' : ''}`}
              onClick={() => handleSort('title')}
            >
              Nom {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </li>
        </menu>
      </nav>

      <menu className="tasks-list">
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map((task, index) => (
            <TasksItem key={task.id} task={task} index={index} />
          ))
        ) : (
          <li className="tasks-empty">
            <span className="tasks-empty-icon">
              {filter === 'done' ? '🎯' : '✨'}
            </span>
            <p className="tasks-empty-title">
              {filter === 'done' ? 'Aucune tâche terminée' : 'Aucune tâche en cours'}
            </p>
            <p className="tasks-empty-sub">
              {filter === 'done'
                ? 'Complétez des tâches pour les voir ici'
                : 'Appuyez sur + pour créer votre première tâche'}
            </p>
          </li>
        )}
      </menu>
    </section>
  );
}

export default Tasks;