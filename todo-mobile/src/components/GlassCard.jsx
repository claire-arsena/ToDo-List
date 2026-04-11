import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, SHADOWS } from '../theme';

/**
 * Carte glassmorphism avec vrai blur (expo-blur).
 * Équivalent mobile du `backdrop-filter: blur(28px)` de la version web.
 *
 * Props :
 *   intensity  – force du blur  (défaut 55)
 *   style      – styles supplémentaires appliqués au BlurView
 *   children
 */
export default function GlassCard({ children, style, intensity = 55 }) {
  return (
    <BlurView
      intensity={intensity}
      tint="light"
      style={[styles.card, style]}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',          // obligatoire pour que le borderRadius s'applique
    ...SHADOWS.card,
  },
});
