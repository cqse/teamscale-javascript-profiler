/**
 * Countdown that can be reset to start counting from 0.
 */
export class Countdown {
    /**
     * The timer handle.
     */
    private timerHandle: number | null = null;

    /**
     * Constructor.
     *
     * @param milliseconds - The duration of the countdown in milliseconds.
     * @param onCountedToZero - The action to execute when the countdown reaches 0.
     */
    constructor(private milliseconds: number, private onCountedToZero: () => void) {}

    /**
     * Restart the countdown.
     */
    restartCountdown(): void {
        this.stopCountdown();
        this.timerHandle = self.setTimeout(() => {
            this.stopCountdown();
            this.onCountedToZero();
        }, this.milliseconds);
    }

    /**
     * Stop the countdown.
     */
    stopCountdown(): void {
        if (this.timerHandle === null) {
            return;
        }
        self.clearTimeout(this.timerHandle);
        this.timerHandle = null;
    }
}