const Redis = require('ioredis');
let redis = new Redis();

class ClawPendingWorker {
    checkGroupPendingList(groupNumber) {
        redis.xpending('clawStream', 'clawGroup' + groupNumber, '-', '+', 100, function(errXPENDING, xpending) {
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
                            redis.xclaim('clawStream', 'clawGroup' + groupNumber, 'Billy', 20000, id, function(errXCLAIM, xclaim) {
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