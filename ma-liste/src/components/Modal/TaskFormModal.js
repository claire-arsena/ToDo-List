import React, { useContext, useState } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { ETATS } from '../../config/constants';
import './TaskFormModal.css';

function TaskFormModal() {
  const { addTask, dossiers } = useContext(TodoContext);
  const { isModalOpen, closeModal } = useContext(ModalContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date_echeance: '',
    etat: ETATS.NOUVEAU,
    equipiersInput: '',
    id_dossier: '',
  });

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
      const equipiers = formData.equipiersInput
        .split(',')
        .map(name => ({ name: name.trim() }))
        .filter(obj => obj.name !== '');
      
      addTask({
        title: formData.title,
        description: formData.description,
        date_echeance: formData.date_echeance,
        etat: formData.etat,
        equipiers
      }, formData.id_dossier);

      setFormData({
        title: '',
        description: '',
        date_echeance: '',
        etat: ETATS.NOUVEAU,
        equipiersInput: '',
        id_dossier: '',
      });
      closeModal();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (!isModalOpen) return null;

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
            <label htmlFor="date_echeance">Date d'échéance</label>
            <input
              type="date"
              id="date_echeance"
              name="date_echeance"
              value={formData.date_echeance}
              onChange={handleChange}
            />
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="id_dossier">Dossier</label>
            <select
              id="id_dossier"
              name="id_dossier"
              value={formData.id_dossier}
              onChange={handleChange}
            >
              <option value="">Aucun dossier</option>
              {dossiers.map(dossier => (
                <option key={dossier.id} value={dossier.id}>{dossier.title}</option>
              ))}
            </select>
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="equipiersInput">Équipiers (séparés par des virgules)</label>
            <input
              type="text"
              id="equipiersInput"
              name="equipiersInput"
              value={formData.equipiersInput}
              onChange={handleChange}
              placeholder="Ex: Paul, Marie, Bob"
            />
          </fieldset>
          
          <fieldset className="form-group">
            <label htmlFor="etat">Statut</label>
            <select
              id="etat"
              name="etat"
              value={formData.etat}
              onChange={handleChange}
            >
              {Object.values(ETATS).map(etat => (
                <option key={etat} value={etat}>{etat}</option>
              ))}
            </select>
          </fieldset>

          <footer className="form-buttons">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Créer la tâche
            </button>
          </footer>
        </form>
      </section>
    </dialog>
  );
}

export default TaskFormModal;
