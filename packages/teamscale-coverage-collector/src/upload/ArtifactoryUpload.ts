import { ConfigParameters } from '../utils/ConfigParameters';
import {LoggerWrapper, performUpload, prepareFormData, UploadError} from './CommonUpload';
import FormData from 'form-data';
import axios, { AxiosRequestConfig } from 'axios';
import { extractProxyOptions } from './ProxyUpload';

/**
 * Uploads a coverage file to artifactory with the provided configuration.
 */
export async function uploadToArtifactory(
	config: ConfigParameters,
	logger: LoggerWrapper,
	coverageFile: string,
	lines: number
): Promise<void> {
	if (!(config.artifactory_access_token || (config.artifactory_user && config.artifactory_password))) {
		throw new UploadError('API key or user name and password must be configured!');
	}

	if (lines === 0) {
		return;
	}

	logger.info('Preparing upload to Artifactory');

	const form = prepareFormData(coverageFile);
	await performArtifactoryUpload(config, form, logger);
}

async function performArtifactoryUpload(config: ConfigParameters, form: FormData, logger: LoggerWrapper) {
	if (!config.teamscale_commit) {
		throw new UploadError('The "--teamscale-commit" option must be set with a valid branch and timestamp.');
	}
	const branchAndTimestamp: string[] = config.teamscale_commit.split(':');
	let url = `${config.artifactory_server_url?.replace(/\/$/, '')}/uploads/${branchAndTimestamp[0]}/${
		branchAndTimestamp[1]
	}`;
	if (config.teamscale_revision) {
		url = url + `-${config.teamscale_revision}`;
	}
	url = url + `/${config.teamscale_partition}/simple`;
	if (config.artifactory_path_suffix !== undefined) {
		url = `${url}/${config.artifactory_path_suffix}`;
	}
	url = `${url}/report.simple`;

	await performUpload(url, form, prepareArtifactoryConfig(config, form), axios.put, logger);
}

function prepareArtifactoryConfig(config: ConfigParameters, form: FormData): AxiosRequestConfig<FormData> {
	const proxyConfig = extractProxyOptions(config);
	if (config.artifactory_access_token) {
		return {
			headers: {
				Accept: '*/*',
				'X-JFrog-Art-Api': config.artifactory_access_token,
				'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`
			},
			proxy: proxyConfig
		};
	}
	return {
		auth: {
			username: config.artifactory_user ?? 'no username provided',
			password: config.artifactory_password ?? 'no password provided'
		},
		headers: {
			Accept: '*/*',
			'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`
		},
		proxy: proxyConfig
	};
}
