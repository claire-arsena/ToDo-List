import { useContext } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';

function TasksItem({ task }) {
  const { folders, relations, deleteTask } = useContext(TodoContext);
  const { openModal } = useContext(ModalContext);
  const relation = relations.find(r => r.taskId === task.id);
  const folder = relation ? folders.find(d => d.id === relation.folderId) : null;

  const displayMembers = task.members && task.members.length > 0 
    ? task.members.slice(0, 2) 
    : [];

  return (
    <article className="task-item">
      <h3>{task.title}</h3>
      {folder && <small className="task-category">{folder.title}</small>}
      {task.description && <p>{task.description}</p>}
      <footer className="task-meta">
        <strong className="task-status">{task.status}</strong>
        {task.dueDate && <time className="task-date">{task.dueDate}</time>}
      </footer>
      {displayMembers.length > 0 && (
        <ul className="task-members">
          {displayMembers.map((member, index) => (
            <li key={index}>{member.name}</li>
          ))}
        </ul>
      )}
      <section className="task-actions">
        <button 
          className="btn btn-secondary btn-small" 
          onClick={() => openModal('task', task)}
        >
          Modifier
        </button>
        <button 
          className="btn btn-danger btn-small" 
          onClick={() => deleteTask(task.id)}
        >
          Supprimer
        </button>
      </section>
    </article>
  );
}

export default TasksItem;
