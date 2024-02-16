import { CollectorSpecifier, CollectorSpecifierRelative } from "../types";

export class CollectorUrlResolver {

    static resolve(specifier: CollectorSpecifier): string {
        switch (specifier.type) {
            case 'url':
                return specifier.url;
            case 'relative':
                return CollectorUrlResolver.resolveRelative(location.host, location.port, specifier);
        }
    }

    static resolveRelative(host: string, port: string, specifier: CollectorSpecifierRelative): string {
        let newHost = host
        if (specifier.hostReplace) {
            newHost = host.replace(specifier.hostReplace.search, specifier.hostReplace.replace)
        }

        const scheme = specifier.scheme ?? "ws";

        let portSection: string
        if (specifier.port === undefined) {
            portSection = ""
        } else if (specifier.port === "keep") {
            portSection = `:${port}`
        } else {
            portSection = `:${specifier.port}`
        }

        let pathSection = ""
        if (specifier.path) {
            pathSection = `/${specifier.path}`
        }

        const url = `${scheme}://${newHost}${portSection}${pathSection}`
        console.debug(`Resolved collector URL ${url} from ${host}:${port}`)
        return url
    }
}