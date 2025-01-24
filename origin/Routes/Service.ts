import Service from "@components/service/Service";
import Formation from "../components/constellation/components/Formation";
import ServiceManager from "@components/service/ServiceManager";
import { IService } from "@types"

async function getService(uuid: string): Promise<object> {
    const service: Service = ServiceManager.fetchService(uuid);

    if (!service) return { error: "Service not found."};

    return { success: service }
}

async function getServices(): Promise<object> {
    return { success: ServiceManager.serviceList }
}

async function constructService(body: Record<string, any>) {
    if (!body.name) return { error: "Name is a required parameter." };
    if (!body.path) return { error: "Path is a required parameter." };

    const service = await ServiceManager.constructService(body.name, body.path, body.execute);

    return { success: service };
}

async function deconstructService(body: Record<string, any>) {
    if (!body.uuid) return { error: "UUID is a required parameter." };

    try {
        await ServiceManager.deconstructService(body.uuid);
        return { success: `${body.uuid} has been successfully deconstructed.` };
    } catch (error) {
        return { error: "Service not found." };
    }
}

export default new Formation({ prefix: "/service" })
    .get('/fetch', async () => await getServices())
    .get('/fetch/:uuid', async (uuid: string) => await getService(uuid))
    .post('/construct', async (body: Record<string, any>) => await constructService(body))
    .delete('/deconstruct/:uuid', async (body: Record<string, any>) => await deconstructService(body))