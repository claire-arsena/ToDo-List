import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalContext } from '../ctx/ModalContext';
import { COLORS, SHADOWS } from '../theme';

const TAB_CONFIG = [
  { routeName: 'Agenda',    icon: 'calendar-outline',  iconActive: 'calendar',   label: 'Agenda' },
  { routeName: 'Folders',   icon: 'folder-outline',    iconActive: 'folder',     label: 'Dossiers' },
  { type: 'add' },
  { routeName: 'Tasks',     icon: 'list-outline',      iconActive: 'list',       label: 'Tâches' },
  { routeName: 'Dashboard', icon: 'pie-chart-outline', iconActive: 'pie-chart',  label: 'Stats' },
];

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { openModal } = useContext(ModalContext);
  const currentRouteName = state.routes[state.index].name;
  const navigateTo = (routeName) => navigation.navigate(routeName);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 15) }]}>
      <BlurView intensity={70} tint="light" style={styles.pill}>
        <View style={styles.row}>
          {TAB_CONFIG.map((tab) => {
            if (tab.type === 'add') {
              return (
                <TouchableOpacity
                  key="add"
                  style={styles.addWrapper}
                  onPress={() => openModal('task')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[COLORS.pinkDark, '#ff5c5c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.addBg}
                  >
                    <Ionicons name="add" size={30} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.addLabel}>Ajouter</Text>
                </TouchableOpacity>
              );
            }

            const isActive = currentRouteName === tab.routeName;
            return (
              <TouchableOpacity
                key={tab.routeName}
                style={styles.tabItem}
                onPress={() => navigateTo(tab.routeName)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                  <Ionicons
                    name={isActive ? tab.iconActive : tab.icon}
                    size={22}
                    color={isActive ? COLORS.pinkDark : COLORS.textLight}
                  />
                </View>
                <Text style={[styles.label, isActive && styles.labelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 15,
    paddingTop: 6,
    backgroundColor: 'transparent',
  },
  pill: {
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    overflow: 'hidden',
    ...SHADOWS.glass,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-evenly',
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabItem: { flex: 1, alignItems: 'center', paddingBottom: 2 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: 'rgba(255,102,179,0.15)' },
  label: { fontSize: 10, color: COLORS.textLight, marginTop: 2, fontWeight: '500' },
  labelActive: { color: COLORS.pinkDark, fontWeight: '700' },
  addWrapper: {
    alignItems: 'center',
    paddingBottom: 2,
    marginTop: -22,
    width: 72,
  },
  addBg: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff66b3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  addLabel: {
    fontSize: 10,
    color: COLORS.pinkDark,
    marginTop: 4,
    fontWeight: '700',
  },
});
