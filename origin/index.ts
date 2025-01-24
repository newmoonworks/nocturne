
import { Constellation } from "./components/constellation/Constellation";

import fs from "fs";
import YAML from "yaml";
import chalk, { ChalkInstance } from "chalk";
import Route from "@components/constellation/components/Route";

export const configuration = YAML.parse(fs.readFileSync("./Configuration.yml", 'utf8'));

const constellation = new Constellation(Constellation.fetchDirname(import.meta.url), "/Routes/");

constellation.listen(configuration.SERVER.PORT, configuration.SERVER.IP_ADDRESS, async () => {
    const accentColor: number[] = configuration.SERVER.RGB;

    setTimeout(() => {
        console.log([
            console.log(chalk.bold.rgb(accentColor[0], accentColor[1], accentColor[2])(configuration.SERVER.SERVICE)),
            console.log(`Daemon service to manage, log processes, and transfer service data locally.`),
            console.log(` • Running on port ${chalk.rgb(accentColor[0], accentColor[1], accentColor[2])(configuration.SERVER.PORT)}`),
            console.log(` • Routes:`),
            console.log(formatRoutes(Constellation.routes)),
            console.log(chalk.bold.rgb(accentColor[0], accentColor[1], accentColor[2])(T.serialize("Provided by Newmoon Works"))),
        ].join("\n"));
    }, 150)
});


function formatRoutes(routes: Route[]): string {
    let collection: string = "";

    for (const route of routes) {
        const methodAccent: { [key: string]: ChalkInstance } = {
            GET: chalk.magenta.bold,
            POST: chalk.yellow.bold,
            DELETE: chalk.red.bold
        };


        collection += `    ${methodAccent[route.method](T.serialize(route.method))} ${route.path}\n`
    }

    return collection;
}

class T {
    private static readonly smallCapsMap = new Map<string, string>([
        ['a', 'ᴀ'],
        ['b', 'ʙ'],
        ['c', 'ᴄ'],
        ['d', 'ᴅ'],
        ['e', 'ᴇ'],
        ['f', 'ғ'],
        ['g', 'ɢ'],
        ['h', 'ʜ'],
        ['i', 'ɪ'],
        ['j', 'ᴊ'],
        ['k', 'ᴋ'],
        ['l', 'ʟ'],
        ['m', 'ᴍ'],
        ['n', 'ɴ'],
        ['o', 'ᴏ'],
        ['p', 'ᴘ'],
        ['q', 'ᴏ̨'],
        ['r', 'ʀ'],
        ['s', 's'],
        ['t', 'ᴛ'],
        ['u', 'ᴜ'],
        ['v', 'ᴠ'],
        ['w', 'ᴡ'],
        ['x', 'x'],
        ['y', 'ʏ'],
        ['z', 'ᴢ'],
    ]);

    public static serialize(message: string): string {
        return message
            .toLowerCase()
            .split('')
            .map(character => this.smallCapsMap.get(character) || character)
            .join('');
    }
}

// import ServiceManager from "@components/service/ServiceManager";

// ServiceManager.constructService("hello service", "../dsa.js", "fsdfdsfds")
// ServiceManager.read();