import LocalWebServer from 'local-web-server';
import cypress from 'cypress';
import { execSync, spawn } from 'child_process';
import path from 'path';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import ServerMock from 'mock-http-server';

/**
 * Definition of the case studies along with
 * the expected coverage produced by our tool chain.
 */
const caseStudies = [
	{
		name: 'vite-react-ts-coverable-app',
		rootDir: 'test/casestudies/vite-react-ts-coverable-app',
		distDir: 'dist',
		expectCoveredLines: {
			'../../src/App.tsx': [6, 11, 23, 27, 32, 33, 34]
		},
		expectUncoveredLines: {},
		excludeOrigins: [],
		includeOrigins: ['../../src/**/*.*']
	},
	{
		name: 'vite-react-app',
		rootDir: 'test/casestudies/vite-react-app',
		distDir: 'dist',
		expectCoveredLines: {
			'../../src/App.jsx': [6, 14]
		},
		expectUncoveredLines: {},
		excludeOrigins: [],
		includeOrigins: ['../../src/**/*.*']
	},
	{
		name: 'angular-hero-app',
		rootDir: 'test/casestudies/angular-hero-app',
		distDir: 'dist',
		expectCoveredLines: {
			'src/app/heroes/heroes.component.ts': [11, 12, 22, 35, 36],
			'src/app/hero-detail/hero-detail.component.ts': [23, 27, 28, 29]
		},
		expectUncoveredLines: {
			'node_modules/zone.js/fesm2015/zone.js': ['1-30', '70-90', 28, 20, 80],
			'src/app/heroes/heroes.component.ts': ['1-10', 15, 16, '18-20', '37-50'],
			'src/app/hero-detail/hero-detail.component.ts': [33]
		},
		excludeOrigins: [],
		includeOrigins: ['src/app/**/*.*']
	}
	// {
	// 	// The following system test does not work.
	// 	// Ticket `TS-30734` should address this.
	// 	//
	//
	// 	name: 'angular-hero-app-with-excludes',
	// 	rootDir: 'test/casestudies/angular-hero-app',
	// 	distDir: 'dist',
	// 	expectCoveredLines: {
	// 		'src/app/hero-detail/hero-detail.component.ts': [13, 17, 18, 19]
	// 	},
	// 	expectUncoveredLines: {
	// 		'src/app/heroes/heroes.component.ts': [11, 12, 22, 35, 36],
	// 		'node_modules/zone.js/fesm2015/zone.js': [17, 90, 28, 1054]
	// 	},
	// 	excludeOrigins: ['src/app/heroes/*.*', 'src/app/heroes/*.*.*', 'node_modules/**/*.*'],
	// 	includeOrigins: []
	// }
];

const INSTRUMENTER_DIR = 'packages/teamscale-javascript-instrumenter';
const COLLECTOR_DIR = 'packages/teamscale-coverage-collector';
const SERVER_PORT = 9000;
const TEAMSCALE_MOCK_PORT = 10088;

/**
 * Load coverage from a file in the simple coverage format to an object
 * of type Record<string, Set<number>>.
 */
function loadFromSimpleCoverage(filename) {
	const lines = fs.readFileSync(filename, 'utf8').split('\n');

	const result = {}; // Map<string, Set<number>>
	let activeSubject = null;

	const isCoveredLineNum = line => /^[\d]+$/.test(line);
	const isCoverageSubject = line => !isCoveredLineNum(line);

	for (const line of lines) {
		if (line.trim().length === 0) {
			continue;
		}

		if (isCoverageSubject(line)) {
			activeSubject = line;
			result[activeSubject] = new Set();
		} else if (activeSubject === null) {
			throw new Error('File must start with a coverage subject!');
		} else if (isCoveredLineNum(line)) {
			result[activeSubject].add(Number.parseInt(line));
		}
	}

	return result;
}

/**
 * Parse the coverage information from the test definition
 * to a map with the type Record<string, Set<number>>.
 */
