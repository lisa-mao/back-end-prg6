import express, {response} from "express";
import Flower from "./models/Flower.js";
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
                message: "flower name, description and author is required "
            })
        }

        //seeing if the amount works
        let count = parseInt(amount)

        if (isNaN(count) || count <= 0) {
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

routes.put("/flowers/seed/:id", async (req, res) => {
    try {
        //called object destructuring
        //when a user sends a form or a json-object gets send through a post req it goes into the req.body
        //you tell js to look inside req.body and look for alike properties and get the value of them.
        //its like a user sends u a package and you unpack it in req.body
        const {flowerName, description, author, amount} = req.body

        //getting id from url
        const flowerId = req.params.id

        //update flower
        const updatedFlower = await Flower.findByIdAndUpdate(
            flowerId, {
                flowerName, description, author, amount
            },
            //new makes it so mongoose returns the modified data instead of the original one
            //runvalidators makes sure that the updated data follows the schema validation
            {new: true, runValidators: true}
        )

        if (!updatedFlower) {
            return res.status(404).json({
                message: "flower not found"
            })
        }

        res.status(200).json({
            message: `Updated ${updatedFlower.flowerName} successfully`,
            data: updatedFlower
        })

    } catch (error
        ) {
        res.status(500).json({message: "Error creating flower", error: error.message})
    }

})

routes.delete("/flowers/delete/:id", async (req, res) => {
    try {
        //called object destructuring
        //when a user sends a form or a json-object gets send through a post req it goes into the req.body
        //you tell js to look inside req.body and look for alike properties and get the value of them.
        //its like a user sends u a package and you unpack it in req.body
        const {flowerName, description, author, amount} = req.body

        //getting id from url
        const flowerId = req.params.id

        //update flower
        const deleteFlower = await Flower.findByIdAndDelete(
            flowerId, {
                flowerName, description, author, amount
            },
            //return new one and not the original data
            {new: true}
        )

        if (!deleteFlower) {
            return res.status(404).json({
                message: "flower not found"
            })
        }

        res.status(202).json({
            message: `flower deleted ${deleteFlower.flowerName}`,
            data: deleteFlower
        })

    } catch (error
        ) {
        res.status(500).json({message: "Error deleting flower", error: error.message})
    }

})


export default routes