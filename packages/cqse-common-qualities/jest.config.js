module.exports = {
  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The test environment that will be used for testing
  testEnvironment: "node",

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // This option allows use of a custom test runner
  // testRunner: "jasmine2",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,
    
  // The glob patterns Jest uses to detect test files. 
  testMatch: ['**/test/**/*.test.(ts|js)'],

};
