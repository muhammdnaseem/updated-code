import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import foodRouter from './routes/foodRoute.js';
import dealRouter from './routes/dealRoute.js';
import categoryRouter from './routes/categoryRoute.js';
import paymentRouter from './routes/paymentRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import userRouter from './routes/userRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import 'dotenv/config';
import nodemailer from 'nodemailer';
import userModel from './models/userModel.js'; // Import the user model

const app = express();
const port = process.env.PORT || 4000;  // Define the port properly

// Middleware
app.use(express.json());
app.use(cors());

// Function to ensure indexes are set correctly
const ensureIndexes = async () => {
  try {
    await userModel.collection.createIndex({ googleId: 1 }, { unique: true, sparse: true, name: "custom_googleId_index" });
    await userModel.collection.createIndex({ facebookId: 1 }, { unique: true, sparse: true, name: "custom_facebookId_index" });
    console.log("Indexes ensured successfully with custom names");
  } catch (error) {
    console.error("Error ensuring indexes:", error);
  }
};

// Function to drop existing indexes
const dropIndexes = async () => {
  try {
    const indexes = await userModel.collection.indexes();
    console.log("Existing indexes:", indexes); // Check existing indexes

    await userModel.collection.dropIndex("googleId_1").catch(err => {
      if (err.codeName === 'IndexNotFound') {
        console.log("Index 'googleId_1' not found, skipping drop");
      }
    });
    console.log("Existing index 'googleId_1' dropped successfully");

    await userModel.collection.dropIndex("facebookId_1").catch(err => {
      if (err.codeName === 'IndexNotFound') {
        console.log("Index 'facebookId_1' not found, skipping drop");
      }
    });
    console.log("Existing index 'facebookId_1' dropped successfully");
  } catch (error) {
    console.error("Error dropping index:", error);
  }
};


// DB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(async () => {
    console.log('Connected to MongoDB');
    await dropIndexes(); // Drop existing indexes if they exist
    ensureIndexes(); // Ensure indexes after dropping
  })
  .catch((err) => console.log('NOT CONNECTED TO NETWORK', err));

// API Endpoints
app.use('/api/food', foodRouter);
app.use('/images', express.static('uploads'));
app.use('/api/category', categoryRouter);
app.use('/categoryimages', express.static('uploads/categories'));
app.use('/api/deal', dealRouter);
app.use('/api/user', userRouter);
app.use('/api/review', reviewRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/payment', paymentRouter);

app.get('/', (req, res) => {
  res.send('API working');
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
