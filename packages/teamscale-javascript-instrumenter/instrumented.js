"use strict";

function cov_104fq7oo4i() {
    var path = "/home/stahlbau/work/develop/teamscale-istanbul-agent/test/casestudies/plain-ts/dist/main.js";
    var hash = "6822844a804c1e9986ac4bd4a45b85893bde8b33";
    var global = new Function("return this")();
    var gcv = "__coverage__";
    var coverageData = {
        path: "/home/stahlbau/work/develop/teamscale-istanbul-agent/test/casestudies/plain-ts/dist/main.js",
        statementMap: {
            "0": {start: {line: 2, column: 19}, end: {line: 8, column: 3}},
            "1": {start: {line: 4, column: 8}, end: {line: 4, column: 25}},
            "2": {start: {line: 5, column: 8}, end: {line: 5, column: 21}},
            "3": {start: {line: 7, column: 4}, end: {line: 7, column: 23}},
            "4": {start: {line: 9, column: 11}, end: {line: 9, column: 39}}
        },
        fnMap: {
            "0": {
                name: "(anonymous_0)",
                decl: {start: {line: 2, column: 19}, end: {line: 2, column: 20}},
                loc: {start: {line: 2, column: 31}, end: {line: 8, column: 1}},
                line: 2
            },
            "1": {
                name: "UserAccount",
                decl: {start: {line: 3, column: 13}, end: {line: 3, column: 24}},
                loc: {start: {line: 3, column: 35}, end: {line: 6, column: 5}},
                line: 3
            }
        },
        branchMap: {},
        s: {"0": 0, "1": 0, "2": 0, "3": 0, "4": 0},
        f: {"0": 0, "1": 0},
        b: {},
        inputSourceMap: {
            version: 3,
            file: "main.js",
            sourceRoot: "",
            sources: ["../src/main.ts"],
            names: [],
            mappings: ";AAKA;IAIE,qBAAY,IAAY,EAAE,EAAU;QAClC,IAAI,CAAC,IAAI,GAAG,IAAI,CAAC;QACjB,IAAI,CAAC,EAAE,GAAG,EAAE,CAAC;IACf,CAAC;IACH,kBAAC;AAAD,CAAC,AARD,IAQC;AAED,IAAM,IAAI,GAAS,IAAI,WAAW,CAAC,QAAQ,EAAE,CAAC,CAAC,CAAC"
        },
        _coverageSchema: "1a1c01bbd47fc00a2c39e90264f33305004495a9",
        hash: "6822844a804c1e9986ac4bd4a45b85893bde8b33"
    };
    var coverage = global[gcv] || (global[gcv] = {});
    if (!coverage[path] || coverage[path].hash !== hash) {
        coverage[path] = coverageData;
    }
    var actualCoverage = coverage[path];
    {// @ts-ignore
        cov_104fq7oo4i = function () {
            return actualCoverage;
        };
    }
    return actualCoverage;
}

cov_104fq7oo4i();
var UserAccount = (cov_104fq7oo4i().s[0]++, function () {
    cov_104fq7oo4i().f[0]++;

    function UserAccount(name, id) {
        cov_104fq7oo4i().f[1]++;
        cov_104fq7oo4i().s[1]++;
        this.name = name;
        cov_104fq7oo4i().s[2]++;
        this.id = id;
    }

    cov_104fq7oo4i().s[3]++;
    return UserAccount;
}());
var user = (cov_104fq7oo4i().s[4]++, new UserAccount("Murphy", 1));//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFLQTtJQUlFLHFCQUFZLElBQVksRUFBRSxFQUFVO1FBQ2xDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFFRCxJQUFNLElBQUksR0FBUyxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMifQ==
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7MkZBS0EsR0FBQSxDQUFBLFdBQUEsMEJBQUEsVUFBQSx5QkFJRSxRQUFBLENBQUEsV0FBQSxDQUFZLElBQVosQ0FBMEIsRUFBMUIsQ0FBb0MsaURBQ2xDLEtBQUssSUFBTCxDQUFZLElBQVosQ0FEa0Msd0JBRWxDLEtBQUssRUFBTCxDQUFVLEVBQVYsQ0FDRCxDQVBILHdCQVFBLE1BQUEsQ0FBQSxXQUFBLENBQUMsQ0FSRCxFQUFBLENBQUEsQ0FVQSxHQUFNLENBQUEsSUFBSSwwQkFBUyxHQUFJLENBQUEsV0FBSixDQUFnQixRQUFoQixDQUEwQixDQUExQixDQUFULENBQVYsQyIsInNvdXJjZVJvb3QiOiIifQ==