import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { COLORS, STATUS_COLORS } from '../../theme';
import GlassCard from '../../components/GlassCard';

const getToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function TasksItem({ task }) {
  const { toggleTaskDone, deleteTask, folders } = useContext(TodoContext);
  const { openModal } = useContext(ModalContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const isDone = task.status === 'Réussi';
  const endDate = task.endDate || task.dueDate || task.startDate;
  const isOverdue = !isDone && endDate && endDate < getToday();

  const folder = task.folderId ? folders.find((f) => f.id === task.folderId) : null;

  const formatDateRange = () => {
    const start = task.startDate || task.dueDate;
    const end = task.endDate || task.dueDate;
    if (!start && !end) return null;
    const parts = [];
    if (start) parts.push(start.slice(5).replace('-', '/'));
    if (end && end !== start) parts.push(end.slice(5).replace('-', '/'));
    return parts.join(' → ');
  };

  const durationLabel = () => {
    if (!task.startDate || !task.endDate || task.startDate === task.endDate) return null;
    const s = new Date(task.startDate);
    const e = new Date(task.endDate);
    const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    if (days <= 0) return null;
    return `${days} jour${days > 1 ? 's' : ''}`;
  };

  const statusColor = folder?.color || STATUS_COLORS[task.status] || COLORS.pinkDark;

  return (
    <GlassCard style={[styles.card, isDone && styles.cardDone, isOverdue && styles.cardOverdue]}>
      <View style={styles.inner}>
        {/* Ligne principale */}
        <View style={styles.mainRow}>
          {/* Checkbox rapide */}
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => toggleTaskDone(task.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isDone ? 'checkbox' : 'square-outline'}
              size={22}
              color={isDone ? '#2ecc71' : isOverdue ? '#e74c3c' : statusColor}
            />
          </TouchableOpacity>

          {/* Titre & Méta */}
          <TouchableOpacity
            style={styles.contentWrap}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <View style={styles.titleRow}>
              <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={isExpanded ? undefined : 2}>
                {task.title}
              </Text>

              {folder && (
                <View style={[styles.folderBadge, { backgroundColor: folder.color }]}>
                  <Text style={styles.folderBadgeText}>{folder.title}</Text>
                </View>
              )}

              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{task.status}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              {formatDateRange() && (
                <Text style={[styles.dateText, isOverdue && styles.overdueText]}>
                  {isOverdue ? '⚠ Expiré : ' : '📅 '}
                  {formatDateRange()}
                </Text>
              )}
              {task.startTime && (
                <Text style={styles.timeText}>
                  ⏰ {task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}
                </Text>
              )}
              {durationLabel() && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{durationLabel()}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Flèche d'extension */}
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => setIsExpanded(!isExpanded)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Détails étendu */}
        {isExpanded && (
          <View style={styles.expanded}>
            {task.description ? (
              <Text style={styles.desc}>{task.description}</Text>
            ) : (
              <Text style={styles.noDesc}>Aucune description</Text>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btnEdit}
                onPress={() => openModal('task', task)}
              >
                <Ionicons name="create-outline" size={16} color={COLORS.pinkDark} />
                <Text style={styles.btnEditText}>Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnDelete}
                onPress={() => deleteTask(task.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                <Text style={styles.btnDeleteText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10, borderRadius: 14 },
  cardDone: { opacity: 0.75 },
  cardOverdue: { borderColor: 'rgba(231,76,60,0.4)', borderWidth: 1.5 },
  inner: { padding: 12 },
  mainRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { marginRight: 10 },
  contentWrap: { flex: 1, marginRight: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text },
  titleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  folderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  folderBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  dateText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  overdueText: { color: '#e74c3c', fontWeight: '800' },
  timeText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  durationBadge: {
    backgroundColor: 'rgba(255,102,179,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  durationText: { fontSize: 10, fontWeight: '800', color: COLORS.pinkDark },
  toggleBtn: { padding: 4 },
  expanded: { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', paddingTop: 8 },
  desc: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  noDesc: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  btnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,102,179,0.12)',
  },
  btnEditText: { fontSize: 12, fontWeight: '700', color: COLORS.pinkDark },
  btnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(231,76,60,0.12)',
  },
  btnDeleteText: { fontSize: 12, fontWeight: '700', color: '#e74c3c' },
});