function loadFromCoverageDict(dict) {
	const result = {};
	if (!dict) {
		throw new Error('Coverage dict is not defined!');
	}

	for (const [key, value] of Object.entries(dict)) {
		result[key] = new Set();
		for (const covered of value) {
			if (typeof covered === 'number') {
				result[key].add(covered);
			} else if (typeof covered === 'string') {
				const range = covered.split('-');
				for (let lineNo = range[0]; lineNo < range[1]; lineNo++) {
					result[key].add(lineNo);
				}
			}
		}
	}

	return result;
}

/**
 * Returns the set of lines, by subject, that are not expected to be covered but were.
 */
function identifyUnexpectedButPresent(actual, unexpected) {
	const result = {};

	for (const [subject, unexpectedLineSet] of Object.entries(unexpected)) {
		const actualLineSet = actual[subject] ?? new Set();
		for (const unexpectedLine of unexpectedLineSet) {
			if (actualLineSet.has(unexpectedLine)) {
				result[subject] = result[subject] ?? new Set();
				result[subject].add(unexpectedLine);
			}
		}
	}

	return result;
}

/**
 * Returns the set of lines, by subject, that are expected to be covered but were not.
 */
function identifyExpectedButAbsent(actual, expected) {
	const result = {};

	for (const [subject, expectedLineSet] of Object.entries(expected)) {
		const actualLineSet = actual[subject] ?? new Set();
		for (const expectedLine of expectedLineSet) {
			if (!actualLineSet.has(expectedLine)) {
				result[subject] = result[subject] ?? new Set();
				result[subject].add(expectedLine);
			}
		}
	}

	return result;
}

/**
 * Start the collector process.
 * @returns {ChildProcessWithoutNullStreams}
 */
function startCollector(coverageFolder, logTargetFile, projectId) {
	const collector = spawn(
		'node',
		[`${COLLECTOR_DIR}/dist/src/main.js`, `-f`, `${coverageFolder}`, `-l`, `${logTargetFile}`, `-k`, `-e`, `info`],
		{
			env: {
				...process.env,
				TEAMSCALE_SERVER_URL: `http://localhost:${TEAMSCALE_MOCK_PORT}/`,
				TEAMSCALE_USER: 'admin',
				TEAMSCALE_ACCESS_TOKEN: 'mockKey',
				TEAMSCALE_PROJECT: projectId
			},
			TEAMSCALE_PARTITION: 'mockPartition',
			TEAMSCALE_BRANCH: 'mockBranch'
		}
	);

	collector.stdout.on('data', function (data) {
		console.log('collector stdout: ' + data.toString());
	});

	collector.stderr.on('data', function (data) {
		console.error('collector stderr: ' + data.toString());
	});

	return collector;
}

/**
 * Sleep for the given milliseconds
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

/**
 * Check if the produced coverage is sufficient for the given study.
 */
function checkCoverage(coverageTargetFile, study) {
	const actualCoverage = loadFromSimpleCoverage(coverageTargetFile);
	const expectCovered = loadFromCoverageDict(study.expectCoveredLines);
	const expectUncovered = loadFromCoverageDict(study.expectUncoveredLines);
	const notCoveredButExpected = identifyExpectedButAbsent(actualCoverage, expectCovered);
	const coveredButNotExpected = identifyUnexpectedButPresent(actualCoverage, expectUncovered);

	if (Object.entries(notCoveredButExpected).length > 0) {
		console.error('Covered lines are missing!', study.name, notCoveredButExpected);
		process.exit(4);
	}

	if (Object.entries(coveredButNotExpected).length > 0) {
		console.error('Lines covered but were expected to not being so!', study.name, coveredButNotExpected);
		process.exit(5);
	}
}

