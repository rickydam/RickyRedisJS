const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log("Redis client connected.");
});
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

class Work_Queue {
    constructor(workQueueName) {
        this.workQueueName = workQueueName; // Queue: workJS
    }

    pushPersistentMessages() {
        for(let i=0; i<10000; i++) {
            redisClient.LPUSH(this.workQueueName, JSON.stringify({'event_name': i, 'payload': ""}), function(errLPUSH, resultLPUSH) {
                if(!errLPUSH) {
                    console.log("LPUSH: " + i);
                }
                else console.error(errLPUSH);
            });
        }
    }

    showQueues() {
        console.log("Queue: workJS");
        redisClient.LRANGE(this.workQueueName, 0, -1, function(errLRANGE, resultLRANGE) {
            if(!errLRANGE) {
                resultLRANGE.forEach(function(item, index) {
                    console.log(index + ": " + item);
                });
            }
            else console.err(errLRANGE);
        });
        redisClient.LRANGE("workerJS1-queue", 0, -1, function(errLRANGE, resultLRANGE) {
            if(!errLRANGE) {
                resultLRANGE.forEach(function(item, index) {
                    console.log(index + ": " + item);
                });
            }
            else console.error(errLRANGE);
        });
    }
}

let workQueue = new Work_Queue("workJS");
workQueue.pushPersistentMessages();
workQueue.showQueues();