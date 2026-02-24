export type ExerciseType = 'strength' | 'duration';

export interface ExerciseData {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  description: string;
  type: ExerciseType; // <--- Le nouveau champ obligatoire
}

export const LOCAL_EXERCISES: ExerciseData[] = [
  // --- CHEST (Pectoraux) ---
  {
    id: "chest_1",
    name: "Barbell Bench Press",
    muscle: "chest",
    equipment: "Barbell",
    description: "Lying on a bench, press the bar up from chest level. The king of chest exercises.",
    type: 'strength'
  },
  {
    id: "chest_2",
    name: "Incline Dumbbell Press",
    muscle: "chest",
    equipment: "Dumbbells",
    description: "Press dumbbells up on an inclined bench to target upper chest.",
    type: 'strength'
  },
  {
    id: "chest_3",
    name: "Push-Ups",
    muscle: "chest",
    equipment: "Bodyweight",
    description: "Classic bodyweight movement. Keep body straight and lower chest to floor.",
    type: 'strength'
  },
  {
    id: "chest_4",
    name: "Cable Fly",
    muscle: "chest",
    equipment: "Cable",
    description: "Stand between pulleys and pull handles together in front of chest.",
    type: 'strength'
  },

  // --- BACK (Dos) ---
  {
    id: "back_1",
    name: "Deadlift",
    muscle: "back",
    equipment: "Barbell",
    description: "Lift heavy weight from the floor. Targets entire posterior chain.",
    type: 'strength'
  },
  {
    id: "back_2",
    name: "Pull-Ups",
    muscle: "back",
    equipment: "Bodyweight",
    description: "Hang from bar and pull chin over bar. Builds back width.",
    type: 'strength'
  },
  {
    id: "back_3",
    name: "Bent Over Barbell Row",
    muscle: "back",
    equipment: "Barbell",
    description: "Bend at hips and pull barbell to lower chest/abs.",
    type: 'strength'
  },
  {
    id: "back_4",
    name: "Lat Pulldown",
    muscle: "back",
    equipment: "Machine",
    description: "Seated machine pull-down, excellent alternative to pull-ups.",
    type: 'strength'
  },

  // --- LEGS (Jambes) ---
  {
    id: "legs_1",
    name: "Barbell Squat",
    muscle: "legs",
    equipment: "Barbell",
    description: "Squat down with bar on back. The most important leg exercise.",
    type: 'strength'
  },
  {
    id: "legs_2",
    name: "Leg Press",
    muscle: "legs",
    equipment: "Machine",
    description: "Push weight away with legs on a 45-degree machine.",
    type: 'strength'
  },
  {
    id: "legs_3",
    name: "Walking Lunges",
    muscle: "legs",
    equipment: "Dumbbells",
    description: "Step forward and lower hips, alternating legs.",
    type: 'strength'
  },
  {
    id: "legs_4",
    name: "Leg Extension",
    muscle: "legs",
    equipment: "Machine",
    description: "Isolate the quadriceps by extending knees against resistance.",
    type: 'strength'
  },
  {
    id: "legs_5",
    name: "Romanian Deadlift",
    muscle: "legs",
    equipment: "Barbell",
    description: "Hinge at hips with straight legs to target hamstrings.",
    type: 'strength'
  },

  // --- SHOULDERS (Épaules) ---
  {
    id: "shoulders_1",
    name: "Overhead Press (Military)",
    muscle: "shoulders",
    equipment: "Barbell",
    description: "Press barbell from shoulders to overhead while standing.",
    type: 'strength'
  },
  {
    id: "shoulders_2",
    name: "Dumbbell Lateral Raise",
    muscle: "shoulders",
    equipment: "Dumbbells",
    description: "Raise dumbbells to the sides to shoulder height. Targets side delts.",
    type: 'strength'
  },
  {
    id: "shoulders_3",
    name: "Face Pulls",
    muscle: "shoulders",
    equipment: "Cable",
    description: "Pull rope towards face to target rear delts and rotator cuff.",
    type: 'strength'
  },

  // --- ARMS (Bras) ---
  {
    id: "arms_1",
    name: "Barbell Bicep Curl",
    muscle: "arms",
    equipment: "Barbell",
    description: "Curl the bar towards chest keeping elbows locked at sides.",
    type: 'strength'
  },
  {
    id: "arms_2",
    name: "Tricep Dips",
    muscle: "arms",
    equipment: "Bodyweight",
    description: "Lower body by bending elbows on parallel bars.",
    type: 'strength'
  },
  {
    id: "arms_3",
    name: "Tricep Rope Pushdown",
    muscle: "arms",
    equipment: "Cable",
    description: "Push rope down extending elbows to target triceps.",
    type: 'strength'
  },
  {
    id: "arms_4",
    name: "Hammer Curl",
    muscle: "arms",
    equipment: "Dumbbells",
    description: "Curl dumbbells with neutral grip (palms facing each other).",
    type: 'strength'
  },

  // --- ABS (Abdominaux) ---
  {
    id: "abs_1",
    name: "Plank",
    muscle: "abs",
    equipment: "Bodyweight",
    description: "Hold push-up position on elbows. Core stability.",
    type: 'duration'
  },
  {
    id: "abs_2",
    name: "Hanging Leg Raise",
    muscle: "abs",
    equipment: "Bar",
    description: "Hang from bar and raise legs to horizontal or higher.",
    type: 'strength'
  },
  {
    id: "abs_3",
    name: "Cable Crunch",
    muscle: "abs",
    equipment: "Cable",
    description: "Kneel and crunch downwards holding a rope attachment.",
    type: 'strength'
  }
];

export const getUniqueMuscles = () => {
  const muscles = LOCAL_EXERCISES.map(e => e.muscle);
  return [...new Set(muscles)];
};

export const getExercisesByMuscle = (muscle: string) => {
  return LOCAL_EXERCISES.filter(e => e.muscle === muscle);
};