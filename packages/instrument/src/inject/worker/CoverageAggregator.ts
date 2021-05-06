import { CachingSocket } from "./CachingSocket";
import { Debounce } from "./debounce";

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
