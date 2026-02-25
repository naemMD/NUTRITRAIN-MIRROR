import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import Constants from 'expo-constants';
import { getUserDetails } from '@/services/authStorage';

const CoachProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const session = await getUserDetails();
        if (session?.id) {
          const response = await axios.get(`${API_URL}/users/me/${session.id}`);
          setUser(response.data);
        }
      } catch (error) {
        Alert.alert("Error", "Could not load professional profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoachData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      <Text style={styles.sectionTitle}>Professional Bio</Text>
      <View style={styles.card}>
        <Text style={styles.bioText}>
          Dedicated to transforming lives through science-based nutrition and high-performance training. 
          Specialized in body recomposition and athletic preparation.
        </Text>
        <View style={styles.tagRow}>
            <View style={styles.tag}><Text style={styles.tagText}>HIIT</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>STRENGTH</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>NUTRITION</Text></View>
        </View>
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