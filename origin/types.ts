import Timer from "./components/service/Timer";
import { ChildProcess } from "child_process";

export enum ServiceStatus {
    ONLINE = 0,
    IDLE = 1,
    OFFLINE = 2,
    CRASHED = 3,
}

export interface IService {
    name: string;
    path: string;
    status: ServiceStatus;
    execute?: string;
}

/**
 * The concept of "Exposed" is a public data structure that hides 
 * unnecessarily available properties of a class from being sent to a requesting client,
 * or shows required details of a class that are otherwise not available due to a private or protected status.
 * 
 * For example, the Service class features a ChildProcess property that is private, and not needed information to be shared with other clients.
 * On the other hand, "timer" is a private property that has uptime information that needs to be shared with other clients.
 * 
 * This practice is called "Data Encapsulation"
 */
export type ExposedService = {
    readonly uuid: string;
    readonly name: string;
    readonly path: string;
    readonly status: ServiceStatus;
    readonly timer: ExposedTimer;
    readonly output: ExposedServiceOutputCache;
    readonly execute?: string;
}

export type ExposedServiceOutputCache = {
    readonly outputs: string[];
}

export type ExposedTimer = {
    readonly time: number,
    readonly uptime: Uptime,
    readonly started: Date
}

export type Uptime = {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
}

export interface JSONService {
    name: string;
    path: string;
    uuid: string;
    execute?: string;
}

export interface DeserializedData {
    services: JSONService[];
}