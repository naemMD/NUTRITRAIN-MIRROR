import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MealCardProps {
  meal: any;
  onView: (meal: any) => void;
  onEdit: (meal: any) => void;
  onToggleEat: (id: number) => void;
}

const MealCard = ({ meal, onView, onEdit, onToggleEat }: MealCardProps) => {
  const isConsumed = meal.is_consumed;

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Parsing ingredients safely
  const foodList = typeof meal.aliments === 'string' ? JSON.parse(meal.aliments) : meal.aliments;

  return (
    <View style={[styles.card, isConsumed && styles.cardConsumed]}>
        
        {/* Header: Name, Time, Toggle Button */}
        <View style={styles.header}>
            <View style={{flex: 1}}>
                <Text style={[styles.title, isConsumed && styles.textConsumed]}>
                    {meal.name}
                </Text>
                <Text style={styles.time}>{formatTime(meal.hourtime)}</Text>
            </View>

            {/* EAT TOGGLE BUTTON */}
            <TouchableOpacity onPress={() => onToggleEat(meal.id)} style={styles.toggleBtn}>
                {isConsumed ? (
                    <Ionicons name="checkmark-circle" size={36} color="#2ecc71" />
                ) : (
                    <Ionicons name="ellipse-outline" size={36} color="#666" />
                )}
            </TouchableOpacity>
        </View>

        {/* Ingredients Summary */}
        <View style={styles.ingredients}>
            {foodList.slice(0, 3).map((food: any, i: number) => (
                <Text key={i} style={styles.ingText} numberOfLines={1}>
                    • {food.name} ({food.weight}g)
                </Text>
            ))}
            {foodList.length > 3 && <Text style={styles.ingText}>...</Text>}
        </View>

        {/* Macros & Actions */}
        <View style={styles.footer}>
            <View>
                <Text style={styles.cals}>{Math.round(meal.total_calories)} kcal</Text>
                <View style={{flexDirection: 'row', gap: 8}}>
                    <Text style={styles.macro}>P: {Math.round(meal.total_proteins)}</Text>
                    <Text style={styles.macro}>C: {Math.round(meal.total_carbohydrates)}</Text>
                    <Text style={styles.macro}>F: {Math.round(meal.total_lipids)}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onView(meal)}>
                    <Text style={styles.actionText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(meal)}>
                    <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
            </View>
        </View>

        {isConsumed && (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>EATEN</Text>
            </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2A4562',
    borderRadius: 12,
    marginBottom: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB'
  },
  cardConsumed: {
    backgroundColor: '#1c2431',
    borderLeftColor: '#2ecc71',
    opacity: 0.8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  textConsumed: {
    textDecorationLine: 'line-through',
    color: '#888'
  },
  time: {
    color: '#aaa',
    fontSize: 12
  },
  toggleBtn: {
    paddingLeft: 10
  },
  ingredients: {
    marginBottom: 10
  },
  ingText: {
    color: '#ccc',
    fontSize: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10
  },
  cals: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  macro: {
    color: '#888',
    fontSize: 12
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  actionBtn: {
    backgroundColor: '#3498DB',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 50,
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2ecc71'
  },
  badgeText: {
    color: '#2ecc71',
    fontSize: 10,
    fontWeight: 'bold'
  }
});

export default MealCard;