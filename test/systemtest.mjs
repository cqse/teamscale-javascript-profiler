import net from 'net';
import tempfile from 'tempfile';
import { execSync, spawn } from 'child_process';
import path from 'path';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import ServerMock from 'mock-http-server';
import { fileURLToPath } from 'url';
import treeKill from 'tree-kill';

/**
 * The name of the study that will not be instrumented.
 */
const BASELINE_STUDY = 'baseline-empty-js';

const NUM_PERF_MEASURE_RUNS = 2;

const KEY_PERF_TESTING_NO_INSTRUMENTATION = 'testingUninstrumented';
const KEY_PERF_TESTING_WITH_INSTRUMENTATION = 'testingInstrumented';
const KEY_PERF_INSTRUMENTATION = 'Instrumentation';

const __filename = fileURLToPath(import.meta.url);

const PROFILER_ROOT_DIR = path.dirname(path.dirname(__filename));
const INSTRUMENTER_DIR = path.join('packages', 'teamscale-javascript-instrumenter');
const COLLECTOR_DIR = path.join('packages', 'teamscale-coverage-collector');
const SERVER_PORT = 9000;
const TEAMSCALE_MOCK_PORT = 10088;
const ARGS = process.argv.slice(2);
/**
 * Definition of the case studies along with
 * the expected coverage produced by our tool chain.
 */
const caseStudies = [
	{
		name: BASELINE_STUDY,
		rootDir: 'test/casestudies/baseline-empty-js',
		distDir: 'dist',
		expectCoveredLines: {},
		expectUncoveredLines: {},
		excludeOrigins: [],
		includeOrigins: []
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
		includeOrigins: [`'../../src/**/*.*'`],
		maxNormTimeFraction: 1.1
	},
	{
		name: 'vite-react-ts-coverable-app',
		rootDir: 'test/casestudies/vite-react-ts-coverable-app',
		distDir: 'dist',
		expectCoveredLines: {
			'../../src/App.tsx': [6, 11, 23, 27, 32, 33, 34]
		},
		expectUncoveredLines: {},
		excludeOrigins: [],
		includeOrigins: [`'../../src/**/*.*'`],
		maxNormTimeFraction: 1.5
	},
	{
		name: 'angular-hero-app',
		rootDir: 'test/casestudies/angular-hero-app',
		distDir: 'dist',
		expectCoveredLines: {
			'src/app/heroes/heroes.component.ts': [11, 12, 22, 35, 36],
			'src/app/hero-detail/hero-detail.component.ts': [23, 27, 28, 29, 33]
		},
		expectUncoveredLines: {
			'node_modules/zone.js/fesm2015/zone.js': ['1-30', '70-90', 28, 20, 80],
			'src/app/heroes/heroes.component.ts': ['1-10', 15, 16, '18-20', '37-50']
		},
		excludeOrigins: [],
		includeOrigins: [`'src/app/**/*.*'`],
		maxNormTimeFraction: 8.0
	},
	{
		name: 'angular-hero-app-with-excludes',
		rootDir: 'test/casestudies/angular-hero-app',
		distDir: 'dist',
		expectCoveredLines: {
			'src/app/hero-detail/hero-detail.component.ts': [13, 17, 18, 19]
		},
		expectUncoveredLines: {
			'src/app/heroes/heroes.component.ts': [11, 12, 22, 35, 36],
			'node_modules/zone.js/fesm2015/zone.js': [17, 90, 28, 1054]
		},
		excludeOrigins: [`'src/app/heroes/*.*'`, `'node_modules/**/*.*'`, `'webpack/**/*'`],
		includeOrigins: [],
		maxNormTimeFraction: 9.0
	}
];

/**
 * Identify the next available port.
 */
