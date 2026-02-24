import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { getUserDetails } from '@/services/authStorage';

export default function CoachHomepage() {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coachName, setCoachName] = useState('');

  const fetchSummary = async () => {
    try {
      const user = await getUserDetails();
      if (user?.id) {
        setCoachName(user.firstname);
        const response = await axios.get(`${API_URL}/coaches/${user.id}/home-summary`);
        setSummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSummary();
  }, []);

  const handleMessage = (clientName: string) => {
      Alert.alert("Message", `Start a conversation with ${clientName}? (Feature coming soon)`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {coachName} 👋</Text>
          <Text style={styles.subtitle}>Here is your daily overview</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- KPIs SECTION --- */}
        <View style={styles.kpiContainer}>
            <View style={styles.kpiCard}>
                <View style={styles.iconBg}>
                    <Ionicons name="people" size={24} color="#3498DB" />
                </View>
                <Text style={styles.kpiValue}>{summary?.kpi?.total_clients || 0}</Text>
                <Text style={styles.kpiLabel}>Total Clients</Text>
            </View>

            <View style={styles.kpiCard}>
                <View style={[styles.iconBg, {backgroundColor: 'rgba(46, 204, 113, 0.2)'}]}>
                    <Ionicons name="flash" size={24} color="#2ecc71" />
                </View>
                <Text style={styles.kpiValue}>{summary?.kpi?.active_today || 0}</Text>
                <Text style={styles.kpiLabel}>Active Today</Text>
            </View>
        </View>

        {/* --- ALERTS SECTION --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>⚠️ Needs Attention</Text>
          
          {summary?.alerts && summary.alerts.length > 0 ? (
              summary.alerts.map((alert: any) => (
                <View key={alert.id} style={styles.alertCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{alert.name[0]}</Text>
                        </View>
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text style={styles.clientName}>{alert.name}</Text>
                            <Text style={styles.alertIssue}>{alert.issue}</Text>
                            <Text style={styles.alertDetails}>
                                {alert.value} / {alert.goal} kcal
                            </Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.actionIcon} 
                            onPress={() => handleMessage(alert.name)}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#3498DB" />
                        </TouchableOpacity>
                    </View>
                </View>
              ))
          ) : (
              <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle" size={40} color="#2ecc71" />
                  <Text style={styles.emptyText}>No alerts today. Good job!</Text>
              </View>
          )}
        </View>

        {/* --- TOP PERFORMERS SECTION --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🏆 Top Performers (Yesterday)</Text>
          
          {summary?.top_performers && summary.top_performers.length > 0 ? (
              summary.top_performers.map((client: any, index: number) => (
                <View key={client.id} style={styles.performerCard}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.avatarPlaceholder, {backgroundColor: '#f1c40f'}]}>
                            <Text style={[styles.avatarText, {color: '#1A1F2B'}]}>{index + 1}</Text>
                        </View>
                        <View style={{flex: 1, marginLeft: 10}}>
                            <Text style={styles.clientName}>{client.name}</Text>
                            <View style={styles.badgeContainer}>
                                <Text style={styles.badgeText}>{client.score}</Text>
                            </View>
                        </View>
                        <View style={{alignItems: 'flex-end'}}>
                             <Text style={styles.performerValue}>{client.value} kcal</Text>
                             <Text style={styles.performerGoal}>Goal: {client.goal}</Text>
                        </View>
                    </View>
                </View>
              ))
          ) : (
              <Text style={{color: '#888', fontStyle: 'italic'}}>No data recorded yesterday.</Text>
          )}
        </View>

        <View style={{height: 20}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F2B',
  },
  header: {
      paddingHorizontal: 20,
      paddingBottom: 10,
      marginBottom: 10
  },
  greeting: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold'
  },
  subtitle: {
      color: '#888',
      fontSize: 14,
      marginTop: 5
  },
  content: {
    padding: 16,
  },
  // KPIs
  kpiContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 25
  },
  kpiCard: {
      backgroundColor: '#2A4562',
      width: '48%',
      padding: 15,
      borderRadius: 15,
      alignItems: 'flex-start'
  },
  iconBg: {
      backgroundColor: 'rgba(52, 152, 219, 0.2)',
      padding: 8,
      borderRadius: 10,
      marginBottom: 10
  },
  kpiValue: {
      color: 'white',
      fontSize: 32,
      fontWeight: 'bold'
  },
  kpiLabel: {
      color: '#aaa',
      fontSize: 14
  },
  // Sections
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  // Alerts
  alertCard: {
    backgroundColor: '#3b2a2a', // Teinte rougeâtre sombre
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#2A4562',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18
  },
  clientName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertIssue: {
    color: '#e74c3c', // Rouge vif
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 2
  },
  alertDetails: {
      color: '#ccc',
      fontSize: 12
  },
  actionIcon: {
      padding: 5
  },
  // Empty State
  emptyState: {
      backgroundColor: '#2A4562',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
  },
  emptyText: {
      color: 'white',
      marginLeft: 10,
      fontSize: 16
  },
  // Performers
  performerCard: {
    backgroundColor: '#2A4562',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f1c40f' // Or
  },
  badgeContainer: {
      backgroundColor: 'rgba(46, 204, 113, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 5,
      alignSelf: 'flex-start',
      marginTop: 4
  },
  badgeText: {
      color: '#2ecc71',
      fontSize: 12,
      fontWeight: 'bold'
  },
  performerValue: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16
  },
  performerGoal: {
      color: '#aaa',
      fontSize: 12
  }
});