dadavis.getAttr = {
    bar: {},
    line: {},
    point: {}
};

dadavis.getAttr.bar.simple = function(dParent, iParent){
    return {
        x: function(d, i){ return d.x; },
        y: function(d, i){ return d.y; },
        width: function(d, i){ return d.w; },
        height: function(d, i){ return d.h; }
    };
};

dadavis.getAttr.bar.grouped = function(dParent, iParent){
    return {
        x: function(d, i, j){ return d.x + j * (d.w / d.layerCount - d.w * 0.04); },
        y: function(d, i){ return d.y; },
        width: function(d, i){ return d.w / d.layerCount - d.w * 0.04; },
        height: function(d, i){ return d.h; }
    };
};

dadavis.getAttr.bar.percent = function(dParent, iParent){
    return {
        x: function(d, i){ return d.x; },
        y: function(d, i){ return d.stackedPercentY; },
        width: function(d, i){ return d.w; },
        height: function(d, i){ return d.stackedPercentH; }
    };
};

dadavis.getAttr.bar.stacked = function(dParent, iParent){
    return {
        x: function(d, i){ return d.x; },
        y: function(d, i){ return d.stackedY; },
        width: function(d, i){ return d.w; },
        height: function(d, i){ return d.stackedH; }
    };
};

dadavis.getAttr.point.stacked = function(dParent, iParent){
    return {
        cx: function(d, i){ return d.x + d.w / 2; },
        cy: function(d, i){ return d.stackedY; }
    };
};

dadavis.getAttr.line.stacked = function(dParent, iParent){
    return {
        d: function(d, i){
            return 'M' + [
                [d.previous.x + d.w / 2, d.previous.stackedY],
                [d.x + d.w / 2, d.stackedY]
            ].join('L');
        }
    };
};
