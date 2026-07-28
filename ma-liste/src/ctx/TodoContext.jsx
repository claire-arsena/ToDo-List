import React, { createContext, useState, useEffect } from 'react';
import { ETAT_TERMINE, ETATS } from '../config/constants';

export const TodoContext = createContext();

const STORAGE_KEY = 'ma_liste_tasks';

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function TodoContextProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const resetData = () => {
    const confirmed = window.confirm('Êtes-vous sûr(e) ? Cette action supprimera toutes les tâches.');
    if (confirmed) {
      setTasks([]);
    }
  };

  const addTask = (task) => {
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 100;
    const newTask = {
      id: maxId + 1,
      title: task.title,
      description: task.description || '',
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      startTime: task.startTime || '',
      endTime: task.endTime || '',
      status: task.status || ETATS.NOUVEAU,
      creationDate: getToday(),
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id, updatedTask) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updatedTask } : t));
  };

  const deleteTask = (id) => {
    if (window.confirm('Supprimer cette tâche ?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const toggleTaskDone = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (ETAT_TERMINE.includes(t.status)) {
        return { ...t, status: ETATS.NOUVEAU };
      }
      return { ...t, status: ETATS.REUSSI };
    }));
  };

  const getActiveTasks = () => {
    return tasks.filter(task => !ETAT_TERMINE.includes(task.status));
  };

  const value = {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskDone,
    getActiveTasks,
    resetData,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}
