export class Debounce {
  private timerToken: number | null = null;

  constructor(private milliseconds: number, private onBounce: () => void) {}

  input() {
    this.reset();
    this.timerToken = self.setTimeout(() => {
      this.timerToken = null;
      this.onBounce();
    }, this.milliseconds);
  }

  reset() {
    if (this.timerToken === null) {
      return;
    }
    self.clearTimeout(this.timerToken);
    this.timerToken = null;
  }
}

