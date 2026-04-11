/**
 * Version web de DatePickerInput.
 * React Native résout automatiquement ce fichier sur la plateforme web
 * grâce à la convention .web.jsx, en évitant @react-native-community/datetimepicker
 * qui n'est pas compatible navigateur.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../theme';

export default function DatePickerInput({
  value,
  onChange,
  label,
  placeholder = 'Choisir une date...',
}) {
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 12px',
          fontSize: 14,
          fontFamily: 'inherit',
          color: value ? '#333' : '#888',
          backgroundColor: 'rgba(255,255,255,0.75)',
          border: '1.5px solid rgba(255,255,255,0.65)',
          borderRadius: 12,
          minHeight: 44,
          outline: 'none',
          cursor: 'pointer',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
});
