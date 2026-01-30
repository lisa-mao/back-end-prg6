import express, {response} from "express";
import Flower from "./models/Flower.js";
import seedDB from "./seeder/seeder.js"
import {base} from "@faker-js/faker";


const routes = express.Router()

//callback function need async to use await and get all flowers
routes.get("/flowers", async (req, res) => {
    try {
        const totalItems = await Flower.countDocuments();
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const page = parseInt(req.query.page) || 1;

        const baseUrl = `http://${req.headers.host}/flowers`;

        // If no limit is specified, return all items without pagination
        if (!limit || isNaN(limit)) {
            const flowers = await Flower.find();

            const mappedItems = flowers.map(flower => ({
                "id": flower._id,
                "flowerName": flower.flowerName || "",
                "description": flower.description || "",
                "_links": {
                    "self": {
                        "href": `${baseUrl}/${flower._id}`
                    },
                    "collection": {
                        "href": baseUrl
                    }
                }
            }));

            return res.json({
                "items": mappedItems,
                "_links": {
                    "self": {
                        "href": baseUrl
                    }
                }
            });
        }

        // With pagination
        const totalPages = Math.ceil(totalItems / limit);
        const skip = (page - 1) * limit;
        const flowers = await Flower.find().skip(skip).limit(limit);

        const getPaginationLink = (p) => `${baseUrl}?page=${p}&limit=${limit}`;

        const mappedItems = flowers.map(flower => ({
            "id": flower._id,
            "flowerName": flower.flowerName || "",
            "description": flower.description || "",
            "_links": {
                "self": {
                    "href": `${baseUrl}/${flower._id}`
                },
                "collection": {
                    "href": baseUrl
                }
            }
        }));

        const previousPage = page > 1 ? page - 1 : null;
        const nextPage = page < totalPages ? page + 1 : null;

        const responseData = {
            "items": mappedItems,
            "_links": {
                "self": {
                    "href": getPaginationLink(page)
                }
            },
            "pagination": {
                "currentPage": page,
                "currentItems": mappedItems.length,
                "totalPages": totalPages,
                "totalItems": totalItems,
                "_links": {
                    "first": {
                        "page": 1,
                        "href": getPaginationLink(1)
                    },
                    "last": {
                        "page": totalPages,
                        "href": getPaginationLink(totalPages)
                    },
                    "previous": previousPage !== null ? {
                        "page": previousPage,
                        "href": getPaginationLink(previousPage)
                    } : null,
                    "next": nextPage !== null ? {
                        "page": nextPage,
                        "href": getPaginationLink(nextPage)
                    } : null
                }
            }
        };

        res.json(responseData);

    } catch (err) {
        res.status(500).json({
            "error": "Server fout bij het ophalen van de collectie",
            "message": err.message
        });
    }
})

//seed database
routes.post("/flowers/seed", async (req, res) => {
    try {
        const {flowerName, description, author, amount} = req.body

        // Validatie - zonder trim
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
            "id": specificFlower._id,
            "flowerName": specificFlower.flowerName,
            "description": specificFlower.description,
            "author": specificFlower.author,
            "_links": {
                "self": {
                    "href": `http://${req.headers.host}/flowers/${specificFlower._id}`
                },
                "collection": {
                    "href": `http://${req.headers.host}/flowers`
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

        // Validatie - zonder trim
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