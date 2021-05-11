import { CachingSocket } from "./CachingSocket";

export class CoverageAggregator {

  private cachedCoverage: string = "";
  private numberOfCacheLines = 0;
  private debounce = new Debounce(1000, () => this.flush());

  constructor(private socket: CachingSocket) {}

  add(coveredLine: string) {
    this.cachedCoverage += coveredLine + "\n";
    this.numberOfCacheLines += 1;
    this.debounce.input();
    if (this.numberOfCacheLines >= 20) {
      this.flush();
    }
  }

  flush() {
    if (this.numberOfCacheLines == 0) {
      return;
    }
    this.debounce.reset();
    this.socket.send('c' + this.cachedCoverage);
    this.cachedCoverage = "";
    this.numberOfCacheLines = 0;
  }
}

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

