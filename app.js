const express = require('express');
const app = express();

const server = app.listen(4000, 'localhost', () => {
    const addr = server.address();
    console.log('Express started on %s:%s\nPress Ctrl-c to terminate', addr.address, addr.port);
});

const io = require('socket.io')(server);

let users = [];


io.on('connection', (skt) => {
    console.log('Made connection to: ' + skt.id);
        
    skt.on('name', (data) => {
        skt.userId = users.length;
        skt.userName = data;
        
        skt.emit('signin', {
            userId: skt.userId,
            userName: skt.userName
        });

        skt.broadcast.emit('newuser', {
            userId: skt.userId,
            userName: skt.userName
        });

        skt.emit('otherusers', users);
        users.push({
            userId: skt.userId,
            name: skt.userName
        });
    });

    skt.on('move', (data) => {
        skt.broadcast.emit('move', data);
    });

    skt.on('chat', (data) => {
        io.sockets.emit('chat', {
            msg: data,
            userId: skt.userId,
            userName: skt.userName
        });
    });

    skt.on('ready', (data) => {
        skt.ready = !data;
        io.sockets.emit('ready', {
            userId: skt.userId,
            userName: skt.userName,
            ready: skt.ready
        });

        // check all ready
        let numReady = 0;
        for (let s in io.sockets.sockets) {
            if (io.sockets.sockets[s].ready) {
                numReady++;
                if (numReady === users.length) {
                    io.sockets.emit('begin');
                    break;
                }
            }
        }

    });

    skt.on('disconnect', (reason) => {
        if (skt.userName !== '') {
            users.splice(skt.userId, 1);
            console.log(users);
        }

        console.log(skt.id + ' disconnected\n' + reason + '\n');
    });
});


app.use(express.static('public'));
