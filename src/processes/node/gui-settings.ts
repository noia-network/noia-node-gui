import * as fs from "fs-extra";

export interface GuiSettings {
    minimizeToTray: boolean;
    autoReconnect: boolean;
}

export class GuiSettingsHandler<TSettings extends GuiSettings> {
    private constructor(protected readonly filePath: string) {}

    private contents: { [key: string]: unknown } = {};

    public static async init<TSettings extends GuiSettings>(filePath: string): Promise<GuiSettingsHandler<TSettings>> {
        const instance = new this<TSettings>(filePath);
        await instance.ensureFile();
        await instance.readFile();

        return instance;
    }

    private async ensureFile(): Promise<void> {
        const exists = await fs.pathExists(this.filePath);

        if (!exists) {
            await fs.writeJson(this.filePath, this.contents);
        }
    }

    private async readFile(): Promise<void> {
        try {
            const contents = await fs.readJson(this.filePath);
            if (contents == null || contents === "") {
                return;
            }

            this.contents = contents;
        } catch {
            await fs.writeJson(this.filePath, {});
        }
    }

    private async updateFile(): Promise<void> {
        await fs.writeJson(this.filePath, this.contents, { spaces: 4 });
    }

    public getAllSettings(): { [key: string]: unknown } {
        return this.contents;
    }

    public async update<TKey extends keyof TSettings>(key: TKey, value: TSettings[TKey]): Promise<void> {
        this.contents[key as string] = value;
        await this.updateFile();
    }

    public async ensure<TKey extends keyof TSettings>(key: TKey, defaultValue?: TSettings[TKey]): Promise<TSettings[TKey]> {
        const $key = key as string;
        if (this.contents[$key] == null && defaultValue != null) {
            await this.update<TKey>(key, defaultValue);
        }

        return this.contents[$key] as TSettings[TKey];
    }

    public get<TKey extends keyof TSettings>(key: TKey, defaultValue?: TSettings[TKey]): TSettings[TKey] {
        const $key = key as string;
        return this.contents[$key] as TSettings[TKey];
    }
}
