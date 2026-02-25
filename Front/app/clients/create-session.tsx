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

// Nouvelle interface pour supporter les séries détaillées
interface SetDetail {
  set_number: number;
  reps: number;
  weight: number;
  duration: number;
}

interface LocalExercise {
  id: number;
  name: string;
  muscle: string;
  type: ExerciseType;
  num_sets: number;
  sets_details: SetDetail[];
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

  // Ajout d'un exercice avec 1 set par défaut
  const handleSelectExercise = (exerciseObj: any) => {
      const isDuration = exerciseObj.type === 'duration';
      
      const newExo: LocalExercise = {
          id: Date.now(),
          name: exerciseObj.name,
          muscle: selectedMuscle || 'Global',
          type: exerciseObj.type || 'strength',
          num_sets: 1,
          sets_details: [
            { set_number: 1, reps: isDuration ? 0 : 10, weight: 0, duration: isDuration ? 60 : 0 }
          ]
      };
      setExercises([...exercises, newExo]);
      setModalVisible(false); 
      setModalStep('muscles');
  };

  const removeExercise = (id: number) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  // --- LOGIQUE DES SERIES (SETS) ---
  const updateSet = (exoId: number, setIndex: number, field: keyof SetDetail, value: string) => {
    setExercises(prevExos => 
      prevExos.map(exo => {
        if (exo.id !== exoId) return exo;
        
        const newSets = [...exo.sets_details];
        newSets[setIndex] = { ...newSets[setIndex], [field]: parseFloat(value) || 0 };
        
        return { ...exo, sets_details: newSets };
      })
    );
  };

  const addSetToExercise = (exoId: number) => {
    setExercises(prevExos => 
      prevExos.map(exo => {
        if (exo.id !== exoId) return exo;

        const newSets = [...exo.sets_details];
        const lastSet = newSets.length > 0 ? newSets[newSets.length - 1] : { reps: 10, weight: 0, duration: 0 };
        
        newSets.push({ 
          ...lastSet, 
          set_number: newSets.length + 1 
        });

        return { ...exo, num_sets: newSets.length, sets_details: newSets };
      })
    );
  };

  const removeSetFromExercise = (exoId: number, setIndex: number) => {
    setExercises(prevExos => 
      prevExos.map(exo => {
        if (exo.id !== exoId) return exo;

        const newSets = [...exo.sets_details];
        newSets.splice(setIndex, 1);
        
        // Renumérotation
        newSets.forEach((s, idx) => s.set_number = idx + 1);

        return { ...exo, num_sets: newSets.length, sets_details: newSets };
      })
    );
  };

  // --- SAUVEGARDE ---
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
                  num_sets: e.num_sets,
                  rest_time: 60,
                  sets_details: e.sets_details
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
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
                                <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.muscleTag}>{exo.muscle.toUpperCase()} • {exo.type === 'duration' ? '⏱ DURATION' : '💪 STRENGTH'}</Text>

                        {/* ENTÊTES DES COLONNES */}
                        <View style={{flexDirection: 'row', paddingHorizontal: 5, marginBottom: 5}}>
                            <Text style={{color: '#888', fontSize: 12, width: 35, fontWeight: 'bold'}}>Set</Text>
                            <Text style={{color: '#888', fontSize: 12, flex: 1, textAlign: 'center', fontWeight: 'bold'}}>
                                {exo.type === 'strength' ? 'Reps' : 'Time (s)'}
                            </Text>
                            {exo.type === 'strength' && (
                                <Text style={{color: '#888', fontSize: 12, flex: 1, textAlign: 'center', fontWeight: 'bold'}}>Weight (kg)</Text>
                            )}
                            <View style={{width: 30}} />
                        </View>

                        {/* LISTE DES SÉRIES (SETS) */}
                        {exo.sets_details.map((set, setIndex) => (
                            <View key={setIndex} style={styles.setRow}>
                                <Text style={{color: '#3498DB', fontWeight: 'bold', width: 35}}>S{set.set_number}</Text>
                                
                                <View style={{flex: 1, paddingHorizontal: 5}}>
                                    <TextInput 
                                        style={styles.setInput} 
                                        keyboardType="numeric" 
                                        value={String(exo.type === 'strength' ? set.reps : set.duration || '')} 
                                        onChangeText={t => updateSet(exo.id, setIndex, exo.type === 'strength' ? 'reps' : 'duration', t)} 
                                        placeholderTextColor="#888" 
                                    />
                                </View>
                                
                                {exo.type === 'strength' && (
                                    <View style={{flex: 1, paddingHorizontal: 5}}>
                                        <TextInput 
                                            style={styles.setInput} 
                                            keyboardType="numeric" 
                                            value={String(set.weight || '')} 
                                            onChangeText={t => updateSet(exo.id, setIndex, 'weight', t)} 
                                            placeholderTextColor="#888" 
                                            placeholder="0"
                                        />
                                    </View>
                                )}
                                
                                <TouchableOpacity onPress={() => removeSetFromExercise(exo.id, setIndex)} style={{width: 30, alignItems: 'flex-end'}}>
                                    <Ionicons name="close-circle" size={22} color="#e74c3c" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.addSetBtn} onPress={() => addSetToExercise(exo.id)}>
                            <Text style={{color: '#3498DB', fontWeight: 'bold'}}>+ Add Set</Text>
                        </TouchableOpacity>

                    </View>
                ))}
            </View>
            <View style={{height: 100}} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, {paddingBottom: insets.bottom + 10}]}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSession} disabled={loadingSave}>
              {loadingSave ? <ActivityIndicator color="white"/> : <Text style={styles.saveBtnText}>Save Session</Text>}
          </TouchableOpacity>
      </View>

      {/* --- MODALE SELECTEUR MUSCLES/EXERCICES --- */}
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
  input: { backgroundColor: '#2A4562', color: 'white', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  dateBtn: { flexDirection: 'row', backgroundColor: '#2A4562', padding: 15, borderRadius: 10, alignItems: 'center' },
  dateText: { color: 'white', marginLeft: 10, fontSize: 16 },
  sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  addBtnSmall: { flexDirection: 'row', backgroundColor: '#3498DB', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  
  // Styles de la carte de l'exercice
  card: { backgroundColor: '#1E2C3D', padding: 15, borderRadius: 12, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#3498DB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, alignItems: 'center' },
  exoName: { color: 'white', fontSize: 16, fontWeight: 'bold', width: '85%' },
  muscleTag: { color: '#3498DB', fontSize: 10, marginBottom: 15, fontWeight: 'bold' },
  
  // Styles des séries (Sets)
  setRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1F2B', paddingHorizontal: 5, paddingVertical: 8, borderRadius: 8, marginBottom: 8 },
  setInput: { backgroundColor: '#2A4562', color: 'white', paddingVertical: 10, borderRadius: 6, width: '100%', textAlign: 'center', fontSize: 15 },
  addSetBtn: { alignSelf: 'center', paddingVertical: 10, marginTop: 5 },

  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#1A1F2B', padding: 15, borderTopWidth: 1, borderColor: '#2A4562' },
  saveBtn: { backgroundColor: '#2ecc71', padding: 18, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  
  modalContainer: { flex: 1, backgroundColor: '#1A1F2B' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#2A4562', alignItems: 'center' },
  modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  modalItem: { padding: 20, borderBottomWidth: 1, borderColor: '#2A4562', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalItemText: { color: 'white', fontSize: 16 },
});

export default CreateSessionScreen;