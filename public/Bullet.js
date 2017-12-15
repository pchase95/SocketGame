function Bullet(id, userId, pos, playerPos, color, targetPos) {
    this.id = id;
    this.userId = userId;
    this.pos = pos;
    this.color = color;
    this.destroy = false;
    
    this.vel = 15;
    this.radius = 5;
    
    const opp = utils.pointDistance({
        x: pos.x,
        y: playerPos.y
    }, pos);

    const hyp = utils.pointDistance(playerPos, pos);
    const angle = Math.asin(opp / hyp);

    const quadrant = utils.pointSub(this.pos, playerPos);

    this.xvel = Math.sign(quadrant.x) * this.vel * Math.cos(angle);
    this.yvel = Math.sign(quadrant.y) * this.vel * Math.sin(angle);
}

Bullet.prototype.update = function (index) {
    this.pos.x += this.xvel;
    this.pos.y += this.yvel;
    this.draw();
    this.detectPlayers();
    this.detectWalls();
};

Bullet.prototype.detectPlayers = function () {
    for (let i in players) {
        if (this.pos.x >= players[i].pos.x - Player.radius && this.pos.x <= players[i].pos.x + Player.radius
        && this.pos.y >= players[i].pos.y - Player.radius && this.pos.y <= players[i].pos.y + Player.radius) {
            socket.emit('kill', i);
        }
    }
};
    
Bullet.prototype.detectWalls = function () {
    for (let i in walls) {
        if (this.pos.x >= walls[i].pos.x - walls[i].dims.width && this.pos.x <= walls[i].pos.x + walls[i].dims.width
        && this.pos.y >= walls[i].pos.y - walls[i].dims.height && this.pos.y <= walls[i].pos.y + walls[i].dims.height) {
            this.destroy = true;
        }
    }

    if (!(this.pos.x > 0 && this.pos.x <= canvas.width
    && this.pos.y > 0 && this.pos.y <= canvas.height)) {
        this.destroy = true;
    }
};

Bullet.prototype.draw = function () {
    ctx.fillStyle = this.color;
    utils.drawCircle(this.pos, this.radius);
};
