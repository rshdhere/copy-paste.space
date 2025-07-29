import "dotenv/config";
import mongoose from "mongoose";
import { Schema } from "mongoose";

export async function ConnectedToDB(){
   try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("connected to mongodb database successfully");

    // Drop existing index if it exists to avoid conflicts
    try {
        await ContentModel.collection.dropIndex("createdAt_1");
    } catch (dropError) {
        // Index doesn't exist, which is fine
        console.log("No existing index to drop");
    }

    // Create new index with updated expireAfterSeconds
    await ContentModel.collection.createIndex(
        {
            createdAt: 1
        }, {
            expireAfterSeconds: 120
        }
    );

   } catch(error :any){
        console.error("Error occured while connecting to the database at,", error);
   }
}

const Content = new Schema({
    content: {type: String, required: true},
    code: {type: String},
    createdAt: {type: Date, default: Date.now}
})

export const ContentModel = mongoose.model('content', Content);