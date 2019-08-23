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
                        clawReadWorker.redisPipeline(id, groupNumber, consumer, null);
                    });
                }
                else {
                    clawReadWorker.blockedReadGroup(groupNumber, consumer, 10000);
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
                        clawReadWorker.redisPipeline(id, groupNumber, consumer, timeout);
                    });
                }
                else {
                    console.timeEnd("clawReadWorker");
                    process.exit();
                }
            }
            else console.error(errXREADGROUP);
        });
    }

    redisPipeline(id, groupNumber, consumer, timeout) {
        let pipeline = redis.pipeline();
        pipeline.xack('clawStream', 'clawGroup' + groupNumber, id, function(errXACK, xack) {
            if(!errXACK) {
                if(xack !== 1) {
                    if(timeout == null) {
                        clawReadWorker.readGroup(groupNumber, consumer);
                    }
                    else {
                        clawReadWorker.blockedReadGroup(groupNumber, consumer, timeout);
                    }
                }
            }
        });
        pipeline.xdel('clawStream', id, function(errXDEL, xdel) {
            if(errXDEL) console.error(errXDEL);
            if(timeout == null) {
                clawReadWorker.readGroup(groupNumber, consumer);
            }
            else {
                clawReadWorker.blockedReadGroup(groupNumber, consumer, timeout);
            }
        });
        pipeline.exec(function(errPipeline) {
            if(errPipeline) console.error(errPipeline);
        });
    }
}

let clawReadWorker = new ClawReadWorker();

let groupNumber = 1;
let consumer = 'Richard';

console.time("clawReadWorker");
clawReadWorker.readGroup(groupNumber, consumer);