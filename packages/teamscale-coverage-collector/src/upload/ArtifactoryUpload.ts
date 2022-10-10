import {ConfigParameters} from "../utils/ConfigParameters";
import Logger from "bunyan";
import {CommonUpload, UploadError} from "./CommonUpload";
import FormData from "form-data";
import axios, {AxiosRequestConfig} from "axios";

export class ArtifactoryUpload {

    public static async uploadToArtifactory(
        config: ConfigParameters,
        logger: Logger,
        coverageFile: string,
        lines: number
    ): Promise<void> {
        if (!(config.teamscale_access_token || (config.teamscale_user && config.teamscale_server_url))) {
            throw new UploadError('API key or user name and password must be configured!');
        }

        if (lines === 0) {
            return;
        }

        logger.info('Preparing upload to Artifactory');

        const form = CommonUpload.prepareFormData(coverageFile);
        await this.performArtifactoryUpload(config, form, logger);
    }

    private static async performArtifactoryUpload(
        config: ConfigParameters,
        form: FormData,
        logger: Logger
    ) {
        if(!config.teamscale_commit){
            throw new UploadError('The "--teamscale-commit" option must be set with a valid branch and timestamp.')
        }
        const branchAndTimestamp: string[] = config.teamscale_commit.split(':');
        let url = `${config.artifactory_server_url?.replace(/\/$/, '')}/uploads/${branchAndTimestamp[0]}/${branchAndTimestamp[1]}/${config.teamscale_partition}/simple`;
        if (config.artifactory_path_suffix !== undefined) {
            url = `${url}/${config.artifactory_path_suffix}`;
        }
        url = `${url}/report.simple`;
        let uploadConfig: AxiosRequestConfig<FormData>;
        if (config.artifactory_access_token) {
            uploadConfig = {
                headers: {
                    Accept: '*/*',
                    'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`
                }
            }
        } else {
            uploadConfig = {
                auth: {
                    username: config.artifactory_user ?? 'no username provided',
                    password: config.artifactory_password ?? 'no password provided'
                },
                headers: {
                    Accept: '*/*',
                    'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`
                }
            }
        }
        await CommonUpload.performUpload(url,
            form,
            uploadConfig,
            axios.put,
            logger)
    }
}