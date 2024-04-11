# Developer Guideline

## Development Environment

- IntelliJ Ultimate (https://www.jetbrains.com/idea/)
- NodeJs (https://nodejs.org/)
- pnpm (https://pnpm.io/installation)

## First Steps

1. Clone the Git repository 
2. Install all dependencies with `pnpm install`
3. Build all packages `pnpm build`

## Repository Structure

This is a mono repository that consists of different Node packages.

### `/packages`

For each package, we have a separate folder in `/packages`.
There is a `README.md` in the root folder of each package that
describes the packages' purpose. 

We also recommend to read the different `package.json` definition files of 
each package to get a better understanding of how the code is built, tested, and deployed.

### `/decisions`

We have documented central design decisions with corresponding architecture 
decision documents; new documents shall be added for all critical decisions.

### `/patches`

To address security issues or do other adjustments to packages we depend 
on we use the dependency patch feature provided by pnpm.
See https://pnpm.io/package_json#pnpmpatcheddependencies.
The actual patch files are placed into the `/patches` folder.

### `/tests`

Data for system and integration tests can be found in the
`/tests` folder. Furthermore, tests across our packages, that is,
some integration tests and all system tests can be found there.

## Testing

Each package in `/packages` has its own test suite (with unit/integration/system tests).
Tests for a single package can be started using `pnpm test` in the 
package's root directory. Running `pnpm test` at the root directory of the 
mono repository runs the test suite of all packages.

System tests on JavaScript Profiler level are executed via `pnpm systemtests` from the
root directory of the repository; they are defined in the `/test` folder.
