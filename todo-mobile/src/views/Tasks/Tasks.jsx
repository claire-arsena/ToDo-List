import React, { useContext, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { TodoContext } from '../../ctx/TodoContext';
import TasksItem from './TasksItem';
import GlassCard from '../../components/GlassCard';
import { COLORS } from '../../theme';

export default function Tasks() {
  const { tasks } = useContext(TodoContext);
  const [filterTab, setFilterTab] = useState('active'); // 'all', 'active', 'completed'

  const filtered = useMemo(() => {
    let r = [...tasks];
    if (filterTab === 'active') {
      r = r.filter((t) => t.status !== 'Réussi' && t.status !== 'Abandonné');
    } else if (filterTab === 'completed') {
      r = r.filter((t) => t.status === 'Réussi' || t.status === 'Abandonné');
    }

    // Sort by earliest date (startDate or dueDate)
    r.sort((a, b) => {
      const dateA = a.startDate || a.dueDate || '9999-99-99';
      const dateB = b.startDate || b.dueDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    });

    return r;
  }, [tasks, filterTab]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Filters: Tout / En cours / Terminés */}
      <GlassCard style={styles.filterCard}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, filterTab === 'active' && styles.tabBtnActive]}
            onPress={() => setFilterTab('active')}
          >
            <Text style={[styles.tabText, filterTab === 'active' && styles.tabTextActive]}>
              En cours ({tasks.filter((t) => t.status !== 'Réussi' && t.status !== 'Abandonné').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, filterTab === 'all' && styles.tabBtnActive]}
            onPress={() => setFilterTab('all')}
          >
            <Text style={[styles.tabText, filterTab === 'all' && styles.tabTextActive]}>
              Toutes ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, filterTab === 'completed' && styles.tabBtnActive]}
            onPress={() => setFilterTab('completed')}
          >
            <Text style={[styles.tabText, filterTab === 'completed' && styles.tabTextActive]}>
              Terminées ({tasks.filter((t) => t.status === 'Réussi' || t.status === 'Abandonné').length})
            </Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Task List */}
      <View style={styles.list}>
        {filtered.length > 0 ? (
          filtered.map((task) => <TasksItem key={task.id} task={task} />)
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>
              {filterTab === 'completed' ? 'Aucune tâche terminée' : 'Aucune tâche en cours'}
            </Text>
            <Text style={styles.emptySub}>
              {filterTab === 'active' ? 'Appuyez sur + pour ajouter votre première tâche !' : ''}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  filterCard: { padding: 6, marginBottom: 16 },
  tabRow: { flexDirection: 'row', gap: 6 },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: COLORS.pinkDark,
  },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.textLight },
  tabTextActive: { color: '#fff' },
  list: { gap: 4 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  emptySub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
});
