import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { TodoContext } from '../../ctx/TodoContext';
import { ETATS } from '../../config/constants';
import { COLORS, STATUS_COLORS, RADIUS } from '../../theme';
import DatePickerInput from '../../components/DatePickerInput';
import GlassCard from '../../components/GlassCard';

export default function TasksItem({ task, onFilterByFolder }) {
  const { folders, relations, updateTask, deleteTask, addRelation } = useContext(TodoContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title, description: task.description, dueDate: task.dueDate, status: task.status,
  });
  const [addFolderValue, setAddFolderValue] = useState('');

  const taskRelations  = relations.filter((r) => r.taskId === task.id);
  const allFolders     = taskRelations.map((r) => folders.find((f) => f.id === r.folderId)).filter(Boolean);
  const displayFolders = isExpanded ? allFolders : allFolders.slice(0, 2);
  const availFolders   = folders.filter((f) => !taskRelations.some((r) => r.folderId === f.id));

  const set = (key, value) => setEditData((prev) => ({ ...prev, [key]: value }));
  const handleSave   = () => { updateTask(task.id, editData); setIsEditing(false); };
  const handleCancel = () => {
    setEditData({ title: task.title, description: task.description, dueDate: task.dueDate, status: task.status });
    setIsEditing(false);
  };
  const handleAddFolder = (folderId) => {
    if (!folderId) return;
    addRelation(task.id, parseInt(folderId));
    setAddFolderValue('');
  };

  const statusColor = STATUS_COLORS[task.status] || COLORS.pinkLight;

  return (
    <GlassCard style={styles.card}>
      {/* Barre de statut */}
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          {isEditing ? (
            <TextInput style={styles.editTitle} value={editData.title} onChangeText={(v) => set('title', v)} />
          ) : (
            <Text style={styles.title} numberOfLines={isExpanded ? undefined : 2}>{task.title}</Text>
          )}
          <TouchableOpacity style={styles.toggleBtn} onPress={() => setIsExpanded((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.toggleText}>{isExpanded ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        </View>

        {/* Tags dossiers — style .task-category */}
        {displayFolders.length > 0 && (
          <View style={styles.chips}>
            {displayFolders.map((f) => (
              <TouchableOpacity key={f.id} style={styles.chip} onPress={() => onFilterByFolder && onFilterByFolder(f.id)}>
                <Text style={styles.chipText}>{f.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Méta : date + statut */}
        {!isEditing && (
          <View style={styles.meta}>
            {task.dueDate ? <Text style={styles.dueDate}>📅 {task.dueDate}</Text> : null}
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{task.status}</Text>
            </View>
          </View>
        )}

        {/* Contenu étendu */}
        {isExpanded && (
          <View style={styles.expanded}>
            {isEditing ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput style={styles.textarea} value={editData.description} onChangeText={(v) => set('description', v)} multiline numberOfLines={3} textAlignVertical="top" />
                </View>
                <View style={styles.formGroup}>
                  <DatePickerInput label="Date d'échéance" value={editData.dueDate} onChange={(v) => set('dueDate', v)} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Statut</Text>
                  <View style={styles.pickerWrap}>
                    <Picker selectedValue={editData.status} onValueChange={(v) => set('status', v)} style={styles.picker}>
                      {Object.values(ETATS).map((s) => <Picker.Item key={s} label={s} value={s} />)}
                    </Picker>
                  </View>
                </View>
              </>
            ) : (
              task.description ? <Text style={styles.desc}>{task.description}</Text> : null
            )}

            {task.members?.length > 0 && !isEditing && (
              <View style={styles.members}>
                {task.members.map((m) => (
                  <View key={m.name} style={styles.memberChip}>
                    <Text style={styles.memberText}>{m.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {!isEditing && availFolders.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ajouter à un dossier</Text>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={addFolderValue} onValueChange={(v) => { setAddFolderValue(v); handleAddFolder(v); }} style={styles.picker}>
                    <Picker.Item label="Choisir..." value="" />
                    {availFolders.map((f) => <Picker.Item key={f.id} label={f.title} value={f.id.toString()} />)}
                  </Picker>
                </View>
              </View>
            )}

            <View style={styles.actions}>
              {isEditing ? (
                <>
                  <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
                    <LinearGradient colors={[COLORS.pinkDark, COLORS.red]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnInner}>
                      <Text style={styles.btnPrimaryText}>Enregistrer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.btnSecondary]} onPress={handleCancel}>
                    <Text style={styles.btnSecondaryText}>Annuler</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={[styles.actionBtn, styles.btnSecondary]} onPress={() => setIsEditing(true)}>
                    <Text style={styles.btnSecondaryText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTask(task.id)} style={styles.actionBtn}>
                    <LinearGradient colors={[COLORS.red, COLORS.redDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnInner}>
                      <Text style={styles.btnPrimaryText}>Supprimer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', marginBottom: 12, borderRadius: 14 },
  statusBar: { width: 5 },
  inner: { flex: 1, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text, marginRight: 8 },
  editTitle: {
    flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text,
    borderBottomWidth: 1.5, borderBottomColor: COLORS.pinkDark, paddingBottom: 2, marginRight: 8,
  },
  toggleBtn: { padding: 2 },
  toggleText: { fontSize: 14, color: COLORS.pinkDark, fontWeight: '900' },
  /* folder chips — .task-category */
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255,102,179,0.3)',
  },
  chipText: { fontSize: 12, color: COLORS.pinkDark, fontWeight: '800' },
  /* meta */
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  dueDate: { fontSize: 13, color: COLORS.text, fontWeight: '700', opacity: 0.8 },
  statusBadge: {
    backgroundColor: COLORS.pinkLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.pinkDark },
  /* expanded */
  expanded: { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 10, gap: 8 },
  desc: { fontSize: 13, color: COLORS.textLight, lineHeight: 20 },
  members: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 4 },
  memberChip: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  memberText: { fontSize: 12, color: COLORS.text, fontWeight: '700' },
  formGroup: { marginBottom: 8 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: COLORS.text,
    minHeight: 70,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  picker: { height: 44, color: COLORS.text },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1 },
  btnInner: {
    borderRadius: 50,
    paddingVertical: 9,
    alignItems: 'center',
    shadowColor: '#ff66b3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 50,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
  },
  btnSecondaryText: { color: COLORS.pinkDark, fontWeight: '700', fontSize: 13 },
});
