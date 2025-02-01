// js/audio.js
export class WorkoutAudio {
    constructor() {
        this.synth = window.speechSynthesis;
        this.isPlaying = false;
        this.currentExercise = null;
    }

    speak(text) {
        if (!this.isPlaying) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        this.synth.speak(utterance);
    }

    startExercise(exercise) {
        this.isPlaying = true;
        this.currentExercise = exercise;
        
        // Announce exercise start
        this.speak(`Starting ${exercise.name}`);
        setTimeout(() => this.speak(exercise.notes), 2000);
        setTimeout(() => this.startRep(1), 4000);
    }

    startRep(repNumber) {
        if (!this.isPlaying) return;
        
        const tempo = this.parseTempoString(this.currentExercise.tempo);
        
        // Announce rep number
        this.speak(`Rep ${repNumber}`);

        // Down phase
        setTimeout(() => {
            this.speak("Down");
            this.countDown(tempo[0]);
        }, 1000);

        // Bottom pause if specified
        if (tempo[1] > 0) {
            setTimeout(() => {
                this.speak("Hold");
                this.countDown(tempo[1]);
            }, 1000 + (tempo[0] * 1000));
        }

        // Up phase
        setTimeout(() => {
            this.speak("Up");
            this.countDown(tempo[2]);
        }, 1000 + ((tempo[0] + tempo[1]) * 1000));

        // Top hold/squeeze
        setTimeout(() => {
            this.speak("Squeeze");
            this.countDown(tempo[3]);
        }, 1000 + ((tempo[0] + tempo[1] + tempo[2]) * 1000));

        // Next rep or finish
        const totalTime = 1000 + ((tempo[0] + tempo[1] + tempo[2] + tempo[3]) * 1000);
        setTimeout(() => {
            if (repNumber < this.currentExercise.reps && this.isPlaying) {
                this.startRep(repNumber + 1);
            } else if (this.isPlaying) {
                this.speak("Set complete");
                this.isPlaying = false;
            }
        }, totalTime);
    }

    parseTempoString(tempo) {
        // Convert tempo string (e.g., "4012") to array of numbers
        return tempo.toString().split('').map(Number);
    }

    countDown(seconds) {
        if (seconds <= 1) return;
        
        let count = seconds - 1;
        const interval = setInterval(() => {
            if (!this.isPlaying || count === 0) {
                clearInterval(interval);
                return;
            }
            this.speak(count.toString());
            count--;
        }, 1000);
    }

    stop() {
        this.isPlaying = false;
        this.synth.cancel();
    }
}

export const workoutAudio = new WorkoutAudio();
