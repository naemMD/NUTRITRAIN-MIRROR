import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, 
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { getToken } from '@/services/authStorage';
import { getUniqueMuscles, getExercisesByMuscle, ExerciseType } from '@/constants/exercisesData';

interface LocalExercise {
  id: number;
  name: string;
  muscle: string;
  type: ExerciseType;
  sets: string;
  reps: string;
  weight: string;
  duration: string;
}

const CreateSessionScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  const [sessionName, setSessionName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [loadingSave, setLoadingSave] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<'muscles' | 'exercises'>('muscles');
  const [listData, setListData] = useState<any[]>([]); 
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
    if(Platform.OS === 'android') setShowDatePicker(false);
  };

  const openAddModal = () => {
    setModalVisible(true);
    setModalStep('muscles');
    setListData(getUniqueMuscles());
  };

  const handleSelectMuscle = (muscle: string) => {
      setSelectedMuscle(muscle);
      setModalStep('exercises');
      setListData(getExercisesByMuscle(muscle));
  };

  const handleBackToMuscles = () => {
      setModalStep('muscles');
      setListData(getUniqueMuscles());
  };

  const handleSelectExercise = (exerciseObj: any) => {
      const newExo: LocalExercise = {
          id: Date.now(),
          name: exerciseObj.name,
          muscle: selectedMuscle || 'Global',
          type: exerciseObj.type || 'strength',
          sets: '4',
          reps: '10',
          weight: '0',
          duration: '60'
      };
      setExercises([...exercises, newExo]);
      setModalVisible(false); 
      setModalStep('muscles');
  };

  const updateExercise = (id: number, field: keyof LocalExercise, value: string) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeExercise = (id: number) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleSaveSession = async () => {
      if (!sessionName.trim() || exercises.length === 0) {
          Alert.alert("Missing Info", "Name and Exercises required.");
          return;
      }
      setLoadingSave(true);
      try {
          const token = await getToken();
          const payload = {
              name: sessionName,
              description: "Custom Session",
              difficulty: "Intermediate",
              scheduled_date: date.toISOString(),
              exercises: exercises.map(e => ({
                  name: e.name,
                  muscle: e.muscle,
                  num_sets: parseInt(e.sets) || 0,
                  reps: e.type === 'strength' ? (parseInt(e.reps) || 0) : 0,
                  weight: e.type === 'strength' ? (parseFloat(e.weight) || 0) : 0,
                  duration: e.type === 'duration' ? (parseInt(e.duration) || 0) : 0,
                  rest_time: 60
              }))
          };

          await axios.post(`${API_URL}/workouts/create`, payload, {
              headers: { Authorization: `Bearer ${token}` }
          });
          Alert.alert("Success", "Workout created!", [{ text: "OK", onPress: () => router.back() }]);
      } catch (error) {
          console.error(error);
          Alert.alert("Error", "Could not create workout.");
      } finally {
          setLoadingSave(false);
      }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{padding: 5}}>
            <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Workout</Text>
        <View style={{width: 30}} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} placeholder="e.g. Full Body..." placeholderTextColor="#666" value={sessionName} onChangeText={setSessionName} />
                <Text style={styles.label}>Date & Time</Text>
                <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color="white" />
                    <Text style={styles.dateText}>{date.toLocaleDateString()} at {date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
                </TouchableOpacity>
                {showDatePicker && <DateTimePicker value={date} mode="datetime" display="default" onChange={onDateChange} themeVariant="dark" />}
            </View>

            <View style={styles.section}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10, alignItems: 'center'}}>
                    <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
                    <TouchableOpacity onPress={openAddModal} style={styles.addBtnSmall}>
                         <Ionicons name="add" size={18} color="white" />
                         <Text style={styles.addBtnText}> Add</Text>
                    </TouchableOpacity>
                </View>

                {exercises.map((exo, i) => (
                    <View key={exo.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.exoName}>{i+1}. {exo.name}</Text>
                            <TouchableOpacity onPress={() => removeExercise(exo.id)}>
                                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.muscleTag}>{exo.muscle.toUpperCase()} • {exo.type === 'duration' ? '⏱ DURATION' : '💪 STRENGTH'}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statInputContainer}>
                                <Text style={styles.statLabel}>Sets</Text>
                                <TextInput style={styles.statInput} keyboardType="numeric" value={exo.sets} onChangeText={t => updateExercise(exo.id, 'sets', t)} />
                            </View>

                            {exo.type === 'strength' ? (
                                <>
                                    <View style={styles.statInputContainer}>
                                        <Text style={styles.statLabel}>Reps</Text>
                                        <TextInput style={styles.statInput} keyboardType="numeric" value={exo.reps} onChangeText={t => updateExercise(exo.id, 'reps', t)} />
                                    </View>
                                    <View style={styles.statInputContainer}>
                                        <Text style={styles.statLabel}>Kg</Text>
                                        <TextInput style={styles.statInput} keyboardType="numeric" value={exo.weight} onChangeText={t => updateExercise(exo.id, 'weight', t)} />
                                    </View>
                                </>
                            ) : (
                                <View style={[styles.statInputContainer, {flex: 2}]}> 
                                    <Text style={styles.statLabel}>Duration (Seconds)</Text>
                                    <TextInput style={styles.statInput} keyboardType="numeric" value={exo.duration} onChangeText={t => updateExercise(exo.id, 'duration', t)} placeholder="60"/>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </View>
            <View style={{height: 80}} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 10}]}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSession} disabled={loadingSave}>
              {loadingSave ? <ActivityIndicator color="white"/> : <Text style={styles.saveBtnText}>Save Workout</Text>}
          </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
              
              <View style={styles.modalHeader}>
                  {modalStep === 'exercises' ? (
                      <TouchableOpacity onPress={handleBackToMuscles} style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Ionicons name="chevron-back" size={24} color="#3498DB" />
                          <Text style={{color: '#3498DB', fontSize: 16}}>Back</Text>
                      </TouchableOpacity>
                  ) : (
                      <View style={{width: 50}} />
                  )}

                  <Text style={styles.modalTitle}>
                      {modalStep === 'muscles' ? 'Select Muscle' : 'Select Exercise'}
                  </Text>

                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={{color: '#3498DB', fontSize: 16}}>Close</Text>
                  </TouchableOpacity>
              </View>

              <FlatList
                  data={listData}
                  keyExtractor={(item, index) => index.toString()}
                  contentContainerStyle={{padding: 20}}
                  renderItem={({item}) => {
                      const isString = typeof item === 'string';
                      const label = isString ? item.charAt(0).toUpperCase() + item.slice(1) : item.name;
                      return (
                          <TouchableOpacity 
                            style={styles.modalItem}
                            onPress={() => modalStep === 'muscles' ? handleSelectMuscle(item) : handleSelectExercise(item)}
                          >
                              <View>
                                <Text style={styles.modalItemText}>{label}</Text>
                                {!isString && <Text style={{color:'#888', fontSize:12, marginTop:4}}>{item.type === 'duration' ? '⏱ Duration' : '💪 Strength'}</Text>}
                              </View>
                              <Ionicons name="chevron-forward" size={20} color="#666" />
                          </TouchableOpacity>
                      );
                  }}
              />
          </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1F2B' },
  header: { flexDirection: 'row', justifyContent:'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#2A4562' },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  section: { marginBottom: 25 },
  label: { color: '#aaa', marginBottom: 8, fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: '#2A4562', color: 'white', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  dateBtn: { flexDirection: 'row', backgroundColor: '#2A4562', padding: 12, borderRadius: 8, alignItems: 'center' },
  dateText: { color: 'white', marginLeft: 10, fontSize: 16 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  addBtnSmall: { flexDirection: 'row', backgroundColor: '#3498DB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  card: { backgroundColor: '#232D3F', padding: 15, borderRadius: 10, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#3498DB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  exoName: { color: 'white', fontSize: 16, fontWeight: 'bold', width: '85%' },
  muscleTag: { color: '#3498DB', fontSize: 10, marginBottom: 10, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  statInputContainer: { flex: 1 },
  statLabel: { color: '#666', fontSize: 10, textAlign: 'center', marginBottom: 4 },
  statInput: { backgroundColor: '#1A1F2B', color: 'white', textAlign: 'center', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#3A5572', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#1A1F2B', padding: 15, borderTopWidth: 1, borderColor: '#2A4562' },
  saveBtn: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 10, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  modalContainer: { flex: 1, backgroundColor: '#1A1F2B' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#2A4562', alignItems: 'center' },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalItem: { padding: 20, borderBottomWidth: 1, borderColor: '#2A4562', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalItemText: { color: 'white', fontSize: 16 },
});

export default CreateSessionScreen;