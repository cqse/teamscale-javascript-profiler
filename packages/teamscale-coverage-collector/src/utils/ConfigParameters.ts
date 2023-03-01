import { ArgumentParser } from 'argparse';
import { version } from '../../package.json';

/**
 * The command line parameters the profiler can be configured with.
 *
 * ATTENTION: We use snake_case here because ArgParse creates
 * the parameters that way---as in Python from which ArgParse stems.
 */
export type ConfigParameters = {
	// eslint-disable-next-line camelcase
	dump_to_folder: string;
	// eslint-disable-next-line camelcase
	log_to_file: string;
	// eslint-disable-next-line camelcase
	keep_coverage_files: boolean;
	// eslint-disable-next-line camelcase
	log_level: string;
	// eslint-disable-next-line camelcase
	dump_after_mins: number;
	port: number;
	// eslint-disable-next-line camelcase
	json_log: boolean;
	// eslint-disable-next-line camelcase
	teamscale_server_url?: string;
	// eslint-disable-next-line camelcase
	teamscale_access_token?: string;
	// eslint-disable-next-line camelcase
	teamscale_project?: string;
	// eslint-disable-next-line camelcase
	teamscale_user?: string;
	// eslint-disable-next-line camelcase
	teamscale_partition?: string;
	// eslint-disable-next-line camelcase
	teamscale_revision?: string;
	// eslint-disable-next-line camelcase
	teamscale_commit?: string;
	// eslint-disable-next-line camelcase
	teamscale_repository?: string;
	// eslint-disable-next-line camelcase
	teamscale_message?: string;
	// eslint-disable-next-line camelcase
	artifactory_server_url?: string;
	// eslint-disable-next-line camelcase
	artifactory_user?: string;
	// eslint-disable-next-line camelcase
	artifactory_password?: string;
	// eslint-disable-next-line camelcase
	artifactory_access_token?: string;
	// eslint-disable-next-line camelcase
	artifactory_path_suffix?: string;
	// eslint-disable-next-line camelcase
	enable_control_port?: number;
	// eslint-disable-next-line camelcase
	proxy_url?: string;
	// eslint-disable-next-line camelcase
	proxy_port?: number;
	// eslint-disable-next-line camelcase
	proxy_user?: string;
	// eslint-disable-next-line camelcase
	proxy_password?: string;
};

/**
 * Construct the object for parsing the command line arguments.
 */
export function buildParameterParser(): ArgumentParser {
	const parser = new ArgumentParser({
		description:
			'Collector of the Teamscale JavaScript Profiler. Collects coverage information from a' +
			'(headless) Web browser that executes code instrumented with our instrumenter.'
	});

	parser.add_argument('-v', '--version', { action: 'version', version });
	parser.add_argument('-p', '--port', { help: 'The port to receive coverage information on.', default: 54678 });
	parser.add_argument('-f', '--dump-to-folder', {
		help: 'Target folder for coverage files.',
		default: 'coverage'
	});
	parser.add_argument('-k', '--keep-coverage-files', {
		help: 'Whether to keep the coverage files on disk after a successful upload to Teamsacle',
		action: 'store_true',
		default: false
	});
	parser.add_argument('-l', '--log-to-file', { help: 'Log file', default: 'logs/collector-combined.log' });
	parser.add_argument('-e', '--log-level', { help: 'Log level', default: 'info' });
	parser.add_argument('-c', '--enable-control-port', {
		help: 'Enables the remote control API on the specified port (<=0 means "disabled").',
		default: 0
	});
	parser.add_argument('-t', '--dump-after-mins', {
		help: 'Dump the coverage information to the target file every N minutes.',
		default: 360
	});
	parser.add_argument('-d', '--debug', {
		help: 'Print received coverage information to the terminal?',
		default: false
	});
	parser.add_argument('-j', '--json-log', {
		help: 'Additional JSON-like log file format.',
		action: 'store_true'
	});

	// Parameters for the upload to Teamscale
	parser.add_argument('-u', '--teamscale-server-url', {
		help: 'Upload the coverage to the given Teamscale server URL, for example, https://teamscale.dev.example.com:8080/production.',
		default: process.env.TEAMSCALE_SERVER_URL
	});
	parser.add_argument('--teamscale-access-token', {
		help: 'The API key to use for uploading to Teamscale.',
		default: process.env.TEAMSCALE_ACCESS_TOKEN
	});
	parser.add_argument('--teamscale-project', {
		help: 'The project ID to upload coverage to.',
		default: process.env.TEAMSCALE_PROJECT
	});
	parser.add_argument('--teamscale-user', {
		help: 'The user for uploading coverage to Teamscale.',
		default: process.env.TEAMSCALE_USER
	});
	parser.add_argument('--teamscale-partition', {
		help: 'The partition to upload coverage to.',
		default: process.env.TEAMSCALE_PARTITION
	});
	parser.add_argument('--teamscale-revision', {
		help: 'The revision (commit hash, version id) to upload coverage for.',
		default: process.env.TEAMSCALE_REVISION
	});
	parser.add_argument('--teamscale-commit', {
		help: 'The branch and timestamp to upload coverage for, separated by colon.',
		default: process.env.TEAMSCALE_COMMIT
	});
	parser.add_argument('--teamscale-repository', {
		help: 'The repository to upload coverage for. Optional: Only needed when uploading via revision to a project that has more than one connector.',
		default: process.env.TEAMSCALE_REPOSITORY
	});
	parser.add_argument('--teamscale-message', {
		help: 'The commit message shown within Teamscale for the coverage upload. Default is "JavaScript coverage upload".',
		default: process.env.TEAMSCALE_MESSAGE ?? 'JavaScript coverage upload'
	});
	parser.add_argument('--artifactory-server-url', {
		help: 'Upload the coverage to the given Artifactory server URL. The URL may include a subpath on the artifactory server, e.g. https://artifactory.acme.com/my-repo/my/subpath',
		default: process.env.ARTIFACTORY_SERVER_URL
	});
	parser.add_argument('--artifactory-user', {
		help: 'The user for uploading coverage to Artifactory. Only needed when not using the --artifactory-access-token option',
		default: process.env.ARTIFACTORY_USER
	});
	parser.add_argument('--artifactory-password', {
		help: 'The password for uploading coverage to Artifactory. Only needed when not using the --artifactory-access-token option',
		default: process.env.ARTIFACTORY_PASSWORD
	});
	parser.add_argument('--artifactory-access-token', {
		help: 'The access_token for uploading coverage to Artifactory.',
		default: process.env.ARTIFACTORY_ACCESS_TOKEN
	});
	parser.add_argument('--artifactory-path-suffix', {
		help: '(optional): The path within the storage location between the default path and the uploaded artifact.',
		default: process.env.ARTIFACTORY_PATH_SUFFIX
	});
	parser.add_argument('--proxy-url', {
		help: '(optional): The url of the proxy server to initially route the request to.',
		default: ''
	});
	parser.add_argument('--proxy-port', {
		help: '(optional): The port of the proxy server to initially route the request to.',
		default: 0
	});
	parser.add_argument('--proxy-user', {
		help: '(optional) The username for the proxy server.'
	});
	parser.add_argument('--proxy-password', {
		help: '(optional) The password for the proxy server.'
	})

	return parser;
}
