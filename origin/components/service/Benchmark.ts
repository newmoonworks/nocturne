import { EventEmitter } from 'events';
import pidusage from "pidusage";
import Alert from "../Alert";
import { ChildProcess } from 'child_process';
import { ExposedBenchmark } from '@types';

export default class Benchmark extends EventEmitter {
    private uuid: string;
    private process: ChildProcess;

    public cpu: number = 0;
    public memory: number = 0;
    public storage: number = 0;

    private benchmarkInverval: NodeJS.Timeout;

    constructor(uuid: string, process?: ChildProcess) {
        super();

        this.uuid = uuid;
        this.process = process ?? null;
    }

    public start() {
        if (!this.process) throw new Error("Process has not been initialized. The process may have not been started.");

        Alert.developer(`Benchmark has been started for ${this.uuid}`);

        this.benchmarkInverval = setInterval(() => {
            pidusage(this.process.pid as number, (error, stats) => {
                if (error) {
                    console.error(error);
                }

                this.cpu = stats.cpu;
                this.memory = stats.memory / 1024 / 1024;


                console.log(`CPU: ${stats.cpu} ${stats.memory / 1024 / 1024}`)
            })
        }, 3000)
    }

    public stop() {
        if (!this.benchmarkInverval) throw new Error("Benchmark interval does not exist. The process may not have been started.");
        if (!this.process) throw new Error("Process has not been initialized. The process may have not been started.");

        Alert.developer(`Benchmark has been stopped for ${this.uuid}`);

        clearInterval(this.benchmarkInverval);
    }

    public initializeProcess(process: ChildProcess): void {
        this.process = process;
    }

    public isProcessInitialized(): boolean {
        if (!this.process) return false;

        return true;
    }

    public toExposedFormat(): ExposedBenchmark {
        return { cpu: this.cpu, memory: this.memory, storage: this.storage };
    }
}