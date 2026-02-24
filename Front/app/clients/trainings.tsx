import React, { useState, useCallback, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, 
  Modal, ScrollView, Animated, PanResponder, Dimensions, Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '@/services/authStorage';

// --- CONFIGURATION CALENDRIER ---
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [loading, setLoading] = useState(false);
  
  // Modal Détails
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

  // Animation
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
      const token = await getToken();
      if (!token) return;
      const res = await axios.get(`${API_URL}/workouts/my-workouts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allWorkouts = res.data;
      
      // On s'assure que is_completed est bien géré (booléen)
      const sanitizedWorkouts = allWorkouts.map((w:any) => ({
          ...w,
          is_completed: !!w.is_completed // Force boolean
      }));

      setWorkouts(sanitizedWorkouts);

      const marks: any = {};
      sanitizedWorkouts.forEach((w: any) => {
        const dateStr = w.scheduled_date.split('T')[0];
        // Couleur différente si terminé
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

  // --- NOUVELLE FONCTION : CHECK WORKOUT ---
  const handleToggleWorkout = async (workoutId: number) => {
      // 1. Sauvegarde pour rollback
      const previousWorkouts = [...workouts];

      // 2. Mise à jour Optimiste (UI immédiate)
      setWorkouts(prev => prev.map(w => 
          w.id === workoutId ? { ...w, is_completed: !w.is_completed } : w
      ));

      try {
          const token = await getToken();
          // Appel de la route PATCH que nous avons créée
          await axios.patch(`${API_URL}/workouts/${workoutId}/toggle-complete`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
      } catch (error) {
          console.error("Error toggling workout:", error);
          setWorkouts(previousWorkouts); // On remet comme avant si erreur
          Alert.alert("Error", "Could not update status.");
      }
  };

  const handleDeleteWorkout = async (workoutId: number) => {
    Alert.alert(
        "Delete Workout",
        "Are you sure you want to delete this session?",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        const token = await getToken();
                        await axios.delete(`${API_URL}/workouts/${workoutId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setDetailModalVisible(false);
                        fetchWorkouts();
                    } catch (error) {
                        Alert.alert("Error", "Could not delete workout.");
                    }
                }
            }
        ]
    );
  };

  const dailyWorkouts = workouts.filter(w => w.scheduled_date.startsWith(selectedDate));

  const openWorkoutDetails = (workout: any) => {
      setSelectedWorkout(workout);
      setDetailModalVisible(true);
  };

  // --- MODIFICATION ICI : Rendu de la carte avec bouton Check ---
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
            {/* Partie Gauche : Heure */}
            <View style={styles.cardLeft}>
                <Text style={[styles.cardTime, isDone && {color: '#888'}]}>{time}</Text>
                <View style={[styles.verticalLine, isDone && {backgroundColor: '#2ecc71'}]} />
            </View>

            {/* Partie Centrale : Infos */}
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, isDone && styles.textCompleted]}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>
                    {exercises.length} Exercises • {uniqueMuscles || "General"}
                </Text>
            </View>
            
            {/* Partie Droite : Actions (Check + Eye) */}
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {/* BOUTON CHECK : On met un TouchableOpacity dédié */}
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* HEADER + CALENDRIER */}
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

      {/* BOTTOM SHEET */}
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

      {/* MODAL DETAILS */}
      <Modal visible={detailModalVisible} animationType="slide" transparent onRequestClose={() => setDetailModalVisible(false)}>
          <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                  {selectedWorkout && (
                      <>
                        <View style={styles.modalHeader}>
                            <View style={{flex: 1}}>
                                <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
                                <Text style={{color:'#888'}}>
                                    {new Date(selectedWorkout.scheduled_date).toDateString()}
                                </Text>
                            </View>
                            
                            {/* BOUTONS ACTIONS */}
                            <View style={{flexDirection: 'row', gap: 15}}>
                                {/* BOUTON DELETE */}
                                <TouchableOpacity onPress={() => handleDeleteWorkout(selectedWorkout.id)}>
                                    <Ionicons name="trash-outline" size={26} color="#e74c3c" />
                                </TouchableOpacity>

                                {/* BOUTON CLOSE */}
                                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                                    <Ionicons name="close-circle" size={30} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView style={{marginTop: 15}}>
                            {
                                (typeof selectedWorkout.exercises === 'string' 
                                    ? JSON.parse(selectedWorkout.exercises) 
                                    : selectedWorkout.exercises
                                ).map((exo: any, index: number) => (
                                <View key={index} style={styles.detailRow}>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.detailExoName}>{index+1}. {exo.name}</Text>
                                        <Text style={styles.detailMuscle}>{exo.muscle.toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.detailStats}>
                                        {exo.duration > 0 ? (
                                            <Text style={styles.statTextHighlight}>
                                                {exo.sets} sets x <Text style={{color: '#e67e22'}}>{exo.duration}s</Text>
                                            </Text>
                                        ) : (
                                            <Text style={styles.statTextHighlight}>
                                                {exo.sets} x {exo.reps} <Text style={{color:'#666'}}>@</Text> {exo.weight}kg
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                      </>
                  )}
              </View>
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
  
  // MODIF STYLES CARTE
  card: { flexDirection: 'row', backgroundColor: '#1A1F2B', padding: 15, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  cardCompleted: { backgroundColor: '#1e2530', opacity: 0.8 }, // Style quand terminé
  textCompleted: { color: '#888', textDecorationLine: 'line-through' }, // Texte barré

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
  modalContainer: { backgroundColor: '#232D3F', borderRadius: 15, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 15 },
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  detailExoName: { color: 'white', fontSize: 16, fontWeight: '600' },
  detailMuscle: { color: '#3498DB', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  detailStats: { backgroundColor: '#1A1F2B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statTextHighlight: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});

export default TrainingDashboard;