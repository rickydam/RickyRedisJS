### Performance Tests

Device used: <br>
MacBook Pro 13-inch, Mid-2017 (Model: A1708 EMC 3164) <br>
CPU: Intel i5-7360U, 2.3 GHz, dual-core, 64-bit <br>
RAM: 16GB LPDDR3 2133 MHz <br>

| Performance Test | Results (console.time) |
| ---------------- | ---------------------- |
| 10,000 messages <br> JSON with 1024 key-value pairs | pushMessages took 52.926 ms <br> clawReadWorker took 1568.747 ms
| 10,000 messages <br> JSON with 5000 key-value pairs | pushMessages took 50.360 ms <br> clawReadWorker took 1710.200 ms
| 100,000 messages <br> JSON with 1024 key-value pairs | pushMessages took 259.420 ms <br> clawReadWorker took 14370.777 ms
| 1,000,000 messages <br> JSON with 1024 key-value pairs | pushMessages took 2635.301 ms <br> clawReadWorker took 141862.422 ms
| 10,000 messages <br> JSON with 32,000 key-value pairs (Approx 1 MB) | pushMessages took 47.577 ms <br> clawReadWorker took 1543.636 ms
| 10,000 messages <br> JSON with 320,000 key-value pairs (Approx 10 MB) | pushMessages took 46.354 ms <br> clawReadWorker took 1575.736 ms
| 10,000 messages <br> JSON with 3,200,000 key-value pairs (Approx 100 MB) | pushMessages took 96.944 ms <br> clawReadWorker took 1538.306 ms

**Observations**: <br>
- Increasing the number of key-value pairs in the JSON object: <br>
    - XREADGROUP is unaffected by more key-value pairs
- Increasing the number of messages: <br>
    - for-loop calling XADD has to run more iterations, takes more time

<hr>

### What each JavaScript file does

* node clawStream.js
    * tries to create group1 (XGROUP)
    * pushes 5 messages (XADD)

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