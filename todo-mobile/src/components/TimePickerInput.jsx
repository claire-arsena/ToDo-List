import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../theme';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

export default function TimePickerInput({ value, onChange, label, placeholder = '09:00' }) {
  const [showModal, setShowModal] = useState(false);

  const currentTime = value || '09:00';
  const [selectedHour, selectedMinute] = currentTime.split(':');

  const handleSelectTime = (h, m) => {
    onChange(`${h}:${m}`);
  };

  const handleNativeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowModal(false);
      if (event.type !== 'dismissed' && selectedDate) {
        const h = String(selectedDate.getHours()).padStart(2, '0');
        const m = String(selectedDate.getMinutes()).padStart(2, '0');
        onChange(`${h}:${m}`);
      }
    } else if (Platform.OS === 'ios') {
      if (selectedDate) {
        const h = String(selectedDate.getHours()).padStart(2, '0');
        const m = String(selectedDate.getMinutes()).padStart(2, '0');
        onChange(`${h}:${m}`);
      }
    }
  };

  const getDateFromTimeString = (timeStr) => {
    const d = new Date();
    if (timeStr && timeStr.includes(':')) {
      const [h, m] = timeStr.split(':').map(Number);
      d.setHours(h || 9, m || 0, 0, 0);
    }
    return d;
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.valueText : styles.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.icon}>⏰</Text>
      </TouchableOpacity>

      {/* Modal / Selector style Réveil / Alarme */}
      <Modal transparent animationType="slide" visible={showModal} onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir l'heure ({label || 'Heure'})</Text>
              <TouchableOpacity style={styles.doneBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.doneBtnText}>Terminé</Text>
              </TouchableOpacity>
            </View>

            {Platform.OS === 'web' ? (
              <View style={styles.webAlarmPicker}>
                <input
                  type="time"
                  value={value || '09:00'}
                  onChange={(e) => {
                    if (e.target.value) onChange(e.target.value);
                  }}
                  style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: COLORS.pinkDark,
                    backgroundColor: 'rgba(216, 27, 96, 0.08)',
                    border: '1.5px solid rgba(216, 27, 96, 0.3)',
                    borderRadius: '16px',
                    padding: '12px 20px',
                    textAlign: 'center',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />

                <View style={styles.pickerGridContainer}>
                  <View style={styles.pickerColumn}>
                    <Text style={styles.columnLabel}>Heure</Text>
                    <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
                      {HOURS.map((h) => {
                        const active = (selectedHour || '09') === h;
                        return (
                          <TouchableOpacity
                            key={h}
                            style={[styles.timeItem, active && styles.timeItemActive]}
                            onPress={() => handleSelectTime(h, selectedMinute || '00')}
                          >
                            <Text style={[styles.timeItemText, active && styles.timeItemTextActive]}>
                              {h} h
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <Text style={styles.timeSep}>:</Text>

                  <View style={styles.pickerColumn}>
                    <Text style={styles.columnLabel}>Minutes</Text>
                    <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
                      {MINUTES.map((m) => {
                        const active = (selectedMinute || '00') === m;
                        return (
                          <TouchableOpacity
                            key={m}
                            style={[styles.timeItem, active && styles.timeItemActive]}
                            onPress={() => handleSelectTime(selectedHour || '09', m)}
                          >
                            <Text style={[styles.timeItemText, active && styles.timeItemTextActive]}>
                              {m} min
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                <DateTimePicker
                  value={getDateFromTimeString(value)}
                  mode="time"
                  display="spinner"
                  onChange={handleNativeChange}
                  style={{ width: 260, height: 180 }}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: 450,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: COLORS.pinkDark },
  doneBtn: {
    backgroundColor: COLORS.pinkDark,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  doneBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },

  webAlarmPicker: { alignItems: 'center', width: '100%' },
  pickerGridContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    height: 180,
    width: '100%',
  },
  pickerColumn: { flex: 1, height: 180, alignItems: 'center' },
  columnLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, marginBottom: 8 },
  scrollList: { width: '100%', flex: 1 },
  timeItem: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  timeItemActive: {
    backgroundColor: COLORS.pinkDark,
  },
  timeItemText: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  timeItemTextActive: { color: '#ffffff', fontWeight: '900' },
  timeSep: { fontSize: 24, fontWeight: '900', color: COLORS.pinkDark, marginHorizontal: 12 },
});
