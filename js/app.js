// js/app.js
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const db = getFirestore();
    const programSelect = document.getElementById('programSelect');
    const weekSelect = document.getElementById('weekSelect');
    const daySelect = document.getElementById('daySelect');
    const exerciseItems = document.getElementById('exerciseItems');
    const exerciseDisplay = document.getElementById('exerciseDisplay');

    // Audio setup
    let audioContext;
    let currentExercise = null;
    let exerciseInterval = null;
    const speechSynthesis = window.speechSynthesis;

    function initAudio() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    function speakText(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower than default
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    }

    function startTempoCount(tempo) {
        if (!tempo) return;
        
        // Parse tempo string (e.g., "4012")
        const [eccentric, bottomHold, concentric, topHold] = tempo.split('').map(Number);
        let phase = 'eccentric';
        let count = eccentric;

        clearInterval(exerciseInterval);
        
        exerciseInterval = setInterval(() => {
            if (count > 0) {
                speakText(count.toString());
                count--;
            } else {
                switch(phase) {
                    case 'eccentric':
                        phase = 'bottomHold';
                        count = bottomHold;
                        if (bottomHold > 0) speakText('Hold bottom');
                        break;
                    case 'bottomHold':
                        phase = 'concentric';
                        count = concentric;
                        speakText('Push up');
                        break;
                    case 'concentric':
                        phase = 'topHold';
                        count = topHold;
                        if (topHold > 0) speakText('Hold top');
                        break;
                    case 'topHold':
                        phase = 'eccentric';
                        count = eccentric;
                        speakText('Lower down');
                        break;
                }
            }
        }, 1000);
    }

    function stopTempoCount() {
        clearInterval(exerciseInterval);
        speechSynthesis.cancel();
    }

    async function loadWorkout(programId, week, day) {
        try {
            const workoutsRef = collection(db, "workouts");
            const q = query(workoutsRef, 
                where("programId", "==", programId),
                where("week", "==", parseInt(week)),
                where("day", "==", parseInt(day))
            );

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const workoutData = querySnapshot.docs[0].data();
                displayWorkout(workoutData);
            }
        } catch (error) {
            console.error("Error loading workout:", error);
        }
    }

    function displayWorkout(workout) {
        if (!workout || !workout.exercises) return;

        exerciseItems.innerHTML = '';
        workout.exercises.forEach((exercise, index) => {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.className = 'exercise-item p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100';
            exerciseDiv.innerHTML = `
                <h3 class="font-bold">${exercise.name}</h3>
                <p>Sets: ${exercise.sets} | Reps: ${exercise.reps}</p>
                <p>Tempo: ${exercise.tempo} | Rest: ${exercise.rest}</p>
            `;
            
            exerciseDiv.addEventListener('click', () => selectExercise(exercise));
            exerciseItems.appendChild(exerciseDiv);
        });
    }

    function selectExercise(exercise) {
        currentExercise = exercise;
        exerciseDisplay.classList.remove('hidden');
        
        document.getElementById('exerciseName').textContent = exercise.name;
        document.getElementById('exerciseNotes').textContent = exercise.notes || '';
        document.getElementById('exerciseSets').textContent = exercise.sets;
        document.getElementById('exerciseReps').textContent = exercise.reps;
        document.getElementById('exerciseTempo').textContent = exercise.tempo;
        document.getElementById('exerciseRest').textContent = exercise.rest;

        // Announce exercise selection
        speakText(`Selected exercise: ${exercise.name}`);
    }

    // Event Listeners
    programSelect.addEventListener('change', () => {
        const program = programSelect.value;
        if (!program) return;

        weekSelect.disabled = false;
        weekSelect.innerHTML = '<option value="">Select Week</option>';
        
        const weekCount = program === 'muscle-builder' ? 8 : 16;
        for (let i = 1; i <= weekCount; i++) {
            weekSelect.innerHTML += `<option value="${i}">Week ${i}</option>`;
        }
        
        daySelect.disabled = true;
        daySelect.innerHTML = '<option value="">Select Day</option>';
    });

    weekSelect.addEventListener('change', () => {
        const week = weekSelect.value;
        if (!week) return;

        daySelect.disabled = false;
        daySelect.innerHTML = '<option value="">Select Day</option>';
        
        for (let i = 1; i <= 3; i++) {
            daySelect.innerHTML += `<option value="${i}">Day ${i}</option>`;
        }
    });

    daySelect.addEventListener('change', () => {
        const program = programSelect.value;
        const week = weekSelect.value;
        const day = daySelect.value;
        
        if (program && week && day) {
            loadWorkout(program, week, day);
        }
    });

    // Start/Stop Exercise buttons
    document.getElementById('startExercise').addEventListener('click', () => {
        if (!currentExercise) return;
        
        // Initialize audio context on first user interaction
        if (!audioContext) {
            initAudio();
        }

        // Announce exercise start
        speakText(`Starting ${currentExercise.name}`);
        speakText(`Perform ${currentExercise.reps} reps`);
        speakText(`Tempo is ${currentExercise.tempo}`);
        
        // Start tempo counting
        setTimeout(() => {
            startTempoCount(currentExercise.tempo);
        }, 2000);
    });

    document.getElementById('stopExercise').addEventListener('click', () => {
        stopTempoCount();
        speakText("Exercise stopped");
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        stopTempoCount();
        if (audioContext) {
            audioContext.close();
        }
    });
});
