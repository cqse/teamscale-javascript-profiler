import {ConfigParameters} from "../utils/ConfigParameters";
import {AxiosProxyConfig} from "axios";

/**
 * Creates an AxiosProxyConfig object if proxy variables are provided.
 */
export function addProxyOptions(config: ConfigParameters): AxiosProxyConfig | undefined {
    if (config.proxy_url && config.proxy_port) {
        const proxyConfig: AxiosProxyConfig = {
            host: config.proxy_url,
            port: config.proxy_port
        };
        if (config.proxy_user && config.proxy_password) {
            proxyConfig.auth = {
                username: config.proxy_user,
                password: config.proxy_password
            }
        }
        return proxyConfig;
    }
}