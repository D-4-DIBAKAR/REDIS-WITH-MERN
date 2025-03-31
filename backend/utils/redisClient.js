const redis = require('redis');
console.log("Attempting to connect to redis");
const { createClient } = redis;
//also use redis.createClient instead of createClient 
const client = createClient({
     username: 'default',
     password: process.env.REDIS_PASSWORD,
     socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT
     }
});

client.on('connect', () => console.log('Redis Client Connected'));

client.on('error', err => console.log('Redis Client Error', err));

client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

module.exports = client;

