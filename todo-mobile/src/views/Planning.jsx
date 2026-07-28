import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TodoContext } from '../ctx/TodoContext';
import GlassCard from '../components/GlassCard';
import { COLORS } from '../theme';

const STATUS_COLORS = {
  'Nouveau': COLORS.pinkDark || '#ff66b3',
  'En cours': '#3498db',
  'Réussi': '#2ecc71',
  'En attente': '#f1c40f',
  'Abandonné': '#95a5a6',
};

const HOUR_HEIGHT = 56;
const START_HOUR = 6;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const formatLocalDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Planning() {
  const { tasks, folders, toggleTaskDone } = useContext(TodoContext);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dateStr = formatLocalDate(selectedDate);
  const todayStr = formatLocalDate(new Date());
  const isToday = dateStr === todayStr;

  const formattedDate = `${DAYS_FR[selectedDate.getDay()]} ${selectedDate.getDate()} ${MONTHS_FR[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const getTaskColor = (t) => {
    if (t.folderId) {
      const f = folders.find((folder) => folder.id === t.folderId);
      if (f?.color) return f.color;
    }
    return STATUS_COLORS[t.status] || COLORS.pinkDark;
  };

  const getFolderName = (t) => {
    if (t.folderId) {
      const f = folders.find((folder) => folder.id === t.folderId);
      return f?.title;
    }
    return null;
  };

  // Filter tasks that fall on the selected day
  const dayTasks = useMemo(() => {
    return tasks.filter((t) => {
      const start = t.startDate || t.dueDate || t.endDate;
      const end = t.endDate || t.startDate || t.dueDate;
      if (!start && !end) return false;
      return dateStr >= (start || dateStr) && dateStr <= (end || dateStr);
    });
  }, [tasks, dateStr]);

  // Timed vs All-day tasks
  const timedTasks = useMemo(() => {
    return dayTasks.filter((t) => !!t.startTime);
  }, [dayTasks]);

  const allDayTasks = useMemo(() => {
    return dayTasks.filter((t) => !t.startTime);
  }, [dayTasks]);

  const getTaskPosition = (task) => {
    let startH = START_HOUR, startM = 0, endH = END_HOUR, endM = 0;

    if (task.startTime) {
      const parts = task.startTime.split(':').map(Number);
      startH = parts[0];
      startM = parts[1] || 0;
    }

    if (task.endTime) {
      const parts = task.endTime.split(':').map(Number);
      endH = parts[0];
      endM = parts[1] || 0;
    } else {
      endH = Math.min(startH + 1, END_HOUR);
      endM = startM;
    }

    const top = Math.max(0, (startH - START_HOUR) * HOUR_HEIGHT + (startM / 60) * HOUR_HEIGHT);
    const bottom = (endH - START_HOUR) * HOUR_HEIGHT + (endM / 60) * HOUR_HEIGHT;
    const height = Math.max(36, bottom - top);

    return { top, height };
  };

  // Current time line
  const now = new Date();
  const nowH = now.getHours();
  const nowM = now.getMinutes();
  const showNowLine = isToday && nowH >= START_HOUR && nowH < END_HOUR;
  const nowTop = showNowLine
    ? (nowH - START_HOUR) * HOUR_HEIGHT + (nowM / 60) * HOUR_HEIGHT
    : 0;

  return (
    <View style={styles.container}>
      {/* Navigation de date FIXEE en haut */}
      <View style={styles.stickyNavWrap}>
        <GlassCard style={styles.navCard}>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={prevDay} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={COLORS.pinkDark} />
            </TouchableOpacity>

            <View style={styles.dateInfo}>
              <Text style={styles.dateTitle}>{formattedDate}</Text>
              {isToday && <Text style={styles.todayBadge}>Aujourd'hui</Text>}
            </View>

            <TouchableOpacity onPress={nextDay} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.pinkDark} />
            </TouchableOpacity>
          </View>

          {!isToday && (
            <TouchableOpacity
              style={styles.todayBtn}
              onPress={() => setSelectedDate(new Date())}
            >
              <Text style={styles.todayBtnText}>Revenir à aujourd'hui</Text>
            </TouchableOpacity>
          )}
        </GlassCard>
      </View>

      {/* Seul le reste (emplois du temps et tâches) est défilant */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tâches Toute la journée */}
        {allDayTasks.length > 0 && (
          <GlassCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Toute la journée ({allDayTasks.length})</Text>
            <View style={styles.allDayList}>
              {allDayTasks.map((t) => {
                const isDone = t.status === 'Réussi';
                const color = getTaskColor(t);
                const folderName = getFolderName(t);
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.allDayItem, { borderLeftColor: color }]}
                    onPress={() => toggleTaskDone(t.id)}
                  >
                    <Ionicons
                      name={isDone ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isDone ? '#2ecc71' : color}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.allDayText, isDone && styles.doneText]}>{t.title}</Text>
                    {folderName && (
                      <View style={[styles.folderBadge, { backgroundColor: color + '22', borderColor: color }]}>
                        <Text style={[styles.folderBadgeText, { color }]}>{folderName}</Text>
                      </View>
                    )}
                    {t.startDate && t.endDate && t.startDate !== t.endDate && (
                      <Text style={styles.rangeText}>
                        {t.startDate.slice(5)} → {t.endDate.slice(5)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>
        )}

        {/* Timeline des heures */}
        <GlassCard style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Emploi du temps par heure</Text>
          <View style={styles.timelineArea}>
            {/* Lignes d'heures */}
            {Array.from({ length: TOTAL_HOURS }, (_, i) => {
              const hour = START_HOUR + i;
              return (
                <View key={hour} style={[styles.hourSlot, { top: i * HOUR_HEIGHT }]}>
                  <Text style={styles.hourLabel}>{String(hour).padStart(2, '0')}:00</Text>
                  <View style={styles.hourLine} />
                </View>
              );
            })}

            {/* Ligne temps actuel */}
            {showNowLine && (
              <View style={[styles.nowLine, { top: nowTop }]}>
                <View style={styles.nowDot} />
              </View>
            )}

            {/* Événements */}
            <View style={styles.eventsOverlay}>
              {timedTasks.map((t) => {
                const pos = getTaskPosition(t);
                const isDone = t.status === 'Réussi';
                const color = getTaskColor(t);
                const folderName = getFolderName(t);
                const isMultiDay = t.startDate && t.endDate && t.startDate !== t.endDate;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.eventBlock,
                      {
                        top: pos.top,
                        height: pos.height,
                        backgroundColor: color + '22',
                        borderColor: color,
                      },
                    ]}
                    onPress={() => toggleTaskDone(t.id)}
                  >
                    <View style={styles.eventHeaderRow}>
                      <Text style={[styles.eventTitle, { color }, isDone && styles.doneText]}>
                        {t.title}
                      </Text>
                      {folderName && (
                        <View style={[styles.folderBadge, { backgroundColor: color, borderColor: color }]}>
                          <Text style={[styles.folderBadgeText, { color: '#fff' }]}>{folderName}</Text>
                        </View>
                      )}
                    </View>

                    {pos.height > 38 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
                        <Text style={styles.eventTime}>
                          ⏰ {t.startTime || ''}
                          {t.startTime && t.endTime ? ' → ' : ''}
                          {t.endTime || ''}
                        </Text>
                        {isMultiDay && (
                          <Text style={styles.regularBadgeText}>🔁 Régulier</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {timedTasks.length === 0 && allDayTasks.length === 0 && (
              <View style={styles.emptyWrap}>
                <Ionicons name="calendar-clear-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Aucune tâche prévue ce jour</Text>
              </View>
            )}
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stickyNavWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  navCard: { padding: 14 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(216, 27, 96, 0.08)',
  },
  dateInfo: { alignItems: 'center' },
  dateTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, textTransform: 'capitalize' },
  todayBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.pinkDark,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  todayBtn: {
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(216, 27, 96, 0.12)',
  },
  todayBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.pinkDark },

  scrollArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 110 },

  sectionCard: { padding: 14, marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  allDayList: { gap: 8 },
  allDayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderLeftWidth: 4,
  },
  allDayText: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.text },
  doneText: { textDecorationLine: 'line-through', opacity: 0.6 },
  rangeText: { fontSize: 11, color: COLORS.textMuted, marginLeft: 8 },

  folderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 6,
  },
  folderBadgeText: { fontSize: 9, fontWeight: '800' },

  timelineCard: { padding: 14 },
  timelineArea: { height: TOTAL_HOURS * HOUR_HEIGHT, marginTop: 10, position: 'relative' },
  hourSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: HOUR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hourLabel: { width: 44, fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  hourLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.06)', marginTop: 6 },
  nowLine: {
    position: 'absolute',
    left: 44,
    right: 0,
    height: 2,
    backgroundColor: '#e74c3c',
    zIndex: 10,
  },
  nowDot: {
    position: 'absolute',
    left: -4,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
  },
  eventsOverlay: { position: 'absolute', left: 48, right: 0, top: 0, bottom: 0 },
  eventBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  eventHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventTitle: { fontSize: 12, fontWeight: '700', flex: 1 },
  eventTime: { fontSize: 10, color: COLORS.textLight, marginTop: 1 },
  regularBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.pinkDark, marginTop: 1 },
  emptyWrap: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { marginTop: 6, fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
});
