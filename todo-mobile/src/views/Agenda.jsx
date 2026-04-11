import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS } from '../config/constants';
import { COLORS, STATUS_COLORS, GLASS, RADIUS, SHADOWS } from '../theme';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function Agenda() {
  const { tasks } = useContext(TodoContext);
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
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
    const first = new Date(year, month, 1).getDay();
    const start = first === 0 ? 6 : first - 1;
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();
    const result = [];

    for (let i = start - 1; i >= 0; i--)
      result.push({ day: prevLast - i, out: true });

    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ day: d, out: false, date: dateStr });
    }

    while (result.length % 7 !== 0)
      result.push({ day: result.length - start - lastDate + 1, out: true });

    return result;
  }, [year, month]);

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Navigation mois */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setCurrent(new Date(year, month - 1, 1))}
        >
          <Text style={styles.navBtnText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[month]} {year}
        </Text>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => setCurrent(new Date(year, month + 1, 1))}
        >
          <Text style={styles.navBtnText}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.todayBtn}
          onPress={() => setCurrent(new Date())}
        >
          <Text style={styles.todayBtnText}>Aujourd'hui</Text>
        </TouchableOpacity>
      </View>

      {/* Grille */}
      <View style={styles.grid}>
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
                <View
                  key={ci}
                  style={[
                    styles.cell,
                    cell.out && styles.cellOut,
                    isToday && styles.cellToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellDay,
                      cell.out && styles.cellDayOut,
                      isToday && styles.cellDayToday,
                    ]}
                  >
                    {cell.day}
                  </Text>
                  {cellTasks.slice(0, 2).map((t) => (
                    <View
                      key={t.id}
                      style={[
                        styles.taskDot,
                        { backgroundColor: STATUS_COLORS[t.status] || COLORS.pinkLight },
                      ]}
                    >
                      <Text style={styles.taskDotText} numberOfLines={1}>
                        {t.title}
                      </Text>
                    </View>
                  ))}
                  {cellTasks.length > 2 && (
                    <Text style={styles.moreTasks}>+{cellTasks.length - 2}</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    padding: 10,
    marginBottom: 12,
    gap: 8,
    ...SHADOWS.card,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  navBtnText: {
    fontSize: 14,
    color: COLORS.text,
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  todayBtn: {
    backgroundColor: COLORS.pinkDark,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  todayBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  weekRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(255,102,179,0.1)',
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.pinkDark,
    textTransform: 'uppercase',
  },
  cell: {
    flex: 1,
    minHeight: 60,
    padding: 3,
    borderRightWidth: 0.5,
    borderRightColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'transparent',
  },
  cellOut: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  cellToday: {
    backgroundColor: 'rgba(255,102,179,0.12)',
  },
  cellDay: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  cellDayOut: {
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  cellDayToday: {
    color: COLORS.pinkDark,
    fontWeight: '800',
  },
  taskDot: {
    borderRadius: 3,
    paddingHorizontal: 2,
    paddingVertical: 1,
    marginBottom: 1,
  },
  taskDotText: {
    fontSize: 8,
    color: COLORS.text,
    fontWeight: '600',
  },
  moreTasks: {
    fontSize: 8,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
