import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TodoContext } from '../ctx/TodoContext';
import { COLORS, STATUS_COLORS } from '../theme';
import GlassCard from '../components/GlassCard';

const DAYS   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export default function Agenda() {
  const { tasks } = useContext(TodoContext);
  const [current, setCurrent] = useState(new Date());
  const year  = current.getFullYear();
  const month = current.getMonth();
  const today = new Date().toISOString().split('T')[0];

  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      if (!map.has(t.dueDate)) map.set(t.dueDate, []);
      map.get(t.dueDate).push(t);
    });
    return map;
  }, [tasks]);

  const days = useMemo(() => {
    const first    = new Date(year, month, 1).getDay();
    const start    = first === 0 ? 6 : first - 1;
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();
    const result   = [];
    for (let i = start - 1; i >= 0; i--) result.push({ day: prevLast - i, out: true });
    for (let d = 1; d <= lastDate; d++) {
      const date = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      result.push({ day: d, out: false, date });
    }
    while (result.length % 7 !== 0) result.push({ day: result.length - start - lastDate + 1, out: true });
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
          <LinearGradient colors={[COLORS.pinkDark, COLORS.red]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.todayBtn}>
            <Text style={styles.todayBtnText}>Aujourd'hui</Text>
          </LinearGradient>
        </TouchableOpacity>
      </GlassCard>

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
              const isToday  = cell.date === today;
              const cellTasks = cell.date ? tasksByDate.get(cell.date) || [] : [];
              return (
                <View key={ci} style={[styles.cell, cell.out && styles.cellOut, isToday && styles.cellToday]}>
                  <Text style={[styles.cellDay, cell.out && styles.cellDayOut, isToday && styles.cellDayToday]}>
                    {cell.day}
                  </Text>
                  {cellTasks.slice(0, 2).map((t) => (
                    <View key={t.id} style={[styles.taskDot, { backgroundColor: STATUS_COLORS[t.status] || COLORS.pinkLight }]}>
                      <Text style={styles.taskDotText} numberOfLines={1}>{t.title}</Text>
                    </View>
                  ))}
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
  /* nav — .agenda-nav */
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)',
  },
  navBtnText: { fontSize: 14, color: COLORS.text },
  monthTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: COLORS.text },
  todayBtn: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  todayBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  /* grille */
  grid: {},
  weekRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.3)' },
  /* en-têtes — .agenda-grid th */
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(255,102,179,0.6)',
  },
  dayHeaderText: { fontSize: 11, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  /* cellules — .agenda-grid td */
  cell: {
    flex: 1,
    minHeight: 70,
    padding: 4,
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cellOut: { backgroundColor: 'rgba(0,0,0,0.04)' },
  /* .agenda-today */
  cellToday: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  cellDay: { fontSize: 11, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cellDayOut: { color: '#ddd', fontWeight: '400' },
  cellDayToday: { color: COLORS.pinkDark, fontWeight: '900' },
  /* tâches dans la cellule — .agenda-grid li */
  taskDot: { borderRadius: 6, paddingHorizontal: 3, paddingVertical: 1, marginBottom: 1 },
  taskDotText: { fontSize: 8, color: COLORS.text, fontWeight: '700' },
  moreTasks: { fontSize: 8, color: COLORS.textMuted, fontWeight: '700' },
});
