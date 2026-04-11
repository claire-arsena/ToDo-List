import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalContext } from '../ctx/ModalContext';
import { COLORS, SHADOWS } from '../theme';

const TAB_CONFIG = [
  { routeName: 'Agenda', icon: 'calendar-outline', iconActive: 'calendar', label: 'Agenda' },
  { routeName: 'Folders', icon: 'folder-outline', iconActive: 'folder', label: 'Dossiers' },
  { type: 'add' },
  { routeName: 'Tasks', icon: 'list-outline', iconActive: 'list', label: 'Tâches' },
  { routeName: 'Dashboard', icon: 'pie-chart-outline', iconActive: 'pie-chart', label: 'Stats' },
];

export default function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { openModal } = useContext(ModalContext);
  const currentRouteName = state.routes[state.index].name;

  const navigateTo = (routeName) => navigation.navigate(routeName);

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
      <BlurView intensity={70} tint="light" style={styles.pill}>
        <View style={styles.tabBar}>
          {TAB_CONFIG.map((tab, index) => {
            if (tab.type === 'add') {
              return (
                <TouchableOpacity
                  key="add"
                  style={styles.addButtonWrapper}
                  onPress={() => openModal('task')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[COLORS.pinkDark, '#ff3e5c']}
                    style={styles.addButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="add" size={32} color="#fff" />
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
                <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                  <Ionicons
                    name={isActive ? tab.iconActive : tab.icon}
                    size={22}
                    color={isActive ? COLORS.pinkDark : COLORS.textLight}
                  />
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
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
    backgroundColor: 'transparent',
    paddingHorizontal: 30,
    paddingTop: 8,
  },
  pill: {
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    ...SHADOWS.header,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255, 102, 179, 0.15)',
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.pinkDark,
    fontWeight: '700',
  },
  addButtonWrapper: {
    alignItems: 'center',
    paddingBottom: 2,
    marginTop: -20,
    width: 70,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.addBtn,
  },
  addLabel: {
    fontSize: 10,
    color: COLORS.pinkDark,
    marginTop: 4,
    fontWeight: '700',
  },
});
