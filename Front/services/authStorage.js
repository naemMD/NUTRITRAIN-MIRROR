import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { jwtDecode } from "jwt-decode";
import Constants from 'expo-constants';
import axios from 'axios';

const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';
const TOKEN_KEY = 'authToken';
const isWeb = typeof window !== 'undefined' && Platform.OS === 'web';

const setStorageItem = async (key, value) => {
  if (isWeb) {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItem = async (key) => {
  if (isWeb) {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const removeStorageItem = async (key) => {
  if (isWeb) {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

export const getUserDetails = async () => {
  try {
    const token = await getStorageItem(TOKEN_KEY);
    if (!token) return null;
  
    const decoded = jwtDecode(token);
    const userId = decoded.userId;
    const response = await axios.get(`${API_URL}/users/me/${userId}`);

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
    const token = await getStorageItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.log('Error retrieving token:', error);
    return null;
  }
}

export const saveSession = async (token) => {
  try {
    await setStorageItem(TOKEN_KEY, token);
    console.log('Token saved successfully');
  } catch (error) {
    console.log('Error saving token:', error);
  }
};

export const clearSession = async () => {
  console.log('Deleting session...');
  try {
    await removeStorageItem(TOKEN_KEY);
    console.log('Session deleted');
  } catch (error) {
    console.log('Error while deleting the session:', error);
  }
};