for (const study of caseStudies) {
	console.group('# Case study', study.name);
	try {
		console.log('## Build the case study');
		execSync('npm install', { cwd: study.rootDir });
		execSync('npm run clean', { cwd: study.rootDir });
		execSync('npm run build', { cwd: study.rootDir });

		const fullStudyDistPath = path.resolve(`${study.rootDir}/${study.distDir}`);
		console.log(`Instrument the case study in ${fullStudyDistPath}`);

		const excludeArgument =
			study.excludeOrigins.length > 0 ? `--exclude-origin ${study.excludeOrigins.join(' ')}` : '';
		const includeArgument =
			study.includeOrigins.length > 0 ? `--include-origin ${study.includeOrigins.join(' ')}` : '';

		console.log('Include/exclude arguments: ', includeArgument, excludeArgument);

		execSync(
			`node ./dist/src/main.js ${excludeArgument} ${includeArgument} --in-place ${fullStudyDistPath} --collector ws://localhost:54678`,
			{ cwd: INSTRUMENTER_DIR, stdio: 'inherit' }
		);

		console.log('## Starting the Web server');
		const ws = await LocalWebServer.create({
			port: SERVER_PORT,
			directory: `${study.rootDir}/${study.distDir}`
		});

		try {
			const coverageFolder = path.resolve(path.join(study.rootDir, 'coverage'));
			const logTargetFile = path.resolve(`${study.rootDir}/coverage.log`);

			// Delete existing files
			if (fs.existsSync(coverageFolder)) {
				fs.rmdirSync(coverageFolder, { recursive: true });
			}
			fs.mkdirSync(coverageFolder);
			if (fs.existsSync(logTargetFile)) {
				await fsp.unlink(logTargetFile);
			}

			// Start the Teamscale mock serer
			let teamscaleServerMock = new ServerMock({ host: 'localhost', port: TEAMSCALE_MOCK_PORT });
			teamscaleServerMock.on({
				method: 'POST',
				path: `/api/projects/${study.name}/external-analysis/session/auto-create/report`,
				reply: {
					status: 200,
					headers: { 'content-type': 'text/plain' },
					body: 'Thanks for the report!'
				}
			});

			await new Promise(resolve => {
				console.log('## Starting the Teamscale mock server');
				teamscaleServerMock.start(resolve);
			});

			// Start the new collector
			console.log('## Starting the collector');
			console.log(`Collector is logging to ${logTargetFile}`);
			const collectProcess = startCollector(coverageFolder, logTargetFile, study.name);

			try {
				console.log('## Running Cypress');
				await cypress.run({
					configFile: 'cypress.json',
					reporter: 'junit',
					browser: 'chrome',
					headed: false,
					quiet: true,
					config: {
						baseUrl: `http://localhost:${SERVER_PORT}`,
						video: false,
						integrationFolder: `test/integration/${study.name}/`
					},
					env: {}
				});
			} finally {
				console.log('## Stopping the collector');
				await sleep(1000);
				collectProcess.kill('SIGINT');
				await sleep(7000);
			}

			// Check if the coverage collector has written the files
			// it was assumed to write.
			if (!fs.existsSync(logTargetFile)) {
				throw new Error('The coverage collector is supposed to write a log file!');
			}

			const coverageFiles = fs.readdirSync(coverageFolder);
			if (coverageFiles.length === 0) {
				throw new Error('The coverage collector did not write a coverage file!');
			} else if (coverageFiles.length > 1) {
				throw new Error('More than one coverage file was written');
			}
			const coverageFile = path.join(coverageFolder, coverageFiles[0]);

			// Analyze the coverage
			console.log(`## Analysis of coverage in ${coverageFile}`);
			checkCoverage(coverageFile, study);

			// Check the calls to the Teamscale mock server
			const mockedRequests = teamscaleServerMock.requests({ method: 'POST' }).length;
			if (mockedRequests === 0 && Object.keys(study.expectCoveredLines).length > 0) {
				throw new Error('No coverage information was sent to the Teamscale mock server!');
			} else {
				console.log(`Received ${mockedRequests} requests in the Teamscale mock server.`);
			}

			await new Promise(resolve => {
				console.log('## Stopping the Teamscale mock server');
				teamscaleServerMock.stop(resolve);
			});
		} finally {
			console.log('## Stop the case study Web server');
			ws.server.close();
		}
	} finally {
		console.groupEnd();
	}
}

process.exit(0);
