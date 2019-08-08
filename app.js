const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

redisClient.LRANGE("work", 0, -1, function(err, result) {
    console.log(result);
});