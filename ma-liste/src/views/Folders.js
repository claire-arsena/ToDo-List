import React, { useContext } from 'react';
import { TodoContext } from '../ctx/TodoContext';
import { ModalContext } from '../ctx/ModalContext';
import './Tasks/Tasks.css';

function Folders() {
  const { folders, deleteFolder } = useContext(TodoContext);
  const { openModal } = useContext(ModalContext);

  return (
    <section className="tasks folders">
      <header className="tasks-header">
        <h1>Mes Dossiers</h1>
        <button className="btn btn-primary" onClick={() => openModal('folder')}>
          + Nouveau dossier
        </button>
      </header>
      
      <section className="tasks-list">
        {folders.map(folder => (
          <article key={folder.id} className="task-item">
            <h3>{folder.title}</h3>
            {folder.description && <p>{folder.description}</p>}
            
            <footer className="task-actions">
              <button 
                className="btn btn-secondary btn-small" 
                onClick={() => openModal('folder', folder)}
              >
                Modifier
              </button>
              <button 
                className="btn btn-danger btn-small" 
                onClick={() => deleteFolder(folder.id)}
              >
                Supprimer
              </button>
            </footer>
          </article>
        ))}
        {folders.length === 0 && <p>Aucun dossier. Créez-en un pour organiser vos tâches !</p>}
      </section>
    </section>
  );
}

export default Folders;