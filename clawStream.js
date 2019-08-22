const Redis = require('ioredis');
let redis = new Redis();

class ClawStream {
    createGroup(groupNumber) {
        redis.xgroup('CREATE', 'clawStream', 'clawGroup' + groupNumber, '0', function(errXGROUP, resultXGROUP) {
            if(!errXGROUP) {
                console.log("XGROUP --> CREATE clawGroup" + groupNumber + ", " + resultXGROUP);
            }
            else console.log("XGROUP --> CREATE error. Stream does not exist or clawGroup" + groupNumber + " already exists.");
        });
    }

    pushMessages(numberOfMessages, sizeOfMessage) {
        for(let i=0; i<numberOfMessages; i++) {
            let obj = this.createJSON(sizeOfMessage);
            redis.xadd('clawStream', '*', 'obj', obj, function(errXADD, resultXADD) {
                if(!errXADD) {
                    console.log("XADD --> " + i + ", id:", resultXADD);
                }
                else console.error(errXADD);
            });
        }
    }

    createJSON(sizeOfMessage) {
        let obj = {};
        for(let i=0; i<sizeOfMessage; i++) {
            let str = "item" + i;
            obj[str] = Math.random();
        }
    }
}

let clawStream = new ClawStream();
clawStream.createGroup(1);
clawStream.pushMessages(10000, 1024);