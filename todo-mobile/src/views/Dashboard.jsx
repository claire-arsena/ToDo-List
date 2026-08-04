import React, { useContext, useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, Platform, Alert } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS } from '../config/constants';
import { COLORS, STATUS_COLORS } from '../theme';
import GlassCard from '../components/GlassCard';

const screenWidth = Dimensions.get('window').width;

const CHART_COLORS = {
  [ETATS.NOUVEAU]:    COLORS.statusNew,
  [ETATS.EN_COURS]:   COLORS.statusProgress,
  [ETATS.REUSSI]:     COLORS.statusDone,
  [ETATS.EN_ATTENTE]: COLORS.statusWaiting,
  [ETATS.ABANDONNE]:  COLORS.statusCancelled,
};

const chartConfig = {
  color: (opacity = 1) => `rgba(255, 102, 179, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(38, 38, 38, ${opacity})`,
};

export default function Dashboard() {
  const { tasks, folders } = useContext(TodoContext);
  const fileInputRef = useRef(null);

  // ─── Export : télécharger un fichier JSON de sauvegarde ───
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
      a.download = `ma-liste-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Sauvegarde', 'La sauvegarde a été copiée dans le presse-papiers.');
    }
  }, [tasks, folders]);

  // ─── Import : restaurer depuis un fichier JSON ───
  const handleImport = useCallback(() => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      Alert.alert('Restauration', 'Cette fonction est disponible sur la version web.');
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

      const confirmMsg = `Restaurer ${data.tasks.length} tâche(s) et ${(data.folders || []).length} dossier(s) depuis la sauvegarde du ${data.exportDate ? new Date(data.exportDate).toLocaleDateString('fr-FR') : 'fichier'} ?\n\nAttention : vos données actuelles seront remplacées.`;

      const doRestore = async () => {
        await AsyncStorage.setItem('@todo_tasks_v2', JSON.stringify(data.tasks));
        await AsyncStorage.setItem('@todo_tasks', JSON.stringify(data.tasks));
        if (data.folders) {
          await AsyncStorage.setItem('@todo_folders_v2', JSON.stringify(data.folders));
          await AsyncStorage.setItem('@todo_folders', JSON.stringify(data.folders));
        }
        // Reload pour appliquer
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
      const msg = 'Erreur lors de la lecture du fichier de sauvegarde.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Erreur', msg);
    }

    // Reset file input
    if (e.target) e.target.value = '';
  }, []);

  const chartData = useMemo(() => {
    const counts = {};
    Object.values(ETATS).forEach((s) => { counts[s] = 0; });
    tasks.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });
    return Object.entries(counts)
      .filter(([, c]) => c > 0)
      .map(([status, count]) => ({
        name: status, population: count,
        color: CHART_COLORS[status] || COLORS.pinkLight,
        legendFontColor: COLORS.text, legendFontSize: 13,
      }));
  }, [tasks]);

  const total = tasks.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Boutons Sauvegarder / Restaurer */}
      <GlassCard style={styles.backupCard}>
        <Text style={styles.backupTitle}>Sauvegarde</Text>
        <Text style={styles.backupSub}>{total} tâche{total !== 1 ? 's' : ''} · {folders.length} dossier{folders.length !== 1 ? 's' : ''}</Text>
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

      {/* Hidden file input for web import */}
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

      {total === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>Aucune tâche à afficher</Text></View>
      ) : (
        <>
          {/* chart-container — border-radius: 40px */}
          <GlassCard style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Répartition par statut</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 80}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              hasLegend
              style={styles.chart}
            />
          </GlassCard>

          {/* Tableau détail */}
          <GlassCard style={styles.tableCard}>
            <Text style={styles.sectionTitle}>Détail</Text>
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
          </GlassCard>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, fontStyle: 'italic' },

  // Backup card
  backupCard: { padding: 16, marginBottom: 16 },
  backupTitle: { fontSize: 15, fontWeight: '800', color: COLORS.pinkDark, marginBottom: 2 },
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

  /* chart-container — border-radius: 40px */
  chartCard: { padding: 20, marginBottom: 16, alignItems: 'center', borderRadius: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.pinkDark, marginBottom: 12, alignSelf: 'flex-start' },
  chart: { borderRadius: 16 },
  tableCard: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.4)' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  rowLabel: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  rowCount: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginRight: 16, minWidth: 24, textAlign: 'right' },
  rowPercent: { fontSize: 13, color: COLORS.textMuted, minWidth: 40, textAlign: 'right' },
  totalRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, marginTop: 2 },
  totalLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text, paddingLeft: 22 },
  totalCount: { fontSize: 14, fontWeight: '700', color: COLORS.pinkDark, marginRight: 16, minWidth: 24, textAlign: 'right' },
  totalPercent: { fontSize: 13, fontWeight: '700', color: COLORS.pinkDark, minWidth: 40, textAlign: 'right' },
});
