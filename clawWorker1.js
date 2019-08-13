const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log("Redis client connected.");
});
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

class ClawWorker1 {
    readGroup(number) {
        redisClient.XREADGROUP('GROUP', 'clawGroup' + number, 'Ricky', 'COUNT', 100, 'STREAMS', 'clawStream', '>', function(errXREADGROUP, xrg) {
            if(!errXREADGROUP) {
                if(xrg != null) {
                    // xrg: object with one array
                    // xrg[0]: two arrays
                    // xrg[0][0]: stream name string
                    // xrg[0][1]: array with the data
                    let dataArr = xrg[0][1];
                    dataArr.forEach(function(item) {
                        let actionStr = "XREADGROUP --> clawGroup" + number;
                        let idStr = "id:" + item[0];
                        let dataStr = "data: " + item[1][0] + item[1][1];
                        console.log(actionStr + ", " + idStr + ", " + dataStr);
                    });
                }
                else console.log("XREADGROUP --> error. clawGroup" + number + " has no data.");
            }
            else console.error(errXREADGROUP);
        });
    }

    // listen(workerId) {
    //     console.log("Listening...");
    //     let workerQueueName = "workerJS" + workerId + "-queue"; // Queue: workerJS1-queue
    //     console.log(workerQueueName);
    //     this.queuePastEvents(workerQueueName);
    //     this.waitForEvents(workerQueueName);
    // }

    // queuePastEvents(workerQueueName) {
    //     let rrpq = this;
    //     redisClient.LRANGE(workerQueueName, 0, -1, function(errLRANGE, resultLRANGE) {
    //         if(!errLRANGE) {
    //             let workerQueueArr = resultLRANGE;
    //             workerQueueArr.forEach(function() {
    //                 console.log("workerQueueArr length: " + workerQueueArr.length);
    //                 console.log("Pop last item in workerQueue, push to the start of workQueue");
    //                 redisClient.RPOPLPUSH(workerQueueName, rrpq.workQueueName, function(errRPOPLPUSH) {
    //                     if(!errRPOPLPUSH) console.log("RPOPLPUSH executed.");
    //                     else console.error(errRPOPLPUSH);
    //                 });
    //             });
    //         }
    //         else console.error(errLRANGE);
    //     });
    // }

    // waitForEvents(workerQueueName) {
    //     let rrpq = this;
    //     console.log("\nBlock the connection until the workerQueue gets the task.");
    //     console.log("waitForEvents...");
    //
    //     redisClient.BRPOPLPUSH(rrpq.workQueueName, workerQueueName, 0, function(errBRPOPLPUSH, resultBRPOPLPUSH) {
    //         if(!errBRPOPLPUSH) {
    //             console.log("BRPOPLPUSH executed.");
    //             console.log(resultBRPOPLPUSH);
    //             redisClient.LREM(workerQueueName, 1, resultBRPOPLPUSH, function(errLREM) {
    //                 if(!errLREM) {
    //                     console.log("LREM executed.");
    //                     rrpq.waitForEvents(workerQueueName);
    //                 }
    //                 else console.error(errLREM);
    //             });
    //         }
    //         else console.error(errBRPOPLPUSH);
    //     });
    // }
}

let clawWorker1 = new ClawWorker1();
clawWorker1.readGroup(1);

// ClawWorker1.listen(1);