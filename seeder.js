import {faker} from '@faker-js/faker'
import mongoose from 'mongoose'
import Flower from "./models/Flower.js";
import connectDB from "./config/db.js"
import flower from "./models/Flower.js";


function createRandomFlower() {
    return {
        //need key/value pair for helpers to work
        //chooses a random flower
        flowerName: faker.helpers.arrayElement(['Rose', 'Cornflower', 'Buttercup', 'Lily', 'Tulip', 'Daisy', 'Grass', 'small flower', 'flowername2', "flowername3"]),
        description: faker.lorem.sentence(5 | {5: 10})
    }
}

async function seedDB() {
    try {
        await connectDB()
        console.log("connected to db for seeding")

        await Flower.deleteMany({})
        console.log("Delete already existing data")

        //add to database
        const fakeFlowers = faker.helpers.multiple(createRandomFlower, {count: 10})
        await Flower.insertMany(fakeFlowers)
        console.log("Success added 10 flowers")

        await mongoose.disconnect()
        console.log("db connection stopped")
        process.exit(0)
    } catch (error) {
        console.error("cannot seed", error)
        process.exit(1)
    }
}

seedDB()