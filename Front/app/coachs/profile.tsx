import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import Constants from 'expo-constants';
import { getUserDetails } from '@/services/authStorage';
import { getToken } from '@/services/authStorage';
import Toast from 'react-native-toast-message';

const CoachProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [savingDesc, setSavingDesc] = useState(false);

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const session = await getUserDetails();
        if (session?.id) {
          const response = await axios.get(`${API_URL}/users/me/${session.id}`);
          setUser(response.data);
          setDescription(response.data?.description || '');
        }
      } catch (error) {
        Alert.alert("Error", "Could not load professional profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoachData();
  }, []);

  const handleSaveDescription = async () => {
    setSavingDesc(true);
    try {
      const token = await getToken();
      await axios.patch(`${API_URL}/users/me/description`, 
        { description: description }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      setIsEditingDesc(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error saving description' });
    } finally {
      setSavingDesc(false);
    }
  };

  const clearDescription = () => {
    setDescription('');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
    >
      <View style={styles.headerCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{user?.firstname?.[0]}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-sharp" size={12} color="white" />
          </View>
        </View>
        <Text style={styles.coachName}>{user?.firstname} {user?.lastname}</Text>
        <Text style={styles.coachTitle}>Elite Performance Coach</Text>
      </View>

      <Text style={styles.sectionTitle}>Business Insights</Text>
      <View style={styles.insightsRow}>
        <View style={styles.insightCard}>
            <Text style={styles.insightValue}>12</Text>
            <Text style={styles.insightLabel}>Active Clients</Text>
        </View>
        <View style={styles.insightCard}>
            <Text style={styles.insightValue}>154</Text>
            <Text style={styles.insightLabel}>Workouts</Text>
        </View>
        <View style={styles.insightCard}>
            <Text style={styles.insightValue}>28</Text>
            <Text style={styles.insightLabel}>Forum Posts</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {!isEditingDesc && (
            <TouchableOpacity onPress={() => setIsEditingDesc(true)}>
              <Ionicons name="pencil" size={24} color="#3498DB" />
            </TouchableOpacity>
          )}
        </View>

        {isEditingDesc ? (
          <View>
            <View style={styles.descEditContainer}>
              <TextInput
                style={styles.textArea}
                multiline
                maxLength={150}
                value={description}
                onChangeText={setDescription}
                placeholder="Write a short bio to present yourself to clients..."
                placeholderTextColor="#888"
              />
              <View style={styles.editFooter}>
                <TouchableOpacity onPress={clearDescription} style={styles.clearButton}>
                  <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
                <Text style={[styles.charCount, description.length >= 150 && { color: '#e74c3c' }]}>
                  {description.length}/150
                </Text>
              </View>
            </View>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity 
                style={[styles.saveButton, styles.cancelButton]} 
                onPress={() => {
                  setDescription(user?.description || '');
                  setIsEditingDesc(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveDescription}
                disabled={savingDesc}
              >
                {savingDesc ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Description</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.descDisplayContainer}>
            <Text style={styles.descText}>
              {description || "You haven't added a description yet. Click the pencil icon to introduce yourself!"}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Certifications</Text>
      <View style={styles.card}>
        <View style={styles.certItem}>
            <Ionicons name="ribbon-outline" size={20} color="#3498DB" />
            <Text style={styles.certText}>NASM Certified Personal Trainer</Text>
        </View>
        <View style={styles.certItem}>
            <Ionicons name="ribbon-outline" size={20} color="#3498DB" />
            <Text style={styles.certText}>Precision Nutrition Level 1</Text>
        </View>
        <View style={[styles.certItem, { borderBottomWidth: 0 }]}>
            <Ionicons name="ribbon-outline" size={20} color="#3498DB" />
            <Text style={styles.certText}>CrossFit Level 2 Instructor</Text>
        </View>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1F2B', paddingHorizontal: 16 },
  headerCard: { alignItems: 'center', marginVertical: 20 },
  avatarLarge: { 
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#3498DB', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    borderWidth: 3, borderColor: '#2A4562'
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: 'white' },
  verifiedBadge: { 
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2ecc71', 
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#1A1F2B',
    justifyContent: 'center', alignItems: 'center'
  },
  coachName: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  coachTitle: { color: '#3498DB', fontSize: 14, fontWeight: '600', marginTop: 4 },

  sectionContainer: { marginTop: 20 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  descEditContainer: { backgroundColor: '#1E2C3D', borderRadius: 10, borderWidth: 1, borderColor: '#3498DB', padding: 2, marginBottom: 15 },
  textArea: { color: 'white', fontSize: 15, minHeight: 80, padding: 12, textAlignVertical: 'top' },
  editFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 8 },
  clearButton: { flexDirection: 'row', alignItems: 'center' },
  clearText: { color: '#e74c3c', fontSize: 12, marginLeft: 4 },
  charCount: { color: '#888', fontSize: 11 },
  
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { flex: 0.65, backgroundColor: '#3498DB', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  cancelButton: { flex: 0.3, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#888' },
  cancelButtonText: { color: '#888', fontWeight: 'bold', fontSize: 15 },

  descDisplayContainer: { backgroundColor: '#2A4562', padding: 15, borderRadius: 10 },
  descText: { color: '#ccc', fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginTop: 25, marginBottom: 12 },
  insightsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  insightCard: { backgroundColor: '#2A4562', width: '31%', padding: 15, borderRadius: 15, alignItems: 'center' },
  insightValue: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  insightLabel: { color: '#aaa', fontSize: 10, marginTop: 4, textAlign: 'center' },

  card: { backgroundColor: '#2A4562', borderRadius: 15, padding: 20, marginBottom: 10 },
  bioText: { color: '#ccc', lineHeight: 22, fontSize: 14 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  tag: { backgroundColor: 'rgba(52, 152, 219, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#3498DB' },
  tagText: { color: '#3498DB', fontSize: 10, fontWeight: 'bold' },

  certItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  certText: { color: 'white', marginLeft: 12, fontSize: 14 }
});

export default CoachProfileScreen;