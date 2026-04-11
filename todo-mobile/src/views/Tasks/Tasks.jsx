import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TodoContext } from '../../ctx/TodoContext';
import { ETATS, ETAT_TERMINE } from '../../config/constants';
import TasksItem from './TasksItem';
import GlassCard from '../../components/GlassCard';
import { COLORS } from '../../theme';

export default function Tasks() {
  const { tasks, folders, relations } = useContext(TodoContext);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [folderFilters, setFolderFilters] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);
  const [activeOnly, setActiveOnly] = useState(true);

  const toggleFolderFilter = (folderId) =>
    setFolderFilters((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );

  const toggleStatusFilter = (status) =>
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const filtered = useMemo(() => {
    let r = [...tasks];
    if (activeOnly) r = r.filter((t) => !ETAT_TERMINE.includes(t.status));
    if (folderFilters.length > 0)
      r = r.filter((t) => folderFilters.some((fId) => relations.some((rel) => rel.taskId === t.id && rel.folderId === fId)));
    if (statusFilters.length > 0)
      r = r.filter((t) => statusFilters.includes(t.status));
    r.sort((a, b) => {
      if (sortBy === 'title') {
        const vA = a.title.toLowerCase(), vB = b.title.toLowerCase();
        return sortOrder === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      const vA = a[sortBy] || '', vB = b[sortBy] || '';
      if (!vA && !vB) return 0; if (!vA) return 1; if (!vB) return -1;
      return sortOrder === 'asc' ? new Date(vA) - new Date(vB) : new Date(vB) - new Date(vA);
    });
    return r;
  }, [tasks, sortBy, sortOrder, folderFilters, statusFilters, activeOnly, relations]);

  const Chip = ({ label, active, onPress }) => (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Barre de filtres */}
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

      {/* Liste */}
      <View>
        {filtered.length > 0 ? (
          filtered.map((task) => <TasksItem key={task.id} task={task} onFilterByFolder={toggleFolderFilter} />)
        ) : (
          <View style={styles.empty}><Text style={styles.emptyText}>Aucune tâche trouvée</Text></View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  filterBar: { padding: 16, marginBottom: 16 },
  filterGroup: { marginBottom: 10 },
  filterGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  chipRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  /* filter-chip du CSS web */
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  chipActive: {
    backgroundColor: COLORS.pinkDark,
    borderColor: COLORS.pinkDark,
    shadowColor: '#ff66b3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  chipText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  chipTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, fontStyle: 'italic' },
});
