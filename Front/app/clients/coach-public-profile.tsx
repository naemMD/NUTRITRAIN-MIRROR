import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/services/authStorage';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const CoachPublicProfile = () => {
  const { coachId, invitationId } = useLocalSearchParams();
  const router = useRouter();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  const [coach, setCoach] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCoachProfile();
  }, [coachId]);

  const fetchCoachProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/coaches/${coachId}/public-profile`);
      setCoach(response.data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to load coach profile.' });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (status: 'accepted' | 'rejected') => {
    if (status === 'rejected') {
      Alert.alert(
        "Decline Invitation",
        "Are you sure you want to decline this coaching request?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Decline", 
            style: "destructive", 
            onPress: () => submitResponse(status)
          }
        ]
      );
    } else {
      submitResponse(status);
    }
  };
  
  const submitResponse = async (status: 'accepted' | 'rejected') => {
    setProcessing(true);
    try {
      const token = await getToken();
      await axios.patch(
        `${API_URL}/clients/invitations/${invitationId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const message = status === 'accepted' 
        ? "You are now linked with your new coach!" 
        : "Invitation declined.";
      
      Toast.show({ type: 'success', text1: message });
      router.push('/clients/home');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: error.response?.data?.message || 'An error occurred. Please try again.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#3498DB" style={{ flex: 1, backgroundColor: '#1A1F2B' }} />;

  return (
    <ScrollView style={styles.container}>
      {/* Header avec bouton retour */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      {/* Profil Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{coach?.firstname?.[0]}</Text>
        </View>
        <Text style={styles.name}>{coach?.firstname} {coach?.lastname}</Text>
        <Text style={styles.location}>
          <Ionicons name="location" size={16} color="#3498DB" /> {coach?.city || 'Remote'}
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{coach?.stats?.active_clients}</Text>
          <Text style={styles.statLabel}>Clients</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{coach?.stats?.workouts_created}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.description}>{coach?.description || "No description provided."}</Text>
      </View>

      {/* Certifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {coach?.certifications?.map((cert: string, index: number) => (
          <View key={index} style={styles.certItem}>
            <Ionicons name="checkmark-circle" size={18} color="#2ECC71" />
            <Text style={styles.certText}>{cert}</Text>
          </View>
        ))}
      </View>

      {/* BOUTONS D'ACTION */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.btn, styles.btnReject]} 
          onPress={() => handleResponse('rejected')}
          disabled={processing}
        >
          <Text style={styles.btnText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.btnAccept]} 
          onPress={() => handleResponse('accepted')}
          disabled={processing}
        >
          {processing ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Accept Coach</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1F2B', padding: 20 },
  backButton: { marginTop: 40, marginBottom: 20 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 40, color: 'white', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  location: { color: '#8A8D91', fontSize: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#2A4562', borderRadius: 15, padding: 20, marginBottom: 30 },
  statBox: { alignItems: 'center' },
  statValue: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#8A8D91', fontSize: 12 },
  section: { marginBottom: 25 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  description: { color: '#ccc', lineHeight: 22 },
  certItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  certText: { color: '#ccc', marginLeft: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 50 },
  btn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
  btnReject: { backgroundColor: '#E74C3C' },
  btnAccept: { backgroundColor: '#2ECC71' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default CoachPublicProfile;