import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { TodoContext } from '../ctx/TodoContext';
import { ModalContext } from '../ctx/ModalContext';
import { COLORS, GLASS, RADIUS, SHADOWS } from '../theme';

export default function Folders() {
  const { folders, deleteFolder } = useContext(TodoContext);
  const { openModal } = useContext(ModalContext);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Bouton nouveau dossier */}
      <TouchableOpacity
        style={styles.newFolderBtn}
        onPress={() => openModal('folder')}
        activeOpacity={0.8}
      >
        <Text style={styles.newFolderText}>+ Nouveau dossier</Text>
      </TouchableOpacity>

      {/* Liste des dossiers */}
      {folders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Aucun dossier.{'\n'}Créez-en un pour organiser vos tâches !
          </Text>
        </View>
      ) : (
        folders.map((folder) => (
          <View key={folder.id} style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.folderTitle}>{folder.title}</Text>
              {folder.description ? (
                <Text style={styles.folderDesc}>{folder.description}</Text>
              ) : null}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => openModal('folder', folder)}
              >
                <Text style={styles.btnSecondaryText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnDanger}
                onPress={() => deleteFolder(folder.id)}
              >
                <Text style={styles.btnDangerText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
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
  newFolderBtn: {
    backgroundColor: COLORS.pinkDark,
    borderRadius: RADIUS.full,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  newFolderText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  card: {
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.card,
  },
  cardInfo: {
    marginBottom: 10,
  },
  folderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  folderDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: COLORS.glassBg,
    borderRadius: RADIUS.full,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  btnSecondaryText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  btnDanger: {
    flex: 1,
    backgroundColor: 'rgba(231,76,60,0.1)',
    borderRadius: RADIUS.full,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.3)',
  },
  btnDangerText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13,
  },
});
