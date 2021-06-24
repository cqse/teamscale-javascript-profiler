import {universe} from "./utils";

const STATEMENT_COVERAGE_ID = "s";

class Interceptor implements ProxyHandler<any> {

  constructor(private coverageObj: any, private targetObj: any, private path: any) { }

  get(target: any, prop: any, receiver: any): any {
    const value = target[prop];
    if (value !== Object(value)) {
      // Extract the primitive value
      return value;
    }
    return makeProxy(this.coverageObj, value, [...this.path, prop]);
  }

  set(obj: any, prop: any, value: any): boolean {
    const fullPath = [...this.path, prop];
    // Handle "Statement" coverage
    if (fullPath[0] === STATEMENT_COVERAGE_ID) {
      const fileId = this.coverageObj.hash;
      const start = this.coverageObj.statementMap[fullPath[1]].start;
      universe()['_$Bc'](fileId, start.line, start.column);
    }
    return true;
  }

}

export function makeProxy(coverage: any, target: any, path: any) {
  return new Proxy(target, new Interceptor(coverage, target, path));
}

