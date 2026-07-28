import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { TodoContext } from '../ctx/TodoContext';
import { COLORS, SHADOWS } from '../theme';

const ROUTE_TITLES = {
  Tasks: 'Tâches',
  Planning: 'Planning',
  Agenda: 'Calendrier',
  Dashboard: 'Tableau de bord',
};

export default function AppHeader({ routeName }) {
  const insets = useSafeAreaInsets();
  const { tasks, getActiveTasks } = useContext(TodoContext);
  const title = ROUTE_TITLES[routeName] || 'Ma Liste';
  const totalTasks = tasks.length;
  const activeTasksCount = getActiveTasks().length;

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}>
      <BlurView intensity={80} tint="light" style={styles.iosBar}>
        <View style={styles.inner}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.iosPillBadge}>
            <Text style={styles.badgeText}>
              <Text style={styles.badgeHighlight}>{activeTasksCount}</Text> en cours / <Text style={styles.badgeHighlight}>{totalTasks}</Text> total
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  iosBar: {
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    ...SHADOWS.glass,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  iosPillBadge: {
    backgroundColor: 'rgba(216, 27, 96, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.2)',
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  badgeHighlight: { fontWeight: '800', color: COLORS.pinkDark },
});
