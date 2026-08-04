import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ETATS, ETAT_TERMINE, getTodayStr } from '../config/constants';
import { ProfileContext } from './ProfileContext';

export const TodoContext = createContext();

export function TodoContextProvider({ children }) {
  const { activeProfileId } = useContext(ProfileContext);
  const [tasks, setTasks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Profile-scoped or global storage keys
  const STORAGE_KEY = activeProfileId ? `@todo_tasks_profile_${activeProfileId}` : '@todo_tasks_v2';
  const FOLDERS_KEY = activeProfileId ? `@todo_folders_profile_${activeProfileId}` : '@todo_folders_v2';

  // Charger et restaurer automatiquement les tâches
  useEffect(() => {
    let isMounted = true;
    setIsLoaded(false);

    (async () => {
      try {
        let rawTasks = await AsyncStorage.getItem(STORAGE_KEY);
        // Restauration automatique : si le profil actif n'a pas encore de tâches, récupérer depuis le stockage global
        if (!rawTasks) rawTasks = await AsyncStorage.getItem('@todo_tasks_v2');
        if (!rawTasks) rawTasks = await AsyncStorage.getItem('@todo_tasks');
        if (!rawTasks) rawTasks = await AsyncStorage.getItem('@todo_data');

        let rawFolders = await AsyncStorage.getItem(FOLDERS_KEY);
        if (!rawFolders) rawFolders = await AsyncStorage.getItem('@todo_folders_v2');
        if (!rawFolders) rawFolders = await AsyncStorage.getItem('@todo_folders');

        if (isMounted) {
          if (rawTasks) {
            const parsed = JSON.parse(rawTasks);
            const taskArray = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
            setTasks(taskArray);
          } else {
            setTasks([]);
          }

          if (rawFolders) {
            const parsed = JSON.parse(rawFolders);
            const folderArray = Array.isArray(parsed) ? parsed : (parsed.folders || []);
            setFolders(folderArray);
          } else {
            setFolders([]);
          }
        }
      } catch (e) {
        console.error('Erreur chargement AsyncStorage', e);
        if (isMounted) {
          setTasks([]);
          setFolders([]);
        }
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [activeProfileId]);

  // Sauvegarder automatiquement dans le stockage du profil actif + miroir de secours
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      AsyncStorage.setItem('@todo_tasks_v2', JSON.stringify(tasks)); // Miroir global de secours
    }
  }, [tasks, isLoaded, STORAGE_KEY]);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
      AsyncStorage.setItem('@todo_folders_v2', JSON.stringify(folders));
    }
  }, [folders, isLoaded, FOLDERS_KEY]);

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
      profileId: activeProfileId || null,
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
