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
    allowedProfiles,
    currentProfile,
    isProfileCreated,
    createProfile,
    switchProfile,
    logoutProfile,
    visibleSchedules,
    toggleScheduleVisibility,
    canAccessSchedules,
  } = useContext(ProfileContext);

  const { tasks, folders } = useContext(TodoContext);

  // Sub-tab inside Profile view: 'edt' vs 'stats'
  const [subTab, setSubTab] = useState('stats');

  // Modal State for Create / Switch
  const [selectedTarget, setSelectedTarget] = useState(null); // profile object
  const [modalMode, setModalMode] = useState(null); // 'create' or 'login'
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  const handleProfileClick = (profileObj) => {
    setSelectedTarget(profileObj);
    setPinInput('');
    setPinConfirm('');
    setErrorMsg('');

    if (isProfileCreated(profileObj.id)) {
      setModalMode('login');
    } else {
      setModalMode('create');
    }
  };

  const closeModal = () => {
    setSelectedTarget(null);
    setModalMode(null);
    setPinInput('');
    setPinConfirm('');
    setErrorMsg('');
  };

  const handleModalSubmit = () => {
    if (!selectedTarget) return;

    if (modalMode === 'create') {
      if (!pinInput || pinInput.length < 4) {
        setErrorMsg('Le code PIN doit comporter au moins 4 chiffres.');
        return;
      }
      if (pinInput !== pinConfirm) {
        setErrorMsg('Les deux codes PIN ne correspondent pas.');
        return;
      }

      const res = createProfile(selectedTarget.id, pinInput.trim());
      if (res.success) {
        closeModal();
      } else {
        setErrorMsg(res.error);
      }
    } else if (modalMode === 'login') {
      const res = switchProfile(selectedTarget.id, pinInput.trim());
      if (res.success) {
        closeModal();
      } else {
        setErrorMsg(res.error);
      }
    }
  };

  // Export JSON Backup (Global tasks & folders)
  const handleExport = useCallback(() => {
    const backup = {
      version: 2,
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
      {/* BANNIÈRE PROFIL OU SÉLECTION */}
      {currentProfile ? (
        <GlassCard style={styles.activeProfileCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, { backgroundColor: currentProfile.color }]}>
              <Text style={styles.avatarEmoji}>{currentProfile.avatar}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.profileName}>{currentProfile.name}</Text>
              <Text style={styles.profileRole}>
                {currentProfile.role === 'full'
                  ? 'Accès Emplois du Temps Universitaires'
                  : 'Accès Liste de tâches uniquement'}
              </Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={logoutProfile}>
              <Ionicons name="log-out-outline" size={16} color={COLORS.pinkDark} />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      ) : (
        <GlassCard style={styles.infoBanner}>
          <View style={styles.infoBannerHeader}>
            <Ionicons name="school-outline" size={22} color={COLORS.pinkDark} />
            <Text style={styles.infoBannerTitle}>Accès Emplois du temps universitaires</Text>
          </View>
          <Text style={styles.infoBannerText}>
            Pour accéder aux emplois du temps universitaires et superposer les cours, créez ou rejoignez votre profil (Claire, Alban, Clara ou Marielle) en définissant votre code PIN secret.
          </Text>
        </GlassCard>
      )}

      {/* SÉLECTEUR / CRÉATION DE PROFIL */}
      <GlassCard style={styles.profilesSectionCard}>
        <Text style={styles.sectionTitleHeader}>
          {currentProfile ? 'Changer de profil :' : 'Choisissez ou créez votre profil :'}
        </Text>

        <View style={styles.profilesGrid}>
          {allowedProfiles.map((p) => {
            const isCurrent = currentProfile?.id === p.id;
            const created = isProfileCreated(p.id);

            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.profileCardChip,
                  { borderColor: p.color },
                  isCurrent && { backgroundColor: p.color },
                ]}
                onPress={() => handleProfileClick(p)}
                activeOpacity={0.8}
              >
                <View style={styles.chipTopRow}>
                  <Text style={styles.chipEmoji}>{p.avatar}</Text>
                  <View style={[styles.statusDot, { backgroundColor: created ? '#34c759' : '#8e8e93' }]} />
                </View>

                <Text style={[styles.chipName, isCurrent && styles.chipTextWhite]}>{p.name}</Text>

                <Text style={[styles.chipStatusText, isCurrent && styles.chipTextWhite]}>
                  {created ? (isCurrent ? 'Profil actif' : 'Créé · PIN requis') : 'Non créé · Créer'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassCard>

      {/* SÉLECTEUR DE SOUS-ONGLET (EDT UNIV vs STATS/SAUVEGARDE) */}
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'stats' && styles.subTabBtnActive]}
          onPress={() => setSubTab('stats')}
        >
          <Ionicons name="pie-chart-outline" size={16} color={subTab === 'stats' ? '#fff' : COLORS.text} />
          <Text style={[styles.subTabText, subTab === 'stats' && styles.subTabTextActive]}>
            Stats & Sauvegarde
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, subTab === 'edt' && styles.subTabBtnActive]}
          onPress={() => setSubTab('edt')}
        >
          <Ionicons name="calendar-outline" size={16} color={subTab === 'edt' ? '#fff' : COLORS.text} />
          <Text style={[styles.subTabText, subTab === 'edt' && styles.subTabTextActive]}>
            EDT Universitaires (.ics)
          </Text>
        </TouchableOpacity>
      </View>

      {/* SOUS-ONGLET 1 : STATS & SAUVEGARDE (Visible par tous) */}
      {subTab === 'stats' && (
        <>
          {/* CARD STATISTIQUES DES TÂCHES (Global) */}
          <GlassCard style={styles.chartCard}>
            <Text style={styles.sectionTitleHeader}>Statistiques des tâches</Text>

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

          {/* CARD SAUVEGARDE & RESTAURATION (Global) */}
          <GlassCard style={styles.backupCard}>
            <Text style={styles.sectionTitleHeader}>Sauvegarde / Restauration de vos tâches</Text>
            <Text style={styles.backupSub}>
              {total} tâche{total !== 1 ? 's' : ''} · {folders.length} dossier{folders.length !== 1 ? 's' : ''} en local
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
                  <Text style={styles.backupBtnText}>Exporter JSON</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} onPress={handleImport} style={[styles.restoreBtn, { flex: 1 }]}>
                <Ionicons name="cloud-upload-outline" size={18} color={COLORS.pinkDark} />
                <Text style={styles.restoreBtnText}>Restaurer JSON</Text>
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
        </>
      )}

      {/* SOUS-ONGLET 2 : EMPLOIS DU TEMPS UNIVERSITAIRES (.ICS) */}
      {subTab === 'edt' && (
        <>
          {!currentProfile ? (
            <GlassCard style={styles.restrictedCard}>
              <Ionicons name="lock-closed-outline" size={28} color={COLORS.pinkDark} />
              <Text style={styles.restrictedTitle}>Profil requis</Text>
              <Text style={styles.restrictedText}>
                Veuillez sélectionner ou créer votre profil ci-dessus pour accéder à la vue des emplois du temps universitaires.
              </Text>
            </GlassCard>
          ) : canAccessSchedules ? (
            <GlassCard style={styles.scheduleCard}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="school-outline" size={20} color={COLORS.pinkDark} />
                <Text style={styles.sectionTitleHeader}>Emplois du Temps Universitaires Partagés (.ics)</Text>
              </View>
              <Text style={styles.sectionSubText}>
                Superposez à la volée les emplois du temps universitaires de chacun :
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
                      <View style={[styles.colorIndicator, { backgroundColor: p.color }]} />
                      <Text style={styles.scheduleName}>Emploi du temps universitaire de {p.name}</Text>
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

              <View style={styles.icsNotice}>
                <Ionicons name="cloud-download-outline" size={18} color={COLORS.pinkDark} />
                <Text style={styles.icsNoticeText}>
                  Gestion avancée des fichiers .ICS universitaires en cours d'intégration.
                </Text>
              </View>
            </GlassCard>
          ) : (
            <GlassCard style={styles.restrictedCard}>
              <Ionicons name="lock-closed-outline" size={28} color={COLORS.textMuted} />
              <Text style={styles.restrictedTitle}>Accès restreint</Text>
              <Text style={styles.restrictedText}>
                Le profil Marielle a un accès uniquement réservé à la gestion des tâches. Les emplois du temps universitaires ne sont pas accessibles.
              </Text>
            </GlassCard>
          )}
        </>
      )}

      {/* MODAL SYSTEM (Création vs Connexion) */}
      {selectedTarget && (
        <Modal visible transparent animationType="fade" onRequestClose={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.pinCard}>
              <Text style={styles.pinTitle}>
                {modalMode === 'create'
                  ? `Création du profil ${selectedTarget.name}`
                  : `Connexion au profil ${selectedTarget.name}`}
              </Text>

              <Text style={styles.pinSub}>
                {modalMode === 'create'
                  ? `Définissez votre code PIN secret (min. 4 chiffres). Personne d'autre ne pourra accéder au profil ${selectedTarget.name} sans ce code.`
                  : `Le profil ${selectedTarget.name} est protégé. Entrez le code PIN défini par ${selectedTarget.name} pour y accéder :`}
              </Text>

              {/* Champ PIN 1 */}
              <TextInput
                style={styles.pinInput}
                value={pinInput}
                onChangeText={setPinInput}
                placeholder={modalMode === 'create' ? 'Nouveau code PIN' : 'Code PIN secret'}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                secureTextEntry
                maxLength={8}
                autoFocus
              />

              {/* Champ Confirmation PIN si Création */}
              {modalMode === 'create' && (
                <TextInput
                  style={styles.pinInput}
                  value={pinConfirm}
                  onChangeText={setPinConfirm}
                  placeholder="Confirmer le code PIN"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={8}
                />
              )}

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              <View style={styles.pinButtons}>
                <TouchableOpacity style={styles.pinCancelBtn} onPress={closeModal}>
                  <Text style={styles.pinCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pinConfirmBtn} onPress={handleModalSubmit}>
                  <LinearGradient
                    colors={[COLORS.pinkDark, COLORS.pinkDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pinConfirmGradient}
                  >
                    <Text style={styles.pinConfirmText}>
                      {modalMode === 'create' ? 'Créer le profil' : 'Se connecter'}
                    </Text>
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

  // Info Banner
  infoBanner: { padding: 14, marginBottom: 14, backgroundColor: 'rgba(216, 27, 96, 0.06)' },
  infoBannerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  infoBannerTitle: { fontSize: 14, fontWeight: '800', color: COLORS.pinkDark },
  infoBannerText: { fontSize: 12, color: COLORS.textLight, lineHeight: 18 },

  // Active Profile Card
  activeProfileCard: { padding: 14, marginBottom: 14 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 22 },
  profileName: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  profileRole: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(216, 27, 96, 0.1)',
  },
  logoutText: { fontSize: 11, color: COLORS.pinkDark, fontWeight: '700' },

  // Profiles Grid Section
  profilesSectionCard: { padding: 16, marginBottom: 14 },
  sectionTitleHeader: { fontSize: 15, fontWeight: '800', color: COLORS.pinkDark, marginBottom: 12 },
  profilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  profileCardChip: {
    flex: 1,
    minWidth: 135,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  chipTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  chipEmoji: { fontSize: 22 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  chipName: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  chipStatusText: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },
  chipTextWhite: { color: '#fff' },

  // Sub Tab Navigation
  subTabRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  subTabBtnActive: {
    backgroundColor: COLORS.pinkDark,
    borderColor: COLORS.pinkDark,
  },
  subTabText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  subTabTextActive: { color: '#fff' },

  // Schedule Card
  scheduleCard: { padding: 16, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionSubText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
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

  icsNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(216, 27, 96, 0.06)',
  },
  icsNoticeText: { flex: 1, fontSize: 11, color: COLORS.pinkDark, fontWeight: '600' },

  restrictedCard: { padding: 20, marginBottom: 16, alignItems: 'center', gap: 8 },
  restrictedTitle: { fontSize: 16, fontWeight: '800', color: COLORS.pinkDark },
  restrictedText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },

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
  backupBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
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
  restoreBtnText: { color: COLORS.pinkDark, fontSize: 13, fontWeight: '700' },

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
  pinTitle: { fontSize: 17, fontWeight: '800', color: COLORS.pinkDark, marginBottom: 6, textAlign: 'center' },
  pinSub: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  pinInput: {
    width: '100%',
    backgroundColor: 'rgba(118, 118, 128, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 3,
    color: COLORS.text,
    marginBottom: 10,
  },
  errorText: { color: COLORS.danger, fontSize: 12, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  pinButtons: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 6 },
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
