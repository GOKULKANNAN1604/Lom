// src/pages/pillars/Performance.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { usePerformanceLogs, useDeletePerformanceLog, useStreaks } from '../../hooks/usePillarData';
import LogForm from '../../components/dashboard/LogForm';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, PointElement, LineElement, Title, Filler
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);


const WORKOUT_ROUTINES = {
  bulking: {
    title: 'Hypertrophy Mass Builder (Bulking)',
    description: 'Designed for maximal progressive overload and muscle hypertrophy. Focus on lifting heavy with proper form, pushing close to failure, and recovering with a caloric surplus.',
    banner: '/bulking_workout.png',
    accentColor: 'perf', // orange/red
    borderCls: 'border-orange-500/20 hover:border-orange-500/40',
    glowCls: 'shadow-glow-perf',
    days: [
      {
        day: 'Monday',
        focus: 'Chest & Triceps (Push A)',
        duration: 75,
        calories: 500,
        activityType: 'GYM',
        exercises: [
          { name: 'Flat Barbell Bench Press', sets: 4, reps: '6-8', rest: '3 mins', guide: 'Grip slightly wider than shoulders. Lower bar slowly to mid-chest keeping elbows at 45°. Drive up powerfully keeping feet flat on the floor.' },
          { name: 'Incline Dumbbell Press', sets: 4, reps: '8-10', rest: '2 mins', guide: 'Set bench to 30-45°. Hold dumbbells at chest, press upwards until arms are extended. Lower slowly to outer chest for deep stretch.' },
          { name: 'Cable Crossovers (Lower Chest)', sets: 3, reps: '10-12', rest: '90s', guide: 'Lean slightly forward. Bring hands together in a wide arc in front of lower chest, squeezing pectorals at the peak contraction.' },
          { name: 'Overhead Dumbbell Tricep Extension', sets: 4, reps: '8-10', rest: '90s', guide: 'Hold dumbbell with both hands overhead. Lower slowly behind head by bending elbows. Keep upper arms vertical and close to ears.' },
          { name: 'Tricep Rope Pushdowns', sets: 3, reps: '10-12', rest: '90s', guide: 'Keep elbows tucked to ribs. Push rope down, flaring the ends outward at the bottom for full contraction. Return slowly.' }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Back & Biceps (Pull A)',
        duration: 80,
        calories: 520,
        activityType: 'GYM',
        exercises: [
          { name: 'Conventional Deadlift', sets: 3, reps: '5', rest: '3 mins', guide: 'Stand with mid-foot under bar. Bend over, grip bar, drop hips slightly. Pull chest up, drive through legs and stand tall. Lock out at hips.' },
          { name: 'Barbell Rows (Overhand)', sets: 4, reps: '6-8', rest: '2 mins', guide: 'Hinge at hips, back flat. Grip bar overhand, pull towards lower belly button. Squeeze shoulder blades together at top.' },
          { name: 'Lat Pulldowns (Wide Grip)', sets: 3, reps: '8-10', rest: '90s', guide: 'Sit and secure thighs. Grip bar wide, pull down to upper chest, leading with elbows. Return slowly to full stretch.' },
          { name: 'Incline Dumbbell Curls', sets: 4, reps: '8-10', rest: '90s', guide: 'Sit on incline bench. Let arms hang, curl dumbbells up keeping elbows stationary. Squeeze biceps at the top.' },
          { name: 'Hammer Curls', sets: 3, reps: '10-12', rest: '90s', guide: 'Stand tall. Hold dumbbells with palms facing each other. Curl dumbbells up without swinging your elbows or torso.' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Legs (Squat Focus)',
        duration: 90,
        calories: 600,
        activityType: 'GYM',
        exercises: [
          { name: 'Barbell Back Squats', sets: 4, reps: '6-8', rest: '3 mins', guide: 'Bar on traps. Step back, feet shoulder-width. Lower hips below knees while keeping back straight. Drive up through heels.' },
          { name: 'Romanian Deadlifts (RDLs)', sets: 4, reps: '8-10', rest: '2 mins', guide: 'Stand tall, soft knees. Slide barbell down thighs, hinging hips back until a deep stretch in hamstrings. Drive hips forward.' },
          { name: 'Leg Press', sets: 3, reps: '10-12', rest: '2 mins', guide: 'Place feet shoulder-width on platform. Lower platform slowly until knees are at 90°. Push back up, avoiding locking knees.' },
          { name: 'Standing Calf Raises', sets: 4, reps: '12-15', rest: '60s', guide: 'Stand on edge of step. Lower heels fully for stretch, then push up high onto toes, squeezing calves at top.' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Active Recovery & Stretching',
        duration: 40,
        calories: 200,
        activityType: 'YOGA',
        isRest: true,
        exercises: [
          { name: 'Full Body Mobility Routine', sets: 1, reps: '20 mins', rest: 'N/A', guide: 'Perform neck circles, arm swings, cat-cow, downward dog, child pose, and deep lunges to improve range of motion.' },
          { name: 'Hamstring & Glute Stretches', sets: 3, reps: '30s hold', rest: '30s', guide: 'Hold seated forward fold and pigeon pose on both sides. Breathe deeply and sink deeper into the stretches.' },
          { name: 'Light Walk', sets: 1, reps: '15 mins', rest: 'N/A', guide: 'Low intensity walking to promote blood flow and reduce soreness without adding nervous system fatigue.' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Shoulders & Arms',
        duration: 75,
        calories: 480,
        activityType: 'GYM',
        exercises: [
          { name: 'Overhead Barbell Press (OHP)', sets: 4, reps: '6-8', rest: '2.5 mins', guide: 'Barbell at collarbone. Brace core, squeeze glutes. Press bar straight up overhead, moving head back then forward.' },
          { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', rest: '60s', guide: 'Lean slightly forward. Raise dumbbells out to sides with pinkies up, keeping elbows slightly bent. Control the descent.' },
          { name: 'Cable Face Pulls', sets: 3, reps: '12-15', rest: '60s', guide: 'Attach rope to high pulley. Pull rope towards nose, separating your hands and squeezing rear delts and upper back.' },
          { name: 'Barbell Bicep Curls', sets: 3, reps: '8-10', rest: '90s', guide: 'Stand tall. Grip bar shoulder-width, curl bar towards shoulders. Keep elbows locked at sides. Lower slowly.' },
          { name: 'Weighted Bench Dips', sets: 3, reps: '8-10', rest: '90s', guide: 'Place hands on bench, feet on opposing bench. Place weight plate on lap. Lower hips slowly, push up using triceps.' }
        ]
      },
      {
        day: 'Saturday',
        focus: 'Legs & Core',
        duration: 70,
        calories: 450,
        activityType: 'GYM',
        exercises: [
          { name: 'Bulgarian Split Squats', sets: 3, reps: '8-10 / leg', rest: '90s', guide: 'Rest rear foot on bench. Drop rear knee close to floor, keeping front knee behind toes. Drive up through front heel.' },
          { name: 'Lying Leg Curls', sets: 3, reps: '12', rest: '60s', guide: 'Lie on machine, pad on ankles. Curl heels to glutes, squeeze hamstrings. Control weight back to starting position.' },
          { name: 'Hanging Leg Raises', sets: 3, reps: '12-15', rest: '60s', guide: 'Hang from bar. Keep legs straight or bend knees, raise legs up past parallel using lower abs. Lower slowly.' },
          { name: 'Planks', sets: 3, reps: '60s hold', rest: '60s', guide: 'Keep body in straight line, forearms on floor, shoulders stacked. Engage core, glutes, and quadriceps. Do not sag hips.' }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Active Rest & Mobility',
        duration: 30,
        calories: 150,
        activityType: 'REST',
        isRest: true,
        exercises: [
          { name: 'Deep Breathing & Foam Rolling', sets: 1, reps: '15 mins', rest: 'N/A', guide: 'Roll out quads, hamstrings, back, and lats to break up muscle tightness and increase range of motion.' },
          { name: 'Static Stretching', sets: 1, reps: '15 mins', rest: 'N/A', guide: 'Focus on chest, shoulder, and hip opener stretches. Hold each stretch for 30-45 seconds without bouncing.' }
        ]
      }
    ]
  },
  cutting: {
    title: 'Fat Loss Conditioning (Cutting)',
    description: 'Designed to maximize caloric expenditure, elevate your heart rate, and preserve muscle mass. High intensity, short rest times, and supersets are emphasized.',
    banner: '/cutting_workout.png',
    accentColor: 'rose', // pink/rose
    borderCls: 'border-rose-500/20 hover:border-rose-500/40',
    glowCls: 'shadow-glow-rose',
    days: [
      {
        day: 'Monday',
        focus: 'Chest & Back (Supersets)',
        duration: 65,
        calories: 550,
        activityType: 'GYM',
        exercises: [
          { name: 'A1. Incline Dumbbell Press', sets: 4, reps: '12', rest: '0s', guide: 'Press dumbbells up from 30° incline. Lower under control. Immediately move to exercise A2.' },
          { name: 'A2. Bent-over Dumbbell Rows', sets: 4, reps: '12', rest: '90s', guide: 'Pull dumbbells to lower ribs. Keep back flat. Rest 90 seconds after completing this superset.' },
          { name: 'B1. Flat Dumbbell Flyes', sets: 3, reps: '15', rest: '0s', guide: 'Lie flat. Open arms in a wide arc, stretch chest. Bring weights back together. Move immediately to B2.' },
          { name: 'B2. Wide-Grip Lat Pulldowns', sets: 3, reps: '12-15', rest: '90s', guide: 'Pull bar to collarbone, lead with elbows. Control return. Rest 90 seconds after completing this superset.' },
          { name: 'Treadmill HIIT Cardio', sets: 1, reps: '15 mins', rest: 'N/A', guide: 'Alternate 30s sprinting with 60s walking. Keep effort levels maximal during sprints.' }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Legs & Abs (High Volume)',
        duration: 70,
        calories: 580,
        activityType: 'GYM',
        exercises: [
          { name: 'Dumbbell Goblet Squats', sets: 4, reps: '12-15', rest: '60s', guide: 'Hold dumbbell close to chest. Squat deep keeping chest high. Drive up dynamically through heels.' },
          { name: 'Dumbbell Romanian Deadlifts', sets: 4, reps: '12', rest: '60s', guide: 'Hinge hips back, slide weights down shins. Squeeze hamstrings and glutes to stand tall.' },
          { name: 'Walking Lunges', sets: 3, reps: '20 steps', rest: '60s', guide: 'Step forward, drop back knee to hover over floor. Push forward into next step. Alternating legs.' },
          { name: 'Weighted Russian Twists', sets: 3, reps: '20 / side', rest: '45s', guide: 'Sit with feet elevated. Twist torso side to side, touching dumbbell to floor on each turn.' },
          { name: 'Hanging Knees-to-Chest', sets: 3, reps: '15', rest: '45s', guide: 'Hang from pull-up bar. Drive knees up towards chest using lower abs. Lower back down slowly.' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Arms & Shoulders (Conditioning)',
        duration: 60,
        calories: 480,
        activityType: 'GYM',
        exercises: [
          { name: 'A1. Dumbbell Shoulder Press', sets: 4, reps: '12', rest: '60s', guide: 'Press dumbbells overhead from seated or standing. Keep core braced. Lower dumbbells to ear level.' },
          { name: 'B1. Dumbbell Lateral Raises', sets: 4, reps: '15', rest: '0s', guide: 'Raise dumbbells to sides, pinkies slightly raised. Move immediately to B2.' },
          { name: 'B2. Dumbbell Rear Delt Flyes', sets: 4, reps: '15', rest: '60s', guide: 'Bend over, back flat. Fly dumbbells out to sides, engaging rear shoulders. Rest 60s after B2.' },
          { name: 'C1. Dumbbell Bicep Curls', sets: 3, reps: '12', rest: '0s', guide: 'Curl dumbbells simultaneously. Move immediately to C2.' },
          { name: 'C2. Cable Tricep Pushdowns', sets: 3, reps: '15', rest: '60s', guide: 'Push bar down, contracting triceps at bottom. Control return. Rest 60s after C2.' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Active Rest (Cardio Focus)',
        duration: 45,
        calories: 350,
        activityType: 'CARDIO',
        isRest: true,
        exercises: [
          { name: 'Low-Intensity Steady State Cardio (LISS)', sets: 1, reps: '45 mins', rest: 'N/A', guide: 'Perform low-intensity exercise (incline treadmill walk, cycling, or elliptical) keeping heart rate in Zone 2.' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Full Body Conditioning',
        duration: 60,
        calories: 560,
        activityType: 'GYM',
        exercises: [
          { name: 'Kettlebell/Dumbbell Swings', sets: 4, reps: '20', rest: '60s', guide: 'Hinge at hips, swing weight back, then thrust hips forward to snap weight up to shoulder height.' },
          { name: 'Push-ups', sets: 4, reps: 'Max reps', rest: '60s', guide: 'Keep body in straight line. Lower chest to floor, push back up dynamically. Maintain tight core.' },
          { name: 'Pull-ups / Lat Pulldowns', sets: 4, reps: '10-12', rest: '60s', guide: 'Pull yourself up to bar or pull pulldown bar down to collarbone. Engage lats fully. Control descent.' },
          { name: 'Dumbbell Thrusters', sets: 3, reps: '12', rest: '90s', guide: 'Hold dumbbells at shoulders, squat down, and as you drive up, press dumbbells overhead in one motion.' }
        ]
      },
      {
        day: 'Saturday',
        focus: 'Legs & Core (High Intensity)',
        duration: 65,
        calories: 520,
        activityType: 'GYM',
        exercises: [
          { name: 'Leg Press (Wide Stance)', sets: 3, reps: '15', rest: '60s', guide: 'Place feet wide and high on platform. Lower slowly. Press up keeping tension on glutes/hamstrings.' },
          { name: 'A1. Leg Extensions', sets: 3, reps: '15', rest: '0s', guide: 'Extend legs to lock out, squeeze quads. Move immediately to A2.' },
          { name: 'A2. Lying Leg Curls', sets: 3, reps: '15', rest: '60s', guide: 'Curl heels to glutes, squeeze hamstrings. Rest 60 seconds after completing this superset.' },
          { name: 'Cable Crunches', sets: 4, reps: '20', rest: '45s', guide: 'Kneel in front of cable pulley. Pull rope down to head, crunch torso downwards, squeezing abs.' }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Rest & Recover',
        duration: 30,
        calories: 120,
        activityType: 'REST',
        isRest: true,
        exercises: [
          { name: 'Foam Rolling & Full Body Stretch', sets: 1, reps: '30 mins', rest: 'N/A', guide: 'Focus on foam rolling sore muscles and performing slow static stretches. Focus on deep breathing.' }
        ]
      }
    ]
  }
};

const EXERCISE_GUIDES_DB = {
  'Flat Barbell Bench Press': {
    primary: 'Chest (Lower/Mid Pectoralis Major)',
    secondary: 'Triceps, Anterior Deltoids',
    setup: 'Lie flat on the bench. Grip the bar slightly wider than shoulder-width. Plant your feet firmly on the ground and pull your shoulder blades back together to create a solid base.',
    execution: 'Unrack the bar and bring it directly above your chest. Lower the barbell slowly to your mid-chest (nipple line) while keeping your elbows tucked at roughly 45 degrees. Drive the bar back up powerfully by pressing through your feet and contracting your chest.',
    breathing: 'Inhale on the descent (eccentric) and exhale powerfully on the press up (concentric).',
    mistakes: [
      'Flaring the elbows out at 90 degrees, which places excessive strain on the rotator cuffs.',
      'Bouncing the bar off the sternum/chest to gain momentum.',
      'Lifting the hips off the bench during heavy press attempts.'
    ]
  },
  'Incline Dumbbell Press': {
    primary: 'Upper Chest (Clavicular Head of Pectoralis)',
    secondary: 'Anterior Deltoids, Triceps',
    setup: 'Set an incline bench to 30-45 degrees. Sit with a dumbbell in each hand resting on your thighs. Kick the weights up to your shoulders as you lie back.',
    execution: 'Press the dumbbells straight up until your arms are extended. Lower them slowly to the sides of your upper chest, focusing on a deep stretch in the upper pectorals. Keep your wrists stacked directly over your elbows.',
    breathing: 'Inhale as you lower the weights; exhale as you push them upwards.',
    mistakes: [
      'Setting the bench angle too steep (>45°), which shifts the load heavily to the shoulders.',
      'Letting the dumbbells drift outwards, loading the shoulder joints unsafely.',
      'Shortening the range of motion by stopping well short of a full stretch.'
    ]
  },
  'Conventional Deadlift': {
    primary: 'Posterior Chain (Hamstrings, Gluteus Maximus, Erector Spinae)',
    secondary: 'Lats, Trapezius, Core, Forearms',
    setup: 'Stand with feet hip-width apart, mid-foot directly under the bar. Bend at the hips and knees to grip the bar with a shoulder-width overhand or mixed grip. Flatten your spine and engage your lats.',
    execution: 'Brace your core, push through your heels, and drive your hips forward to lift the barbell. Keep the bar close to your shins. Lock out fully by extending your hips and knees, standing tall without hyperextending your lower back.',
    breathing: 'Take a deep breath and brace at the bottom; exhale as you reach lockout at the top.',
    mistakes: [
      'Rounding the lower back (spine flexion), which can lead to spinal injury.',
      'Allowing the barbell to drift away from the body during the lift.',
      'Jerking the bar off the floor instead of pulling with progressive tension.'
    ]
  },
  'Barbell Back Squats': {
    primary: 'Quadriceps, Gluteus Maximus',
    secondary: 'Hamstrings, Adductors, Calves, Core',
    setup: 'Set the barbell on a rack at mid-chest height. Step under it, positioning the bar on your upper traps. Grip the bar firmly, step back, and stand with feet shoulder-width apart, toes pointed slightly outwards.',
    execution: 'Brace your core, push your hips back, and bend your knees to lower your body. Squat down until your thighs are parallel to the floor. Keep your chest up. Drive back up through your heels.',
    breathing: 'Inhale deeply at the top and hold your breath to stabilize your core; exhale as you complete the ascent.',
    mistakes: [
      'Letting the knees collapse inward (valgus collapse) during the drive.',
      'Heels lifting off the floor, straining your knees.',
      'Rounding the spine or bending excessively forward at the waist.'
    ]
  },
  'Romanian Deadlifts (RDLs)': {
    primary: 'Hamstrings, Gluteus Maximus',
    secondary: 'Erector Spinae, Core, Forearms',
    setup: 'Stand tall with feet hip-width apart holding a barbell at hip height with an overhand grip. Keep your knees slightly bent (soft knees) and pull your shoulders back.',
    execution: 'Hinge forward at your hips, pushing your glutes backwards. Slide the barbell down your thighs towards your shins, keeping your back completely flat. Lower until you feel a deep hamstring stretch, then drive hips forward to stand.',
    breathing: 'Inhale on the way down; exhale as you drive your hips forward to stand.',
    mistakes: [
      'Bending the knees too much, turning the lift into a conventional squat.',
      'Letting the lower back round to reach lower to the ground.',
      'Looking up at the ceiling, which strains the cervical spine.'
    ]
  },
  'Lat Pulldowns (Wide Grip)': {
    primary: 'Latissimus Dorsi (Lats/Upper Back)',
    secondary: 'Biceps, Rear Deltoids, Rhomboids',
    setup: 'Adjust the thigh pad so your legs are locked in. Grip the wide pulldown bar with an overhand grip, wider than shoulder width. Sit down and let your arms fully extend.',
    execution: 'Leaning back very slightly (10-15°), pull the bar down towards your collarbone by leading with your elbows. Squeeze your shoulder blades together at the bottom, then slowly return the bar under full control.',
    breathing: 'Exhale as you pull the bar down; inhale as you return it to the top.',
    mistakes: [
      'Using body momentum or leaning back excessively to pull the weight down.',
      'Pulling the bar behind the neck, which strains shoulder joints.',
      'Letting the weight stack slam back up without controlling the speed.'
    ]
  },
  'Overhead Barbell Press (OHP)': {
    primary: 'Anterior Deltoids, Shoulders',
    secondary: 'Triceps, Upper Chest, Core, Serratus Anterior',
    setup: 'Set the bar at upper-chest height on the rack. Grip the bar just outside shoulder width. Unrack and rest it on your collarbone/shoulders. Brace core and squeeze glutes.',
    execution: 'Press the bar straight up overhead, moving your head slightly back to clear your chin, then push your head forward once the bar passes your forehead. Lock out your elbows at the top.',
    breathing: 'Take a deep breath at the bottom, brace, and exhale as you press overhead.',
    mistakes: [
      'Arching the lower back excessively to press the weight.',
      'Using leg drive (which makes it a push press).',
      'Holding the bar with bent wrists.'
    ]
  },
  // Expanded Exercise Guides
  'Cable Crossovers (Lower Chest)': {
    primary: 'Chest (Lower Pectoralis)',
    secondary: 'Anterior Deltoids, Triceps',
    setup: 'Set the cables high. Stand centered, grab handles with overhand grip.',
    execution: 'Pull the cables down and together in front of lower chest, squeezing pecs.',
    breathing: 'Exhale while pulling, inhale while returning.',
    mistakes: [
      'Arcing elbows too high, reducing chest activation.',
      'Using momentum instead of control.',
      'Not fully extending arms at start.'
    ]
  },
  'Dumbbell Lateral Raises': {
    primary: 'Shoulders (Lateral Deltoid)',
    secondary: 'Trapezius',
    setup: 'Stand tall, hold dumbbells at sides with palms facing in.',
    execution: 'Lift arms to side until elbows at shoulder height, slight bend, then lower.',
    breathing: 'Exhale on lift, inhale on lower.',
    mistakes: [
      'Swinging with heavy weight.',
      'Raising above shoulder level.',
      'Locking elbows.'
    ]
  },
  'Cable Face Pulls': {
    primary: 'Rear Deltoids, Upper Back',
    secondary: 'Trapezius, Rotator Cuff',
    setup: 'Attach rope to high pulley. Grab with overhand grip, arms extended.',
    execution: 'Pull rope towards face, separating hands, squeezing rear delts.',
    breathing: 'Exhale while pulling, inhale while returning.',
    mistakes: [
      'Using momentum.',
      'Letting elbows drop too low.',
      'Rounding shoulders.'
    ]
  },
  'Dumbbell Goblet Squats': {
    primary: 'Quadriceps, Glutes',
    secondary: 'Core',
    setup: 'Hold a dumbbell vertically close to chest.',
    execution: 'Squat down keeping chest up, drive through heels to stand.',
    breathing: 'Inhale down, exhale up.',
    mistakes: [
      'Letting knees cave inward.',
      'Heels lifting.',
      'Rounded back.'
    ]
  },
  'Push-ups': {
    primary: 'Chest',
    secondary: 'Triceps, Shoulders',
    setup: 'Place hands slightly wider than shoulders on floor, body straight.',
    execution: 'Lower chest to floor, then press back up.',
    breathing: 'Inhale down, exhale up.',
    mistakes: [
      'Sagging hips.',
      'Flared elbows.',
      'Incomplete range.'
    ]
  },
  'Dumbbell Thrusters': {
    primary: 'Full Body (Shoulders, Quads)',
    secondary: 'Core',
    setup: 'Hold dumbbells at shoulders.',
    execution: 'Squat down, then explosively drive up while pressing dumbbells overhead.',
    breathing: 'Inhale down, exhale up.',
    mistakes: [
      'Using legs to press overhead.',
      'Rounding back.',
      'Poor depth on squat.'
    ]
  },
  'Barbell Rows (Overhand)': {
    primary: 'Back (Lats, Rhomboids)',
    secondary: 'Biceps',
    setup: 'Grip bar overhand, hinge at hips, back flat.',
    execution: 'Pull bar to lower belly, squeeze shoulder blades.',
    breathing: 'Exhale pulling, inhale returning.',
    mistakes: [
      'Rounded back.',
      'Rushing motion.',
      'Using momentum.'
    ]
  },
  'Overhead Dumbbell Tricep Extension': {
    primary: 'Triceps',
    secondary: 'Shoulders',
    setup: 'Hold dumbbell with both hands overhead.',
    execution: 'Lower dumbbell behind head by bending elbows, then extend.',
    breathing: 'Inhale down, exhale up.',
    mistakes: [
      'Elbows flaring.',
      'Using shoulders.',
      'Rough motion.'
    ]
  },
  'Tricep Rope Pushdowns': {
    primary: 'Triceps',
    secondary: 'Forearms',
    setup: 'Attach rope to high pulley, grab with elbows tucked.',
    execution: 'Push rope down, separating ends at bottom.',
    breathing: 'Exhale pushing, inhale returning.',
    mistakes: [
      'Elbows moving forward.',
      'Using shoulders.',
      'Partial extension.'
    ]
  },
  'Incline Dumbbell Curls': {
    primary: 'Biceps',
    secondary: 'Forearms',
    setup: 'Sit on incline bench, let arms hang.',
    execution: 'Curl dumbbells up, keep elbows stationary.',
    breathing: 'Exhale curl, inhale lower.',
    mistakes: [
      'Swinging body.',
      'Not full extension.',
      'Using momentum.'
    ]
  },
  'Hammer Curls': {
    primary: 'Biceps (Brachialis)',
    secondary: 'Forearms',
    setup: 'Stand holding dumbbells with neutral grip.',
    execution: 'Curl without rotating palms.',
    breathing: 'Exhale curl, inhale lower.',
    mistakes: [
      'Swinging.',
      'Elbow movement.',
      'Rushing.'
    ]
  },
  'Barbell Bicep Curls': {
    primary: 'Biceps',
    secondary: 'Forearms',
    setup: 'Stand, grip bar shoulder-width.',
    execution: 'Curl bar towards shoulders, elbows at sides.',
    breathing: 'Exhale curl, inhale lower.',
    mistakes: [
      'Swinging hips.',
      'Elbow flare.',
      'Incomplete range.'
    ]
  },
  'Weighted Bench Dips': {
    primary: 'Triceps',
    secondary: 'Chest, Shoulders',
    setup: 'Place hands on bench, feet on another bench, weight on lap.',
    execution: 'Lower hips, then press up using triceps.',
    breathing: 'Inhale down, exhale up.',
    mistakes: [
      'Shoulders rolling forward.',
      'Elbows flaring.',
      'Rushing movement.'
    ]
  },
  'Leg Press': {
    primary: 'Quadriceps, Glutes',
    secondary: 'Hamstrings, Calves',
    setup: 'Sit on leg press machine, feet shoulder-width on platform.',
    execution: 'Push platform away until legs near extension, then return controlled.',
    breathing: 'Exhale push, inhale return.',
    mistakes: [
      'Locking knees.',
      'Heels lifting.',
      'Partial range.'
    ]
  },
  'Standing Calf Raises': {
    primary: 'Calves',
    secondary: '',
    setup: 'Stand on edge of step with heels hanging.',
    execution: 'Lower heels fully, then raise onto toes.',
    breathing: 'Inhale down, exhale up.',
    mistakes: [
      'Bouncing.',
      'Insufficient stretch.',
      'Using momentum.'
    ]
  },
  'Bulgarian Split Squats': {
    primary: 'Quadriceps, Glutes',
    secondary: 'Hamstrings',
    setup: 'Rear foot on bench, front foot forward.',
    execution: 'Lower rear knee toward floor, keep front knee behind toes, then rise.',
    breathing: 'Inhale down, exhale up.',
    mistakes: [
      'Knee beyond toes.',
      'Leaning forward.',
      'Heel off ground.'
    ]
  },
  'Lying Leg Curls': {
    primary: 'Hamstrings',
    secondary: '',
    setup: 'Lie face down on leg curl machine, pad ankles.',
    execution: 'Curl heels to glutes, then return slowly.',
    breathing: 'Exhale curl, inhale return.',
    mistakes: [
      'Hip lift.',
      'Rushing.',
      'Incomplete curl.'
    ]
  },
  'Hanging Leg Raises': {
    primary: 'Abs',
    secondary: 'Hip Flexors',
    setup: 'Hang from pull-up bar, grip firm.',
    execution: 'Raise legs to at least parallel, then lower.',
    breathing: 'Exhale lift, inhale lower.',
    mistakes: [
      'Swinging.',
      'Using momentum.',
      'Rounding back.'
    ]
  },
  'Planks': {
    primary: 'Core',
    secondary: 'Shoulders, Glutes',
    setup: 'Forearms on ground, body straight.',
    execution: 'Hold position, engage core.',
    breathing: 'Steady breathing.',
    mistakes: [
      'Sagging hips.',
      'Raised hips.',
      'Holding breath.'
    ]
  },
  'Cable Crunches': {
    primary: 'Abs',
    secondary: '',
    setup: 'Kneel facing cable, rope attached high.',
    execution: 'Pull rope down while crunching torso.',
    breathing: 'Exhale crunch, inhale return.',
    mistakes: [
      'Using momentum.',
      'Incomplete crunch.',
      'Straining neck.'
    ]
  },
  'Weighted Russian Twists': {
    primary: 'Obliques',
    secondary: '',
    setup: 'Sit on floor, hold weight, feet lifted.',
    execution: 'Rotate torso side to side, touching weight to floor.',
    breathing: 'Exhale twist, inhale return.',
    mistakes: [
      'Rounding back.',
      'Using momentum.',
      'Limited range.'
    ]
  }
};

const getExerciseGuide = (name, category) => {
  const cleanName = name ? name.trim() : '';
  if (EXERCISE_GUIDES_DB[cleanName]) {
    return EXERCISE_GUIDES_DB[cleanName];
  }
  
  // Try keyword matching
  const lower = cleanName.toLowerCase();
  
  if (lower.includes('bench press') || lower.includes('chest press') || lower.includes('chest fly') || lower.includes('push-up') || lower.includes('pushup')) {
    return {
      primary: 'Chest (Pectoralis Major)',
      secondary: 'Triceps, Front Shoulders',
      setup: 'Position yourself securely on the bench or floor. Align your grip or hand placement to support the chest movement.',
      execution: 'Lower the weight under complete control towards your chest. Contract your pectorals forcefully to press back to the starting point.',
      breathing: 'Inhale as you lower; exhale as you push up.',
      mistakes: [
        'Elbow flaring that strains the front shoulder joints.',
        'Half reps neglecting the full range of motion.',
        'Lifting the glutes or neck off the support platform.'
      ]
    };
  }
  
  if (lower.includes('row') || lower.includes('pulldown') || lower.includes('pullup') || lower.includes('pull-up') || lower.includes('chin-up') || lower.includes('chinup') || lower.includes('deadlift')) {
    return {
      primary: 'Back (Lats, Rhomboids, Trapezius)',
      secondary: 'Biceps, Forearms, Core',
      setup: 'Secure your footing or sit firmly. Keep your spine straight, engage your core, and pull your shoulder blades down.',
      execution: 'Pull the weight towards your torso (or pull your body up) by leading with your elbows. Focus on squeezing your back muscles.',
      breathing: 'Inhale as you extend your arms; exhale as you pull and squeeze.',
      mistakes: [
        'Using excessive body momentum or swinging.',
        'Shrugging your shoulders upward, which engages the traps instead of the lats.',
        'Rounding your back during pulling motions.'
      ]
    };
  }
  
  if (lower.includes('squat') || lower.includes('lunge') || lower.includes('leg press') || lower.includes('leg extension') || lower.includes('leg curl') || lower.includes('calf')) {
    return {
      primary: 'Legs (Quadriceps, Hamstrings, Glutes)',
      secondary: 'Calves, Lower Back, Core',
      setup: 'Stand with feet shoulder-width apart or seat yourself in the machine. Secure alignment of knees over toes.',
      execution: 'Bend your knees and hips to lower down (or press the platform away). Keep your chest upright. Drive back up through your feet.',
      breathing: 'Inhale as you squat down or lower the load; exhale as you drive back up.',
      mistakes: [
        'Knees collapsing inward during the movement.',
        'Lifting heels off the floor or platform.',
        'Rounding the lower back or bending too far forward.'
      ]
    };
  }
  
  if (lower.includes('overhead press') || lower.includes('shoulder press') || lower.includes('lateral raise') || lower.includes('rear delt') || lower.includes('shrug') || lower.includes('face pull')) {
    return {
      primary: 'Shoulders (Deltoids: Anterior, Lateral, or Posterior)',
      secondary: 'Triceps, Trapezius, Core',
      setup: 'Stand or sit with a straight spine. Grip the weights securely at shoulder level or handle height.',
      execution: 'Press the weight straight up overhead (or raise out to the side/rear). Keep your core braced and shoulders down.',
      breathing: 'Inhale as you lower; exhale as you press or raise.',
      mistakes: [
        'Arching the lower back excessively during pressing.',
        'Swinging the body to raise weights during side raises.',
        'Locking the elbows completely under heavy loads.'
      ]
    };
  }
  
  if (lower.includes('curl') || lower.includes('bicep')) {
    return {
      primary: 'Biceps (Biceps Brachii, Brachialis)',
      secondary: 'Forearms, Brachioradialis',
      setup: 'Stand or sit tall. Hold the weight with your palms facing up (or neutral for hammer curls). Keep elbows close to your ribs.',
      execution: 'Curl the weight up towards your shoulders by bending at the elbows. Squeeze the biceps hard at the peak, then lower slowly.',
      breathing: 'Exhale as you curl up; inhale as you lower the weight.',
      mistakes: [
        'Swinging the elbows forward or using hips to swing the weight.',
        'Not extending the arms fully at the bottom of the rep.',
        'Letting the wrists curl excessively, shifting load to forearms.'
      ]
    };
  }
  
  if (lower.includes('extension') || lower.includes('pushdown') || lower.includes('skull') || lower.includes('dip')) {
    return {
      primary: 'Triceps (Triceps Brachii)',
      secondary: 'Anterior Deltoids, Forearms',
      setup: 'Hold the bar, rope, or dumbbells. Position elbows tucked close to your body or locked overhead.',
      execution: 'Extend your arms to contract the triceps fully. Hold the squeeze for a split second, then slowly return to the starting position.',
      breathing: 'Exhale as you extend the arm; inhale as you bend the elbow.',
      mistakes: [
        'Letting the elbows flare out to the sides.',
        'Using shoulders or body weight to press down instead of isolating triceps.',
        'Failing to control the speed on the return phase.'
      ]
    };
  }
  
  // Default fallback
  return {
    primary: category || 'Targeted Muscle Group',
    secondary: 'Stabilizer Muscles',
    setup: 'Set up with proper posture: engage your core, keep your shoulders back, and align your feet or seat position.',
    execution: 'Execute the range of motion with full control. Focus on mind-muscle connection with the primary movers.',
    breathing: 'Breathe out on exertion (concentric phase) and breathe in on return (eccentric phase).',
    mistakes: [
      'Rushing the movement and losing control of the weight.',
      'Using momentum instead of strict muscle isolation.',
      'Holding your breath during high-effort reps.'
    ]
  };
};

const getMusclesWorked = (notes) => {
  if (!notes || !notes.includes('🏋️‍♂️ Workout Sets:')) return [];
  const muscles = new Set();
  const matches = notes.matchAll(/-\s+.*?\s*\((.*?)\):/g);
  for (const match of matches) {
    const category = match[1];
    if (category) muscles.add(category);
  }
  return Array.from(muscles);
};

const getMuscleColor = (muscle) => {
  switch (muscle) {
    case 'Chest': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'Back & Lats': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Shoulders': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'Biceps': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    case 'Triceps': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Legs': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Core': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const getExercisesFromNotes = (notes) => {
  if (!notes) return null;
  if (!notes.includes('🏋️‍♂️ Workout Sets:')) return null;
  try {
    const parts = notes.split('\n\nAdditional Notes: ');
    const workoutPart = parts[0].replace('🏋️‍♂️ Workout Sets:\n', '');
    const additionalNotes = parts[1] || '';

    let cleanedPart = workoutPart;
    if (cleanedPart.startsWith('- ')) {
      cleanedPart = cleanedPart.substring(2);
    }
    const rawBlocks = cleanedPart.split('\n- ');
    const exercises = [];

    rawBlocks.forEach((block) => {
      const lines = block.split('\n');
      const headerLine = lines[0];
      const setLines = lines.slice(1);

      if (!headerLine) return;

      const nameMatch = headerLine.match(/(.*?)\s*\((.*?)\):/);
      const exName = nameMatch ? nameMatch[1] : headerLine.replace(':', '');
      const exCat = nameMatch ? nameMatch[2] : '';

      const sets = [];
      setLines.forEach((setLine) => {
        const cleanSetLine = setLine.trim().replace(/^\*\s*/, '');
        const setMatch = cleanSetLine.match(/Set\s+(\d+):\s*(.*)/);
        if (setMatch) {
          sets.push({
            num: setMatch[1],
            detail: setMatch[2]
          });
        }
      });

      if (exName) {
        exercises.push({ name: exName, category: exCat, sets });
      }
    });
    return { exercises, additionalNotes };
  } catch (err) {
    console.error('Failed to parse sets notes:', err);
    return null;
  }
};

const FOCUS_INTENSITIES = {
  'Chest & Triceps (Push A)': [
    { name: 'Pectorals (Chest)', intensity: 70, color: 'from-orange-500 to-red-600' },
    { name: 'Triceps (Arms)', intensity: 30, color: 'from-amber-400 to-orange-500' }
  ],
  'Back & Biceps (Pull A)': [
    { name: 'Latissimus Dorsi (Back)', intensity: 60, color: 'from-blue-500 to-indigo-600' },
    { name: 'Biceps (Arms)', intensity: 40, color: 'from-pink-500 to-purple-600' }
  ],
  'Legs (Squat Focus)': [
    { name: 'Quadriceps (Thighs)', intensity: 65, color: 'from-emerald-400 to-teal-600' },
    { name: 'Hamstrings & Glutes', intensity: 35, color: 'from-green-500 to-emerald-600' }
  ],
  'Active Recovery & Stretching': [
    { name: 'Full Body Mobility', intensity: 100, color: 'from-sky-400 to-blue-500' }
  ],
  'Shoulders & Arms': [
    { name: 'Deltoids (Shoulders)', intensity: 50, color: 'from-orange-400 to-amber-600' },
    { name: 'Biceps & Triceps', intensity: 50, color: 'from-purple-500 to-pink-500' }
  ],
  'Legs & Core': [
    { name: 'Leg Muscles', intensity: 60, color: 'from-emerald-500 to-teal-500' },
    { name: 'Abdominals & Core', intensity: 40, color: 'from-yellow-500 to-amber-500' }
  ],
  'Active Rest & Mobility': [
    { name: 'Stretching & Foam Rolling', intensity: 100, color: 'from-indigo-400 to-purple-500' }
  ],
  'Chest & Back (Supersets)': [
    { name: 'Chest Balance', intensity: 50, color: 'from-red-500 to-orange-500' },
    { name: 'Back Balance', intensity: 50, color: 'from-blue-500 to-indigo-500' }
  ],
  'Legs & Abs (High Volume)': [
    { name: 'Quad & Hamstring Volume', intensity: 70, color: 'from-emerald-500 to-green-600' },
    { name: 'Abdominal Conditioning', intensity: 30, color: 'from-yellow-400 to-orange-500' }
  ],
  'Arms & Shoulders (Conditioning)': [
    { name: 'Arm Muscles (Bi/Tri)', intensity: 55, color: 'from-pink-500 to-purple-500' },
    { name: 'Deltoids (Shoulders)', intensity: 45, color: 'from-orange-500 to-red-500' }
  ],
  'Active Rest (Cardio Focus)': [
    { name: 'Zone 2 Cardio Endurance', intensity: 100, color: 'from-sky-400 to-teal-500' }
  ],
  'Full Body Conditioning': [
    { name: 'Compound Muscles Worked', intensity: 100, color: 'from-indigo-500 to-purple-600' }
  ],
  'Legs & Core (High Intensity)': [
    { name: 'Leg Ext & Curl Intensity', intensity: 65, color: 'from-emerald-500 to-teal-500' },
    { name: 'Core Stabilizer Muscles', intensity: 35, color: 'from-yellow-500 to-amber-500' }
  ],
  'Rest & Recover': [
    { name: 'Muscle Tissue Recovery', intensity: 100, color: 'from-indigo-500 to-slate-500' }
  ],
  'Foam Rolling & Full Body Stretch': [
    { name: 'Myofascial Release', intensity: 100, color: 'from-indigo-500 to-slate-500' }
  ]
};

export default function PerformancePage() {
  const qc = useQueryClient();
  const { data: logsData, isLoading } = usePerformanceLogs({ ordering: '-date_logged' });
  const { data: streaksData, isLoading: streaksLoading } = useStreaks();
  const deleteLog = useDeletePerformanceLog();

  // Custom states for new UI pattern and Workout Schedule
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'schedule'
  const [program, setProgram] = useState('bulking'); // 'bulking' | 'cutting'
  const [expandedDay, setExpandedDay] = useState(null); // 'Monday', 'Tuesday', etc.
  const [prefilledData, setPrefilledData] = useState(null);
  const [isLogFormOpen, setIsLogFormOpen] = useState(false); // Modal form visibility
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedGuideExercise, setSelectedGuideExercise] = useState(null);
  const [calcWeight, setCalcWeight] = useState('');
  const [calcReps, setCalcReps] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [selectedDayName, setSelectedDayName] = useState('Monday');

  const results = logsData?.results ?? logsData ?? [];
  const streak = streaksData?.performance;

  const totalWorkouts = results.filter(r => !r.is_rest_day).length;
  const totalDuration = results.reduce((acc, curr) => acc + (Number(curr.duration_mins) || 0), 0);
  const totalCalories = results.reduce((acc, curr) => acc + (Number(curr.calories_burned) || 0), 0);

  const getEmoji = (type) => {
    switch (type) {
      case 'GYM': return '🏋️‍♂️';
      case 'CARDIO': return '🏃‍♂️';
      case 'YOGA': return '🧘‍♂️';
      case 'SPORTS': return '⚽';
      case 'REST': return '🛌';
      default: return '💪';
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 'GYM': return 'Gym / Weight Training';
      case 'CARDIO': return 'Cardio / Running';
      case 'YOGA': return 'Yoga / Flexibility';
      case 'SPORTS': return 'Sports / Recreation';
      case 'REST': return 'Active Rest';
      default: return type;
    }
  };

  // Calculate Chart data
  // 1. Activity Mix Doughnut
  const activityCounts = { GYM: 0, CARDIO: 0, YOGA: 0, SPORTS: 0, REST: 0 };
  results.forEach(log => {
    const type = log.activity_type || (log.is_rest_day ? 'REST' : 'GYM');
    if (activityCounts[type] !== undefined) {
      activityCounts[type]++;
    }
  });
  
  const activityLabels = Object.keys(activityCounts).filter(k => activityCounts[k] > 0);
  const activityData = activityLabels.map(k => activityCounts[k]);
  const activityColors = activityLabels.map(k => {
    switch (k) {
      case 'GYM': return 'hsl(var(--perf-hue) 85% 60%)'; // Orange-red
      case 'CARDIO': return 'hsl(var(--tech-hue) 80% 60%)'; // Blue
      case 'YOGA': return 'hsl(var(--study-hue) 75% 55%)'; // Purple
      case 'SPORTS': return '#eab308'; // Yellow
      case 'REST': return '#64748b'; // Slate
      default: return '#14b8a6';
    }
  });

  const activityDoughnutData = {
    labels: activityLabels.map(k => getLabel(k).split(' / ')[0]),
    datasets: [{
      data: activityData,
      backgroundColor: activityColors,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)'
    }]
  };

  // 2. Muscle Group Targets Doughnut
  const muscleCounts = {
    'Chest': 0,
    'Back & Lats': 0,
    'Shoulders': 0,
    'Biceps': 0,
    'Triceps': 0,
    'Legs': 0,
    'Core': 0,
    'Custom': 0
  };
  let hasGymSets = false;
  results.forEach(log => {
    if (log.activity_type === 'GYM' && log.notes && log.notes.includes('🏋️‍♂️ Workout Sets:')) {
      const matches = log.notes.matchAll(/-\s+.*?\s*\((.*?)\):/g);
      for (const match of matches) {
        const category = match[1];
        if (category in muscleCounts) {
          muscleCounts[category]++;
          hasGymSets = true;
        } else if (category) {
          muscleCounts['Custom']++;
          hasGymSets = true;
        }
      }
    }
  });

  const muscleLabels = Object.keys(muscleCounts).filter(k => muscleCounts[k] > 0);
  const muscleData = muscleLabels.map(k => muscleCounts[k]);
  const muscleColors = muscleLabels.map(k => {
    switch (k) {
      case 'Chest': return '#ef4444';
      case 'Back & Lats': return '#3b82f6';
      case 'Shoulders': return '#f97316';
      case 'Biceps': return '#ec4899';
      case 'Triceps': return '#8b5cf6';
      case 'Legs': return '#10b981';
      case 'Core': return '#eab308';
      default: return '#6b7280';
    }
  });

  const muscleDoughnutData = {
    labels: muscleLabels,
    datasets: [{
      data: muscleData,
      backgroundColor: muscleColors,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)'
    }]
  };

  // Doughnut standard options
  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          boxWidth: 8,
          font: { family: 'Inter', size: 9, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleFont: { family: 'Inter', weight: 'bold' },
        bodyFont: { family: 'Inter' }
      }
    },
    maintainAspectRatio: false
  };

  // 3. Weekly Volume & Calorie Trend Line Chart
  const last7Logs = [...results].slice(0, 7).reverse();
  const trendLabels = last7Logs.map(log => 
    new Date(log.date_logged).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  );
  const caloriesData = last7Logs.map(log => Number(log.calories_burned) || 0);
  const durationData = last7Logs.map(log => Number(log.duration_mins) || 0);

  const lineChartData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Calories (kcal)',
        data: caloriesData,
        borderColor: 'hsl(var(--perf-hue) 85% 60%)',
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'hsl(var(--perf-hue) 85% 60%)',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        yAxisID: 'y',
      },
      {
        label: 'Duration (m)',
        data: durationData,
        borderColor: 'hsl(var(--tech-hue) 80% 60%)',
        backgroundColor: 'rgba(14, 165, 233, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'hsl(var(--tech-hue) 80% 60%)',
        pointBorderColor: '#fff',
        pointHoverRadius: 5,
        yAxisID: 'y1',
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8',
          boxWidth: 8,
          font: { family: 'Inter', size: 8, weight: '600' }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleFont: { family: 'Inter', weight: 'bold' },
        bodyFont: { family: 'Inter' }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.01)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 8 } }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: 'hsl(var(--perf-hue) 85% 60%)', font: { family: 'Inter', size: 8 } },
        title: { display: false }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: 'hsl(var(--tech-hue) 80% 60%)', font: { family: 'Inter', size: 8 } },
        title: { display: false }
      }
    }
  };

  const handleShowGuide = (ex) => {
    setSelectedGuideExercise(ex);
    setCalcWeight('');
    setCalcReps('');
  };

  // Prefill helper when user clicks 'Log Routine' on a specific day
  const handleLogRoutine = (dayRoutine) => {
    const headerText = `${program === 'bulking' ? 'Bulking' : 'Cutting'} — ${dayRoutine.focus} (${dayRoutine.day})`;
    const exercisesText = dayRoutine.isRest 
      ? `Completed recovery routine: ${dayRoutine.exercises.map(ex => ex.name).join(', ')}`
      : `Completed Workout:\n` + dayRoutine.exercises.map((ex) => `- ${ex.name} (${ex.sets} sets x ${ex.reps})`).join('\n');
    
    setPrefilledData({
      date_logged: new Date().toISOString().split('T')[0],
      activity_type: dayRoutine.activityType,
      is_rest_day: dayRoutine.isRest || false,
      duration_mins: dayRoutine.duration,
      calories_burned: dayRoutine.calories,
      notes: `${headerText}\n\n${exercisesText}`
    });

    setActiveTab('dashboard');
    setIsLogFormOpen(true); // Open the modal form immediately!
  };

  // Notes Parser to render Workout Sets beautifully
  const parseNotes = (notes) => {
    if (!notes) return null;
    if (!notes.includes('🏋️‍♂️ Workout Sets:')) {
      return <p className="text-xs text-secondary leading-relaxed italic">"{notes}"</p>;
    }

    try {
      const parts = notes.split('\n\nAdditional Notes: ');
      const workoutPart = parts[0].replace('🏋️‍♂️ Workout Sets:\n', '');
      const additionalNotes = parts[1] || '';

      let cleanedPart = workoutPart;
      if (cleanedPart.startsWith('- ')) {
        cleanedPart = cleanedPart.substring(2);
      }
      const rawBlocks = cleanedPart.split('\n- ');
      const exercises = [];

      rawBlocks.forEach((block) => {
        const lines = block.split('\n');
        const headerLine = lines[0];
        const setLines = lines.slice(1);

        if (!headerLine) return;

        const nameMatch = headerLine.match(/(.*?)\s*\((.*?)\):/);
        const exName = nameMatch ? nameMatch[1] : headerLine.replace(':', '');
        const exCat = nameMatch ? nameMatch[2] : '';

        const sets = [];
        setLines.forEach((setLine) => {
          const cleanSetLine = setLine.trim().replace(/^\*\s*/, '');
          const setMatch = cleanSetLine.match(/Set\s+(\d+):\s*(.*)/);
          if (setMatch) {
            sets.push({
              num: setMatch[1],
              detail: setMatch[2]
            });
          }
        });

        if (exName) {
          exercises.push({ name: exName, category: exCat, sets });
        }
      });

      return (
        <div className="space-y-3.5 mt-2">
          <div className="border-t border-white/[0.04] pt-2.5 space-y-2">
            {exercises.map((ex, exIdx) => (
              <div key={exIdx} className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{ex.name}</span>
                  {ex.category && (
                    <span className="text-[9px] font-bold text-muted bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wide">
                      {ex.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ex.sets.map((set, sIdx) => (
                    <span 
                      key={sIdx} 
                      className="inline-flex items-center text-[9px] bg-perf/5 text-perf border border-perf/10 px-2 py-1 rounded-lg font-bold"
                    >
                      S{set.num}: {set.detail}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {additionalNotes && (
            <div className="text-xs text-secondary leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl italic mt-1.5 text-left">
              <b>Remarks:</b> "{additionalNotes}"
            </div>
          )}
        </div>
      );
    } catch (err) {
      console.error('Failed to parse sets notes:', err);
      return <p className="text-xs text-secondary leading-relaxed italic">"{notes}"</p>;
    }
  };

  const activeRoutine = WORKOUT_ROUTINES[program];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2.5">
            <span>🔥</span> Performance Log
          </h1>
          <p className="text-secondary text-sm mt-1">Track your fitness, workouts, active rest, and calorie burn streaks.</p>
        </div>

        {/* Tab switchers and Log button */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-center">
          <div className="flex bg-white/[0.04] p-1.5 rounded-xl border border-white/[0.05]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-white/[0.10] text-primary shadow-lg border border-white/[0.05]'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              📊 Dashboard & Logs
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'schedule'
                  ? 'bg-white/[0.10] text-primary shadow-lg border border-white/[0.05]'
                  : 'text-muted hover:text-secondary'
              }`}
            >
              🗓️ Workout Schedule
            </button>
          </div>

          <button
            onClick={() => setIsLogFormOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-perf hover:bg-perf-dark shadow-glow-perf text-white flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer border border-perf/10"
          >
            <span>➕</span> Log Activity
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* Metrics Row (Full Width at the Top) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Streak Card */}
            <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-950/15 via-slate-900 to-orange-950/15 p-4 shadow-lg hover:border-orange-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Streak</p>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-3xl font-black text-primary font-sans">
                  {streaksLoading ? '...' : (streak?.current ?? 0)}
                </span>
                <span className="text-[10px] text-muted font-bold uppercase">days</span>
              </div>
              <p className="text-[9px] text-muted mt-2 font-semibold uppercase tracking-wide">
                Best: <span className="text-orange-300 font-bold">{streak?.longest ?? 0} days</span>
              </p>
            </div>

            {/* Total Workouts Card */}
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/15 via-slate-900 to-indigo-950/15 p-4 shadow-lg hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Sessions</p>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-3xl font-black text-primary font-sans">
                  {totalWorkouts}
                </span>
                <span className="text-[10px] text-muted font-bold uppercase">logged</span>
              </div>
              <p className="text-[9px] text-muted mt-2 font-semibold uppercase tracking-wide">
                Out of {results.length} total days
              </p>
            </div>

            {/* Workout Duration Card */}
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/15 via-slate-900 to-emerald-950/15 p-4 shadow-lg hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Duration</p>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-3xl font-black text-primary font-sans">
                  {totalDuration}
                </span>
                <span className="text-[10px] text-muted font-bold uppercase">mins</span>
              </div>
              <p className="text-[9px] text-muted mt-2 font-semibold uppercase tracking-wide">
                Avg: <span className="text-emerald-300 font-bold">{results.length ? Math.round(totalDuration / results.length) : 0} mins</span>
              </p>
            </div>

            {/* Calories Burned Card */}
            <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-950/15 via-slate-900 to-rose-950/15 p-4 shadow-lg hover:border-rose-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Calories</p>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-3xl font-black text-primary font-sans">
                  {totalCalories.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted font-bold uppercase">kcal</span>
              </div>
              <p className="text-[9px] text-muted mt-2 font-semibold uppercase tracking-wide">
                Avg: <span className="text-rose-300 font-bold">{results.length ? Math.round(totalCalories / results.length) : 0} kcal</span>
              </p>
            </div>
          </div>

          {/* Analytics & Insights Card */}
          <div className="glass-card p-5 border border-white/[0.05] relative overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-primary uppercase tracking-wide">Performance Insights</h3>
                  <p className="text-[10px] text-muted font-bold mt-0.5">Visualize your metrics, volume, and split balances</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-secondary hover:text-primary border border-white/[0.05] transition-all cursor-pointer select-none"
              >
                {showAnalytics ? '🙈 Hide Charts' : '👁️ Show Analytics'}
              </button>
            </div>

            {showAnalytics && (
              <div className="mt-5 border-t border-white/[0.04] pt-5">
                {results.length === 0 ? (
                  <p className="text-xs text-muted italic text-center py-6">Log some workouts to view charts.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Activity Mix */}
                    <div className="bg-slate-950/20 border border-white/[0.03] p-4 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
                          <span>🏃‍♂️</span> Activity Mix
                        </h4>
                        <div className="h-44 relative flex items-center justify-center">
                          <Doughnut data={activityDoughnutData} options={doughnutOptions} />
                        </div>
                      </div>
                      <p className="text-[9px] text-muted font-semibold mt-3 text-center uppercase tracking-wider">
                        Based on all logged sessions
                      </p>
                    </div>

                    {/* Muscle Targets */}
                    <div className="bg-slate-950/20 border border-white/[0.03] p-4 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
                          <span>🏋️‍♂️</span> Muscle Targets
                        </h4>
                        {hasGymSets ? (
                          <div className="h-44 relative flex items-center justify-center">
                            <Doughnut data={muscleDoughnutData} options={doughnutOptions} />
                          </div>
                        ) : (
                          <div className="h-44 flex flex-col items-center justify-center text-center p-3">
                            <span className="text-xl">💪</span>
                            <p className="text-[10px] text-secondary font-bold mt-2">No Gym Sets Parsed</p>
                            <p className="text-[9px] text-muted mt-1 leading-relaxed">
                              Log Gym activities with the "Sets & Reps Builder" to see your muscle split analysis!
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-muted font-semibold mt-3 text-center uppercase tracking-wider">
                        {hasGymSets ? 'Distribution of targeted sets' : 'Log sets in Gym Activity'}
                      </p>
                    </div>

                    {/* Calorie & Duration Trend */}
                    <div className="bg-slate-950/20 border border-white/[0.03] p-4 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 text-left">
                          <span>📈</span> Trend (Last 7 Sessions)
                        </h4>
                        <div className="h-44 relative flex items-center justify-center">
                          <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                      </div>
                      <p className="text-[9px] text-muted font-semibold mt-3 text-center uppercase tracking-wider">
                        Workouts progress
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Full-width Activity History Feed */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Activity History</h2>
              {results.length > 0 && (
                <span className="text-xs text-muted font-semibold bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.05]">
                  {results.length} logs
                </span>
              )}
            </div>

            {isLoading && (
              <div className="space-y-3">
                <div className="h-16 glass-card animate-pulse" />
                <div className="h-16 glass-card animate-pulse" />
                <div className="h-16 glass-card animate-pulse" />
              </div>
            )}

            {!isLoading && results.length === 0 && (
              <div className="glass-card p-12 text-center text-muted flex flex-col items-center justify-center gap-2">
                <span className="text-4xl animate-pulse">🏋️‍♂️</span>
                <p className="text-sm">No performance activities logged yet.</p>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="space-y-3 pt-2">
                {results.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const emoji = getEmoji(log.activity_type);
                  const label = getLabel(log.activity_type);
                  const muscles = getMusclesWorked(log.notes);
                  const parsed = getExercisesFromNotes(log.notes);
                  const hasSets = parsed && parsed.exercises && parsed.exercises.length > 0;
                  
                  return (
                    <div 
                      key={log.id} 
                      className={`glass-card p-4 border-l-4 transition-all duration-300 flex flex-col justify-between ${
                        log.activity_type === 'GYM' ? 'border-l-perf' :
                        log.activity_type === 'CARDIO' ? 'border-l-tech' :
                        log.activity_type === 'YOGA' ? 'border-l-study' :
                        'border-l-indigo-500'
                      } ${isExpanded ? 'shadow-xl border-white/10' : 'hover:border-white/10'}`}
                    >
                      {/* Main Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                        {/* Left Side: Icon & Title */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-xl shrink-0">
                            {emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black text-primary leading-tight">{label}</span>
                              {muscles.map((muscle, mIdx) => (
                                <span 
                                  key={mIdx} 
                                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-wider ${getMuscleColor(muscle)}`}
                                >
                                  {muscle}
                                </span>
                              ))}
                            </div>
                            <p className="text-[10px] text-muted mt-1 font-bold uppercase tracking-wider">
                              {new Date(log.date_logged).toLocaleDateString('en-IN', {
                                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Right Side: Vitals tags & Toggles */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="flex items-center gap-2">
                            {!log.is_rest_day ? (
                              <>
                                {log.duration_mins && (
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-white/[0.02] border border-white/[0.04] text-secondary">
                                    ⏱️ {log.duration_mins} mins
                                  </span>
                                )}
                                {log.calories_burned && (
                                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-white/[0.02] border border-white/[0.04] text-secondary">
                                    🔥 {log.calories_burned} kcal
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 uppercase tracking-wider">
                                🛌 Recovery
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {(hasSets || log.notes) && (
                              <button
                                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                className="px-2.5 py-1.5 text-xs text-secondary hover:text-primary font-bold bg-white/5 hover:bg-white/10 rounded-xl border border-white/[0.04] transition-all cursor-pointer select-none"
                              >
                                {isExpanded ? 'Hide ▲' : 'Details ▼'}
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm('Delete this entry?')) {
                                  deleteLog.mutate(log.id);
                                }
                              }}
                              disabled={deleteLog.isPending}
                              className="p-1.5 hover:bg-rose-500/10 text-muted hover:text-rose-400 border border-transparent hover:border-rose-500/10 rounded-xl transition-all cursor-pointer text-xs"
                              title="Delete entry"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Details Area */}
                      {isExpanded && (
                        <div className="animate-slide-down-open">
                          {hasSets ? (
                            <div className="mt-4 border-t border-white/[0.05] pt-4 space-y-4">
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="border-b border-white/[0.06] text-muted font-bold uppercase tracking-wider text-[9px]">
                                      <th className="py-2.5 px-3">Exercise</th>
                                      <th className="py-2.5 px-3 w-28">Muscle Group</th>
                                      <th className="py-2.5 px-3">Logged Sets</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/[0.02]">
                                    {parsed.exercises.map((ex, exIdx) => (
                                      <tr key={exIdx} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="py-3.5 px-3 font-bold text-primary">{ex.name}</td>
                                        <td className="py-3.5 px-3">
                                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-wide ${getMuscleColor(ex.category)}`}>
                                            {ex.category}
                                          </span>
                                        </td>
                                        <td className="py-3.5 px-3">
                                          <div className="flex flex-wrap gap-1.5">
                                            {ex.sets.map((set, sIdx) => (
                                              <span key={sIdx} className="inline-flex items-center text-[10px] bg-perf/5 text-perf border border-perf/15 px-2 py-1 rounded-lg font-bold">
                                                Set {set.num}: {set.detail}
                                              </span>
                                            ))}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {parsed.additionalNotes && (
                                <div className="text-xs text-secondary leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3.5 rounded-xl italic text-left mt-2">
                                  <b>Remarks:</b> "{parsed.additionalNotes}"
                                </div>
                              )}
                            </div>
                          ) : log.notes ? (
                            <div className="mt-4 border-t border-white/[0.05] pt-4 text-left">
                              <div className="text-xs text-secondary leading-relaxed bg-white/[0.02] border border-white/[0.04] p-3.5 rounded-xl italic">
                                <b>Remarks:</b> "{log.notes}"
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        /* WORKOUT SCHEDULE TAB */
        <div className="space-y-6 animate-fade-in">
          {/* Bulking / Cutting selector */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white/[0.02] p-5 rounded-3xl border border-white/[0.05] flex-wrap gap-4">
            <div className="text-left">
              <h2 className="text-lg font-black text-primary uppercase tracking-wide">Interactive Training Planner</h2>
              <p className="text-xs text-muted">Toggle your goal phase and tap on a weekday to load your routines workspace.</p>
            </div>
            
            <div className="flex bg-white/[0.04] p-1.5 rounded-2xl border border-white/[0.05] relative overflow-hidden">
              <button
                onClick={() => { setProgram('bulking'); setSelectedDayName('Monday'); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  program === 'bulking'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-glow-perf'
                    : 'text-muted hover:text-secondary'
                }`}
              >
                💪 Bulking Phase
              </button>
              <button
                onClick={() => { setProgram('cutting'); setSelectedDayName('Monday'); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  program === 'cutting'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-glow-rose'
                    : 'text-muted hover:text-secondary'
                }`}
              >
                ⚡ Cutting Phase
              </button>
            </div>
          </div>

          {/* Weekly Day Selector Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {activeRoutine.days.map((dayRoutine) => {
              const isSelected = selectedDayName === dayRoutine.day;
              const isRest = dayRoutine.isRest;
              
              return (
                <button
                  key={dayRoutine.day}
                  onClick={() => setSelectedDayName(dayRoutine.day)}
                  className={`glass-card p-4 text-center transition-all duration-300 flex flex-col justify-between items-center cursor-pointer select-none rounded-2xl border ${
                    isSelected
                      ? program === 'bulking'
                        ? 'border-orange-500 bg-orange-500/10 shadow-glow-perf text-white scale-[1.02]'
                        : 'border-rose-500 bg-rose-500/10 shadow-glow-rose text-white scale-[1.02]'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                  }`}
                >
                  <div className="text-center w-full">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted mb-1">
                      {dayRoutine.day.substring(0, 3)}
                    </p>
                    <p className="font-extrabold text-xs text-primary leading-tight truncate max-w-full">
                      {isRest ? '🛌 Recovery' : dayRoutine.focus.split(' (')[0]}
                    </p>
                  </div>
                  <span className={`mt-3 px-2 py-0.5 rounded-[6px] text-[8px] font-black uppercase border leading-none shrink-0 ${
                    isRest
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : program === 'bulking'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {isRest ? 'Rest' : 'Train'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Day Workspace Panel */}
          {(() => {
            const activeDayRoutine = activeRoutine.days.find(d => d.day === selectedDayName) || activeRoutine.days[0];
            const intensities = FOCUS_INTENSITIES[activeDayRoutine.focus] || [];
            
            return (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch animate-fade-in">
                {/* Column 1: Exercises Checklist (60% width) */}
                <div className="lg:col-span-3 space-y-4 text-left">
                  <div className="glass-card p-5 border border-white/[0.05] rounded-3xl flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-4 flex-wrap gap-2">
                        <div>
                          <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                            program === 'bulking'
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {activeDayRoutine.day} Focus
                          </span>
                          <h3 className="text-base font-black text-primary mt-1.5">{activeDayRoutine.focus}</h3>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-muted font-bold">⏱️ {activeDayRoutine.duration}m duration</span>
                          <span className="text-[10px] text-muted font-bold">🔥 {activeDayRoutine.calories} kcal burn</span>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                        {activeDayRoutine.exercises.map((ex, idx) => (
                          <div 
                            key={idx}
                            className="p-4 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.02] hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
                          >
                            <div className="space-y-1">
                              <span className="text-sm font-bold text-primary flex items-center gap-2">
                                <span className="text-xs text-muted font-bold">{idx + 1}.</span>
                                {ex.name}
                              </span>
                              <p className="text-[10px] text-secondary leading-relaxed pl-4 border-l border-white/10 italic">
                                {ex.guide}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-center">
                              <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-extrabold text-secondary">
                                {ex.sets} sets
                              </span>
                              <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-extrabold text-secondary">
                                {ex.reps} reps
                              </span>
                              <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-extrabold text-secondary">
                                ⏱️ {ex.rest} rest
                              </span>
                              {!activeDayRoutine.isRest && (
                                <button
                                  onClick={() => handleShowGuide(ex)}
                                  className="px-2.5 py-0.5 rounded-lg text-[9px] font-black bg-perf/10 hover:bg-perf/20 text-perf border border-perf/15 hover:text-white transition-all cursor-pointer shadow-sm select-none"
                                >
                                  🔍 Form Guide
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-5 border-t border-white/[0.05] mt-5">
                      <button
                        onClick={() => handleLogRoutine(activeDayRoutine)}
                        className={`px-6 py-2.5 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer text-white ${
                          program === 'bulking'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-glow-perf'
                            : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-glow-rose'
                        }`}
                      >
                        ⚡ Prefill & Log This Routine
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 2: Muscle map, status, and coach tips (40% width) */}
                <div className="lg:col-span-2 flex flex-col gap-4 text-left">
                  {/* Target Muscle Intensities Card */}
                  <div className="glass-card p-5 border border-white/[0.05] rounded-3xl flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <span>🎯</span> Muscle Group Load Allocation
                      </h4>
                      <div className="space-y-4">
                        {intensities.map((item, index) => (
                          <div key={index} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-secondary">{item.name}</span>
                              <span className="text-primary">{item.intensity}% Load</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                                style={{ width: `${item.intensity}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        {intensities.length === 0 && (
                          <p className="text-xs text-muted italic">Rest day - focus is recovery and repair.</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/[0.05] text-[10px] text-muted font-semibold leading-relaxed">
                      * Calculated scientifically based on total set volume allocation.
                    </div>
                  </div>

                  {/* Dynamic Training Tip Card */}
                  <div className="glass-card p-5 border border-white/[0.05] rounded-3xl text-left bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
                    <h4 className="text-xs font-black text-primary uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                      <span>🧠</span> Workout Coaching Tip
                    </h4>
                    <div className="text-xs text-secondary leading-relaxed space-y-2">
                      {activeDayRoutine.isRest ? (
                        <p>
                          <b>Active Recovery:</b> Keep intensity minimal today. Perform soft stretches and drink extra water to help clear lactic acid and repair muscle tissue.
                        </p>
                      ) : (
                        <>
                          <p>
                            <b>Eccentric Focus:</b> Focus on a slow 3-second release on the eccentric phase today to maximize muscle micro-tears (essential for hypertrophy).
                          </p>
                          <p>
                            <b>Hydration & Rest:</b> Rest for the full {activeDayRoutine.exercises[0]?.rest || '2 mins'} on compound lifts. Squeeze target muscles at peak contraction.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Log Activity Modal Form */}
      {isLogFormOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-modal-zoom">
            <LogForm 
              defaultPillar="performance" 
              lockPillar={true} 
              initialData={prefilledData} 
              onSuccess={() => {
                setIsLogFormOpen(false);
                setPrefilledData(null);
              }}
              onClose={() => {
                setIsLogFormOpen(false);
                setPrefilledData(null);
              }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Anatomy Guide Modal Overlay */}
      {selectedGuideExercise && createPortal(
        (() => {
          const guide = getExerciseGuide(selectedGuideExercise.name, selectedGuideExercise.category || program);
          return (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-white/[0.08] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl relative text-left animate-modal-zoom">
                
                {/* Modal Close */}
                <button
                  onClick={() => setSelectedGuideExercise(null)}
                  className="absolute top-4 right-4 text-muted hover:text-primary transition-colors text-sm px-2.5 py-1.5 hover:bg-white/5 rounded-xl border border-white/[0.05] cursor-pointer"
                >
                  ✕
                </button>

                {/* Modal Title */}
                <div className="pb-3.5 border-b border-white/[0.06] pr-12">
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase text-perf tracking-wider bg-perf/15 border border-perf/20 rounded-md">
                    Anatomical Form Guide
                  </span>
                  <h3 className="text-lg font-black text-primary mt-1.5 flex items-center gap-1.5">
                    <span>🏋️‍♂️</span> {selectedGuideExercise.name}
                  </h3>
                </div>

                {/* Modal Content Scrollable */}
                <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
                  {/* Cover Graphic / Illustration */}
                  <div className="relative h-36 rounded-2xl overflow-hidden border border-white/[0.04]">
                    <img 
                      src="/exercise_anatomy_guide.png" 
                      alt="Anatomy Guide"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                      <p className="text-[10px] text-perf font-black uppercase tracking-wider">
                        🎯 Targeted Area
                      </p>
                      <p className="text-xs text-primary font-bold mt-0.5">
                        Primary Focus: <span className="text-perf">{guide.primary}</span>
                      </p>
                      {guide.secondary && (
                        <p className="text-[10px] text-secondary mt-0.5">
                          Secondary Movers: {guide.secondary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Guide Details */}
                  <div className="space-y-3">
                    <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-wider">1. Setup Positioning</h4>
                      <p className="text-xs text-secondary mt-1 leading-relaxed">{guide.setup}</p>
                    </div>
                    
                    <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-wider">2. Execution Movement</h4>
                      <p className="text-xs text-secondary mt-1 leading-relaxed">{guide.execution}</p>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-wider">3. Breathing Cycle</h4>
                      <p className="text-xs text-secondary mt-1 leading-relaxed">{guide.breathing}</p>
                    </div>

                    {/* Mistakes warning box */}
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1">
                      <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <span>⚠️</span> Common Mistakes to Avoid
                      </h4>
                      <ul className="list-disc pl-4 text-xs text-rose-300/80 space-y-1 leading-relaxed">
                        {guide.mistakes.map((mistake, mIdx) => (
                          <li key={mIdx}>{mistake}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Interactive 1RM Strength Estimator */}
                    <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-orange-400 uppercase tracking-wider flex items-center gap-1">
                          <span>🧮</span> Interactive 1-Rep Max (1RM) Estimator
                        </h4>
                        <span className="text-[9px] text-muted font-bold uppercase">Epley Formula</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-black text-muted uppercase tracking-wide">Last Weight</label>
                          <div className="relative mt-1">
                            <input
                              type="number"
                              placeholder="e.g. 80"
                              className="input focus:ring-perf/60 focus:border-perf/60 text-xs py-1.5 pr-8"
                              value={calcWeight}
                              onChange={(e) => setCalcWeight(e.target.value)}
                            />
                            <span className="absolute right-3 top-2 text-[9px] text-muted font-bold">kg</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-muted uppercase tracking-wide">Reps Completed</label>
                          <div className="relative mt-1">
                            <input
                              type="number"
                              placeholder="e.g. 8"
                              className="input focus:ring-perf/60 focus:border-perf/60 text-xs py-1.5 pr-10"
                              value={calcReps}
                              onChange={(e) => setCalcReps(e.target.value)}
                            />
                            <span className="absolute right-3 top-2 text-[9px] text-muted font-bold">reps</span>
                          </div>
                        </div>
                      </div>

                      {calcWeight && calcReps ? (() => {
                        const w = Number(calcWeight) || 0;
                        const r = Number(calcReps) || 0;
                        if (w > 0 && r > 0) {
                          const oneRepMax = Math.round(w * (1 + r / 30));
                          return (
                            <div className="bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl flex items-center justify-between gap-4">
                              <div className="text-left">
                                <p className="text-[9px] text-muted font-bold uppercase tracking-wider">Estimated 1RM</p>
                                <p className="text-lg font-black text-orange-400 mt-0.5">{oneRepMax} kg</p>
                              </div>
                              <div className="text-[9px] text-secondary space-y-0.5 border-l border-white/10 pl-3 text-left">
                                <p><b>Strength (85%):</b> {Math.round(oneRepMax * 0.85)} kg (5 reps)</p>
                                <p><b>Hypertrophy (75%):</b> {Math.round(oneRepMax * 0.75)} kg (8-10 reps)</p>
                                <p><b>Endurance (65%):</b> {Math.round(oneRepMax * 0.65)} kg (15 reps)</p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })() : (
                        <p className="text-[10px] text-muted italic">Enter weight and reps to estimate strength targets.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-3 border-t border-white/[0.06] text-right">
                  <button
                    onClick={() => setSelectedGuideExercise(null)}
                    className="px-5 py-2 bg-perf hover:bg-perf-dark text-white text-xs rounded-xl font-bold transition-all shadow-glow-perf cursor-pointer"
                  >
                    Got it
                  </button>
                </div>

              </div>
            </div>
          );
        })(),
        document.body
      )}
    </div>
  );
}
