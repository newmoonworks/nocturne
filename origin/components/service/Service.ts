import { ServiceStatus, IService } from "../../types";
import ServiceManager from "./ServiceManager";
import Timer from "./Timer";

import { spawn, exec, ChildProcess } from "child_process";

/**
 * Service holds all permanent service information pulled from the BSON file, as well as temporary, in-memory information.
 */
export default class Service implements IService { 
    public process: ChildProcess = null;
    public name: string;
    public uuid: string;
    public path: string;
    public execute: string;
    public timer: Timer = new Timer();
    public status: ServiceStatus = ServiceStatus.OFFLINE;

    constructor(name: string, path: string, uuid: string, attributes?: { execute?: string; }) {
        this.name = name;
        this.path = path;
        this.uuid = uuid;

        if (attributes?.execute) this.execute = attributes.execute;
    }

    /**
     * Starts the node.js process, and listens for its events.
     */
    public async start(): Promise<void> {
        new Promise((resolve, reject) => {
            if (this.status == ServiceStatus.IDLE || this.status == ServiceStatus.ONLINE) reject(new Error("Service is already running"));

            if (this.execute) this.controlledRun();
            else this.pathRun();

            this.timer.start();
            this.status = ServiceStatus.ONLINE;

            this.process.on('close', (code) => {
                this.stop();
            })

            this.process.on('exit', (code) => {
                this.stop();
            })

            this.process.on('error', (error) => {
                this.status = ServiceStatus.CRASHED;

                console.error('Failed to start process:', error);
            });

            resolve("Service successfully started");
        });
    }

    public async stop(): Promise<void> {
        this.timer.stop();
        this.status = ServiceStatus.OFFLINE;
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
}