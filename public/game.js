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
const players = [];
const bullets = [];
let mousePos = { x: 0.0, y: 0.0 };

nameSubmit.addEventListener('click', (e) => {
    const name = nameEntry.value;
    if (utils.sanitizeUserName(name)) {
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
    if (utils.sanitizeMessage(msg)) {
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

socket.on('begin', (data) => {
    chatContainer.style.display = 'none';

    for (let i in data) {
        players.push( new Player(data[i].userId, data[i].color, data[i].pos) );
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

    window.addEventListener('keydown', players[userId].startMove);
    window.addEventListener('keyup', players[userId].stopMove);
    canvas.addEventListener('mousemove', utils.setMousePos);
    canvas.addEventListener('mousedown', players[userId].shoot);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#cec8c8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i in players) {
        if (userId == i) {
            players[i].update();
        } else {
            players[i].updateNet();
        }
    }

    for (let i in bullets) {
        bullets[i].pos.x += bullets[i].xvel;
        bullets[i].pos.y += bullets[i].yvel;

        bullets[i].draw();

        for (let j in players) {
            if (bullets[i].pos.x >= players[j].pos.x - Player.radius && bullets[i].pos.x <= players[j].pos.x + Player.radius
            && bullets[i].pos.y >= players[j].pos.y - Player.radius && bullets[i].pos.y <= players[j].pos.y + Player.radius) {
                socket.emit('kill', j);
            }
        }

        if (!(bullets[i].pos.x > 0 && bullets[i].pos.x <= canvas.width &&
        bullets[i].pos.y > 0 && bullets[i].pos.y <= canvas.height)) {
            bullets.splice(i, 1);
        }
    }
}

socket.on('kill', (data) => {
    players[data.id].setPos(data.respawnPos);
});

socket.on('move', (data) => {
    players[data.id].setPos(data.pos);
    players[data.id].setLineEnd(data.lineEnd);
});

socket.on('shoot', (data) => {
    bullets.push(new Bullet(
        data.id,
        data.pos,
        data.playerPos,
        data.color,
        data.targetPos
    ));
});

// ###############################

