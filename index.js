import mongoose from 'mongoose'
import express, {urlencoded} from 'express'
import Flower from "./models/Flower.js";
const app = express()
import flowersRoute from "./flowersRoute.js";
import connectDB from "./config/db.js";
const PORT = 8080


//parsers to make data readable
app.use(express.json())
app.use(urlencoded({extended:true}))

//CORS
const allowedOrigins = [
    'http://localhost:8080',
    'http://145.24.237.144:8080'
]

app.use(function (req,res,next){
    const origin = req.headers.origin

    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin)
        res.header("Vary", "Origin")
        res.header("Access-Control-Allow-Credentials", "true")
    }

    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    const pathParts = req.path.split("/").filter(part => part !== "")
    const isCollection = pathParts.length <= 1
    const isItem = pathParts.length > 1

    let allowedMethods = ""

    if (isCollection){
        allowedMethods = "GET, POST, OPTIONS"
    } else if (isItem) {
        allowedMethods = "GET, PUT, DELETE, OPTIONS"
    }
    res.header("Allow", allowedMethods)

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Max-Age", "86400")
        return res.sendStatus(204)
    }

    if (allowedMethods && !allowedMethods.includes(req.method)) {
        return res.status(204).json({
            error: `method: ${req.method} is not allowed on this path`,
            allowed: allowedMethods
        })
    }







    next()
})

//middleware that checks if the request method is through json or not
app.use((req, res, next)=> {
    console.log("Requested /")
    console.log(`Request METHOD: ${req.method}`)

    if (!req.accepts('json')) {
        return res.status(406).json('Not acceptable: only json-content allowed!')
    }
    if (req.headers?.accept) {
        console.log(`The accept header is: ${req.headers.accept}`)

    } else {
        console.log("There is no accept header")
    }


    next()
    })

connectDB().then(r =>
    app.listen(PORT, () => {
        console.log("Server luistert op poort 8080");
    })
);


//routes
app.use("/", flowersRoute)



