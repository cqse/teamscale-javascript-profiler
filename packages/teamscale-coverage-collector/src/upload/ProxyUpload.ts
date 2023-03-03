import {ConfigParameters} from "../utils/ConfigParameters";
import {AxiosProxyConfig} from "axios";
import url from "url";

/**
 * Creates an AxiosProxyConfig object if proxy variables are provided.
 */
export function addProxyOptions(config: ConfigParameters): AxiosProxyConfig | undefined {
    let proxyConfig: AxiosProxyConfig | undefined;
    if (config.http_proxy) {
        // Expected format: http://host:port/
        // See https://nodejs.org/api/url.html#url-strings-and-url-objects for URL parsing
        const proxyAddress = new url.URL(config.http_proxy);
        proxyConfig = {
            host: proxyAddress.hostname,
            port: +proxyAddress.port
        };
    }
    if (config.https_proxy) {
        // Expected format: http://username:password@host:port/
        const proxyAddress = new url.URL(config.https_proxy);
        proxyConfig = {
            host: proxyAddress.hostname,
            port: +proxyAddress.port,
            auth: {
                username: proxyAddress.username,
                password: proxyAddress.password
            }
        };
    }
    return proxyConfig;
}