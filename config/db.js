import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const mongoURI = "mongodb://127.0.0.1:27017/flowers"

        const connection = await mongoose.connect(mongoURI)
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {

        console.log(`Error: ${error.message}`)

    }
}

export default connectDB