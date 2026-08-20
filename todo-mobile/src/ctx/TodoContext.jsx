import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ETATS, ETAT_TERMINE, getTodayStr } from '../config/constants';
import { ProfileContext } from './ProfileContext';

export const TodoContext = createContext();

export function TodoContextProvider({ children }) {
  const { activeProfileId } = useContext(ProfileContext);
  const [tasks, setTasks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // Ref (mise à jour de façon synchrone, contrairement à isLoaded) pour bloquer
  // toute sauvegarde tant que les données du profil actif ne sont pas chargées.
  const readyRef = useRef(false);

  // Profile-scoped or global storage keys
  const SHARED_ETUDES_KEY = '@todo_tasks_shared_etudes';
  const STORAGE_KEY = activeProfileId ? `@todo_tasks_profile_${activeProfileId}` : '@todo_tasks_v2';
  const FOLDERS_KEY = activeProfileId ? `@todo_folders_profile_${activeProfileId}` : '@todo_folders_v2';

  const isEtudesTask = (t, currentFolders) => {
    if (!t) return false;
    if (t.folderId === 'etudes') return true;
    const f = (currentFolders || []).find((fold) => fold.id === t.folderId);
    if (f && f.title) {
      const lower = f.title.toLowerCase();
      if (lower.includes('étud') || lower.includes('etud')) return true;
    }
    return false;
  };

  // Charger et restaurer automatiquement les tâches
  useEffect(() => {
    let isMounted = true;
    readyRef.current = false;
    setIsLoaded(false);

    (async () => {
      try {
        let rawProfileTasks = await AsyncStorage.getItem(STORAGE_KEY);
        let rawSharedTasks = await AsyncStorage.getItem(SHARED_ETUDES_KEY);
        let rawFolders = await AsyncStorage.getItem(FOLDERS_KEY);

        if (isMounted) {
          let profileTasks = [];
          if (rawProfileTasks) {
            const parsed = JSON.parse(rawProfileTasks);
            profileTasks = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
          }

          let sharedTasks = [];
          if (rawSharedTasks) {
            const parsed = JSON.parse(rawSharedTasks);
            sharedTasks = Array.isArray(parsed) ? parsed : (parsed.tasks || []);
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

          // Filtrer les tâches spécifiques au profil (non-études)
          const nonEtudesProfileTasks = profileTasks.filter((t) => !isEtudesTask(t, initialFolders));
          const etudesFromProfile = profileTasks.filter((t) => isEtudesTask(t, initialFolders));

          // Fusionner les tâches d'études s'il y en avait enregistrées localement
          const combinedShared = [...sharedTasks];
          etudesFromProfile.forEach((t) => {
            if (!combinedShared.some((st) => st.id === t.id)) {
              combinedShared.push(t);
            }
          });

          setTasks([...nonEtudesProfileTasks, ...combinedShared]);
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
        if (isMounted) {
          readyRef.current = true;
          setIsLoaded(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [activeProfileId]);

  // Sauvegarder séparément les tâches "Études" (partagées) et les tâches spécifiques au profil
  useEffect(() => {
    // readyRef est mis à jour de façon synchrone (contrairement à isLoaded, dont la
    // mise à jour n'est visible qu'au rendu suivant) : cela évite d'écraser les
    // données du profil qui vient de devenir actif avec celles de l'ancien profil,
    // pendant le court instant où activeProfileId a changé mais où le chargement
    // du nouveau profil n'est pas encore terminé.
    if (isLoaded && readyRef.current) {
      const etudesTasks = tasks.filter((t) => isEtudesTask(t, folders));
      const profileSpecificTasks = tasks.filter((t) => !isEtudesTask(t, folders));

      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileSpecificTasks));
      AsyncStorage.setItem(SHARED_ETUDES_KEY, JSON.stringify(etudesTasks));
    }
  }, [tasks, isLoaded, STORAGE_KEY, folders]);

  useEffect(() => {
    if (isLoaded && readyRef.current) {
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
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, isDone: !st.isDone } : st
          );
          const hasSubtasks = updatedSubtasks.length > 0;
          const allDone = hasSubtasks && updatedSubtasks.every((st) => st.isDone);
          let newStatus = t.status;
          if (allDone) {
            newStatus = ETATS.REUSSI;
          } else if (!allDone && t.status === ETATS.REUSSI && hasSubtasks) {
            newStatus = ETATS.NOUVEAU;
          }
          return {
            ...t,
            subtasks: updatedSubtasks,
            status: newStatus,
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
