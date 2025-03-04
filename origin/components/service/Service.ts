import { ServiceStatus, IService, ExposedService } from "../../types";
import ServiceManager from "./ServiceManager";
import Timer from "./Timer";
import ServiceOutputCache from "./ServiceOutputCache";
import { resolve } from "path";

import { spawn, exec, ChildProcess } from "child_process";

/**
 * Service holds all permanent service information pulled from the BSON file, as well as temporary, in-memory information.
 */
export default class Service implements IService { 
    public name: string;
    public uuid: string;
    public path: string;
    public execute: string;
    public tag: string;

    private process: ChildProcess = null;
    private timer: Timer = new Timer();
    public status: ServiceStatus = ServiceStatus.OFFLINE;
    private outputCache: ServiceOutputCache = new ServiceOutputCache();

    constructor(name: string, path: string, uuid: string, tag?: string, attributes?: { execute?: string; }) {
        this.name = name;
        this.path = path;
        this.uuid = uuid;

        console.log("constructor: " + tag)

        this.tag = tag ?? "";
        this.execute = attributes?.execute ?? "";
    }

    /**
     * Starts the node.js process, and listens for its events.
     */
    public async start(): Promise<void> {
        if (this.isServiceRunning()) throw new Error("Service is already running.");
    
        this.status = ServiceStatus.STARTING;
        this.timer.start();
    
        return new Promise<void>((resolve, reject) => {
            try {
                this.initializeProcess(async () => {
                    try {
                        this.logOutput();
                        this.setupProcessListeners(reject);
                        this.finalizeStartup(resolve, reject);
                    } catch (error) {
                        reject(error);
                    }
                });
            } catch (error) {
                this.status = ServiceStatus.CRASHED;
                console.error("Failed to start service:", error);
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        });
    }
    
    // Checks if the service is already running
    private isServiceRunning(): boolean {
        return [ServiceStatus.IDLE, ServiceStatus.ONLINE, ServiceStatus.STARTING].includes(this.status);
    }
    
    // Starts the process using either controlledRun or pathRun
    private initializeProcess(callback: () => void): void {
        this.execute ? this.controlledRun(callback) : this.pathRun(callback);
    }
    
    // Handles the final transition of the service to ONLINE
    private finalizeStartup(resolve: () => void, reject: (error: Error) => void): void {
        const startupTimeout = 500;

        setTimeout(() => {
            if (this.process && this.status === ServiceStatus.STARTING) {
                console.log("Service is now online.");
                this.status = ServiceStatus.ONLINE;
                resolve();
            } else {
                reject(new Error("Unexpected service state after initialization."));
            }
        }, startupTimeout);
    }
    

    private setupProcessListeners(reject: (reason?: any) => void): void {
        this.process.on("error", (error) => {
            this.status = ServiceStatus.CRASHED;
            console.error("Failed to start process:", error);
            console.log(":OMG CRASH SENT")
            reject(error);
        });

        this.process.on("exit", (code, signal, error) => {
            this.stop(code);
            console.log(code)

            reject(error);
        });

        this.process.on("SIGTERM", () => {
            this.stop();
        });

        this.process.on("SIGINT", () => {
            this.stop();
        });
    }
    

    public async stop(code?: number): Promise<void> {
        if (!this.process) throw new Error("Process has not been started.");

        this.process.kill();
        this.timer.stop();


        if (code != 0 || !code) this.status = ServiceStatus.CRASHED;
        else this.status = ServiceStatus.OFFLINE;

        console.log("Process has been closed.");

        this.process = null;
    }

    /**
     * Starts the node.js process not just from the path, but with the specified NPM command.
     */
    private controlledRun(callback: () => void): void {
        this.process = spawn('npm', [this.execute], {
            cwd: this.path,
            stdio: 'inherit',
            shell: true
        });

        if (this.process) {
            callback();
        }
    }

    private pathRun(callback: () => void): void {
        this.process = spawn('node', [this.path], { stdio: 'pipe' });

        if (this.process) {
            callback();
        }
    }

    private logOutput(): void {
        if (!this.process || !this.process.stdout) throw new Error("Service must be online to log output.");

        this.process.stdout.on('data', (data) => {
            this.outputCache.addOutput(data.toString());
        })

        this.process.stderr.on('data', (data) => {
            console.error(`Error: ${data.toString()}`)
        });
    }

    /**
     * Updates the name of the service instance itself, as well as the BSON file object.
     * 
     * @param name 
     */
    public async alterName(name: string): Promise<void> {
        try {
            if (!name || name.trim().length === 0) throw new Error();

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
        const modifiedPath = `${ServiceManager.servicePath}/${this.uuid}/${path}`;
        const containeredPath: string = resolve(ServiceManager.__dirname, modifiedPath);

        try {
            await ServiceManager.alterBSONServiceParameter(this.uuid, "path", containeredPath);
            this.path = containeredPath;
        } catch (error) {
            console.error(`Failed to alter path: ${error.message}`);
            throw error;
        }
    }

    public toExposedFormat(): ExposedService {
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