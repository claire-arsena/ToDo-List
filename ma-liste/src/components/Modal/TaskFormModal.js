import React, { useContext, useState, useEffect } from 'react';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { ETATS } from '../../config/constants';
import './TaskFormModal.css';

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function TaskFormModal() {
  const { addTask, updateTask } = useContext(TodoContext);
  const { isModalOpen, modalData, closeModal } = useContext(ModalContext);
  const [hasDate, setHasDate] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    status: ETATS.NOUVEAU,
  });

  useEffect(() => {
    if (isModalOpen) {
      if (modalData) {
        const taskHasDate = !!(modalData.startDate || modalData.endDate);
        setHasDate(taskHasDate);
        setFormData({
          title: modalData.title || '',
          description: modalData.description || '',
          startDate: modalData.startDate || '',
          endDate: modalData.endDate || '',
          startTime: modalData.startTime || '',
          endTime: modalData.endTime || '',
          status: modalData.status || ETATS.NOUVEAU,
        });
      } else {
        setHasDate(false);
        setFormData({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
          status: ETATS.NOUVEAU,
        });
      }
    }
  }, [modalData, isModalOpen]);

  const handleChange = (e) => {
    const { name, checked, value } = e.target;
    if (name === 'hasDate') {
      setHasDate(checked);
      // clear dates when disabling
      if (!checked) {
        setFormData(prev => ({ ...prev, startDate: '', endDate: '' }));
      }
      return;
    }
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-sync endDate when startDate changes and endDate is before startDate
      if (name === 'startDate' && updated.endDate && updated.endDate < value) {
        updated.endDate = value;
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      const taskPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        ...(hasDate && { startDate: formData.startDate, endDate: formData.endDate }),
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status,
      };

      if (modalData) {
        updateTask(modalData.id, taskPayload);
      } else {
        addTask(taskPayload);
      }

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
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <section className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{modalData ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
          <button className="modal-close" onClick={closeModal} aria-label="Fermer">×</button>
        </header>
        <form onSubmit={handleSubmit} className="task-form">
          <fieldset className="form-group">
            <label htmlFor="task-title">Titre *</label>
            <input
              type="text"
              id="task-title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Que devez-vous faire ?"
              required
              autoFocus
            />
          </fieldset>
          <fieldset className="form-group">
            <label htmlFor="task-hasDate">
              <input
                type="checkbox"
                id="task-hasDate"
                name="hasDate"
                checked={hasDate}
                onChange={handleChange}
              />
              Ajouter une date
            </label>
          </fieldset>

          <fieldset className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Détails optionnels..."
              rows="3"
            />
          </fieldset>

          {hasDate && (
            <>
              <div className="form-row">
                <fieldset className="form-group form-group-flex">
                  <label htmlFor="task-startDate">Début</label>
                  <input
                    type="date"
                    id="task-startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group form-group-time">
                  <label htmlFor="task-startTime">Heure</label>
                  <input
                    type="time"
                    id="task-startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                </fieldset>
              </div>

              <div className="form-row">
                <fieldset className="form-group form-group-flex">
                  <label htmlFor="task-endDate">Fin</label>
                  <input
                    type="date"
                    id="task-endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </fieldset>
                <fieldset className="form-group form-group-time">
                  <label htmlFor="task-endTime">Heure</label>
                  <input
                    type="time"
                    id="task-endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                </fieldset>
              </div>
            </>
          )}

          {modalData && (
            <fieldset className="form-group">
              <label htmlFor="task-status">Statut</label>
              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                {Object.values(ETATS).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </fieldset>
          )}

          <footer className="form-buttons">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {modalData ? 'Enregistrer' : 'Créer la tâche'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default TaskFormModal;
