const Redis = require('ioredis');
let redis = new Redis();

class ClawStream {
    createGroup(groupNumber) {
        console.time("createGroup");
        redis.xgroup('CREATE', 'clawStream', 'clawGroup' + groupNumber, '0', function(errXGROUP, resultXGROUP) {
            if(errXGROUP) console.log("XGROUP --> CREATE error. Stream does not exist or clawGroup" + groupNumber + " already exists.");
        });
        console.timeEnd("createGroup");
    }

    pushMessages(numberOfMessages, sizeOfMessage) {
        this.createJSON(sizeOfMessage, function(obj) {
            console.time("XADD");
            for(let i=0; i<numberOfMessages; i++) {
                redis.xadd('clawStream', '*', 'obj', obj, function(errXADD) {
                    if(errXADD) console.error(errXADD);
                });
            }
            console.timeEnd("XADD");
        });
    }

    createJSON(sizeOfMessage, callback) {
        let obj = {};
        for(let i=0; i<sizeOfMessage; i++) {
            let str = "item" + i;
            obj[str] = Math.random();
        }
        callback(obj);
    }
}

let clawStream = new ClawStream();
clawStream.createGroup(1);
clawStream.pushMessages(100000, 1024);