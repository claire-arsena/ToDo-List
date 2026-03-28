import { useContext, useState } from 'react';
import { TodoContext } from '../../ctx/TodoContext';

function TasksItem({ task, onFilterByFolder }) {
  const { folders, relations, updateTask, deleteTask, addRelation } = useContext(TodoContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
  });

  const taskRelations = relations.filter(r => r.taskId === task.id);
  const allFolders = taskRelations
    .map(r => folders.find(f => f.id === r.folderId))
    .filter(Boolean);
  const displayFolders = isExpanded ? allFolders : allFolders.slice(0, 2);

  const availableFolders = folders.filter(
    f => !taskRelations.some(r => r.folderId === f.id)
  );

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    updateTask(task.id, editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
    });
    setIsEditing(false);
  };

  const handleAddFolder = (e) => {
    const folderId = parseInt(e.target.value);
    if (!folderId) return;
    addRelation(task.id, folderId);
    e.target.value = '';
  };

  return (
    <article className="task-item">
      <header className="task-item-header">
        {isEditing ? (
          <input
            type="text"
            name="title"
            className="edit-input edit-title"
            value={editData.title}
            onChange={handleEditChange}
          />
        ) : (
          <h3>{task.title}</h3>
        )}
        <button
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Réduire' : 'Développer'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </header>

      {displayFolders.length > 0 && (
        <nav className="task-categories">
          {displayFolders.map(f => (
            <button
              key={f.id}
              className="task-category"
              onClick={() => onFilterByFolder && onFilterByFolder(f.id)}
            >
              {f.title}
            </button>
          ))}
        </nav>
      )}

      {!isEditing && task.dueDate && (
        <time className="task-date">{task.dueDate}</time>
      )}

      {isEditing && (
        <fieldset className="edit-fieldset">
          <label htmlFor={`dueDate-${task.id}`}>Date d'échéance</label>
          <input
            type="date"
            id={`dueDate-${task.id}`}
            name="dueDate"
            className="edit-input"
            value={editData.dueDate}
            onChange={handleEditChange}
          />
        </fieldset>
      )}

      {isExpanded && (
        <section className="task-expanded">
          {isEditing ? (
            <fieldset className="edit-fieldset">
              <label htmlFor={`desc-${task.id}`}>Description</label>
              <textarea
                id={`desc-${task.id}`}
                name="description"
                className="edit-input"
                value={editData.description}
                onChange={handleEditChange}
                rows="3"
              ></textarea>
            </fieldset>
          ) : (
            task.description && <p>{task.description}</p>
          )}

          {availableFolders.length > 0 && (
            <fieldset className="edit-fieldset">
              <label htmlFor={`addFolder-${task.id}`}>Ajouter un dossier</label>
              <select
                id={`addFolder-${task.id}`}
                className="edit-input"
                onChange={handleAddFolder}
                defaultValue=""
              >
                <option value="">Choisir un dossier...</option>
                {availableFolders.map(f => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </fieldset>
          )}

          <footer className="task-actions">
            {isEditing ? (
              <>
                <button className="btn btn-primary btn-small" onClick={handleSaveEdit}>
                  Enregistrer
                </button>
                <button className="btn btn-secondary btn-small" onClick={handleCancelEdit}>
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setIsEditing(true)}
                >
                  Modifier
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => deleteTask(task.id)}
                >
                  Supprimer
                </button>
              </>
            )}
          </footer>
        </section>
      )}
    </article>
  );
}

export default TasksItem;
