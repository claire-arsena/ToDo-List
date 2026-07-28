import React, { useContext, useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { ETATS } from '../../config/constants';
import DatePickerInput from '../DatePickerInput';
import { COLORS, SHADOWS } from '../../theme';

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const EMPTY = {
  title: '',
  description: '',
  startDate: getToday(),
  endDate: getToday(),
  startTime: '09:00',
  endTime: '10:00',
  status: ETATS.NOUVEAU,
};

export default function TaskFormModal() {
  const { addTask, updateTask } = useContext(TodoContext);
  const { isModalOpen, modalType, modalData, closeModal } = useContext(ModalContext);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (modalData && modalType === 'task') {
      setForm({
        title: modalData.title || '',
        description: modalData.description || '',
        startDate: modalData.startDate || modalData.dueDate || getToday(),
        endDate: modalData.endDate || modalData.startDate || modalData.dueDate || getToday(),
        startTime: modalData.startTime || '09:00',
        endTime: modalData.endTime || '10:00',
        status: modalData.status || ETATS.NOUVEAU,
      });
    } else {
      setForm({ ...EMPTY, startDate: getToday(), endDate: getToday() });
    }
  }, [modalData, modalType]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      endDate: form.endDate || form.startDate,
      startTime: form.startTime,
      endTime: form.endTime,
      dueDate: form.endDate || form.startDate,
      status: form.status,
    };
    modalData ? updateTask(modalData.id, payload) : addTask(payload);
    closeModal();
  };

  if (!isModalOpen || modalType !== 'task') return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={closeModal}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeModal} />

        <BlurView intensity={60} tint="light" style={styles.sheet}>
          <View style={styles.sheetInner}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalData ? 'Modifier la tâche' : 'Créer une tâche'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titre *</Text>
                <TextInput
                  style={styles.input}
                  value={form.title}
                  onChangeText={(v) => set('title', v)}
                  placeholder="Ex : Rédaction du rapport, Projet React..."
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={form.description}
                  onChangeText={(v) => set('description', v)}
                  placeholder="Détails optionnels..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Dates de début et fin pour tâches multi-jours */}
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <DatePickerInput
                    label="Date de début"
                    value={form.startDate}
                    onChange={(v) => set('startDate', v)}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <DatePickerInput
                    label="Date de fin"
                    value={form.endDate}
                    onChange={(v) => set('endDate', v)}
                  />
                </View>
              </View>

              {/* Heures de début et fin */}
              <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Heure début</Text>
                  <TextInput
                    style={styles.input}
                    value={form.startTime}
                    onChangeText={(v) => set('startTime', v)}
                    placeholder="09:00"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Heure fin</Text>
                  <TextInput
                    style={styles.input}
                    value={form.endTime}
                    onChangeText={(v) => set('endTime', v)}
                    placeholder="17:00"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Statut</Text>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={form.status} onValueChange={(v) => set('status', v)} style={styles.picker}>
                    {Object.values(ETATS).map((s) => (
                      <Picker.Item key={s} label={s} value={s} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity style={styles.btnSecondary} onPress={closeModal}>
                  <Text style={styles.btnSecondaryText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, !form.title.trim() && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={!form.title.trim()}
                >
                  <LinearGradient
                    colors={[COLORS.pinkDark, COLORS.red]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.btnPrimary}
                  >
                    <Text style={styles.btnPrimaryText}>{modalData ? 'Enregistrer' : 'Créer la tâche'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    maxHeight: '90%',
    overflow: 'hidden',
    ...SHADOWS.glass,
  },
  sheetInner: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.pinkDark },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 14, color: COLORS.text, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formGroup: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    minHeight: 44,
  },
  textarea: { minHeight: 80, paddingTop: 10 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  picker: { height: Platform.OS === 'ios' ? 150 : 50, color: COLORS.text },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  submitBtn: { flex: 1 },
  btnPrimary: {
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center',
    elevation: 6,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btnSecondaryText: { color: COLORS.pinkDark, fontWeight: '700', fontSize: 15 },
});
