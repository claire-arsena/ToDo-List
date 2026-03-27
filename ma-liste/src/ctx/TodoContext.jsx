import React, { createContext, useState, useEffect } from 'react';
import backupData from '../config/data.json';
import { ETAT_TERMINE } from '../config/constants';

export const TodoContext = createContext();

export function TodoContextProvider({ children }) {
  const [taches, setTaches] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [relations, setRelations] = useState([]);

  useEffect(() => {
    loadBackup();
  }, []);

  const loadBackup = () => {
    setTaches(backupData.taches);
    setDossiers(backupData.dossiers);
    setRelations(backupData.relations);
  };

  const resetData = () => {
    const confirmed = window.confirm('Êtes-vous sûr(e) ? Cette action supprimera toutes les tâches.');
    if (confirmed) {
      setTaches([]);
      setDossiers([]);
      setRelations([]);
    }
  };

  const addTask = (tache, id_dossier = null) => {
    const maxId = taches.length > 0 ? Math.max(...taches.map(t => t.id)) : 100;
    const newTache = {
      id: maxId + 1,
      title: tache.title,
      description: tache.description || '',
      date_creation: new Date().toISOString().split('T')[0],
      date_echeance: tache.date_echeance || '',
      etat: tache.etat || 'Nouveau',
      equipiers: tache.equipiers || [],
    };
    
    setTaches([...taches, newTache]);
    
    if (id_dossier) {
      setRelations([...relations, { tache: newTache.id, dossier: parseInt(id_dossier) }]);
    }
    
    return newTache;
  };

  const getActiveTasks = () => {
    return taches.filter(tache => !ETAT_TERMINE.includes(tache.etat));
  };

  const getActiveSortedTasks = () => {
    const activeTasks = getActiveTasks();
    return activeTasks.sort((a, b) => {
      if (!a.date_echeance && !b.date_echeance) return 0;
      if (!a.date_echeance) return 1;
      if (!b.date_echeance) return -1;
      return new Date(b.date_echeance) - new Date(a.date_echeance);
    });
  };

  const value = {
    taches,
    setTaches,
    dossiers,
    setDossiers,
    relations,
    setRelations,
    addTask,
    loadBackup,
    resetData,
    getActiveTasks,
    getActiveSortedTasks,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}
