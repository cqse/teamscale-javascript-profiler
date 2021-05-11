class Interceptor implements ProxyHandler<any> {

  constructor(private coverageObj: any, private targetObj: any, private path: any) { }

  get(target: any, prop: any, receiver: any): any {
    const value = target[prop];
    if (value !== Object(value)) {
      // primitive
      return value;
    }
    return makeProxy(this.coverageObj, value, [...this.path, prop]);
  }

  set(obj: any, prop: any, value: any): boolean {
    const fullPath = [...this.path, prop];
    if (fullPath[0] === "s") {
      const start = this.coverageObj.statementMap[fullPath[1]].start;
      (window as any)['_$Bc']("" + start.line, "" + start.column);
    }
    return true;
  }

}

function makeProxy(coverage: any, target: any, path: any) {
  return new Proxy(target, new Interceptor(coverage, target, path));
}

