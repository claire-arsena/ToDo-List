import React, { useContext, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileContext } from '../ctx/ProfileContext';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS } from '../config/constants';
import { COLORS } from '../theme';
import GlassCard from '../components/GlassCard';

const screenWidth = Dimensions.get('window').width;

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function ProfileView() {
  const {
    allowedProfiles,
    currentProfile,
    bindDeviceProfile,
    appMode,
    toggleAppMode,
    currentTheme,
    themeKey,
    changeTheme,
    visibleSchedules,
    toggleScheduleVisibility,
    canAccessSchedules,
  } = useContext(ProfileContext);

  const { tasks, folders } = useContext(TodoContext);
  const fileInputRef = useRef(null);

  // Active Sub-modal state: null | 'preferences' | 'stats' | 'backup'
  const [activeModal, setActiveModal] = useState(null);

  // Profile Binding Confirmation Modal
  const [selectedTarget, setSelectedTarget] = useState(null);

  const handleSelectClick = (p) => {
    setSelectedTarget(p);
  };

  const confirmBinding = async () => {
    if (!selectedTarget) return;
    await bindDeviceProfile(selectedTarget.id);
    setSelectedTarget(null);
  };

  // Export JSON Backup
  const handleExport = useCallback(() => {
    const backup = {
      version: 3,
      exportDate: new Date().toISOString(),
      tasks,
      folders,
    };
    const json = JSON.stringify(backup, null, 2);

    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `sauvegarde-taches-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Sauvegarde', 'Fichier de sauvegarde généré.');
    }
  }, [tasks, folders]);

  // Import JSON Restore
  const handleImport = useCallback(() => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      Alert.alert('Restauration', 'Disponible sur la version Web.');
    }
  }, []);

  const processImportFile = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.tasks || !Array.isArray(data.tasks)) {
        const msg = 'Fichier invalide : aucune tâche trouvée.';
        Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Erreur', msg);
        return;
      }

      const confirmMsg = `Restaurer ${data.tasks.length} tâche(s) ?\n\nAttention : vos données actuelles seront remplacées.`;

      const doRestore = async () => {
        await AsyncStorage.setItem('@todo_tasks_v2', JSON.stringify(data.tasks));
        if (data.folders) {
          await AsyncStorage.setItem('@todo_folders_v2', JSON.stringify(data.folders));
        }
        if (Platform.OS === 'web') {
          window.location.reload();
        }
      };

      if (Platform.OS === 'web') {
        if (window.confirm(confirmMsg)) {
          await doRestore();
        }
      } else {
        Alert.alert('Restaurer ?', confirmMsg, [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Restaurer', style: 'destructive', onPress: doRestore },
        ]);
      }
    } catch (err) {
      const msg = 'Erreur lors de la lecture du fichier.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Erreur', msg);
    }
    if (e.target) e.target.value = '';
  }, []);

  // Advanced Stats Computations
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === ETATS.REUSSI).length;
    const inProgress = tasks.filter((t) => t.status === ETATS.EN_COURS).length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate most productive month
    const monthCounts = {};
    tasks.forEach((t) => {
      if (t.status === ETATS.REUSSI && t.startDate) {
        const [y, m] = t.startDate.split('-');
        if (y && m) {
          const key = `${MONTHS_FR[parseInt(m, 10) - 1]} ${y}`;
          monthCounts[key] = (monthCounts[key] || 0) + 1;
        }
      }
    });

    let mostProductiveMonth = 'Aucune donnée';
    let maxCount = 0;
    Object.entries(monthCounts).forEach(([m, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostProductiveMonth = m;
      }
    });

    // Chart Data
    const counts = {};
    Object.values(ETATS).forEach((s) => { counts[s] = 0; });
    tasks.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });

    const CHART_COLORS = {
      [ETATS.NOUVEAU]: currentTheme.primary,
      [ETATS.EN_COURS]: '#ff9500',
      [ETATS.REUSSI]: '#34c759',
      [ETATS.EN_ATTENTE]: '#af52de',
      [ETATS.ABANDONNE]: '#8e8e93',
    };

    const chartData = Object.entries(counts)
      .filter(([, c]) => c > 0)
      .map(([status, count]) => ({
        name: status,
        population: count,
        color: CHART_COLORS[status] || currentTheme.primary,
        legendFontColor: COLORS.text,
        legendFontSize: 13,
      }));

    return {
      total,
      completed,
      inProgress,
      successRate,
      mostProductiveMonth,
      maxCount,
      chartData,
    };
  }, [tasks, currentTheme]);

  const themeOptions = [
    { key: 'rose', name: 'Rose', color: '#d81b60' },
    { key: 'blue', name: 'Bleu', color: '#1e88e5' },
    { key: 'green', name: 'Vert', color: '#2ecc71' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. MON PROFIL & ASSIGNATION APPAREIL */}
      {currentProfile ? (
        <GlassCard style={styles.activeProfileCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, { backgroundColor: currentTheme.primary }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.profileName}>{currentProfile.name}</Text>
              <Text style={styles.profileRole}>
                Profil actif sur cet appareil · {currentProfile.role === 'full' ? 'Accès EDT complet' : 'Accès Tâches uniquement'}
              </Text>
            </View>
            <View style={[styles.boundBadge, { backgroundColor: currentTheme.tint }]}>
              <Ionicons name="checkmark-done-circle" size={16} color={currentTheme.primary} />
              <Text style={[styles.boundBadgeText, { color: currentTheme.primary }]}>Actif</Text>
            </View>
          </View>
        </GlassCard>
      ) : (
        <GlassCard style={styles.deviceSelectionCard}>
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={22} color="#d97706" />
            <Text style={styles.warningTitle}>Attention : Choix définitif de profil</Text>
          </View>
          <Text style={styles.warningText}>
            Pour accéder aux emplois du temps universitaires et personnaliser votre espace, sélectionnez votre prénom ci-dessous (Claire, Alban, Clara ou Marielle). Ce choix liera définitivement ce profil à cet appareil.
          </Text>

          <Text style={styles.selectLabel}>Sélectionnez votre prénom :</Text>

          <View style={styles.profilesGrid}>
            {allowedProfiles.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.profileChoiceChip, { borderColor: p.defaultColor }]}
                onPress={() => handleSelectClick(p)}
                activeOpacity={0.8}
              >
                <Ionicons name="person-outline" size={18} color={p.defaultColor} />
                <Text style={styles.choiceName}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>
      )}

      {/* 2. MODE DE L'APPLICATION */}
      <GlassCard style={styles.modeCard}>
        <View style={styles.modeHeaderRow}>
          <Ionicons
            name={appMode === 'university' ? 'school' : 'checkbox'}
            size={22}
            color={currentTheme.primary}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.modeTitle, { color: currentTheme.primary }]}>
              {appMode === 'university' ? 'Mode EDT Universitaire' : 'Mode ToDo-List'}
            </Text>
            <Text style={styles.modeSub}>
              {appMode === 'university'
                ? 'Planning et Calendrier affichent les cours universitaires. L\'onglet Tâches est ciblé sur les devoirs d\'études.'
                : 'Planning, Tâches et Calendrier affichent vos activités personnelles ToDo-List.'}
            </Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={toggleAppMode} style={{ marginTop: 14 }}>
          <LinearGradient
            colors={[currentTheme.primary, currentTheme.deep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.switchModeBtn}
          >
            <Ionicons name="swap-horizontal-outline" size={18} color="#fff" />
            <Text style={styles.switchModeBtnText}>
              {appMode === 'university'
                ? 'Basculer en Mode ToDo-List'
                : 'Basculer en Mode EDT Universitaire'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>

      {/* 3. MENU DES CARTES-BOUTONS (PRÉFÉRENCES, STATS, SAUVEGARDE) */}
      <Text style={styles.menuSectionHeader}>Menu & Paramètres</Text>

      <View style={styles.menuButtonsGrid}>
        {/* BOUTON PRÉFÉRENCES */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => setActiveModal('preferences')}>
          <GlassCard style={styles.menuButtonCard}>
            <View style={[styles.menuIconCircle, { backgroundColor: currentTheme.tint }]}>
              <Ionicons name="options-outline" size={24} color={currentTheme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuButtonTitle}>Préférences</Text>
              <Text style={styles.menuButtonSub}>Thème de couleur et filtres d'emplois du temps</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </GlassCard>
        </TouchableOpacity>

        {/* BOUTON STATISTIQUES */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => setActiveModal('stats')}>
          <GlassCard style={styles.menuButtonCard}>
            <View style={[styles.menuIconCircle, { backgroundColor: currentTheme.tint }]}>
              <Ionicons name="stats-chart-outline" size={24} color={currentTheme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuButtonTitle}>Statistiques & Productivité</Text>
              <Text style={styles.menuButtonSub}>Mois le plus productif, taux de réussite et récapitulatif</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </GlassCard>
        </TouchableOpacity>

        {/* BOUTON SAUVEGARDE */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => setActiveModal('backup')}>
          <GlassCard style={styles.menuButtonCard}>
            <View style={[styles.menuIconCircle, { backgroundColor: currentTheme.tint }]}>
              <Ionicons name="cloud-download-outline" size={24} color={currentTheme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuButtonTitle}>Sauvegarde & Restauration</Text>
              <Text style={styles.menuButtonSub}>Exporter ou restaurer l'intégralité de vos tâches</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </GlassCard>
        </TouchableOpacity>
      </View>

      {/* Input hidden web import */}
      {Platform.OS === 'web' && (
        <View style={{ width: 0, height: 0, overflow: 'hidden' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={processImportFile}
            style={{ display: 'none' }}
          />
        </View>
      )}

      {/* MODAL 1 : PRÉFÉRENCES */}
      <Modal visible={activeModal === 'preferences'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Ionicons name="options-outline" size={22} color={currentTheme.primary} />
              <Text style={[styles.modalHeaderTitle, { color: currentTheme.primary }]}>Préférences</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {/* Thème de couleur */}
              <Text style={styles.modalSectionLabel}>Thème de couleur</Text>
              <Text style={styles.modalSectionSub}>Choisissez la couleur principale de votre interface :</Text>
              <View style={styles.themesRow}>
                {themeOptions.map((t) => {
                  const isSelected = themeKey === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[
                        styles.themeChip,
                        { borderColor: t.color },
                        isSelected && { backgroundColor: t.color },
                      ]}
                      onPress={() => changeTheme(t.key)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.themeDot, { backgroundColor: isSelected ? '#fff' : t.color }]} />
                      <Text style={[styles.themeChipText, isSelected && styles.textWhite]}>{t.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Superposition des emplois du temps (visible si Mode EDT Universitaire) */}
              {appMode === 'university' && (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.modalSectionLabel}>Superposition des Emplois du Temps</Text>
                  <Text style={styles.modalSectionSub}>Cochez les emplois du temps à afficher dans la vue EDT :</Text>

                  {canAccessSchedules ? (
                    allowedProfiles
                      .filter((p) => p.role === 'full')
                      .map((p) => {
                        const isChecked = !!visibleSchedules[p.id];
                        return (
                          <TouchableOpacity
                            key={p.id}
                            style={styles.scheduleToggleRow}
                            onPress={() => toggleScheduleVisibility(p.id)}
                            activeOpacity={0.7}
                          >
                            <View style={[styles.colorIndicator, { backgroundColor: p.defaultColor }]} />
                            <Text style={styles.scheduleName}>Emploi du temps de {p.name}</Text>
                            <View
                              style={[
                                styles.toggleTrack,
                                isChecked ? { backgroundColor: currentTheme.primary } : styles.toggleTrackOff,
                              ]}
                            >
                              <View
                                style={[
                                  styles.toggleThumb,
                                  isChecked ? styles.toggleThumbOn : styles.toggleThumbOff,
                                ]}
                              />
                            </View>
                          </TouchableOpacity>
                        );
                      })
                  ) : (
                    <Text style={styles.restrictedText}>
                      Le profil Marielle n'a pas accès à la superposition des emplois du temps universitaires.
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>

      {/* MODAL 2 : STATISTIQUES & PRODUCTIVITÉ */}
      <Modal visible={activeModal === 'stats'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Ionicons name="stats-chart-outline" size={22} color={currentTheme.primary} />
              <Text style={[styles.modalHeaderTitle, { color: currentTheme.primary }]}>Statistiques & Productivité</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
              {/* Grille d'indicateurs de productivité */}
              <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                  <Text style={[styles.kpiValue, { color: currentTheme.primary }]}>{stats.completed}</Text>
                  <Text style={styles.kpiLabel}>Tâches réussies</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={[styles.kpiValue, { color: currentTheme.primary }]}>{stats.successRate}%</Text>
                  <Text style={styles.kpiLabel}>Taux de réussite</Text>
                </View>
              </View>

              <View style={styles.kpiFullCard}>
                <Ionicons name="trophy-outline" size={20} color={currentTheme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.kpiFullTitle}>Mois le plus productif</Text>
                  <Text style={styles.kpiFullSub}>{stats.mostProductiveMonth} {stats.maxCount > 0 ? `(${stats.maxCount} tâches réussies)` : ''}</Text>
                </View>
              </View>

              {/* Chart */}
              {stats.total > 0 ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.modalSectionLabel}>Répartition des tâches</Text>
                  <PieChart
                    data={stats.chartData}
                    width={screenWidth - 90}
                    height={180}
                    chartConfig={{
                      color: (opacity = 1) => `${currentTheme.primary}`,
                      labelColor: (opacity = 1) => `rgba(28, 28, 30, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="10"
                    hasLegend
                    style={styles.chart}
                  />
                </View>
              ) : (
                <Text style={styles.emptyTextModal}>Aucune tâche enregistrée pour le moment.</Text>
              )}
            </ScrollView>
          </GlassCard>
        </View>
      </Modal>

      {/* MODAL 3 : SAUVEGARDE & RESTAURATION */}
      <Modal visible={activeModal === 'backup'} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Ionicons name="cloud-download-outline" size={22} color={currentTheme.primary} />
              <Text style={[styles.modalHeaderTitle, { color: currentTheme.primary }]}>Sauvegarde & Restauration</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 10 }}>
              <Text style={styles.modalSectionLabel}>Données enregistrées sur l'appareil</Text>
              <Text style={styles.backupSubModal}>
                {stats.total} tâche{stats.total !== 1 ? 's' : ''} · {folders.length} dossier{folders.length !== 1 ? 's' : ''} conservés en local.
              </Text>

              <View style={styles.backupButtonsModal}>
                <TouchableOpacity activeOpacity={0.8} onPress={handleExport} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={[currentTheme.primary, currentTheme.deep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.backupBtn}
                  >
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={styles.backupBtnText}>Exporter la sauvegarde</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={handleImport} style={[styles.restoreBtn, { flex: 1, borderColor: currentTheme.primary }]}>
                  <Ionicons name="cloud-upload-outline" size={18} color={currentTheme.primary} />
                  <Text style={[styles.restoreBtnText, { color: currentTheme.primary }]}>Restaurer la sauvegarde</Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* MODAL DE CONFIRMATION DE LIEN PROFIL DÉFINITIF */}
      {selectedTarget && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setSelectedTarget(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmCard}>
              <Ionicons name="alert-circle" size={40} color="#d97706" style={{ marginBottom: 8 }} />
              <Text style={styles.confirmTitle}>Confirmer le profil {selectedTarget.name}</Text>

              <Text style={styles.confirmSub}>
                Attention : ce choix liera définitivement l'appareil à <Text style={{ fontWeight: '800' }}>{selectedTarget.name}</Text>. Vous ne pourrez pas choisir un autre prénom par la suite sur cet appareil.
              </Text>

              <View style={styles.confirmButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedTarget(null)}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmSubmitBtn} onPress={confirmBinding}>
                  <LinearGradient
                    colors={[currentTheme.primary, currentTheme.deep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.confirmGradient}
                  >
                    <Text style={styles.confirmSubmitText}>Confirmer {selectedTarget.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  // Mode Switch Card
  modeCard: { padding: 16, marginBottom: 16 },
  modeHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  modeTitle: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  modeSub: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17 },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 100,
  },
  switchModeBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Active Profile Card
  activeProfileCard: { padding: 14, marginBottom: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  profileRole: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  boundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  boundBadgeText: { fontSize: 11, fontWeight: '800' },

  // Device Selection Card
  deviceSelectionCard: { padding: 16, marginBottom: 16 },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  warningTitle: { fontSize: 15, fontWeight: '800', color: '#d97706' },
  warningText: { fontSize: 12, color: COLORS.textLight, lineHeight: 18, marginBottom: 14 },
  selectLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  profilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  profileChoiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  choiceName: { fontSize: 14, fontWeight: '700', color: COLORS.text },

  // Menu Section Cards (Buttons)
  menuSectionHeader: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 10, marginLeft: 4 },
  menuButtonsGrid: { gap: 10 },
  menuButtonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  menuButtonSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },

  // Sub Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalContentCard: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
  },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  modalHeaderTitle: { flex: 1, fontSize: 17, fontWeight: '800' },
  modalCloseBtn: { padding: 4 },
  modalSectionLabel: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  modalSectionSub: { fontSize: 12, color: COLORS.textMuted, marginBottom: 10 },

  themesRow: { flexDirection: 'row', gap: 8, marginVertical: 6 },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  themeDot: { width: 10, height: 10, borderRadius: 5 },
  themeChipText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  textWhite: { color: '#fff' },

  scheduleToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  scheduleName: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackOff: { backgroundColor: 'rgba(120, 120, 128, 0.2)' },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  toggleThumbOff: { alignSelf: 'flex-start' },
  restrictedText: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', marginTop: 6 },

  // KPI Grid
  kpiGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  kpiCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  kpiValue: { fontSize: 24, fontWeight: '800' },
  kpiLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },

  kpiFullCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    padding: 14,
  },
  kpiFullTitle: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  kpiFullSub: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginTop: 1 },

  chart: { borderRadius: 16, alignSelf: 'center', marginVertical: 8 },
  emptyTextModal: { textAlign: 'center', fontSize: 13, color: COLORS.textMuted, marginVertical: 20 },

  // Backup Modal
  backupSubModal: { fontSize: 12, color: COLORS.textMuted, marginBottom: 16 },
  backupButtonsModal: { flexDirection: 'column', gap: 10 },
  backupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 100,
  },
  backupBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
  },
  restoreBtnText: { fontSize: 13, fontWeight: '700' },

  // Confirm Modal
  confirmCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  confirmTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  confirmSub: { fontSize: 13, color: COLORS.textLight, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  confirmButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.text, fontWeight: '700', fontSize: 13 },
  confirmSubmitBtn: { flex: 1 },
  confirmGradient: {
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  confirmSubmitText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
