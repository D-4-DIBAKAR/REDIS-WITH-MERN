require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const redisClient = require('./utils/redisClient');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
     // useNewUrlParser: true,
     // useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected successfully'))
     .catch(err => console.error('❌ MongoDB connection error:', err));

// User model
const userSchema = new mongoose.Schema({
     name: String,
     email: String
}, {
     timestamps: true
});

const User = mongoose.model('User', userSchema);

// Middleware
const app = express();
const corsOptions = {
     origin: ['http://localhost:5173'],
     credentials: true // Allow cookies, authentication, etc.
};

app.use(cors(corsOptions)); // Apply CORS middleware before routes
app.use(express.json());

// Routes

// Create user
app.post('/users/create', async (req, res) => {
     try {
          const { name, email } = req.body;
          const user = await User.create({ name, email });

          // Delete cache for users list to keep data fresh
          try {
               await redisClient.del("allUsers");
               console.log("🗑️ Cache cleared: allUsers");
          } catch (cacheError) {
               console.error("❌ Failed to clear cache:", cacheError);
          }

          res.status(201).json(user);
     } catch (error) {
          console.error('❌ Error creating user:', error);
          res.status(500).json({ error: "Something went wrong while creating user" });
     }
});

// Get all users
app.get('/users/lists', async (req, res) => {
     try {
          // Check cache
          const cacheKey = "allUsers";
          const cachedUsers = await redisClient.get(cacheKey);

          if (cachedUsers) {
               console.log("✅ Cache hit: users fetched from Redis");
               return res.status(200).json({ users: JSON.parse(cachedUsers) });
          }

          // Cache miss, query DB
          const users = await User.find({});

          if (users.length > 0) {
               await redisClient.set(cacheKey, JSON.stringify(users), 'EX', 3600);
               console.log("❌ Cache miss: users fetched from MongoDB and stored in Redis");
          } else {
               console.log("No users found in database.");
          }

          res.status(200).json({ users }); // Always respond, even if empty
     } catch (error) {
          console.error('❌ Error fetching users:', error);
          res.status(500).json({ error: "Something went wrong while fetching users" });
     }
});

// Start server
app.listen(PORT, () => {
     console.log(`✅ Server started on port ${PORT}`);
});
