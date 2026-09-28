// ===================================================================
// FITNEXA AI: Comprehensive Fitness Database
// Exercises, Workout Plans, Calisthenics Progressions, Yoga Poses,
// Habits, Challenges, Badges, and Sample Data
// ===================================================================

const FITNEXA_DATA = {
  // Exercise Library (Gym, Calisthenics, Yoga)
  exercises: [
    // --- GYM EXERCISES ---
    {
      id: 'ex_bench_press',
      name: 'Barbell Bench Press',
      target: 'Chest',
      secondary: ['Triceps', 'Front Delts'],
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      type: 'Gym',
      image: 'bench_press',
      instructions: [
        'Lie flat on the bench with eyes directly under the bar.',
        'Grip the bar slightly wider than shoulder-width with wrists straight.',
        'Retract your shoulder blades and plant your feet firmly on the ground.',
        'Lower the bar slowly to your mid-chest while tucking elbows at roughly 45 degrees.',
        'Press upwards explosively while driving through your feet until arms are extended.'
      ],
      mistakes: ['Flaring elbows out to 90 degrees', 'Bouncing bar off sternum', 'Lifting hips off the bench'],
      recommendation: '3-4 sets × 6-10 reps • Rest: 90-120s',
      safety: 'Always use safety collars and keep thumbs securely wrapped around the bar.'
    },
    {
      id: 'ex_incline_db_press',
      name: 'Incline Dumbbell Press',
      target: 'Chest',
      secondary: ['Front Delts', 'Triceps'],
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      type: 'Gym',
      instructions: [
        'Set an adjustable bench to a 30-degree incline.',
        'Kick dumbbells to shoulder height using your knees as you lie back.',
        'Press dumbbells upward until arms are straight without clanking them together.',
        'Lower dumbbells with control until you feel a deep stretch in the upper pectorals.'
      ],
      mistakes: ['Bench angle too steep (turns into shoulder press)', 'Arching lower back excessively'],
      recommendation: '3-4 sets × 8-12 reps • Rest: 75-90s',
      safety: 'Keep wrists stacked directly over your elbows throughout the movement.'
    },
    {
      id: 'ex_barbell_squat',
      name: 'Barbell Back Squat',
      target: 'Legs',
      secondary: ['Glutes', 'Hamstrings', 'Core'],
      equipment: 'Barbell',
      difficulty: 'Advanced',
      type: 'Gym',
      instructions: [
        'Place bar across upper traps (high bar) or rear delts (low bar).',
        'Feet shoulder-width apart, toes angled outward 15-30 degrees.',
        'Brace core deeply with the Valsalva maneuver.',
        'Hinge at hips and bend knees simultaneously, descending until thighs are parallel or below.',
        'Drive through mid-foot to stand back up, keeping chest proud.'
      ],
      mistakes: ['Knees caving inwards (valgus collapse)', 'Rounding lumbar spine', 'Rising onto toes'],
      recommendation: '4 sets × 6-8 reps • Rest: 120-180s',
      safety: 'Set safety pins at just below parallel depth inside a power rack.'
    },
    {
      id: 'ex_deadlift',
      name: 'Conventional Barbell Deadlift',
      target: 'Back',
      secondary: ['Hamstrings', 'Glutes', 'Traps', 'Forearms'],
      equipment: 'Barbell',
      difficulty: 'Advanced',
      type: 'Gym',
      instructions: [
        'Stand with feet hip-width apart, bar over mid-foot (1 inch from shins).',
        'Hinge hips back and grip bar just outside knees.',
        'Pull chest up, engage lats ("bend the bar"), and flatten spine.',
        'Drive floor away with your legs until standing upright with locked hips.'
      ],
      mistakes: ['Jerking bar off floor', 'Hyperextending spine at lockout', 'Bar drifting away from shins'],
      recommendation: '3-4 sets × 5 reps • Rest: 180s',
      safety: 'Maintain neutral spine from neck to tailbone; drop weight if form breaks down.'
    },
    {
      id: 'ex_overhead_press',
      name: 'Overhead Barbell Press',
      target: 'Shoulders',
      secondary: ['Triceps', 'Upper Chest', 'Core'],
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      type: 'Gym',
      instructions: [
        'Stand tall with feet hip-width apart, bar resting on front deltoids.',
        'Squeeze glutes and brace abdominals tight.',
        'Press bar vertically in a straight line, tilting head back slightly to clear chin.',
        'Lock arms out overhead with bar directly over mid-foot.'
      ],
      mistakes: ['Excessive backward spinal arching', 'Pressing bar too far forward'],
      recommendation: '3-4 sets × 6-10 reps • Rest: 90s',
      safety: 'Do not use a thumbless grip for overhead presses.'
    },
    {
      id: 'ex_lat_pulldown',
      name: 'Cable Lat Pulldown',
      target: 'Back',
      secondary: ['Biceps', 'Rear Delts'],
      equipment: 'Cable',
      difficulty: 'Beginner',
      type: 'Gym',
      instructions: [
        'Sit with thighs secured firmly under knee pads.',
        'Grip wide bar with overhand grip wider than shoulders.',
        'Lean back slightly (10-15 degrees) and pull bar towards upper chest.',
        'Squeeze lats at bottom, then control return to full stretch.'
      ],
      mistakes: ['Swinging torso excessively for momentum', 'Pulling bar behind the neck'],
      recommendation: '3-4 sets × 10-12 reps • Rest: 60-75s',
      safety: 'Keep shoulders depressed and pulled away from ears.'
    },
    {
      id: 'ex_bicep_curl',
      name: 'Dumbbell Bicep Curls',
      target: 'Arms',
      secondary: ['Forearms'],
      equipment: 'Dumbbell',
      difficulty: 'Beginner',
      type: 'Gym',
      instructions: [
        'Stand with dumbbells at sides, palms facing inward.',
        'Curl weights while supinating wrists (palms facing up at peak).',
        'Squeeze biceps at the top without moving elbows forward.',
        'Lower slowly with a 3-second eccentric tempo.'
      ],
      mistakes: ['Rocking hips to swing weight', 'Elbows drifting forward during lift'],
      recommendation: '3 sets × 10-15 reps • Rest: 60s',
      safety: 'Pick a weight you can control without throwing your upper torso.'
    },
    {
      id: 'ex_tricep_pushdown',
      name: 'Cable Triceps Rope Pushdown',
      target: 'Arms',
      secondary: ['Forearms'],
      equipment: 'Cable',
      difficulty: 'Beginner',
      type: 'Gym',
      instructions: [
        'Attach rope to high pulley, pin elbows tight against ribs.',
        'Push rope down until arms are fully extended.',
        'Spread rope ends outward at bottom for maximum lateral tricep contraction.',
        'Allow forearms to rise to 90 degrees under control.'
      ],
      mistakes: ['Flaring elbows out', 'Using bodyweight to press down'],
      recommendation: '3-4 sets × 12-15 reps • Rest: 60s',
      safety: 'Maintain neutral posture without hunching forward.'
    },
    {
      id: 'ex_leg_press',
      name: '45-Degree Leg Press',
      target: 'Legs',
      secondary: ['Glutes', 'Hamstrings'],
      equipment: 'Machine',
      difficulty: 'Beginner',
      type: 'Gym',
      instructions: [
        'Sit with back and head resting flat against support pad.',
        'Place feet shoulder-width in center of sled.',
        'Release safety catches and lower sled until knees reach 90 degrees.',
        'Press through mid-foot and heels to return to top without hyperextending knees.'
      ],
      mistakes: ['Locking knees abruptly at top', 'Lower back lifting off back pad'],
      recommendation: '3-4 sets × 10-12 reps • Rest: 90s',
      safety: 'Never let your tailbone curl off the seat during maximum depth.'
    },
    {
      id: 'ex_cable_lateral_raise',
      name: 'Cable Lateral Raise',
      target: 'Shoulders',
      secondary: ['Traps'],
      equipment: 'Cable',
      difficulty: 'Intermediate',
      type: 'Gym',
      instructions: [
        'Set pulley at knee height, stand sideways to cable stack.',
        'Raise handle laterally in scapular plane until arm is parallel to floor.',
        'Pause momentarily at top, feeling the side delt burn.',
        'Lower with steady resistance.'
      ],
      mistakes: ['Shrugging traps up to neck', 'Using excessive momentum'],
      recommendation: '4 sets × 12-15 reps • Rest: 45s',
      safety: 'Keep thumbs slightly downward or neutral (pouring water cue).'
    },
    {
      id: 'ex_romanian_deadlift',
      name: 'Dumbbell Romanian Deadlift (RDL)',
      target: 'Legs',
      secondary: ['Hamstrings', 'Glutes', 'Lower Back'],
      equipment: 'Dumbbell',
      difficulty: 'Intermediate',
      type: 'Gym',
      instructions: [
        'Stand holding dumbbells against thighs with soft bend in knees.',
        'Push hips straight backward as if touching a wall behind you.',
        'Lower dumbbells along shins until hamstrings are fully lengthened.',
        'Squeeze glutes to drive hips forward back into standing position.'
      ],
      mistakes: ['Squatting instead of hip hinging', 'Allowing back to round'],
      recommendation: '3-4 sets × 8-10 reps • Rest: 90s',
      safety: 'Stop descent if lower back begins to flex or bend.'
    },
    {
      id: 'ex_hanging_leg_raise',
      name: 'Hanging Leg Raise',
      target: 'Core',
      secondary: ['Hip Flexors', 'Forearms'],
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      type: 'Gym',
      instructions: [
        'Hang from pull-up bar with overhand shoulder-width grip.',
        'Depress shoulders to engage lats and prevent excessive swinging.',
        'Raise legs straight out until parallel or higher, rolling pelvis forward.',
        'Lower legs with controlled tempo.'
      ],
      mistakes: ['Kicking legs using swing momentum', 'Arching lower back'],
      recommendation: '3 sets × 10-15 reps • Rest: 60s',
      safety: 'Bending knees into chest is a great regression if hamstrings are tight.'
    },

    // --- CALISTHENICS EXERCISES & PROGRESSIONS ---
    {
      id: 'ex_wall_pushup',
      name: 'Wall Push-up (Progression Step 1)',
      target: 'Chest',
      secondary: ['Triceps', 'Core'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      type: 'Calisthenics',
      instructions: [
        'Stand arm-length away facing a solid wall.',
        'Place palms flat on wall at chest height.',
        'Bend elbows to lower chest within an inch of wall, body in straight plank.',
        'Push away back to start.'
      ],
      mistakes: ['Sagging hips', 'Flaring elbows'],
      recommendation: '3 sets × 15-20 reps • Rest: 45s',
      safety: 'Ensure floor is non-slip.'
    },
    {
      id: 'ex_incline_pushup',
      name: 'Incline Push-up (Progression Step 2)',
      target: 'Chest',
      secondary: ['Triceps', 'Core'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      type: 'Calisthenics',
      instructions: [
        'Place hands on an elevated bench, table, or bar.',
        'Keep body straight from head to heels.',
        'Lower chest to touch edge of surface.',
        'Push firmly through palms to return.'
      ],
      mistakes: ['Hips dropping', 'Looking up and straining neck'],
      recommendation: '3 sets × 12-15 reps • Rest: 60s',
      safety: 'Choose a sturdy elevation that will not shift.'
    },
    {
      id: 'ex_knee_pushup',
      name: 'Knee Push-up (Progression Step 3)',
      target: 'Chest',
      secondary: ['Triceps', 'Shoulders'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      type: 'Calisthenics',
      instructions: [
        'Start in standard pushup position but drop knees to floor.',
        'Cross ankles or keep feet flat.',
        'Maintain straight line from shoulders to knees.',
        'Lower chest to floor and press back up.'
      ],
      mistakes: ['Leaving hips up in the air (piking)'],
      recommendation: '3 sets × 10-15 reps • Rest: 60s',
      safety: 'Use an exercise mat for knee comfort.'
    },
    {
      id: 'ex_standard_pushup',
      name: 'Standard Push-up (Progression Step 4)',
      target: 'Chest',
      secondary: ['Triceps', 'Front Delts', 'Core'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      type: 'Calisthenics',
      instructions: [
        'Hands slightly wider than shoulder-width, fingers pointing forward.',
        'Body locked rigid in a hollow body plank.',
        'Lower until chest touches floor or gets within 1 inch.',
        'Press upwards while keeping core and glutes squeezed.'
      ],
      mistakes: ['Sagging lower back', 'Flaring elbows 90 degrees out'],
      recommendation: '4 sets × 12-20 reps • Rest: 60s',
      safety: 'Keep elbows at a 45-degree arrow angle.'
    },
    {
      id: 'ex_diamond_pushup',
      name: 'Diamond Push-up (Progression Step 5)',
      target: 'Arms',
      secondary: ['Triceps', 'Inner Chest'],
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      type: 'Calisthenics',
      instructions: [
        'Place hands under center of chest with thumbs and index fingers touching in a diamond.',
        'Keep legs together and core braced.',
        'Lower chest towards diamond.',
        'Push through triceps to lock out arms.'
      ],
      mistakes: ['Elbow discomfort from awkward wrist angles', 'Loss of core plank'],
      recommendation: '3 sets × 8-12 reps • Rest: 75s',
      safety: 'Widen hand space slightly if wrist mobility is limited.'
    },
    {
      id: 'ex_archer_pushup',
      name: 'Archer Push-up (Progression Step 6)',
      target: 'Chest',
      secondary: ['Triceps', 'Shoulders', 'Core'],
      equipment: 'Bodyweight',
      difficulty: 'Advanced',
      type: 'Calisthenics',
      instructions: [
        'Take an ultra-wide push-up stance.',
        'Lower body to one side, bending working arm while opposite arm straightens completely.',
        'Push back through working side to center.',
        'Alternate sides each rep.'
      ],
      mistakes: ['Rolling torso onto side', 'Incomplete lockout'],
      recommendation: '3 sets × 6-8 reps per side • Rest: 90s',
      safety: 'Warm up wrists and shoulder joints thoroughly.'
    },
    {
      id: 'ex_one_arm_pushup',
      name: 'One-Arm Push-up (Mastery Step 7)',
      target: 'Chest',
      secondary: ['Triceps', 'Core', 'Anti-Rotation'],
      equipment: 'Bodyweight',
      difficulty: 'Advanced',
      type: 'Calisthenics',
      instructions: [
        'Feet spread wide for stability, single working hand centered under chest.',
        'Non-working hand held behind lower back.',
        'Lower chest smoothly while resisting torso rotation.',
        'Drive through palm to return to top.'
      ],
      mistakes: ['Torso twisting completely sideways'],
      recommendation: '3 sets × 3-5 reps per side • Rest: 120s',
      safety: 'Requires elite rotational core stability.'
    },
    {
      id: 'ex_dead_hang',
      name: 'Active Dead Hang (Pull Step 1)',
      target: 'Back',
      secondary: ['Grip', 'Forearms', 'Shoulders'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      type: 'Calisthenics',
      instructions: [
        'Grip pullup bar overhand slightly wider than shoulders.',
        'Hang with feet off floor, engaging scapula slightly.',
        'Breathe calmly and hold tension in grip and lats.'
      ],
      mistakes: ['Holding breath', 'Excessive swinging'],
      recommendation: '3 sets × 30-60 sec holds • Rest: 60s',
      safety: 'Decompress spine gradually before dropping.'
    },
    {
      id: 'ex_australian_rows',
      name: 'Australian Incline Row (Pull Step 2)',
      target: 'Back',
      secondary: ['Biceps', 'Rear Delts'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      type: 'Calisthenics',
      instructions: [
        'Hang under a waist-height bar with heels planted on floor.',
        'Body held in rigid reverse plank.',
        'Pull chest up to touch bar by driving elbows back.',
        'Lower with full control to arms extended.'
      ],
      mistakes: ['Hips sagging downwards', 'Leading with neck'],
      recommendation: '3 sets × 10-12 reps • Rest: 60s',
      safety: 'Adjust bar height to modify difficulty.'
    },
    {
      id: 'ex_pullup',
      name: 'Strict Bodyweight Pull-up (Pull Step 4)',
      target: 'Back',
      secondary: ['Biceps', 'Core', 'Forearms'],
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      type: 'Calisthenics',
      instructions: [
        'Grip bar with overhand grip just outside shoulders.',
        'Initiate by pulling shoulder blades down and back.',
        'Drive elbows towards hips until chin clears top of bar.',
        'Lower smoothly to dead hang without kipping.'
      ],
      mistakes: ['Kipping with legs', 'Partial range of motion', 'Craning neck over bar'],
      recommendation: '4 sets × 6-10 reps • Rest: 90-120s',
      safety: 'Avoid swinging; keep core tightly hollowed.'
    },
    {
      id: 'ex_parallel_dips',
      name: 'Parallel Bar Dips',
      target: 'Chest',
      secondary: ['Triceps', 'Front Delts'],
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      type: 'Calisthenics',
      instructions: [
        'Mount dip bars with arms locked and shoulders depressed.',
        'Lean torso forward 15-20 degrees for chest emphasis.',
        'Lower body until elbows reach 90 degrees.',
        'Push upward through palms back to lockout.'
      ],
      mistakes: ['Descending too deep causing shoulder strain', 'Upright posture shifts all tension to triceps'],
      recommendation: '3-4 sets × 8-12 reps • Rest: 90s',
      safety: 'Do not go past 90 degrees if shoulders feel impinged.'
    },
    {
      id: 'ex_pistol_squat',
      name: 'Pistol Squat (Single Leg)',
      target: 'Legs',
      secondary: ['Glutes', 'Ankles', 'Balance'],
      equipment: 'Bodyweight',
      difficulty: 'Advanced',
      type: 'Calisthenics',
      instructions: [
        'Stand on one leg, extending other leg straight forward.',
        'Reach arms forward for counter-balance.',
        'Squat deep onto standing heel until hamstring touches calf.',
        'Press through mid-foot to stand without dropping elevated foot.'
      ],
      mistakes: ['Heel lifting off floor', 'Collapsing chest forward'],
      recommendation: '3 sets × 5-8 reps per leg • Rest: 90s',
      safety: 'Master elevated box pistol squats before full floor depth.'
    },
    {
      id: 'ex_l_sit',
      name: 'L-Sit Hold (Parallettes / Floor)',
      target: 'Core',
      secondary: ['Triceps', 'Hip Flexors', 'Shoulders'],
      equipment: 'Bodyweight',
      difficulty: 'Advanced',
      type: 'Calisthenics',
      instructions: [
        'Place hands on floor or parallettes beside hips.',
        'Depress shoulders hard into ground to lift hips.',
        'Extend legs straight out parallel to floor in an "L" shape.',
        'Point toes, squeeze quads, and hold.'
      ],
      mistakes: ['Bending knees', 'Shrugging shoulders towards ears'],
      recommendation: '4 sets × 10-20 sec holds • Rest: 60s',
      safety: 'Regress to tucked L-Sit if hip flexors cramp.'
    },
    {
      id: 'ex_muscle_up',
      name: 'Bar Muscle-Up (Mastery Step)',
      target: 'Back',
      secondary: ['Chest', 'Triceps', 'Shoulders', 'Core'],
      equipment: 'Bodyweight',
      difficulty: 'Advanced',
      type: 'Calisthenics',
      instructions: [
        'Start with a false or deep overhand grip.',
        'Execute a powerful, high explosive pull towards upper abdomen.',
        'Transition chest swiftly over the bar.',
        'Press out the top straight bar dip to full lockout.'
      ],
      mistakes: ['Chicken-winging one arm over first', 'Lack of explosive pulling height'],
      recommendation: '3-5 sets × 2-5 reps • Rest: 180s',
      safety: 'Requires mastery of 12+ strict pull-ups and 15+ dips first.'
    },

    // --- YOGA POSES ---
    {
      id: 'ex_mountain_pose',
      name: 'Mountain Pose (Tadasana)',
      target: 'Full Body',
      secondary: ['Core', 'Posture'],
      equipment: 'Mat',
      difficulty: 'Beginner',
      type: 'Yoga',
      instructions: [
        'Stand with big toes touching, heels slightly apart.',
        'Engage quadriceps and lift kneecaps gently.',
        'Lengthen spine, roll shoulders back and down.',
        'Arms at sides, palms facing forward with slow deep breaths.'
      ],
      mistakes: ['Locking knees rigidly', 'Hips jutting forward'],
      recommendation: 'Hold 60-120 seconds • Focus on root grounding',
      safety: 'Distribute weight evenly across both feet.'
    },
    {
      id: 'ex_downward_dog',
      name: 'Downward-Facing Dog (Adho Mukha Svanasana)',
      target: 'Full Body',
      secondary: ['Hamstrings', 'Calves', 'Shoulders', 'Spine'],
      equipment: 'Mat',
      difficulty: 'Beginner',
      type: 'Yoga',
      instructions: [
        'Start on hands and knees, hands slightly ahead of shoulders.',
        'Tuck toes and lift knees, sending sit-bones toward ceiling.',
        'Form an inverted "V" shape, pressing palms firmly into mat.',
        'Pedal heels gently to open calves and hamstrings.'
      ],
      mistakes: ['Rounding back', 'Putting all pressure into wrists'],
      recommendation: 'Hold 60-90 seconds • 5 deep breath cycles',
      safety: 'Bend knees generously if hamstrings feel tight.'
    },
    {
      id: 'ex_childs_pose',
      name: 'Child’s Pose (Balasana)',
      target: 'Back',
      secondary: ['Hips', 'Shoulders', 'Nervous System'],
      equipment: 'Mat',
      difficulty: 'Beginner',
      type: 'Yoga',
      instructions: [
        'Kneel on floor, big toes touching, knees wide as the mat.',
        'Sit hips back onto heels.',
        'Fold forward, extending arms long in front with forehead resting on mat.',
        'Breathe deeply into the back of your ribcage.'
      ],
      mistakes: ['Tensing shoulders', 'Shallow breathing'],
      recommendation: 'Hold 2-3 minutes • Restorative recovery',
      safety: 'Place a blanket under knees if pressure causes discomfort.'
    },
    {
      id: 'ex_warrior_1',
      name: 'Warrior I (Virabhadrasana I)',
      target: 'Legs',
      secondary: ['Hip Flexors', 'Chest', 'Shoulders'],
      equipment: 'Mat',
      difficulty: 'Beginner',
      type: 'Yoga',
      instructions: [
        'Step one foot forward into a lunge with front knee at 90 degrees.',
        'Angle back foot out 45 degrees, pressing outer heel down.',
        'Square hips forward and sweep arms overhead, palms facing.',
        'Gaze gently upward while softening shoulders.'
      ],
      mistakes: ['Front knee drifting past toes', 'Back heel lifting off ground'],
      recommendation: 'Hold 45-60 seconds each side',
      safety: 'Widen your stance horizontally if balance feels unsteady.'
    },
    {
      id: 'ex_warrior_2',
      name: 'Warrior II (Virabhadrasana II)',
      target: 'Legs',
      secondary: ['Hips', 'Groin', 'Shoulders'],
      equipment: 'Mat',
      difficulty: 'Beginner',
      type: 'Yoga',
      instructions: [
        'Wide stance, front foot pointing forward, back foot turned 90 degrees.',
        'Bend front knee deeply, stacking it directly over ankle.',
        'Extend arms parallel to floor in opposite directions.',
        'Gaze with confidence over front middle finger.'
      ],
      mistakes: ['Front knee collapsing inward', 'Torso leaning too far forward'],
      recommendation: 'Hold 45-60 seconds each side',
      safety: 'Track front knee toward the second toe.'
    },
    {
      id: 'ex_tree_pose',
      name: 'Tree Pose (Vrksasana)',
      target: 'Legs',
      secondary: ['Core', 'Balance', 'Ankles'],
      equipment: 'Mat',
      difficulty: 'Beginner',
      type: 'Yoga',
      instructions: [
        'Shift weight onto standing leg and ground foot into mat.',
        'Place sole of opposite foot onto inner calf or inner thigh (never directly on knee).',
        'Bring hands to prayer at heart center or reach them overhead.',
        'Fix gaze on a steady focal point (Drishti).'
      ],
      mistakes: ['Placing foot directly on knee joint', 'Hips sagging to one side'],
      recommendation: 'Hold 45-60 seconds per leg',
      safety: 'Never place foot against the side of the knee joint.'
    },
    {
      id: 'ex_cobra_pose',
      name: 'Cobra Pose (Bhujangasana)',
      target: 'Back',
      secondary: ['Chest', 'Shoulders', 'Abdominals'],
      equipment: 'Mat',
      difficulty: 'Beginner',
      type: 'Yoga',
      instructions: [
        'Lie prone on stomach, tops of feet flat on floor.',
        'Place palms under shoulders with elbows hugging ribs.',
        'Inhale and gently lift chest off floor using back muscles.',
        'Keep neck long and gaze slightly upward.'
      ],
      mistakes: ['Pushing excessively with hands and hyperextending lower back', 'Shoulders bunched up into ears'],
      recommendation: 'Hold 30-45 seconds × 3 cycles',
      safety: 'Keep pubic bone grounded to protect the lumbar spine.'
    },
    {
      id: 'ex_bridge_pose',
      name: 'Bridge Pose (Setu Bandhasana)',
      target: 'Glutes',
      secondary: ['Hamstrings', 'Chest', 'Spine'],
      equipment: 'Mat',
      difficulty: 'Beginner',
      type: 'Yoga',
      instructions: [
        'Lie on back with knees bent, feet flat on floor hip-width apart.',
        'Arms along sides with fingertips skimming heels.',
        'Press feet down and lift hips toward ceiling.',
        'Interlace fingers under back and roll onto shoulders for chest expansion.'
      ],
      mistakes: ['Knees splaying wide apart', 'Turning head side-to-side while lifted'],
      recommendation: 'Hold 45-60 seconds × 3 reps',
      safety: 'Keep head and neck still while in the lifted position.'
    },
    {
      id: 'ex_boat_pose',
      name: 'Boat Pose (Navasana)',
      target: 'Core',
      secondary: ['Hip Flexors', 'Balance'],
      equipment: 'Mat',
      difficulty: 'Intermediate',
      type: 'Yoga',
      instructions: [
        'Sit tall with knees bent, feet flat on floor.',
        'Lean back slightly and lift feet until shins are parallel to floor.',
        'Extend arms forward beside knees or straighten legs into a "V" shape.',
        'Keep spine straight and chest open.'
      ],
      mistakes: ['Collapsing chest into a rounded slouch', 'Holding breath'],
      recommendation: 'Hold 30-45 seconds × 3 sets',
      safety: 'Bend knees into tabletop if lower back strains.'
    },
    {
      id: 'ex_corpse_pose',
      name: 'Corpse Pose (Savasana)',
      target: 'Full Body',
      secondary: ['Nervous System', 'Recovery'],
      equipment: 'Mat',
      difficulty: 'Beginner',
      type: 'Yoga',
      instructions: [
        'Lie flat on back with legs comfortably apart, feet falling naturally outward.',
        'Arms relaxed by sides with palms facing upward.',
        'Close eyes, release all muscular control, and surrender to gravity.',
        'Observe gentle natural breathing for complete nervous relaxation.'
      ],
      mistakes: ['Rushing through or skipping the pose', 'Fidgeting or holding physical tension'],
      recommendation: 'Rest for 5-10 minutes at conclusion of workout',
      safety: 'Place a rolled pillow under knees if lower back feels tight.'
    }
  ],

  // Pre-configured Workout Programs
  workouts: [
    {
      id: 'w_push_day',
      title: 'Push Day (Hypertrophy)',
      category: 'Gym',
      split: 'Push',
      difficulty: 'Intermediate',
      durationMin: 45,
      caloriesBurn: 390,
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      badge: 'Popular',
      description: 'Classic bodybuilding push workout designed to maximize pectoral development and overhead pressing power.',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 8, rest: 90, weight: 75, target: 'Chest' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: 10, rest: 75, weight: 22, target: 'Chest' },
        { name: 'Overhead Barbell Press', sets: 3, reps: 8, rest: 90, weight: 45, target: 'Shoulders' },
        { name: 'Cable Lateral Raise', sets: 4, reps: 15, rest: 45, weight: 9, target: 'Shoulders' },
        { name: 'Cable Triceps Rope Pushdown', sets: 3, reps: 12, rest: 60, weight: 25, target: 'Triceps' }
      ]
    },
    {
      id: 'w_pull_day',
      title: 'Pull Day (Thickness & Width)',
      category: 'Gym',
      split: 'Pull',
      difficulty: 'Intermediate',
      durationMin: 45,
      caloriesBurn: 410,
      targetMuscles: ['Back', 'Biceps', 'Rear Delts'],
      badge: 'Popular',
      description: 'Heavy compound vertical and horizontal pulls for an impressive V-taper and upper back resilience.',
      exercises: [
        { name: 'Conventional Barbell Deadlift', sets: 3, reps: 5, rest: 180, weight: 140, target: 'Back' },
        { name: 'Cable Lat Pulldown', sets: 4, reps: 10, rest: 75, weight: 65, target: 'Back' },
        { name: 'Strict Bodyweight Pull-up', sets: 3, reps: 8, rest: 90, weight: 0, target: 'Back' },
        { name: 'Dumbbell Bicep Curls', sets: 3, reps: 12, rest: 60, weight: 14, target: 'Arms' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 12, rest: 60, weight: 0, target: 'Core' }
      ]
    },
    {
      id: 'w_leg_day',
      title: 'Leg Day (Lower Body Titan)',
      category: 'Gym',
      split: 'Legs',
      difficulty: 'Advanced',
      durationMin: 50,
      caloriesBurn: 480,
      targetMuscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
      badge: 'High Burn',
      description: 'Comprehensive lower body destruction emphasizing barbell squats, leg press volume, and posterior chain RDLs.',
      exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: 8, rest: 150, weight: 100, target: 'Legs' },
        { name: '45-Degree Leg Press', sets: 3, reps: 12, rest: 90, weight: 180, target: 'Legs' },
        { name: 'Dumbbell Romanian Deadlift (RDL)', sets: 4, reps: 10, rest: 90, weight: 26, target: 'Hamstrings' },
        { name: 'Pistol Squat (Single Leg)', sets: 3, reps: 6, rest: 90, weight: 0, target: 'Legs' }
      ]
    },
    {
      id: 'w_upper_body',
      title: 'Upper Body Power & Tone',
      category: 'Gym',
      split: 'Upper',
      difficulty: 'Intermediate',
      durationMin: 45,
      caloriesBurn: 420,
      targetMuscles: ['Chest', 'Back', 'Shoulders', 'Arms'],
      badge: 'Today’s Pick',
      description: 'Balanced upper body stimulus combining primary presses and horizontal pulls for total muscle harmony.',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 8, rest: 90, weight: 75, target: 'Chest' },
        { name: 'Cable Lat Pulldown', sets: 4, reps: 10, rest: 75, weight: 60, target: 'Back' },
        { name: 'Overhead Barbell Press', sets: 3, reps: 8, rest: 90, weight: 45, target: 'Shoulders' },
        { name: 'Cable Triceps Rope Pushdown', sets: 3, reps: 12, rest: 60, weight: 23, target: 'Triceps' },
        { name: 'Dumbbell Bicep Curls', sets: 3, reps: 12, rest: 60, weight: 14, target: 'Biceps' }
      ]
    },
    {
      id: 'w_calisthenics_starter',
      title: 'Calisthenics Foundation Builder',
      category: 'Calisthenics',
      split: 'Bodyweight',
      difficulty: 'Beginner',
      durationMin: 35,
      caloriesBurn: 300,
      targetMuscles: ['Chest', 'Back', 'Core', 'Legs'],
      badge: 'Zero Equipment',
      description: 'Zero weights required. Master pushups, Australian pulls, and core stability to unlock gymnastics strength.',
      exercises: [
        { name: 'Standard Push-up (Progression Step 4)', sets: 4, reps: 12, rest: 60, weight: 0, target: 'Chest' },
        { name: 'Australian Incline Row (Pull Step 2)', sets: 4, reps: 10, rest: 60, weight: 0, target: 'Back' },
        { name: 'Active Dead Hang (Pull Step 1)', sets: 3, reps: 40, rest: 60, weight: 0, target: 'Grip & Back' },
        { name: 'Hanging Leg Raise', sets: 3, reps: 10, rest: 60, weight: 0, target: 'Core' }
      ]
    },
    {
      id: 'w_calisthenics_beast',
      title: 'Calisthenics Elite Warrior',
      category: 'Calisthenics',
      split: 'Advanced Bodyweight',
      difficulty: 'Advanced',
      durationMin: 50,
      caloriesBurn: 440,
      targetMuscles: ['Chest', 'Back', 'Triceps', 'Core'],
      badge: 'Elite',
      description: 'Strict dips, archer push-ups, muscle-up transitions, and relentless L-Sit core tension.',
      exercises: [
        { name: 'Parallel Bar Dips', sets: 4, reps: 12, rest: 75, weight: 0, target: 'Chest & Triceps' },
        { name: 'Strict Bodyweight Pull-up', sets: 4, reps: 8, rest: 90, weight: 0, target: 'Back' },
        { name: 'Archer Push-up (Progression Step 6)', sets: 3, reps: 8, rest: 90, weight: 0, target: 'Chest' },
        { name: 'L-Sit Hold (Parallettes / Floor)', sets: 4, reps: 15, rest: 60, weight: 0, target: 'Core' },
        { name: 'Pistol Squat (Single Leg)', sets: 3, reps: 6, rest: 90, weight: 0, target: 'Legs' }
      ]
    },
    {
      id: 'w_morning_yoga',
      title: 'Morning Awakening & Spine Flow',
      category: 'Yoga',
      split: 'Mobility',
      difficulty: 'Beginner',
      durationMin: 20,
      caloriesBurn: 120,
      targetMuscles: ['Spine', 'Hips', 'Hamstrings', 'Breathing'],
      badge: 'Gentle Energy',
      description: 'Activate your nervous system, align your spinal column, and build tranquil morning energy in 20 minutes.',
      exercises: [
        { name: 'Mountain Pose (Tadasana)', sets: 1, reps: 90, rest: 15, weight: 0, target: 'Postural Alignment' },
        { name: 'Downward-Facing Dog (Adho Mukha Svanasana)', sets: 3, reps: 60, rest: 30, weight: 0, target: 'Hamstrings & Shoulders' },
        { name: 'Warrior I (Virabhadrasana I)', sets: 2, reps: 45, rest: 20, weight: 0, target: 'Hips & Quads' },
        { name: 'Cobra Pose (Bhujangasana)', sets: 3, reps: 45, rest: 20, weight: 0, target: 'Spine & Chest' },
        { name: 'Child’s Pose (Balasana)', sets: 1, reps: 120, rest: 0, weight: 0, target: 'Restoration' }
      ]
    },
    {
      id: 'w_stress_relief_yoga',
      title: 'Deep Stress & Back Relief Yoga',
      category: 'Yoga',
      split: 'Restorative',
      difficulty: 'Beginner',
      durationMin: 25,
      caloriesBurn: 140,
      targetMuscles: ['Lower Back', 'Hips', 'Neck', 'Mind'],
      badge: 'De-Stress',
      description: 'Release accumulated cortisol, lengthen compressed lumbar discs, and calm down overstimulated sympathetic nerves.',
      exercises: [
        { name: 'Child’s Pose (Balasana)', sets: 2, reps: 120, rest: 30, weight: 0, target: 'Back & Hips' },
        { name: 'Downward-Facing Dog (Adho Mukha Svanasana)', sets: 2, reps: 60, rest: 30, weight: 0, target: 'Hamstrings' },
        { name: 'Bridge Pose (Setu Bandhasana)', sets: 3, reps: 45, rest: 30, weight: 0, target: 'Spine & Glutes' },
        { name: 'Corpse Pose (Savasana)', sets: 1, reps: 300, rest: 0, weight: 0, target: 'Nervous System Recovery' }
      ]
    }
  ],

  // Calisthenics Progression Trees
  calisthenicsTrees: [
    {
      id: 'pushup_tree',
      name: 'Push-Up Progression Tree',
      category: 'Push',
      userLevelStep: 4, // Alex is on step 4 (Standard Push-up)
      steps: [
        { step: 1, name: 'Wall Push-up', reps: '3 × 15 reps', unlocked: true, exerciseId: 'ex_wall_pushup' },
        { step: 2, name: 'Incline Push-up', reps: '3 × 12 reps', unlocked: true, exerciseId: 'ex_incline_pushup' },
        { step: 3, name: 'Knee Push-up', reps: '3 × 12 reps', unlocked: true, exerciseId: 'ex_knee_pushup' },
        { step: 4, name: 'Standard Push-up', reps: '4 × 15 reps', unlocked: true, current: true, exerciseId: 'ex_standard_pushup' },
        { step: 5, name: 'Diamond Push-up', reps: '3 × 10 reps', unlocked: false, milestone: 'Next Milestone', exerciseId: 'ex_diamond_pushup' },
        { step: 6, name: 'Archer Push-up', reps: '3 × 8 reps/side', unlocked: false, exerciseId: 'ex_archer_pushup' },
        { step: 7, name: 'One-Arm Push-up', reps: '3 × 5 reps/side', unlocked: false, exerciseId: 'ex_one_arm_pushup' }
      ]
    },
    {
      id: 'pullup_tree',
      name: 'Pull-Up & Muscle-Up Tree',
      category: 'Pull',
      userLevelStep: 4,
      steps: [
        { step: 1, name: 'Active Dead Hang', reps: '60s hold', unlocked: true, exerciseId: 'ex_dead_hang' },
        { step: 2, name: 'Australian Rows', reps: '3 × 12 reps', unlocked: true, exerciseId: 'ex_australian_rows' },
        { step: 3, name: 'Negative Pull-ups', reps: '4 × 5 reps (5s descent)', unlocked: true, exerciseId: 'ex_pullup' },
        { step: 4, name: 'Strict Pull-up', reps: '4 × 8 reps', unlocked: true, current: true, exerciseId: 'ex_pullup' },
        { step: 5, name: 'Chest-to-Bar Pull-up', reps: '3 × 6 reps', unlocked: false, milestone: 'Next Milestone', exerciseId: 'ex_pullup' },
        { step: 6, name: 'Bar Muscle-Up', reps: '3 × 3 reps', unlocked: false, exerciseId: 'ex_muscle_up' }
      ]
    },
    {
      id: 'core_tree',
      name: 'Core & Gymnastics Stability',
      category: 'Core',
      userLevelStep: 2,
      steps: [
        { step: 1, name: 'Hollow Body Hold', reps: '4 × 30s', unlocked: true, exerciseId: 'ex_hanging_leg_raise' },
        { step: 2, name: 'Hanging Knee Raises', reps: '3 × 15 reps', unlocked: true, current: true, exerciseId: 'ex_hanging_leg_raise' },
        { step: 3, name: 'Hanging Straight Leg Raise', reps: '3 × 12 reps', unlocked: false, milestone: 'Next Milestone', exerciseId: 'ex_hanging_leg_raise' },
        { step: 4, name: 'L-Sit on Floor/Bars', reps: '4 × 15s hold', unlocked: false, exerciseId: 'ex_l_sit' }
      ]
    }
  ],

  // Muscle Recovery Status Data
  muscles: {
    chest: { name: 'Chest', recoveryPct: 82, status: 'Recovering', lastTrained: 'Yesterday (Push Day)', recommended: ['Bench Press', 'Push-ups', 'Incline Dumbbell Press', 'Chest Dips'] },
    back: { name: 'Back', recoveryPct: 100, status: 'Ready to Train', lastTrained: '3 days ago', recommended: ['Deadlift', 'Pull-ups', 'Cable Lat Pulldown', 'Barbell Rows'] },
    shoulders: { name: 'Shoulders', recoveryPct: 88, status: 'Recovering', lastTrained: 'Yesterday', recommended: ['Overhead Press', 'Cable Lateral Raise', 'Face Pulls'] },
    biceps: { name: 'Biceps', recoveryPct: 100, status: 'Ready to Train', lastTrained: '3 days ago', recommended: ['Dumbbell Bicep Curls', 'Chin-ups', 'Hammer Curls'] },
    triceps: { name: 'Triceps', recoveryPct: 80, status: 'Recovering', lastTrained: 'Yesterday', recommended: ['Cable Rope Pushdown', 'Dips', 'Skull Crushers'] },
    abs: { name: 'Abs & Core', recoveryPct: 95, status: 'Ready to Train', lastTrained: '2 days ago', recommended: ['Hanging Leg Raise', 'L-Sit', 'Plank', 'Ab Wheel'] },
    glutes: { name: 'Glutes', recoveryPct: 92, status: 'Ready to Train', lastTrained: '4 days ago', recommended: ['Barbell Squats', 'Hip Thrusts', 'Bridge Pose'] },
    quads: { name: 'Quads', recoveryPct: 62, status: 'Fatigued / Resting', lastTrained: 'Today morning', recommended: ['Light Walking', 'Leg Press', 'Pistol Squats'] },
    hamstrings: { name: 'Hamstrings', recoveryPct: 75, status: 'Recovering', lastTrained: 'Yesterday', recommended: ['Romanian Deadlift', 'Hamstring Curls', 'Downward Dog'] },
    calves: { name: 'Calves', recoveryPct: 90, status: 'Ready to Train', lastTrained: '3 days ago', recommended: ['Standing Calf Raises', 'Seated Calf Machine', 'Jump Rope'] }
  },

  // Daily Habits
  habits: [
    { key: 'workout', title: 'Complete Today’s Workout', icon: '💪', streak: 7, completed: true },
    { key: 'water', title: 'Drink 3.0 L Water', icon: '💧', streak: 5, completed: true },
    { key: 'steps', title: 'Walk 8,000 Steps', icon: '👟', streak: 4, completed: false },
    { key: 'sleep', title: 'Sleep 7+ Hours (Restoration)', icon: '😴', streak: 6, completed: true },
    { key: 'stretch', title: '10 Mins Stretching / Mobility', icon: '🧘', streak: 3, completed: false },
    { key: 'meditate', title: 'Mindful Breathing / Meditation', icon: '🧠', streak: 2, completed: true }
  ],

  // Challenges Catalog
  challenges: [
    {
      id: 'c_pushup_7d',
      title: '7-Day Push-up Challenge',
      category: 'Strength',
      totalDays: 7,
      daysCompleted: 5,
      isJoined: true,
      reward: '150 XP + "Iron Chest" Badge',
      description: 'Perform 50 pushups daily (divided across sets) for 7 consecutive days to build explosive chest endurance.',
      dailyTarget: '50 Push-ups total'
    },
    {
      id: 'c_workout_30d',
      title: '30-Day Consistency Streak',
      category: 'Habit',
      totalDays: 30,
      daysCompleted: 14,
      isJoined: true,
      reward: '500 XP + "Consistency King" Badge',
      description: 'Log any workout, yoga flow, or active recovery session for 30 days without breaking the chain.',
      dailyTarget: 'At least 20 min active session'
    },
    {
      id: 'c_steps_10k',
      title: '10,000 Steps Daily Crusher',
      category: 'Endurance',
      totalDays: 14,
      daysCompleted: 8,
      isJoined: false,
      reward: '250 XP + "Cardio Dynamo" Badge',
      description: 'Hit 10K steps every single day to maximize NEAT, burn steady fat, and improve cardiovascular health.',
      dailyTarget: '10,000 steps daily'
    },
    {
      id: 'c_yoga_30d',
      title: '30-Day Zen Yoga Journey',
      category: 'Flexibility',
      totalDays: 30,
      daysCompleted: 0,
      isJoined: false,
      reward: '400 XP + "Zen Master" Badge',
      description: 'Practice 15 minutes of guided morning or evening yoga every day for a supple spine and relaxed mind.',
      dailyTarget: '15 min Yoga Session'
    },
    {
      id: 'c_calisthenics_beast',
      title: 'Calisthenics Beast Challenge',
      category: 'Calisthenics',
      totalDays: 21,
      daysCompleted: 0,
      isJoined: false,
      reward: '350 XP + "Gravity Defier" Badge',
      description: 'Progress from strict pull-ups and dips towards your first bar muscle-up or 30-second L-Sit hold.',
      dailyTarget: 'Complete Calisthenics Routine'
    }
  ],

  // Badges & Achievements
  badges: [
    { id: 'b_first_workout', name: 'First Workout', icon: '🚀', desc: 'Completed your first workout on FITNEXA AI', unlocked: true, date: '14 days ago' },
    { id: 'b_7d_streak', name: '7 Day Streak', icon: '🔥', desc: 'Maintained a 7-day workout and habit streak', unlocked: true, date: 'Yesterday' },
    { id: 'b_10_workouts', name: '10 Workouts Club', icon: '🏋️', desc: 'Completed 10 full workout sessions', unlocked: true, date: '3 days ago' },
    { id: 'b_100_pushups', name: '100 Push-ups', icon: '⚡', desc: 'Accumulated over 100 push-ups logged', unlocked: true, date: '5 days ago' },
    { id: 'b_yoga_beginner', name: 'Yoga Beginner', icon: '🧘', desc: 'Completed your first guided yoga flow', unlocked: true, date: '6 days ago' },
    { id: 'b_calisthenics', name: 'Calisthenics Starter', icon: '🤸', desc: 'Unlocked Level 4 in the Calisthenics Tree', unlocked: true, date: '4 days ago' },
    { id: 'b_consistency_king', name: 'Consistency King', icon: '👑', desc: 'Complete 30 consecutive days of logging', unlocked: false, progress: '14/30 Days' },
    { id: 'b_century_club', name: '100kg Bench Club', icon: '🏆', desc: 'Achieve a 100 kg Bench Press Personal Record', unlocked: false, progress: '95/100 kg' }
  ],

  // Personal Records
  prs: [
    { id: 'pr_bench', exerciseName: 'Barbell Bench Press', currentPr: 95, previousPr: 90, unit: 'kg', delta: '+5 kg', date: '2 days ago' },
    { id: 'pr_squat', exerciseName: 'Barbell Back Squat', currentPr: 130, previousPr: 120, unit: 'kg', delta: '+10 kg', date: '5 days ago' },
    { id: 'pr_deadlift', exerciseName: 'Conventional Deadlift', currentPr: 160, previousPr: 150, unit: 'kg', delta: '+10 kg', date: '10 days ago' },
    { id: 'pr_pullups', exerciseName: 'Strict Pull-ups', currentPr: 16, previousPr: 14, unit: 'reps', delta: '+2 reps', date: '4 days ago' },
    { id: 'pr_pushups', exerciseName: 'Standard Push-ups', currentPr: 45, previousPr: 40, unit: 'reps', delta: '+5 reps', date: '1 week ago' },
    { id: 'pr_plank', exerciseName: 'Plank Hold', currentPr: 180, previousPr: 150, unit: 'sec', delta: '+30 sec', date: '1 week ago' }
  ],

  // Body Measurements History
  measurements: [
    { id: 'm1', recordedAt: new Date(Date.now() - 30 * 86400000).toISOString(), weightKg: 73.6, chestCm: 101, waistCm: 84, armsCm: 36, thighsCm: 57, bodyFatPct: 16.5, notes: 'Starting month baseline' },
    { id: 'm2', recordedAt: new Date(Date.now() - 14 * 86400000).toISOString(), weightKg: 72.9, chestCm: 101.8, waistCm: 83, armsCm: 36.5, thighsCm: 57.5, bodyFatPct: 15.8, notes: 'Waist dropping nicely' },
    { id: 'm3', recordedAt: new Date().toISOString(), weightKg: 72.4, chestCm: 102.5, waistCm: 82, armsCm: 37, thighsCm: 58, bodyFatPct: 15.2, notes: 'New PRs hit this week!' }
  ],

  // Nutrition Defaults & Food Suggestions
  nutrition: {
    goals: { calories: 2400, protein: 160, carbs: 280, fats: 75, waterLiters: 3.0 },
    current: { calories: 2150, protein: 142, carbs: 220, fats: 62, waterLiters: 2.1 },
    meals: {
      breakfast: [
        { name: 'Oatmeal with Whey Protein & Berries', calories: 480, protein: 36, carbs: 64, fat: 8 },
        { name: 'Black Coffee with Honey', calories: 25, protein: 0, carbs: 6, fat: 0 }
      ],
      lunch: [
        { name: 'Grilled Chicken Breast & Jasmine Rice', calories: 650, protein: 52, carbs: 75, fat: 12 },
        { name: 'Steamed Broccoli with Olive Oil', calories: 95, protein: 4, carbs: 8, fat: 5 }
      ],
      dinner: [
        { name: 'Baked Atlantic Salmon with Sweet Potato', calories: 620, protein: 42, carbs: 55, fat: 22 },
        { name: 'Mixed Greens Salad', calories: 80, protein: 2, carbs: 6, fat: 5 }
      ],
      snacks: [
        { name: 'Greek Yogurt with Handful Almonds', calories: 200, protein: 6, carbs: 6, fat: 10 }
      ]
    },
    popularFoods: [
      { name: 'Chicken Breast (200g)', calories: 330, protein: 62, carbs: 0, fat: 7 },
      { name: 'Eggs (3 Whole Large)', calories: 210, protein: 18, carbs: 1.5, fat: 15 },
      { name: 'Whey Protein Scoop (30g)', calories: 120, protein: 24, carbs: 2, fat: 1.5 },
      { name: 'Jasmine Rice (1 Cup Cooked)', calories: 215, protein: 4.5, carbs: 45, fat: 0.5 },
      { name: 'Atlantic Salmon (180g)', calories: 370, protein: 38, carbs: 0, fat: 23 },
      { name: 'Greek Yogurt 0% (200g)', calories: 120, protein: 20, carbs: 8, fat: 0 },
      { name: 'Oats (80g dry)', calories: 300, protein: 11, carbs: 54, fat: 5 },
      { name: 'Banana (Medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 }
    ]
  },

  // Progress Charts Demo Data (7 days, 30 days, 90 days, 1 year)
  chartsData: {
    days7: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weight: [72.8, 72.7, 72.6, 72.5, 72.5, 72.4, 72.4],
      calories: [410, 480, 320, 450, 420, 510, 380],
      duration: [45, 52, 35, 45, 42, 60, 30],
      strength: { bench: [90, 92.5, 92.5, 95, 95, 95, 95], squat: [120, 125, 125, 125, 130, 130, 130] }
    },
    days30: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      weight: [73.6, 73.2, 72.8, 72.4],
      calories: [2450, 2680, 2820, 2970],
      duration: [180, 210, 225, 240],
      strength: { bench: [87.5, 90, 92.5, 95], squat: [115, 120, 125, 130] }
    },
    days90: {
      labels: ['M1', 'M2', 'M3'],
      weight: [75.2, 73.8, 72.4],
      calories: [9800, 11200, 12400],
      duration: [720, 840, 920],
      strength: { bench: [82.5, 87.5, 95], squat: [105, 115, 130] }
    },
    days365: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      weight: [78.0, 76.2, 74.0, 72.4],
      calories: [32000, 36000, 39500, 44000],
      duration: [2400, 2750, 3100, 3450],
      strength: { bench: [75, 82.5, 87.5, 95], squat: [95, 110, 120, 130] }
    }
  }
};

window.FITNEXA_DATA = FITNEXA_DATA;
