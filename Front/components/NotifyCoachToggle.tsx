import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

export default function NotifyCoachToggle({ enabled, onToggle }: Props) {
  return (
    <TouchableOpacity style={[styles.container, enabled && styles.containerActive]} onPress={() => onToggle(!enabled)} activeOpacity={0.7}>
      <Ionicons name={enabled ? "notifications" : "notifications-outline"} size={18} color={enabled ? "#3498DB" : "#666"} />
      <Text style={[styles.label, enabled && styles.labelActive]}>Notify Coach</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#232D3F', borderWidth: 1, borderColor: 'transparent' },
  containerActive: { backgroundColor: 'rgba(52, 152, 219, 0.1)', borderColor: 'rgba(52, 152, 219, 0.3)' },
  label: { color: '#666', fontSize: 13, fontWeight: '600' },
  labelActive: { color: '#3498DB' },
});
