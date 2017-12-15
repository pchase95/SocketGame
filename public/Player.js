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
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;

    // Functions called from listeners cannot be part of prototype or else
    // this will refer to the window object. This means I can spend extra
    // RAM like this by not using prototype, or I could spend performance
    // on using call
    this.startMove = (e) => {
        if (e.keyCode === 87) {
            this.moveUp = true;
        }
        if (e.keyCode === 65) {
            this.moveLeft = true;
        }
        if (e.keyCode === 83) {
            this.moveDown = true;
        }
        if (e.keyCode === 68) {
           this.moveRight = true;
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
            this.moveUp = false;
        }
        if (e.keyCode === 65) {
            this.moveLeft = false;
        }
        if (e.keyCode === 83) {
            this.moveDown = false;
        }
        if (e.keyCode === 68) {
            this.moveRight = false;
        }
    };

    this.startShoot = (e) => {
        if (e.button == 0) {
            if (this.clip == 0 && this.reload == 0) {
                this.reload++;
                this.updateClipCount(true);
                return;
            }
            this.shooting = true;
        }
    };
    
    
    this.stopShoot = (e) => {
        this.shooting = false;
        this.burst = 0;
    };
}

Player.radius = 25;

Player.prototype.update = function () {    
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
    if (!this.moveUp && !this.moveDown) {
        this.yvel = 0;
    } else {
        if (this.moveUp) {
            this.yvel = -this.vel;
        } else if (this.moveDown) {
            this.yvel = this.vel;
        }
    }

    if (!this.moveRight && !this.moveLeft) {
        this.xvel = 0;
    } else {
        if (this.moveLeft) {
            this.xvel = -this.vel;
        } else if (this.moveRight) {
            this.xvel = this.vel;
        }
    }

    if (!this.willCollide()) {
        this.pos.x += this.xvel;
        this.pos.y += this.yvel;
    }
    
    if (this.shooting) {
        this.shoot();
    }
    this.draw();
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
            bullets.length,
            this.id,
            Object.assign({}, this.lineEnd),
            Object.assign({}, this.pos),
            this.color,
            mousePos
        );

        socket.emit('shoot', {
            id: bullets.length,
            playerId: this.id,
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

Player.prototype.willCollide = function () {
    let wall;
    const newPos = Object.assign({}, this.pos);
    let newRadius = this.radius;
    for (let i in walls) {
        wall = walls[i];
        
        if (this.moveUp) {
            newPos.y -= this.vel;
        } else if (this.moveDown) {
            newPos.y += this.vel;
        }

        if (this.moveLeft) {
            newPos.x -= this.vel;
        } else if (this.moveRight) {
            newPos.x += this.vel;
        }


        if (utils.isCircleBoxColliding({
            pos: newPos,
            radius: newRadius
        }, wall)) {
            return true;
        }
    }
    return false;
};