async function identifyNextAvailablePort() {
	return new Promise(res => {
		const srv = net.createServer();
		srv.listen(0, () => {
			const port = srv.address().port;
			srv.close(_ => res(port));
		});
	});
}

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
function startCollector(coverageFolder, logTargetFile, projectId, collectorPort) {
	const collector = spawn(
		'node',
		[
			`${COLLECTOR_DIR}/dist/src/main.js`,
			`--port`,
			collectorPort,
			`-f`,
			`${coverageFolder}`,
			`-l`,
			`${logTargetFile}`,
			`-k`,
			`-e`,
			`info`
		],
		{
			env: {
				...process.env,
				TEAMSCALE_SERVER_URL: `http://localhost:${TEAMSCALE_MOCK_PORT}/`,
				TEAMSCALE_USER: 'admin',
				TEAMSCALE_ACCESS_TOKEN: 'mockKey',
				TEAMSCALE_PROJECT: projectId
			},
			TEAMSCALE_PARTITION: 'mockPartition',
			TEAMSCALE_BRANCH: 'mockBranch',
			detached: false
		}
	);

	collector.stdout.on('data', function (data) {
		console.log('collector stdout: ' + data.toString());
	});

	collector.stderr.on('data', function (data) {
		console.error('collector stderr: ' + data.toString());
	});

	console.info(`Started the collector on port ${collectorPort}.`);

	return collector;
}

/**
 * Start the Web server process.
 * @returns {ChildProcessWithoutNullStreams}
 */
function startWebServer(distributionFolder) {
	const webserver = spawn(
		'node',
		[
			'node_modules/.bin/ws',
			'--static.maxage',
			'0',
			'--hostname',
			'localhost',
			'--port',
			SERVER_PORT,
			'--directory',
			distributionFolder
		],
		{
			detached: false,
			killSignal: 'SIGKILL',
			env: {
				...process.env
			}
		}
	);

	webserver.stdout.on('data', function (data) {
		console.log('webserver stdout: ' + data.toString());
	});

	webserver.stderr.on('data', function (data) {
		console.error('webserver stderr: ' + data.toString());
	});

	webserver.on('close', code => {
		console.log(`webserver process exited with code ${code}`);
	});

	return webserver;
}

function startStudyWebServer(study) {
	const deploymentDir = path.resolve(`${study.rootDir}/${study.distDir}`);
	console.log(`In directory "${deploymentDir}".`);
	const webserverProcess = startWebServer(deploymentDir);
	console.log(`## Started the Web server with PID ${webserverProcess.pid}.`);
	return webserverProcess;
}

