import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TodoContext } from '../ctx/TodoContext';
import { COLORS, STATUS_COLORS } from '../theme';
import GlassCard from '../components/GlassCard';
import { getTodayStr, normalizeDateStr } from '../config/constants';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function Agenda() {
  const { tasks, folders } = useContext(TodoContext);
  const [current, setCurrent] = useState(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const today = getTodayStr();

  const getTaskColor = (t) => {
    if (t.folderId) {
      const f = folders.find((folder) => folder.id === t.folderId);
      if (f?.color) return f.color;
    }
    return STATUS_COLORS[t.status] || COLORS.pinkDark;
  };

  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const start = normalizeDateStr(t.startDate || t.dueDate);
      const end = normalizeDateStr(t.endDate || t.dueDate || start);
      if (!start) return;

      const partsStart = start.split('-').map(Number);
      const partsEnd = (end || start).split('-').map(Number);
      if (partsStart.length !== 3) return;

      const [sy, sm, sd] = partsStart;
      const ey = partsEnd[0] || sy;
      const em = partsEnd[1] || sm;
      const ed = partsEnd[2] || sd;

      let cur = new Date(sy, sm - 1, sd);
      const last = new Date(ey, em - 1, ed);

      while (cur <= last) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;

        if (!map.has(dStr)) map.set(dStr, []);
        map.get(dStr).push(t);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [tasks]);

  const undatedTasks = useMemo(() => tasks.filter((t) => !t.startDate && !t.endDate && !t.dueDate), [tasks]);

  const days = useMemo(() => {
    const firstDayObj = new Date(year, month, 1);
    const dayOfWeek = firstDayObj.getDay(); // 0: Dimanche, 1: Lundi ... 6: Samedi
    const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Alignement Lundi = 0
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();

    const result = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      result.push({ day: prevLast - i, out: true });
    }
    for (let d = 1; d <= lastDate; d++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ day: d, out: false, date });
    }
    while (result.length % 7 !== 0) {
      result.push({ day: result.length - startOffset - lastDate + 1, out: true });
    }
    return result;
  }, [year, month]);

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Navigation mois */}
      <GlassCard style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setCurrent(new Date(year, month - 1, 1))}>
          <Text style={styles.navBtnText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => setCurrent(new Date(year, month + 1, 1))}>
          <Text style={styles.navBtnText}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrent(new Date())}>
          <LinearGradient colors={[COLORS.pinkDark, COLORS.pinkDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.todayBtn}>
            <Text style={styles.todayBtnText}>Aujourd'hui</Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>

      {/* Tâches sans date */}
      {undatedTasks.length > 0 && (
        <GlassCard style={styles.undatedSection}>
          <Text style={styles.undatedTitle}>Sans date</Text>
          {undatedTasks.map((t) => {
            const taskColor = getTaskColor(t);
            return (
              <View key={t.id} style={[styles.undatedChip, { backgroundColor: taskColor }]}>
                <Text style={styles.undatedChipText} numberOfLines={1}>{t.title}</Text>
              </View>
            );
          })}
        </GlassCard>
      )}

      {/* Grille calendrier */}
      <GlassCard style={styles.grid}>
        {/* En-têtes jours */}
        <View style={styles.weekRow}>
          {DAYS.map((d) => (
            <View key={d} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>
        {/* Semaines */}
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((cell, ci) => {
              const isToday = cell.date === today;
              const cellTasks = cell.date ? tasksByDate.get(cell.date) || [] : [];
              return (
                <View key={ci} style={[styles.cell, cell.out && styles.cellOut, isToday && styles.cellToday]}>
                  <Text style={[styles.cellDay, cell.out && styles.cellDayOut, isToday && styles.cellDayToday]}>
                    {cell.day}
                  </Text>
                  {cellTasks.slice(0, 2).map((t) => {
                    const taskColor = getTaskColor(t);
                    return (
                      <View key={t.id} style={[styles.taskDot, { backgroundColor: taskColor }]}>
                        <Text style={styles.taskDotText} numberOfLines={1}>{t.title}</Text>
                      </View>
                    );
                  })}
                  {cellTasks.length > 2 && <Text style={styles.moreTasks}>+{cellTasks.length - 2}</Text>}
                </View>
              );
            })}
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  navBtnText: { fontSize: 14, color: COLORS.text },
  monthTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: COLORS.text },
  todayBtn: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  todayBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  grid: {},
  weekRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(216, 27, 96, 0.08)',
  },
  dayHeaderText: { fontSize: 11, fontWeight: '800', color: COLORS.pinkDark, textTransform: 'uppercase' },
  cell: {
    flex: 1,
    minHeight: 70,
    padding: 4,
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'transparent',
  },
  cellOut: { backgroundColor: 'rgba(0,0,0,0.03)' },
  cellToday: {
    backgroundColor: 'rgba(216, 27, 96, 0.06)',
  },
  cellDay: { fontSize: 11, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cellDayOut: { color: COLORS.textMuted, fontWeight: '400' },
  cellDayToday: { color: COLORS.pinkDark, fontWeight: '900' },
  taskDot: { borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2, marginBottom: 2 },
  taskDotText: { fontSize: 9, color: '#fff', fontWeight: '800' },
  moreTasks: { fontSize: 8, color: COLORS.textMuted, fontWeight: '700' },
  undatedSection: { padding: 12, marginBottom: 12, gap: 8 },
  undatedTitle: { fontSize: 14, fontWeight: '800', color: COLORS.pinkDark, marginBottom: 4 },
  undatedChip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4 },
  undatedChipText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  restrictedContainer: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  restrictedCard: { padding: 30, alignItems: 'center', gap: 12, width: '100%', maxWidth: 400 },
  restrictedTitle: { fontSize: 20, fontWeight: '800', color: COLORS.pinkDark },
  restrictedSub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
});
