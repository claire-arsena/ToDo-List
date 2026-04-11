import React, { useContext, useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { COLORS, SHADOWS } from '../../theme';

const EMPTY = { title: '', description: '' };

export default function FolderFormModal() {
  const { addFolder, updateFolder } = useContext(TodoContext);
  const { isModalOpen, modalType, modalData, closeModal } = useContext(ModalContext);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (modalData && modalType === 'folder') {
      setForm({ title: modalData.title || '', description: modalData.description || '' });
    } else {
      setForm(EMPTY);
    }
  }, [modalData, modalType]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    modalData ? updateFolder(modalData.id, form) : addFolder(form);
    closeModal();
  };

  if (!isModalOpen || modalType !== 'folder') return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={closeModal}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeModal} />
        <BlurView intensity={60} tint="light" style={styles.sheet}>
          <View style={styles.sheetInner}>
            <View style={styles.header}>
              <Text style={styles.title}>{modalData ? 'Modifier le dossier' : 'Créer un dossier'}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.body}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom du dossier *</Text>
                <TextInput style={styles.input} value={form.title} onChangeText={(v) => set('title', v)} placeholder="Ex : Personnel, Travail..." placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.input, styles.textarea]} value={form.description} onChangeText={(v) => set('description', v)} placeholder="Description optionnelle" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={3} textAlignVertical="top" />
              </View>
              <View style={styles.buttons}>
                <TouchableOpacity style={styles.btnSecondary} onPress={closeModal}>
                  <Text style={styles.btnSecondaryText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitBtn, !form.title.trim() && styles.disabled]} onPress={handleSubmit} disabled={!form.title.trim()}>
                  <LinearGradient colors={[COLORS.pinkDark, COLORS.red]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnPrimary}>
                    <Text style={styles.btnPrimaryText}>{modalData ? 'Enregistrer' : 'Créer le dossier'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
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
    overflow: 'hidden',
    ...SHADOWS.glass,
  },
  sheetInner: { backgroundColor: 'rgba(255,255,255,0.5)' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.5)',
  },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.pinkDark },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 14, color: COLORS.text, fontWeight: '700' },
  body: { padding: 20, paddingBottom: 40 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontWeight: '700', color: COLORS.text, minHeight: 46,
  },
  textarea: { minHeight: 90, paddingTop: 12 },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  submitBtn: { flex: 1 },
  btnPrimary: {
    borderRadius: 50, paddingVertical: 13, alignItems: 'center',
    shadowColor: '#ff66b3', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 6,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.5 },
  btnSecondary: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 50,
    paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
  },
  btnSecondaryText: { color: COLORS.pinkDark, fontWeight: '700', fontSize: 15 },
});
