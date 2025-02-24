import { ServiceStatus, IService, ExposedService } from "../../types";
import ServiceManager from "./ServiceManager";
import Timer from "./Timer";
import ServiceOutputCache from "./ServiceOutputCache";

import { spawn, exec, ChildProcess } from "child_process";

/**
 * Service holds all permanent service information pulled from the BSON file, as well as temporary, in-memory information.
 */
export default class Service implements IService { 
    public name: string;
    public uuid: string;
    public path: string;
    public execute: string;

    private process: ChildProcess = null;
    private timer: Timer = new Timer();
    public status: ServiceStatus = ServiceStatus.OFFLINE;
    private outputCache: ServiceOutputCache = new ServiceOutputCache();

    constructor(name: string, path: string, uuid: string, attributes?: { execute?: string; }) {
        this.name = name;
        this.path = path;
        this.uuid = uuid;

        this.execute = attributes?.execute ?? "";
    }

    /**
     * Starts the node.js process, and listens for its events.
     */
    public async start(): Promise<void> {
        if (this.status === ServiceStatus.IDLE || this.status === ServiceStatus.ONLINE) {
            throw new Error("Service is already running");
        }
    
        if (this.execute) {
            this.controlledRun();
        } else {
            this.pathRun();
        }
    
        this.status = ServiceStatus.ONLINE; // Indicate the process is initializing
        this.timer.start();
    
        return new Promise<void>((resolve, reject) => {
            this.logOutput();
            
            this.process.once("error", (error) => {
                this.status = ServiceStatus.CRASHED;
                console.error("Failed to start process:", error);
                reject(error);
                return;
            });
    
            this.process.once("exit", () => this.stop());
            // this.process.once("close", () => this.stop()); // ALIAS
    
            console.log("Setting to online")
            this.status = ServiceStatus.ONLINE;
            resolve();
        });
    }
    

    public async stop(): Promise<void> {
        if (!this.process) throw new Error("Process has not been started.");
        if (this.status != ServiceStatus.ONLINE) throw new Error("Process is not online.");

        this.process.kill();
        this.timer.stop();
        this.status = ServiceStatus.OFFLINE;
        console.log("setting to offline")
    }

    /**
     * Starts the node.js process not just from the path, but with the specified NPM command.
     */
    private controlledRun(): void {
        this.process = spawn('npm', [this.execute], {
            cwd: this.path,
            stdio: 'inherit',
            shell: true
        });
    }

    private pathRun(): void {
        this.process = spawn('node', [this.path], { stdio: 'inherit' });
    }

    private logOutput(): void {
        if (!this.process || this.status !== ServiceStatus.ONLINE) throw new Error("Service must be online to log output.");

        this.process.stdout.on('data', (data) => {
            this.outputCache.addOutput(data.toString());
        })
    }

    /**
     * Updates the name of the service instance itself, as well as the BSON file object.
     * 
     * @param name 
     */
    public async alterName(name: string): Promise<void> {
        try {
            await ServiceManager.alterBSONServiceParameter(this.uuid, "name", name);
            this.name = name; // Update the local property only after successful persistence.
        } catch (error) {
            console.error(`Failed to alter name: ${error.message}`);
            throw error; // Propagate the error if needed.
        }
    }

    /**
     * Updates the path of the service instance itself, as well as  the BSON file object.
     * Path is used for running Node.JS scripts that do not require specialized NPM commands; Running the file directly.
     * 
     * @param path 
     */
    public async alterPath(path: string): Promise<void> {
        try {
            await ServiceManager.alterBSONServiceParameter(this.uuid, "path", path);
            this.path = path;
        } catch (error) {
            console.error(`Failed to alter path: ${error.message}`);
            throw error;
        }
    }

    public toExposedServiceFormat(): ExposedService {
        return {
            uuid: this.uuid,
            name: this.name,
            path: this.path,
            execute: this.execute,
            status: this.status,
            output: this.outputCache.toExposedFormat(),
            timer: this.timer.toExposedFormat(),
        } as ExposedService;
    }
}