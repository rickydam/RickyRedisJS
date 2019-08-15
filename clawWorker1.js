const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log("Redis client connected.\n");
});
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

class ClawWorker1 {
    readGroup(groupNumber, consumer) {
        redisClient.XREADGROUP('GROUP', 'clawGroup' + groupNumber, consumer, 'COUNT', 1, 'STREAMS', 'clawStream', '>', function(errXREADGROUP, xrg) {
            if(!errXREADGROUP) {
                if(xrg != null) {
                    let dataArr = xrg[0][1];
                    dataArr.forEach(function(item) {
                        let id = item[0];
                        let key = item[1][0];
                        let value = item[1][1];
                        console.log("XREADGROUP --> clawGroup" + groupNumber + ", " + consumer + ", id:" + id + ", data: " + key + value);
                        clawWorker.redisXACK(id, groupNumber, consumer, null);
                    });
                }
                else {
                    console.log("XREADGROUP --> error. clawGroup" + groupNumber + " has no data.\n");
                    console.log("Call blockedReadGroup\n");
                    clawWorker.blockedReadGroup(groupNumber, consumer, 5000);
                }
            }
            else console.error(errXREADGROUP);
        });
    }

    blockedReadGroup(groupNumber, consumer, timeout) {
        redisClient.XREADGROUP('GROUP', 'clawGroup' + groupNumber, consumer, 'BLOCK', timeout, 'COUNT', 1, 'STREAMS', 'clawStream', '>', function(errXREADGROUP, xrg) {
            if(!errXREADGROUP) {
                if(xrg != null) {
                    let dataArr = xrg[0][1];
                    dataArr.forEach(function(item) {
                        let id = item[0];
                        let key = item[1][0];
                        let value = item[1][1];
                        console.log("XREADGROUP --> BLOCK clawGroup" + groupNumber + ", " + consumer  + ", id:" + id + ", data: " + key + value);
                        clawWorker.redisXACK(id, groupNumber, consumer, timeout);
                    });
                }
                else {
                    console.log("XREADGROUP --> BLOCK error. clawGroup" + groupNumber + " received no data for " + timeout + "ms.");
                    process.exit();
                }
            }
            else console.error(errXREADGROUP);
        });
    }

    redisXACK(id, groupNumber, consumer, timeout) {
        redisClient.XACK('clawStream', 'clawGroup' + groupNumber, id, function(errXACK, xack) {
            if(!errXACK) {
                if(xack === 1) {
                    console.log("XACK --> id:" + id + ", successful.");
                    clawWorker.redisXDEL(id, groupNumber, consumer, timeout);
                }
                else {
                    console.log("XACK --> id:" + id + ", failed.");
                    if(timeout == null) console.log("readGroup again\n");
                    else console.log("blockedReadGroup again\n");
                    clawWorker.blockedReadGroup(groupNumber, consumer, timeout);
                }
            }
        });
    }

    redisXDEL(id, groupNumber, consumer, timeout) {
        redisClient.XDEL('clawStream', id, function(errXDEL, xdel) {
            if(!errXDEL) {
                if(xdel === 1) {
                    console.log("XDEL --> id:" + id + ", successful.");
                    console.log("blockedReadGroup again\n");
                    if(timeout == null) clawWorker.readGroup(groupNumber, consumer);
                    else clawWorker.blockedReadGroup(groupNumber, consumer, timeout);
                }
                else {
                    console.log("XDEL --> id:" + id + ", failed.");
                    console.log("blockedReadGroup again\n");
                    if(timeout == null) clawWorker.readGroup(groupNumber, consumer);
                    else clawWorker.blockedReadGroup(groupNumber, consumer, timeout);
                }
            }
            else {
                console.error(errXDEL);
                console.log("blockedReadGroup again\n");
                if(timeout == null) clawWorker.readGroup(groupNumber, consumer);
                else clawWorker.blockedReadGroup(groupNumber, consumer, timeout);
            }
        });
    }
}

let clawWorker = new ClawWorker1();
clawWorker.readGroup(1, 'Ricky');