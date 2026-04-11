import React, { useContext, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { TodoContext } from '../ctx/TodoContext';
import { ETATS } from '../config/constants';
import { COLORS, STATUS_COLORS, GLASS, RADIUS, SHADOWS } from '../theme';

const screenWidth = Dimensions.get('window').width;

const CHART_COLORS = {
  [ETATS.NOUVEAU]: COLORS.statusNew,
  [ETATS.EN_COURS]: COLORS.statusProgress,
  [ETATS.REUSSI]: COLORS.statusDone,
  [ETATS.EN_ATTENTE]: COLORS.statusWaiting,
  [ETATS.ABANDONNE]: COLORS.statusCancelled,
};

const chartConfig = {
  color: (opacity = 1) => `rgba(255, 102, 179, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
};

export default function Dashboard() {
  const { tasks } = useContext(TodoContext);

  const chartData = useMemo(() => {
    const counts = {};
    Object.values(ETATS).forEach((status) => {
      counts[status] = 0;
    });
    tasks.forEach((task) => {
      if (counts[task.status] !== undefined) {
        counts[task.status]++;
      }
    });

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        population: count,
        color: CHART_COLORS[status] || COLORS.pinkLight,
        legendFontColor: COLORS.text,
        legendFontSize: 13,
      }));
  }, [tasks]);

  const total = tasks.length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {total === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Aucune tâche à afficher</Text>
        </View>
      ) : (
        <>
          {/* Graphique */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Répartition par statut</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              hasLegend={true}
              style={styles.chart}
            />
          </View>

          {/* Tableau récapitulatif */}
          <View style={styles.tableCard}>
            <Text style={styles.tableTitle}>Détail</Text>
            {chartData.map((item) => {
              const percent = Math.round((item.population / total) * 100);
              return (
                <View key={item.name} style={styles.tableRow}>
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={styles.tableLabel}>{item.name}</Text>
                  <Text style={styles.tableCount}>{item.population}</Text>
                  <Text style={styles.tablePercent}>{percent}%</Text>
                </View>
              );
            })}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalCount}>{total}</Text>
              <Text style={styles.totalPercent}>100%</Text>
            </View>
          </View>
        </>
      )}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  chartCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: RADIUS.lg,
  },
  tableCard: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    padding: 16,
    ...SHADOWS.card,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  tableLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  tableCount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 16,
    minWidth: 24,
    textAlign: 'right',
  },
  tablePercent: {
    fontSize: 13,
    color: COLORS.textMuted,
    minWidth: 40,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    paddingLeft: 22,
  },
  totalCount: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.pinkDark,
    marginRight: 16,
    minWidth: 24,
    textAlign: 'right',
  },
  totalPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.pinkDark,
    minWidth: 40,
    textAlign: 'right',
  },
});
