function makeProxy(coverage, target, path) {
  const handler = {
    get: function (target, prop, receiver) {
      var value = target[prop];
      if (value !== Object(value)) {
        // primitive
        return value;
      }
      return makeProxy(coverage, value, [...path, prop]);
    },
    set: function (obj, prop, value) {
      const fullPath = [...path, prop];
      if (fullPath[0] === "s") {
        var start = coverage.statementMap[fullPath[1]].start;
        _$Bc("" + start.line, "" + start.column);
      }
    },
  };

  return new Proxy(target, handler);
}

