import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface YouTubeVideoModalProps {
  visible: boolean;
  exerciseName: string;
  videoUrl?: string;
  onClose: () => void;
}

/**
 * Extract YouTube video ID from various URL formats and return an embed URL.
 * Falls back to a YouTube search embed if no video ID can be extracted.
 */
function getEmbedUrl(videoUrl: string | undefined, exerciseName: string): string {
  if (videoUrl) {
    // Match youtube.com/watch?v=ID or youtu.be/ID or youtube.com/embed/ID
    const watchMatch = videoUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    const shortMatch = videoUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    const embedMatch = videoUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);

    const videoId = watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
  }

  // No valid video URL — use YouTube embedded search results
  const query = encodeURIComponent(exerciseName + ' exercise tutorial');
  return `https://www.youtube.com/embed?listType=search&list=${query}`;
}

export default function YouTubeVideoModal({ visible, exerciseName, videoUrl, onClose }: YouTubeVideoModalProps) {
  const embedUrl = getEmbedUrl(videoUrl, exerciseName);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{exerciseName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.iframeWrapper}>
          <iframe
            src={embedUrl}
            style={{
              border: 'none',
              width: '100%',
              height: '100%',
              position: 'absolute' as any,
              top: 0,
              left: 0,
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </View>
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
  iframeWrapper: {
    flex: 1,
    position: 'relative' as any,
  },
});
