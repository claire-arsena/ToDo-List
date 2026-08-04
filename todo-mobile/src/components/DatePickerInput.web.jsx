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
          padding: '11px 14px',
          fontSize: '15px',
          fontWeight: '700',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          fontStyle: 'normal',
          color: value ? '#000000' : COLORS.textMuted,
          backgroundColor: 'rgba(118, 118, 128, 0.08)',
          border: 'none',
          borderRadius: 14,
          minHeight: 44,
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
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
