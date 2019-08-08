const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

redisClient.on('connect', function() {
    console.log("Redis client connected.");
});