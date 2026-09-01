import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCourseColor, getDisplayTitle } from '../config/courseColors';
import { isCarpoolPossible } from '../config/schedules';
import {
  HOUR_HEIGHT,
  START_HOUR,
  END_HOUR,
  TOTAL_HOURS,
  formatLocalDate,
  formatHM,
  getEventPosition,
} from '../utils/planningTime';
import { COLORS } from '../theme';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const MONTHS_SHORT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay(); // 0 = dimanche
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

export default function PlanningWeekView({ events, currentTheme }) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);

  const rangeLabel = `lun. ${weekStart.getDate()} ${MONTHS_SHORT[weekStart.getMonth()]} → dim. ${weekEnd.getDate()} ${MONTHS_SHORT[weekEnd.getMonth()]}`;

  const eventsByDay = useMemo(() => {
    const map = new Map();
    weekDays.forEach((d) => map.set(formatLocalDate(d), []));
    events.forEach((evt) => {
      if (evt.allDay) return;
      const key = formatLocalDate(new Date(evt.start));
      if (map.has(key)) map.get(key).push(evt);
    });
    return map;
  }, [events, weekDays]);

  const goPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const goNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToday = () => setWeekStart(getMonday(new Date()));

  const todayStr = formatLocalDate(new Date());

  return (
    <View style={styles.container}>
      {/* Navigation semaine */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={goPrevWeek} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToday} style={styles.navBtn}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goNextWeek} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.rangeLabel}>{rangeLabel}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.gridScroll}>
        <View style={styles.grid}>
          {/* Gouttière des heures */}
          <View style={styles.hourGutter}>
            <View style={{ height: 40 }} />
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <View key={i} style={{ height: HOUR_HEIGHT }}>
                <Text style={styles.hourLabel}>{String(START_HOUR + i).padStart(2, '0')}:00</Text>
              </View>
            ))}
          </View>

          {/* Colonnes des jours */}
          {weekDays.map((day) => {
            const dateStr = formatLocalDate(day);
            const isToday = dateStr === todayStr;
            const dayEvents = eventsByDay.get(dateStr) || [];
            const carpoolPossible = isCarpoolPossible(dateStr);
            return (
              <View key={dateStr} style={styles.dayColumn}>
                <View style={[styles.dayHeader, isToday && { backgroundColor: currentTheme.tint }]}>
                  <Text style={[styles.dayHeaderName, isToday && { color: currentTheme.primary }]}>
                    {DAY_NAMES[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                  </Text>
                  <Text style={[styles.dayHeaderDate, isToday && { color: currentTheme.primary, fontWeight: '800' }]}>
                    {String(day.getDate()).padStart(2, '0')}/{String(day.getMonth() + 1).padStart(2, '0')}
                  </Text>
                  {carpoolPossible && (
                    <Ionicons name="car-sport-outline" size={12} color="#1a8f4e" style={{ marginTop: 1 }} />
                  )}
                </View>

                <View style={styles.dayBody}>
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <View key={i} style={[styles.hourLine, { top: i * HOUR_HEIGHT }]} />
                  ))}

                  {dayEvents.map((evt) => {
                    const pos = getEventPosition(evt);
                    const color = getCourseColor(evt.title);
                    const descLines = (evt.description || '').split('\n').filter(Boolean);
                    return (
                      <View
                        key={evt.id}
                        style={[
                          styles.eventBlock,
                          { top: pos.top, height: pos.height, backgroundColor: color },
                        ]}
                      >
                        <Text style={styles.eventTitle} numberOfLines={3}>{getDisplayTitle(evt.title)}</Text>
                        {pos.height > 60 && !!evt.location && (
                          <Text style={styles.eventMeta} numberOfLines={1}>{evt.location}</Text>
                        )}
                        {pos.height > 90 && descLines.slice(0, 2).map((line, i) => (
                          <Text key={i} style={styles.eventMetaItalic} numberOfLines={1}>{line}</Text>
                        ))}
                        {pos.height > 45 && (
                          <Text style={styles.eventTime}>
                            {formatHM(evt.start)} - {formatHM(evt.end)}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  rangeLabel: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: COLORS.text },

  gridScroll: { flex: 1, paddingHorizontal: 16 },
  grid: { flexDirection: 'row', paddingBottom: 40 },

  hourGutter: { width: 52 },
  hourLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginTop: -6 },

  dayColumn: { flex: 1, marginLeft: 8 },
  dayHeader: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 2,
  },
  dayHeaderName: { fontSize: 12, fontWeight: '800', color: COLORS.text, textTransform: 'uppercase' },
  dayHeaderDate: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },

  dayBody: {
    height: TOTAL_HOURS * HOUR_HEIGHT,
    position: 'relative',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.06)',
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  eventBlock: {
    position: 'absolute',
    left: 3,
    right: 3,
    borderRadius: 10,
    padding: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: { fontSize: 12, fontWeight: '800', color: '#fff' },
  eventMeta: { fontSize: 10.5, fontWeight: '600', color: 'rgba(255,255,255,0.92)', marginTop: 2 },
  eventMetaItalic: { fontSize: 10, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  eventTime: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginTop: 3 },
});
