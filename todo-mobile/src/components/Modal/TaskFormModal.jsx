import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { ProfileContext } from '../../ctx/ProfileContext';
import { ETATS } from '../../config/constants';
import DatePickerInput from '../DatePickerInput';
import TimePickerInput from '../TimePickerInput';
import { COLORS, SHADOWS } from '../../theme';

const FOLDER_COLORS = [
  '#d81b60', // iOS Deep Pink
  '#34c759', // iOS Green
  '#af52de', // iOS Purple
  '#ff9500', // iOS Orange
  '#ff3b30', // iOS Red
  '#ff66b3', // Rose Bonbon
  '#00c7be', // iOS Teal
  '#ffcc00', // iOS Yellow
  '#e84393', // Magenta
  '#30b0c7', // Cyan iOS
  '#5856d6', // Indigo iOS
  '#fd79a8', // Rose Pastel
  '#00b894', // Vert Menthe
  '#fdcb6e', // Or Doux
];

const HEIGHT_STORAGE_KEY = '@todo_modal_sheet_height';
const DEFAULT_HEIGHT = 540;

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
  const [hasDate, setHasDate] = useState(true);

  // Hauteur personnalisable et persistante en LocalStorage
  const [sheetHeight, setSheetHeight] = useState(DEFAULT_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(DEFAULT_HEIGHT);

  // Quick Folder creation form
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);

  // Charger la hauteur sauvegardee dans AsyncStorage/localStorage
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(HEIGHT_STORAGE_KEY);
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (parsed >= 200 && parsed <= 1200) {
            setSheetHeight(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (isModalOpen && modalType === 'task') {
      setSheetHeight(DEFAULT_HEIGHT);
      if (modalData) {
        const taskHasDate = !!(modalData.startDate || modalData.endDate || modalData.dueDate);
        setHasDate(taskHasDate);
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
        setHasDate(true);
        setForm({ ...EMPTY, startDate: getToday(), endDate: getToday(), status: ETATS.NOUVEAU });
      }
    }
    setShowNewFolderForm(false);
  }, [modalData, modalType, isModalOpen]);

  // Gestion du Dragging fluide au doigt / curseur
  const handleDragStart = (clientY) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    dragStartHeight.current = sheetHeight;
  };

  const handleDragMove = (clientY) => {
    if (!dragStartY.current) return;
    const deltaY = clientY - dragStartY.current;
    const newH = dragStartHeight.current - deltaY;
    const clampedH = Math.max(100, Math.min(newH, (Platform.OS === 'web' && window.innerHeight ? window.innerHeight * 0.95 : 900)));
    setSheetHeight(clampedH);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    dragStartY.current = 0;

    // Si tire vers le bas en-dessous de 180px -> fermer la modale !
    if (sheetHeight < 180) {
      closeModal();
      setSheetHeight(DEFAULT_HEIGHT);
    } else {
      // Sauvegarder la hauteur choisie en LocalStorage
      AsyncStorage.setItem(HEIGHT_STORAGE_KEY, String(Math.round(sheetHeight)));
    }
  };

  // Listeners Web globaux pour un suivi 60fps ultra fluide hors de la poignee
  useEffect(() => {
    if (Platform.OS === 'web' && isDragging) {
      const onMove = (e) => {
        const y = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        if (y) handleDragMove(y);
      };
      const onUp = () => handleDragEnd();

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onUp);

      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('touchmove', onMove);
        window.removeEventListener('touchend', onUp);
      };
    }
  }, [isDragging, sheetHeight]);

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
      ...(hasDate ? {
        startDate: form.startDate,
        endDate: form.endDate || form.startDate,
        dueDate: form.endDate || form.startDate,
      } : {
        startDate: '',
        endDate: '',
        dueDate: '',
      }),
      startTime: form.startTime,
      endTime: form.endTime,
      status: modalData ? form.status : ETATS.NOUVEAU,
      folderId: form.folderId,
      isRegular: form.isRegular,
    };
    modalData ? updateTask(modalData.id, payload) : addTask(payload);
    setForm(EMPTY);
    closeModal();
  };

  if (!isModalOpen || modalType !== 'task') return null;

  const isMultiDay = form.startDate && form.endDate && form.startDate !== form.endDate;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={closeModal}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeModal} />

        <BlurView
          intensity={90}
          tint="light"
          style={[
            styles.iosSheet,
            { height: sheetHeight, maxHeight: '95%' },
            isDragging && { transition: 'none' },
          ]}
        >
          <View style={styles.sheetInner}>
            {/* Poignée tactile de drag interactive */}
            <View
              style={styles.handleTouchArea}
              onPointerDown={(e) => {
                if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
                handleDragStart(e.clientY);
              }}
              onPointerUp={(e) => {
                if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
                handleDragEnd();
              }}
              onResponderGrant={(evt) => handleDragStart(evt.nativeEvent.pageY)}
              onResponderMove={(evt) => handleDragMove(evt.nativeEvent.pageY)}
              onResponderRelease={() => handleDragEnd()}
            >
              <View style={[styles.iosHandle, isDragging && styles.iosHandleActive]} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentTheme.primary }]}>
                {modalData ? 'Modifier la tâche' : 'Nouvelle tâche'}
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
                  style={styles.iosInput}
                  value={form.title}
                  onChangeText={(v) => set('title', v)}
                  placeholder="Ex : Rédaction du rapport, Cours de sport..."
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              {/* Choix du Dossier */}
              <View style={styles.formGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Dossier (Optionnel)</Text>
                  <TouchableOpacity onPress={() => setShowNewFolderForm(!showNewFolderForm)}>
                    <Text style={[styles.addFolderBtnText, { color: currentTheme.primary }]}>
                      {showNewFolderForm ? 'Fermer' : '+ Nouveau dossier'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showNewFolderForm ? (
                  <View style={styles.newFolderCard}>
                    <TextInput
                      style={styles.iosInput}
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
                      style={[styles.createFolderSubmit, { backgroundColor: currentTheme.primary }, !newFolderTitle.trim() && { opacity: 0.5 }]}
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
                        style={[styles.folderChip, !form.folderId && { backgroundColor: currentTheme.primary, borderColor: currentTheme.primary }]}
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
                  style={[styles.iosInput, styles.textarea]}
                  value={form.description}
                  onChangeText={(v) => set('description', v)}
                  placeholder="Détails optionnels..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Toggle Ajouter une date */}
              <View style={[styles.regularCard, { backgroundColor: currentTheme.tint, borderColor: currentTheme.primary + '33' }]}>
                <View style={styles.regularTextRow}>
                  <Ionicons name="calendar-outline" size={20} color={currentTheme.primary} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.regularTitle, { color: currentTheme.primary }]}>Ajouter une date</Text>
                    <Text style={styles.regularSub}>
                      {hasDate ? 'La tâche sera planifiée avec des dates' : 'Tâche rapide sans date d\'échéance'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setHasDate(!hasDate)}
                    style={[
                      styles.customToggleTrack,
                      hasDate ? { backgroundColor: currentTheme.primary } : styles.customToggleTrackInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.customToggleThumb,
                        hasDate ? styles.customToggleThumbActive : styles.customToggleThumbInactive,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dates */}
              {hasDate && (
                <>
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

                  {/* Heures style réveil / alarme */}
                  <View style={styles.row}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <TimePickerInput
                        label="Heure début"
                        value={form.startTime}
                        onChange={(v) => set('startTime', v)}
                        placeholder="09:00"
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <TimePickerInput
                        label="Heure fin"
                        value={form.endTime}
                        onChange={(v) => set('endTime', v)}
                        placeholder="10:00"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Option Tâche Régulière */}
              <View style={[styles.regularCard, { backgroundColor: currentTheme.tint, borderColor: currentTheme.primary + '33' }]}>
                <View style={styles.regularTextRow}>
                  <Ionicons name="repeat-outline" size={20} color={currentTheme.primary} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.regularTitle, { color: currentTheme.primary }]}>Tâche régulière quotidienne</Text>
                    <Text style={styles.regularSub}>
                      {isMultiDay
                        ? `Appliquer le créneau (${form.startTime || '09:00'} → ${form.endTime || '10:00'}) sur chacun des jours`
                        : `Appliquer le créneau horaire chaque jour en cas de sélection sur plusieurs jours`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => set('isRegular', !form.isRegular)}
                    style={[
                      styles.customToggleTrack,
                      form.isRegular ? { backgroundColor: currentTheme.primary } : styles.customToggleTrackInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.customToggleThumb,
                        form.isRegular ? styles.customToggleThumbActive : styles.customToggleThumbInactive,
                      ]}
                    />
                  </TouchableOpacity>
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
                  <Text style={[styles.btnSecondaryText, { color: currentTheme.primary }]}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, !form.title.trim() && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={!form.title.trim()}
                >
                  <LinearGradient
                    colors={[currentTheme.primary, currentTheme.deep]}
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
  iosSheet: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
    ...SHADOWS.glass,
  },
  sheetInner: {
    backgroundColor: '#ffffff',
    maxHeight: '100%',
    flex: 1,
  },
  handleTouchArea: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
    cursor: 'grab',
    touchAction: 'none',
  },
  iosHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(60, 60, 67, 0.3)',
    marginBottom: 4,
  },
  iosHandleActive: {
    backgroundColor: COLORS.pinkDark,
    width: 56,
  },
  handleHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  handleHintText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.pinkDark,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalTitle: { fontSize: 19, fontWeight: '800', color: COLORS.pinkDark, letterSpacing: -0.3 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 13, color: COLORS.textLight, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formGroup: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#000', letterSpacing: -0.1 },
  addFolderBtnText: { fontSize: 12, fontWeight: '800', color: COLORS.pinkDark },

  folderChipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  folderChipSelectArea: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  folderChipActive: { backgroundColor: COLORS.pinkDark, borderColor: COLORS.pinkDark },
  folderChipText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  folderChipTextActive: { color: '#fff' },
  smallDot: { width: 8, height: 8, borderRadius: 4 },
  deleteFolderIcon: { marginLeft: 6, padding: 2 },

  newFolderCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  colorPickerRow: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4 },
  createFolderSubmit: {
    marginTop: 10,
    backgroundColor: COLORS.pinkDark,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  createFolderSubmitText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  iosInput: {
    backgroundColor: 'rgba(118, 118, 128, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    minHeight: 44,
  },
  textarea: { minHeight: 74, paddingTop: 10 },

  regularCard: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(216, 27, 96, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.2)',
  },
  regularTextRow: { flexDirection: 'row', alignItems: 'center' },
  regularTitle: { fontSize: 13, fontWeight: '800', color: COLORS.pinkDark },
  regularSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },

  customToggleTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  customToggleTrackActive: {
    backgroundColor: COLORS.pinkDark,
  },
  customToggleTrackInactive: {
    backgroundColor: 'rgba(120, 120, 128, 0.2)',
  },
  customToggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  customToggleThumbActive: {
    alignSelf: 'flex-end',
  },
  customToggleThumbInactive: {
    alignSelf: 'flex-start',
  },

  pickerWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(118, 118, 128, 0.08)',
  },
  picker: { height: Platform.OS === 'ios' ? 150 : 50, color: COLORS.text },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  submitBtn: { flex: 1 },
  btnPrimary: {
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSecondaryText: { color: COLORS.pinkDark, fontWeight: '700', fontSize: 15 },
});
