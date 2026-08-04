import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TodoContext } from '../ctx/TodoContext';
import { ProfileContext } from '../ctx/ProfileContext';
import { COLORS } from '../theme';

const ROUTE_TITLES = {
  Tasks: 'Tâches',
  Planning: 'Planning',
  Agenda: 'Calendrier',
  Profile: 'Profil',
  Dashboard: 'Tableau de bord',
};

export default function AppHeader({ routeName }) {
  const insets = useSafeAreaInsets();
  const { tasks, getActiveTasks } = useContext(TodoContext);
  const { currentTheme, appMode } = useContext(ProfileContext);

  const title = ROUTE_TITLES[routeName] || 'Ma Liste';
  const totalTasks = tasks.length;
  const activeTasksCount = getActiveTasks().length;

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}>
      <View style={styles.iosBar}>
        <View style={styles.inner}>
          {/* Logo App + Titre */}
          <View style={styles.titleRow}>
            <View style={[styles.logoIconBg, { backgroundColor: currentTheme.tint }]}>
              <Ionicons name="checkbox" size={22} color={currentTheme.primary} />
            </View>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={[styles.modeSubtitle, { color: currentTheme.primary }]}>
                {appMode === 'university' ? 'Mode universitaire' : 'Mode perso'}
              </Text>
            </View>
          </View>

          {/* Badge Compteur Tâches */}
          <View style={[styles.iosPillBadge, { backgroundColor: currentTheme.tint, borderColor: currentTheme.primary + '33' }]}>
            <Text style={styles.badgeText}>
              <Text style={[styles.badgeHighlight, { color: currentTheme.primary }]}>{activeTasksCount}</Text> / <Text style={[styles.badgeHighlight, { color: currentTheme.primary }]}>{totalTasks}</Text>
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
    backgroundColor: '#f8f9fc',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconBg: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1c1c1e',
    letterSpacing: -0.4,
  },
  modeSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: -2,
  },
  iosPillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  badgeHighlight: { fontWeight: '800' },
});
