import React, { useContext, useState, useEffect } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import './TaskFormModal.css';

function FolderFormModal() {
  const { addFolder, updateFolder } = useContext(TodoContext);
  const { isModalOpen, modalType, modalData, closeModal } = useContext(ModalContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (modalData && modalType === 'folder') {
      setFormData({
        title: modalData.title || '',
        description: modalData.description || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
      });
    }
  }, [modalData, modalType]);

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
      if (modalData) {
        updateFolder(modalData.id, formData);
      } else {
        addFolder(formData);
      }
      closeModal();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (!isModalOpen || modalType !== 'folder') return null;

  return (
    <dialog className="modal-backdrop" onClick={handleBackdropClick}>
      <section className="modal-content">
        <header className="modal-header">
          <h2>{modalData ? 'Modifier le dossier' : 'Créer un nouveau dossier'}</h2>
          <button className="modal-close" onClick={closeModal}>×</button>
        </header>
        <form onSubmit={handleSubmit} className="task-form">
          <fieldset className="form-group">
            <label htmlFor="title">Nom du dossier *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Personnel, Travail..."
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
              placeholder="Description optionnelle"
              rows="3"
            />
          </fieldset>

          <footer className="form-buttons">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {modalData ? 'Enregistrer' : 'Créer le dossier'}
            </button>
          </footer>
        </form>
      </section>
    </dialog>
  );
}

export default FolderFormModal;
