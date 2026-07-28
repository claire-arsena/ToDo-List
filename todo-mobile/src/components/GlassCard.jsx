import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Carte iOS Blanc Cassé (#f8f9fc) avec ombres prononcées et bordure neutre.
 */
export default function GlassCard({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
});
