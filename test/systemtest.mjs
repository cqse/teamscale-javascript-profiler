import pm2 from 'pm2';
import LocalWebServer from 'local-web-server'
import cypress from 'cypress'
import {execSync} from 'child_process'
import path  from 'path';

const caseStudies = [
	{name: 'angular-hero-app',
		rootDir: 'test/casestudies/angular-hero-app',
		distDir: 'dist'},
	{name: 'vite-react-ts-app',
		rootDir: 'test/casestudies/vite-react-ts-app',
		distDir: 'dist' }
];

const INSTRUMENTER_DIR = 'packages/teamscale-javascript-instrumenter';
const COLLECTOR_DIR = 'packages/teamscale-coverage-collector';
const SERVER_PORT = 9000;

for (const study of caseStudies) {
	console.group("# Case study", study);
	try {
		console.log("## Build the case study");
		execSync('npm install', {cwd: study.rootDir});
		execSync('npm run clean', {cwd: study.rootDir});
		execSync('npm run build', {cwd: study.rootDir});

		const fullStudyDistPath = path.resolve(`${study.rootDir}/${study.distDir}`);
		console.log(`Instrument the case study in ${fullStudyDistPath}`);
		execSync(`node ./dist/src/main.js --in-place ${fullStudyDistPath}`,
			{cwd: INSTRUMENTER_DIR, stdio: 'inherit'});

		console.log("## Starting the Web server");
		const ws = await LocalWebServer.create({
			port: SERVER_PORT,
			directory: `${study.rootDir}/${study.distDir}`
		})

		try {
			pm2.connect(function(err) {
				if (err) {
					console.error(err)
					process.exit(2)
				}
			})

			console.log("## Staring the collector");
			const coverageTargetFile = path.resolve(`${study.rootDir}/coverage.simple`);
			const logTargetFile = path.resolve(`${study.rootDir}/coverage.log`);
			console.log(`Collector is logging to ${logTargetFile}`);

			// Stop a potentially running old collector
			pm2.delete('collector', (err => {}));

			// Start the new collector
			pm2.start({
				name: 'collector',
				script: `${COLLECTOR_DIR}/dist/src/main.js`,
				args: [`-f`, `${coverageTargetFile}`, `-l`, `${logTargetFile}`]
			}, (err, apps) => {
				pm2.disconnect();
				if (err) {
					console.error(err);
					throw err;
				}
			})
			try {
				console.log("## Running Cypress");
				await cypress.run({
					configFile: 'cypress.json',
					reporter: 'junit',
					browser: 'chrome',
					headed: true,
					config: {
						baseUrl: `http://localhost:${SERVER_PORT}`,
						video: true,
						integrationFolder: `test/integration/${study.name}/`,
					},
					env: {},
				})
			} finally {
				console.log("## Stopping the collector");
				pm2.stop('collector');
			}

			// Analyze the coverage
			console.log(`## Analysis of coverage in ${coverageTargetFile}`);
			// TODO
		} finally {
			console.log("## Stop the case study Web server");
			ws.server.close();
		}
	} finally {
		console.groupEnd();
	}
}

process.exit();
