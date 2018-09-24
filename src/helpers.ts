import * as dns from "dns";
import * as diskusage from "diskusage-ng";

export namespace Helpers {
    export const IS_WIN32: boolean = process.platform === "win32";

    export async function isInternetConnectionAvailable(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            dns.lookupService("8.8.8.8", 53, error => {
                if (error != null && error.code != null && ["ENOTFOUND", "EAI_AGAIN"].indexOf(error.code) !== -1) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
    export interface ParsedStorageResult {
        value: number;
        unit: string;
    }

    export function parseStorageText(text: string): ParsedStorageResult {
        text = text.toUpperCase();

        const match = text.match(/([0-9]+|[0-9]+.[0-9]+)([A-Z]+)/);
        if (match == null) {
            return {
                value: 0,
                unit: "B"
            };
        }

        const value = Number(match[1]);
        const unit = match[2];

        return {
            value: isNaN(value) ? 0 : value,
            unit: unit
        };
    }

    export async function checkDiskSize(path: string): Promise<diskusage.DiskUsageResult> {
        return new Promise<diskusage.DiskUsageResult>((resolve, reject) => {
            if (process.platform === "win32") {
                path = path.split(":")[0].toUpperCase() + ":/";
            }

            diskusage(path, (error, result) => {
                if (error != null) {
                    reject(error);
                    return;
                }

                resolve(result);
            });
        });
    }

    export function arraysEqual<TArray = unknown>(a: TArray[], b: TArray[]): boolean {
        if (a === b) {
            return true;
        }
        if (a.length !== b.length) {
            return false;
        }

        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }

    // TODO: Update this when settings format changes.
    export function isEqual(a: unknown, b: unknown): boolean {
        if (Array.isArray(a) && Array.isArray(b)) {
            return arraysEqual(a, b);
        }

        // Objects are not supported.

        return a === b;
    }
}
