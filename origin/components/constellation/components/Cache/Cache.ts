// class Cache<key, schematic> {
//     private limit: number;
//     private cache: Map<key, schematic>;

//     constructor(limit: number) {
//         this.limit = limit;
//         this.cache = new Map<key, schematic>();
//     }

//     public get(category: { key?: key, schematic?: schematic }) {
//         if (category.key) {
//             this.cache.has(category.key);
//         }
//     }
// }

// export default class CacheNative {
//     private caches: Cache<unknown, unknown>[] = [];

//     constructor() {

//     }

//     public static register(cache: any): void {
//         this.caches.push()
//     }
// }

// interface Cache<identifier, schematic> {
//     get(category: { identifier?: identifier, schematic?: schematic }): schematic | null;
//     set(identifier: identifier, schematic: schematic): void;
// }

// class Cache implements Cache<identifier, schematic> {

// }

import { Model } from "./Model"

interface NativeCache<key, model> {
    readonly limit: number;
    data: Map<key, model>;

    get(category: { key?: key, model?: model }): key | model | null;
    set(identifier: key, model: model): void;
}

export class MemoryCache<key, model> implements NativeCache<key, model> {
    readonly limit: number;
    public data = new Map<key, model>();

    // private readonly isModel: boolean;

    constructor(limit: number) {
        if (limit < 1) throw new Error("Limit must contain a positive number");
        // if (model instanceof Model)
        
        this.limit = limit;
    }

    public get(category: { key?: key, model?: model }): key | model | null {
        if (category.key) {
            const selection = this.data.get(category.key);

            if (selection == undefined) return null;

            return selection;
        }

        this.data.forEach((value, key) => {
            if (category.model == value) return key;
        })

        return null;
    }

    // if 
    public set(key: key, model: model): void {
        if (this.limit === this.data.size) {
            const firstEntry = this.data.keys().next().value;
            if (!firstEntry) return;

            this.data.delete(firstEntry);
        }

        // if it is a model and has the voidClause property in the object
        if (model instanceof Model && model.properties?.voidClause) {
            console.log("YAAAAAAAAAAAAAY")
        }
        this.data.set(key, model);
    }
}