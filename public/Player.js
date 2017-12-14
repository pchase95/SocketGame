function Player(id, color, pos) {
    this.id = id;
    this.color = color;
    this.pos = pos;

    this.vel = 5;
    this.xvel = 0;
    this.yvel = 0;
    this.radius = Player.radius;
    this.lineLengh = this.radius + 15;
    this.lineEnd = { x: 0.0, y: 0.0 };
    this.shooting = false;
    this.burst = 0;
    this.clipSize = 30;
    this.clip = this.clipSize;
    this.reload = 0;
    this.reloadTime = 60; // 2 seconds

    // Functions called from listeners cannot be part of prototype or else
    // this will refer to the window object. This means I can spend extra
    // RAM like this by not using prototype, or I could spend performance
    // on using call
    this.startMove = (e) => {
        if (e.keyCode === 87) {
            this.yvel = -this.vel;
        }
        if (e.keyCode === 65) {
            this.xvel = -this.vel;
        }
        if (e.keyCode === 83) {
            this.yvel = this.vel;
        }
        if (e.keyCode === 68) {
            this.xvel = this.vel;
        }
        if (e.keyCode === 82 && this.clip < 30) {
            this.updateClipCount(true);
            this.reload++;
        }
    };
    // w -> 87
    // a -> 65
    // s -> 83
    // d -> 68
    // r -> 82
    // space -> 32
    this.stopMove = (e) => {
        if (e.keyCode === 87) {
            this.yvel = 0;
        }
        if (e.keyCode === 65) {
            this.xvel = 0;
        }
        if (e.keyCode === 83) {
            this.yvel = 0;
        }
        if (e.keyCode === 68) {
            this.xvel = 0;
        }
    };

    this.startShoot = (e) => {
        if (this.clip == 0 && this.reload == 0) {
            this.reload++;
            this.updateClipCount(true);
            return;
        }
        this.shooting = true;
    };
    
    
    this.stopShoot = (e) => {
        this.shooting = false;
        this.burst = 0;
    };
}

Player.radius = 25;

Player.prototype.update = function () {    
    if (!this.isColliding()) {
        this.pos.x += this.xvel;
        this.pos.y += this.yvel;
    }

    const t = this.lineLengh / utils.pointDistance(this.pos, mousePos);
    this.lineEnd.x = ((1 - t) * this.pos.x + t * mousePos.x);
    this.lineEnd.y = ((1 - t) * this.pos.y + t * mousePos.y);

    socket.emit('move', {
        id: userId,
        pos: this.pos,
        lineEnd: this.lineEnd
    });

    if (this.reload > 0 && this.reload < this.reloadTime) {
        this.reload++;
    }

    if (this.reload === this.reloadTime) {
        this.reload = 0;
        this.clip = this.clipSize;
        this.updateClipCount();
    }

    this.draw();
    if (this.shooting) {
        this.shoot();
    }
};

Player.prototype.updateClipCount = function (reload) {
    if (reload) {
        clipCount.innerText = 'Reloading...';
        return;
    }
    clipCount.innerText = 'Ammo: ' + this.clip;  
};

Player.prototype.updateNet = function () {
    this.draw();
};

// burst is so you ALWAYS fire at least 1 bullet when you click
// even if timer % 3 isn't 0
Player.prototype.shoot = function () {
    // Setting RoF to 1 per 3 intervals
    // 30 intervals a seond
    // So 10 round a second, or 600rpm
    // Weird shit happens if you compare number to 0 with ===
    if ((timer % 3 == 0 || this.burst == 0) && this.clip > 0 && this.reload == 0) {
        // Object.assign so I can pass by value rather than reference
        const b = new Bullet(
            this.id,
            Object.assign({}, this.lineEnd),
            Object.assign({}, this.pos),
            this.color,
            mousePos
        );

        socket.emit('shoot', {
            id: this.id,
            pos: this.lineEnd,
            playerPos: this.pos,
            color: this.color,
            targetPos: mousePos
        });

        bullets.push(b);
        this.burst++;
        this.clip--;
        this.updateClipCount();
    }
};

Player.prototype.draw = function () {
    ctx.fillStyle = this.color;
    utils.drawCircle(this.pos, this.radius);
    
    ctx.fillStyle = 'black';
    
    utils.drawLine(this.pos, this.lineEnd);
};

Player.prototype.setPos = function (newPos) {
    this.pos.x = newPos.x;
    this.pos.y = newPos.y;
};

Player.prototype.setLineEnd = function (newLineEnd) {
    this.lineEnd.x = newLineEnd.x;
    this.lineEnd.y = newLineEnd.y;
};

Player.prototype.isColliding = function () {
    for (let i in walls) {
        let wall = walls[i];
        if (wall.pos.x < this.pos.x + Player.radius
        && wall.pos.x + wall.dims.width > this.pos.x - Player.radius
        && wall.pos.y < this.pos.y + Player.radius
        && wall.dims.height + wall.pos.y > this.pos.y - Player.radius) {
            return true;
        }
    }
    return false;
};
