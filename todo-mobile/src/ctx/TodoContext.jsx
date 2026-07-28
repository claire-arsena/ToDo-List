import React, { createContext, useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ETAT_TERMINE, ETATS } from '../config/constants';

export const TodoContext = createContext();

const STORAGE_KEY = '@todoMobile_data_v2';

const DEFAULT_FOLDERS = [
  { id: 1, title: 'Travail', color: '#3498db' },
  { id: 2, title: 'Personnel', color: '#e67e22' },
  { id: 3, title: 'Études', color: '#9b59b6' },
  { id: 4, title: 'Urgent', color: '#e74c3c' },
];

export function TodoContextProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setTasks(data.tasks || []);
          setFolders(data.folders && data.folders.length > 0 ? data.folders : DEFAULT_FOLDERS);
        } else {
          setTasks([]);
          setFolders(DEFAULT_FOLDERS);
        }
      } catch {
        setTasks([]);
        setFolders(DEFAULT_FOLDERS);
      } finally {
        hasLoaded.current = true;
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, folders })).catch(() => {});
  }, [tasks, folders]);

  const resetData = () => {
    const doReset = () => {
      setTasks([]);
      setFolders(DEFAULT_FOLDERS);
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr(e) ? Cette action supprimera toutes les tâches.')) doReset();
    } else {
      Alert.alert('Réinitialiser', 'Êtes-vous sûr(e) ? Cette action supprimera toutes les tâches.', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const addTask = (task) => {
    const maxId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) : 100;
    const newTask = {
      id: maxId + 1,
      title: task.title,
      description: task.description || '',
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      startTime: task.startTime || '',
      endTime: task.endTime || '',
      creationDate: new Date().toISOString().split('T')[0],
      dueDate: task.endDate || task.startDate || task.dueDate || '',
      status: task.status || ETATS.NOUVEAU,
      folderId: task.folderId ? parseInt(task.folderId) : null,
    };
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (id, updatedTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updatedTask,
              folderId: updatedTask.folderId !== undefined ? (updatedTask.folderId ? parseInt(updatedTask.folderId) : null) : t.folderId,
            }
          : t
      )
    );
  };

  const deleteTask = (id) => {
    const doDelete = () => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Supprimer cette tâche ?')) doDelete();
    } else {
      Alert.alert('Supprimer', 'Supprimer cette tâche ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  const addFolder = (folder) => {
    const maxId = folders.length > 0 ? Math.max(...folders.map((d) => d.id)) : 0;
    const newFolder = {
      id: maxId + 1,
      title: folder.title,
      color: folder.color || '#ff66b3',
    };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  const deleteFolder = (id) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setTasks((prev) => prev.map((t) => (t.folderId === id ? { ...t, folderId: null } : t)));
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
    const today = new Date().toISOString().split('T')[0];
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
        const todayStr = new Date().toISOString().split('T')[0];
        const baseDateStr = t.endDate && t.endDate >= todayStr ? t.endDate : todayStr;
        const dateObj = new Date(baseDateStr + 'T12:00:00');
        dateObj.setDate(dateObj.getDate() + daysToAdd);
        const newDate = dateObj.toISOString().split('T')[0];
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

  const getActiveTasks = () => tasks.filter((task) => !ETAT_TERMINE.includes(task.status));

  const value = {
    tasks,
    folders,
    addTask,
    updateTask,
    deleteTask,
    addFolder,
    deleteFolder,
    toggleTaskDone,
    rescheduleToToday,
    rescheduleByDays,
    cancelTask,
    resetData,
    getActiveTasks,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
