import React, { createContext, useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import backupData from '../config/data.json';
import { ETAT_TERMINE, ETATS } from '../config/constants';

export const TodoContext = createContext();

const STORAGE_KEY = '@todoMobile_data';

export function TodoContextProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [relations, setRelations] = useState([]);
  const hasLoaded = useRef(false);

  // Charge les données depuis AsyncStorage au démarrage
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setTasks(data.tasks || []);
          setFolders(data.folders || []);
          setRelations(data.relations || []);
        } else {
          applyBackup();
        }
      } catch {
        applyBackup();
      } finally {
        hasLoaded.current = true;
      }
    };
    load();
  }, []);

  // Sauvegarde automatique à chaque changement
  useEffect(() => {
    if (!hasLoaded.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, folders, relations })).catch(
      () => {}
    );
  }, [tasks, folders, relations]);

  const applyBackup = () => {
    const mappedTasks = (backupData.taches || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      creationDate: t.date_creation || '',
      dueDate: t.date_echeance || '',
      status: t.etat || ETATS.NOUVEAU,
      members: t.equipiers || [],
    }));

    const mappedFolders = (backupData.dossiers || []).map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      color: d.color,
      icon: d.icon,
      type: d.type,
    }));

    const mappedRelations = (backupData.relations || []).map((r) => ({
      taskId: r.tache,
      folderId: r.dossier,
    }));

    setTasks(mappedTasks);
    setFolders(mappedFolders);
    setRelations(mappedRelations);
  };

  const loadBackup = () => {
    applyBackup();
  };

  const resetData = () => {
    const doReset = () => {
      setTasks([]);
      setFolders([]);
      setRelations([]);
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr(e) ? Cette action supprimera toutes les tâches.')) doReset();
    } else {
      Alert.alert(
        'Réinitialiser',
        'Êtes-vous sûr(e) ? Cette action supprimera toutes les tâches.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: doReset },
        ]
      );
    }
  };

  const addTask = (task, folderId = null) => {
    const maxId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) : 100;
    const newTask = {
      id: maxId + 1,
      title: task.title,
      description: task.description || '',
      creationDate: new Date().toISOString().split('T')[0],
      dueDate: task.dueDate || '',
      status: task.status || ETATS.NOUVEAU,
      members: task.members || [],
    };
    setTasks((prev) => [...prev, newTask]);
    if (folderId) {
      setRelations((prev) => [...prev, { taskId: newTask.id, folderId: parseInt(folderId) }]);
    }
    return newTask;
  };

  const updateTask = (id, updatedTask, folderId = undefined) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)));
    if (folderId !== undefined) {
      const otherRelations = relations.filter((r) => r.taskId !== id);
      if (folderId) {
        setRelations([...otherRelations, { taskId: id, folderId: parseInt(folderId) }]);
      } else {
        setRelations(otherRelations);
      }
    }
  };

  const deleteTask = (id) => {
    const doDelete = () => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setRelations((prev) => prev.filter((r) => r.taskId !== id));
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
      description: folder.description || '',
    };
    setFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = (id, updatedFolder) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, ...updatedFolder } : f)));
  };

  const deleteFolder = (id) => {
    const doDelete = () => {
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setRelations((prev) => prev.filter((r) => r.folderId !== id));
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Supprimer ce dossier ? Les tâches associées resteront mais ne seront plus classées.')) doDelete();
    } else {
      Alert.alert(
        'Supprimer le dossier',
        'Supprimer ce dossier ? Les tâches associées resteront mais ne seront plus classées.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const addRelation = (taskId, folderId) => {
    const exists = relations.some((r) => r.taskId === taskId && r.folderId === folderId);
    if (!exists) {
      setRelations((prev) => [...prev, { taskId, folderId: parseInt(folderId) }]);
    }
  };

  const getActiveTasks = () => tasks.filter((task) => !ETAT_TERMINE.includes(task.status));

  const getActiveSortedTasks = () => {
    return getActiveTasks().sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(b.dueDate) - new Date(a.dueDate);
    });
  };

  const value = {
    tasks,
    folders,
    relations,
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
    addRelation,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}
