/**
 * Model Properties tells the Model how to interact with other Model Instances.
 * For Example: voidClause is used to specify specific model keys under the condition
 * of them being identical to keys in seperate models. If the keys are identical,
 * the Cache destroys the older model.
 */
interface ModelProperties {
    voidClause?: string[];
}

export class Model<T extends object> {
    public model: T;
    public readonly properties?: ModelProperties;

    constructor(model: T, properties?: ModelProperties) {
        this.model = model;
        this.properties = properties;
    }

    public updateOne<K extends keyof T>(key: K, value: T[K]): void {
        this.model[key] = value;
    }

    public updateMany(updates: Partial<T>): void {
        for (const key in updates) {
            if (updates[key] === undefined) return;

            this.model[key] = updates[key] as T[typeof key];
        }
    }
}