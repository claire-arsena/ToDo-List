import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../theme';

const formatLocalYMD = (selectedDate) => {
  if (!selectedDate) return '';
  const y = selectedDate.getFullYear();
  const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const d = String(selectedDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function DatePickerInput({ value, onChange, label, placeholder = 'Choisir une date...' }) {
  const [show, setShow] = useState(false);

  const date = value ? new Date(value + 'T12:00:00') : new Date();

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type !== 'dismissed' && selectedDate) {
        onChange(formatLocalYMD(selectedDate));
      }
    } else {
      if (selectedDate) {
        onChange(formatLocalYMD(selectedDate));
      }
    }
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)} activeOpacity={0.7}>
        <Text style={value ? styles.valueText : styles.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {Platform.OS === 'web' ? (
        <Modal transparent animationType="fade" visible={show} onRequestClose={() => setShow(false)}>
          <TouchableOpacity style={styles.iosOverlay} activeOpacity={1} onPress={() => setShow(false)}>
            <View style={styles.iosSheet} onStartShouldSetResponder={() => true}>
              <View style={styles.iosHeader}>
                <Text style={styles.modalTitle}>Date</Text>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.iosDone}>Terminé</Text>
                </TouchableOpacity>
              </View>

              <View style={{ padding: 20, alignItems: 'center' }}>
                <input
                  type="date"
                  value={value || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      onChange(e.target.value);
                    }
                  }}
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: COLORS.pinkDark,
                    backgroundColor: 'rgba(216, 27, 96, 0.08)',
                    border: '1.5px solid rgba(216, 27, 96, 0.3)',
                    borderRadius: '14px',
                    padding: '12px 18px',
                    textAlign: 'center',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      ) : Platform.OS === 'ios' ? (
        <Modal transparent animationType="slide" visible={show}>
          <View style={styles.iosOverlay}>
            <View style={styles.iosSheet}>
              <View style={styles.iosHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.iosDone}>Terminé</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleChange}
                locale="fr-FR"
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(118, 118, 128, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    minHeight: 44,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  placeholder: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  icon: {
    fontSize: 16,
  },
  iosOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  iosSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.pinkDark },
  iosDone: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.pinkDark,
  },
  iosPicker: {
    height: 200,
  },
});
