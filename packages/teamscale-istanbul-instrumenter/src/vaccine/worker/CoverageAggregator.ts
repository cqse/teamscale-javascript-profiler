import { CachingSocket } from "./CachingSocket";

/**
 * Is supposed to exist once per app and might deal with
 * different JavaScript files that were instrumented upfront.
 */
export class CoverageAggregator {

  private socket: CachingSocket;
  private cachedCoveredPositions: Map<string, Set<string>>;
  private numberOfCachedPositions: number;
  private debounce: Debounce;

  constructor(socket: CachingSocket) {
    this.socket = socket;
    this.cachedCoveredPositions = new Map();
    this.numberOfCachedPositions = 0;
    this.debounce = new Debounce(1000, () => this.flush());
  }

  add(positionCoverageInfo: string) {
    const parts = positionCoverageInfo.split(":");
    if (parts.length != 3) {
      return;
    }

    const [fileId, line, column] = parts;
    let coveredPositions: Set<string>|undefined = this.cachedCoveredPositions.get(fileId);
    if (!coveredPositions) {
      coveredPositions = new Set();
      this.cachedCoveredPositions.set(fileId, coveredPositions);
    }
    coveredPositions.add(`${line}:${column}`);

    this.numberOfCachedPositions += 1;
    this.debounce.input();
    if (this.numberOfCachedPositions >= 20) {
      this.flush();
    }
  }

  flush() {
    if (this.numberOfCachedPositions == 0) {
      return;
    }

    this.debounce.reset();
    this.cachedCoveredPositions.forEach((positionSet, fileId) => {
      this.socket.send(`c ${fileId} ${Array.from(positionSet).join(" ")}`);
    });

    this.cachedCoveredPositions = new Map();
    this.numberOfCachedPositions = 0;
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

