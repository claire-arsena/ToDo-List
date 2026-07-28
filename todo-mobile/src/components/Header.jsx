import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TodoContext } from '../ctx/TodoContext';
import { COLORS } from '../theme';

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
      <View style={styles.iosBar}>
        <View style={styles.inner}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.iosPillBadge}>
            <Text style={styles.badgeText}>
              <Text style={styles.badgeHighlight}>{activeTasksCount}</Text> en cours / <Text style={styles.badgeHighlight}>{totalTasks}</Text> total
            </Text>
          </View>
        </View>
      </View>
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
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  iosPillBadge: {
    backgroundColor: 'rgba(216, 27, 96, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.2)',
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  badgeHighlight: { fontWeight: '800', color: COLORS.pinkDark },
});
