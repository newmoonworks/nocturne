import chalk from 'chalk';
import pjson from "../../package.json";

export default class Alert {
    constructor() {}

    public static pull(message: string): void {
        console.log(chalk.bold.rgb(255,196,40)(pjson.version + " PULL") + ` ${chalk.white(`| ${message}`)}`)
    }
}