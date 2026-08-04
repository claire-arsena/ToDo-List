import React, { useContext, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
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

const CHART_COLORS = {
  [ETATS.NOUVEAU]: COLORS.statusNew,
  [ETATS.EN_COURS]: COLORS.statusProgress,
  [ETATS.REUSSI]: COLORS.statusDone,
  [ETATS.EN_ATTENTE]: COLORS.statusWaiting,
  [ETATS.ABANDONNE]: COLORS.statusCancelled,
};

const chartConfig = {
  color: (opacity = 1) => `rgba(216, 27, 96, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(28, 28, 30, ${opacity})`,
};

export default function ProfileView() {
  const {
    profiles,
    currentProfile,
    switchProfile,
    visibleSchedules,
    toggleScheduleVisibility,
    canAccessSchedules,
  } = useContext(ProfileContext);

  const { tasks, folders } = useContext(TodoContext);

  // Modal Switch Profile state
  const [targetProfile, setTargetProfile] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const fileInputRef = useRef(null);

  const handleSelectProfile = (p) => {
    if (p.id === currentProfile.id) return;
    setTargetProfile(p);
    setPinInput('');
    setPinError('');
  };

  const confirmSwitch = () => {
    if (!targetProfile) return;
    const res = switchProfile(targetProfile.id, pinInput.trim());
    if (res.success) {
      setTargetProfile(null);
      setPinInput('');
      setPinError('');
    } else {
      setPinError(res.error || 'PIN incorrect');
    }
  };

  // Export JSON Backup
  const handleExport = useCallback(() => {
    const backup = {
      version: 2,
      profileId: currentProfile.id,
      profileName: currentProfile.name,
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
      a.download = `backup-${currentProfile.id}-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Sauvegarde', 'Fichier de sauvegarde généré.');
    }
  }, [tasks, folders, currentProfile]);

  // Import JSON Restore
  const handleImport = useCallback(() => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      Alert.alert('Restauration', 'Disponible sur la version Web.');
    }
  }, []);

  const processImportFile = useCallback(
    async (e) => {
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

        const confirmMsg = `Restaurer ${data.tasks.length} tâche(s) pour le profil "${currentProfile.name}" ?\n\nAttention : vos données actuelles pour ce profil seront remplacées.`;

        const doRestore = async () => {
          const storageKey = `@todo_tasks_v2_${currentProfile.id}`;
          const foldersKey = `@todo_folders_v2_${currentProfile.id}`;
          await AsyncStorage.setItem(storageKey, JSON.stringify(data.tasks));
          if (data.folders) {
            await AsyncStorage.setItem(foldersKey, JSON.stringify(data.folders));
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
    },
    [currentProfile]
  );

  // Stats chart data
  const chartData = useMemo(() => {
    const counts = {};
    Object.values(ETATS).forEach((s) => {
      counts[s] = 0;
    });
    tasks.forEach((t) => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return Object.entries(counts)
      .filter(([, c]) => c > 0)
      .map(([status, count]) => ({
        name: status,
        population: count,
        color: CHART_COLORS[status] || COLORS.pinkLight,
        legendFontColor: COLORS.text,
        legendFontSize: 13,
      }));
  }, [tasks]);

  const total = tasks.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* CARD 1 : PROFIL ACTUEL & SELECTEUR */}
      <GlassCard style={styles.profileHeaderCard}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatarCircle, { backgroundColor: currentProfile.color }]}>
            <Text style={styles.avatarEmoji}>{currentProfile.avatar}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.profileName}>{currentProfile.name}</Text>
            <Text style={styles.profileRole}>
              {currentProfile.role === 'full' ? 'Accès complet (Planning & Agenda)' : 'Accès Liste de Tâches'}
            </Text>
          </View>
        </View>

        <Text style={styles.selectTitle}>Changer de profil :</Text>
        <View style={styles.profilesGrid}>
          {profiles.map((p) => {
            const isActive = p.id === currentProfile.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.profileChip,
                  { borderColor: p.color },
                  isActive && { backgroundColor: p.color },
                ]}
                onPress={() => handleSelectProfile(p)}
                activeOpacity={0.8}
              >
                <Text style={styles.chipEmoji}>{p.avatar}</Text>
                <Text style={[styles.chipName, isActive && styles.chipNameActive]}>{p.name}</Text>
                {isActive && <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginLeft: 4 }} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {/* CARD 2 : EMPLOIS DU TEMPS PARTAGÉS (.ICS) — Désactivé pour Marielle */}
      {canAccessSchedules ? (
        <GlassCard style={styles.scheduleCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.pinkDark} />
            <Text style={styles.sectionTitleHeader}>Emplois du temps affichés sur l'Agenda</Text>
          </View>
          <Text style={styles.sectionSubText}>
            Cochez les emplois du temps à superposer dans votre vue calendrier :
          </Text>

          {profiles
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
                  <View style={[styles.colorIndicator, { backgroundColor: p.color }]} />
                  <Text style={styles.scheduleName}>Emploi du temps de {p.name}</Text>
                  <View
                    style={[
                      styles.toggleTrack,
                      isChecked ? { backgroundColor: p.color } : styles.toggleTrackOff,
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
      ) : (
        <GlassCard style={styles.restrictedCard}>
          <Ionicons name="lock-closed-outline" size={24} color={COLORS.textMuted} />
          <Text style={styles.restrictedText}>
            Accès aux emplois du temps et au calendrier restreint pour le profil {currentProfile.name}.
          </Text>
        </GlassCard>
      )}

      {/* CARD 3 : STATISTIQUES DES TÂCHES */}
      <GlassCard style={styles.chartCard}>
        <Text style={styles.sectionTitleHeader}>Statistiques des tâches ({currentProfile.name})</Text>

        {total === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune tâche pour ce profil</Text>
          </View>
        ) : (
          <>
            <PieChart
              data={chartData}
              width={screenWidth - 80}
              height={190}
              chartConfig={chartConfig}
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
                <Text style={styles.totalCount}>{total}</Text>
                <Text style={styles.totalPercent}>100%</Text>
              </View>
            </View>
          </>
        )}
      </GlassCard>

      {/* CARD 4 : SAUVEGARDE & RESTAURATION */}
      <GlassCard style={styles.backupCard}>
        <Text style={styles.sectionTitleHeader}>Sauvegarde / Export ({currentProfile.name})</Text>
        <Text style={styles.backupSub}>
          {total} tâche{total !== 1 ? 's' : ''} · {folders.length} dossier{folders.length !== 1 ? 's' : ''}
        </Text>
        <View style={styles.backupButtons}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleExport} style={{ flex: 1 }}>
            <LinearGradient
              colors={[COLORS.pinkDark, COLORS.pinkDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.backupBtn}
            >
              <Ionicons name="download-outline" size={18} color="#fff" />
              <Text style={styles.backupBtnText}>Exporter</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={handleImport} style={[styles.restoreBtn, { flex: 1 }]}>
            <Ionicons name="cloud-upload-outline" size={18} color={COLORS.pinkDark} />
            <Text style={styles.restoreBtnText}>Restaurer</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Input hidden pour l'import web */}
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

      {/* MODAL PIN VERIFICATION */}
      {targetProfile && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setTargetProfile(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.pinCard}>
              <Text style={styles.pinTitle}>Code PIN requis</Text>
              <Text style={styles.pinSub}>
                Entrez le code PIN du profil <Text style={{ fontWeight: '800' }}>{targetProfile.name}</Text> :
              </Text>

              <TextInput
                style={styles.pinInput}
                value={pinInput}
                onChangeText={setPinInput}
                placeholder="Ex: 1234"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                secureTextEntry
                maxLength={8}
                autoFocus
              />

              {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

              <Text style={styles.pinHint}>Code par défaut : {targetProfile.defaultPin}</Text>

              <View style={styles.pinButtons}>
                <TouchableOpacity
                  style={styles.pinCancelBtn}
                  onPress={() => setTargetProfile(null)}
                >
                  <Text style={styles.pinCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pinConfirmBtn} onPress={confirmSwitch}>
                  <LinearGradient
                    colors={[COLORS.pinkDark, COLORS.pinkDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pinConfirmGradient}
                  >
                    <Text style={styles.pinConfirmText}>Valider</Text>
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

  // Profile Header Card
  profileHeaderCard: { padding: 16, marginBottom: 16 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 26 },
  profileName: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  profileRole: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  selectTitle: { fontSize: 13, fontWeight: '700', color: COLORS.pinkDark, marginBottom: 10 },
  profilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  chipEmoji: { fontSize: 16, marginRight: 6 },
  chipName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  chipNameActive: { color: '#fff' },

  // Schedule Card
  scheduleCard: { padding: 16, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitleHeader: { fontSize: 15, fontWeight: '800', color: COLORS.pinkDark },
  sectionSubText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  scheduleToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  scheduleName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
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
  totalCount: { fontSize: 13, fontWeight: '700', color: COLORS.pinkDark, marginRight: 16, minWidth: 24, textAlign: 'right' },
  totalPercent: { fontSize: 12, fontWeight: '700', color: COLORS.pinkDark, minWidth: 40, textAlign: 'right' },

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
  backupBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(216, 27, 96, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.25)',
  },
  restoreBtnText: { color: COLORS.pinkDark, fontSize: 14, fontWeight: '700' },

  // PIN Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pinCard: {
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
  pinTitle: { fontSize: 18, fontWeight: '800', color: COLORS.pinkDark, marginBottom: 6 },
  pinSub: { fontSize: 13, color: COLORS.text, textAlign: 'center', marginBottom: 16 },
  pinInput: {
    width: '100%',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
    color: COLORS.text,
    marginBottom: 8,
  },
  errorText: { color: COLORS.danger, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  pinHint: { fontSize: 11, color: COLORS.textMuted, fontStyle: 'italic', marginBottom: 16 },
  pinButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  pinCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    alignItems: 'center',
  },
  pinCancelText: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  pinConfirmBtn: { flex: 1 },
  pinConfirmGradient: {
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  pinConfirmText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
