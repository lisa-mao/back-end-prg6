import mongoose from 'mongoose'
import express, {urlencoded} from 'express'
import Flower from "./models/Flower.js";
const app = express()
import flowersRoute from "./flowersRoute.js";
import connectDB from "./config/db.js";
const PORT = 8080

//NEED for post req
app.use(express.json())
app.use(urlencoded({extended:true}))

connectDB().then(r =>
    app.listen(PORT, () => {
        console.log("Server luistert op poort 8080");
    })
);


//routes
app.use("/", flowersRoute)