/**
 * Sleep for the given milliseconds.
 *
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
function checkObtainedCoverage(study, sessionId) {
	const coverageFolder = getStudyCoverageFolder(study, sessionId);
	const coverageFile = identifyCoverageFile(coverageFolder);

	// Check if the coverage collector has written the files
	// it was assumed to write.
	if (!fs.existsSync(coverageFile)) {
		throw new Error('The coverage collector is supposed to write a log file!');
	}

	console.log(`## Analysis of coverage in ${coverageFile}`);

	const actualCoverage = loadFromSimpleCoverage(coverageFile);
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

function summarizePerformanceMeasures(perfMeasuresByStudy) {
	const computeStats = (perfType, noInstPerfValue, withInstPerfValue, basePerfValue, fractionFactor) => {
		// Adjust the base performance if one of the others performed better.
		basePerfValue = Math.min(basePerfValue, noInstPerfValue, withInstPerfValue);

		const perfPlusDueToInstrumentation = Math.max(0, withInstPerfValue - noInstPerfValue);
		const noInstPerfDiffToBase = noInstPerfValue - basePerfValue;
		const withInstPerfDiffToBase = withInstPerfValue - basePerfValue;

		const ifZeroElse = (valueInCaseOfZero, toCheck) => {
			if (toCheck === 0) {
				return valueInCaseOfZero;
			}
			return toCheck;
		};

		const result = {};
		result[perfType + 'Base'] = basePerfValue;
		result[perfType + 'WithInstAbs'] = withInstPerfValue;
		result[perfType + 'NoInstAbs'] = noInstPerfValue;
		result[perfType + 'AbsPlusDueToInst'] = perfPlusDueToInstrumentation;
		result[perfType + 'InstNoInstFraction'] = withInstPerfValue / noInstPerfValue;
		result[perfType + 'WithInstNormalized'] = withInstPerfDiffToBase;
		result[perfType + 'NoInstNormalized'] = noInstPerfDiffToBase;
		result[perfType + 'NormalizedDelta'] = withInstPerfDiffToBase - noInstPerfDiffToBase;
		result[perfType + 'NormalizedFraction'] = withInstPerfDiffToBase / noInstPerfDiffToBase;
		result[perfType + 'NormalizedFraction' + String(fractionFactor)] =
			Math.round(withInstPerfDiffToBase / fractionFactor) /
			ifZeroElse(1, Math.round(noInstPerfDiffToBase / fractionFactor));
		result[perfType + 'NormalizedFraction'] = withInstPerfDiffToBase / noInstPerfDiffToBase / fractionFactor;
		return result;
	};

	const computePerfStats = (study, perfType, valueKey, fractionFactor, valueTransformer) => {
		const baselinePerf = perfMeasuresByStudy[BASELINE_STUDY][KEY_PERF_TESTING_NO_INSTRUMENTATION];
		const withInstRuntimePerf = perfMeasuresByStudy[study.name][KEY_PERF_INSTRUMENTATION];
		const withoutInstRuntimePerf = perfMeasuresByStudy[study.name][KEY_PERF_TESTING_NO_INSTRUMENTATION];

		const basePerfValue = valueTransformer(baselinePerf[valueKey]);
		const noInstRuntimeMemory = valueTransformer(withoutInstRuntimePerf[valueKey]);
		const withInstRuntimeMemory = valueTransformer(withInstRuntimePerf[valueKey]);

		return computeStats(perfType, noInstRuntimeMemory, withInstRuntimeMemory, basePerfValue, fractionFactor);
	};

	const aggregatePerformanceResults = () => {
		const results = [];
		for (const study of caseStudies) {
			if (study.name === BASELINE_STUDY) {
				continue;
			}

			results.push({
				study: study.name,
				...computePerfStats(study, 'memory', 'memory_mb_peak', 100, value => Math.ceil(value)),
				...computePerfStats(study, 'time', 'duration_secs', 1, value => Number(value.toPrecision(2)))
			});
		}
		return results;
	};

	const checkPerformanceMeasures = runtimeResults => {
		for (let i = 0; i < runtimeResults.length; i++) {
			const runtimeResult = runtimeResults[i];
			// The baseline study is skipped, that is, a +1 is needed:
			const study = caseStudies[i + 1];

			// We only trigger a violation if the time needed for the study itself is larger than 2s
			if ('maxNormTimeFraction' in study && runtimeResult.timeWithInstNormalized > 2) {
				const maxValue = study.maxNormTimeFraction;
				if (runtimeResult.timeNormalizedFraction > maxValue) {
					console.error(
						`Time overhead added by the instrumentation was too high! ${runtimeResult.timeNormalizedFraction} > ${maxValue}`,
						study.name
					);
					process.exit(6);
				}
			}

			// We only trigger a violation if the memory needed for the study itself is larger than 200MB
			if ('maxNormMemoryFraction100' in study && runtimeResult.memoryNormalizedFraction100 > 2) {
				const maxValue = study.maxNormMemoryFraction100;
				if (runtimeResult.memoryNormalizedFraction > maxValue) {
					console.error(
						`Memory overhead added by the instrumentation was too high! ${runtimeResult.memoryNormalizedFraction} > ${maxValue}`,
						study.name
					);
					process.exit(7);
				}
			}
		}
	};

	const runtimeResults = aggregatePerformanceResults();
	console.log(runtimeResults);
	checkPerformanceMeasures(runtimeResults);
}

function averagePerformance(samples) {
	let durationSum = 0;
	let memorySum = 0;
	for (const sample of samples) {
		durationSum = durationSum + sample.duration_secs;
		memorySum = memorySum + sample.memory_mb_peak;
	}
	return { duration_secs: durationSum / samples.length, memory_mb_peak: memorySum / samples.length };
}

function profileTestingInBrowser(studyName) {
	const runTestsOnSubjectInBrowser = studyName => {
		const browserPerformanceFile = tempfile('.json');
		console.log('## Running Cypress tests on the subject');
		const command = `${path.join(
			PROFILER_ROOT_DIR,
			'test',
			'scripts',
			'profile_testing.sh'
		)} ${studyName} ${SERVER_PORT} ${browserPerformanceFile}`;
		execSync(command, { cwd: PROFILER_ROOT_DIR, stdio: 'inherit' });
		return JSON.parse(fs.readFileSync(browserPerformanceFile));
	};

	// We do one run that is just for warm-up. Its measures are not considered.
	runTestsOnSubjectInBrowser(studyName);

	// The actual runs to determine the best performance.
	const runResults = [];
	let remainingRuns = NUM_PERF_MEASURE_RUNS;
	while (remainingRuns > 0) {
		runResults.push(runTestsOnSubjectInBrowser(studyName));
		remainingRuns--;
	}

	return averagePerformance(runResults);
}

function instrumentStudy(study, collectorPort) {
	const fullStudyDistPath = path.resolve(`${study.rootDir}/${study.distDir}`);
	console.log(`## Instrument the case study in ${fullStudyDistPath}`);

	/**
	 * Attention: This does wildcard expansion!!
	 * 		See https://stackoverflow.com/questions/11717281/wildcards-in-child-process-spawn
	 */
	const excludeArgument = study.excludeOrigins.length > 0 ? `--exclude-origin ${study.excludeOrigins.join(' ')}` : '';
	const includeArgument = study.includeOrigins.length > 0 ? `--include-origin ${study.includeOrigins.join(' ')}` : '';
	console.log('Include/exclude arguments: ', includeArgument, excludeArgument);

	const performanceFile = tempfile('.json');
	execSync(
		`${path.join(
			PROFILER_ROOT_DIR,
			'test',
			'scripts',
			'profile_instrumentation.sh'
		)} ${fullStudyDistPath} ${collectorPort} ${performanceFile} ${excludeArgument} ${includeArgument}`,
		{ cwd: INSTRUMENTER_DIR, stdio: 'inherit' }
	);
	return JSON.parse(fs.readFileSync(performanceFile));
}

