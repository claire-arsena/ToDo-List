import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TodoContext } from '../ctx/TodoContext';
import { ModalContext } from '../ctx/ModalContext';
import GlassCard from '../components/GlassCard';
import { COLORS } from '../theme';

export default function Folders() {
  const { folders, deleteFolder } = useContext(TodoContext);
  const { openModal } = useContext(ModalContext);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Bouton nouveau dossier — .btn-primary */}
      <TouchableOpacity onPress={() => openModal('folder')} activeOpacity={0.85}>
        <LinearGradient colors={[COLORS.pinkDark, COLORS.red]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.newBtn}>
          <Text style={styles.newBtnText}>+ Nouveau dossier</Text>
        </LinearGradient>
      </TouchableOpacity>

      {folders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucun dossier.{'\n'}Créez-en un pour organiser vos tâches !</Text>
        </View>
      ) : (
        folders.map((folder) => (
          <GlassCard key={folder.id} style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.folderTitle}>{folder.title}</Text>
              {folder.description ? <Text style={styles.folderDesc}>{folder.description}</Text> : null}
            </View>
            <View style={styles.cardActions}>
              {/* btn-secondary */}
              <TouchableOpacity style={styles.btnSecondary} onPress={() => openModal('folder', folder)}>
                <Text style={styles.btnSecondaryText}>Modifier</Text>
              </TouchableOpacity>
              {/* btn-danger */}
              <TouchableOpacity onPress={() => deleteFolder(folder.id)} style={styles.actionBtn}>
                <LinearGradient colors={[COLORS.red, COLORS.redDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnDangerInner}>
                  <Text style={styles.btnDangerText}>Supprimer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  /* btn-primary */
  newBtn: {
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#ff66b3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: COLORS.textMuted, textAlign: 'center', fontStyle: 'italic', lineHeight: 24 },
  card: { padding: 16, marginBottom: 12 },
  info: { marginBottom: 12 },
  folderTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  folderDesc: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1 },
  /* btn-secondary */
  btnSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 50,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btnSecondaryText: { color: COLORS.pinkDark, fontWeight: '700', fontSize: 13 },
  /* btn-danger */
  btnDangerInner: {
    borderRadius: 50,
    paddingVertical: 9,
    alignItems: 'center',
    shadowColor: '#ff5c5c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDangerText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
