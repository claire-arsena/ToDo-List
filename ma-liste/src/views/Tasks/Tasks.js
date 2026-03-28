import { useContext, useState, useMemo } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import { ETATS, ETAT_TERMINE } from '../../config/constants';
import TasksItem from './TasksItem';
import './Tasks.css';

function Tasks() {
  const { tasks, folders, relations } = useContext(TodoContext);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [folderFilters, setFolderFilters] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);
  const [activeOnly, setActiveOnly] = useState(true);

  const toggleFolderFilter = (folderId) => {
    setFolderFilters(prev =>
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const toggleStatusFilter = (status) => {
    setStatusFilters(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (activeOnly) {
      result = result.filter(t => !ETAT_TERMINE.includes(t.status));
    }

    if (folderFilters.length > 0) {
      result = result.filter(t =>
        folderFilters.some(fId =>
          relations.some(r => r.taskId === t.id && r.folderId === fId)
        )
      );
    }

    if (statusFilters.length > 0) {
      result = result.filter(t => statusFilters.includes(t.status));
    }

    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'title') {
        valA = a.title.toLowerCase();
        valB = b.title.toLowerCase();
        return sortOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      valA = a[sortBy] || '';
      valB = b[sortBy] || '';
      if (!valA && !valB) return 0;
      if (!valA) return 1;
      if (!valB) return -1;
      return sortOrder === 'asc'
        ? new Date(valA) - new Date(valB)
        : new Date(valB) - new Date(valA);
    });

    return result;
  }, [tasks, sortBy, sortOrder, folderFilters, statusFilters, activeOnly, relations]);

  return (
    <section className="tasks">
      <h1>Liste de tâches</h1>

      <nav className="filter-bar">
        <section className="filter-group">
          <h3>Trier par</h3>
          <menu className="filter-options">
            <li>
              <button
                className={`filter-chip ${sortBy === 'dueDate' ? 'filter-chip-active' : ''}`}
                onClick={() => handleSort('dueDate')}
              >
                Échéance {sortBy === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </li>
            <li>
              <button
                className={`filter-chip ${sortBy === 'creationDate' ? 'filter-chip-active' : ''}`}
                onClick={() => handleSort('creationDate')}
              >
                Création {sortBy === 'creationDate' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </li>
            <li>
              <button
                className={`filter-chip ${sortBy === 'title' ? 'filter-chip-active' : ''}`}
                onClick={() => handleSort('title')}
              >
                Nom {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </li>
          </menu>
        </section>

        <section className="filter-group">
          <h3>Filtrer par état</h3>
          <menu className="filter-options">
            <li>
              <button
                className={`filter-chip ${activeOnly ? 'filter-chip-active' : ''}`}
                onClick={() => setActiveOnly(!activeOnly)}
              >
                En cours
              </button>
            </li>
            {Object.values(ETATS).map(status => (
              <li key={status}>
                <button
                  className={`filter-chip ${statusFilters.includes(status) ? 'filter-chip-active' : ''}`}
                  onClick={() => toggleStatusFilter(status)}
                >
                  {status}
                </button>
              </li>
            ))}
          </menu>
        </section>

        {folders.length > 0 && (
          <section className="filter-group">
            <h3>Filtrer par dossier</h3>
            <menu className="filter-options">
              {folders.map(folder => (
                <li key={folder.id}>
                  <button
                    className={`filter-chip ${folderFilters.includes(folder.id) ? 'filter-chip-active' : ''}`}
                    onClick={() => toggleFolderFilter(folder.id)}
                  >
                    {folder.title}
                  </button>
                </li>
              ))}
            </menu>
          </section>
        )}
      </nav>

      <menu className="tasks-list">
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map((task) => (
            <TasksItem
              key={task.id}
              task={task}
              onFilterByFolder={(folderId) => toggleFolderFilter(folderId)}
            />
          ))
        ) : (
          <p>Aucune tâche trouvée</p>
        )}
      </menu>
    </section>
  );
}

export default Tasks;