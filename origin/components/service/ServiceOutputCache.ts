import { ExposedServiceOutputCache } from "@types";
import fs from "fs";
import YAML from "yaml";

export const configuration = YAML.parse(fs.readFileSync("./Configuration.yml", 'utf8'));

export default class ServiceOutputCache {
    public outputs: string[];
    private static readonly LIMIT: number = configuration.SERVICE.LIMIT;

    constructor() {}

    public addOutput(output: string) {
        if (this.outputs.length >= ServiceOutputCache.LIMIT) this.outputs.splice(0, 1);
        
        this.outputs.push(output);
    }

    public toString(): string {
        return this.outputs.join('\n');
    }

    public toExposedFormat(): ExposedServiceOutputCache {
        return {
            outputs: this.outputs
        } as ExposedServiceOutputCache;
    }
}