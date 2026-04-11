import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { TodoContext } from '../ctx/TodoContext';
import { COLORS, SHADOWS } from '../theme';

const ROUTE_TITLES = {
  Tasks: 'Liste de tâches',
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
    <View style={{ backgroundColor: 'transparent', paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 8 }}>
      <BlurView intensity={60} tint="light" style={styles.pill}>
        <View style={styles.header}>
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
  pill: {
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    ...SHADOWS.header,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  left: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  stat: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statBold: {
    fontWeight: '700',
    color: COLORS.text,
  },
  statSep: {
    marginHorizontal: 6,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  btnDanger: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.3)',
  },
  btnDangerText: {
    color: COLORS.danger,
  },
});
