function Wall(wallSon) {
    this.pos = wallSon.pos;
    this.dims = wallSon.dims;
    this.color = wallSon.color;
}

Wall.prototype.update = function () {
    this.draw();
};

Wall.prototype.draw = function () {
    ctx.fillStyle = this.color;
    utils.drawRect(this.pos, this.dims);
};
