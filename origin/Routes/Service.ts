import Service from "@components/service/Service";
import Formation from "../components/constellation/components/Formation";
import ServiceManager from "@components/service/ServiceManager";
import Alert from "@components/Alert"
import { IService } from "@types"

/**
 * Pulls UUID-specified service from ServiceManager Memory Map.
 * 
 * @param uuid 
 * @returns 
 */
async function getService(uuid: string): Promise<object> {
    const service: Service = ServiceManager.fetchService(uuid);

    if (!service) return { error: "Service not found."};

    Alert.pull("Requesting data of " + service.uuid);

    return { success: service.toString() };
}

/**
 * Pulls all services from ServiceManager Memory Map.
 * 
 * @returns 
 */
async function getServices(): Promise<object> {
    const services = ServiceManager.serviceList.map(service => service.toString());

    Alert.pull("Requesting data of all services...");

    return { success: services };
}

/**
 * Constructs a service from a name and path. All other required information is generated.
 * New service is written into memory, as well as the BSON file.
 * 
 * @param body 
 * @returns 
 */
async function constructService(body: Record<string, any>) {
    if (!body.name) return { error: "Name is a required parameter." };
    if (!body.path) return { error: "Path is a required parameter." };

    const service = await ServiceManager.constructService(body.name, body.path, body.execute);

    Alert.construct(`Service ${service.uuid} has been created`);

    return { success: service };
}

/**
 * 
 * @param body 
 * @returns 
 */
async function deconstructService(body: Record<string, any>) {
    if (!body.uuid) return { error: "UUID is a required parameter." };

    try {
        await ServiceManager.deconstructService(body.uuid);

        Alert.deconstruct(`Service ${body.uuid} has been deconstructed`);

        return { success: `${body.uuid} has been successfully deconstructed.` };
    } catch (error) {
        return { error: "Service not found." };
    }
}

/**
 * 
 * @param body 
 * @returns 
 */
async function alterServiceName(body: Record<string, any>) {
    if (!body.uuid) return { error: "UUID is a required parameter." };
    if (!body.name) return { error: "Name is a required parameter." };

    const service = ServiceManager.fetchService(body.uuid);

    if (!service) return { error: "Service not found." };

    await service.alterName(body.name)
        .catch((e) => {
            console.error(e);
            return { error: "An unexpected error has occured whilst attempting to alter service name."};
        });

    return { success: "Service name has been updated." };
}

/**
 * 
 */
async function alterServicePath(body: Record<string, any>) {
    if (!body.uuid) return { error: "UUID is a required parameter." };
    if (!body.path) return { error: "Path is a required parameter." };

    const service = ServiceManager.fetchService(body.uuid);

    if (!service) return { error: "Service not found." };

    await service.alterPath(body.path)
        .catch((e) => {
            console.error(e);
            return { error: "An unexpected error has occured whilst attempting to alter service path."};
        });

    return { success: "Service path has been updated." };
}

/**
 * 
 * @param body 
 * @returns 
 */
async function stopService(body: Record<string, any>) {
    if (!body.uuid) return { error: "UUID is a required parameter." };

    const service = ServiceManager.fetchService(body.uuid);

    if (!service) return { error: "Service not found." };

    try {
        await service.stop();

        Alert.status(`${service.uuid} has been marked as stopped.`)

        return { success: "Service has been marked as stopped." };
    }catch(e) {
        return { error: "Service is already marked as offline." };
    }
}

async function startService(body: Record<string, any>) {
    if (!body.uuid) return { error: "UUID is a required parameter." };

    const service = ServiceManager.fetchService(body.uuid);

    if (!service) return { error: "Service not found." };

    try {
        await service.start();

        Alert.status(`${service.uuid} has been marked as started.`)

        return { success: "Service has been marked as started." };
    }catch(e) {
        return { error: "Service is already marked as online." };
    }
}

async function restartService(body: Record<string, any>) {
    if (!body.uuid) return { error: "UUID is a required parameter." };

    const service = ServiceManager.fetchService(body.uuid);

    if (!service) return { error: "Service not found." };

    try {
        await service.stop().then(() => {
            service.start();
        })

        return { success: "Service has been marked as started."};
    } catch(e) {
        console.log(e);
        return { error: "An unexpected error has occured." };
    }
}

export default new Formation({ prefix: "/service" })
    .get('/fetch', async () => await getServices())
    .get('/fetch/:uuid', async (uuid: string) => await getService(uuid))
    .post('/construct', async (body: Record<string, any>) => await constructService(body))
    .post('/alter/name', async (body: Record<string, any>) => await alterServiceName(body))
    .post('/alter/status/stop', async (body: Record<string, any>) => await stopService(body))
    .post('/alter/status/start', async (body: Record<string, any>) => await startService(body))
    .post('/alter/status/restart', async (body: Record<string, any>) => await restartService(body))
    .delete('/deconstruct', async (body: Record<string, any>) => await deconstructService(body))