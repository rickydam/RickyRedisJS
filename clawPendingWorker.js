const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log("Redis client connected.\n");
});
redisClient.on('error', function(err) {
    console.error("Error: " + err);
});

class ClawPendingWorker {
    checkGroupPendingList(groupNumber) {
        redisClient.XPENDING('clawStream', 'clawGroup' + groupNumber, '-', '+', 100, function(errXPENDING, xpending) {
            if(!errXPENDING) {
                if(xpending != null) {
                    xpending.forEach(function(item) {
                        let xpendingStr = "XPENDING --> ";
                        let id = item[0];
                        let idStr = "id: " + id;
                        let consumer = item[1];
                        let consumerStr = ", consumer: " + consumer;
                        let idleTime = item[2];
                        let idleTimeStr = ", idleTime: " + idleTime;
                        let retryCount = item[3];
                        let retryCountStr = ", retryCount: " + retryCount;
                        console.log(xpendingStr + idStr + consumerStr + idleTimeStr + retryCountStr);
                        if(idleTime > 20000) {
                            redisClient.XCLAIM('clawStream', 'clawGroup' + groupNumber, 'Billy', 20000, id, function(errXCLAIM, xclaim) {
                                if(!errXCLAIM) {
                                    console.log("XCLAIM --> id: " + id + ", result: " + xclaim);
                                }
                                else console.error(errXCLAIM);
                            });
                        }
                    });
                }
                else console.log("XPENDING --> error. ")
            }
            else console.error(errXPENDING);
        });
        // this.checkGroupPendingList(groupNumber);
    }
}

let clawPendingWorker = new ClawPendingWorker();
clawPendingWorker.checkGroupPendingList(1);