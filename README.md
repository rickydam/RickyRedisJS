### What each JavaScript file does

* node clawStream.js
    * tries to create group1 (XGROUP)
    * pushes 100 messages (XADD)

* node clawReadWorker.js
    * go over past messages (XREADGROUP)
    * block for 10000 ms to read incoming messages (XREADGROUP BLOCK)
    * exit node process if no data for 10000 ms (process.exit)

* node clawPendingWorker.js
    * go over pending list every 5000 ms (XPENDING)
    * claim message if idle time is more than 20000 ms (XCLAIM)
    * process the message
    * acknowledge the message to remove it from the pending list (XACK)
    * delete the message from the stream (XDEL)