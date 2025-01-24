import Timer from "./components/service/Timer";

export enum ServiceStatus {
    ONLINE = 0,
    IDLE = 1,
    OFFLINE = 2,
    CRASHED = 3,
}

export interface IService {
    process;
    name: string;
    path: string;
    status: ServiceStatus;
    timer: Timer;
    execute?: string;
}

/**
 * Restricted and simplified data structure to be sent through HTTP, and used by other services.
 */
export type ShareableService = {
    name: string;
    path: string;
    status: ServiceStatus;
    started: Date;
    Uptime: Uptime;
    execute?: string;
}

export type Uptime = {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
}