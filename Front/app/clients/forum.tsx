import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Link } from '@react-navigation/native';

const ForumScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image
                source={{ uri: 'PATH' }}
                style={styles.userAvatar}
              />
              <Text style={styles.userName}>Anonymous user</Text>
            </View>
            <Text style={styles.postContent}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin bibendum, nunc vitae aliquam imperdiet, lacus ligula vehicula neque, eget convallis leo risus laoreet eros. Fusce neque mauris, bibendum eu eros nec, tincidunt hendrerit tellus. Sed porta justo commodo tur... voir plus
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.addPostButton}>
        <Text style={styles.addPostText}>Add a post</Text>
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
  feedContainer: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#2A4562',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#CCCCCC',
  },
  userName: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  postContent: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
  },
  addPostButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  addPostText: {
    color: '#2A4562',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForumScreen;