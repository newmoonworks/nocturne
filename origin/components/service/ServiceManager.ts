import { DeserializedData, JSONService, ServiceStatus } from "@types";
import Service from "./Service";

import { BSON, Document } from "bson";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { uuid } from 'uuidv4';

/**
 * ServiceManager allows you to manipulate, identify, and retreive services from in-memory, and the BSON file.
 * ServiceManager also provides methods that ensure the data in the BSON file will be synchronized with the in-memory service instances.
 */
export default class ServiceManager {
    private static readonly __filename = fileURLToPath(import.meta.url);
    private static readonly __dirname = dirname(ServiceManager.__filename);
    private static readonly serviceListPath: string = resolve(ServiceManager.__dirname, "../../../services.bson");

    public static serviceList: Service[] = [];

    constructor() {
        ServiceManager.initializeServices();
    }

    /**
     * Returns record of JSON data deserialized from bytes.
     * 
     * @returns 
     */
    private static getDeserializedData(): DeserializedData {
        let deserializedData:  DeserializedData;
    
        // Check if the file exists and is not empty
        if (fs.existsSync(this.serviceListPath) && fs.statSync(this.serviceListPath).size > 0) {
            const bsonFileBuffer = fs.readFileSync(this.serviceListPath);
            deserializedData = BSON.deserialize(bsonFileBuffer) as DeserializedData;
        } else {
            // Initialize with a default structure if file is empty or missing
            deserializedData = { services: [] };
        }

        return deserializedData as DeserializedData;
    }

    /**
     * Saves modified JSON object, serializes it back into BSON, then writes the new content to the BSON file.
     * 
     * @param data 
     */
    private static saveDeserializedData(data: DeserializedData): void {
        const updatedBsonData = BSON.serialize(data);
        fs.writeFileSync(this.serviceListPath, updatedBsonData);
    }

    /**
     * Creates a new service object, writes it to the BSON file, and creates a service instance and pushes it to the service array in memory.
     * 
     * @param name 
     * @param path 
     * @param execute 
     */
    public static async constructService(name: string, path: string, execute?: string): Promise<Service> {
        let deserializedData = ServiceManager.getDeserializedData();
        const generatedUUID: string = uuid();
    
        // Create the new service object
        const service = {
            name: name,
            path: path,
            uuid: generatedUUID,
            execute: execute
        } as JSONService;
    
        // Add the new service to the list
        deserializedData.services.push(service);
    
        // Serialize the updated data and write it back to the file
        this.saveDeserializedData(deserializedData);
    
        // Initialize the service in memory
        return await this.initializeService(name, path, generatedUUID, execute);
    }

    /**
     * Finds the service in BSON file and deletes it from the temporary array.
     * terminateService is called to then remove the service from the memory.
     * 
     * @param uuid 
     */
    public static async deconstructService(uuid: string): Promise<void> {
        return new Promise((resolve, reject) => {
            let deserializedData = ServiceManager.getDeserializedData();
    
            for (let i = 0; i < deserializedData.services.length; i++) {
                if (deserializedData.services[i].uuid === uuid) {
                    console.log("UUID found. Deconstructing service...");
                    deserializedData.services.splice(i, 1);
                    ServiceManager.terminateService({ index: i });
    
                    this.saveDeserializedData(deserializedData)
                    resolve();
                    return; // Exit after resolving.
                }
            }
    
            console.log("UUID not found.");
            reject(new Error("Service not found."));
        });
    }
    

    /**
     * Takes parameters and creates a new instance of a service, pushing it into the service list.
     * 
     * @param name 
     * @param path 
     * @param uuid 
     * @param execute 
     */
    public static async initializeService(name: string, path: string, uuid: string, execute?: string): Promise<Service> {
        return new Promise((resolve, reject) => {
            try {
                const service = new Service(name, path, uuid, { execute });
        
                ServiceManager.serviceList.push(service);
        
                resolve(service);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes service from array in memory, identifying the service to delete through the service object itself, the UUID, or the index of it.
     * 
     * @param criterea 
     * @returns 
     */
    public static terminateService(criterea: { service?: Service, uuid?: string, index?: number }): void {
        if (criterea.index) {
            ServiceManager.serviceList.splice(criterea.index, 1);
            return;
        }

        const filteredUUID = uuid ? uuid : criterea.service.uuid;

        for (let i = 0; i < ServiceManager.serviceList.length; i++) {
            if (ServiceManager.serviceList[i].uuid == filteredUUID) {
                ServiceManager.serviceList.splice(i, 1);
            }
        }
    }

    /**
     * Loops through all recorded services in the BSON file and initializes them in the memory.
     * 
     */
    private static initializeServices(): void {
        const deserializedData = this.getDeserializedData();

        for (const service of deserializedData.services) {
            this.initializeService(service.name, service.path, service.uuid, service.execute);
        }
    }

    /**
     * Returns the service instance from the array, identified by the UUID of the service.
     * 
     * @param uuid 
     * @returns 
     */
    public static fetchService(uuid: string): Service | null {
        for (const service of ServiceManager.serviceList) {
            if (service.uuid == uuid) return service;
        }

        return null;
    }

    /**
     * Writes new data to the specified service, and specified parameter.
     * 
     * @param uuid 
     * @param key 
     * @param value 
     */
    public static async alterBSONServiceParameter(uuid: string, key: keyof JSONService, value: JSONService[keyof JSONService]): Promise<void> {
        new Promise<void>((resolve, reject) => {
            let deserializedData = ServiceManager.getDeserializedData();

            const service = deserializedData.services.find((service) => service.uuid === uuid);

            if (!service) reject(new Error(`Service ${uuid} not found in BSON file.`));

            service[key] = value

            this.saveDeserializedData(deserializedData);

            resolve();
        })
    }
}