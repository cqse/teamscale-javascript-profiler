import {ConfigParameters} from "../utils/ConfigParameters";
import Logger from "bunyan";
import QueryParameters from "../utils/QueryParameters";
import FormData from "form-data";
import {CommonUpload, UploadError} from "./CommonUpload";
import axios, {AxiosRequestConfig} from "axios";

/**
 * The class providing functionality to upload reports to Teamscale.
 */
export class TeamscaleUpload {

    /**
     * Uploads a coverage file to Teamscale with the provided configuration.
     */
    public static async uploadToTeamscale(
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

        const form = CommonUpload.prepareFormData(coverageFile);
        const queryParameters = this.prepareQueryParameters(config);
        await this.performTeamscaleUpload(config, queryParameters, form, logger);
    }

    private static async performTeamscaleUpload(
        config: ConfigParameters,
        parameters: QueryParameters,
        form: FormData,
        logger: Logger
    ) {
        await CommonUpload.performUpload(`${config.teamscale_server_url?.replace(/\/$/, '')}/api/projects/${
                config.teamscale_project
            }/external-analysis/session/auto-create/report?${parameters.toString()}`,
            form,
            this.prepareTeamscaleConfig(config, form),
            axios.post,
            logger)
    }

    private static prepareQueryParameters(config: ConfigParameters) {
        const parameters = new QueryParameters();
        parameters.addIfDefined('format', 'SIMPLE');
        parameters.addIfDefined('message', config.teamscale_message);
        parameters.addIfDefined('repository', config.teamscale_repository);
        parameters.addIfDefined('t', config.teamscale_commit);
        parameters.addIfDefined('revision', config.teamscale_revision);
        parameters.addIfDefined('partition', config.teamscale_partition);
        return parameters;
    }

    private static prepareTeamscaleConfig(config: ConfigParameters, form: FormData): AxiosRequestConfig<FormData> {
        return {
            auth: {
                username: config.teamscale_user ?? 'no username provided',
                password: config.teamscale_access_token ?? 'no password provided'
            },
            headers: {
                Accept: '*/*',
                'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`
            }
        }
    }

}