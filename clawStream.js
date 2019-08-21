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

    pushMessages(numberOfMessages) {
        for(let i=0; i<numberOfMessages; i++) {
            redis.xadd('clawStream', '*', 'item', i, function(errXADD, resultXADD) {
                if(!errXADD) {
                    console.log("XADD --> item:" + i + ", id:", resultXADD);
                }
                else console.error(errXADD);
            });
        }
    }
}

let clawStream = new ClawStream();
clawStream.createGroup(1);
clawStream.pushMessages(5);