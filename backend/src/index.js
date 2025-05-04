import dotenv from "dotenv"
import {app} from "./app.js"
import connectDB from "./db/index.js"
import pineconeService from "./services/Pinecone.services.js"

dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT

Promise.all([
    connectDB(),
    pineconeService.initialize()
])
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        })
    })
    .catch((error) => {
        console.log("Initialization error", error);
    })

