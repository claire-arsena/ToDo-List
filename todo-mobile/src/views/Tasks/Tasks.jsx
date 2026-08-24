import React, { useContext, useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodoContext, isFolderVisibleInMode } from '../../ctx/TodoContext';
import { ProfileContext } from '../../ctx/ProfileContext';
import TasksItem from './TasksItem';
import GlassCard from '../../components/GlassCard';
import { COLORS } from '../../theme';
import { isTaskOverdue } from '../../config/constants';

export default function Tasks() {
  const { tasks, folders, deleteFolder, rescheduleToToday } = useContext(TodoContext);
  const { appMode, currentTheme, toggleAppMode } = useContext(ProfileContext);
  const [filterTab, setFilterTab] = useState('active'); // 'all', 'active', 'completed', 'overdue'
  const [selectedFolderId, setSelectedFolderId] = useState(null); // null = all folders
  const [viewMode, setViewMode] = useState('tasks'); // 'tasks' | 'reminders'

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

  const visibleFolders = useMemo(
    () => folders.filter((f) => isFolderVisibleInMode(f, appMode)),
    [folders, appMode]
  );

  // Si le dossier sélectionné disparaît du mode courant (visibilité changée,
  // ou changement de mode perso/univ), on revient au filtre "Tous les dossiers".
  useEffect(() => {
    if (selectedFolderId && !visibleFolders.some((f) => f.id === selectedFolderId)) {
      setSelectedFolderId(null);
    }
  }, [selectedFolderId, visibleFolders]);

  const remindersCount = useMemo(() => tasks.filter((t) => t.isReminder).length, [tasks]);

  const folderTasks = useMemo(() => {
    // Les rappels vivent dans leur propre onglet, complètement séparés des tâches.
    const byMode = tasks.filter((t) => !!t.isReminder === (viewMode === 'reminders'));

    // Une tâche sans dossier reste toujours visible ; une tâche dans un dossier
    // masqué pour ce mode (perso/univ) disparaît de la liste.
    const base = byMode.filter((t) => {
      if (!t.folderId) return true;
      const f = folders.find((folder) => folder.id === t.folderId);
      if (!f) return true;
      return isFolderVisibleInMode(f, appMode);
    });
    if (selectedFolderId === null) return base;
    return base.filter((t) => t.folderId === selectedFolderId);
  }, [tasks, selectedFolderId, appMode, folders, viewMode]);

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
      {/* Bascule Tâches / Rappels */}
      <GlassCard style={styles.viewModeCard}>
        <View style={styles.viewModeTrack}>
          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'tasks' && styles.viewModeBtnActive]}
            onPress={() => setViewMode('tasks')}
          >
            <Ionicons
              name="checkbox-outline"
              size={15}
              color={viewMode === 'tasks' ? currentTheme.primary : COLORS.textMuted}
            />
            <Text style={[styles.viewModeText, viewMode === 'tasks' && { color: currentTheme.primary, fontWeight: '800' }]}>
              Tâches
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewModeBtn, viewMode === 'reminders' && styles.viewModeBtnActive]}
            onPress={() => setViewMode('reminders')}
          >
            <Ionicons
              name="notifications-outline"
              size={15}
              color={viewMode === 'reminders' ? currentTheme.primary : COLORS.textMuted}
            />
            <Text style={[styles.viewModeText, viewMode === 'reminders' && { color: currentTheme.primary, fontWeight: '800' }]}>
              Rappels {remindersCount > 0 ? `(${remindersCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Banner Mode Universitaire */}
      {viewMode === 'tasks' && appMode === 'university' && (
        <GlassCard style={styles.univBannerCard}>
          <View style={styles.univBannerInner}>
            <Ionicons name="school" size={22} color={currentTheme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.univBannerTitle, { color: currentTheme.primary }]}>
                Mode universitaire : Rendus & Devoirs
              </Text>
              <Text style={styles.univBannerSub}>
                Affichage ciblé sur les devoirs, projets et rendus universitaires à rendre.
              </Text>
            </View>
            <TouchableOpacity style={styles.univSwitchBtn} onPress={toggleAppMode}>
              <Text style={styles.univSwitchBtnText}>Mode perso</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      {/* Banner alerte globale si des tâches sont en retard */}
      {overdueTasks.length > 0 && filterTab !== 'overdue' && (
        <GlassCard style={styles.alertBannerCard}>
          <View style={styles.alertBannerInner}>
            <View style={styles.alertBannerTextRow}>
              <Ionicons name="warning" size={20} color="#ff3b30" />
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
                style={[styles.alertBannerBtnReschedule, { backgroundColor: currentTheme.primary }]}
                onPress={handleRescheduleAllOverdue}
              >
                <Text style={styles.alertBannerBtnRescheduleText}>Tout reporter à aujourd'hui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      )}

      {/* iOS Segmented Control */}
      <GlassCard style={styles.segmentedCard}>
        <View style={styles.iosSegmentedTrack}>
          <TouchableOpacity
            style={[styles.iosSegmentBtn, filterTab === 'active' && styles.iosSegmentBtnActive]}
            onPress={() => setFilterTab('active')}
          >
            <Text style={[styles.iosSegmentText, filterTab === 'active' && { color: currentTheme.primary, fontWeight: '800' }]}>
              En cours ({folderTasks.filter((t) => t.status !== 'Réussi' && t.status !== 'Abandonné').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iosSegmentBtn, filterTab === 'all' && styles.iosSegmentBtnActive]}
            onPress={() => setFilterTab('all')}
          >
            <Text style={[styles.iosSegmentText, filterTab === 'all' && { color: currentTheme.primary, fontWeight: '800' }]}>
              Toutes ({folderTasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iosSegmentBtn, filterTab === 'completed' && styles.iosSegmentBtnActive]}
            onPress={() => setFilterTab('completed')}
          >
            <Text style={[styles.iosSegmentText, filterTab === 'completed' && { color: currentTheme.primary, fontWeight: '800' }]}>
              Terminées ({folderTasks.filter((t) => t.status === 'Réussi' || t.status === 'Abandonné').length})
            </Text>
          </TouchableOpacity>

          {overdueTasks.length > 0 && (
            <TouchableOpacity
              style={[
                styles.iosSegmentBtn,
                styles.iosSegmentBtnOverdue,
                filterTab === 'overdue' && styles.iosSegmentBtnOverdueActive,
              ]}
              onPress={() => setFilterTab('overdue')}
            >
              <Text
                style={[
                  styles.iosSegmentText,
                  styles.iosSegmentTextOverdue,
                  filterTab === 'overdue' && styles.iosSegmentTextActive,
                ]}
              >
                En retard ({overdueTasks.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtre par Dossier (iOS Chips style) */}
        {visibleFolders.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <View style={styles.folderFilterRow}>
              <TouchableOpacity
                style={[
                  styles.folderFilterChip,
                  selectedFolderId === null && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary },
                ]}
                onPress={() => setSelectedFolderId(null)}
              >
                <Text
                  style={[
                    styles.folderFilterText,
                    selectedFolderId === null && styles.folderFilterTextActive,
                  ]}
                >
                  Tous les dossiers
                </Text>
              </TouchableOpacity>

              {visibleFolders.map((f) => {
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
                      <Text style={[styles.folderFilterText, active && { color: '#fff', fontWeight: '700' }]}>
                        {f.title}
                      </Text>
                    </TouchableOpacity>

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

      {/* List of Task Items */}
      <View style={styles.list}>
        {filtered.length > 0 ? (
          filtered.map((task) => <TasksItem key={task.id} task={task} />)
        ) : (
          <View style={styles.empty}>
            <Ionicons
              name={viewMode === 'reminders' ? 'notifications-outline' : 'checkbox-outline'}
              size={36}
              color={COLORS.textMuted}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.emptyTitle}>
              {viewMode === 'reminders'
                ? (filterTab === 'completed'
                    ? 'Aucun rappel terminé'
                    : filterTab === 'overdue'
                    ? 'Aucun rappel en retard'
                    : 'Aucun rappel dans ce filtre')
                : (filterTab === 'completed'
                    ? 'Aucune tâche terminée'
                    : filterTab === 'overdue'
                    ? 'Aucune tâche en retard'
                    : 'Aucune tâche dans ce filtre')}
            </Text>
            <Text style={styles.emptySub}>
              {filterTab === 'active'
                ? (viewMode === 'reminders'
                    ? 'Appuyez sur + et activez "Ceci est un rappel" pour en ajouter un !'
                    : 'Appuyez sur + pour ajouter votre première tâche !')
                : ''}
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

  univBannerCard: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: 'rgba(216, 27, 96, 0.06)',
    borderRadius: 18,
  },
  univBannerInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  univBannerTitle: { fontSize: 13, fontWeight: '800' },
  univBannerSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  univSwitchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  univSwitchBtnText: { fontSize: 10, fontWeight: '700', color: COLORS.text },

  alertBannerCard: {
    marginBottom: 14,
    borderColor: '#ff3b30',
    borderWidth: 1,
    backgroundColor: 'rgba(255,59,48,0.06)',
    borderRadius: 20,
  },
  viewModeCard: { padding: 4, marginBottom: 14, borderRadius: 14 },
  viewModeTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    borderRadius: 11,
    padding: 3,
    gap: 3,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  viewModeBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  viewModeText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },

  alertBannerInner: { padding: 14 },
  alertBannerTextRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  alertBannerTitle: { fontSize: 14, fontWeight: '800', color: '#ff3b30' },
  alertBannerSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  alertBannerBtnRow: { flexDirection: 'row', gap: 8 },
  alertBannerBtnFilter: {
    backgroundColor: 'rgba(255,59,48,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.25)',
  },
  alertBannerBtnFilterText: { fontSize: 11, fontWeight: '800', color: '#ff3b30' },
  alertBannerBtnReschedule: {
    backgroundColor: COLORS.pinkDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  alertBannerBtnRescheduleText: { fontSize: 11, fontWeight: '800', color: '#fff' },

  segmentedCard: { padding: 10, marginBottom: 16, borderRadius: 20 },
  iosSegmentedTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  iosSegmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  iosSegmentBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  iosSegmentBtnOverdue: {
    backgroundColor: 'rgba(255,59,48,0.15)',
  },
  iosSegmentBtnOverdueActive: {
    backgroundColor: '#ff3b30',
  },
  iosSegmentText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  iosSegmentTextActive: { color: COLORS.pinkDark, fontWeight: '800' },
  iosSegmentTextOverdue: { color: '#ff3b30', fontWeight: '700' },

  folderFilterRow: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  folderFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  folderFilterSelectArea: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  folderFilterChipActive: { backgroundColor: COLORS.pinkDark, borderColor: COLORS.pinkDark },
  folderFilterText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  folderFilterTextActive: { color: '#fff', fontWeight: '800' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  deleteFolderBtn: { marginLeft: 6, padding: 2 },

  list: { gap: 4 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
});
