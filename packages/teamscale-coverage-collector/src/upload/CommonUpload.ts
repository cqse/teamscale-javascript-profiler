import FormData from 'form-data';
import fs from 'fs';
import Logger from 'bunyan';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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
	uploadFunction: <T = unknown, R = AxiosResponse<T>, D = FormData>(
		url: string,
		data?: D,
		config?: AxiosRequestConfig<D>
	) => Promise<R>,
	logger: Logger
): Promise<void> {
	try {
		const response = await uploadFunction(url, form, config);
		logger.debug(`Upload finished with code ${response.status}.`);
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			let userMessage;

			if (error.message) {
				logger.error(`Upload error ${error.status ?? 'UNDEFINED'}: ${error.message}`);
			}

			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				logger.error('Upload error response data:', error.response.data);
				logger.error('Upload error response status:', error.response.status);
				logger.error('Upload error response headers:', JSON.stringify(error.response.headers));

				userMessage = `Request failed with status ${error.response.status}: ${error.response.data ?? ''}`;
			} else if (error.request) {
				// The request was made but no response was received
				userMessage = 'No response received for the request.';
			} else {
				// Something happened in setting up the request that triggered an Error
				userMessage = 'Request setup failed.';
			}

			// Provide a more specific message if possible
			throw new UploadError(`Something went wrong when uploading data: ${userMessage}`);
		}

		throw new UploadError(`Something went wrong when uploading data: ${inspect(error)}`);
	}
}
