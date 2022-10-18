import { ConfigParameters } from '../utils/ConfigParameters';
import Logger from 'bunyan';
import QueryParameters from '../utils/QueryParameters';
import FormData from 'form-data';
import { prepareFormData, performUpload, UploadError } from './CommonUpload';
import axios, { AxiosRequestConfig } from 'axios';

/**
 * Uploads a coverage file to Teamscale with the provided configuration.
 */
export async function uploadToTeamscale(
	config: ConfigParameters,
	logger: Logger,
	coverageFile: string,
	lines: number
): Promise<void> {
	if (!(config.teamscale_access_token && config.teamscale_user && config.teamscale_server_url)) {
		throw new UploadError('API key and user name must be configured!');
	}

	if (lines === 0) {
		return;
	}

	logger.info('Preparing upload to Teamscale');

	const form = prepareFormData(coverageFile);
	const queryParameters = prepareQueryParameters(config);
	await performTeamscaleUpload(config, queryParameters, form, logger);
}

async function performTeamscaleUpload(
	config: ConfigParameters,
	parameters: QueryParameters,
	form: FormData,
	logger: Logger
) {
	await performUpload(
		`${config.teamscale_server_url?.replace(/\/$/, '')}/api/projects/${
			config.teamscale_project
		}/external-analysis/session/auto-create/report?${parameters.toString()}`,
		form,
		prepareTeamscaleConfig(config, form),
		axios.post,
		logger
	);
}

function prepareQueryParameters(config: ConfigParameters) {
	const parameters = new QueryParameters();
	parameters.addIfDefined('format', 'SIMPLE');
	parameters.addIfDefined('message', config.teamscale_message);
	parameters.addIfDefined('repository', config.teamscale_repository);
	parameters.addIfDefined('t', config.teamscale_commit);
	parameters.addIfDefined('revision', config.teamscale_revision);
	parameters.addIfDefined('partition', config.teamscale_partition);
	return parameters;
}

function prepareTeamscaleConfig(config: ConfigParameters, form: FormData): AxiosRequestConfig<FormData> {
	return {
		auth: {
			username: config.teamscale_user ?? 'no username provided',
			password: config.teamscale_access_token ?? 'no password provided'
		},
		headers: {
			Accept: '*/*',
			'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`
		}
	};
}
