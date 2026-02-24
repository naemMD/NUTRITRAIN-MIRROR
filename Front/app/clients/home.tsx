import React, { useState, useRef, useCallback } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, 
  ScrollView, Image, TextInput, Modal, Keyboard, 
  ActivityIndicator, StatusBar, Alert, Platform, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import Constants from 'expo-constants';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';

import { getUserDetails, getToken } from '@/services/authStorage';
import MealCard from '@/components/MealCard';

const { width, height } = Dimensions.get('window');

// --- COMPOSANT IMAGE UTILITAIRE ---
const FoodImage = ({ uri, style, iconSize = 24 }: any) => {
  const hasValidImage = uri && uri !== '' && uri !== 'null';
  if (hasValidImage) {
    return <Image source={{ uri: uri }} style={style} />;
  } else {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#2C3E50' }]}>
        <Ionicons name="fast-food-outline" size={iconSize} color="#888" />
      </View>
    );
  }
};

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  // --- STATE DASHBOARD ---
  const [user, setUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [myMeals, setMyMeals] = useState<any[]>([]);

  // --- STATE MODIF OBJECTIF ---
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [updatingGoal, setUpdatingGoal] = useState(false);

  // --- STATE CREATION REPAS ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mealName, setMealName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  
  const [search, setSearch] = useState('');
  const [searchWeight, setSearchWeight] = useState(''); 
  const [results, setResults] = useState<any[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);
  const [editingId, setEditingId] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // --- STATE CAMERA ---
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const isProcessingScan = useRef(false);

  // --- STATE VIEW / DETAIL ---
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [mealToView, setMealToView] = useState<any>(null);
  
  // Modale de détail (Grammage) après scan
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [nutriments, setNutriments] = useState<any>(null);
  const [grammage, setGrammage] = useState('');


  // --- 1. INITIALISATION ---
  useFocusEffect(
    useCallback(() => {
        loadData();
    }, [])
  );

  const loadData = async () => {
    setLoadingStats(true);
    const session = await getUserDetails();
    if (session) {
      setUser(session);
      await Promise.all([
          fetchMeals(session.id),
          fetchDashboardStats(session.id)
      ]);
    }
    setLoadingStats(false);
  };

  const fetchDashboardStats = async (userId: number) => {
    try {
        const token = await getToken();
        const res = await axios.get(`${API_URL}/users/me/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardStats(res.data);
    } catch (error) {
        console.log("Error stats:", error);
    }
  };

  const fetchMeals = async (userId: number) => {
    try {
      const response = await axios.get(`${API_URL}/users/get_daily_meals/${userId}`);
      const sorted = response.data.meals.sort((a: any, b: any) => 
        new Date(a.hourtime).getTime() - new Date(b.hourtime).getTime()
      );
      setMyMeals(sorted);
    } catch (error) {
      console.log("Error meals:", error);
    }
  };

  // --- 2. ACTIONS DASHBOARD ---
  const handleToggleEat = async (mealId: number) => {
      try {
          const token = await getToken();
          setMyMeals(prev => prev.map(m => m.id === mealId ? {...m, is_consumed: !m.is_consumed} : m));
          await axios.patch(`${API_URL}/meals/${mealId}/toggle-consume`, {}, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (user) fetchDashboardStats(user.id);
      } catch (error) {
          Alert.alert("Error", "Connection issue");
      }
  };

  const handleUpdateGoal = async () => {
    const goalValue = parseFloat(newGoal);
    if (isNaN(goalValue) || goalValue <= 0) return;
    setUpdatingGoal(true);
    try {
        const token = await getToken();
        await axios.patch(`${API_URL}/users/me/goals`, { daily_caloric_needs: goalValue }, { headers: { Authorization: `Bearer ${token}` } });
        setIsGoalModalVisible(false);
        if (user) fetchDashboardStats(user.id);
    } catch (error) {
        Alert.alert("Error", "Could not update goal");
    } finally {
        setUpdatingGoal(false);
    }
  };

  // --- 3. ACTIONS CREATION REPAS ---
  const searchFood = async () => {
    if (!searchWeight || isNaN(parseFloat(searchWeight)) || parseFloat(searchWeight) <= 0) {
      Alert.alert("Weight Missing", "Please enter a weight (grams) BEFORE searching.");
      return; 
    }
    if (!search.trim()) return;

    setLoadingSearch(true);
    try {
      const response = await axios.get(`${API_URL}/getAlimentFromApi/${search}`);
      setResults(response.data.map((food: any) => ({
          name: food.name,
          image: food.image,
          code: food.code || food.id || food.barcode || null
      })));
    } catch (error) {
      setResults([]);
    }
    setLoadingSearch(false);
  };

  const handleSelectFood = async (item: any) => {
    if (!searchWeight) {
        Alert.alert("Error", "Weight is missing.");
        return;
    }

    setLoadingSearch(true);
    try {
      const response = await axios.get(`${API_URL}/getAlimentNutriment/${item.code}/${searchWeight}`);
      const foodDetails = response.data;

      const newItem = {
        name: item.name, 
        image: item.image, 
        weight: searchWeight, 
        code: item.code,
        macros: {
          energy: foodDetails.energy, 
          proteins: foodDetails.proteins,
          carbohydrates: foodDetails.carbohydrates, 
          sugars: foodDetails.sugars,
          lipids: foodDetails.lipids, 
          saturated_fats: foodDetails.saturated_fats,
          fibers: foodDetails.fiber, 
          salt: foodDetails.salt,
        }
      };

      setSelectedFoods(prev => [...prev, newItem]);
      
      setResults([]); 
      setSearch(''); 
      setSearchWeight('');

    } catch (error) {
      Alert.alert("Error", "Could not fetch food details.");
    }
    setLoadingSearch(false);
  };

  const removeSelectedFood = (indexToRemove: number) => {
      setSelectedFoods(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCreateMeal = async () => {
    if (!mealName.trim() || selectedFoods.length === 0) {
      Alert.alert("Missing Info", "Please add a name and at least one food.");
      return;
    }

    const sumMacro = (key: string) => selectedFoods.reduce((sum, item) => sum + (parseFloat(item.macros?.[key]) || 0), 0);

    const mealData = {
      name: mealName,
      hourtime: getLocalISOString(date),
      total_calories: sumMacro('energy'),
      total_proteins: sumMacro('proteins'),
      total_carbohydrates: sumMacro('carbohydrates'),
      total_sugars: sumMacro('sugars'),
      total_lipids: sumMacro('lipids'),
      total_saturated_fats: sumMacro('saturated_fats'),
      total_fiber: sumMacro('fibers'),
      total_salt: sumMacro('salt'),
      aliments: selectedFoods,
      is_consumed: false
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/updateMeal/${editingId}`, mealData);
      } else {
        await axios.post(`${API_URL}/addMeal/${user?.id}`, mealData);
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.log("Error saving meal:", error);
    }
  };

  const handleEdit = (meal: any) => {
    resetForm();
    setMealName(meal.name);
    setDate(new Date(meal.hourtime)); 
    const foods = typeof meal.aliments === 'string' ? JSON.parse(meal.aliments) : meal.aliments;
    setSelectedFoods(foods);
    setEditingId(meal.id);
    setIsModalVisible(true);
  };

  const handleView = (meal: any) => {
    const foods = typeof meal.aliments === 'string' ? JSON.parse(meal.aliments) : meal.aliments;
    setMealToView({ ...meal, aliments: foods });
    setIsViewModalVisible(true);
  };

  const handleDeleteMeal = async () => {
    if (!editingId) return;
    try {
        await axios.delete(`${API_URL}/deleteMeal/${editingId}`);
        await loadData();
        handleCloseModal();
    } catch (error) {
        console.log("Error delete:", error);
    }
  };

  // --- LOGIQUE CAMERA ---
  const openCameraModal = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission required", "Camera access is needed.");
        return;
      }
    }
    
    isProcessingScan.current = false;
    setScanned(false);
    
    setIsModalVisible(false);
    setTimeout(() => {
        setIsCameraOpen(true);
    }, 300);
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
      if (scanned || isProcessingScan.current) return;
      isProcessingScan.current = true;
      setScanned(true);

      try {
          const response = await axios.get(`${API_URL}/scan/${data}/json`);
          const foodData = { 
              name: response.data.name || 'Scanned Food', 
              code: data, 
              image: response.data.image 
          };
          
          setNutriments(response.data);
          setSelectedFood(foodData);
          setGrammage('');

          setIsCameraOpen(false);
          setTimeout(() => {
              setIsDetailModalVisible(true);
          }, 300);

      } catch (error) {
          Alert.alert("Not Found", "Product not found. Try manual search.");
          setIsCameraOpen(false);
          setTimeout(() => setIsModalVisible(true), 300);
      } finally {
          isProcessingScan.current = false;
      }
  };
  
  const validateGrammageScan = () => {
    if (!nutriments) return;
    const g = parseFloat(grammage);
    if (isNaN(g) || g <= 0) {
        Alert.alert("Invalid Weight");
        return;
    }
    const ratio = g / 100;
    const newItem = { 
        ...selectedFood, 
        weight: g, 
        macros: {
            energy: (nutriments.energy * ratio).toFixed(1),
            proteins: (nutriments.proteins * ratio).toFixed(1),
            carbohydrates: (nutriments.carbohydrates * ratio).toFixed(1),
            sugars: (nutriments.sugars * ratio).toFixed(1),
            lipids: (nutriments.lipids * ratio).toFixed(1),
            saturated_fats: (nutriments.saturated_fats * ratio).toFixed(1),
            fibers: (nutriments.fibers * ratio).toFixed(1),
            salt: (nutriments.salt * ratio).toFixed(1)
        }
    };
    setSelectedFoods(prev => [...prev, newItem]);
    setIsDetailModalVisible(false);
    setTimeout(() => setIsModalVisible(true), 300);
  };

  // --- UTILS ---
  const resetForm = () => {
    setMealName(''); setSearch(''); setSearchWeight(''); setSelectedFoods([]); setResults([]);
    setDate(new Date()); setShowPicker(false); setLoadingSearch(false); setEditingId(null);
  };
  const handleCloseModal = () => { resetForm(); setIsModalVisible(false); };
  const getLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, -1);
  };
  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });


  const ProgressBar = ({ label, current, total, color }: any) => {
    const target = total || (label === 'Proteins' ? 150 : label === 'Carbs' ? 250 : 70);
    const percentage = target > 0 ? Math.min(1, current / target) : 0;
    return (
      <View style={styles.macroItem}>
        <Text style={styles.macroValue}>{Math.round(current)}g</Text>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={{color:'#666', fontSize:9}}> / {Math.round(target)}g</Text>
        <View style={{height: 4, backgroundColor: '#1A1F2B', marginTop: 5, borderRadius: 2, width: '100%'}}>
            <View style={{width: `${percentage*100}%`, backgroundColor: color, height: '100%', borderRadius: 2}} />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* DASHBOARD */}
      {loadingStats || !dashboardStats ? (
          <ActivityIndicator color="#3498DB" style={{margin: 20}} />
      ) : (
          <View style={styles.statsContainer}>
            <View style={styles.calorieGoalContainer}>
                <View>
                    <Text style={styles.calorieGoalText}>
                        <Text style={{fontSize: 24, fontWeight: 'bold'}}>{Math.round(dashboardStats.calories_consumed)}</Text>
                        <Text style={{color: '#aaa'}}> / {Math.round(dashboardStats.daily_caloric_goal)} kcal</Text>
                    </Text>
                    <Text style={styles.caloriesRemaining}>{Math.round(dashboardStats.calories_remaining)} Remaining</Text>
                </View>
                <TouchableOpacity onPress={() => { setNewGoal(dashboardStats.daily_caloric_goal.toString()); setIsGoalModalVisible(true); }} style={{padding: 5}}>
                    <Ionicons name="pencil-outline" size={20} color="#3498DB" />
                </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
                <View style={[styles.progressBarFill, { width: `${dashboardStats.progress_percentage * 100}%`, backgroundColor: dashboardStats.progress_percentage >= 1 ? '#e74c3c' : '#3498DB' }]} />
            </View>

            <View style={styles.macrosContainer}>
                <ProgressBar label="Proteins" current={dashboardStats.proteins_consumed} total={dashboardStats.goal_proteins} color="#9b59b6" />
                <ProgressBar label="Carbs" current={dashboardStats.carbs_consumed} total={dashboardStats.goal_carbs} color="#f1c40f" />
                <ProgressBar label="Fats" current={dashboardStats.fats_consumed} total={dashboardStats.goal_fats} color="#e67e22" />
            </View>
          </View>
      )}

      {/* MEALS LIST */}
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10}}>
          <Text style={styles.catalogueTitle}>Today's Meals</Text>
      </View>

      <ScrollView style={styles.mealsContainer} showsVerticalScrollIndicator={false}>
        {myMeals.length === 0 && <Text style={{color: 'gray', textAlign: 'center', marginTop: 20}}>No meals added yet.</Text>}
        {myMeals.map((meal, index) => (
            <MealCard key={index} meal={meal} onToggleEat={handleToggleEat} onView={handleView} onEdit={handleEdit}/>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setIsModalVisible(true); }}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>


      {/* --- MODAL 1: CREATE/EDIT MEAL --- */}
      <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={handleCloseModal}>
        <View style={styles.modalBackground}>
          {/* CORRECTION FLEX : On donne une taille max, mais on laisse le contenu interne gérer */}
          <View style={styles.modalContainer}>
            
            {/* Header Inputs */}
            <View>
                <View style={styles.rowContainer}>
                <View style={styles.timeContainer}>
                    <Text style={styles.label}>Time</Text>
                    <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={styles.timeButton}>
                    <Text style={styles.timeText}>{formatTime(date)}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.label}>Meal Name</Text>
                    <TextInput style={styles.textInput} placeholder="e.g. Lunch" placeholderTextColor="#888" value={mealName} onChangeText={setMealName} />
                </View>
                </View>
                {showPicker && <DateTimePicker value={date} mode="time" display="spinner" onChange={(e,d) => {setShowPicker(Platform.OS==='ios'); if(d) setDate(d);}} themeVariant="dark" />}
                
                <Text style={[styles.label, {marginTop:15}]}>Add Food (Enter Weight first!)</Text>
                <View style={styles.searchRow}>
                <TextInput 
                    style={[styles.searchInput, {width: 80, textAlign:'center', backgroundColor: '#1A1F2B', borderColor: '#3498DB', borderWidth: 1}]} 
                    placeholder="g" 
                    keyboardType="numeric"  
                    value={searchWeight} 
                    onChangeText={setSearchWeight} 
                    placeholderTextColor="#888"
                />
                <TextInput 
                    style={[styles.searchInput, {flex: 1, marginLeft: 10}]} 
                    placeholder="Type food name..." 
                    value={search} 
                    onChangeText={setSearch} 
                    placeholderTextColor="#888"
                />
                <TouchableOpacity style={styles.searchButton} onPress={searchFood}>
                    {loadingSearch ? <ActivityIndicator size="small" color="white"/> : <Ionicons name="search" size={20} color="white" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchButton} onPress={openCameraModal}>
                    <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
                </View>
            </View>

            {/* Resultats Recherche */}
            {results.length > 0 && (
                <View style={{height: 150, marginTop: 10, backgroundColor:'#1F2937', borderRadius:8}}>
                    <ScrollView nestedScrollEnabled>
                        {results.map((item, i) => (
                            <TouchableOpacity key={i} style={styles.resultItem} onPress={() => handleSelectFood(item)}>
                                <FoodImage uri={item.image} style={styles.resultImage}/>
                                <Text style={styles.resultText}>{item.name}</Text>
                                <Ionicons name="add-circle" size={24} color="#3498DB" style={{marginLeft:'auto'}}/>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* --- CORRECTION CRITIQUE : Zone Liste avec Hauteur FIXE --- */}
            {/* On abandonne flex:1 instable pour une hauteur explicite qui garantit la visibilité */}
            <View style={styles.fixedListContainer}>
                <Text style={[styles.label, {marginBottom: 5}]}>Selected Items ({selectedFoods.length})</Text>
                
                {selectedFoods.length === 0 ? (
                    <View style={styles.emptyListPlaceholder}>
                        <Text style={{color:'#666'}}>No food selected.</Text>
                        <Text style={{color:'#444', fontSize:10}}>Add food via search or camera</Text>
                    </View>
                ) : (
                    <ScrollView nestedScrollEnabled style={{width: '100%'}}>
                        {selectedFoods.map((item, index) => (
                            <View key={index} style={styles.selectedFoodRow}>
                                <FoodImage uri={item.image} style={styles.selectedFoodImage} iconSize={18} />
                                <View style={styles.selectedFoodInfo}>
                                    <Text style={styles.selectedFoodName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.selectedFoodStats}>
                                        {item.weight}g • {Math.round(item.macros?.energy)} kcal
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => removeSelectedFood(index)} style={{padding:8}}>
                                    <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Footer Buttons */}
            <View style={{marginTop: 'auto', paddingTop: 10}}>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateMeal}>
                    <Text style={{color:'white', fontWeight:'bold'}}>{editingId ? "Update Meal" : "Create Meal"}</Text>
                </TouchableOpacity>
                {editingId && (
                     <TouchableOpacity style={[styles.createButton, {backgroundColor: '#c0392b', marginTop: 10}]} onPress={handleDeleteMeal}>
                        <Text style={{color:'white'}}>Delete Meal</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                    <Text style={{color:'white'}}>Close</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- CAMERA (OVERLAY CORRIGÉ) --- */}
      <Modal visible={isCameraOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <CameraView 
                style={StyleSheet.absoluteFillObject} 
                facing="back" 
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} 
            />
            
            {/* OVERLAY SCANNER TYPE "MASQUE" */}
            <View style={styles.overlay}>
                {/* Couche du haut sombre */}
                <View style={styles.layerTop} />
                
                <View style={styles.layerCenter}>
                    {/* Gauche sombre */}
                    <View style={styles.layerLeft} />
                    
                    {/* Centre transparent (Viseur) */}
                    <View style={styles.focused}>
                        {/* Coins décoratifs optionnels */}
                        <View style={[styles.corner, {top:0, left:0, borderTopWidth:3, borderLeftWidth:3}]} />
                        <View style={[styles.corner, {top:0, right:0, borderTopWidth:3, borderRightWidth:3}]} />
                        <View style={[styles.corner, {bottom:0, left:0, borderBottomWidth:3, borderLeftWidth:3}]} />
                        <View style={[styles.corner, {bottom:0, right:0, borderBottomWidth:3, borderRightWidth:3}]} />
                    </View>
                    
                    {/* Droite sombre */}
                    <View style={styles.layerRight} />
                </View>
                
                {/* Couche du bas sombre */}
                <View style={styles.layerBottom} />
            </View>

            {/* Instructions */}
            <View style={{position:'absolute', top: 60, width:'100%', alignItems:'center'}}>
                <Text style={{color:'white', fontSize: 18, fontWeight:'bold', textShadowColor:'black', textShadowRadius:5}}>
                    Scan Barcode
                </Text>
            </View>

            <TouchableOpacity 
                style={styles.closeCameraButton} 
                onPress={() => { setIsCameraOpen(false); setIsModalVisible(true); }}
            >
                <Ionicons name="close" size={32} color="black" />
            </TouchableOpacity>
        </View>
      </Modal>

      {/* --- DETAIL MODAL (Scan) --- */}
      <Modal visible={isDetailModalVisible} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
                {selectedFood && (
                    <>
                        <Text style={styles.modalTitle}>{selectedFood.name}</Text>
                        <FoodImage uri={selectedFood.image} style={{width: 100, height: 100, borderRadius: 10, alignSelf:'center', marginBottom:10}} />
                        
                        <Text style={{color:'#ccc', textAlign:'center', marginBottom:5}}>Enter Weight (g)</Text>
                        <TextInput 
                            style={[styles.textInput, {marginBottom: 20, textAlign:'center', fontSize: 20, fontWeight:'bold'}]} 
                            keyboardType="numeric" 
                            value={grammage} 
                            onChangeText={setGrammage} 
                            placeholder="e.g. 100" 
                            placeholderTextColor="#555"
                            autoFocus
                        />
                        
                        <View style={{flexDirection:'row', justifyContent:'space-between', gap: 10}}>
                            <TouchableOpacity 
                                onPress={() => { setIsDetailModalVisible(false); setIsModalVisible(true); }} 
                                style={[styles.closeButton, {marginTop:0, flex:1}]}
                            >
                                <Text style={{color:'white'}}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={validateGrammageScan} 
                                style={[styles.modalAddButton, {flex:1}]}
                            >
                                <Text style={{color:'white', fontWeight:'bold'}}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </TouchableOpacity>
      </Modal>

      {/* VIEW MEAL */}
      <Modal visible={isViewModalVisible} animationType="fade" transparent onRequestClose={() => setIsViewModalVisible(false)}>
        <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
                {mealToView && (
                    <>
                        <Text style={styles.modalTitle}>{mealToView.name}</Text>
                        <ScrollView style={{maxHeight: 300}}>
                            {mealToView.aliments.map((f: any, i: number) => (
                                <View key={i} style={styles.resultItem}>
                                    <FoodImage uri={f.image} style={styles.resultImage} iconSize={20} />
                                    <View style={{flex:1}}>
                                        <Text style={styles.resultText}>{f.name}</Text>
                                        <Text style={{color:'#aaa', fontSize:12}}>Weight: {f.weight}g</Text>
                                    </View>
                                    <View style={{alignItems:'flex-end'}}>
                                        <Text style={{color:'#3498DB', fontWeight:'bold'}}>{Math.round(f.macros?.energy)}</Text>
                                        <Text style={{color:'#3498DB', fontSize:10}}>kcal</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setIsViewModalVisible(false)}>
                            <Text style={{color:'white'}}>Close</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
       </Modal>

       {/* UPDATE GOAL */}
       <Modal visible={isGoalModalVisible} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={() => setIsGoalModalVisible(false)}>
            <View style={[styles.modalContainer, {width: '80%'}]}>
                <Text style={styles.modalTitle}>Daily Goal</Text>
                <TextInput style={styles.textInput} keyboardType="numeric" value={newGoal} onChangeText={setNewGoal} placeholder="e.g. 2500" placeholderTextColor="#777" autoFocus/>
                <View style={{flexDirection:'row', justifyContent:'flex-end', marginTop: 20}}>
                    <TouchableOpacity onPress={handleUpdateGoal} style={styles.modalAddButton} disabled={updatingGoal}>
                        {updatingGoal ? <ActivityIndicator size="small" color="white"/> : <Text style={{color:'white'}}>Save</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1F2B', paddingHorizontal: 16 },
  
  // DASHBOARD
  statsContainer: { backgroundColor: '#232D3F', borderRadius: 16, padding: 15, marginBottom: 15 },
  calorieGoalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  calorieGoalText: { color: 'white' },
  caloriesRemaining: { color: '#bbb', fontSize: 12, marginTop: 4 },
  progressContainer: { height: 10, backgroundColor: '#1A1F2B', borderRadius: 5, marginTop: 15, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  macrosContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  macroItem: { width: '30%', backgroundColor: '#2A4562', padding: 8, borderRadius: 8, alignItems: 'center' },
  macroValue: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  macroLabel: { color: '#ccc', fontSize: 10 },
  catalogueTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  mealsContainer: { flex: 1 },
  
  // SHARED UI
  addButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#3498DB', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", backgroundColor: "#2A4562", borderRadius: 15, padding: 20, maxHeight: '90%' }, 
  modalTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign:'center' },
  textInput: { backgroundColor: '#1A1F2B', color: 'white', padding: 12, borderRadius: 8 },
  closeButton: { backgroundColor: '#e74c3c', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10, width:'100%' },
  createButton: { backgroundColor: '#3498DB', padding: 15, borderRadius: 10, alignItems: 'center', width:'100%' },
  modalAddButton: { backgroundColor: '#2ecc71', padding: 12, borderRadius: 8, alignItems: 'center', minWidth: 80 },
  
  // MEAL FORM
  rowContainer: { flexDirection: 'row', gap: 10 },
  timeContainer: { flex: 1 }, nameContainer: { flex: 2 },
  label: { color: '#ccc', fontSize: 12, marginBottom: 5 },
  timeButton: { backgroundColor: '#1A1F2B', padding: 12, borderRadius: 8, alignItems: 'center' },
  timeText: { color: '#3498DB', fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', marginTop: 5, alignItems: 'center' },
  searchInput: { backgroundColor: '#1A1F2B', color: 'white', padding: 10, borderRadius: 8 },
  searchButton: { backgroundColor: '#3498DB', padding: 10, borderRadius: 8, marginLeft: 8 },
  
  // LISTS & RESULTS
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth:1, borderBottomColor:'#333' },
  resultImage: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  resultText: { color: 'white', fontWeight: 'bold', flex: 1 },

  // CORRECTION LISTE (ZONE DÉDIÉE)
  fixedListContainer: { 
      marginTop: 20, 
      height: 250, // Hauteur FIXE pour garantir l'affichage
      marginBottom: 10
  },
  emptyListPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#444',
      borderStyle: 'dashed',
      borderRadius: 8,
      backgroundColor: '#253545'
  },
  selectedFoodRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: '#1F2937', 
      padding: 10, 
      borderRadius: 8, 
      marginBottom: 8,
      borderLeftWidth: 3, 
      borderLeftColor: '#3498DB'
  },
  selectedFoodImage: { width: 40, height: 40, borderRadius: 8, marginRight: 10 },
  selectedFoodInfo: { flex: 1 },
  selectedFoodName: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  selectedFoodStats: { color: '#aaa', fontSize: 12, marginTop: 2 },

  // CAMERA OVERLAY
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  layerTop: { flex: 1, width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  layerCenter: { flexDirection: 'row', height: 250 },
  layerLeft: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  focused: { width: 250, height: 250, borderWidth: 1, borderColor: '#3498DB', backgroundColor: 'transparent' },
  layerRight: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  layerBottom: { flex: 1, width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  corner: { position: 'absolute', width: 20, height: 20, borderColor: 'white' },
  closeCameraButton: { position: 'absolute', bottom: 50, alignSelf:'center', backgroundColor:'white', width:60, height:60, borderRadius:30, justifyContent:'center', alignItems:'center' }
});

export default HomeScreen;