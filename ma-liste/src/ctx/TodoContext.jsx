import React, { createContext, useState, useEffect } from 'react';
import backupData from '../config/data.json';
import { ETAT_TERMINE, ETATS } from '../config/constants';

export const TodoContext = createContext();

export function TodoContextProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [relations, setRelations] = useState([]);

  useEffect(() => {
    loadBackup();
  }, []);

  const loadBackup = () => {
    const mappedTasks = (backupData.taches || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      creationDate: t.date_creation || '',
      dueDate: t.date_echeance || '',
      status: t.etat || ETATS.NOUVEAU,
      members: t.equipiers || []
    }));

    const mappedFolders = (backupData.dossiers || []).map(d => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      color: d.color,
      icon: d.icon,
      type: d.type
    }));

    const mappedRelations = (backupData.relations || []).map(r => ({
      taskId: r.tache,
      folderId: r.dossier
    }));

    setTasks(mappedTasks);
    setFolders(mappedFolders);
    setRelations(mappedRelations);
  };

  const resetData = () => {
    const confirmed = window.confirm('Êtes-vous sûr(e) ? Cette action supprimera toutes les tâches.');
    if (confirmed) {
      setTasks([]);
      setFolders([]);
      setRelations([]);
    }
  };

  const addTask = (task, folderId = null) => {
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 100;
    const newTask = {
      id: maxId + 1,
      title: task.title,
      description: task.description || '',
      creationDate: new Date().toISOString().split('T')[0],
      dueDate: task.dueDate || '',
      status: task.status || ETATS.NOUVEAU,
      members: task.members || [],
    };
    
    setTasks([...tasks, newTask]);
    
    if (folderId) {
      setRelations([...relations, { taskId: newTask.id, folderId: parseInt(folderId) }]);
    }
    
    return newTask;
  };

  const updateTask = (id, updatedTask, folderId = undefined) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updatedTask } : t));
    if (folderId !== undefined) {
      const otherRelations = relations.filter(r => r.taskId !== id);
      if (folderId) {
        setRelations([...otherRelations, { taskId: id, folderId: parseInt(folderId) }]);
      } else {
        setRelations(otherRelations);
      }
    }
  };

  const deleteTask = (id) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      setTasks(tasks.filter(t => t.id !== id));
      setRelations(relations.filter(r => r.taskId !== id));
    }
  };

  const addFolder = (folder) => {
    const maxId = folders.length > 0 ? Math.max(...folders.map(d => d.id)) : 0;
    const newFolder = {
      id: maxId + 1,
      title: folder.title,
      description: folder.description || '',
    };
    setFolders([...folders, newFolder]);
    return newFolder;
  };

  const updateFolder = (id, updatedFolder) => {
    setFolders(folders.map(f => f.id === id ? { ...f, ...updatedFolder } : f));
  };

  const deleteFolder = (id) => {
    if (window.confirm('Supprimer ce dossier ? Les tâches associées resteront mais ne seront plus classées.')) {
      setFolders(folders.filter(f => f.id !== id));
      setRelations(relations.filter(r => r.folderId !== id));
    }
  };

  const getActiveTasks = () => {
    return tasks.filter(task => !ETAT_TERMINE.includes(task.status));
  };

  const getActiveSortedTasks = () => {
    const activeTasks = getActiveTasks();
    return activeTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(b.dueDate) - new Date(a.dueDate);
    });
  };

  const value = {
    tasks,
    setTasks,
    folders,
    setFolders,
    relations,
    setRelations,
    addTask,
    updateTask,
    deleteTask,
    addFolder,
    updateFolder,
    deleteFolder,
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
