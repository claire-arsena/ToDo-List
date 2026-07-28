import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodoContext } from '../../ctx/TodoContext';
import TasksItem from './TasksItem';
import GlassCard from '../../components/GlassCard';
import { COLORS } from '../../theme';

export default function Tasks() {
  const { tasks, folders, deleteFolder } = useContext(TodoContext);
  const [filterTab, setFilterTab] = useState('active'); // 'all', 'active', 'completed'
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null = all folders

  const handleDeleteFolder = (folderId, folderTitle) => {
    const doDelete = () => {
      deleteFolder(folderId);
      if (selectedFolderId === folderId) setSelectedFolderId(null);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer le dossier "${folderTitle}" ? Les tâches associées n'auront plus de dossier.`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Supprimer le dossier',
        `Supprimer le dossier "${folderTitle}" ? Les tâches associées n'auront plus de dossier.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  const filtered = useMemo(() => {
    let r = [...tasks];
    if (filterTab === 'active') {
      r = r.filter((t) => t.status !== 'Réussi' && t.status !== 'Abandonné');
    } else if (filterTab === 'completed') {
      r = r.filter((t) => t.status === 'Réussi' || t.status === 'Abandonné');
    }

    if (selectedFolderId !== null) {
      r = r.filter((t) => t.folderId === selectedFolderId);
    }

    // Sort by earliest date
    r.sort((a, b) => {
      const dateA = a.startDate || a.dueDate || '9999-99-99';
      const dateB = b.startDate || b.dueDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    });

    return r;
  }, [tasks, filterTab, selectedFolderId]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Filters: Tout / En cours / Terminés */}
      <GlassCard style={styles.filterCard}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, filterTab === 'active' && styles.tabBtnActive]}
            onPress={() => setFilterTab('active')}
          >
            <Text style={[styles.tabText, filterTab === 'active' && styles.tabTextActive]}>
              En cours ({tasks.filter((t) => t.status !== 'Réussi' && t.status !== 'Abandonné').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, filterTab === 'all' && styles.tabBtnActive]}
            onPress={() => setFilterTab('all')}
          >
            <Text style={[styles.tabText, filterTab === 'all' && styles.tabTextActive]}>
              Toutes ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, filterTab === 'completed' && styles.tabBtnActive]}
            onPress={() => setFilterTab('completed')}
          >
            <Text style={[styles.tabText, filterTab === 'completed' && styles.tabTextActive]}>
              Terminées ({tasks.filter((t) => t.status === 'Réussi' || t.status === 'Abandonné').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtre par Dossier */}
        {folders.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            <View style={styles.folderFilterRow}>
              <TouchableOpacity
                style={[
                  styles.folderFilterChip,
                  selectedFolderId === null && styles.folderFilterChipActive,
                ]}
                onPress={() => setSelectedFolderId(null)}
              >
                <Text
                  style={[
                    styles.folderFilterText,
                    selectedFolderId === null && styles.folderFilterTextActive,
                  ]}
                >
                  Tous dossiers
                </Text>
              </TouchableOpacity>

              {folders.map((f) => {
                const active = selectedFolderId === f.id;
                return (
                  <View
                    key={f.id}
                    style={[
                      styles.folderFilterChip,
                      { borderColor: f.color },
                      active && { backgroundColor: f.color },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.folderFilterSelectArea}
                      onPress={() => setSelectedFolderId(active ? null : f.id)}
                    >
                      <View style={[styles.dot, { backgroundColor: active ? '#fff' : f.color }]} />
                      <Text style={[styles.folderFilterText, active && { color: '#fff', fontWeight: '800' }]}>
                        {f.title}
                      </Text>
                    </TouchableOpacity>

                    {/* Trash icon to delete folder */}
                    <TouchableOpacity
                      style={styles.deleteFolderBtn}
                      onPress={() => handleDeleteFolder(f.id, f.title)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={12}
                        color={active ? '#fff' : COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </GlassCard>

      {/* Task List */}
      <View style={styles.list}>
        {filtered.length > 0 ? (
          filtered.map((task) => <TasksItem key={task.id} task={task} />)
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>
              {filterTab === 'completed' ? 'Aucune tâche terminée' : 'Aucune tâche dans ce filtre'}
            </Text>
            <Text style={styles.emptySub}>
              {filterTab === 'active' ? 'Appuyez sur + pour ajouter votre première tâche !' : ''}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  filterCard: { padding: 8, marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 6 },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: COLORS.pinkDark,
  },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  tabTextActive: { color: '#fff' },

  folderFilterRow: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  folderFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  folderFilterSelectArea: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  folderFilterChipActive: { backgroundColor: COLORS.pinkDark, borderColor: COLORS.pinkDark },
  folderFilterText: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  folderFilterTextActive: { color: '#fff' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  deleteFolderBtn: { marginLeft: 6, padding: 2 },

  list: { gap: 4 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
});
