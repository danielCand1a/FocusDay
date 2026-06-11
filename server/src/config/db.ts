import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URL;
  if (!uri) throw new Error('MONGODB_URI / MONGODB_URL is not defined in environment variables');

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
