import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: './.env' });

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log("Database connected successfully!");
    }catch(err){
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
}
connectDB();

export default connectDB;