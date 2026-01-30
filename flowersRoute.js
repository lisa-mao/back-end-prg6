import express, {response} from "express";
import Flower from "./models/Flower.js";
import seedDB from "./seeder/seeder.js"
import {base} from "@faker-js/faker";

const routes = express.Router()

//callback function need async to use await and get all flowers
routes.get("/flowers", async (req, res) => {
    try {
        const totalItems = await Flower.countDocuments();
        const limit = parseInt(req.query.limit);
        const page = parseInt(req.query.page) || 1;

        const baseUrl = `https://${req.headers.host}/flowers`;

        // If no limit is specified return all items without pagination
        if (!limit || isNaN(limit)) {
            const flowers = await Flower.find();

            const mappedItems = flowers.map(flower => ({
                id: flower._id,
                name: flower.name,
                color: flower.color,
                origin: flower.origin,
                _links: {
                    self: {
                        href: `${baseUrl}/${flower._id}`
                    },
                    collection: {
                        href: baseUrl
                    }
                }
            }));

            return res.json(mappedItems);
        }

        // With pagination
        const totalPages = Math.ceil(totalItems / limit);
        const skip = (page - 1) * limit;
        const flowers = await Flower.find().skip(skip).limit(limit);

        const getPaginationLink = (p) => `${baseUrl}?limit=${limit}&page=${p}`;

        const mappedItems = flowers.map(flower => ({
            id: flower._id,
            name: flower.name,
            color: flower.color,
            origin: flower.origin,
            _links: {
                self: {
                    href: `${baseUrl}/${flower._id}`
                },
                collection: {
                    href: baseUrl
                }
            }
        }));

        const responseData = {
            items: mappedItems,
            _links: {
                self: { href: `${baseUrl}?limit=${limit}&page=${page}` }
            },
            pagination: {
                currentPage: page,
                currentItems: mappedItems.length,
                totalPages: totalPages,
                totalItems: totalItems,
                _links: {
                    first: {
                        page: 1,
                        href: getPaginationLink(1)
                    },
                    last: {
                        page: totalPages,
                        href: getPaginationLink(totalPages)
                    },
                    previous: {
                        page: Math.max(1, page - 1),
                        href: getPaginationLink(Math.max(1, page - 1))
                    },
                    next: {
                        page: Math.min(totalPages, page + 1),
                        href: getPaginationLink(Math.min(totalPages, page + 1))
                    }
                }
            }
        };

        res.json(responseData);

    } catch (err) {
        res.status(500).json({
            error: "Server fout bij het ophalen van de collectie",
            message: err.message
        });
    }
})

//seed database

routes.post("/flowers/seed", async (req, res) => {
    try {
        const {flowerName, description, author, amount} = req.body

        //validation
        if (!flowerName || !description || !author) {
            return res.status(400).json({
                message: "required fields are missing!",
                received: {flowerName, description, author, amount}
            })
        }

        //seeing if the amount works
        //radix specifies which number system to use
        let count = parseInt(amount, 10)

        if (isNaN(count) || count <= 0) {
            count = 10
            console.log("amount not working so default to 10")
        }

        const flowersToInsert = await seedDB(count, {flowerName, description, author})

        const createdFlowers = await Flower.insertMany(flowersToInsert)


        res.status(201).json({message: "Created flower!", createdFlowers})
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

        res.status(200).json({
            message: `Details van de bloem ${specificFlower.flowerName} went through!`,
            data: specificFlower
        })


    } catch (error) {
        res.status(500).json(error.message)
    }
})

routes.put("/flowers/:id", async (req, res) => {
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
            message: `Updated ${updatedFlower.flowerName} successfully!`,
            data: updatedFlower
        })

    } catch (error
        ) {
        res.status(500).json({message: "Error creating flower", error: error.message})
    }

})

routes.delete("/flowers/:id", async (req, res) => {
    try {
        //called object destructuring
        //when a user sends a form or a json-object gets send through a post req it goes into the req.body
        //you tell js to look inside req.body and look for alike properties and get the value of them.
        //its like a user sends u a package and you unpack it in req.body
        const {flowerName, description, author, amount} = req.body

        //getting id from url
        const flowerId = req.params.id

        //delete flower
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
            message: `${deleteFlower.flowerName} deleted!`,
            data: deleteFlower
        })

    } catch (error
        ) {
        res.status(500).json({message: "Error deleting flower", error: error.message})
    }

})


export default routes