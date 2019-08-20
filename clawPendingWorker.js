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
                if(xclaim != null) {
                    if(xclaim.length > 0) {
                        let key = xclaim[0][1][0];
                        let value = xclaim[0][1][1];
                        console.log("XCLAIM --> new consumer: " + consumer + ", id: " + id + ", result: " + key + value);
                        clawPendingWorker.redisXACK(id);
                    }
                }
            }
            else console.error(errXCLAIM);
        });
    }

    redisXACK(id) {
        redis.xack('clawStream', 'clawGroup' + groupNumber, id, function(errXACK, xack) {
            if(!errXACK) {
                if(xack === 1) {
                    console.log("XACK --> consumer: " + consumer + ", id: " + id + ", successful.");
                    clawPendingWorker.redisXDEL(id);
                }
                else console.log("XACK --> consumer: " + consumer + ", id: " + id + ", failed.");
            }
            else console.error(errXACK);
        });
    }

    redisXDEL(id) {
        redis.xdel('clawStream', id, function(errXDEL, xdel) {
            if(!errXDEL) {
                if(xdel === 1) console.log("XDEL --> consumer: " + consumer + ", id: " + id + ", successful.");
                else console.log("XDEL --> consumer: " + consumer + ", id: " + id + ", failed.");
            }
            else console.error(errXDEL);
        });
    }
}

let clawPendingWorker = new ClawPendingWorker();

let groupNumber = 1;
let interval = 5000;
let consumer = 'Dinesh';
let minIdleTime = 20000;
clawPendingWorker.checkGroupPendingList();