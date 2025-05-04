import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"

const app = express()

//common middelwares
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true , limit: "16kb"}))
app.use(express.static(path.join(process.cwd(), 'public')));



//import routes


app.get("/", (req, res) => {
    res.send("Server is running...");
});


//routes


export {app}