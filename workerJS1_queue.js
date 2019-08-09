const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log("Redis client connected.");
});
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

class WorkerJS1_Queue {
    constructor(workQueueName) {
        this.workQueueName = workQueueName; // Queue: workJS
    }

    listen(workerId) {
        console.log("Listening...");
        let workerQueueName = "workerJS" + workerId + "-queue"; // Queue: workerJS1-queue
        console.log(workerQueueName);
        this.queuePastEvents(workerQueueName);
        this.waitForEvents(workerQueueName);
    }

    queuePastEvents(workerQueueName) {
        let rrpq = this;
        redisClient.LRANGE(workerQueueName, 0, -1, function(errLRANGE, resultLRANGE) {
            if(!errLRANGE) {
                let workerQueueArr = resultLRANGE;
                workerQueueArr.forEach(function() {
                    console.log("workerQueueArr length: " + workerQueueArr.length);
                    console.log("Pop last item in workerQueue, push to the start of workQueue");
                    redisClient.RPOPLPUSH(workerQueueName, rrpq.workQueueName, function(errRPOPLPUSH) {
                        if(!errRPOPLPUSH) console.log("RPOPLPUSH executed.");
                        else console.error(errRPOPLPUSH);
                    });
                });
            }
            else console.error(errLRANGE);
        });
    }

    waitForEvents(workerQueueName) {
        let rrpq = this;
        console.log("Block the connection until the workerQueue gets the task.");
        console.log("waitForEvents...");

        redisClient.BRPOPLPUSH(rrpq.workQueueName, workerQueueName, 0, function(errBRPOPLPUSH, resultBRPOPLPUSH) {
            if(!errBRPOPLPUSH) {
                console.log("BRPOPLPUSH executed.");
                console.log(resultBRPOPLPUSH);
                redisClient.LREM(workerQueueName, 1, resultBRPOPLPUSH, function(errLREM) {
                    if(!errLREM) {
                        console.log("LREM executed.");
                        rrpq.waitForEvents(workerQueueName);
                    }
                    else console.error(errLREM);
                });
            }
            else console.error(errBRPOPLPUSH);
        });
    }
}

let workerJS1_Queue = new WorkerJS1_Queue("workJS");
workerJS1_Queue.listen(1);