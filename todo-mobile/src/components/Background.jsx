import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Background({ children }) {
  return (
    <LinearGradient
      colors={['#ffd5df', '#ffb3d9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* blob pink — top left */}
      <View style={styles.blobPink} />
      {/* blob purple — bottom right */}
      <View style={styles.blobPurple} />
      {/* blob hotpink — centre */}
      <View style={styles.blobHotpink} />
      <View style={styles.container}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  blobPink: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255, 102, 179, 0.8)',
    top: -width * 0.2,
    left: -width * 0.2,
    opacity: 0.35,
  },
  blobPurple: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(224, 195, 252, 0.8)',
    bottom: -height * 0.15,
    right: -width * 0.1,
    opacity: 0.45,
  },
  blobHotpink: {
    position: 'absolute',
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    backgroundColor: 'rgba(255, 20, 147, 0.6)',
    top: height * 0.25,
    left: width * 0.35,
    opacity: 0.2,
  },
});
