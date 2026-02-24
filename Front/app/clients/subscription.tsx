import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SubscriptionScreen = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <View style={styles.starContainer}>
        <Ionicons name="star-outline" size={120} color="#EAEA45" />
      </View>
      
      <Text style={styles.subscriptionTitle}>You have a VIP subscription</Text>
      
      <View style={styles.subscriptionDetails}>
        <Text style={styles.nextPaymentLabel}>Next mensuality :</Text>
        <Text style={styles.nextPaymentDate}>1 april 2025</Text>
      </View>
      
      <TouchableOpacity style={styles.detailsButton}>
        <Text style={styles.detailsButtonText}>View details</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>End subscription</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1F2B',
    paddingHorizontal: 16,
  },
  starContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  subscriptionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  subscriptionDetails: {
    alignItems: 'center',
    marginBottom: 40,
  },
  nextPaymentLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  nextPaymentDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detailsButton: {
    backgroundColor: '#2A4562',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF4757',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;