function storePerfResult(perfMeasuresByStudy, studyName, perfKey, perf) {
	let studyPerfs = perfMeasuresByStudy[studyName];
	if (!studyPerfs) {
		studyPerfs = {};
		perfMeasuresByStudy[studyName] = studyPerfs;
	}
	studyPerfs[perfKey] = perf;
}

function buildGrafana(study) {
	console.log('## Build Grafana');
	execSync('rm -rf public/build', { cwd: study.rootDir });
	execSync('yarn workspaces foreach run clean', { cwd: study.rootDir });
	execSync('yarn install', { cwd: study.rootDir });
	execSync('yarn build', { cwd: study.rootDir });
}

function buildStudy(study) {
	console.log('## Build the case study');
	execSync('npm install', { cwd: study.rootDir });
	execSync('npm run clean', { cwd: study.rootDir });
	execSync('npm run build', { cwd: study.rootDir });
}

function getStudyCoverageFolder(study, sessionId) {
	return path.resolve(path.join(study.rootDir, 'coverage', sessionId));
}

function identifyCoverageFile(coverageFolder) {
	const coverageFiles = fs.readdirSync(coverageFolder);
	if (coverageFiles.length === 0) {
		throw new Error('The coverage collector did not write a coverage file!');
	} else if (coverageFiles.length > 1) {
		throw new Error('More than one coverage file was written');
	}
	return path.join(coverageFolder, coverageFiles[0]);
}

