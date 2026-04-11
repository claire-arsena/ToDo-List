import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TodoContext } from '../../ctx/TodoContext';
import { ETATS } from '../../config/constants';
import { COLORS, STATUS_COLORS, GLASS, RADIUS, SHADOWS } from '../../theme';
import DatePickerInput from '../../components/DatePickerInput';

export default function TasksItem({ task, onFilterByFolder }) {
  const { folders, relations, updateTask, deleteTask, addRelation } = useContext(TodoContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status,
  });
  const [addFolderValue, setAddFolderValue] = useState('');

  const taskRelations = relations.filter((r) => r.taskId === task.id);
  const allFolders = taskRelations
    .map((r) => folders.find((f) => f.id === r.folderId))
    .filter(Boolean);
  const displayFolders = isExpanded ? allFolders : allFolders.slice(0, 2);

  const availableFolders = folders.filter(
    (f) => !taskRelations.some((r) => r.folderId === f.id)
  );

  const set = (key, value) => setEditData((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateTask(task.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
    });
    setIsEditing(false);
  };

  const handleAddFolder = (folderId) => {
    if (!folderId) return;
    addRelation(task.id, parseInt(folderId));
    setAddFolderValue('');
  };

  const statusColor = STATUS_COLORS[task.status] || COLORS.pinkLight;

  return (
    <View style={styles.card}>
      {/* Indicateur de statut */}
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />

      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.header}>
          {isEditing ? (
            <TextInput
              style={styles.editTitle}
              value={editData.title}
              onChangeText={(v) => set('title', v)}
              placeholder="Titre"
            />
          ) : (
            <Text style={styles.title} numberOfLines={isExpanded ? undefined : 2}>
              {task.title}
            </Text>
          )}
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setIsExpanded((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.toggleText}>{isExpanded ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        </View>

        {/* Tags dossiers */}
        {displayFolders.length > 0 && (
          <View style={styles.folderChips}>
            {displayFolders.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={styles.chip}
                onPress={() => onFilterByFolder && onFilterByFolder(f.id)}
              >
                <Text style={styles.chipText}>{f.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date + Statut (résumé) */}
        {!isEditing && (
          <View style={styles.meta}>
            {task.dueDate ? (
              <Text style={styles.dueDate}>📅 {task.dueDate}</Text>
            ) : null}
            <View style={[styles.statusChip, { backgroundColor: statusColor + '44' }]}>
              <Text style={styles.statusChipText}>{task.status}</Text>
            </View>
          </View>
        )}

        {/* Section expandée */}
        {isExpanded && (
          <View style={styles.expanded}>
            {/* Description */}
            {isEditing ? (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.textarea}
                  value={editData.description}
                  onChangeText={(v) => set('description', v)}
                  placeholder="Description..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            ) : (
              task.description ? (
                <Text style={styles.description}>{task.description}</Text>
              ) : null
            )}

            {/* Date édition */}
            {isEditing && (
              <View style={styles.formGroup}>
                <DatePickerInput
                  label="Date d'échéance"
                  value={editData.dueDate}
                  onChange={(v) => set('dueDate', v)}
                />
              </View>
            )}

            {/* Statut édition */}
            {isEditing && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Statut</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={editData.status}
                    onValueChange={(v) => set('status', v)}
                    style={styles.picker}
                  >
                    {Object.values(ETATS).map((s) => (
                      <Picker.Item key={s} label={s} value={s} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Équipiers */}
            {task.members && task.members.length > 0 && !isEditing && (
              <Text style={styles.members}>
                👥 {task.members.map((m) => m.name).join(', ')}
              </Text>
            )}

            {/* Ajouter un dossier */}
            {!isEditing && availableFolders.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ajouter à un dossier</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={addFolderValue}
                    onValueChange={(v) => {
                      setAddFolderValue(v);
                      handleAddFolder(v);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item label="Choisir un dossier..." value="" />
                    {availableFolders.map((f) => (
                      <Picker.Item key={f.id} label={f.title} value={f.id.toString()} />
                    ))}
                  </Picker>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              {isEditing ? (
                <>
                  <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
                    <Text style={styles.btnPrimaryText}>Enregistrer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnSecondary} onPress={handleCancel}>
                    <Text style={styles.btnSecondaryText}>Annuler</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.btnSecondaryText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnDanger}
                    onPress={() => deleteTask(task.id)}
                  >
                    <Text style={styles.btnDangerText}>Supprimer</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    marginBottom: 10,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  statusBar: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  editTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.pinkDark,
    paddingBottom: 2,
    marginRight: 8,
  },
  toggleBtn: {
    padding: 2,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  folderChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  chip: {
    backgroundColor: 'rgba(255,102,179,0.15)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,102,179,0.3)',
  },
  chipText: {
    fontSize: 11,
    color: COLORS.pinkDark,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dueDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  expanded: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 10,
  },
  description: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  members: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: RADIUS.sm,
    padding: 8,
    fontSize: 13,
    color: COLORS.text,
    minHeight: 70,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  picker: {
    height: 44,
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: COLORS.pinkDark,
    borderRadius: RADIUS.full,
    paddingVertical: 9,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.full,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  btnSecondaryText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  btnDanger: {
    flex: 1,
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderRadius: RADIUS.full,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
  },
  btnDangerText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13,
  },
});
