// js/initializeDatabase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, doc, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD6VXHNZ24qJ2YaScWFgbnHXtl7uIaS4u8",
    authDomain: "workout-9135b.firebaseapp.com",
    projectId: "workout-9135b",
    storageBucket: "workout-9135b.firebasestorage.app",
    messagingSenderId: "801718631070",
    appId: "1:801718631070:web:eff3613dbf8444ac92598f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const warmupRoutine = {
    exercises: [
        {
            name: "Side-to-side twists",
            sets: 1,
            reps: 10,
            rest: 0,
            notes: "In a controlled movement rotate your upper torso at your hips from side-to-side."
        },
        {
            name: "Side bends",
            sets: 1,
            reps: 10,
            rest: 0,
            notes: "In a controlled side bend movement push one hand at a time down the side of your leg toward your ankle"
        },
        // Add all warmup exercises from the PDF
    ]
};

const cooldownRoutine = {
    exercises: [
        {
            name: "Chest stretch",
            sets: 1,
            duration: "30 sec",
            rest: 0,
            notes: "Interlock hands behind back, pull hands up, retract shoulders"
        },
        // Add all cooldown exercises from the PDF
    ]
};

const muscleBuilderBlock1Week1 = {
    day1: {
        type: "CHEST AND BACK",
        exercises: [
            {
                name: "TRX Chest Press",
                sets: 2,
                reps: "6-8",
                rpe: 7,
                rest: "0min",
                notes: "Tuck elbows at 45°, keep shoulder blades contracted together, focus on squeezing your chest muscles together to push-up",
                tempo: "4012"
            },
            {
                name: "TRX Y's",
                sets: 2,
                reps: "4-8",
                rpe: 7,
                rest: "2min",
                notes: "Focus on squeezing your shoulder blades and rear shoulders together, push elbows up and out",
                tempo: "4012"
            },
            // Add all exercises for day 1
        ],
        warmup: warmupRoutine,
        cooldown: cooldownRoutine
    },
    // Add days 2 and 3
};

async function clearExistingData() {
    const collections = ['programs', 'workouts', 'exercises', 'warmups', 'cooldowns'];
    for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
    }
}

async function populateDatabase() {
    try {
        console.log("Starting database population...");
        
        // Clear existing data
        await clearExistingData();
        console.log("Cleared existing data");

        // Add programs
        await setDoc(doc(db, "programs", "muscle-builder"), {
            name: "Muscle Builder",
            type: "intermediate",
            blocks: 2,
            weeksPerBlock: 4,
            daysPerWeek: 3,
            startDate: "2025-02-03",
            description: "Build muscle, size, and strength"
        });

        await setDoc(doc(db, "programs", "full-body-athlete"), {
            name: "Full Body Athlete",
            type: "advanced",
            phases: [
                {
                    name: "Stimulation Phase",
                    duration: "6-8 weeks"
                },
                {
                    name: "HIIT Neurological Phase",
                    duration: "4-6 weeks"
                },
                {
                    name: "Giant Sets Intensity",
                    duration: "6-8 weeks"
                }
            ],
            startDate: "2025-02-03",
            description: "Push your fitness results to the next level"
        });

        // Add warmup and cooldown routines
        await setDoc(doc(db, "warmups", "default"), warmupRoutine);
        await setDoc(doc(db, "cooldowns", "default"), cooldownRoutine);

        // Add Muscle Builder Block 1 Week 1
        await setDoc(doc(db, "workouts", "mb-b1-w1-d1"), {
            programId: "muscle-builder",
            block: 1,
            week: 1,
            day: 1,
            ...muscleBuilderBlock1.day1
        });

        // Continue with all weeks and blocks...

        console.log("Database population completed successfully!");
    } catch (error) {
        console.error("Error populating database:", error);
    }
}

// Add button to HTML to trigger population
const button = document.createElement('button');
button.textContent = 'Populate Database';
button.className = 'bg-blue-500 text-white px-4 py-2 rounded';
button.onclick = populateDatabase;
document.body.appendChild(button);
