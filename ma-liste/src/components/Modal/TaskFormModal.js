import React, { useContext, useState, useEffect } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { ETATS } from '../../config/constants';
import './TaskFormModal.css';

function TaskFormModal() {
  const { addTask, updateTask, folders, relations } = useContext(TodoContext);
  const { isModalOpen, modalType, modalData, closeModal } = useContext(ModalContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: ETATS.NOUVEAU,
    membersInput: '',
    folderId: '',
  });

  useEffect(() => {
    if (modalData && modalType === 'task') {
      const relation = relations.find(r => r.taskId === modalData.id);
      setFormData({
        title: modalData.title || '',
        description: modalData.description || '',
        dueDate: modalData.dueDate || '',
        status: modalData.status || ETATS.NOUVEAU,
        membersInput: modalData.members ? modalData.members.map(m => m.name).join(', ') : '',
        folderId: relation ? relation.folderId.toString() : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        status: ETATS.NOUVEAU,
        membersInput: '',
        folderId: '',
      });
    }
  }, [modalData, modalType, relations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      const members = formData.membersInput
        .split(',')
        .map(name => ({ name: name.trim() }))
        .filter(obj => obj.name !== '');
      
      const taskPayload = {
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
        status: formData.status,
        members
      };

      if (modalData) {
        updateTask(modalData.id, taskPayload, formData.folderId);
      } else {
        addTask(taskPayload, formData.folderId);
      }

      setFormData({
        title: '',
        description: '',
        dueDate: '',
        status: ETATS.NOUVEAU,
        membersInput: '',
        folderId: '',
      });
      closeModal();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (!isModalOpen || modalType !== 'task') return null;

  return (
    <dialog className="modal-backdrop" onClick={handleBackdropClick}>
      <section className="modal-content">
        <header className="modal-header">
          <h2>Créer une nouvelle tâche</h2>
          <button className="modal-close" onClick={closeModal}>×</button>
        </header>
        <form onSubmit={handleSubmit} className="task-form">
          <fieldset className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Entrez le titre de la tâche"
              required
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Entrez une description (optionnel)"
              rows="4"
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="dueDate">Date d'échéance</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="folderId">Dossier</label>
            <select
              id="folderId"
              name="folderId"
              value={formData.folderId}
              onChange={handleChange}
            >
              <option value="">Aucun dossier</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.title}</option>
              ))}
            </select>
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="membersInput">Équipiers (séparés par des virgules)</label>
            <input
              type="text"
              id="membersInput"
              name="membersInput"
              value={formData.membersInput}
              onChange={handleChange}
              placeholder="Ex: Paul, Marie, Bob"
            />
          </fieldset>
          
          <fieldset className="form-group">
            <label htmlFor="status">Statut</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {Object.values(ETATS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </fieldset>

          <footer className="form-buttons">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {modalData ? 'Enregistrer les modifications' : 'Créer la tâche'}
            </button>
          </footer>
        </form>
      </section>
    </dialog>
  );
}

export default TaskFormModal;
