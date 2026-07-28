import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function Background({ children }) {
  return (
    <View style={styles.outerWrapper}>
      <View style={styles.appFrame}>
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
  container: { flex: 1, position: 'relative', zIndex: 2 },
});
