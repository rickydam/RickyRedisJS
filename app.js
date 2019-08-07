const http = require('http');
const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    redisClient.ping(function(err, result) {
        res.end(result + '\n');
    });
});

const hostname = 'localhost';
const port = 3000;
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});