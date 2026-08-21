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

const VISIBILITY_OPTIONS = [
  { key: 'perso', label: 'Perso' },
  { key: 'univ', label: 'Univ' },
  { key: 'both', label: 'Les deux' },
];

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function ProfileView() {
  const {
    allowedProfiles,
    currentProfile,
    isProfileRegistered,
    registerProfile,
    loginProfile,
    logoutProfile,
    appMode,
    toggleAppMode,
    currentTheme,
    themeKey,
    changeTheme,
    visibleSchedules,
    toggleScheduleVisibility,
    canAccessSchedules,
  } = useContext(ProfileContext);

  const { tasks, folders, updateFolder } = useContext(TodoContext);
  const fileInputRef = useRef(null);

  // Active Sub-modal state: null | 'preferences' | 'stats' | 'backup'
  const [activeModal, setActiveModal] = useState(null);
  const [showFolderVisibility, setShowFolderVisibility] = useState(false);

  // PIN Authentication / Profile Registration Modal State
  const [targetProfile, setTargetProfile] = useState(null);
  const [authMode, setAuthMode] = useState(null); // 'register' or 'login'
  const [pinInput, setPinInput] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  const handleProfileClick = (profileObj) => {
    setTargetProfile(profileObj);
    setPinInput('');
    setPinConfirm('');
    setPinError('');

    if (isProfileRegistered(profileObj.id)) {
      setAuthMode('login');
    } else {
      setAuthMode('register');
    }
  };

  const closeAuthModal = () => {
    setTargetProfile(null);
    setAuthMode(null);
    setPinInput('');
    setPinConfirm('');
    setPinError('');
  };

  const handleAuthSubmit = async () => {
    if (!targetProfile) return;

    if (authMode === 'register') {
      if (!pinInput || pinInput.length < 4) {
        setPinError('Le code PIN doit comporter au moins 4 chiffres.');
        return;
      }
      if (pinInput !== pinConfirm) {
        setPinError('Les deux codes PIN ne correspondent pas.');
        return;
      }

      const res = await registerProfile(targetProfile.id, pinInput.trim());
      if (res.success) {
        closeAuthModal();
      } else {
        setPinError(res.error);
      }
    } else if (authMode === 'login') {
      if (!pinInput) {
        setPinError('Veuillez entrer votre code PIN secret.');
        return;
      }

      const res = await loginProfile(targetProfile.id, pinInput.trim());
      if (res.success) {
        closeAuthModal();
      } else {
        setPinError(res.error);
      }
    }
  };

  // Export JSON Backup
  const handleExport = useCallback(() => {
    const backup = {
      version: 6,
      profileId: currentProfile?.id || 'global',
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
  }, [tasks, folders, currentProfile]);

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
        const key = currentProfile ? `@todo_tasks_profile_${currentProfile.id}` : '@todo_tasks_v2';
        await AsyncStorage.setItem(key, JSON.stringify(data.tasks));
        await AsyncStorage.setItem('@todo_tasks_v2', JSON.stringify(data.tasks));
        if (data.folders) {
          const fKey = currentProfile ? `@todo_folders_profile_${currentProfile.id}` : '@todo_folders_v2';
          await AsyncStorage.setItem(fKey, JSON.stringify(data.folders));
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
  }, [currentProfile]);

  // Advanced Stats Computations
  const stats = useMemo(() => {
    const total = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === ETATS.REUSSI);
    const completed = completedTasks.length;
    const inProgress = tasks.filter((t) => t.status === ETATS.EN_COURS).length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // 1. Tendance vs semaine passée
    let thisWeekCount = 0;
    let lastWeekCount = 0;

    tasks.forEach((t) => {
      if (t.status === ETATS.REUSSI) {
        const dateStr = t.endDate || t.dueDate || t.startDate || t.creationDate;
        if (dateStr) {
          const [y, m, d] = dateStr.split('-').map(Number);
          const taskDate = new Date(y, m - 1, d);
          const diffDays = Math.floor((now - taskDate) / oneDayMs);
          if (diffDays >= 0 && diffDays < 7) {
            thisWeekCount++;
          } else if (diffDays >= 7 && diffDays < 14) {
            lastWeekCount++;
          }
        }
      }
    });

    let weekTrendPct = 0;
    let weekTrendText = 'Pas encore assez de recul';
    if (lastWeekCount > 0) {
      weekTrendPct = Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);
      weekTrendText = weekTrendPct >= 0 ? `+${weekTrendPct}% vs semaine passée 🚀` : `${weekTrendPct}% vs semaine passée 📉`;
    } else if (thisWeekCount > 0) {
      weekTrendText = `${thisWeekCount} tâche${thisWeekCount > 1 ? 's' : ''} cette semaine 🔥`;
    }

    // 2. Jour le plus productif
    const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    completedTasks.forEach((t) => {
      const dateStr = t.endDate || t.dueDate || t.startDate || t.creationDate;
      if (dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        const dayIdx = new Date(y, m - 1, d).getDay();
        dayCounts[dayIdx] = (dayCounts[dayIdx] || 0) + 1;
      }
    });

    let bestDayIdx = -1;
    let maxDayCount = 0;
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        bestDayIdx = parseInt(day, 10);
      }
    });
    const bestDayName = bestDayIdx >= 0 ? DAYS_FR[bestDayIdx] : 'Aucune donnée';

    // 3. Taux de réussite des checklists (sous-tâches)
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    tasks.forEach((t) => {
      if (t.subtasks && t.subtasks.length > 0) {
        totalSubtasks += t.subtasks.length;
        completedSubtasks += t.subtasks.filter((st) => st.isDone).length;
      }
    });
    const checklistSuccessRate = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // 4. Mois le plus productif
    const monthCounts = {};
    completedTasks.forEach((t) => {
      const dateStr = t.endDate || t.dueDate || t.startDate || t.creationDate;
      if (dateStr) {
        const [y, m] = dateStr.split('-');
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
      weekTrendText,
      bestDayName,
      maxDayCount,
      totalSubtasks,
      completedSubtasks,
      checklistSuccessRate,
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
      {/* 1. SELECTION / PROFIL ACTIF */}
      {currentProfile ? (
        <GlassCard style={styles.activeProfileCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarCircle, { backgroundColor: currentTheme.primary }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.profileName}>{currentProfile.name}</Text>
              <Text style={styles.profileRole}>
                Profil authentifié avec code PIN · {currentProfile.role === 'full' ? 'Accès EDT complet' : 'Accès Tâches uniquement'}
              </Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={logoutProfile}>
              <Ionicons name="lock-closed-outline" size={16} color={currentTheme.primary} />
              <Text style={[styles.logoutText, { color: currentTheme.primary }]}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      ) : (
        <GlassCard style={styles.deviceSelectionCard}>
          <View style={styles.warningBox}>
            <Ionicons name="shield-checkmark-outline" size={22} color={currentTheme.primary} />
            <Text style={[styles.warningTitle, { color: currentTheme.primary }]}>Authentification Sécurisée par Code PIN</Text>
          </View>
          <Text style={styles.warningText}>
            Pour accéder à votre espace personnel et à vos emplois du temps universitaires, sélectionnez votre prénom ci-dessous. Si votre profil est déjà créé, votre code PIN secret vous sera demandé. Sinon, vous pourrez définir votre propre code PIN.
          </Text>

          <Text style={styles.selectLabel}>Sélectionnez votre profil :</Text>

          <View style={styles.profilesGrid}>
            {allowedProfiles.map((p) => {
              const isReg = isProfileRegistered(p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.profileChoiceChip, { borderColor: p.defaultColor }]}
                  onPress={() => handleProfileClick(p)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={isReg ? "lock-closed" : "person-add-outline"} size={18} color={p.defaultColor} />
                  <View>
                    <Text style={styles.choiceName}>{p.name}</Text>
                    <Text style={styles.choiceStatus}>{isReg ? 'PIN requis' : 'Créer profil'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
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
              {appMode === 'university' ? 'Mode universitaire' : 'Mode perso'}
            </Text>
            <Text style={styles.modeSub}>
              {appMode === 'university'
                ? 'Planning et Calendrier affichent les cours universitaires. L\'onglet Tâches est ciblé sur les devoirs d\'études.'
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
                ? 'Basculer en Mode perso'
                : 'Basculer en Mode universitaire'}
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

              {/* Visibilité des dossiers selon le mode perso / universitaire */}
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity
                  style={styles.subSettingRow}
                  onPress={() => setShowFolderVisibility(true)}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalSectionLabel}>Visibilité des dossiers</Text>
                    <Text style={styles.modalSectionSub}>
                      Choisissez dans quel mode chaque dossier doit apparaître
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Superposition des emplois du temps (visible si Mode universitaire) */}
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

      {/* SOUS-MODAL : VISIBILITÉ DES DOSSIERS */}
      <Modal visible={showFolderVisibility} transparent animationType="slide" onRequestClose={() => setShowFolderVisibility(false)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <Ionicons name="folder-outline" size={22} color={currentTheme.primary} />
              <Text style={[styles.modalHeaderTitle, { color: currentTheme.primary }]}>Visibilité des dossiers</Text>
              <TouchableOpacity onPress={() => setShowFolderVisibility(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSectionSub}>
              Choisissez dans quel mode chaque dossier doit apparaître :
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420, marginTop: 8 }}>
              {folders.length === 0 ? (
                <Text style={styles.restrictedText}>Aucun dossier pour le moment.</Text>
              ) : (
                folders.map((f) => {
                  const currentVisibility = f.visibility || 'both';
                  return (
                    <View key={f.id} style={styles.folderVisibilityRow}>
                      <View style={styles.folderVisibilityLabelRow}>
                        <View style={[styles.colorIndicator, { backgroundColor: f.color }]} />
                        <Text style={styles.scheduleName} numberOfLines={1}>{f.title}</Text>
                      </View>
                      <View style={styles.visibilitySegmented}>
                        {VISIBILITY_OPTIONS.map((opt) => {
                          const isActive = currentVisibility === opt.key;
                          return (
                            <TouchableOpacity
                              key={opt.key}
                              style={[
                                styles.visibilitySegmentBtn,
                                isActive && { backgroundColor: currentTheme.primary },
                              ]}
                              onPress={() => updateFolder(f.id, { visibility: opt.key })}
                              activeOpacity={0.75}
                            >
                              <Text
                                style={[
                                  styles.visibilitySegmentText,
                                  isActive && styles.textWhite,
                                ]}
                              >
                                {opt.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })
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

              {/* Cartes statistiques cool */}
              <View style={styles.kpiFullCard}>
                <Ionicons name="trending-up" size={20} color={currentTheme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.kpiFullTitle}>Tendance Semaine</Text>
                  <Text style={styles.kpiFullSub}>{stats.weekTrendText}</Text>
                </View>
              </View>

              <View style={styles.kpiFullCard}>
                <Ionicons name="calendar-outline" size={20} color={currentTheme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.kpiFullTitle}>Jour le plus efficace</Text>
                  <Text style={styles.kpiFullSub}>
                    {stats.bestDayName} {stats.maxDayCount > 0 ? `(${stats.maxDayCount} tâches terminées)` : ''}
                  </Text>
                </View>
              </View>

              {stats.totalSubtasks > 0 && (
                <View style={styles.kpiFullCard}>
                  <Ionicons name="checkbox-outline" size={20} color={currentTheme.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.kpiFullTitle}>Accomplissement Checklists</Text>
                    <Text style={styles.kpiFullSub}>
                      {stats.checklistSuccessRate}% des sous-tâches validées ({stats.completedSubtasks}/{stats.totalSubtasks})
                    </Text>
                  </View>
                </View>
              )}

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
              <Text style={styles.modalSectionLabel}>Données enregistrées</Text>
              <Text style={styles.backupSubModal}>
                {stats.total} tâche{stats.total !== 1 ? 's' : ''} · {folders.length} dossier{folders.length !== 1 ? 's' : ''} associés au profil {currentProfile ? currentProfile.name : 'actuel'}.
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

      {/* MODAL DE SÉCURITÉ CODE PIN (Connexion vs Création) */}
      {targetProfile && (
        <Modal visible transparent animationType="fade" onRequestClose={closeAuthModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.pinCard}>
              <Ionicons name="shield-checkmark" size={36} color={currentTheme.primary} style={{ marginBottom: 6 }} />
              <Text style={styles.pinTitle}>
                {authMode === 'register'
                  ? `Création du profil ${targetProfile.name}`
                  : `Connexion au profil ${targetProfile.name}`}
              </Text>

              <Text style={styles.pinSub}>
                {authMode === 'register'
                  ? `Définissez votre code PIN secret (min. 4 chiffres). Ce code vous sera demandé pour vous connecter sur tout autre appareil.`
                  : `Le profil ${targetProfile.name} est protégé par votre code PIN secret. Entrez votre code PIN pour y accéder :`}
              </Text>

              {/* Champ PIN 1 */}
              <TextInput
                style={styles.pinInput}
                value={pinInput}
                onChangeText={setPinInput}
                placeholder={authMode === 'register' ? 'Nouveau code PIN (ex: 1234)' : 'Code PIN secret'}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                secureTextEntry
                maxLength={8}
                autoFocus
              />

              {/* Champ Confirmation PIN si Création */}
              {authMode === 'register' && (
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

              {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

              <View style={styles.pinButtons}>
                <TouchableOpacity style={styles.pinCancelBtn} onPress={closeAuthModal}>
                  <Text style={styles.pinCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pinConfirmBtn} onPress={handleAuthSubmit}>
                  <LinearGradient
                    colors={[currentTheme.primary, currentTheme.deep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pinConfirmGradient}
                  >
                    <Text style={styles.pinConfirmText}>
                      {authMode === 'register' ? 'Créer le profil' : 'Se connecter'}
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  logoutText: { fontSize: 11, fontWeight: '700' },

  // Device Selection Card
  deviceSelectionCard: { padding: 16, marginBottom: 16 },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  warningTitle: { fontSize: 15, fontWeight: '800' },
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
  choiceStatus: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },

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

  subSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  folderVisibilityRow: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  folderVisibilityLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  visibilitySegmented: {
    flexDirection: 'row',
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  visibilitySegmentBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  visibilitySegmentText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },

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

  // PIN Modal
  pinCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  pinTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 6, textAlign: 'center' },
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
    marginBottom: 8,
  },
  errorText: { color: COLORS.danger, fontSize: 12, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
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
