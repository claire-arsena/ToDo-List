import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { DESKTOP_BREAKPOINT } from '../config/constants';

export default function Background({ children }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <View style={styles.outerWrapper}>
      <View style={[styles.appFrame, isDesktop && styles.appFrameDesktop]}>
        <View style={styles.container}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e5ea',
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    position: 'relative',
    backgroundColor: '#f2f2f7', // Arriere-plan pur iOS
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  // Sur PC, l'app remplit tout l'écran au lieu de rester dans un "cadre
  // téléphone" étroit — plus de plafond de largeur, plus d'ombre de carte.
  appFrameDesktop: {
    maxWidth: '100%',
    shadowOpacity: 0,
    elevation: 0,
  },
  container: { flex: 1, position: 'relative', zIndex: 2 },
});
