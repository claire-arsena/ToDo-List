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
      <View style={styles.blobPink} />
      <View style={styles.blobPurple} />
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
    width: width * 0.7, height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(255, 102, 179, 0.5)',
    top: -width * 0.2, left: -width * 0.2,
    opacity: 0.3,
  },
  blobPurple: {
    position: 'absolute',
    width: width * 0.6, height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(224, 195, 252, 0.8)',
    top: height * 0.25, right: -width * 0.25,  // milieu écran, pas en bas
    opacity: 0.35,
  },
  blobHotpink: {
    position: 'absolute',
    width: width * 0.5, height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(255, 20, 147, 0.4)',
    top: height * 0.1, left: width * 0.3,
    opacity: 0.15,
  },
});
