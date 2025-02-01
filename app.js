// js/app.js
import { workoutAudio } from './audio.js';
import { workoutManager } from './workouts.js';

class App {
    constructor() {
        this.currentWorkout = null;
        this.currentExercise = null;
        this.initializeElements();
        this.addEventListeners();
        this.startCountdown();
    }

    initializeElements() {
        // Program selection elements
        this.programSelect = document.getElementById('programSelect');
        this.weekSelect = document.getElementById('weekSelect');
        this.daySelect = document.getElementById('daySelect');

        // Exercise display elements
        this.exerciseDisplay = document.getElementById('currentExercise');
        this.exerciseName = document.getElementById('exerciseName');
        this.exerciseNotes = document.getElementById('exerciseNotes');
        this.exerciseSets = document.getElementById('exerciseSets');
        this.exerciseReps = document.getElementById('exerciseReps');
        this.exerciseTempo = document.getElementById('exerciseTempo');
        this.exerciseRest = document.getElementById('exerciseRest');

        // Control buttons
        this.startButton = document.getElementById('startExercise');
        this.stopButton = document.getElementById('stopExercise');

        // Exercise list
        this.exerciseList = document.getElementById('exerciseList');
    }

    addEventListeners() {
        // Program selection handlers
        this.programSelect.addEventListener('change', () => this.handleProgramChange());
        this.weekSelect.addEventListener('change', () => this.handleWeekChange());
        this.daySelect.addEventListener('change', () => this.handleDayChange());

        // Exercise control handlers
        this.startButton.addEventListener('click', () => this.startCurrentExercise());
        this.stopButton.addEventListener('click', () => this.stopCurrentExercise());
    }

    async handleProgramChange() {
        const programId = this.programSelect.value;
        if (!programId) return;

        // Enable and populate week select
        this.weekSelect.disabled = false;
        this.weekSelect.innerHTML = '<option value="">Select week...</option>';
        
        const weeks = workoutManager.getWeeksForProgram(programId);
        for (let i = 1; i <= weeks; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Week ${i}`;
            this.weekSelect.appendChild(option);
        }

        // Reset day select
        this.daySelect.innerHTML = '<option value="">Select day...</option>';
        this.daySelect.disabled = true;
    }

    async handleWeekChange() {
        const programId = this.programSelect.value;
        const week = this.weekSelect.value;
        if (!week) return;

        // Enable and populate day select
        this.daySelect.disabled = false;
        this.daySelect.innerHTML = '<option value="">Select day...</option>';
        
        const days = workoutManager.getDaysForProgram(programId);
        for (let i = 1; i <= days; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Day ${i}`;
            this.daySelect.appendChild(option);
        }
    }

    async handleDayChange() {
        const programId = this.programSelect.value;
        const week = this.weekSelect.value;
        const day = this.daySelect.value;
        if (!day) return;

        try {
            // Load workout data
            this.currentWorkout = await workoutManager.getWorkout(programId, week, day);
            this.displayWorkout();
        } catch (error) {
            console.error('Error loading workout:', error);
            alert('Error loading workout data');
        }
    }

    displayWorkout() {
        if (!this.currentWorkout) return;

        // Clear existing exercise list
        this.exerciseList.innerHTML = '';

        // Display warmup if available
        if (this.currentWorkout.warmup) {
            this.addSectionToList('Warm Up', this.currentWorkout.warmup.exercises);
        }

        // Display main exercises
        this.addSectionToList('Main Workout', this.currentWorkout.exercises);

        // Display cooldown if available
        if (this.currentWorkout.cooldown) {
            this.addSectionToList('Cool Down', this.currentWorkout.cooldown.exercises);
        }
    }

    addSectionToList(title, exercises) {
        const section = document.createElement('div');
        section.className = 'mb-6';
        
        const heading = document.createElement('h3');
        heading.className = 'text-xl font-bold mb-4';
        heading.textContent = title;
        section.appendChild(heading);

        exercises.forEach((exercise, index) => {
            const exerciseElement = this.createExerciseElement(exercise, index);
            section.appendChild(exerciseElement);
        });

        this.exerciseList.appendChild(section);
    }

    createExerciseElement(exercise, index) {
        const div = document.createElement('div');
        div.className = 'bg-gray-50 p-4 rounded-lg mb-4 cursor-pointer hover:bg-gray-100';
        div.onclick = () => this.selectExercise(exercise);

        div.innerHTML = `
            <div class="flex justify-between items-center">
                <h4 class="font-semibold">${exercise.name}</h4>
                <span class="text-sm text-gray-600">
                    ${exercise.sets} × ${exercise.reps}
                </span>
            </div>
            <p class="text-sm text-gray-600 mt-2">${exercise.notes || ''}</p>
            <div class="text-sm text-gray-500 mt-2">
                Tempo: ${exercise.tempo || '222'} | Rest: ${exercise.rest || '40sec'}
            </div>
        `;

        return div;
    }

    selectExercise(exercise) {
        this.currentExercise = exercise;
        this.exerciseName.textContent = exercise.name;
        this.exerciseNotes.textContent = exercise.notes || '';
        this.exerciseSets.textContent = exercise.sets;
        this.exerciseReps.textContent = exercise.reps;
        this.exerciseTempo.textContent = exercise.tempo || '222';
        this.exerciseRest.textContent = exercise.rest || '40sec';
        
        this.exerciseDisplay.classList.remove('hidden');
    }

    startCurrentExercise() {
        if (!this.currentExercise) return;
        workoutAudio.startExercise(this.currentExercise);
        this.startButton.disabled = true;
    }

    stopCurrentExercise() {
        workoutAudio.stop();
        this.startButton.disabled = false;
    }

    startCountdown() {
        const startDate = new Date('2025-02-03T00:00:00');
        const updateCountdown = () => {
            const now = new Date();
            const difference = startDate - now;

            if (difference <= 0) {
                document.getElementById('countdownTimer').textContent = 'Program Started!';
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            document.getElementById('countdownTimer').textContent = 
                `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        setInterval(updateCountdown, 1000);
        updateCountdown();
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
