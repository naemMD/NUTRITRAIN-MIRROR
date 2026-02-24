import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  ActivityIndicator, Alert, Dimensions, Modal, TextInput, 
  KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const ClientDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();
  const params = useLocalSearchParams();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isModalVisible, setModalVisible] = useState(false);
  const [updatingGoals, setUpdatingGoals] = useState(false);
  const [editCalories, setEditCalories] = useState('');
  const [editProteins, setEditProteins] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFats, setEditFats] = useState('');

  const clientId = params.clientId;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (clientId) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            
            const response = await axios.get(`${API_URL}/coaches/client-details/${clientId}`, {
                params: { target_date: formattedDate }
            });
            setClientData(response.data);
        }
      } catch (error) {
        console.error("Error details:", error);
        Alert.alert("Error", "Could not fetch client details");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [clientId, selectedDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const openEditModal = () => {
    setEditCalories(clientData?.goal_calories?.toString() || '2500');
    setEditProteins(clientData?.goals_macros?.proteins?.toString() || '150');
    setEditCarbs(clientData?.goals_macros?.carbs?.toString() || '250');
    setEditFats(clientData?.goals_macros?.fats?.toString() || '70');
    setModalVisible(true);
  };

  const handleUpdateGoals = async () => {
    setUpdatingGoals(true);
    try {
      const payload = {
        daily_caloric_needs: parseFloat(editCalories) || 0,
        goal_proteins: parseFloat(editProteins) || 0,
        goal_carbs: parseFloat(editCarbs) || 0,
        goal_fats: parseFloat(editFats) || 0,
      };

      await axios.patch(`${API_URL}/users/${clientId}/goals`, payload);

      setClientData((prev: any) => ({
        ...prev,
        goal_calories: payload.daily_caloric_needs,
        goals_macros: {
          ...prev.goals_macros,
          proteins: payload.goal_proteins,
          carbs: payload.goal_carbs,
          fats: payload.goal_fats,
        }
      }));

      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Objectifs mis à jour ! 🎯',
        text2: 'Les macros du client ont été modifiées avec succès.',
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de mettre à jour les objectifs du client.',
      });
    } finally {
      setUpdatingGoals(false);
    }
  };

  const renderProgressBar = (label: string, value: number, max: number, color: string) => {
      const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
      return (
          <View style={styles.progressRow} key={label}>
              <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 5}}>
                  <Text style={styles.progressLabel}>{label}</Text>
                  <Text style={styles.progressValue}>{value} / {max} g</Text>
              </View>
              <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
              </View>
          </View>
      );
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.back()} style={{padding: 5}}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Dashboard</Text>
        <View style={{width: 30}} /> 
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3498DB" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{clientData?.firstname?.[0] || '?'}</Text>
                </View>
                <View style={{marginLeft: 15}}>
                    <Text style={styles.clientName}>{clientData?.firstname} {clientData?.lastname}</Text>
                    <Text style={styles.clientInfo}>{clientData?.age} ans • {clientData?.gender}</Text>
                </View>
            </View>

            {/* --- NOUVEAU : NAVIGATEUR DE DATE --- */}
            <View style={styles.dateNavigator}>
                <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateArrow}>
                    <Ionicons name="chevron-back" size={24} color="#3498DB" />
                </TouchableOpacity>
                
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.dateText}>
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    {isToday && (
                        <Text style={styles.todayBadge}>Today</Text>
                    )}
                </View>

                <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateArrow}>
                    <Ionicons name="chevron-forward" size={24} color="#3498DB" />
                </TouchableOpacity>
            </View>

            {/* Section Stats (Calories & Macros) */}
            <View style={styles.sectionContainer}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                   <Text style={styles.sectionTitle}>{isToday ? "Today's Nutrition" : "Nutrition"}</Text>
                   <TouchableOpacity onPress={openEditModal} style={styles.editButton}>
                       <Ionicons name="pencil" size={20} color="#3498DB" />
                   </TouchableOpacity>
                </View>
                
                <View style={styles.caloriesCard}>
                    <Text style={styles.calTitle}>Calories Consumed</Text>
                    <Text style={styles.calValue}>
                        {clientData?.today_stats?.calories || 0} 
                        <Text style={styles.calGoal}> / {clientData?.goal_calories || 2500} kcal</Text>
                    </Text>
                    <View style={styles.progressBarBg}>
                      <View style={[
                          styles.progressBarFill, 
                          { 
                              width: `${Math.min(((clientData?.today_stats?.calories || 0) / (clientData?.goal_calories || 2500)) * 100, 100)}%`,
                              backgroundColor: (clientData?.today_stats?.calories || 0) > (clientData?.goal_calories || 2500) ? '#e74c3c' : '#3498DB'
                          }
                      ]} />
                    </View>
                </View>

                <View style={styles.macrosContainer}>
                    {renderProgressBar("Proteins", clientData?.today_stats?.proteins || 0, clientData?.goals_macros?.proteins || 150, "#e67e22")}
                    {renderProgressBar("Carbs", clientData?.today_stats?.carbs || 0, clientData?.goals_macros?.carbs || 250, "#f1c40f")}
                    {renderProgressBar("Fats", clientData?.today_stats?.fats || 0, clientData?.goals_macros?.fats || 70, "#9b59b6")}
                </View>
            </View>

            {/* Section Détails des Repas */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Meals Log</Text>
                <View style={styles.listContainer}>
                    {clientData?.meals_today && clientData.meals_today.length > 0 ? (
                        clientData.meals_today.map((meal: any) => (
                            <View key={meal.id} style={styles.listItem}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Ionicons 
                                        name={meal.is_consumed ? "checkmark-circle" : "radio-button-off"} 
                                        size={20} 
                                        color={meal.is_consumed ? "#2ecc71" : "#555"} 
                                        style={{marginRight: 10}} 
                                    />
                                    <Text style={styles.listName}>{meal.name}</Text>
                                </View>
                                <Text style={styles.listSub}>{meal.calories} kcal</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No meals logged for this date.</Text>
                    )}
                </View>
            </View>

            {/* Section Détails des Entraînements */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Workouts Log</Text>
                <View style={styles.listContainer}>
                    {clientData?.workouts_today && clientData.workouts_today.length > 0 ? (
                        clientData.workouts_today.map((workout: any) => (
                            <View key={workout.id} style={styles.listItem}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Ionicons 
                                        name={workout.is_completed ? "checkmark-circle" : "barbell-outline"} 
                                        size={20} 
                                        color={workout.is_completed ? "#2ecc71" : "#3498DB"} 
                                        style={{marginRight: 10}} 
                                    />
                                    <Text style={[styles.listName, workout.is_completed && {textDecorationLine: 'line-through', color: '#888'}]}>
                                        {workout.name}
                                    </Text>
                                </View>
                                <Text style={styles.listSub}>{workout.is_completed ? "Done" : "Pending"}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No workouts scheduled for this date.</Text>
                    )}
                </View>
            </View>

        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Nutritional Goals</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabelModal}>Calories (kcal)</Text>
              <TextInput style={styles.inputModal} keyboardType="numeric" value={editCalories} onChangeText={setEditCalories} placeholderTextColor="#888" />
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={[styles.inputGroup, {flex: 0.31}]}>
                <Text style={styles.inputLabelModal}>Proteins (g)</Text>
                <TextInput style={styles.inputModal} keyboardType="numeric" value={editProteins} onChangeText={setEditProteins} placeholderTextColor="#888" />
              </View>
              <View style={[styles.inputGroup, {flex: 0.31}]}>
                <Text style={styles.inputLabelModal}>Carbs (g)</Text>
                <TextInput style={styles.inputModal} keyboardType="numeric" value={editCarbs} onChangeText={setEditCarbs} placeholderTextColor="#888" />
              </View>
              <View style={[styles.inputGroup, {flex: 0.31}]}>
                <Text style={styles.inputLabelModal}>Fats (g)</Text>
                <TextInput style={styles.inputModal} keyboardType="numeric" value={editFats} onChangeText={setEditFats} placeholderTextColor="#888" />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)} disabled={updatingGoals}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdateGoals} disabled={updatingGoals}>
                {updatingGoals ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1F2B' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#2A4562' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A4562', borderRadius: 15, padding: 20, marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  clientName: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  clientInfo: { color: '#aaa', marginTop: 2 },
  
  // NOUVEAUX STYLES NAVIGATEUR DATE
  dateNavigator: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2A4562', padding: 15, borderRadius: 15, marginBottom: 20 },
  dateArrow: { padding: 5 },
  dateText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  todayBadge: { color: '#3498DB', fontSize: 12, fontWeight: 'bold', marginTop: 2 },

  sectionContainer: { marginBottom: 30 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  editButton: { padding: 5 },
  caloriesCard: { backgroundColor: '#2A4562', borderRadius: 15, padding: 20, marginBottom: 15, alignItems: 'center' },
  calTitle: { color: '#aaa', marginBottom: 5 },
  calValue: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  calGoal: { fontSize: 16, color: '#aaa', fontWeight: 'normal' },
  macrosContainer: { backgroundColor: '#2A4562', borderRadius: 15, padding: 20 },
  progressRow: { marginBottom: 15 },
  progressLabel: { color: 'white', fontWeight: '600' },
  progressValue: { color: '#ccc', fontSize: 12 },
  progressBarBg: { height: 8, backgroundColor: '#1A1F2B', borderRadius: 4, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  listContainer: { backgroundColor: '#2A4562', borderRadius: 15, padding: 15, marginTop: 10 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  listName: { color: 'white', fontSize: 16, fontWeight: '500' },
  listSub: { color: '#aaa', fontSize: 14 },
  emptyText: { color: '#888', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },

  // STYLES DE LA MODALE
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1A1F2B', borderRadius: 15, padding: 25, borderWidth: 1, borderColor: '#3498DB' },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 15 },
  inputLabelModal: { color: '#aaa', marginBottom: 8, fontSize: 13, fontWeight: 'bold' },
  inputModal: { backgroundColor: '#2A4562', color: 'white', padding: 12, borderRadius: 8, fontSize: 16, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  modalButton: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#e74c3c' },
  saveButton: { backgroundColor: '#2ecc71' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default ClientDetailsScreen;