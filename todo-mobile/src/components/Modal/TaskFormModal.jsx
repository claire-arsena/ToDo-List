import React, { useContext, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { ETATS } from '../../config/constants';
import DatePickerInput from '../DatePickerInput';
import { COLORS, GLASS, RADIUS, SHADOWS } from '../../theme';

const EMPTY_FORM = {
  title: '',
  description: '',
  dueDate: '',
  status: ETATS.NOUVEAU,
  membersInput: '',
  folderId: '',
};

export default function TaskFormModal() {
  const { addTask, updateTask, folders, relations } = useContext(TodoContext);
  const { isModalOpen, modalType, modalData, closeModal } = useContext(ModalContext);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (modalData && modalType === 'task') {
      const relation = relations.find((r) => r.taskId === modalData.id);
      setFormData({
        title: modalData.title || '',
        description: modalData.description || '',
        dueDate: modalData.dueDate || '',
        status: modalData.status || ETATS.NOUVEAU,
        membersInput: modalData.members ? modalData.members.map((m) => m.name).join(', ') : '',
        folderId: relation ? relation.folderId.toString() : '',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [modalData, modalType, relations]);

  const set = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    const members = formData.membersInput
      .split(',')
      .map((name) => ({ name: name.trim() }))
      .filter((obj) => obj.name !== '');

    const payload = {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      status: formData.status,
      members,
    };

    if (modalData) {
      updateTask(modalData.id, payload, formData.folderId);
    } else {
      addTask(payload, formData.folderId);
    }
    closeModal();
  };

  if (!isModalOpen || modalType !== 'task') return null;

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal} />
        <View style={styles.sheet}>
          {/* Header */}
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
            {/* Titre */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Titre *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(v) => set('title', v)}
                placeholder="Entrez le titre de la tâche"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.description}
                onChangeText={(v) => set('description', v)}
                placeholder="Description optionnelle"
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Date d'échéance */}
            <View style={styles.formGroup}>
              <DatePickerInput
                label="Date d'échéance"
                value={formData.dueDate}
                onChange={(v) => set('dueDate', v)}
              />
            </View>

            {/* Dossier */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Dossier</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.folderId}
                  onValueChange={(v) => set('folderId', v)}
                  style={styles.picker}
                >
                  <Picker.Item label="Aucun dossier" value="" />
                  {folders.map((folder) => (
                    <Picker.Item key={folder.id} label={folder.title} value={folder.id.toString()} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Équipiers */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Équipiers (séparés par des virgules)</Text>
              <TextInput
                style={styles.input}
                value={formData.membersInput}
                onChangeText={(v) => set('membersInput', v)}
                placeholder="Ex : Paul, Marie, Bob"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Statut */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Statut</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.status}
                  onValueChange={(v) => set('status', v)}
                  style={styles.picker}
                >
                  {Object.values(ETATS).map((status) => (
                    <Picker.Item key={status} label={status} value={status} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Boutons */}
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
                  {modalData ? 'Enregistrer' : 'Créer la tâche'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '90%',
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
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
    minHeight: 100,
    paddingTop: 10,
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
    color: COLORS.text,
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
