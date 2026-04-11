import React, { useContext, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS } from '../config/constants';
import { COLORS, STATUS_COLORS } from '../theme';
import GlassCard from '../components/GlassCard';

const screenWidth = Dimensions.get('window').width;

const CHART_COLORS = {
  [ETATS.NOUVEAU]:    COLORS.statusNew,
  [ETATS.EN_COURS]:   COLORS.statusProgress,
  [ETATS.REUSSI]:     COLORS.statusDone,
  [ETATS.EN_ATTENTE]: COLORS.statusWaiting,
  [ETATS.ABANDONNE]:  COLORS.statusCancelled,
};

const chartConfig = {
  color: (opacity = 1) => `rgba(255, 102, 179, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(38, 38, 38, ${opacity})`,
};

export default function Dashboard() {
  const { tasks } = useContext(TodoContext);

  const chartData = useMemo(() => {
    const counts = {};
    Object.values(ETATS).forEach((s) => { counts[s] = 0; });
    tasks.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });
    return Object.entries(counts)
      .filter(([, c]) => c > 0)
      .map(([status, count]) => ({
        name: status, population: count,
        color: CHART_COLORS[status] || COLORS.pinkLight,
        legendFontColor: COLORS.text, legendFontSize: 13,
      }));
  }, [tasks]);

  const total = tasks.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {total === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>Aucune tâche à afficher</Text></View>
      ) : (
        <>
          {/* chart-container — border-radius: 40px */}
          <GlassCard style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Répartition par statut</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 80}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              hasLegend
              style={styles.chart}
            />
          </GlassCard>

          {/* Tableau détail */}
          <GlassCard style={styles.tableCard}>
            <Text style={styles.sectionTitle}>Détail</Text>
            {chartData.map((item) => {
              const percent = Math.round((item.population / total) * 100);
              return (
                <View key={item.name} style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={styles.rowLabel}>{item.name}</Text>
                  <Text style={styles.rowCount}>{item.population}</Text>
                  <Text style={styles.rowPercent}>{percent}%</Text>
                </View>
              );
            })}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalCount}>{total}</Text>
              <Text style={styles.totalPercent}>100%</Text>
            </View>
          </GlassCard>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, fontStyle: 'italic' },
  /* chart-container — border-radius: 40px */
  chartCard: { padding: 20, marginBottom: 16, alignItems: 'center', borderRadius: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.pinkDark, marginBottom: 12, alignSelf: 'flex-start' },
  chart: { borderRadius: 16 },
  tableCard: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.4)' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  rowLabel: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  rowCount: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginRight: 16, minWidth: 24, textAlign: 'right' },
  rowPercent: { fontSize: 13, color: COLORS.textMuted, minWidth: 40, textAlign: 'right' },
  totalRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, marginTop: 2 },
  totalLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text, paddingLeft: 22 },
  totalCount: { fontSize: 14, fontWeight: '700', color: COLORS.pinkDark, marginRight: 16, minWidth: 24, textAlign: 'right' },
  totalPercent: { fontSize: 13, fontWeight: '700', color: COLORS.pinkDark, minWidth: 40, textAlign: 'right' },
});
