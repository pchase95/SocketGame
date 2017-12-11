const socket = io.connect('localhost:3000');
console.log(socket);
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');
const ctx = canvas.getContext('2d');

const chatContainer = document.getElementById('chat-container');
const chat = document.getElementById('chat');
const chatOutput = document.getElementById('chat-output');
const chatBox = document.getElementById('chat-box');
const chatSend = document.getElementById('chat-send');

const readyUp = document.getElementById('ready-up');

const nameContainer = document.getElementById('name-container');
const nameEntry = document.getElementById('name-entry');
const nameSubmit = document.getElementById('name-submit');

const conPlayers = document.getElementById('con-players');
const displayName = document.getElementById('display-name');

let userId = -1;
let userName = '';
let otherUsers = [];
let ready = false;
let gameBegin = false;

function sanitizeUserName(str) {
    const pattern = new RegExp('^\s*([0-9a-zA-Z]+)\s*$');
    return pattern.test(str);
}

function sanitizeMessage(str) {
    const pattern = new RegExp('^\s*([0-9a-zA-Z_ ]+)\s*$');
    return pattern.test(str);
}

function createPlayer(id, color, pos) {
    return {
        id,
        x: pos.x,
        y: pos.y,
        xvel: 0,
        yvel: 0,
        vel: 5,
        color,
        radius: 25
    };
}

nameSubmit.addEventListener('click', (e) => {
    const name = nameEntry.value;
    if (sanitizeUserName(name)) {
        socket.emit('name', name);
        nameContainer.style.display = 'none';
        chatContainer.style.display = 'block';
        nameEntry.value = '';
    }
});

socket.on('signin', (data) => {
    userId = data.userId;
    userName = data.userName;
    displayName.innerText = userName;
});

socket.on('newuser', (data) => {
    conPlayers.innerHTML += '<li id=' + data.userName + '>' + data.userName + '</li>';
    otherUsers.push(data);
});

chatSend.addEventListener('click', (e) => {
    const msg = chatBox.value;
    if (sanitizeMessage(msg)) {
        socket.emit('chat', msg);
        chatBox.value = '';
    }
});

socket.on('chat', (data) => {
    if (data.userId === userId) {
        chatOutput.innerHTML += '<h2 style="text-align: right;">' + 'you: ' + data.msg + '</h2>';
    } else {
        chatOutput.innerHTML += '<p>' + data.userName + ': ' + data.msg + '</p>';
    }
    
});

readyUp.addEventListener('click', (e) => {
    socket.emit('ready', ready);
});

socket.on('ready', (data) => {
    const tag = document.getElementById(data.userName);
    if (tag) {
        if (data.ready) {
            tag.style.backgroundColor = 'blue';
            tag.style.color = 'white';
        } else {
            tag.style.backgroundColor = '';
            tag.style.color = '#575ed8';
        }
    }

    if (data.userId === userId) {
        ready = data.ready;
        if (ready) {
            readyUp.innerText = 'Unready';
        } else {
            readyUp.innerText = 'Ready Up';
        }
    }
});

let players = [];

socket.on('begin', (data) => {
    chatContainer.style.display = 'none';

    for (let i in data) {
        players.push( createPlayer(data[i].id, data[i].color, data[i].pos) );
    }

    gameBegin = true;
    init();
});

socket.on('dc', (data) => {
    if (gameBegin) {
        players.splice(data.userId, 1);
    }
    const lobbyTag = document.getElementById(data.userName);
    lobbyTag.parentNode.removeChild(lobbyTag);
});


// ###############################
// ########## GAME CODE ##########
// ###############################
function init() {
    canvasContainer.style.display = 'block';
    setInterval(update, 1000/30);
    canvas.width = 800;
    canvas.height = 450;

    // w -> 87
    // a -> 65
    // s -> 83
    // d -> 68
    // space -> 32
    window.addEventListener('keydown', (e) => {
        if (e.keyCode === 87) {
            players[userId].yvel = -players[userId].vel;
        }
        if (e.keyCode === 65) {
            players[userId].xvel = -players[userId].vel;
        }
        if (e.keyCode === 83) {
            players[userId].yvel = players[userId].vel;
        }
        if (e.keyCode === 68) {
            players[userId].xvel = players[userId].vel;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.keyCode === 87) {
            players[userId].yvel = 0;
        }
        if (e.keyCode === 65) {
            players[userId].xvel = 0;
        }
        if (e.keyCode === 83) {
            players[userId].yvel = 0;
        }
        if (e.keyCode === 68) {
            players[userId].xvel = 0;
        }
    });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#cec8c8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    players[userId].x += players[userId].xvel;
    players[userId].y += players[userId].yvel;

    if (players[userId].x) {
        socket.emit('move', {
            id: userId,
            x: players[userId].x,
            y: players[userId].y
        });
    }

    for (let p in players) {
        ctx.beginPath();
        ctx.arc(players[p].x, players[p].y, players[p].radius, 0, 2 * Math.PI);
        ctx.fillStyle = players[p].color;
        ctx.fill();
        ctx.stroke();
    }
}

socket.on('move', (data) => {
    players[data.id].x = data.x;
    players[data.id].y = data.y;
});

// ###############################

