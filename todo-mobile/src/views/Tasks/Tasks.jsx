import React, { useContext, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { TodoContext } from '../../ctx/TodoContext';
import { ETATS, ETAT_TERMINE } from '../../config/constants';
import TasksItem from './TasksItem';
import { COLORS, RADIUS, SHADOWS } from '../../theme';

export default function Tasks() {
  const { tasks, folders, relations } = useContext(TodoContext);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [folderFilters, setFolderFilters] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);
  const [activeOnly, setActiveOnly] = useState(true);

  const toggleFolderFilter = (folderId) => {
    setFolderFilters((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const toggleStatusFilter = (status) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (activeOnly) {
      result = result.filter((t) => !ETAT_TERMINE.includes(t.status));
    }

    if (folderFilters.length > 0) {
      result = result.filter((t) =>
        folderFilters.some((fId) => relations.some((r) => r.taskId === t.id && r.folderId === fId))
      );
    }

    if (statusFilters.length > 0) {
      result = result.filter((t) => statusFilters.includes(t.status));
    }

    result.sort((a, b) => {
      if (sortBy === 'title') {
        const valA = a.title.toLowerCase();
        const valB = b.title.toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      const valA = a[sortBy] || '';
      const valB = b[sortBy] || '';
      if (!valA && !valB) return 0;
      if (!valA) return 1;
      if (!valB) return -1;
      return sortOrder === 'asc'
        ? new Date(valA) - new Date(valB)
        : new Date(valB) - new Date(valA);
    });

    return result;
  }, [tasks, sortBy, sortOrder, folderFilters, statusFilters, activeOnly, relations]);

  const Chip = ({ label, active, onPress }) => (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Barre de filtres */}
      <View style={styles.filterBar}>
        {/* Trier par */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupTitle}>Trier par</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              <Chip
                label={`Échéance ${sortBy === 'dueDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`}
                active={sortBy === 'dueDate'}
                onPress={() => handleSort('dueDate')}
              />
              <Chip
                label={`Création ${sortBy === 'creationDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`}
                active={sortBy === 'creationDate'}
                onPress={() => handleSort('creationDate')}
              />
              <Chip
                label={`Nom ${sortBy === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`}
                active={sortBy === 'title'}
                onPress={() => handleSort('title')}
              />
            </View>
          </ScrollView>
        </View>

        {/* Filtrer par état */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupTitle}>Filtrer par état</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              <Chip
                label="En cours"
                active={activeOnly}
                onPress={() => setActiveOnly((v) => !v)}
              />
              {Object.values(ETATS).map((status) => (
                <Chip
                  key={status}
                  label={status}
                  active={statusFilters.includes(status)}
                  onPress={() => toggleStatusFilter(status)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Filtrer par dossier */}
        {folders.length > 0 && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Filtrer par dossier</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {folders.map((folder) => (
                  <Chip
                    key={folder.id}
                    label={folder.title}
                    active={folderFilters.includes(folder.id)}
                    onPress={() => toggleFolderFilter(folder.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Liste des tâches */}
      <View style={styles.taskList}>
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map((task) => (
            <TasksItem
              key={task.id}
              task={task}
              onFilterByFolder={toggleFolderFilter}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune tâche trouvée</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  filterBar: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    padding: 12,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  filterGroup: {
    marginBottom: 10,
  },
  filterGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  chipActive: {
    backgroundColor: COLORS.pinkDark,
    borderColor: '#ff3399',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  chipTextActive: {
    color: '#fff',
  },
  taskList: {
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
