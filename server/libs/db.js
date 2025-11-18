const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    //console.log(`Connected to Paypal Client: ${process.env.CLIENT_ID}`);
  } catch (error) {
    console.log("Error: " + error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
