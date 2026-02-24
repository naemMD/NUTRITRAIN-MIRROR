import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

// Liste des jours de la semaine
const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const WeekDays = () => {
  const router = useRouter(); // Hook pour la navigation

  // Fonction pour gérer la sélection d'un jour
  const handleDayClick = (day: string) => {
    router.push(`/jour/${day}`); // Redirige vers la page correspondante
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sélectionnez un jour de la semaine</Text>
      <View style={styles.daysContainer}>
        {daysOfWeek.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dayButton}
            onPress={() => handleDayClick(day)}
          >
            <Text style={styles.dayText}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  dayButton: {
    padding: 10,
    margin: 5,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  dayText: {
    color: "white",
    fontSize: 18,
  },
});

export default WeekDays;
