import { Contract, IllegalArgumentException } from "@cqse/commons";
import { CollectorSpecifierRelative } from "@src/vaccine/types";

/** Parses a relative collector pattern. */
export class RelativeCollectorPatternParser {

    /** Parses the given pattern. */
    static parse(pattern: string): CollectorSpecifierRelative {
        const parts = pattern.split(",");
        const specifier: CollectorSpecifierRelative = {
            type: "relative"
        };

        for (const part of parts) {
            const colonIndex = part.indexOf(":");
            Contract.require(colonIndex > -1,
                `Invalid relative collector pattern ${pattern}: ${part} has no colon after the operation`);
            const operation = part.substring(0, colonIndex);
            const value = part.substring(colonIndex + 1);
            RelativeCollectorPatternParser.apply(operation, value, specifier);
        }

        return specifier;
    }

    private static apply(operation: string, value: string, specifier: CollectorSpecifierRelative) {
        switch (operation) {
            case "port":
                Contract.requireStringPattern(value, /[0-9]+|keep/,
                    `Invalid relative collector pattern: port must be a number: ${value}`);
                if (value === "keep") {
                    specifier.port = value;
                } else {
                    specifier.port = parseInt(value);
                }
                break;
            case "replace-in-host":
                Contract.requireStringPattern(value, /[^ ]+ [^ ]*/,
                    `Invalid relative collector pattern: replace-in-host must contain exactly one space to separate search string and replacement: ${value}`);
                const parts = value.split(" ")
                specifier.hostReplace = {
                    search: parts[0],
                    replace: parts[1],
                };
                break;
            case "path":
                specifier.path = value;
                break;
            case "scheme":
                Contract.requireStringPattern(value, /ws|wss|http|https/i,
                    `Invalid relative collector pattern: scheme must be one of ws, wss, http or https: ${value}`);
                specifier.scheme = value.toLowerCase();
                break;
            default:
                throw new IllegalArgumentException(`Invalid relative collector pattern: unknown operation ${operation}`);
        }
    }
}