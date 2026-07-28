import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Background({ children }) {
  return (
    <View style={styles.outerWrapper}>
      <LinearGradient
        colors={['#fff0f5', '#ffe4ec', '#f3e5f5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.appFrame}
      >
        {/* Soft background ambient blobs */}
        <View style={styles.blobPink} />
        <View style={styles.blobPurple} />

        <View style={styles.container}>{children}</View>
      </LinearGradient>
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
    backgroundColor: '#eef0f4',
  },
  appFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  container: { flex: 1, position: 'relative', zIndex: 2 },
  blobPink: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 102, 179, 0.22)',
    top: -60,
    left: -60,
    zIndex: 1,
  },
  blobPurple: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(224, 195, 252, 0.35)',
    bottom: 80,
    right: -50,
    zIndex: 1,
  },
});
