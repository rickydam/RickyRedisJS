const Redis = require('ioredis');
let redis = new Redis();

class ClawPendingWorker {
    checkGroupPendingList() {
        setInterval(function() {
            clawPendingWorker.redisXPENDING();
        }, interval);
    }

    redisXPENDING() {
        redis.xpending('clawStream', 'clawGroup' + groupNumber, '-', '+', 1000000, function(errXPENDING, xpending) {
            if(!errXPENDING) {
                if(xpending != null) {
                    if(xpending.length > 0) {
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
                            clawPendingWorker.redisXCLAIM(id);
                        });
                    }
                    else console.log("XPENDING --> No data at the moment");
                }
                else console.log("XPENDING --> error.");
            }
            else console.error(errXPENDING);
        });
    }

    redisXCLAIM(id) {
        redis.xclaim('clawStream', 'clawGroup' + groupNumber, consumer, minIdleTime, id, function(errXCLAIM, xclaim) {
            if(!errXCLAIM) {
                let key = xclaim[0][1][0];
                let value = xclaim[0][1][1];
                console.log("XCLAIM --> id: " + id + ", result: " + key + value);
            }
            else console.error(errXCLAIM);
        });
    }
}

let clawPendingWorker = new ClawPendingWorker();

let groupNumber = 1;
let interval = 5000;
let consumer = 'Jack';
let minIdleTime = 20000;
clawPendingWorker.checkGroupPendingList();