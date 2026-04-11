import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SHADOWS } from '../theme';

/**
 * Carte glassmorphism — équivalent du glass-bg + blur(28px) du web.
 * Props : intensity (défaut 55), style, children.
 */
export default function GlassCard({ children, style, intensity = 55 }) {
  return (
    <BlurView intensity={intensity} tint="light" style={[styles.card, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 0,
    overflow: 'hidden',
    ...SHADOWS.glass,
  },
});
