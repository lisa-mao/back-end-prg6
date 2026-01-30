import mongoose from 'mongoose'
import express, {urlencoded} from 'express'
import flowersRoute from "./flowersRoute.js";
import connectDB from "./config/db.js";
import Flower from "./models/Flower.js";
import seedDB from "./seeder/seeder.js";

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
    const isCollection = parts.length === 1 && parts[0] === "flowers" || (parts.length === 2 && parts[1] === "seed")
    const isDetail = parts.length >= 2 && parts[0] === "flowers" && parts[1] !== "seed";

    let allowed = "GET, OPTIONS"
    if (isCollection) {
        allowed = "GET, POST, OPTIONS"
    } else if (isDetail) {
        allowed = "GET, PUT, DELETE, OPTIONS"
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204)
    }

    res.header("Allow", allowed)
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

connectDB().then(async () => {

    const count = await Flower.countDocuments()
    if (count === 0) {
        console.log("db empty, 10 flowers seed commenced!")
        const initialFlowers = await seedDB(10)
        await Flower.insertMany(initialFlowers)
    }
    app.listen(PORT, () => {
        console.log(`Server luistert op poort: ${PORT}`);
    })
});


//routes
app.use("/", flowersRoute)



