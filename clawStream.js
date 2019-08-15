const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log("Redis client connected.");
});
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

class ClawStream {
    createGroup(number) {
        redisClient.XGROUP('CREATE', 'clawStream', 'clawGroup' + number, '0', function(errXGROUP, resultXGROUP) {
            if(!errXGROUP) {
                console.log("XGROUP --> CREATE clawGroup" + number + ", " + resultXGROUP);
            }
            else console.log("XGROUP --> CREATE error. clawGroup" + number + " already exists.");
        });
    }

    pushMessages(numberOfMessages) {
        for(let i=0; i<numberOfMessages; i++) {
            redisClient.XADD('clawStream', '*', 'item', i, function(errXADD, resultXADD) {
                if(!errXADD) {
                    console.log("XADD --> item:" + i + ", id:", resultXADD);
                }
                else console.error(errXADD);
            });
        }
    }
}

let clawStream = new ClawStream();
clawStream.createGroup(1);
clawStream.createGroup(2);
clawStream.pushMessages(5);