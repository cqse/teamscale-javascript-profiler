const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const PACKAGES_DIR = './packages';
const CHANGELOG_FILENAME = 'CHANGELOG.md';

async function incrementVersionOfAllPackages() {
    const packageDirectories = await fs.readdir(PACKAGES_DIR);

    for (const packageDir of packageDirectories) {
        const packageJsonPath = path.join(PACKAGES_DIR, packageDir, 'package.json');

        if (await fs.exists(packageJsonPath)) {
            const packageJson = require(packageJsonPath);
            
            let newVersion;
            if (packageJson.version.includes('beta')) {
                // Increment the beta version
                const [major, minor, patch, beta, betaVersion] = packageJson.version.match(/(\d+)\.(\d+)\.(\d+)-beta\.(\d+)/).slice(1);
                const newBetaVersion = parseInt(betaVersion, 10) + 1;
                newVersion = `${major}.${minor}.${patch}-beta.${newBetaVersion}`;
            } else {
                // Increment the patch version
                const [major, minor, patch] = packageJson.version.match(/(\d+)\.(\d+)\.(\d+)/).slice(1);
                const newPatchVersion = parseInt(patch, 10) + 1;
                newVersion = `${major}.${minor}.${newPatchVersion}`;
            }

            packageJson.version = newVersion;
            await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

            // Update the changelog of the affected packages.
            await updateChangelog(path.join(PACKAGES_DIR, packageDir, CHANGELOG_FILENAME), newVersion);
        }
    }
}

async function updateChangelog(changelogPath, newVersion) {
    if (!await fs.exists(changelogPath)) return;

    const changelogContent = await fs.readFile(changelogPath, 'utf8');
    const updatedChangelogContent = changelogContent.replace('# New Release', `# ${newVersion}`).replace('# Next Release', `# New Release`);

    await fs.writeFile(changelogPath, updatedChangelogContent);
}

function commitChanges(newVersion) {
    execSync(`git commit -a -m "New release ${newVersion}"`);
}

function createGitTag(newVersion) {
    execSync(`git tag "${newVersion}" -m "New release version ${newVersion}"`);
}

function pushChanges() {
    execSync('git push --tags');
}

(async function release() {
    await incrementVersionOfAllPackages();

    // Assuming the same version for all packages (based on the first package)
    const firstPackageJsonPath = path.join(PACKAGES_DIR, 'cqse-commons', 'package.json');
    const firstPackageJson = require(firstPackageJsonPath);
    const newVersion = firstPackageJson.version;

    commitChanges(newVersion);
    createGitTag(newVersion);
    pushChanges();
})();

