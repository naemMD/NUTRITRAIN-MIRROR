import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";
import Constants from 'expo-constants';
import axios from 'axios';

const API_URL = Constants.expoConfig?.extra?.API_URL ?? '';
const TOKEN_KEY = 'authToken';

export const getUserDetails = async () => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) return null;
  
    const decoded = jwtDecode(token);
    const userId = decoded.userId;
    const response = await axios.get(`${API_URL}/users/me/${userId}`);

    if (response.status_code !== 200) {
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
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    console.log('Error retrieving token:', error);
    return null;
  }
}

export const saveSession = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log('Token saved successfully');
  } catch (error) {
    console.log('Error saving token:', error);
  }
};

export const clearSession = async () => {
  console.log('Deleting session...');
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log('Session deleted');
  } catch (error) {
    console.log('Error while deleting the session:', error);
  }
};