async function clearStudyOutputs(study, sessionId) {
	const coverageFolder = getStudyCoverageFolder(study, sessionId);
	const logTargetFile = path.resolve(`${study.rootDir}/coverage-${sessionId}.log`);

	// Delete existing files
	if (fs.existsSync(coverageFolder)) {
		fs.rmSync(coverageFolder, { recursive: true });
	}
	fs.mkdirSync(coverageFolder, { recursive: true });
	if (fs.existsSync(logTargetFile)) {
		await fsp.unlink(logTargetFile);
	}

	return [coverageFolder, logTargetFile];
}

async function startTeamscaleMockServer(study) {
	const teamscaleServerMock = new ServerMock({ host: 'localhost', port: TEAMSCALE_MOCK_PORT }, null);
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

	return teamscaleServerMock;
}

function checkTeamscaleServerMockInteractions(mockInstance, study) {
	const mockedRequests = mockInstance.requests({ method: 'POST' }).length;
	if (mockedRequests === 0 && Object.keys(study.expectCoveredLines).length > 0) {
		throw new Error('No coverage information was sent to the Teamscale mock server!');
	} else {
		console.log(`Received ${mockedRequests} requests in the Teamscale mock server.`);
	}
}

await (async function runSystemTest() {
	const perfStore = {};

	if(ARGS.includes("benchmark")){
		// Add grafana as additional benchmark casestudie
		caseStudies.push({
			name: 'grafana',
			rootDir: 'test/casestudies/grafana',
			distDir: 'public/build',
			expectCoveredLines: {
			},
			expectUncoveredLines: {
			},
			excludeOrigins: ["**/public/build/*.*"],
			includeOrigins: ["**/public/app/**/*.*"],
			maxNormTimeFraction: 8.0
		})
	}
	for (const study of caseStudies) {
		const collectorPort = await identifyNextAvailablePort();
		const sessionId = `session-${collectorPort}`;

		console.group('# Case study', study.name);
		try {
			if(study.name === "grafana") {
				buildGrafana(study);
			} else {
				buildStudy(study);
			}

			const webserverProcess = startStudyWebServer(study);

			// Run the tests in the browser on the version without instrumentation
			const notInstrumentedRuntimePerf = profileTestingInBrowser(study.name);
			storePerfResult(perfStore, study.name, KEY_PERF_TESTING_NO_INSTRUMENTATION, notInstrumentedRuntimePerf);

			const instrumentationPerformance = instrumentStudy(study, collectorPort);
			storePerfResult(perfStore, study.name, KEY_PERF_INSTRUMENTATION, instrumentationPerformance);

			try {
				const [coverageFolder, logTargetFile] = await clearStudyOutputs(study, sessionId);

				const teamscaleServerMock = await startTeamscaleMockServer(study);
				try {
					console.log('## Starting the collector');
					console.log(`Collector is logging to ${logTargetFile}`);
					const collectProcess = startCollector(coverageFolder, logTargetFile, study.name, collectorPort);

					// Run the tests in the browser on the instrumented version
					try {
						const runtimePerformance = profileTestingInBrowser(study.name);
						storePerfResult(
							perfStore,
							study.name,
							KEY_PERF_TESTING_WITH_INSTRUMENTATION,
							runtimePerformance
						);
					} finally {
						console.log('## Stopping the collector');
						await sleep(1000);
						collectProcess.kill('SIGINT');
						await sleep(7000);
					}

					checkObtainedCoverage(study, sessionId);

					checkTeamscaleServerMockInteractions(teamscaleServerMock, study);
				} finally {
					await new Promise(resolve => {
						console.log('## Stopping the Teamscale mock server');
						teamscaleServerMock.stop(resolve);
					});
				}
			} finally {
				console.log(`## Stopping the case study Web server with PID ${webserverProcess.pid}`);
				webserverProcess.kill();
				treeKill(webserverProcess.pid, 'SIGKILL');
			}
		} finally {
			console.groupEnd();
		}
	}

	summarizePerformanceMeasures(perfStore);

	process.exit(0);
})();
