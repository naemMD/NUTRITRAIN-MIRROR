import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator,
  Modal, ScrollView, Animated, PanResponder, Dimensions, TextInput, Pressable
} from 'react-native';
import { crossAlert } from '@/services/crossAlert';
import { useRouter, useFocusEffect } from 'expo-router';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import api from '@/services/api';
import { getUniqueMuscles, getExercisesByMuscle } from '@/constants/exercisesData';

LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'], 
};
LocaleConfig.defaultLocale = 'en';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MIN_Y = SCREEN_HEIGHT * 0.15; 
const SHEET_MAX_Y = SCREEN_HEIGHT * 0.55; 

const TrainingDashboard = () => {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  // Edit mode state
  const [editExercises, setEditExercises] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [addExoModalVisible, setAddExoModalVisible] = useState(false);
  const [addExoStep, setAddExoStep] = useState<'muscles' | 'exercises'>('muscles');
  const [addExoListData, setAddExoListData] = useState<any[]>([]);
  const [addExoSelectedMuscle, setAddExoSelectedMuscle] = useState<string | null>(null);

  const panY = useRef(new Animated.Value(SHEET_MAX_Y)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { panY.extractOffset(); },
      onPanResponderMove: (e, gestureState) => { panY.setValue(gestureState.dy); },
      onPanResponderRelease: (e, gestureState) => {
        panY.flattenOffset();
        if (gestureState.vy < -0.5 || gestureState.dy < -100) {
           Animated.spring(panY, { toValue: SHEET_MIN_Y, useNativeDriver: false, friction: 5 }).start();
        } else if (gestureState.vy > 0.5 || gestureState.dy > 100) {
           Animated.spring(panY, { toValue: SHEET_MAX_Y, useNativeDriver: false, friction: 5 }).start();
        } else {
           const currentPos = (panY as any)._value; 
           const midPoint = (SHEET_MAX_Y + SHEET_MIN_Y) / 2;
           Animated.spring(panY, { toValue: currentPos < midPoint ? SHEET_MIN_Y : SHEET_MAX_Y, useNativeDriver: false }).start();
        }
      }
    })
  ).current;

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [])
  );

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/workouts/my-workouts`);
      const allWorkouts = res.data;
      
      const sanitizedWorkouts = allWorkouts.map((w:any) => ({
          ...w,
          is_completed: !!w.is_completed
      }));

      setWorkouts(sanitizedWorkouts);

      const marks: any = {};
      sanitizedWorkouts.forEach((w: any) => {
        const dateStr = w.scheduled_date.split('T')[0];
        const dotColor = w.is_completed ? '#2ecc71' : '#e74c3c'; 
        marks[dateStr] = { marked: true, dotColor: dotColor };
      });
      setMarkedDates(marks);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkout = async (workoutId: number) => {
      const previousWorkouts = [...workouts];

      setWorkouts(prev => prev.map(w => 
          w.id === workoutId ? { ...w, is_completed: !w.is_completed } : w
      ));

      try {
          await api.patch(`/workouts/${workoutId}/toggle-complete`);
      } catch (error) {
          console.error("Error toggling workout:", error);
          setWorkouts(previousWorkouts); 
          crossAlert("Error", "Could not update status.");
      }
  };

  const handleDeleteWorkout = async (workoutId: number) => {
    crossAlert(
        "Delete Workout",
        "Are you sure you want to delete this session?",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        await api.delete(`/workouts/${workoutId}`);
                        setDetailModalVisible(false);
                        fetchWorkouts();
                    } catch (error) {
                        crossAlert("Error", "Could not delete workout.");
                    }
                }
            }
        ]
    );
  };

  const dailyWorkouts = workouts.filter(w => w.scheduled_date.startsWith(selectedDate));

  const openWorkoutDetails = (workout: any) => {
      setSelectedWorkout(workout);
      const exos = typeof workout.exercises === 'string' ? JSON.parse(workout.exercises) : workout.exercises;
      setEditExercises(exos.map((e: any, i: number) => ({
        ...e,
        _id: e.id || Date.now() + i,
        sets_details: safeParseSets(e.sets_details),
      })));
      setDetailModalVisible(true);
  };

  const safeParseSets = (sets: any) => {
    if (!sets) return [];
    if (typeof sets === 'string') {
      try { return JSON.parse(sets); } catch (e) { return []; }
    }
    return sets;
  };

  // --- Edit helpers ---
  const updateSetField = (exoIdx: number, setIdx: number, field: string, value: string) => {
    setEditExercises(prev => {
      const updated = [...prev];
      const sets = [...updated[exoIdx].sets_details];
      sets[setIdx] = { ...sets[setIdx], [field]: parseFloat(value) || 0 };
      updated[exoIdx] = { ...updated[exoIdx], sets_details: sets };
      return updated;
    });
  };

  const addSetToExercise = (exoIdx: number) => {
    setEditExercises(prev => {
      const updated = [...prev];
      const sets = [...updated[exoIdx].sets_details];
      const last = sets[sets.length - 1] || { reps: 10, weight: 0, duration: 0 };
      sets.push({ set_number: sets.length + 1, reps: last.reps, weight: last.weight, duration: last.duration });
      updated[exoIdx] = { ...updated[exoIdx], sets_details: sets, num_sets: sets.length };
      return updated;
    });
  };

  const removeSetFromExercise = (exoIdx: number, setIdx: number) => {
    setEditExercises(prev => {
      const updated = [...prev];
      const sets = updated[exoIdx].sets_details.filter((_: any, i: number) => i !== setIdx)
        .map((s: any, i: number) => ({ ...s, set_number: i + 1 }));
      if (sets.length === 0) return prev;
      updated[exoIdx] = { ...updated[exoIdx], sets_details: sets, num_sets: sets.length };
      return updated;
    });
  };

  const removeExercise = (exoIdx: number) => {
    setEditExercises(prev => prev.filter((_, i) => i !== exoIdx));
  };

  const openAddExoModal = () => {
    setAddExoStep('muscles');
    setAddExoListData(getUniqueMuscles());
    setAddExoSelectedMuscle(null);
    setAddExoModalVisible(true);
  };

  const handleAddExoSelectMuscle = (muscle: string) => {
    setAddExoSelectedMuscle(muscle);
    setAddExoStep('exercises');
    setAddExoListData(getExercisesByMuscle(muscle));
  };

  const handleAddExoSelect = (exerciseObj: any) => {
    const isDuration = exerciseObj.type === 'duration';
    const newExo = {
      _id: Date.now(),
      name: exerciseObj.name,
      muscle: addExoSelectedMuscle || 'Global',
      num_sets: 1,
      rest_time: 60,
      sets_details: [{ set_number: 1, reps: isDuration ? 0 : 10, weight: 0, duration: isDuration ? 60 : 0 }],
    };
    setEditExercises(prev => [...prev, newExo]);
    setAddExoModalVisible(false);
  };

  const handleSaveWorkout = async () => {
    if (!selectedWorkout || editExercises.length === 0) {
      crossAlert("Error", "A workout must have at least one exercise.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: selectedWorkout.name,
        difficulty: selectedWorkout.difficulty || "Intermediate",
        exercises: editExercises.map(e => ({
          name: e.name,
          muscle: e.muscle,
          num_sets: e.sets_details.length,
          rest_time: e.rest_time || 60,
          sets_details: e.sets_details.map((s: any) => ({
            set_number: s.set_number,
            reps: s.reps || 0,
            weight: s.weight || 0,
            duration: s.duration || 0,
          })),
        })),
      };
      await api.put(`/workouts/${selectedWorkout.id}`, payload);
      setDetailModalVisible(false);
      fetchWorkouts();
    } catch (error) {
      console.error("Error updating workout:", error);
      crossAlert("Error", "Could not update workout.");
    } finally {
      setSaving(false);
    }
  };

  const isDurationExercise = (exo: any) => {
    const sets = exo.sets_details || [];
    return sets.length > 0 && sets[0].duration > 0 && (sets[0].reps === 0 || !sets[0].reps);
  };

  const renderWorkoutItem = ({ item }: { item: any }) => {
    const time = new Date(item.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let exercises = [];
    try {
        exercises = typeof item.exercises === 'string' ? JSON.parse(item.exercises) : item.exercises;
    } catch(e) { exercises = []; }

    const uniqueMuscles = Array.from(new Set(exercises.map((e: any) => e.muscle))).join(', ');
    const isDone = item.is_completed;

    return (
      <TouchableOpacity onPress={() => openWorkoutDetails(item)} activeOpacity={0.7}>
        <View style={[styles.card, isDone && styles.cardCompleted]}>
            <View style={styles.cardLeft}>
                <Text style={[styles.cardTime, isDone && {color: '#888'}]}>{time}</Text>
                <View style={[styles.verticalLine, isDone && {backgroundColor: '#2ecc71'}]} />
            </View>

            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, isDone && styles.textCompleted]}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>
                    {exercises.length} Exercises • {uniqueMuscles || "General"}
                </Text>
            </View>
            
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity 
                    onPress={() => handleToggleWorkout(item.id)} 
                    style={{padding: 8, marginRight: 5}}
                >
                    <Ionicons 
                        name={isDone ? "checkmark-circle" : "radio-button-off"} 
                        size={28} 
                        color={isDone ? "#2ecc71" : "#888"} 
                    />
                </TouchableOpacity>

                <Ionicons name="eye-outline" size={20} color={isDone ? "#666" : "#3498DB"} />
            </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.fixedBackground}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Training Plan</Text>
            <TouchableOpacity style={styles.createBtnHeader} onPress={() => router.push('/clients/create-session')}>
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <Calendar
              current={selectedDate}
              theme={{
                  backgroundColor: '#1A1F2B',
                  calendarBackground: '#1A1F2B',
                  textSectionTitleColor: '#666',
                  selectedDayBackgroundColor: '#3498DB',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#3498DB',
                  dayTextColor: '#ffffff',
                  textDisabledColor: '#333',
                  dotColor: '#2ecc71',
                  arrowColor: '#3498DB',
                  monthTextColor: '#ffffff',
                  indicatorColor: '#ffffff',
                  textDayFontWeight: 'bold',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 14,
              }}
              onDayPress={(day: any) => {
                  setSelectedDate(day.dateString);
                  Animated.spring(panY, { toValue: SHEET_MAX_Y, useNativeDriver: false }).start();
              }}
              markedDates={{
                  ...markedDates,
                  [selectedDate]: { ...(markedDates[selectedDate] || {}), selected: true, selectedColor: '#3498DB' }
              }}
              hideExtraDays={true} 
              firstDay={1}
          />
      </View>

      <Animated.View style={[styles.bottomSheet, { top: panY, height: SCREEN_HEIGHT }]}>
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
            <View style={styles.dragHandleBar} />
        </View>

        <View style={styles.sheetContent}>
            <Text style={styles.sectionTitle}>Workouts for {new Date(selectedDate).toDateString()}</Text>
            {loading ? (
                <ActivityIndicator color="#3498DB" style={{marginTop: 20}} />
            ) : (
                <FlatList
                    data={dailyWorkouts}
                    keyboardDismissMode="on-drag"
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderWorkoutItem}
                    contentContainerStyle={{ paddingBottom: 200 }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Rest Day</Text>
                            <Text style={styles.emptySubText}>Swipe up to see details or add a workout.</Text>
                        </View>
                    }
                />
            )}
        </View>
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/clients/create-session')}>
             <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={detailModalVisible} animationType="slide" transparent onRequestClose={() => setDetailModalVisible(false)}>
          <Pressable style={styles.modalBackground} onPress={() => setDetailModalVisible(false)}>
              <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                  {selectedWorkout && (
                      <>
                        <View style={styles.modalHeader}>
                            <View style={{flex: 1}}>
                                <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
                                <Text style={{color:'#888'}}>
                                    {new Date(selectedWorkout.scheduled_date).toDateString()}
                                </Text>
                            </View>

                            <View style={{flexDirection: 'row', gap: 15, alignItems: 'center'}}>
                                <TouchableOpacity onPress={() => handleDeleteWorkout(selectedWorkout.id)}>
                                    <Ionicons name="trash-outline" size={26} color="#e74c3c" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                    <Ionicons name="close-circle" size={30} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView style={{marginTop: 15}} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
                            {editExercises.map((exo: any, exoIdx: number) => {
                                const isDur = isDurationExercise(exo);
                                return (
                                  <View key={exo._id || exoIdx} style={styles.detailRow}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                                        <Text style={styles.detailExoName}>{exoIdx+1}. {exo.name}</Text>
                                        <View style={styles.muscleBadge}>
                                            <Text style={styles.detailMuscle}>{exo.muscle}</Text>
                                        </View>
                                        <View style={{flex: 1}} />
                                        <TouchableOpacity onPress={() => removeExercise(exoIdx)} style={{padding: 4}}>
                                            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Sets header */}
                                    <View style={{flexDirection: 'row', paddingHorizontal: 8, marginBottom: 4}}>
                                      <Text style={{color: '#888', fontSize: 11, width: 35}}>Set</Text>
                                      <Text style={{color: '#888', fontSize: 11, flex: 1, textAlign: 'center'}}>{isDur ? 'Time (s)' : 'Reps'}</Text>
                                      {!isDur && <Text style={{color: '#888', fontSize: 11, flex: 1, textAlign: 'center'}}>Weight (kg)</Text>}
                                      <View style={{width: 28}} />
                                    </View>

                                    <View style={styles.setsContainer}>
                                        {(exo.sets_details || []).map((s: any, setIdx: number) => (
                                            <View key={setIdx} style={styles.editSetRow}>
                                                <Text style={styles.setNumber}>S{setIdx + 1}</Text>
                                                <View style={{flex: 1, paddingHorizontal: 4}}>
                                                  <TextInput
                                                    style={styles.editSetInput}
                                                    keyboardType="numeric"
                                                    value={String(isDur ? (s.duration || 0) : (s.reps || 0))}
                                                    onChangeText={(v) => updateSetField(exoIdx, setIdx, isDur ? 'duration' : 'reps', v)}
                                                  />
                                                </View>
                                                {!isDur && (
                                                  <View style={{flex: 1, paddingHorizontal: 4}}>
                                                    <TextInput
                                                      style={styles.editSetInput}
                                                      keyboardType="numeric"
                                                      value={String(s.weight || 0)}
                                                      onChangeText={(v) => updateSetField(exoIdx, setIdx, 'weight', v)}
                                                    />
                                                  </View>
                                                )}
                                                <TouchableOpacity onPress={() => removeSetFromExercise(exoIdx, setIdx)} style={{width: 28, alignItems: 'center'}}>
                                                    <Ionicons name="close-circle" size={18} color="#e74c3c" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                        <TouchableOpacity onPress={() => addSetToExercise(exoIdx)} style={{alignSelf: 'center', paddingVertical: 6}}>
                                            <Text style={{color: '#3498DB', fontWeight: 'bold', fontSize: 13}}>+ Add Set</Text>
                                        </TouchableOpacity>
                                    </View>
                                  </View>
                                );
                            })}

                            {/* Add exercise button */}
                            <TouchableOpacity style={styles.addExoBtn} onPress={openAddExoModal}>
                                <Ionicons name="add-circle-outline" size={20} color="#3498DB" />
                                <Text style={{color: '#3498DB', fontWeight: 'bold', marginLeft: 8}}>Add Exercise</Text>
                            </TouchableOpacity>

                            <View style={{height: 20}} />
                        </ScrollView>

                        {/* Save button */}
                        <TouchableOpacity style={styles.saveWorkoutBtn} onPress={handleSaveWorkout} disabled={saving}>
                            {saving ? <ActivityIndicator color="white" /> : (
                              <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                      </>
                  )}
              </Pressable>
          </Pressable>
      </Modal>

      {/* Add exercise modal */}
      <Modal visible={addExoModalVisible} animationType="slide" onRequestClose={() => setAddExoModalVisible(false)}>
          <View style={styles.addExoModalContainer}>
              <View style={styles.addExoModalHeader}>
                  {addExoStep === 'exercises' ? (
                      <TouchableOpacity onPress={() => { setAddExoStep('muscles'); setAddExoListData(getUniqueMuscles()); }} style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Ionicons name="chevron-back" size={24} color="#3498DB" />
                          <Text style={{color: '#3498DB', fontSize: 16}}>Back</Text>
                      </TouchableOpacity>
                  ) : <View style={{width: 50}} />}
                  <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>{addExoStep === 'muscles' ? 'Select Muscle' : 'Select Exercise'}</Text>
                  <TouchableOpacity onPress={() => setAddExoModalVisible(false)}>
                      <Text style={{color: '#3498DB', fontSize: 16, fontWeight: 'bold'}}>Close</Text>
                  </TouchableOpacity>
              </View>
              <FlatList
                  data={addExoListData}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({item}) => (
                      <TouchableOpacity
                        style={styles.addExoModalItem}
                        onPress={() => addExoStep === 'muscles' ? handleAddExoSelectMuscle(item) : handleAddExoSelect(item)}
                      >
                          <Text style={{color: 'white', fontSize: 16}}>{typeof item === 'string' ? item.toUpperCase() : item.name}</Text>
                          <Ionicons name="chevron-forward" size={20} color="#666" />
                      </TouchableOpacity>
                  )}
              />
          </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1F2B' },
  fixedBackground: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10, paddingTop: 10 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  createBtnHeader: { padding: 8, backgroundColor: '#2A4562', borderRadius: 8 },
  bottomSheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#141824', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.5, shadowRadius: 5, elevation: 20,
  },
  dragHandleArea: { width: '100%', height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  dragHandleBar: { width: 50, height: 5, backgroundColor: '#4A5568', borderRadius: 3 },
  sheetContent: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { color: '#888', fontSize: 14, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1, marginTop: 5 },
  
  card: { flexDirection: 'row', backgroundColor: '#1A1F2B', padding: 15, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  cardCompleted: { backgroundColor: '#1e2530', opacity: 0.8 }, 
  textCompleted: { color: '#888', textDecorationLine: 'line-through' }, 

  cardLeft: { alignItems: 'center', marginRight: 15, width: 50 },
  cardTime: { color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  verticalLine: { width: 2, height: 25, backgroundColor: '#3498DB', borderRadius: 2 },
  cardContent: { flex: 1 },
  cardTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#888', fontSize: 12 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  emptySubText: { color: '#666', fontSize: 14 },
  fab: { position: 'absolute', bottom: 120, right: 30, backgroundColor: '#3498DB', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#1A1F2B', borderRadius: 15, padding: 20, maxHeight: '85%', borderWidth: 1, borderColor: '#3498DB' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2A4562', paddingBottom: 15 },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  
  detailRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  detailExoName: { color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  muscleBadge: { backgroundColor: '#2A4562', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  detailMuscle: { color: '#3498DB', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  
  setsContainer: { backgroundColor: '#232D3F', borderRadius: 8, padding: 10, marginTop: 5 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  setNumber: { color: '#888', fontSize: 13, fontWeight: 'bold', width: 35 },
  setValues: { flexDirection: 'row', alignItems: 'center' },
  setValueText: { color: 'white', fontSize: 14, fontWeight: 'bold', width: 70, textAlign: 'right' },
  setWeightText: { color: '#3498DB', fontSize: 14, fontWeight: 'bold', marginLeft: 10, width: 60, textAlign: 'right' },

  editSetRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  editSetInput: { backgroundColor: '#1A1F2B', color: 'white', paddingVertical: 6, borderRadius: 6, textAlign: 'center', fontSize: 14 },
  addExoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1, borderColor: '#3498DB', borderStyle: 'dashed', borderRadius: 10, marginTop: 10 },
  saveWorkoutBtn: { backgroundColor: '#2ecc71', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },

  addExoModalContainer: { flex: 1, backgroundColor: '#1A1F2B' },
  addExoModalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderColor: '#2A4562', alignItems: 'center' },
  addExoModalItem: { padding: 20, borderBottomWidth: 1, borderColor: '#2A4562', flexDirection: 'row', justifyContent: 'space-between' },
});

export default TrainingDashboard;