import mongoose from "mongoose";


const flowerSchema = new mongoose.Schema({
    //properties of the model and what type
    flowerName: {type: String, required: true},
    description: { type: String, required: true },

})

const Flower = mongoose.model('Flower', flowerSchema)

export default Flower
