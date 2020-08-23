const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let broadcasters = [];

io.on('connection', socket => {
    console.log(`Connected ${socket.id}`);

    socket.on('new broadcaster', room => {
        console.log('New broadcaster');
        broadcasters[room] = socket.id;
        socket.join(room);
    })

    socket.on('new viewer', user => {
        console.log('New viewer')
        socket.join(user.room);
        user.id = socket.id;
        socket.to(broadcasters[user.room]).emit("new viewer", user);
    })

    socket.on("candidate", (id, event) => {
        socket.to(id).emit("candidate", socket.id, event);
    });

    socket.on('offer', (id, event) => {
        event.broadcaster.id = socket.id;
        socket.to(id).emit("offer", event.broadcaster, event.sdp);
    })

    socket.on("answer", event => {
        socket.to(broadcasters[event.room]).emit("answer", socket.id, event.sdp);
    });
})

server.listen(8080, () => {
    console.log('Server running on port 8080');
})
