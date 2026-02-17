import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI must be set. Did you forget to add your MongoDB connection string?");
}

export async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      dbName: "brainbolt",
      retryWrites: true,
      w: "majority",
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("Please verify your MONGODB_URI secret is correct and the database user has proper permissions.");
    process.exit(1);
  }
}

export { mongoose };
