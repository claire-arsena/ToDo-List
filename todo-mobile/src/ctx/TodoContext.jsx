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
        let rawFolders = await AsyncStorage.getItem(FOLDERS_KEY);

        if (isMounted) {
          if (rawTasks) {
            const parsed = JSON.parse(rawTasks);
            const taskArray = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
            setTasks(taskArray);
          } else {
            setTasks([]);
          }

          let initialFolders = [];
          if (rawFolders) {
            const parsed = JSON.parse(rawFolders);
            initialFolders = Array.isArray(parsed) ? parsed : (parsed.folders || []);
          }
          
          if (initialFolders.length === 0) {
            if (activeProfileId === 'univ') {
              initialFolders = [
                { id: 'etudes', title: 'Études', color: '#3b82f6' },
              ];
            } else {
              initialFolders = [
                { id: 'etudes', title: 'Études', color: '#3b82f6' },
                { id: 'perso', title: 'Perso', color: '#10b981' },
                { id: 'sport', title: 'Sport', color: '#f59e0b' },
                { id: 'courses', title: 'Courses', color: '#8b5cf6' },
                { id: 'vacances', title: 'Vacances', color: '#ec4899' },
              ];
            }
          }
          setFolders(initialFolders);
        }
      } catch (e) {
        console.error('Erreur chargement AsyncStorage', e);
        if (isMounted) {
          setTasks([]);
          setFolders(activeProfileId === 'univ' ? [
            { id: 'etudes', title: 'Études', color: '#3b82f6' }
          ] : [
            { id: 'etudes', title: 'Études', color: '#3b82f6' },
            { id: 'perso', title: 'Perso', color: '#10b981' },
            { id: 'sport', title: 'Sport', color: '#f59e0b' },
            { id: 'courses', title: 'Courses', color: '#8b5cf6' },
            { id: 'vacances', title: 'Vacances', color: '#ec4899' },
          ]);
        }
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [activeProfileId]);

  // Sauvegarder automatiquement dans le stockage du profil actif
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded, STORAGE_KEY]);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
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
      subtasks: Array.isArray(taskData.subtasks) ? taskData.subtasks : [],
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

  const toggleSubtaskDone = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          return {
            ...t,
            subtasks: t.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, isDone: !st.isDone } : st
            ),
          };
        }
        return t;
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
        toggleSubtaskDone,
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
