const express = require('express');
const app = express();

//sets up listener on local host and port 3000
const server = app.listen(3000, '127.0.0.1', () => {
    const addr = server.address();
    console.log('Express started on %s:%s\nPress Ctrl-c to terminate', addr.address, addr.port);
});
//Importing socket.io and creating connection
const io = require('socket.io')(server);

let users = [];

const canvasWidth = 800;
const canvasHeight = 450;
const offset = 0;

function randomInt(floor, roof) {
    return (Math.floor(Math.random() * roof)) + floor;
}

function randomCoords() {
    return {
        x: randomInt(offset, canvasWidth - offset),
        y: randomInt(offset, canvasHeight - offset)
    };
}

function beginGame() {
    for (let i in users) {
        const r = randomInt(0, 256);
        const g = randomInt(0, 256);
        const b = randomInt(0, 256);

        users[i].color = 'rgb('+r+ ',' +g+ ',' +b+')';
        const coords = randomCoords();
        users[i].pos = {
            x: coords.x,
            y: coords.y
        };
    }

    io.sockets.emit('begin', users);
}


io.on('connection', (skt) => {//Server Side Code for user interaction
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

    skt.on('shoot', (data) => {
        skt.broadcast.emit('shoot', data);
    });

    skt.on('chat', (data) => {
        io.sockets.emit('chat', {
            msg: data,
            userId: skt.userId,
            userName: skt.userName
        });
    });

    skt.on('kill', (data) => {
        const coords = randomCoords();
        io.sockets.emit('kill', {
            id: data,
            respawnPos: {
                x: coords.x,
                y: coords.y
            }
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
        for (let i in io.sockets.sockets) {
            if (io.sockets.sockets[i].ready) {
                numReady++;
                if (numReady === users.length) {
                    beginGame();
                    break;
                }
            }
        }

    });

    skt.on('disconnect', (reason) => { //code for when a user disconnects
        if (skt.userName !== '') {
            users.splice(skt.userId, 1);

            io.sockets.emit('dc', {
                userId: skt.userId,
                userName: skt.userName
            });
        }

        console.log(skt.id + ' disconnected\n' + reason + '\n');
    });
    
});


app.use(express.static('public'));
