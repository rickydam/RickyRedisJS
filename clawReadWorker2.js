const Redis = require('ioredis');
let redis = new Redis();

class ClawReadWorker {
    readGroup(groupNumber, consumer) {
        redis.xreadgroup('GROUP', 'clawGroup' + groupNumber, consumer, 'COUNT', 1, 'STREAMS', 'clawStream', '>', function(errXREADGROUP, xrg) {
            if(!errXREADGROUP) {
                if(xrg != null) {
                    let dataArr = xrg[0][1];
                    dataArr.forEach(function(item) {
                        let id = item[0];
                        let key = item[1][0];
                        let value = item[1][1];
                        console.log("XREADGROUP --> clawGroup" + groupNumber + ", " + consumer + ", id:" + id + ", data: " + key + value);
                        clawReadWorker.redisXACK(id, groupNumber, consumer, null);
                    });
                }
                else {
                    console.log("XREADGROUP --> error. clawGroup" + groupNumber + " has no data.\n");
                    console.log("Call blockedReadGroup\n");
                    clawReadWorker.blockedReadGroup(groupNumber, consumer, 5000);
                }
            }
            else console.error(errXREADGROUP);
        });
    }

    blockedReadGroup(groupNumber, consumer, timeout) {
        redis.xreadgroup('GROUP', 'clawGroup' + groupNumber, consumer, 'BLOCK', timeout, 'COUNT', 1, 'STREAMS', 'clawStream', '>', function(errXREADGROUP, xrg) {
            if(!errXREADGROUP) {
                if(xrg != null) {
                    let dataArr = xrg[0][1];
                    dataArr.forEach(function(item) {
                        let id = item[0];
                        let key = item[1][0];
                        let value = item[1][1];
                        console.log("XREADGROUP --> BLOCK clawGroup" + groupNumber + ", " + consumer  + ", id:" + id + ", data: " + key + value);
                        clawReadWorker.redisXACK(id, groupNumber, consumer, timeout);
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
        redis.xack('clawStream', 'clawGroup' + groupNumber, id, function(errXACK, xack) {
            if(!errXACK) {
                if(xack === 1) {
                    console.log("XACK --> consumer: " + consumer + ", id: " + id + ", successful.");
                    clawReadWorker.redisXDEL(id, groupNumber, consumer, timeout);
                }
                else {
                    console.log("XACK --> consumer: " + consumer + ", id: " + id + ", failed.");
                    if(timeout == null) {
                        console.log("readGroup again\n");
                        clawReadWorker.readGroup(groupNumber, consumer);
                    }
                    else {
                        console.log("blockedReadGroup again\n");
                        clawReadWorker.blockedReadGroup(groupNumber, consumer, timeout);
                    }
                }
            }
        });
    }

    redisXDEL(id, groupNumber, consumer, timeout) {
        redis.xdel('clawStream', id, function(errXDEL, xdel) {
            if(!errXDEL) {
                if(xdel === 1) console.log("XDEL --> consumer: " + consumer + ", id: " + id + ", successful.");
                else console.log("XDEL --> consumer: " + consumer + ", id: " + id + ", failed.");
            }
            else console.error(errXDEL);
            if(timeout == null) {
                console.log("readGroup again\n");
                clawReadWorker.readGroup(groupNumber, consumer);
            }
            else {
                console.log("blockedReadGroup again\n");
                clawReadWorker.blockedReadGroup(groupNumber, consumer, timeout);
            }
        });
    }
}

let clawReadWorker = new ClawReadWorker();

let groupNumber = 1;
let consumer = 'Gilfoyle';
clawReadWorker.readGroup(groupNumber, consumer);