const redis = require('redis');

console.log("Attempting to connect to Redis...");

const client = redis.createClient({
     username: 'default',
     password: process.env.REDIS_PASSWORD,
     socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT
     }
});

client.on('connect', () => console.log('✅ Redis Client Connected'));
client.on('error', (err) => console.error('❌ Redis Client Error:', err));

// Ensure Redis is connected before exporting
(async () => {
     try {
          await client.connect();
          console.log('🚀 Redis connection established.');
     } catch (err) {
          console.error('❌ Failed to connect to Redis:', err);
     }
})();

module.exports = client;
