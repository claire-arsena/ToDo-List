import React, { useContext, useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, Switch,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { ETATS } from '../../config/constants';
import DatePickerInput from '../DatePickerInput';
import { COLORS, SHADOWS } from '../../theme';

const FOLDER_COLORS = [
  '#3498db', // Bleu Océan
  '#2ecc71', // Vert Émeraude
  '#9b59b6', // Violet Néon
  '#e67e22', // Orange Corail
  '#e74c3c', // Rouge Rubis
  '#ff66b3', // Rose Bonbon
  '#1abc9c', // Turquoise
  '#f1c40f', // Jaune Soleil
  '#e84393', // Magenta
  '#00cec9', // Cyan Menthe
  '#6c5ce7', // Indigo
  '#fd79a8', // Rose Pastel
  '#00b894', // Vert Menthe
  '#fdcb6e', // Or Doux
];

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
  folderId: null,
  isRegular: true,
};

export default function TaskFormModal() {
  const { addTask, updateTask, folders, addFolder, deleteFolder } = useContext(TodoContext);
  const { isModalOpen, modalType, modalData, closeModal } = useContext(ModalContext);
  const [form, setForm] = useState(EMPTY);

  // Quick Folder creation form
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);

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
        folderId: modalData.folderId || null,
        isRegular: modalData.isRegular !== undefined ? modalData.isRegular : true,
      });
    } else {
      setForm({ ...EMPTY, startDate: getToday(), endDate: getToday(), status: ETATS.NOUVEAU });
    }
    setShowNewFolderForm(false);
  }, [modalData, modalType]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleCreateFolder = () => {
    if (!newFolderTitle.trim()) return;
    const created = addFolder({ title: newFolderTitle.trim(), color: newFolderColor });
    set('folderId', created.id);
    setNewFolderTitle('');
    setShowNewFolderForm(false);
  };

  const handleDeleteFolder = (folderId, folderTitle) => {
    const doDelete = () => {
      deleteFolder(folderId);
      if (form.folderId === folderId) set('folderId', null);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer le dossier "${folderTitle}" ? Les tâches associées n'auront plus de dossier.`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Supprimer le dossier',
        `Supprimer le dossier "${folderTitle}" ? Les tâches associées n'auront plus de dossier.`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

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
      status: modalData ? form.status : ETATS.NOUVEAU, // Toujours "Nouveau" a la creation
      folderId: form.folderId,
      isRegular: form.isRegular,
    };
    modalData ? updateTask(modalData.id, payload) : addTask(payload);
    closeModal();
  };

  if (!isModalOpen || modalType !== 'task') return null;

  const isMultiDay = form.startDate && form.endDate && form.startDate !== form.endDate;

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
                  placeholder="Ex : Rédaction du rapport, Cours de sport..."
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              {/* Choix du Dossier avec couleur et suppression */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Dossier (Optionnel)</Text>
                  <TouchableOpacity onPress={() => setShowNewFolderForm(!showNewFolderForm)}>
                    <Text style={styles.addFolderBtnText}>
                      {showNewFolderForm ? 'Fermer' : '+ Nouveau dossier'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showNewFolderForm ? (
                  <View style={styles.newFolderCard}>
                    <TextInput
                      style={styles.input}
                      value={newFolderTitle}
                      onChangeText={setNewFolderTitle}
                      placeholder="Nom du dossier (ex: Marketing, Sport...)"
                      placeholderTextColor={COLORS.textMuted}
                    />
                    <Text style={[styles.label, { marginTop: 8 }]}>Couleur du dossier :</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.colorPickerRow}>
                        {FOLDER_COLORS.map((c) => (
                          <TouchableOpacity
                            key={c}
                            style={[
                              styles.colorDot,
                              { backgroundColor: c },
                              newFolderColor === c && styles.colorDotActive,
                            ]}
                            onPress={() => setNewFolderColor(c)}
                          />
                        ))}
                      </View>
                    </ScrollView>

                    <TouchableOpacity
                      style={[styles.createFolderSubmit, !newFolderTitle.trim() && { opacity: 0.5 }]}
                      onPress={handleCreateFolder}
                      disabled={!newFolderTitle.trim()}
                    >
                      <Text style={styles.createFolderSubmitText}>Créer le dossier</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                    <View style={styles.folderChipRow}>
                      <TouchableOpacity
                        style={[styles.folderChip, !form.folderId && styles.folderChipActive]}
                        onPress={() => set('folderId', null)}
                      >
                        <Text style={[styles.folderChipText, !form.folderId && styles.folderChipTextActive]}>
                          Aucun
                        </Text>
                      </TouchableOpacity>

                      {folders.map((f) => {
                        const isSelected = form.folderId === f.id;
                        return (
                          <View
                            key={f.id}
                            style={[
                              styles.folderChip,
                              { borderColor: f.color },
                              isSelected && { backgroundColor: f.color },
                            ]}
                          >
                            <TouchableOpacity
                              style={styles.folderChipSelectArea}
                              onPress={() => set('folderId', f.id)}
                            >
                              <View style={[styles.smallDot, { backgroundColor: isSelected ? '#fff' : f.color }]} />
                              <Text style={[styles.folderChipText, isSelected && { color: '#fff', fontWeight: '800' }]}>
                                {f.title}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.deleteFolderIcon}
                              onPress={() => handleDeleteFolder(f.id, f.title)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={13}
                                color={isSelected ? '#fff' : COLORS.textMuted}
                              />
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                )}
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

              {/* Dates de début et fin */}
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
                    placeholder="10:00"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              {/* Option Tâche Régulière (Répéter sur chaque jour du créneau) */}
              <View style={styles.regularCard}>
                <View style={styles.regularTextRow}>
                  <Ionicons name="repeat-outline" size={20} color={COLORS.pinkDark} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.regularTitle}>Tâche régulière quotidienne</Text>
                    <Text style={styles.regularSub}>
                      {isMultiDay
                        ? `Appliquer le créneau (${form.startTime || '09:00'} → ${form.endTime || '10:00'}) sur chacun des jours`
                        : `Appliquer le créneau horaire chaque jour en cas de sélection sur plusieurs jours`}
                    </Text>
                  </View>
                  <Switch
                    value={form.isRegular}
                    onValueChange={(val) => set('isRegular', val)}
                    trackColor={{ false: '#ddd', true: COLORS.pinkDark }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              {/* Statut (Uniquement lors de la modification) */}
              {modalData && (
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
              )}

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
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
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
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  addFolderBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.pinkDark },

  folderChipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  folderChipSelectArea: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  folderChipActive: { backgroundColor: COLORS.pinkDark, borderColor: COLORS.pinkDark },
  folderChipText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  folderChipTextActive: { color: '#fff' },
  smallDot: { width: 8, height: 8, borderRadius: 4 },
  deleteFolderIcon: { marginLeft: 6, padding: 2 },

  newFolderCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  colorPickerRow: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4 },
  createFolderSubmit: {
    marginTop: 10,
    backgroundColor: COLORS.pinkDark,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  createFolderSubmitText: { color: '#fff', fontWeight: '700', fontSize: 12 },

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
  textarea: { minHeight: 70, paddingTop: 10 },

  regularCard: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,102,179,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,102,179,0.25)',
  },
  regularTextRow: { flexDirection: 'row', alignItems: 'center' },
  regularTitle: { fontSize: 13, fontWeight: '800', color: COLORS.pinkDark },
  regularSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },

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
