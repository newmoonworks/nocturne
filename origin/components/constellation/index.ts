import { Constellation } from "./Constellation";

const constellation = new Constellation(Constellation.fetchDirname(import.meta.url), "/Routes/");

constellation.listen(3000, "localhost", () => {
    console.log("Server is running on port 3000")
});

import { Model } from "./components/Cache/Model";

const model = new Model( 
    { name: "jeff", age: 29 }, 
    { voidClause: ["name"] }
);

model.updateMany({ name: 'george' })

console.log(model)

setTimeout(() => {
    console.log(Constellation.routes)
},2000)