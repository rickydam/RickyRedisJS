const redis = require('redis');

let redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log("Redis client connected.\n");
});
redisClient.on('error', function(err) {
    console.error('Error: ' + err);
});

class ClawWorker1 {
    readGroup(number) {
        let clawWorker1 = this;
        redisClient.XREADGROUP('GROUP', 'clawGroup' + number, 'Ricky', 'COUNT', 1, 'STREAMS', 'clawStream', '>', function(errXREADGROUP, xrg) {
            if(!errXREADGROUP) {
                if(xrg != null) {
                    let dataArr = xrg[0][1];
                    dataArr.forEach(function(item) {
                        let id = item[0];
                        let key = item[1][0];
                        let value = item[1][1];
                        console.log("XREADGROUP --> clawGroup" + number + ", id:" + id + ", data: " + key + value);
                        redisClient.XACK('clawStream', 'clawGroup1', id, function(errXACK, xack) {
                            if(!errXACK) {
                                console.log("XACK --> id:" + id + ", " + xack);
                                console.log("readGroup again\n");
                                clawWorker1.readGroup(number);
                            }
                            else console.error(errXACK);
                        });
                    });
                }
                else {
                    console.log("XREADGROUP --> error. clawGroup" + number + " has no data.\n");
                    console.log("Call blockedReadGroup\n");
                    clawWorker1.blockedReadGroup(number, 5000);
                }
            }
            else console.error(errXREADGROUP);
        });
    }

    blockedReadGroup(number, timeout) {
        let clawWorker1 = this;
        redisClient.XREADGROUP('GROUP', 'clawGroup' + number, 'Ricky', 'BLOCK', timeout, 'COUNT', 1, 'STREAMS', 'clawStream', '>', function(errXREADGROUP, xrg) {
            if(!errXREADGROUP) {
                if(xrg != null) {
                    let dataArr = xrg[0][1];
                    dataArr.forEach(function(item) {
                        let id = item[0];
                        let key = item[1][0];
                        let value = item[1][1];
                        console.log("XREADGROUP --> BLOCK clawGroup" + number + ", id:" + id + ", data: " + key + value);
                        redisClient.XACK('clawStream', 'clawGroup1', id, function(errXACK, xack) {
                            if(!errXACK) {
                                console.log("XACK --> id:" + id + ", " + xack);
                                console.log("blockedReadGroup again\n");
                                clawWorker1.blockedReadGroup(number, timeout);
                            }
                        });
                    });
                }
                else {
                    console.log("XREADGROUP --> BLOCK error. clawGroup" + number + " received no data for " + timeout + "ms.");
                    process.exit();
                }
            }
            else console.error(errXREADGROUP);
        });
    }
}

let clawWorker1 = new ClawWorker1();
clawWorker1.readGroup(1);