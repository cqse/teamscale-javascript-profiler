import FormData from 'form-data';
import fs from 'fs';
import Logger from 'bunyan';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { inspect } from 'util';

/**
 * Error that is thrown when the upload failed
 */
export class UploadError extends Error {
	// No special fields needed compared to Error.
	// Sole use is to be able to distinguish upload errors from other errors.
}

/**
 * Prepares the form data from a given configuration file for the upload.
 */
export function prepareFormData(coverageFile: string): FormData {
	const form = new FormData();
	form.append('report', fs.readFileSync(coverageFile), 'coverage.simple');
	return form;
}

/**
 * Uploads a coverage file with the provided configuration.
 */
export async function performUpload(
	url: string,
	form: FormData,
	config: AxiosRequestConfig<FormData>,
	uploadFunction: <T = any, R = AxiosResponse<T>, D = FormData>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig<D>
	) => Promise<R>,
	logger: Logger
): Promise<void> {
	try {
		const response = await uploadFunction(url, form, config);
		logger.info(`Upload finished with code ${response.status}.`);
	} catch (error: any) {
		if (error.response) {
			const response = error.response;
			if (response.status >= 400) {
				throw new UploadError(
					`Upload failed with code ${response.status}: ${response.statusText}. Response Data: ${response.data}`
				);
			} else {
				logger.info(`Upload with status code ${response.status} finished.`);
			}
		} else if (error.request) {
			throw new UploadError(`Upload request did not receive a response.`);
		}

		if (error.message) {
			logger.debug(
				`Something went wrong when uploading data: ${error.message}. Details of the error: ${inspect(error)}`
			);
			throw new UploadError(`Something went wrong when uploading data: ${error.message}`);
		} else {
			throw new UploadError(`Something went wrong when uploading data: ${inspect(error)}`);
		}
	}
}
