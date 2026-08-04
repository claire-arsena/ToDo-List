import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalContext } from '../ctx/ModalContext';
import { ProfileContext } from '../ctx/ProfileContext';
import { COLORS } from '../theme';

const LEFT_TABS = [
  { routeName: 'Tasks', icon: 'checkbox-outline', iconActive: 'checkbox', label: 'Tâches' },
  { routeName: 'Planning', icon: 'time-outline', iconActive: 'time', label: 'Planning' },
];
const RIGHT_TABS = [
  { routeName: 'Agenda', icon: 'calendar-outline', iconActive: 'calendar', label: 'Calendrier' },
  { routeName: 'Profile', icon: 'person-outline', iconActive: 'person', label: 'Profil' },
];

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { openModal } = useContext(ModalContext);
  const { currentTheme } = useContext(ProfileContext);
  const currentRoute = state.routes[state.index].name;
  const go = (name) => navigation.navigate(name);

  const TabItem = ({ routeName, icon, iconActive, label }) => {
    const active = currentRoute === routeName;

    return (
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => go(routeName)}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name={active ? iconActive : icon}
            size={22}
            color={active ? currentTheme.primary : COLORS.textMuted}
          />
        </View>
        <Text style={[styles.label, active && { color: currentTheme.primary, fontWeight: '800' }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom + 8, 12) }]}>
      <View style={styles.container}>
        <View style={styles.pillClip}>
          <View style={styles.row}>
            {LEFT_TABS.map((t) => <TabItem key={t.routeName} {...t} />)}

            {/* Central Action Button */}
            <TouchableOpacity
              style={styles.addTabItem}
              onPress={() => openModal('task')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[currentTheme.primary, currentTheme.deep]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.addBtnCircle}
              >
                <Ionicons name="add" size={24} color="#ffffff" />
              </LinearGradient>
              <Text style={[styles.addLabel, { color: currentTheme.primary }]}>Ajouter</Text>
            </TouchableOpacity>

            {RIGHT_TABS.map((t) => <TabItem key={t.routeName} {...t} />)}
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
    paddingTop: 8,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 500,
  },
  pillClip: {
    borderRadius: 36,
    backgroundColor: '#f8f9fc',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },
  labelActive: { color: COLORS.pinkDark, fontWeight: '800' },

  addTabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  addBtnCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.pinkDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  addLabel: { fontSize: 10, color: COLORS.pinkDark, marginTop: 2, fontWeight: '800' },
});
