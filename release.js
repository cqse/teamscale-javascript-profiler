const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const { program } = require('commander');

const PACKAGES_DIR = './packages';
const CHANGELOG_FILENAME = 'CHANGELOG.md';

const consoleInterface = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

function askQuestion(query) {
	return new Promise(resolve => {
		consoleInterface.question(query, answer => {
			resolve(answer);
			consoleInterface.close();
		});
	});
}

async function fileExists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch (err) {
		return false;
	}
}

function incrementVersion(currentVersion, majorRelease, minorRelease) {
	if (majorRelease || minorRelease) {
		const [major, minor, patch] = currentVersion.match(/(\d+)\.(\d+)\.(\d+)/).slice(1);
		if (majorRelease) {
			// MAJOR
			return `${parseInt(major, 10) + 1}.0.0`;
		} else if (minorRelease) {
			// MINOR
			return `${major}.${parseInt(minor, 10) + 1}.0`;
		}
	} else if (currentVersion.includes('beta')) {
		// BETA
		const [major, minor, patch, beta] = currentVersion.match(/(\d+)\.(\d+)\.(\d+)-beta\.(\d+)/).slice(1);
		const newBetaVersion = parseInt(beta, 10) + 1;
		return `${major}.${minor}.${patch}-beta.${newBetaVersion}`;
	} else {
		// PATCH
		const [major, minor, patch] = currentVersion.match(/(\d+)\.(\d+)\.(\d+)/).slice(1);
		return `${major}.${minor}.${parseInt(patch, 10) + 1}`;
	}
}

async function incrementVersionOfAllPackages(newVersion) {
	const packageDirectories = await fs.readdir(PACKAGES_DIR);

	for (const packageDir of packageDirectories) {
		const packageJsonPath = path.join(PACKAGES_DIR, packageDir, 'package.json');

		if (await fileExists(packageJsonPath)) {
			const packageJsonRaw = await fs.readFile(packageJsonPath, 'utf8');
			const packageJson = JSON.parse(packageJsonRaw);

			packageJson.version = newVersion;
			await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

			await updateChangelog(path.join(PACKAGES_DIR, packageDir, CHANGELOG_FILENAME), newVersion);
		}
	}
}

async function updateChangelog(changelogPath, newVersion) {
	if (!(await fileExists(changelogPath))) {
		return;
	}

	const changelogContent = await fs.readFile(changelogPath, 'utf8');
	const updatedChangelogContent = changelogContent.replace('# New Release', `# New Release\n\n# ${newVersion}`);

	await fs.writeFile(changelogPath, updatedChangelogContent);
}

function commitChanges(newVersion) {
	execSync(`git commit -a -m "New release ${newVersion}"`);
}

function createGitTag(newVersion) {
	execSync(`git tag "v${newVersion}" -m "New release version v${newVersion}"`);
}

function pushChanges() {
	execSync('git push --tags');
}

function getCurrentGitBranch() {
	return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

function revertPackagesChanges() {
	return execSync('git checkout -- ./packages');
}

function checkForUncommittedChangesInPackages() {
	const gitStatusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
	const modifiedFilesInPackages = gitStatusOutput
		.split('\n')
		.some(line => line.trim().startsWith('M') && line.includes('packages'));

	if (modifiedFilesInPackages) {
		console.error(
			'There are uncommitted changes within the packages. Please commit or stash them before releasing.'
		);
		process.exit(1);
	}
}

async function determineCurrentVersion() {
	const firstPackageJsonPath = path.join(PACKAGES_DIR, 'cqse-commons', 'package.json');
	const firstPackageJsonRaw = await fs.readFile(firstPackageJsonPath, 'utf8');
	const firstPackageJson = JSON.parse(firstPackageJsonRaw);
	return firstPackageJson.version;
}

function checkReleaseBranch() {
	const currentBranch = getCurrentGitBranch();
	if (currentBranch !== 'master' && currentBranch !== 'main') {
		console.error(
			`This script can only be run on the 'master' or 'main' branch. Current branch is '${currentBranch}'.`
		);
		process.exit(1);
	}
}

(async function release() {
	const currentVersion = await determineCurrentVersion();

	program
		.version(currentVersion)
		.description('Teamscale JavaScript Profiler Releases Helper')
		.option('--major', 'Create a major release')
		.option('--minor', 'Create a minor release')
		.parse();

	const options = program.opts();
	if (options.major && options.minor) {
		console.error("Error: You can't specify both --major and --minor. Choose one.");
		process.exit(1);
	}

	checkForUncommittedChangesInPackages();
	checkReleaseBranch();

	const newVersion = incrementVersion(currentVersion, options.major, options.minor);
	await incrementVersionOfAllPackages(newVersion);

	const answer = await askQuestion(`Do you want to create a tag and push for version ${newVersion}? (yes/no) `);
	if (answer.trim().toLowerCase() === 'yes') {
		commitChanges(newVersion);
		createGitTag(newVersion);
		pushChanges();
		console.log(`Release for version ${newVersion} completed successfully.`);
	} else {
		revertPackagesChanges();
		console.log(`Release for version ${newVersion} aborted by user.`);
	}
})();
