const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log("Redis client connected.");
});
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

class RickyRedisPersistentQueue2 {
    constructor(workQueueName) {
        this.workQueueName = workQueueName; // Queue: workJS
    }

    pushSinglePersistentMessage(topic, content) {
        redisClient.LPUSH(this.workQueueName, JSON.stringify({'event_name': topic, 'payload': content}), function(errLPUSH, resultLPUSH) {
            if(!errLPUSH) {
                console.log("LPUSH: " + topic);
            }
            else console.error(errLPUSH);
        });
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

let rickyRedisPersistentQueue2 = new RickyRedisPersistentQueue2("workJS");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("1", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("2", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("3", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("4", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("5", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("6", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("7", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("8", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("9", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("10", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("11", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("12", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("13", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("14", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("15", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("16", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("17", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("18", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("19", "");
rickyRedisPersistentQueue2.pushSinglePersistentMessage("20", "");
rickyRedisPersistentQueue2.showQueues();