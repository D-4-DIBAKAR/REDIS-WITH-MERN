require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000
const redisClient = require('./utils/redisClient');
//Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
     // useNewUrlParser: true,
     // useUnifiedTopology: true
}).then(() => console.log('MongoDB connected successfully'))
     .catch(err => console.log(err));
//User model
const userSchema = new mongoose.Schema({
     name: String,
     email: String,

},
     {
          timestamps: true
     });
//Get User model
const User = mongoose.model('User', userSchema);

//Middleware
const app = express();
app.use(cors());
app.use(express.json());

//Routes
//create user
app.post('/users/create', async (req, res) => {
     try {


          const { name, email } = req.body;
          const user = await User.create({ name, email });
          // await user.save();
          // console.log(user);
          await redisClient.del("allUsers");//delete cache
          // await redisClient.expire("allUsers", 3600);
          res.status(201).json(user);
     } catch (error) {
          res.status(500).send("Something went wrong");
     }
})
//get all users
app.get('/users/lists', async (req, res) => {
     try {
          //check for cache
          const cacheKey = "allUsers";
          const cachedUsers = await redisClient.get(cacheKey);
          if (cachedUsers) {
               console.log("cache hit : users fetched from redis");
               return res.status(200).json({
                    users: JSON.parse(cachedUsers)
               });
          }
          //Cache miss, query db

          const users = await User.find({});
          // await user.save();
          // console.log(users);
          if (users.length > 0) {
               await redisClient.set(cacheKey, JSON.stringify(users), 'EX', 3600);
               //await redisClient.expire(cacheKey, 3600);
               console.log("cache miss : users fetched from MongoDB");
               res.status(200).json(users);
          }
     } catch (error) {
          res.status(500).send("Something went wrong");
     }
})

//Server start
app.listen(PORT, () => {
     console.log(`Server started on ${PORT}`);
})