// js/database.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, query, where, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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
const auth = getAuth(app);

// Database functions
export const Database = {
    async getProgram(programId) {
        try {
            const programDoc = await getDoc(doc(db, 'programs', programId));
            if (programDoc.exists()) {
                return programDoc.data();
            }
            return null;
        } catch (error) {
            console.error("Error getting program:", error);
            throw error;
        }
    },

    async getWorkout(programId, week, day) {
        try {
            const workoutsRef = collection(db, 'workouts');
            const q = query(
                workoutsRef, 
                where('programId', '==', programId),
                where('week', '==', parseInt(week)),
                where('day', '==', parseInt(day))
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs[0]?.data() || null;
        } catch (error) {
            console.error("Error getting workout:", error);
            throw error;
        }
    },

    async saveProgress(exerciseData) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            return await addDoc(collection(db, 'progress'), {
                userId: user.uid,
                ...exerciseData,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving progress:", error);
            throw error;
        }
    },

    async initializeWorkoutData() {
        try {
            // Initialize Muscle Builder Program
            await addDoc(collection(db, 'programs'), {
                id: 'muscle-builder',
                name: 'Muscle Builder',
                level: 'Intermediate',
                blocks: 2,
                weeksPerBlock: 4,
                description: 'Build muscle, size, and strength'
            });

            // Initialize Full Body Athlete Program
            await addDoc(collection(db, 'programs'), {
                id: 'full-body',
                name: 'Full Body Athlete',
                level: 'Advanced',
                totalWeeks: '16-22',
                phases: [
                    '6-8 Week Stimulation Phase',
                    '4-6 Week HIIT Neurological Phase',
                    '6-8 Week Giant Sets Intensity'
                ],
                description: 'Push your fitness results to the next level'
            });

            // Add sample workout data
            // You can add more detailed workout data here
            console.log('Initial workout data loaded successfully');
        } catch (error) {
            console.error("Error initializing workout data:", error);
            throw error;
        }
    },

    async getUserProgress(exerciseId) {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const progressRef = collection(db, 'progress');
            const q = query(
                progressRef,
                where('userId', '==', user.uid),
                where('exerciseId', '==', exerciseId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error getting user progress:", error);
            throw error;
        }
    }
};

// Initialize workout data if needed
const initializeData = async () => {
    try {
        const programDoc = await getDoc(doc(db, 'programs', 'muscle-builder'));
        if (!programDoc.exists()) {
            await Database.initializeWorkoutData();
        }
    } catch (error) {
        console.error("Error checking/initializing data:", error);
    }
};

initializeData();

export default Database;
