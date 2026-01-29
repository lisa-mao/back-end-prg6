import express from "express";
import mongoose from "mongoose";
import Flower from "../models/Flower.js";

const routes = express.Router()


//callback function need async to use await and get all flowers
routes.get("/", async (req, res) => {
    try{
        //wait for database communication before continuing
        const flowers = await Flower.find({})

        res.json(flowers)

    }catch (error){
        error.message(error, "FETCH NO WORK")
    }
})

export default routes