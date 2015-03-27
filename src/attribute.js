dadaviz.getAttr = {
    bar: {},
    line: {},
    point: {}
};

dadaviz.getAttr.bar.simple = function(dParent, iParent){
    return {
        x: function(d, i){ return d.x; },
        y: function(d, i){ return d.y; },
        width: function(d, i){ return d.w; },
        height: function(d, i){ return d.h; }
    };
};

dadaviz.getAttr.bar.grouped = function(dParent, iParent){
    return {
        x: function(d, i, j){ return d.x + j * (d.w / d.layerCount - d.w * 0.02); },
        y: function(d, i){ return d.y; },
        width: function(d, i){ return d.w / d.layerCount - d.w * 0.02; },
        height: function(d, i){ return d.h; }
    };
};

dadaviz.getAttr.bar.percent = function(dParent, iParent){
    return {
        x: function(d, i){ return d.x; },
        y: function(d, i){ return d.stackedPercentY; },
        width: function(d, i){ return d.w; },
        height: function(d, i){ return d.stackedPercentH; }
    };
};

dadaviz.getAttr.bar.stacked = function(dParent, iParent){
    return {
        x: function(d, i){ return d.x; },
        y: function(d, i){ return d.stackedY; },
        width: function(d, i){ return d.w; },
        height: function(d, i){ return d.stackedH; }
    };
};

dadaviz.getAttr.point.stacked = function(dParent, iParent){
    return {
        cx: function(d, i){ return d.x + d.w / 2; },
        cy: function(d, i){ return d.stackedY; },
        r: function(d, i){ return 10; }
    };
};

dadaviz.getAttr.line.stacked = function(dParent, iParent){
    return {
        d: function(d, i){
            return 'M' + [
                [d.previous.x + d.w / 2, d.previous.stackedY],
                [d.x + d.w / 2, d.stackedY]
            ].join('L');
        }
    };
};
