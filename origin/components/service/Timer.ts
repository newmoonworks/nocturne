import { Uptime } from "../../types";

export default class Timer {
    public time: number = 0;
    public loop: NodeJS.Timeout = null;
    public started: Date = null;
    public listening: boolean = false;

    public constructor() {};

    /**
     * Starts the timer, adding a second each interval.
     */
    public start(): void {
        this.started = new Date();

        this.loop = setInterval(() => {
            this.time++;

            if (this.listening) console.log(this.time)
        }, 1000);
    }

    /**
     * Breaks the interval loop, stopping the timer.
     */
    public stop() {
        if (!this.loop) throw new Error("Timer has never been started.");

        this.time = 0;
        clearInterval(this.loop);
    }

    public getSeconds(): number {
        return this.time;
    }

    /**
     * Divides the total seconds by their represented values, returning a more coherent amount of time.
     * 
     * @returns 
     */
    public getUptime(): Uptime {
        const days = Math.floor(this.time / (24 * 60 * 60));
        const hours = Math.floor((this.time % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((this.time % (60 * 60)) / 60);
        const seconds = this.time % 60;
      
        return { days, hours, minutes, seconds } as Uptime;
    }

    /**
     * Switches a boolean, if enabled, logs each interval.
     */
    public listen(): void {
        this.listening = !this.listening;
    }
}