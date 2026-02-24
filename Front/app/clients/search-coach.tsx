// FRONTapp/app/clients/search-coach.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert, Keyboard 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';

export default function SearchCoachScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';

  const [searchQuery, setSearchQuery] = useState('');
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger tous les coachs au lancement de la page (sans filtre)
  useEffect(() => {
    fetchCoaches();
  }, []);

  // Fonction pour appeler l'API
  const fetchCoaches = async (cityQuery: string = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/clients/search-coaches`, {
        params: { city: cityQuery }
      });
      setCoaches(response.data);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Erreur', 'Impossible de récupérer la liste des coachs.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    Keyboard.dismiss(); // Cache le clavier
    fetchCoaches(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchCoaches('');
  };

  // Design de la carte d'un coach
  const renderCoachCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.firstname ? item.firstname[0].toUpperCase() : '?'}</Text>
        </View>
        <View style={styles.coachInfo}>
          <Text style={styles.coachName}>{item.firstname} {item.lastname}</Text>
          <Text style={styles.coachCity}>
            <Ionicons name="location-outline" size={14} color="#aaa" /> {item.city || 'Non spécifié'}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.requestButton}
        onPress={() => Alert.alert('Coming Soon 🚀', `Tu pourras bientôt envoyer une demande à ${item.firstname} !`)}
      >
        <Text style={styles.requestButtonText}>Demander un suivi</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <Ionicons name="arrow-back" size={28} color="#3498DB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trouver un Coach</Text>
        <View style={{ width: 38 }} /> {/* Spacer pour centrer le titre */}
      </View>

      {/* BARRE DE RECHERCHE */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8A8D91" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par ville (ex: Marseille)"
          placeholderTextColor="#8A8D91"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
            <Ionicons name="close-circle" size={20} color="#8A8D91" />
          </TouchableOpacity>
        )}
      </View>

      {/* RÉSULTATS */}
      {loading ? (
        <ActivityIndicator size="large" color="#3498DB" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={coaches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCoachCard}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun coach trouvé dans cette ville.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1F2B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
  
  // Barre de recherche
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A4562', marginHorizontal: 20, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: 'white', fontSize: 16, paddingVertical: 12 },
  clearIcon: { marginLeft: 10 },
  
  // Liste
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40, fontStyle: 'italic', fontSize: 16 },
  
  // Carte Coach
  card: { backgroundColor: '#2A4562', borderRadius: 15, padding: 15, marginBottom: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  coachInfo: { marginLeft: 15, flex: 1 },
  coachName: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  coachCity: { color: '#aaa', fontSize: 14 },
  
  // Bouton
  requestButton: { backgroundColor: 'rgba(46, 204, 113, 0.2)', borderWidth: 1, borderColor: '#2ecc71', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  requestButtonText: { color: '#2ecc71', fontSize: 16, fontWeight: 'bold' }
});