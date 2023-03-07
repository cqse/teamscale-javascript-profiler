import {ConfigParameters} from "../utils/ConfigParameters";
import {AxiosProxyConfig} from "axios";
import url from "url";

/**
 * Creates an AxiosProxyConfig object if proxy variables are provided.
 */
export function extractProxyOptions(config: ConfigParameters): AxiosProxyConfig | undefined {
    if (config.http_proxy) {
        // Expected format: http://username:password@host:port/
        // See https://nodejs.org/api/url.html#url-strings-and-url-objects for URL parsing
        const proxyAddress = new url.URL(config.http_proxy);
        const proxyConfig: AxiosProxyConfig = {
            host: proxyAddress.hostname,
            port: +proxyAddress.port,
        };
        if (proxyAddress.username && proxyAddress.password) {
            proxyConfig.auth = {
                username: proxyAddress.username,
                password: proxyAddress.password
            }
        }
        return proxyConfig;
    }
}