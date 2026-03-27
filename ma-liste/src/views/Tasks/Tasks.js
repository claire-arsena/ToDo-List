import { useContext, useState } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import TasksItem from './TasksItem';
import './Tasks.css';

function Tasks() {
  const { getActiveSortedTasks, folders, relations } = useContext(TodoContext);
  const [folderFilter, setFolderFilter] = useState(null);
  const activeTasks = getActiveSortedTasks();

  const filteredTasks = folderFilter
    ? activeTasks.filter(task =>
        relations.some(r => r.taskId === task.id && r.folderId === folderFilter)
      )
    : activeTasks;

  const activeFolder = folderFilter
    ? folders.find(f => f.id === folderFilter)
    : null;

  return (
    <section className="tasks">
      <header className="tasks-header">
        <h1>Liste de tâches</h1>
        {activeFolder && (
          <button
            className="btn btn-secondary btn-small"
            onClick={() => setFolderFilter(null)}
          >
            ✕ {activeFolder.title}
          </button>
        )}
      </header>
      <menu className="tasks-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TasksItem
              key={task.id}
              task={task}
              onFilterByFolder={(folderId) => setFolderFilter(folderId)}
            />
          ))
        ) : (
          <p>Aucune tâche active</p>
        )}
      </menu>
    </section>
  );
}

export default Tasks;