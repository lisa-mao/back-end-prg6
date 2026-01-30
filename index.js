import mongoose from 'mongoose'
import express, {urlencoded} from 'express'
import flowersRoute from "./flowersRoute.js";
import connectDB from "./config/db.js";

const app = express()
const PORT = 8080

//parsers to make data readable
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//CORS
app.use(function (req, res, next) {
    const allowedOrigins = ['http://localhost:8080', 'http://145.24.237.144:8080', 'http://145.24.237.144:3000'];
    const origin = req.headers.origin;
    res.header("Access-Control-Allow-Origin", allowedOrigins.includes(origin) ? origin : "*");

    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

    const parts = req.path.split("/").filter(Boolean);
    const isDetail = parts.length >= 2 && parts[0] === "flowers";
    const allowed = isDetail ? "GET, PUT, DELETE, OPTIONS" : "GET, POST, OPTIONS";
    res.header("Allow", allowed);

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
})

//middleware that checks if the request method is through json or not
app.use((req, res, next) => {
    console.log("Requested /")
    console.log(`Request METHOD: ${req.method}`)

    if (req.headers.accept && !req.accepts(['json', '*/*'])) {
        return res.status(406).json({error: "Method not acceptable Only JSON!!"});
    }
    next()
})

connectDB().then(r =>
    app.listen(PORT, () => {
        console.log(`Server luistert op poort: ${PORT}`);
    })
);


//routes
app.use("/", flowersRoute)



