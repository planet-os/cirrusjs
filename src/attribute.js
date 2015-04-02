dadavis.getAttr = {
    bar: {},
    line: {},
    point: {},
    axis: {}
};

dadavis.getAttr.bar.simple = function(config, cache){
    return {
        x: function(d, i){ return d.paddedX; },
        y: function(d, i){ return d.y; },
        width: function(d, i){ return d.paddedW; },
        height: function(d, i){ return d.h; }
    };
};

dadavis.getAttr.bar.grouped = function(config, cache){
    return {
        x: function(d, i, j){ return d.paddedX + j * (d.paddedW / d.layerCount - d.w * 0.04); },
        y: function(d, i){ return d.y; },
        width: function(d, i){ return d.paddedW / d.layerCount - d.paddedW * 0.04; },
        height: function(d, i){ return d.h; }
    };
};

dadavis.getAttr.bar.percent = function(config, cache){
    return {
        x: function(d, i){ return d.paddedX; },
        y: function(d, i){ return d.stackedPercentY; },
        width: function(d, i){ return d.paddedW; },
        height: function(d, i){ return d.stackedPercentH; }
    };
};

dadavis.getAttr.bar.stacked = function(config, cache){
    return {
        x: function(d, i){ return d.paddedX; },
        y: function(d, i){ return d.stackedY; },
        width: function(d, i){ return d.paddedW; },
        height: function(d, i){ return d.stackedH; }
    };
};

dadavis.getAttr.point.stacked = function(config, cache){
    return {
        cx: function(d, i){
            if(cache.noPadding){
                return d.x;
            }
            else{
                return d.paddedX + d.paddedW / 2
            }
        },
        // cx: function(d, i){ return d.x + d.w / 2; },
        cy: function(d, i){ return d.stackedY; }
    };
};

dadavis.getAttr.line.stacked = function(config, cache){
    return {
        d: function(d, i){
            if(cache.noPadding){
                return 'M' + [
                    [d.previous.x, d.previous.stackedY],
                    [d.x, d.stackedY]
                ].join('L');
            }
            else{
                return 'M' + [
                    [d.previous.paddedX + d.paddedW / 2, d.previous.stackedY],
                    [d.paddedX + d.paddedW / 2, d.stackedY]
                ].join('L');
            }
        }
    };
};

dadavis.getAttr.axis.labelX = function(config, cache){
    var labelAttr = {};
    if(config.axisXAngle < 0){
        labelAttr = {
            left: function(d, i){
                if(cache.noPadding){
                    return d.index * d.w - this.offsetWidth + 'px';
                }
                else{
                    return d.index * d.paddedW + d.paddedW / 2 - this.offsetWidth + 'px';
                }
            },
            top: config.tickSize + 'px',
            'transform-origin': '100%',
            transform: 'rotate(' + config.axisXAngle + 'deg)'
        };
    }
    else if(config.axisXAngle > 0){
        labelAttr = {
            left: function(d, i){
                if(cache.noPadding){
                    return d.index * d.w + 'px';
                }
                else{
                    return d.index * d.paddedW + d.paddedW / 2 + 'px';
                }
            },
            top: config.tickSize + 'px',
            'transform-origin': '0%',
            transform: 'rotate(' + config.axisXAngle + 'deg)'
        };
    }
    else{
        labelAttr = {
            left: function(d, i){
                if(cache.noPadding){
                    return d.index * d.w - this.offsetWidth / 2 + 'px';
                }
                else{
                    return d.index * d.paddedW + d.paddedW / 2 - this.offsetWidth / 2 + 'px';
                }
                return d.index * d.w + d.w / 2 - this.offsetWidth / 2 + 'px';
            },
            top: config.tickSize + 'px'
        }
    }
    return labelAttr;
};

dadavis.getAttr.axis.tickX = function(config, cache){
    return {
        left: function(d, i){
            if(cache.noPadding){
                return d.index * d.w - this.offsetWidth + 'px';
            }
            else{
                return d.index * d.paddedW + d.paddedW / 2 - this.offsetWidth + 'px';
            }
        },
        width: 1 + 'px',
        height: function(d, i){ return ((i % config.axisXTickSkip) ? config.minorTickSize : config.tickSize) + 'px'; }
    };
};

dadavis.getAttr.axis.labelY = function(config, cache){
    return {
        position: 'absolute',
        left: function(d, i){
            var labelW = this.offsetWidth;
            return config.margin.left - labelW - config.tickSize + 'px';
        },
        top: function(d, i){
            var labelH = this.offsetHeight;
            return d.labelY - labelH / 2 + 'px';
        }
    };
};

dadavis.getAttr.axis.tickY = function(config, cache){
    return {
        width: config.tickSize + 'px',
        height: 1 + 'px',
        position: 'absolute',
        left: config.margin.left - config.tickSize + 'px',
        top: function(d, i){
            return d.labelY + 'px';
        }
    };
};
