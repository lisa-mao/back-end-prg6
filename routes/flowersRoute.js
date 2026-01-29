import express, {response} from "express";
import mongoose from "mongoose";
import Flower from "../models/Flower.js";

const routes = express.Router()


//callback function need async to use await and get all flowers
routes.get("/flowers", async (req, res) => {
    try{
        //wait for database communication before continuing
        const flowers = await Flower.find({})

        res.json(flowers)

    }catch (error){
        res.status(500).json( error.message)
    }
})

routes.get("/flowers/:id", async (req, res) => {
    try{
        const flowerId = req.params.id
        //wait for database communication before continuing
        const flowers = await Flower.find({flowerId})

        res.json(flowers)

    }catch (error){
        res.status(500).json( error.message)
    }
})

// routes.get("/")

routes.post("/flowers/seed", async (req, res)=>
{
    try{
        const {flowerName, description} = req.body

        if (!flowerName || !description) {
            return res.status(400).json({message: "flower name and description is required "})
        }

        const newFlower = new Flower ({
            flowerName, description
        })

        await newFlower.save()
        res.status(201).json(newFlower)
    }catch (error
        ){
        res.status(500).json({message: "Error creating flower", error:error.message})
    }

})

export default routes