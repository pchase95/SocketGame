function Bullet(userId, pos, playerPos, color, targetPos) {
    this.userId = userId;
    this.pos = pos;
    this.color = color;
    
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
};

Bullet.prototype.detectPlayers = function () {
    for (let i in players) {
        if (this.pos.x >= players[i].pos.x - Player.radius && this.pos.x <= players[i].pos.x + Player.radius
        && this.pos.y >= players[i].pos.y - Player.radius && this.pos.y <= players[i].pos.y + Player.radius) {
            socket.emit('kill', i);
        }
    }
};

Bullet.prototype.draw = function () {
    ctx.fillStyle = this.color;
    utils.drawCircle(this.pos, this.radius);
};
