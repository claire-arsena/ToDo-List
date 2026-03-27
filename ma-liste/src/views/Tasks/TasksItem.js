import { useContext } from 'react';
import { TodoContext } from '../../ctx/TodoContext';

function TasksItem({ task }) {
  const { dossiers, relations } = useContext(TodoContext);
  const relation = relations.find(r => r.tache === task.id);
  const dossier = relation ? dossiers.find(d => d.id === relation.dossier) : null;

  const displayMembers = task.equipiers && task.equipiers.length > 0 
    ? task.equipiers.slice(0, 2) 
    : [];

  return (
    <article className="task-item">
      <h3>{task.title}</h3>
      {dossier && <span className="task-category">{dossier.title}</span>}
      {task.description && <p>{task.description}</p>}
      <footer className="task-meta">
        <strong className="task-status">{task.etat}</strong>
        {task.date_echeance && <time className="task-date">{task.date_echeance}</time>}
      </footer>
      {displayMembers.length > 0 && (
        <ul className="task-members">
          {displayMembers.map((member, index) => (
            <li key={index}>{member.name}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default TasksItem;
