import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ModalContext } from '../ctx/ModalContext';
import { COLORS, SHADOWS } from '../theme';

const LEFT_TABS  = [
  { routeName: 'Agenda',  icon: 'calendar-outline', iconActive: 'calendar', label: 'Agenda' },
  { routeName: 'Folders', icon: 'folder-outline',   iconActive: 'folder',   label: 'Dossiers' },
];
const RIGHT_TABS = [
  { routeName: 'Tasks',     icon: 'list-outline',      iconActive: 'list',      label: 'Tâches' },
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
    <View>
      <View style={styles.outer}>
        {/* Pilule pleine largeur — rendue en premier dans le DOM */}
        <View style={styles.pillClip}>
          <BlurView intensity={70} tint="light" style={styles.pillBlur}>
            <View style={styles.row}>
              {LEFT_TABS.map((t) => <TabItem key={t.routeName} {...t} />)}
              <View style={styles.centerGap} />
              {RIGHT_TABS.map((t) => <TabItem key={t.routeName} {...t} />)}
            </View>
          </BlurView>
        </View>

        {/* Bouton + rendu APRÈS la pilule = au-dessus sur web (DOM order) + position absolue centrée */}
        <View style={styles.addWrap}>
          <TouchableOpacity onPress={() => openModal('task')} activeOpacity={0.85}>
            <LinearGradient
              colors={[COLORS.pinkDark, '#ff5c5c']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.addBg}
            >
              <Ionicons name="add" size={30} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.addLabel}>Ajouter</Text>
        </View>
      </View>

      {/* Remplissage safe area bas — évite le panel rose transparent */}
      {insets.bottom > 0 && (
        <View style={[styles.bottomFill, { height: insets.bottom }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 15,
    paddingTop: 76,    // espace pour le bouton + label (56+3+13=72 + 4 margin)
    backgroundColor: 'transparent',
  },
  /* Bouton + positionné en absolu dans l'espace paddingTop, au-dessus de la pilule */
  addWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    elevation: 20,
  },
  addBg: {
    height: 56,
    width: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.addBtn,
  },
  addLabel: {
    fontSize: 10, color: COLORS.pinkDark,
    marginTop: 3, fontWeight: '700',
  },
  pillClip: {
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    width: '100%',
    ...SHADOWS.glass,
    zIndex: 0,
  },
  pillBlur: { borderRadius: 60 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  centerGap: { width: 64 },
  tabItem: { flex: 1, alignItems: 'center' },
  iconWrap: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: 'rgba(255,102,179,0.15)' },
  label: { fontSize: 10, color: COLORS.textLight, marginTop: 2, fontWeight: '500' },
  labelActive: { color: COLORS.pinkDark, fontWeight: '700' },
  /* Remplissage safe area bas — même teinte glass que la pilule */
  bottomFill: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderTopWidth: 0,
  },
});
