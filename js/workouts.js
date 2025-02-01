// js/workouts.js
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

export class WorkoutManager {
    constructor() {
        this.db = getFirestore();
    }

    async getPrograms() {
        const programsRef = collection(this.db, "programs");
        const snapshot = await getDocs(programsRef);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    async getWorkout(programId, week, day) {
        const workoutsRef = collection(this.db, "workouts");
        const q = query(
            workoutsRef,
            where("programId", "==", programId),
            where("week", "==", parseInt(week)),
            where("day", "==", parseInt(day))
        );
        const snapshot = await getDocs(q);
        return snapshot.docs[0]?.data();
    }

    async getWarmup() {
        const warmupDoc = await getDocs(collection(this.db, "warmups"));
        return warmupDoc.docs[0]?.data();
    }

    async getCooldown() {
        const cooldownDoc = await getDocs(collection(this.db, "cooldowns"));
        return cooldownDoc.docs[0]?.data();
    }

    getWeeksForProgram(programId) {
        // Return appropriate number of weeks based on program
        return programId === "muscle-builder" ? 8 : 22;
    }

    getDaysForProgram(programId) {
        // Both programs have 3 days per week
        return 3;
    }
}

export const workoutManager = new WorkoutManager();
