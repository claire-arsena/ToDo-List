import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TodoContext } from '../../ctx/TodoContext';
import { ETATS, ETAT_TERMINE } from '../../config/constants';
import TasksItem from './TasksItem';
import GlassCard from '../../components/GlassCard';
import { COLORS, RADIUS } from '../../theme';

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
    if (activeOnly) result = result.filter((t) => !ETAT_TERMINE.includes(t.status));
    if (folderFilters.length > 0)
      result = result.filter((t) =>
        folderFilters.some((fId) => relations.some((r) => r.taskId === t.id && r.folderId === fId))
      );
    if (statusFilters.length > 0)
      result = result.filter((t) => statusFilters.includes(t.status));

    result.sort((a, b) => {
      if (sortBy === 'title') {
        const vA = a.title.toLowerCase(), vB = b.title.toLowerCase();
        return sortOrder === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      const vA = a[sortBy] || '', vB = b[sortBy] || '';
      if (!vA && !vB) return 0;
      if (!vA) return 1;
      if (!vB) return -1;
      return sortOrder === 'asc' ? new Date(vA) - new Date(vB) : new Date(vB) - new Date(vA);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Barre de filtres — glass */}
      <GlassCard style={styles.filterBar}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupTitle}>Trier par</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              <Chip label={`Échéance${sortBy === 'dueDate' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}`} active={sortBy === 'dueDate'} onPress={() => handleSort('dueDate')} />
              <Chip label={`Création${sortBy === 'creationDate' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}`} active={sortBy === 'creationDate'} onPress={() => handleSort('creationDate')} />
              <Chip label={`Nom${sortBy === 'title' ? (sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}`} active={sortBy === 'title'} onPress={() => handleSort('title')} />
            </View>
          </ScrollView>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupTitle}>Filtrer par état</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              <Chip label="En cours" active={activeOnly} onPress={() => setActiveOnly((v) => !v)} />
              {Object.values(ETATS).map((status) => (
                <Chip key={status} label={status} active={statusFilters.includes(status)} onPress={() => toggleStatusFilter(status)} />
              ))}
            </View>
          </ScrollView>
        </View>

        {folders.length > 0 && (
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Filtrer par dossier</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {folders.map((folder) => (
                  <Chip key={folder.id} label={folder.title} active={folderFilters.includes(folder.id)} onPress={() => toggleFolderFilter(folder.id)} />
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </GlassCard>

      {/* Liste des tâches */}
      <View style={styles.taskList}>
        {filteredAndSortedTasks.length > 0 ? (
          filteredAndSortedTasks.map((task) => (
            <TasksItem key={task.id} task={task} onFilterByFolder={toggleFolderFilter} />
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
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  filterBar: { padding: 12, marginBottom: 16 },
  filterGroup: { marginBottom: 10 },
  filterGroupTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  chipRow: { flexDirection: 'row', gap: 6, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)',
  },
  chipActive: {
    backgroundColor: COLORS.pinkDark, borderColor: '#ff3399',
    shadowColor: '#ff66b3', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  chipTextActive: { color: '#fff' },
  taskList: {},
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, fontStyle: 'italic' },
});
