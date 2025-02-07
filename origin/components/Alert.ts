import chalk from 'chalk';
import pjson from "../../package.json";

export default class Alert {
    constructor() {}

    public static pull(message: string): void {
        console.log(chalk.bold.rgb(255,196,40)(pjson.version + " PULL") + ` ${chalk.white(`| ${message}`)}`)
    }

    public static construct(message: string): void {
        console.log(chalk.bold.rgb(59, 255, 105)(pjson.version + " CONSTRUCT") + ` ${chalk.white(`| ${message}`)}`)
    }

    public static deconstruct(message: string): void {
        console.log(chalk.bold.rgb(255, 59, 59)(pjson.version + " DECONSTRUCT") + ` ${chalk.white(`| ${message}`)}`)
    }

    public static status(message: string): void {
        console.log(chalk.bold.rgb(137, 59, 255)(pjson.version + " STATUS") + ` ${chalk.white(`| ${message}`)}`)
    }
}