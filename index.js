const express = require('express');

const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

var app = express()
let inProgress = false;

function startWorker(path, cb) {
    let w = new Worker(path, { workerData: null });
    w.on('message', (msg) => {
        cb(null, msg)
    })
    w.on('error', cb);
    w.on('exit', (code) => {
        if (code != 0)
            console.error(new Error(`Worker stopped with exit code ${code}`))
    });
    return w;
}

function refresh() {
    if (inProgress) return;
    inProgress = true;
    let myWorker = startWorker(__dirname + '/worker.js', (err, result) => {
        if (err) return console.error(err);
        data = result.data;
        inProgress = false;
    })
    setTimeout(refresh, 60000 * 10); // 10 mins
}

// setInterval(refresh, 1000); // 5 mins
setTimeout(refresh, 1000);

app.use(express.static('public'));
app.listen(process.env.PORT || 80)
