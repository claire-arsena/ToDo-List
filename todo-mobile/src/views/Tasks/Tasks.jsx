import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodoContext } from '../../ctx/TodoContext';
import TasksItem from './TasksItem';
import GlassCard from '../../components/GlassCard';
import { COLORS } from '../../theme';
import { isTaskOverdue } from '../../config/constants';

export default function Tasks() {
  const { tasks, folders, deleteFolder, rescheduleToToday } = useContext(TodoContext);
  const [filterTab, setFilterTab] = useState('active'); // 'all', 'active', 'completed', 'overdue'
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

  const folderTasks = useMemo(() => {
    if (selectedFolderId === null) return tasks;
    return tasks.filter((t) => t.folderId === selectedFolderId);
  }, [tasks, selectedFolderId]);

  const overdueTasks = useMemo(() => {
    return folderTasks.filter((t) => isTaskOverdue(t));
  }, [folderTasks]);

  const handleRescheduleAllOverdue = () => {
    overdueTasks.forEach((t) => rescheduleToToday(t.id));
  };

  const filtered = useMemo(() => {
    let r = [...folderTasks];
    if (filterTab === 'active') {
      r = r.filter((t) => t.status !== 'Réussi' && t.status !== 'Abandonné');
    } else if (filterTab === 'completed') {
      r = r.filter((t) => t.status === 'Réussi' || t.status === 'Abandonné');
    } else if (filterTab === 'overdue') {
      r = r.filter((t) => isTaskOverdue(t));
    }

    // Sort by earliest date
    r.sort((a, b) => {
      const dateA = a.startDate || a.dueDate || '9999-99-99';
      const dateB = b.startDate || b.dueDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    });

    return r;
  }, [folderTasks, filterTab]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Banner alerte globale si des tâches sont en retard */}
      {overdueTasks.length > 0 && filterTab !== 'overdue' && (
        <GlassCard style={styles.alertBannerCard}>
          <View style={styles.alertBannerInner}>
            <View style={styles.alertBannerTextRow}>
              <Ionicons name="warning" size={20} color="#e74c3c" />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertBannerTitle}>
                  {overdueTasks.length} tâche{overdueTasks.length > 1 ? 's' : ''} en retard !
                </Text>
                <Text style={styles.alertBannerSub}>
                  Des délais sont dépassés. Prenez une décision ou reportez-les.
                </Text>
              </View>
            </View>

            <View style={styles.alertBannerBtnRow}>
              <TouchableOpacity
                style={styles.alertBannerBtnFilter}
                onPress={() => setFilterTab('overdue')}
              >
                <Text style={styles.alertBannerBtnFilterText}>Voir les retards</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.alertBannerBtnReschedule}
                onPress={handleRescheduleAllOverdue}
              >
                <Text style={styles.alertBannerBtnRescheduleText}>Tout reporter à aujourd'hui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      )}

      {/* Filters: En cours / Toutes / Terminées / En retard */}
      <GlassCard style={styles.filterCard}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, filterTab === 'active' && styles.tabBtnActive]}
            onPress={() => setFilterTab('active')}
          >
            <Text style={[styles.tabText, filterTab === 'active' && styles.tabTextActive]}>
              En cours ({folderTasks.filter((t) => t.status !== 'Réussi' && t.status !== 'Abandonné').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, filterTab === 'all' && styles.tabBtnActive]}
            onPress={() => setFilterTab('all')}
          >
            <Text style={[styles.tabText, filterTab === 'all' && styles.tabTextActive]}>
              Toutes ({folderTasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, filterTab === 'completed' && styles.tabBtnActive]}
            onPress={() => setFilterTab('completed')}
          >
            <Text style={[styles.tabText, filterTab === 'completed' && styles.tabTextActive]}>
              Terminées ({folderTasks.filter((t) => t.status === 'Réussi' || t.status === 'Abandonné').length})
            </Text>
          </TouchableOpacity>

          {overdueTasks.length > 0 && (
            <TouchableOpacity
              style={[
                styles.tabBtn,
                styles.tabBtnOverdue,
                filterTab === 'overdue' && styles.tabBtnOverdueActive,
              ]}
              onPress={() => setFilterTab('overdue')}
            >
              <Text
                style={[
                  styles.tabText,
                  styles.tabTextOverdueText,
                  filterTab === 'overdue' && styles.tabTextActive,
                ]}
              >
                ⚠ En retard ({overdueTasks.length})
              </Text>
            </TouchableOpacity>
          )}
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
              {filterTab === 'completed'
                ? 'Aucune tâche terminée'
                : filterTab === 'overdue'
                ? 'Aucune tâche en retard 🎉'
                : 'Aucune tâche dans ce filtre'}
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

  alertBannerCard: {
    marginBottom: 14,
    borderColor: '#e74c3c',
    borderWidth: 1.5,
    backgroundColor: 'rgba(231,76,60,0.08)',
  },
  alertBannerInner: { padding: 12 },
  alertBannerTextRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  alertBannerTitle: { fontSize: 14, fontWeight: '800', color: '#e74c3c' },
  alertBannerSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  alertBannerBtnRow: { flexDirection: 'row', gap: 8 },
  alertBannerBtnFilter: {
    backgroundColor: 'rgba(231,76,60,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
  },
  alertBannerBtnFilterText: { fontSize: 11, fontWeight: '800', color: '#e74c3c' },
  alertBannerBtnReschedule: {
    backgroundColor: COLORS.pinkDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  alertBannerBtnRescheduleText: { fontSize: 11, fontWeight: '800', color: '#fff' },

  filterCard: { padding: 8, marginBottom: 16 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: COLORS.pinkDark,
  },
  tabBtnOverdue: {
    backgroundColor: 'rgba(231,76,60,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
  },
  tabBtnOverdueActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  tabTextOverdueText: { color: '#e74c3c', fontWeight: '800' },
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
