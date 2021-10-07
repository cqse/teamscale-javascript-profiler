import pm2 from 'pm2';
import LocalWebServer from 'local-web-server'
import cypress from 'cypress'
import {execSync} from 'child_process'

const caseStudies = [
	{name: 'angular-hero-app',
		rootDir: 'test/casestudies/angular-hero-app',
		distDir: 'dist'},
	{name: 'vite-react-ts-app',
		rootDir: 'test/casestudies/vite-react-ts-app',
		distDir: 'dist' },
	{name: 'vite-vue-ts-app',
		rootDir: 'test/casestudies/vite-vue-ts-app',
		distDir: 'dist'}
];

const SERVER_PORT = 9000;

for (const study of caseStudies) {
	console.group("Case study", study);
	try {
		console.log("Build the case study");
		execSync('npm run clean', {cwd: study.rootDir});
		execSync('npm run build', {cwd: study.rootDir});

		console.log("Instrument the case study");

		console.log("Starting Web server");
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

			console.log("Staring the collector");
			pm2.start({
				name: 'collector',
				script: 'packages/teamscale-coverage-collector/dist/main.js',
			}, (err, apps) => {
				pm2.disconnect()
				if (err) {
					throw err
				}
			})

			console.log("Running Cypress");
			await cypress.run({
				configFile: 'cypress.json',
				reporter: 'junit',
				browser: 'chrome',
				config: {
					baseUrl: `http://localhost:${SERVER_PORT}`,
					video: true,
					integrationFolder: `test/integration/${study.name}/`,
				},
				env: { },
			})

			console.log("Stopping the collector");
			pm2.stop('collector');
		} finally {
			console.log("Stop the case study Web server");
			ws.server.close();
		}
	} finally {
		console.groupEnd();
	}
}

process.exit();