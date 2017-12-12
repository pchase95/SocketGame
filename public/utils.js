const utils = {
    setMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mousePos =  {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    },
    
    sanitizeUserName(str) {
        const pattern = new RegExp('^\s*([0-9a-zA-Z]+)\s*$');
        return pattern.test(str);
    },
    
    sanitizeMessage(str) {
        const pattern = new RegExp('^\s*([0-9a-zA-Z_ ]+)\s*$');
        return pattern.test(str);
    },

    drawCircle(pos, radius) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    },

    drawLine(start, end) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    },

    pointDistance(start, end) {
        return Math.sqrt( Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2) );
    },

    pointAdd(p1, p2) {
        return {
            x: p1.x + p2.x,
            y: p1.y + p2.y
        };
    },

    pointSub(p1, p2) {
        return {
            x: p1.x - p2.x,
            y: p1.y - p2.y
        };
    },

    pointMult(p1, p2) {
        return {
            x: p1.x * p2.x,
            y: p1.y * p2.y
        };
    },

    pointDiv(p1, p2) {
        return {
            x: p1.x / p2.x,
            y: p1.y / p2.y
        };
    },

    toDegrees(angle) {
        return angle * (180 / Math.PI);
    },

    toRadians(angle) {
        return angle / (180 / Math.PI);
    }
    
};
