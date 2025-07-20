import "dotenv/config";
import mongoose from "mongoose";
import { Schema } from "mongoose";

export async function ConnectedToDB(){
   try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("connected to mongodb database successfully");
   } catch(error :any){
        console.error("Error occured while connecting to the database at,", error);
   }
}

const Content = new Schema({
    content: {type: String, required: true},
    code: {type: String}
})

export const ContentModel = mongoose.model('content', Content);