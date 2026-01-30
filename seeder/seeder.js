import {faker} from '@faker-js/faker'
import Flower from "../models/Flower.js";

function createRandomFlower() {
    return {
        //need key/value pair for helpers to work
        //chooses a random flower
        flowerName: faker.helpers.arrayElement(['Rose', 'Cornflower', 'Buttercup', 'Lily', 'Tulip', 'Daisy', 'Grass', 'small flower', 'flowername2', "flowername3"]),
        description: faker.lorem.sentence(5.10),
        author: faker.person.firstName()
    }
}

async function seedDB(amount, customData = {}) {
    try {

        // await Flower.deleteMany({})
        // console.log("Delete already existing data")

        //add to database
        const flowers = []
        for (let i = 0 ; i < amount; i++) {

            flowers.push(
                {
                    flowerName: customData.flowerName,
                    description: customData.description,
                    author: customData.author,
                    createdAt: new Date()
                })
        }

        return flowers

    } catch (error) {
        console.error("cannot seed fix it", error)
        process.exit(1)
    }
}

export default seedDB