import express, {response} from "express";
import Flower from "./models/Flower.js";
import seedDB from "./seeder/seeder.js"
import {base} from "@faker-js/faker";


const routes = express.Router()

//callback function need async to use await and get all flowers
routes.get("/flowers", async (req, res) => {
    try {
        const totalItems = await Flower.countDocuments();
        const limit = parseInt(req.query.limit) || totalItems || 0
        const page = parseInt(req.query.page) || 1;
        const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 1;
        const skip = (page-1) * limit

        const protocol = req.protocol
        const baseUrl = `${protocol}://${req.headers.host}/flowers`;

        // If no limit is specified, return all items without pagination

        const flowers = await Flower.find().skip(skip).limit(limit);

        const mappedItems = flowers.map(flower => ({
            "id": flower._id,
            "flowerName": flower.flowerName || "",
            "description": flower.description || "",
            "_links": {
                "self": { "href": `${baseUrl}/${flower._id}` },
                "collection": { "href": baseUrl }
            }
        }));

        //if there are no query parameters- send back BALD url as self
        const selfLink = (req.query.limit || req.query.page)
        ? `${baseUrl}?page=${page}&limit=${limit}` : baseUrl

        const getPaginationLink = (p) => `${baseUrl}?page=${p}&limit=${limit}`;

        res.json({
            "items": mappedItems,
            "_links": {
                "self": { "href": selfLink }
            },
            "pagination": {
                "currentPage": page,
                "currentItems": mappedItems.length,
                "totalPages": totalPages,
                "totalItems": totalItems,
                "_links": {
                    "first": { "page": 1, "href": getPaginationLink(1) },
                    "last": { "page": totalPages, "href": getPaginationLink(totalPages) },
                    "previous": page > 1 ? { "page": page - 1, "href": getPaginationLink(page - 1) } : null,
                    "next": page < totalPages ? { "page": page + 1, "href": getPaginationLink(page + 1) } : null
                }
            }
        });

    } catch (err) {
        res.status(500).json({ "error": "Server fout", "message": err.message });
    }
})

//seed database
routes.post("/flowers/seed", async (req, res) => {
    try {
        const {flowerName, description, author, amount} = req.body


        if (!flowerName) {
            return res.status(400).json({
                message: "flowerName is required and cannot be empty"
            })
        }

        if (!description) {
            return res.status(400).json({
                message: "description is required and cannot be empty"
            })
        }

        if (!author) {
            return res.status(400).json({
                message: "author is required and cannot be empty"
            })
        }

        let count = parseInt(amount, 10)
        if (isNaN(count) || count <= 0) {
            count = 10
            console.log("amount not working so default to 10")
        }

        const flowersToInsert = await seedDB(count, {flowerName, description, author})
        const createdFlowers = await Flower.insertMany(flowersToInsert)

        res.status(201).json({message: "Created flower!", createdFlowers})
    } catch (error) {
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

        res.status(200).json({
            "id": specificFlower.flowerId,
            "flowerName": specificFlower.flowerName,
            "description": specificFlower.description,
            "author": specificFlower.author,
            "_links": {
                "self": {
                    "href": `https://${req.headers.host}/flowers/${specificFlower.flowerId}`
                },
                "collection": {
                    "href": `https://${req.headers.host}/flowers`
                }
            }
        })

    } catch (error) {
        res.status(500).json({message: error.message})
    }
})

routes.put("/flowers/:id", async (req, res) => {
    try {
        const {flowerName, description, author} = req.body
        const flowerId = req.params.id


        if (!flowerName) {
            return res.status(400).json({
                message: "flowerName is required and cannot be empty"
            })
        }

        if (!description) {
            return res.status(400).json({
                message: "description is required and cannot be empty"
            })
        }

        if (!author) {
            return res.status(400).json({
                message: "author is required and cannot be empty"
            })
        }

        const updatedFlower = await Flower.findByIdAndUpdate(
            flowerId,
            {flowerName, description, author},
            {new: true, runValidators: true}
        )

        if (!updatedFlower) {
            return res.status(404).json({
                message: "flower not found"
            })
        }

        res.status(200).json({
            message: `Updated ${updatedFlower.flowerName} successfully!`,
            data: updatedFlower
        })

    } catch (error) {
        res.status(500).json({message: "Error updating flower", error: error.message})
    }
})

routes.delete("/flowers/:id", async (req, res) => {
    try {
        const flowerId = req.params.id

        const deletedFlower = await Flower.findByIdAndDelete(flowerId)

        if (!deletedFlower) {
            return res.status(404).json({
                message: "flower not found"
            })
        }

        res.status(200).json({
            message: `${deletedFlower.flowerName} deleted!`
        })

    } catch (error) {
        res.status(500).json({message: "Error deleting flower", error: error.message})
    }
})

export default routes