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
import { ProfileContext, THEMES } from '../ctx/ProfileContext';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS } from '../config/constants';
import { COLORS } from '../theme';
import GlassCard from '../components/GlassCard';

const screenWidth = Dimensions.get('window').width;

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

  // Stats chart data
  const chartData = useMemo(() => {
    const counts = {};
    Object.values(ETATS).forEach((s) => {
      counts[s] = 0;
    });
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });

    const CHART_COLORS = {
      [ETATS.NOUVEAU]: currentTheme.primary,
      [ETATS.EN_COURS]: '#ff9500',
      [ETATS.REUSSI]: '#34c759',
      [ETATS.EN_ATTENTE]: '#af52de',
      [ETATS.ABANDONNE]: '#8e8e93',
    };

    return Object.entries(counts)
      .filter(([, c]) => c > 0)
      .map(([status, count]) => ({
        name: status,
        population: count,
        color: CHART_COLORS[status] || currentTheme.primary,
        legendFontColor: COLORS.text,
        legendFontSize: 13,
      }));
  }, [tasks, currentTheme]);

  const total = tasks.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* CARD 1 : BASCULE DE MODE (PERSONNEL VS EDT UNIVERSITAIRE) */}
      <GlassCard style={styles.modeCard}>
        <View style={styles.modeHeaderRow}>
          <Ionicons
            name={appMode === 'university' ? 'school' : 'person'}
            size={22}
            color={currentTheme.primary}
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.modeTitle, { color: currentTheme.primary }]}>
              {appMode === 'university' ? 'Mode EDT Universitaire' : 'Mode Personnel'}
            </Text>
            <Text style={styles.modeSub}>
              {appMode === 'university'
                ? 'Planning et Calendrier affichent les cours universitaires. L\'onglet Tâches est filtré pour les rendus d\'études.'
                : 'Planning, Tâches et Calendrier affichent vos activités personnelles.'}
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
                ? 'Basculer en Mode Personnel'
                : 'Basculer en Mode EDT Universitaire'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>

      {/* CARD 2 : MON PROFIL ET ASSIGNATION APPAREIL */}
      {currentProfile ? (
        <GlassCard style={styles.activeProfileCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, { backgroundColor: currentTheme.primary }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.profileName}>{currentProfile.name}</Text>
              <Text style={styles.profileRole}>
                Profil défini pour cet appareil · {currentProfile.role === 'full' ? 'Accès EDT complet' : 'Accès Tâches uniquement'}
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
            Pour accéder aux emplois du temps universitaires et personnaliser votre espace, sélectionnez votre prénom ci-dessous (**Claire, Alban, Clara ou Marielle**). Ce choix liera définitivement ce profil à cet appareil.
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

      {/* CARD 3 : THÈME DE COULEUR DE L'APPLICATION */}
      <GlassCard style={styles.themeCard}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="color-palette-outline" size={20} color={currentTheme.primary} />
          <Text style={[styles.sectionTitleHeader, { color: currentTheme.primary }]}>Thème de couleur</Text>
        </View>
        <Text style={styles.sectionSubText}>Choisissez l'apparence et la couleur principale de l'interface :</Text>

        <View style={styles.themesRow}>
          {Object.values(THEMES).map((t) => {
            const isSelected = themeKey === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.themeChip,
                  { borderColor: t.primary },
                  isSelected && { backgroundColor: t.primary },
                ]}
                onPress={() => changeTheme(t.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.themeDot, { backgroundColor: isSelected ? '#fff' : t.primary }]} />
                <Text style={[styles.themeChipText, isSelected && styles.textWhite]}>{t.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {/* CARD 4 : SUPERPOSITION DES EMPLOIS DU TEMPS (.ICS) */}
      {canAccessSchedules ? (
        <GlassCard style={styles.scheduleCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar-outline" size={20} color={currentTheme.primary} />
            <Text style={[styles.sectionTitleHeader, { color: currentTheme.primary }]}>
              Superposition des Emplois du Temps (.ics)
            </Text>
          </View>
          <Text style={styles.sectionSubText}>
            Cochez les emplois du temps universitaires à faire apparaître dans la vue EDT :
          </Text>

          {allowedProfiles
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
            })}
        </GlassCard>
      ) : currentProfile ? (
        <GlassCard style={styles.restrictedCard}>
          <Ionicons name="lock-closed-outline" size={24} color={COLORS.textMuted} />
          <Text style={styles.restrictedText}>
            Le profil Marielle a un accès uniquement réservé à la liste des tâches. Les emplois du temps universitaires sont masqués.
          </Text>
        </GlassCard>
      ) : null}

      {/* CARD 5 : STATISTIQUES ET SAUVEGARDE */}
      <GlassCard style={styles.chartCard}>
        <Text style={[styles.sectionTitleHeader, { color: currentTheme.primary }]}>Statistiques des tâches</Text>

        {total === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune tâche dans votre liste</Text>
          </View>
        ) : (
          <>
            <PieChart
              data={chartData}
              width={screenWidth - 80}
              height={190}
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

            <View style={styles.tableWrap}>
              {chartData.map((item) => {
                const percent = Math.round((item.population / total) * 100);
                return (
                  <View key={item.name} style={styles.row}>
                    <View style={[styles.dot, { backgroundColor: item.color }]} />
                    <Text style={styles.rowLabel}>{item.name}</Text>
                    <Text style={styles.rowCount}>{item.population}</Text>
                    <Text style={styles.rowPercent}>{percent}%</Text>
                  </View>
                );
              })}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={[styles.totalCount, { color: currentTheme.primary }]}>{total}</Text>
                <Text style={[styles.totalPercent, { color: currentTheme.primary }]}>100%</Text>
              </View>
            </View>
          </>
        )}
      </GlassCard>

      {/* CARD 6 : SAUVEGARDE & RESTAURATION */}
      <GlassCard style={styles.backupCard}>
        <Text style={[styles.sectionTitleHeader, { color: currentTheme.primary }]}>Sauvegarde / Restauration</Text>
        <Text style={styles.backupSub}>
          {total} tâche{total !== 1 ? 's' : ''} · {folders.length} dossier{folders.length !== 1 ? 's' : ''} en local
        </Text>
        <View style={styles.backupButtons}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleExport} style={{ flex: 1 }}>
            <LinearGradient
              colors={[currentTheme.primary, currentTheme.deep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.backupBtn}
            >
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={styles.backupBtnText}>Exporter JSON</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={handleImport} style={[styles.restoreBtn, { flex: 1, borderColor: currentTheme.primary }]}>
            <Ionicons name="cloud-upload-outline" size={18} color={currentTheme.primary} />
            <Text style={[styles.restoreBtnText, { color: currentTheme.primary }]}>Restaurer JSON</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

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

  // Theme Card
  themeCard: { padding: 16, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitleHeader: { fontSize: 15, fontWeight: '800' },
  sectionSubText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  themesRow: { flexDirection: 'row', gap: 8 },
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

  // Schedule Card
  scheduleCard: { padding: 16, marginBottom: 16 },
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

  restrictedCard: { padding: 16, marginBottom: 16, alignItems: 'center', gap: 8 },
  restrictedText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },

  // Stats Card
  chartCard: { padding: 16, marginBottom: 16 },
  empty: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, fontStyle: 'italic' },
  chart: { borderRadius: 16, alignSelf: 'center', marginVertical: 8 },
  tableWrap: { marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  rowLabel: { flex: 1, fontSize: 13, color: COLORS.text, fontWeight: '500' },
  rowCount: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginRight: 16, minWidth: 24, textAlign: 'right' },
  rowPercent: { fontSize: 12, color: COLORS.textMuted, minWidth: 40, textAlign: 'right' },
  totalRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10 },
  totalLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.text, paddingLeft: 20 },
  totalCount: { fontSize: 13, fontWeight: '700', marginRight: 16, minWidth: 24, textAlign: 'right' },
  totalPercent: { fontSize: 12, fontWeight: '700', minWidth: 40, textAlign: 'right' },

  // Backup Card
  backupCard: { padding: 16, marginBottom: 16 },
  backupSub: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  backupButtons: { flexDirection: 'row', gap: 10 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
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
