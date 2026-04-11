import React, { useContext, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { COLORS, RADIUS, SHADOWS } from '../../theme';

const EMPTY_FORM = { title: '', description: '' };

export default function FolderFormModal() {
  const { addFolder, updateFolder } = useContext(TodoContext);
  const { isModalOpen, modalType, modalData, closeModal } = useContext(ModalContext);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (modalData && modalType === 'folder') {
      setFormData({ title: modalData.title || '', description: modalData.description || '' });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [modalData, modalType]);

  const set = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    if (modalData) {
      updateFolder(modalData.id, formData);
    } else {
      addFolder(formData);
    }
    closeModal();
  };

  if (!isModalOpen || modalType !== 'folder') return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={closeModal}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal} />
        <View style={styles.sheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {modalData ? 'Modifier le dossier' : 'Créer un dossier'}
            </Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom du dossier *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(v) => set('title', v)}
                placeholder="Ex : Personnel, Travail..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.description}
                onChangeText={(v) => set('description', v)}
                placeholder="Description optionnelle"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.btnSecondary} onPress={closeModal}>
                <Text style={styles.btnSecondaryText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, !formData.title.trim() && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={!formData.title.trim()}
              >
                <Text style={styles.btnPrimaryText}>
                  {modalData ? 'Enregistrer' : 'Créer le dossier'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...SHADOWS.header,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '700',
  },
  body: {
    padding: 20,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 44,
  },
  textarea: {
    minHeight: 90,
    paddingTop: 10,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: COLORS.pinkDark,
    borderRadius: RADIUS.full,
    paddingVertical: 13,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.full,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
  },
  btnSecondaryText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 15,
  },
});
