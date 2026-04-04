import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface YouTubeVideoModalProps {
  visible: boolean;
  exerciseName: string;
  videoUrl?: string;
  onClose: () => void;
}

export default function YouTubeVideoModal({ visible, exerciseName, videoUrl, onClose }: YouTubeVideoModalProps) {
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' exercise tutorial')}`;
  const url = videoUrl || youtubeSearchUrl;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{exerciseName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <iframe
          src={url}
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  closeBtn: {
    padding: 4,
  },
});
