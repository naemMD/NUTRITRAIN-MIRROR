import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { jwtDecode } from "jwt-decode";
import Constants from 'expo-constants';
import axios from 'axios';

const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';
const TOKEN_KEY = 'authToken';

// --- HELPERS STOCKAGE WEB vs MOBILE ---
const setStorageItem = async (key, value) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItem = async (key) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const removeStorageItem = async (key) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};
// --------------------------------------

export const getUserDetails = async () => {
  try {
    // Utilisation du nouveau helper
    const token = await getStorageItem(TOKEN_KEY);
    if (!token) return null;
  
    const decoded = jwtDecode(token);
    const userId = decoded.userId;
    const response = await axios.get(`${API_URL}/users/me/${userId}`);

    // Petite note : avec Axios, le statut HTTP est stocké dans `response.status`
    if (response.status === 200 || response.data) {
      console.log('User details fetched successfully');
      return response.data;
    } else {
      console.log('Failed to fetch user details');
      return null;
    }

  } catch (error) {
    console.log('Error retrieving session:', error);
    return null;
  }
};

export const getToken = async () => {
  try {
    // Utilisation du nouveau helper
    const token = await getStorageItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.log('Error retrieving token:', error);
    return null;
  }
}

export const saveSession = async (token) => {
  try {
    // Utilisation du nouveau helper
    await setStorageItem(TOKEN_KEY, token);
    console.log('Token saved successfully');
  } catch (error) {
    console.log('Error saving token:', error);
  }
};

export const clearSession = async () => {
  console.log('Deleting session...');
  try {
    // Utilisation du nouveau helper
    await removeStorageItem(TOKEN_KEY);
    console.log('Session deleted');
  } catch (error) {
    console.log('Error while deleting the session:', error);
  }
};