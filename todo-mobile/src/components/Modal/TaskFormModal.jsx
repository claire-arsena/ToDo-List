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

const EMPTY = { title: '', description: '', dueDate: '', status: ETATS.NOUVEAU, membersInput: '', folderId: '' };

export default function TaskFormModal() {
  const { addTask, updateTask, folders, relations } = useContext(TodoContext);
  const { isModalOpen, modalType, modalData, closeModal } = useContext(ModalContext);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (modalData && modalType === 'task') {
      const rel = relations.find((r) => r.taskId === modalData.id);
      setForm({
        title: modalData.title || '',
        description: modalData.description || '',
        dueDate: modalData.dueDate || '',
        status: modalData.status || ETATS.NOUVEAU,
        membersInput: modalData.members ? modalData.members.map((m) => m.name).join(', ') : '',
        folderId: rel ? rel.folderId.toString() : '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [modalData, modalType, relations]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const members = form.membersInput.split(',').map((n) => ({ name: n.trim() })).filter((o) => o.name);
    const payload = { title: form.title, description: form.description, dueDate: form.dueDate, status: form.status, members };
    modalData ? updateTask(modalData.id, payload, form.folderId) : addTask(payload, form.folderId);
    closeModal();
  };

  if (!isModalOpen || modalType !== 'task') return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={closeModal}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* backdrop avec blur — .modal-backdrop */}
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeModal} />

        {/* modal-content — glass */}
        <BlurView intensity={60} tint="light" style={styles.sheet}>
          <View style={styles.sheetInner}>
            {/* header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalData ? 'Modifier la tâche' : 'Créer une tâche'}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titre *</Text>
                <TextInput style={styles.input} value={form.title} onChangeText={(v) => set('title', v)} placeholder="Titre de la tâche" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={(v) => set('description', v)} placeholder="Description optionnelle" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={4} textAlignVertical="top" />
              </View>
              <View style={styles.formGroup}>
                <DatePickerInput label="Date d'échéance" value={form.dueDate} onChange={(v) => set('dueDate', v)} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Dossier</Text>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={form.folderId} onValueChange={(v) => set('folderId', v)} style={styles.picker}>
                    <Picker.Item label="Aucun dossier" value="" />
                    {folders.map((f) => <Picker.Item key={f.id} label={f.title} value={f.id.toString()} />)}
                  </Picker>
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Équipiers (séparés par des virgules)</Text>
                <TextInput style={styles.input} value={form.membersInput} onChangeText={(v) => set('membersInput', v)} placeholder="Ex : Paul, Marie, Bob" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Statut</Text>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={form.status} onValueChange={(v) => set('status', v)} style={styles.picker}>
                    {Object.values(ETATS).map((s) => <Picker.Item key={s} label={s} value={s} />)}
                  </Picker>
                </View>
              </View>

              {/* boutons — .form-buttons */}
              <View style={styles.buttons}>
                <TouchableOpacity style={styles.btnSecondary} onPress={closeModal}>
                  <Text style={styles.btnSecondaryText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitBtn, !form.title.trim() && styles.btnDisabled]} onPress={handleSubmit} disabled={!form.title.trim()}>
                  <LinearGradient colors={[COLORS.pinkDark, COLORS.red]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnPrimary}>
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
  /* modal-content glass */
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
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 14, color: COLORS.text, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  /* form-group input */
  input: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    minHeight: 46,
  },
  textarea: { minHeight: 100, paddingTop: 12 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  picker: { height: Platform.OS === 'ios' ? 150 : 50, color: COLORS.text },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  submitBtn: { flex: 1 },
  btnPrimary: {
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: '#ff66b3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
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
