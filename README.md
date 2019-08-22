### Performance Tests

Device used: <br>
MacBook Pro 13-inch, Mid-2017 (Model: A1708 EMC 3164) <br>
CPU: Intel i5-7360U, 2.3 GHz, dual-core, 64-bit <br>
RAM: 16GB LPDDR3 2133 MHz <br>

| Performance Test | Results (console.time) |
| ---------------- | ---------------------- |
| 10,000 messages <br> Each message has a JSON object with 1024 key-value pairs <br> (Example) item37: 0.9606370861792557 | pushMessages took 1884.030 ms <br> clawReadWorker took 3681.307 ms
| 10,000 messages <br> Each message has a JSON object with 5000 key-value pairs <br> (Example) item21: 0.3198580045674586 | pushMessages took 8481.159 ms <br> clawReadWorker took 3606.288 ms
| 100,000 messages <br> Each message has a JSON object with 1024 key-value pairs <br> (Example) item54: 0.617136188264803 | pushMessages took 17868.518 ms <br> clawReadWorker took 31050.228 ms
| 100,000 messages <br> Each message has a JSON object with 5000 key-value pairs <br> (Example) item43: 0.8826173661160888 | pushMessages took 82835.053 ms <br> clawReadWorker took 31294.632 ms

**Observations**: <br>
- Increasing the number of key-value pairs in the JSON object: <br>
    - for-loop creating dynamic JSON has to run more iterations, takes more time
    - XREADGROUP is unaffected by more key-value pairs
- Increasing the number of messages: <br>
    - for-loop calling XADD has to run more iterations, takes more time

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