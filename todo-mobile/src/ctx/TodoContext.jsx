import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ETATS, ETAT_TERMINE, getTodayStr } from '../config/constants';

export const TodoContext = createContext();

const STORAGE_KEY = '@todo_tasks_v2';
const FOLDERS_KEY = '@todo_folders_v2';

const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Finaliser la maquette mobile iOS',
    description: 'Ajuster les couleurs Rose Foncé et le mode glassmorphism',
    startDate: getTodayStr(),
    endDate: getTodayStr(),
    startTime: '09:00',
    endTime: '11:00',
    dueDate: getTodayStr(),
    status: ETATS.EN_COURS,
    folderId: '1',
    isRegular: true,
  },
  {
    id: '2',
    title: 'Réunion d’équipe',
    description: 'Point hebdomadaire sur le projet',
    startDate: getTodayStr(),
    endDate: getTodayStr(),
    startTime: '14:00',
    endTime: '15:00',
    dueDate: getTodayStr(),
    status: ETATS.NOUVEAU,
    folderId: '1',
    isRegular: true,
  },
];

const INITIAL_FOLDERS = [
  { id: '1', title: 'Travail', color: '#d81b60' },
  { id: '2', title: 'Perso', color: '#af52de' },
];

export function TodoContextProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger le stockage
  useEffect(() => {
    (async () => {
      try {
        const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        const storedFolders = await AsyncStorage.getItem(FOLDERS_KEY);

        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          setTasks(INITIAL_TASKS);
        }

        if (storedFolders) {
          setFolders(JSON.parse(storedFolders));
        } else {
          setFolders(INITIAL_FOLDERS);
        }
      } catch (e) {
        console.error('Erreur chargement AsyncStorage', e);
        setTasks(INITIAL_TASKS);
        setFolders(INITIAL_FOLDERS);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Sauvegarder dans AsyncStorage
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    }
  }, [folders, isLoaded]);

  const addTask = (taskData) => {
    const today = getTodayStr();
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title || 'Nouvelle tâche',
      description: taskData.description || '',
      startDate: taskData.startDate || today,
      endDate: taskData.endDate || taskData.startDate || today,
      startTime: taskData.startTime || '',
      endTime: taskData.endTime || '',
      dueDate: taskData.endDate || taskData.startDate || today,
      status: ETATS.NOUVEAU,
      folderId: taskData.folderId || null,
      isRegular: taskData.isRegular !== undefined ? taskData.isRegular : true,
      creationDate: today,
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id, fields) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...fields } : t))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskDone = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (ETAT_TERMINE.includes(t.status)) {
          return { ...t, status: ETATS.NOUVEAU };
        }
        return { ...t, status: ETATS.REUSSI };
      })
    );
  };

  const rescheduleToToday = (id) => {
    const today = getTodayStr();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              startDate: today,
              endDate: today,
              dueDate: today,
            }
          : t
      )
    );
  };

  const rescheduleByDays = (id, daysToAdd = 1) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const todayStr = getTodayStr();
        const baseDateStr = t.endDate && t.endDate >= todayStr ? t.endDate : todayStr;
        const [y, m, d] = baseDateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        dateObj.setDate(dateObj.getDate() + daysToAdd);

        const newY = dateObj.getFullYear();
        const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
        const newD = String(dateObj.getDate()).padStart(2, '0');
        const newDate = `${newY}-${newM}-${newD}`;

        return {
          ...t,
          startDate: newDate,
          endDate: newDate,
          dueDate: newDate,
        };
      })
    );
  };

  const cancelTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: ETATS.ABANDONNE } : t))
    );
  };

  const addFolder = (folderData) => {
    const newFolder = {
      id: Date.now().toString(),
      title: folderData.title || 'Nouveau dossier',
      color: folderData.color || '#d81b60',
    };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  const deleteFolder = (folderId) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    setTasks((prev) =>
      prev.map((t) => (t.folderId === folderId ? { ...t, folderId: null } : t))
    );
  };

  const getActiveTasks = () =>
    tasks.filter((t) => !ETAT_TERMINE.includes(t.status));

  const getCompletedTasks = () =>
    tasks.filter((t) => ETAT_TERMINE.includes(t.status));

  return (
    <TodoContext.Provider
      value={{
        tasks,
        folders,
        isLoaded,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskDone,
        rescheduleToToday,
        rescheduleByDays,
        cancelTask,
        addFolder,
        deleteFolder,
        getActiveTasks,
        getCompletedTasks,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}
