import mongoose from 'mongoose'
import express from 'express'
import Flower from "./models/Flower.js";
const app = express()
import flowersRoute from "./routes/flowersRoute.js";
const PORT = 8080

app.use("/flowers", flowersRoute)

app.get("/flowers", (req, res) => {
    const flowerId = req.params.id
    res.send(`alleen product met id: ${flowerId}`)
})

app.post("/flowers/seed", (req, res)=> {
    console.log(req.body)
    res.send("gegevens ontvangen")
})

app.listen(PORT, () => {
    console.log("Server luistert op poort 8000");
});





