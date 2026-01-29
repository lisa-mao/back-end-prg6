import express, {response} from "express";
import mongoose from "mongoose";
import Flower from "./models/Flower.js";
import flower from "./models/Flower.js";
import res from "express/lib/response.js";
import seedDB from "./seeder/seeder.js"
const routes = express.Router()


//callback function need async to use await and get all flowers
routes.get("/flowers", async (req, res) => {
    try {
        //wait for database communication before continuing
        const flowers = await Flower.find({})

        res.json(flowers)

    } catch (error) {
        res.status(500).json(error.message)
    }
})

//seed database

routes.post("/flowers/seed", async (req, res) => {
    try {
        const {flowerName, description, author, amount} = req.body

        //validation
        if (!flowerName || !description || !author) {
            return res.status(400).json({
                message: "flower name, description and author is required "})
        }

        //seeing if the amount works
        let count = parseInt(amount)

        if (isNaN(count) || count <= 0 ) {
            count = 10
            console.log("did a default 10 seeding, amount not working")
        }

        const flowersToInsert = await seedDB(count, {flowerName, description, author})

        const createdFlowers = await Flower.insertMany(flowersToInsert)


        res.status(201).json(createdFlowers)
    } catch (error
        ) {
        res.status(500).json({message: "Error creating flower", error: error.message})
    }

})
//get one specific flower
routes.get("/flowers/:id", async (req, res) => {
    try {
        const flowerId = req.params.id
        const specificFlower = await Flower.findById(flowerId)

        if (!specificFlower) {
            return res.status(404).json({
                message: "bloem niet gevonden"
            })
        }

        res.json({
            message: `Details van de bloem ${specificFlower.flowerName}`,
            data: specificFlower
        })


    } catch (error) {
        res.status(500).json(error.message)
    }
})
export default routes