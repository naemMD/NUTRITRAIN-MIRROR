export type ExerciseType = 'strength' | 'duration';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseData {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  description: string;
  type: ExerciseType;
  difficulty: ExerciseDifficulty;
  body_zones: string[]; // zones stressed by this exercise — used for injury filtering
  videoUrl?: string; // Optional override URL — if omitted, auto-searches YouTube by exercise name
}

export const LOCAL_EXERCISES: ExerciseData[] = [
  // ═══════════════════════════════════════════════════════════════
  // CHEST (Pectoraux)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "chest_1",
    name: "Barbell Bench Press",
    muscle: "chest",
    equipment: "Barbell",
    description: "Lying on a bench, press the bar up from chest level. The king of chest exercises.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['chest', 'right_shoulder', 'left_shoulder', 'right_tricep', 'left_tricep'],
    videoUrl: 'https://www.youtube.com/watch?v=BkC7bIGqgjs',
  },
  {
    id: "chest_2",
    name: "Incline Dumbbell Press",
    muscle: "chest",
    equipment: "Dumbbells",
    description: "Press dumbbells up on an inclined bench to target upper chest.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['chest', 'right_shoulder', 'left_shoulder'],
    videoUrl: 'https://www.youtube.com/watch?v=sh5ZsRpEZCw',
  },
  {
    id: "chest_3",
    name: "Push-Ups",
    muscle: "chest",
    equipment: "Bodyweight",
    description: "Classic bodyweight movement. Keep body straight and lower chest to floor.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['chest', 'right_shoulder', 'left_shoulder', 'right_tricep', 'left_tricep', 'right_wrist', 'left_wrist'],
    videoUrl: 'https://www.youtube.com/watch?v=CnpU47x-W9Y',
  },
  {
    id: "chest_4",
    name: "Cable Fly",
    muscle: "chest",
    equipment: "Cable",
    description: "Stand between pulleys and pull handles together in front of chest.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['chest', 'right_shoulder', 'left_shoulder'],
    videoUrl: 'https://www.youtube.com/watch?v=ETtXO4FW1EU',
  },
  {
    id: "chest_5",
    name: "Dumbbell Fly",
    muscle: "chest",
    equipment: "Dumbbells",
    description: "Lying on a bench, open arms wide then bring dumbbells together above chest.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['chest', 'right_shoulder', 'left_shoulder'],
    videoUrl: 'https://www.youtube.com/watch?v=LzFvciCdoW0',
  },

  // ═══════════════════════════════════════════════════════════════
  // BACK (Dos)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "back_1",
    name: "Deadlift",
    muscle: "back",
    equipment: "Barbell",
    description: "Lift heavy weight from the floor. Targets entire posterior chain.",
    type: 'strength',
    difficulty: 'advanced',
    body_zones: ['lower_back', 'upper_back', 'right_thigh', 'left_thigh', 'right_hip', 'left_hip', 'right_forearm', 'left_forearm'],
    videoUrl: 'https://www.youtube.com/watch?v=ZaTM37cfiDs',
  },
  {
    id: "back_2",
    name: "Pull-Ups",
    muscle: "back",
    equipment: "Bodyweight",
    description: "Hang from bar and pull chin over bar. Builds back width.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['upper_back', 'right_shoulder', 'left_shoulder', 'right_bicep', 'left_bicep'],
    videoUrl: 'https://www.youtube.com/watch?v=aNUSgyWRJYA',
  },
  {
    id: "back_3",
    name: "Bent Over Barbell Row",
    muscle: "back",
    equipment: "Barbell",
    description: "Bend at hips and pull barbell to lower chest/abs.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['upper_back', 'lower_back', 'right_bicep', 'left_bicep'],
    videoUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
  },
  {
    id: "back_4",
    name: "Lat Pulldown",
    muscle: "back",
    equipment: "Machine",
    description: "Seated machine pull-down, excellent alternative to pull-ups.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['upper_back', 'right_bicep', 'left_bicep'],
    videoUrl: 'https://www.youtube.com/watch?v=fK6Drg0suic',
  },
  {
    id: "back_5",
    name: "Seated Cable Row",
    muscle: "back",
    equipment: "Cable",
    description: "Sit and pull cable handle towards your torso. Targets mid-back thickness.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['upper_back', 'right_bicep', 'left_bicep'],
    videoUrl: 'https://www.youtube.com/watch?v=vwHG9Jfu4sw',
  },
  {
    id: "back_6",
    name: "T-Bar Row",
    muscle: "back",
    equipment: "Barbell",
    description: "Row a loaded barbell anchored at one end. Great for back thickness.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['upper_back', 'lower_back', 'right_bicep', 'left_bicep'],
    videoUrl: 'https://www.youtube.com/watch?v=rvbjGSQ2tVE',
  },

  // ═══════════════════════════════════════════════════════════════
  // LEGS (Jambes — Quadriceps & compound)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "legs_1",
    name: "Barbell Squat",
    muscle: "legs",
    equipment: "Barbell",
    description: "Squat down with bar on back. The most important leg exercise.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['right_thigh', 'left_thigh', 'right_hip', 'left_hip', 'right_knee', 'left_knee', 'lower_back'],
    videoUrl: 'https://www.youtube.com/watch?v=f-KL4VNN96E',
  },
  {
    id: "legs_2",
    name: "Leg Press",
    muscle: "legs",
    equipment: "Machine",
    description: "Push weight away with legs on a 45-degree machine.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_thigh', 'left_thigh', 'right_knee', 'left_knee'],
    videoUrl: 'https://www.youtube.com/watch?v=SYsrvCPiJ_I',
  },
  {
    id: "legs_3",
    name: "Walking Lunges",
    muscle: "legs",
    equipment: "Dumbbells",
    description: "Step forward and lower hips, alternating legs.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_thigh', 'left_thigh', 'right_knee', 'left_knee', 'right_hip', 'left_hip'],
    videoUrl: 'https://www.youtube.com/watch?v=Pbmj6xPo-Hw',
  },
  {
    id: "legs_4",
    name: "Leg Extension",
    muscle: "legs",
    equipment: "Machine",
    description: "Isolate the quadriceps by extending knees against resistance.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_thigh', 'left_thigh', 'right_knee', 'left_knee'],
    videoUrl: 'https://www.youtube.com/watch?v=xd9m2S_Rw4s',
  },
  {
    id: "legs_5",
    name: "Romanian Deadlift",
    muscle: "legs",
    equipment: "Barbell",
    description: "Hinge at hips with slight knee bend to target hamstrings and glutes.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['right_thigh', 'left_thigh', 'right_hip', 'left_hip', 'lower_back'],
    videoUrl: 'https://www.youtube.com/watch?v=n9bLHqrlvnM',
  },
  {
    id: "legs_6",
    name: "Leg Curl",
    muscle: "legs",
    equipment: "Machine",
    description: "Curl weight behind knees to isolate hamstrings.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_thigh', 'left_thigh', 'right_knee', 'left_knee'],
    videoUrl: 'https://www.youtube.com/watch?v=HLwdesktz60',
  },
  {
    id: "legs_7",
    name: "Bulgarian Split Squat",
    muscle: "legs",
    equipment: "Dumbbells",
    description: "Single-leg squat with rear foot elevated on a bench.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['right_thigh', 'left_thigh', 'right_knee', 'left_knee', 'right_hip', 'left_hip'],
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
  },

  // ═══════════════════════════════════════════════════════════════
  // GLUTES (Fessiers)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "glutes_1",
    name: "Barbell Hip Thrust",
    muscle: "glutes",
    equipment: "Barbell",
    description: "Sit against bench, roll bar over hips, drive hips up. #1 glute builder.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['right_hip', 'left_hip', 'lower_back'],
    videoUrl: 'https://www.youtube.com/watch?v=pBH7pKHn-dI',
  },
  {
    id: "glutes_2",
    name: "Glute Bridge",
    muscle: "glutes",
    equipment: "Bodyweight",
    description: "Lie on back with knees bent and push hips up. Great glute activation.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_hip', 'left_hip', 'lower_back'],
    videoUrl: 'https://www.youtube.com/watch?v=cg9CoF2A2vU',
  },
  {
    id: "glutes_3",
    name: "Cable Kickback",
    muscle: "glutes",
    equipment: "Cable",
    description: "Attach ankle strap and kick leg straight back against cable resistance.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_hip', 'left_hip'],
    videoUrl: 'https://www.youtube.com/watch?v=5jJNfIlKTmg',
  },

  // ═══════════════════════════════════════════════════════════════
  // SHOULDERS (Épaules)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "shoulders_1",
    name: "Overhead Press (Military)",
    muscle: "shoulders",
    equipment: "Barbell",
    description: "Press barbell from shoulders to overhead while standing.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['right_shoulder', 'left_shoulder', 'right_tricep', 'left_tricep'],
    videoUrl: 'https://www.youtube.com/watch?v=KP1sYz2VICk',
  },
  {
    id: "shoulders_2",
    name: "Dumbbell Lateral Raise",
    muscle: "shoulders",
    equipment: "Dumbbells",
    description: "Raise dumbbells to the sides to shoulder height. Targets side delts.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_shoulder', 'left_shoulder'],
    videoUrl: 'https://www.youtube.com/watch?v=PzsMitRdI_8',
  },
  {
    id: "shoulders_3",
    name: "Face Pulls",
    muscle: "shoulders",
    equipment: "Cable",
    description: "Pull rope towards face to target rear delts and rotator cuff.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_shoulder', 'left_shoulder', 'right_trapezius', 'left_trapezius'],
    videoUrl: 'https://www.youtube.com/watch?v=0Po47vvj9g4',
  },
  {
    id: "shoulders_4",
    name: "Arnold Press",
    muscle: "shoulders",
    equipment: "Dumbbells",
    description: "Start with palms facing you, rotate and press overhead. Hits all delt heads.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['right_shoulder', 'left_shoulder', 'right_tricep', 'left_tricep'],
    videoUrl: 'https://www.youtube.com/watch?v=3fQaRVS3Azc',
  },
  {
    id: "shoulders_5",
    name: "Reverse Dumbbell Fly",
    muscle: "shoulders",
    equipment: "Dumbbells",
    description: "Bent over, raise dumbbells outward to target rear delts.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_shoulder', 'left_shoulder', 'upper_back'],
    videoUrl: 'https://www.youtube.com/watch?v=buuYPLVXsJg',
  },

  // ═══════════════════════════════════════════════════════════════
  // TRAPEZIUS (Trapèzes)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "traps_1",
    name: "Barbell Shrugs",
    muscle: "trapezius",
    equipment: "Barbell",
    description: "Hold barbell at hip level and shrug shoulders up towards ears.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_trapezius', 'left_trapezius', 'neck'],
    videoUrl: 'https://www.youtube.com/watch?v=ZtBuouRLoDY',
  },
  {
    id: "traps_2",
    name: "Dumbbell Shrugs",
    muscle: "trapezius",
    equipment: "Dumbbells",
    description: "Hold dumbbells at sides and shrug shoulders up. Builds upper traps.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_trapezius', 'left_trapezius', 'neck'],
    videoUrl: 'https://www.youtube.com/watch?v=qvvJUKq7_sU',
  },
  {
    id: "traps_3",
    name: "Farmer's Walk",
    muscle: "trapezius",
    equipment: "Dumbbells",
    description: "Hold heavy dumbbells and walk. Builds traps, grip, and core stability.",
    type: 'duration',
    difficulty: 'beginner',
    body_zones: ['right_trapezius', 'left_trapezius', 'right_forearm', 'left_forearm'],
    videoUrl: 'https://www.youtube.com/watch?v=Fkzk_RqlYig',
  },

  // ═══════════════════════════════════════════════════════════════
  // ARMS (Bras — Biceps & Triceps)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "arms_1",
    name: "Barbell Bicep Curl",
    muscle: "arms",
    equipment: "Barbell",
    description: "Curl the bar towards chest keeping elbows locked at sides.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_bicep', 'left_bicep', 'right_forearm', 'left_forearm'],
    videoUrl: 'https://www.youtube.com/watch?v=JJB8XgKltA8',
  },
  {
    id: "arms_2",
    name: "Tricep Dips",
    muscle: "arms",
    equipment: "Bodyweight",
    description: "Lower body by bending elbows on parallel bars.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['right_tricep', 'left_tricep', 'right_shoulder', 'left_shoulder', 'chest'],
    videoUrl: 'https://www.youtube.com/watch?v=Toa3QLz5I54',
  },
  {
    id: "arms_3",
    name: "Tricep Rope Pushdown",
    muscle: "arms",
    equipment: "Cable",
    description: "Push rope down extending elbows to target triceps.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_tricep', 'left_tricep'],
    videoUrl: 'https://www.youtube.com/watch?v=-KVa3M1uZfs',
  },
  {
    id: "arms_4",
    name: "Hammer Curl",
    muscle: "arms",
    equipment: "Dumbbells",
    description: "Curl dumbbells with neutral grip (palms facing each other).",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_bicep', 'left_bicep', 'right_forearm', 'left_forearm'],
    videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
  },
  {
    id: "arms_5",
    name: "Concentration Curl",
    muscle: "arms",
    equipment: "Dumbbells",
    description: "Sit and curl a dumbbell with elbow braced on inner thigh. Peak contraction.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_bicep', 'left_bicep'],
    videoUrl: 'https://www.youtube.com/watch?v=gPRZchwuVcA',
  },
  {
    id: "arms_6",
    name: "Overhead Tricep Extension",
    muscle: "arms",
    equipment: "Dumbbells",
    description: "Hold dumbbell overhead with both hands, lower behind head, extend up.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_tricep', 'left_tricep', 'right_elbow', 'left_elbow'],
    videoUrl: 'https://www.youtube.com/watch?v=W6h3t9mkRrY',
  },

  // ═══════════════════════════════════════════════════════════════
  // ABS (Abdominaux)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "abs_1",
    name: "Plank",
    muscle: "abs",
    equipment: "Bodyweight",
    description: "Hold push-up position on elbows. Core stability.",
    type: 'duration',
    difficulty: 'beginner',
    body_zones: ['abs', 'lower_back'],
    videoUrl: 'https://www.youtube.com/watch?v=fH38PJuNYOU',
  },
  {
    id: "abs_2",
    name: "Hanging Leg Raise",
    muscle: "abs",
    equipment: "Bar",
    description: "Hang from bar and raise legs to horizontal or higher.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['abs', 'right_hip', 'left_hip'],
    videoUrl: 'https://www.youtube.com/watch?v=7xqlO7G-PHQ',
  },
  {
    id: "abs_3",
    name: "Cable Crunch",
    muscle: "abs",
    equipment: "Cable",
    description: "Kneel and crunch downwards holding a rope attachment.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['abs'],
    videoUrl: 'https://www.youtube.com/watch?v=AV5PmZJIrrw',
  },
  {
    id: "abs_4",
    name: "Mountain Climbers",
    muscle: "abs",
    equipment: "Bodyweight",
    description: "In plank position, drive knees to chest alternately at a fast pace.",
    type: 'duration',
    difficulty: 'beginner',
    body_zones: ['abs', 'right_hip', 'left_hip', 'right_shoulder', 'left_shoulder'],
    videoUrl: 'https://www.youtube.com/watch?v=ixxk9Qfn61o',
  },
  {
    id: "abs_5",
    name: "Russian Twist",
    muscle: "abs",
    equipment: "Bodyweight",
    description: "Sit with feet elevated, twist torso side to side. Targets obliques.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['abs', 'lower_back'],
    videoUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
  },

  // ═══════════════════════════════════════════════════════════════
  // CALVES (Mollets)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "calves_1",
    name: "Standing Calf Raise",
    muscle: "calves",
    equipment: "Machine",
    description: "Stand on platform and push up onto toes against resistance.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_calf', 'left_calf', 'right_ankle', 'left_ankle'],
    videoUrl: 'https://www.youtube.com/watch?v=qmihweq30nA',
  },
  {
    id: "calves_2",
    name: "Seated Calf Raise",
    muscle: "calves",
    equipment: "Machine",
    description: "Sit with pad on knees and push up onto toes. Targets soleus.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_calf', 'left_calf', 'right_ankle', 'left_ankle'],
    videoUrl: 'https://www.youtube.com/watch?v=hWO8AbhWEUI',
  },
  {
    id: "calves_3",
    name: "Bodyweight Calf Raise",
    muscle: "calves",
    equipment: "Bodyweight",
    description: "Stand on edge of a step and raise heels. Simple and effective.",
    type: 'strength',
    difficulty: 'beginner',
    body_zones: ['right_calf', 'left_calf', 'right_ankle', 'left_ankle'],
    videoUrl: 'https://www.youtube.com/watch?v=Wh8EXjjr6JU',
  },

  // ═══════════════════════════════════════════════════════════════
  // CARDIO
  // ═══════════════════════════════════════════════════════════════
  {
    id: "cardio_1",
    name: "Treadmill Running",
    muscle: "cardio",
    equipment: "Machine",
    description: "Run on treadmill at steady or interval pace. Great for endurance.",
    type: 'duration',
    difficulty: 'beginner',
    body_zones: ['right_knee', 'left_knee', 'right_ankle', 'left_ankle', 'right_calf', 'left_calf', 'right_thigh', 'left_thigh'],
  },
  {
    id: "cardio_2",
    name: "Jump Rope",
    muscle: "cardio",
    equipment: "Bodyweight",
    description: "Skip rope at a fast pace. Burns calories and improves coordination.",
    type: 'duration',
    difficulty: 'beginner',
    body_zones: ['right_calf', 'left_calf', 'right_ankle', 'left_ankle', 'right_wrist', 'left_wrist', 'right_shoulder', 'left_shoulder'],
  },
  {
    id: "cardio_3",
    name: "Stationary Bike",
    muscle: "cardio",
    equipment: "Machine",
    description: "Cycle on a stationary bike. Low impact, great for knees.",
    type: 'duration',
    difficulty: 'beginner',
    body_zones: ['right_thigh', 'left_thigh', 'right_knee', 'left_knee'],
  },
  {
    id: "cardio_4",
    name: "Rowing Machine",
    muscle: "cardio",
    equipment: "Machine",
    description: "Full body cardio on the rowing machine. Engages back, legs, and arms.",
    type: 'duration',
    difficulty: 'intermediate',
    body_zones: ['upper_back', 'right_shoulder', 'left_shoulder', 'right_thigh', 'left_thigh', 'right_bicep', 'left_bicep'],
  },
  {
    id: "cardio_5",
    name: "Burpees",
    muscle: "cardio",
    equipment: "Bodyweight",
    description: "Full body explosive movement: squat, jump back, push-up, jump up.",
    type: 'strength',
    difficulty: 'intermediate',
    body_zones: ['chest', 'right_shoulder', 'left_shoulder', 'right_thigh', 'left_thigh', 'abs', 'right_wrist', 'left_wrist'],
  },
];

export const getUniqueMuscles = () => {
  const muscles = LOCAL_EXERCISES.map(e => e.muscle);
  return [...new Set(muscles)];
};

export const getExercisesByMuscle = (muscle: string) => {
  return LOCAL_EXERCISES.filter(e => e.muscle === muscle);
};

/**
 * Filter out exercises that stress any of the given injured body zones.
 */
export const getSafeExercises = (injuredZones: string[]) => {
  if (injuredZones.length === 0) return LOCAL_EXERCISES;
  return LOCAL_EXERCISES.filter(
    (ex) => !ex.body_zones.some((zone) => injuredZones.includes(zone))
  );
};

/**
 * Get exercises filtered by difficulty level and optionally by muscle.
 */
export const getExercisesByDifficulty = (maxDifficulty: ExerciseDifficulty, muscle?: string) => {
  const levels: ExerciseDifficulty[] = ['beginner', 'intermediate', 'advanced'];
  const maxIdx = levels.indexOf(maxDifficulty);
  let filtered = LOCAL_EXERCISES.filter((ex) => levels.indexOf(ex.difficulty) <= maxIdx);
  if (muscle) filtered = filtered.filter((ex) => ex.muscle === muscle);
  return filtered;
};
