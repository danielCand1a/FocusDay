import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URL;
  if (!uri) throw new Error('No MongoDB URI found (MONGODB_URI / MONGODB_URL / MONGO_URL)');

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
