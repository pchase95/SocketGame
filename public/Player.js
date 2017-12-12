function Player(id, color, pos) {
    this.id = id;
    this.color = color;
    this.pos = pos;

    this.vel = 5;
    this.xvel = 0;
    this.yvel = 0;
    this.radius = 25;
    this.lineLengh = this.radius + 15;
    this.lineEnd = { x: 0.0, y: 0.0 };

    this.draw = () => {
        ctx.fillStyle = this.color;
        utils.drawCircle(this.pos, this.radius);

        ctx.fillStyle = 'black';

        const t = this.lineLengh / utils.pointDistance(this.pos, mousePos);
        this.lineEnd.x = ((1 - t) * this.pos.x + t * mousePos.x);
        this.lineEnd.y = ((1 - t) * this.pos.y + t * mousePos.y);
        
        utils.drawLine(this.pos, this.lineEnd);
    };

    // w -> 87
    // a -> 65
    // s -> 83
    // d -> 68
    // space -> 32
    this.setPos = (newPos) => {
        this.pos.x = newPos.x;
        this.pos.y = newPos.y;
    };

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
    };

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

    this.shoot = (e) => {
        // Object.assign so I can pass this.lineEnd by value rather than reference        
        bullets.push(new Bullet(
            this.id,
            Object.assign({}, this.lineEnd),
            Object.assign({}, this.pos),
            this.color));
    };
}


function Bullet(userId, pos, playerPos, color) {
    this.userId = userId;
    this.pos = pos;
    this.color = color;

    this.vel = 10;
    this.radius = 5;

    const opp = utils.pointDistance({
        x: pos.x,
        y: playerPos.y
    }, pos);
    const hyp = utils.pointDistance(playerPos, pos)
    const angle = Math.asin(opp / hyp);
    const quadrant = utils.pointSub(mousePos, this.pos);

    this.xvel = Math.sign(quadrant.x) * this.vel * Math.cos(angle);
    this.yvel = Math.sign(quadrant.y) * this.vel * Math.sin(angle);

    this.draw = () => {
        ctx.fillStyle = this.color;
        utils.drawCircle(this.pos, this.radius);
    };
}