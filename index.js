import mongoose from 'mongoose'
import express, {urlencoded} from 'express'
import flowersRoute from "./flowersRoute.js";
import connectDB from "./config/db.js";

const app = express()
const PORT = 8080

//parsers to make data readable
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//CORS
app.use(function (req,res,next){
    const allowedOrigins = [
        'http://localhost:8080',
        'http://145.24.237.144:8080',
        'http://145.24.237.144:3000'
    ]

    const origin = req.headers.origin
    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin)
        res.header("Vary", "Origin")
        res.header("Access-Control-Allow-Credentials", "true")
    } else if(origin) {
        res.header("Access-Control-Allow-Origin", origin)
        res.header("Vary", "Origin")
    } else {
        res.header("Access-Control-Allow-Origin", "*")
    }

    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept")
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    const pathParts = req.path.split("/").filter(part => part !== "")

    //decides if were on /flowers(collection) or /flowers/123(isItem)
    const isCollection = pathParts.length <= 1
    const isItem = pathParts.length > 1

    let allowedMethods = "OPTIONS"

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

    if (!allowedMethods.includes(req.method)) {
        return res.status(405).json({
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

    if (req.headers.accept && !req.accepts('json') && !req.accepts('*/*')) {
        return res.status(406).json('Not acceptable: only json-content allowed!')
    } else {
        console.log("There is no accept header")
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



