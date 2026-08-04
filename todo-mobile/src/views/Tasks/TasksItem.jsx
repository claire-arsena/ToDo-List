import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodoContext } from '../../ctx/TodoContext';
import { ModalContext } from '../../ctx/ModalContext';
import { COLORS, STATUS_COLORS } from '../../theme';
import { isTaskOverdue, ETATS } from '../../config/constants';
import GlassCard from '../../components/GlassCard';

export default function TasksItem({ task }) {
  const {
    toggleTaskDone,
    deleteTask,
    folders,
    rescheduleToToday,
    rescheduleByDays,
    cancelTask,
    toggleSubtaskDone,
  } = useContext(TodoContext);
  const { openModal } = useContext(ModalContext);
  const [isExpanded, setIsExpanded] = useState(false);

  const isDone = task.status === ETATS.REUSSI;
  const overdue = isTaskOverdue(task);

  const folder = task.folderId ? folders.find((f) => f.id === task.folderId) : null;

  const formatDateFr = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}`;
    }
    return dateStr;
  };

  const formatCreationDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d}/${m}/${y}`;
    }
    return dateStr;
  };

  const formatDateRange = () => {
    const start = task.startDate;
    const end = task.endDate || task.dueDate;

    if (!start && !end) {
      return "Pas d'échéance";
    }

    if (start && end && start !== end) {
      return `${formatDateFr(start)} → ${formatDateFr(end)}`;
    }

    const singleDate = end || start;
    return `Échéance : ${formatDateFr(singleDate)}`;
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
  const hasNoDate = !task.startDate && !task.endDate && !task.dueDate;

  return (
    <GlassCard style={[styles.iosCard, isDone && styles.cardDone, overdue && styles.cardOverdue]}>
      <View style={styles.inner}>
        {/* Main Row */}
        <View style={styles.mainRow}>
          {/* iOS Circular Checkbox */}
          <TouchableOpacity
            style={styles.checkboxTouch}
            onPress={() => toggleTaskDone(task.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View
              style={[
                styles.iosCheckboxRing,
                isDone && styles.iosCheckboxRingDone,
                overdue && !isDone && styles.iosCheckboxRingOverdue,
              ]}
            >
              {isDone && <Ionicons name="checkmark" size={14} color="#ffffff" />}
            </View>
          </TouchableOpacity>

          {/* Title & Metadata */}
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

              <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor + '40' }]}>
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>{task.status}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.dateText, overdue && styles.overdueText, hasNoDate && styles.noDateText]}>
                {overdue ? '⚠ Expiré : ' : '📅 '}
                {formatDateRange()}
              </Text>
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

          {/* Expand Arrow */}
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

        {/* iOS Overdue Decision Banner */}
        {overdue && (
          <View style={styles.overdueDecisionCard}>
            <View style={styles.overdueHeaderRow}>
              <Ionicons name="alert-circle" size={16} color="#ff3b30" />
              <Text style={styles.overdueTitle}>Tâche en retard ! Quelle décision prendre ?</Text>
            </View>

            <View style={styles.overdueActionsRow}>
              <TouchableOpacity
                style={styles.overdueBtnSuccess}
                onPress={() => toggleTaskDone(task.id)}
              >
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Text style={styles.overdueBtnText}>Valider</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.overdueBtnPrimary}
                onPress={() => rescheduleToToday(task.id)}
              >
                <Ionicons name="today" size={14} color="#fff" />
                <Text style={styles.overdueBtnText}>Reporter à aujourd'hui</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.overdueBtnSecondary}
                onPress={() => rescheduleByDays(task.id, 1)}
              >
                <Ionicons name="time" size={14} color={COLORS.pinkDark} />
                <Text style={styles.overdueBtnSecondaryText}>+1 jour</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.overdueBtnDanger}
                onPress={() => cancelTask(task.id)}
              >
                <Ionicons name="close-circle" size={14} color="#ff3b30" />
                <Text style={styles.overdueBtnDangerText}>Abandonner</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Expanded details */}
        {isExpanded && (
          <View style={styles.expanded}>
            {task.description ? (
              <Text style={styles.desc}>{task.description}</Text>
            ) : null}

            {task.subtasks && task.subtasks.length > 0 && (
              <View style={styles.subtasksContainer}>
                {task.subtasks.map((st) => (
                  <TouchableOpacity
                    key={st.id}
                    style={styles.subtaskRow}
                    onPress={() => toggleSubtaskDone(task.id, st.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.subtaskCheckbox, st.isDone && styles.subtaskCheckboxDone]}>
                      {st.isDone && <Ionicons name="checkmark" size={10} color="#fff" />}
                    </View>
                    <Text style={[styles.subtaskTitle, st.isDone && styles.subtaskTitleDone]}>
                      {st.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!task.description && (!task.subtasks || task.subtasks.length === 0) && (
              <Text style={styles.noDesc}>Aucune description ou checklist</Text>
            )}

            {task.creationDate && (
              <Text style={styles.creationText}>
                Créée le {formatCreationDate(task.creationDate)}
              </Text>
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
                <Ionicons name="trash-outline" size={16} color="#ff3b30" />
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
  iosCard: {
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.07)',
    backgroundColor: '#f8f9fc',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardDone: { opacity: 0.7 },
  cardOverdue: { borderColor: '#ff3b30', borderWidth: 1.5 },
  inner: { padding: 14 },
  mainRow: { flexDirection: 'row', alignItems: 'center' },
  checkboxTouch: { marginRight: 12 },

  // iOS Checkbox Circular Ring
  iosCheckboxRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(60, 60, 67, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iosCheckboxRingDone: {
    backgroundColor: COLORS.pinkDark, // Deep Pink checked fill
    borderColor: COLORS.pinkDark,
  },
  iosCheckboxRingOverdue: {
    borderColor: '#ff3b30',
  },

  contentWrap: { flex: 1, marginRight: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: '#000000', letterSpacing: -0.2 },
  titleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  folderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  folderBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  dateText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  overdueText: { color: '#ff3b30', fontWeight: '800' },
  timeText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  durationBadge: {
    backgroundColor: 'rgba(216, 27, 96, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
  },
  durationText: { fontSize: 10, fontWeight: '800', color: COLORS.pinkDark },
  toggleBtn: { padding: 4 },

  overdueDecisionCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,59,48,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.25)',
  },
  overdueHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  overdueTitle: { fontSize: 12, fontWeight: '800', color: '#ff3b30' },
  overdueActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  overdueBtnSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34c759',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  overdueBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.pinkDark,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  overdueBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(216,27,96,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(216,27,96,0.25)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  overdueBtnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,59,48,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.25)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  overdueBtnText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  overdueBtnSecondaryText: { fontSize: 11, fontWeight: '800', color: COLORS.pinkDark },
  overdueBtnDangerText: { fontSize: 11, fontWeight: '800', color: '#ff3b30' },

  expanded: { marginTop: 12, borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)', paddingTop: 10 },
  desc: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  noDesc: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' },
  noDateText: { color: COLORS.textMuted, opacity: 0.8 },
  creationText: { fontSize: 11, color: COLORS.textMuted, marginTop: 8, fontStyle: 'italic' },
  
  subtasksContainer: { marginTop: 12, gap: 8 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center' },
  subtaskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(60, 60, 67, 0.3)',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCheckboxDone: { backgroundColor: COLORS.pinkDark, borderColor: COLORS.pinkDark },
  subtaskTitle: { fontSize: 13, color: COLORS.text, flex: 1 },
  subtaskTitleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  btnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: 'rgba(216,27,96,0.12)',
  },
  btnEditText: { fontSize: 12, fontWeight: '700', color: COLORS.pinkDark },
  btnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: 'rgba(255,59,48,0.12)',
  },
  btnDeleteText: { fontSize: 12, fontWeight: '700', color: '#ff3b30' },
});
