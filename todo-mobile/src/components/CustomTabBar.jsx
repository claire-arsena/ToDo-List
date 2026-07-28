import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalContext } from '../ctx/ModalContext';
import { COLORS, SHADOWS } from '../theme';

const LEFT_TABS = [
  { routeName: 'Tasks', icon: 'checkbox-outline', iconActive: 'checkbox', label: 'Tâches' },
  { routeName: 'Planning', icon: 'time-outline', iconActive: 'time', label: 'Planning' },
];
const RIGHT_TABS = [
  { routeName: 'Agenda', icon: 'calendar-outline', iconActive: 'calendar', label: 'Agenda' },
  { routeName: 'Dashboard', icon: 'pie-chart-outline', iconActive: 'pie-chart', label: 'Stats' },
];

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { openModal } = useContext(ModalContext);
  const currentRoute = state.routes[state.index].name;
  const go = (name) => navigation.navigate(name);

  const TabItem = ({ routeName, icon, iconActive, label }) => {
    const active = currentRoute === routeName;
    return (
      <TouchableOpacity style={styles.tabItem} onPress={() => go(routeName)} activeOpacity={0.7}>
        <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
          <Ionicons name={active ? iconActive : icon} size={22} color={active ? COLORS.pinkDark : COLORS.textLight} />
        </View>
        <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom + 8, 12) }]}>
      <View style={styles.container}>
        <View style={styles.pillClip}>
          <BlurView intensity={80} tint="light" style={styles.pillBlur}>
            <View style={styles.row}>
              {LEFT_TABS.map((t) => <TabItem key={t.routeName} {...t} />)}
              <View style={styles.centerGap} />
              {RIGHT_TABS.map((t) => <TabItem key={t.routeName} {...t} />)}
            </View>
          </BlurView>
        </View>

        {/* Bouton + flottant propre centré sur le haut de la pilule */}
        <TouchableOpacity
          style={styles.addWrap}
          onPress={() => openModal('task')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.pinkDark, '#ff477e']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.addBg}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 500,
    position: 'relative',
  },
  pillClip: {
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.75)',
    ...SHADOWS.glass,
  },
  pillBlur: { borderRadius: 36 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  centerGap: { width: 52 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: 'rgba(255,102,179,0.18)' },
  label: { fontSize: 10, color: COLORS.textLight, marginTop: 2, fontWeight: '600' },
  labelActive: { color: COLORS.pinkDark, fontWeight: '800' },
  addWrap: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -26,
    zIndex: 30,
    elevation: 10,
  },
  addBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff66b3',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});
