import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { TodoContext } from '../ctx/TodoContext';
import { COLORS, SHADOWS } from '../theme';

const ROUTE_TITLES = {
  Tasks: 'Tâches',
  Agenda: 'Agenda',
  Folders: 'Dossiers',
  Dashboard: 'Tableau de bord',
};

export default function AppHeader({ routeName }) {
  const insets = useSafeAreaInsets();
  const { resetData, loadBackup, tasks, getActiveTasks } = useContext(TodoContext);
  const title = ROUTE_TITLES[routeName] || 'Ma Liste';
  const totalTasks = tasks.length;
  const activeTasksCount = getActiveTasks().length;

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 12 }]}>
      <BlurView intensity={60} tint="light" style={styles.pill}>
        <View style={styles.inner}>
          <View style={styles.left}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.stats}>
              <Text style={styles.stat}>
                Total : <Text style={styles.statBold}>{totalTasks}</Text>
              </Text>
              <Text style={styles.statSep}>·</Text>
              <Text style={styles.stat}>
                En cours : <Text style={styles.statBold}>{activeTasksCount}</Text>
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.btn} onPress={loadBackup}>
              <Text style={styles.btnText}>Backup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={resetData}>
              <Text style={[styles.btnText, styles.btnDangerText]}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  pill: {
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    ...SHADOWS.glass,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  left: { flex: 1, marginRight: 8 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  stat: { fontSize: 12, color: COLORS.textLight },
  statBold: { fontWeight: '800', color: COLORS.pinkDark },
  statSep: { marginHorizontal: 6, color: COLORS.textMuted },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btnText: { fontSize: 12, fontWeight: '700', color: COLORS.pinkDark },
  btnDanger: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  btnDangerText: { color: '#e74c3c', fontWeight: '700' },
});
