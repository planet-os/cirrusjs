cirrus.attribute = {
    axis: {}
};

cirrus.attribute.axis.labelX = function(config){
    var labelAttr = {};
    if(config.axisXAngle < 0){
        labelAttr = {
            left: function(d, i){
                return d.x - this.offsetWidth + 'px';
            },
            'transform-origin': '100%',
            transform: 'rotate(' + config.axisXAngle + 'deg)'
        };
    }
    else if(config.axisXAngle > 0){
        labelAttr = {
            left: function(d, i){
                return d.x + 'px';
            },
            'transform-origin': '0%',
            transform: 'rotate(' + config.axisXAngle + 'deg)'
        };
    }
    else{
        labelAttr = {
            left: function(d, i){
                return d.x - this.offsetWidth / 2 + 'px';
            }
        }
    }

    labelAttr.display = function(d, i){
        return (i % config.axisXTickSkip) ? 'none' : 'block';
    };
    labelAttr.top = config.tickSize + 'px';
    return labelAttr;
};

cirrus.attribute.axis.tickX = function(config){
    var tickW = 1;
    return {
        left: function(d, i){
            return d.x - tickW / 2+ 'px';
        },
        width: tickW + 'px',
        height: function(d, i){
            return ((i % config.axisXTickSkip) ? config.minorTickSize : config.tickSize) + 'px';
        }
    };
};

cirrus.attribute.axis.gridX = function(config){
    var lineW = 1;
    return {
        top: config.margin.top + 'px',
        left: function(d, i){
            return config.margin.left + d.x - lineW / 2 - this.offsetWidth + 'px';
        },
        width: lineW + 'px',
        height: function(d, i){
            return ((i % config.axisXTickSkip) ? 0 : config.chartHeight) + 'px';
        }
    };
};

cirrus.attribute.axis.fringeX = function(config){
    var fringeColorScale = d3.scale.linear().domain([0, 1]).range(['yellow', 'limegreen']);
    return {
        left: function(d, i){
            return d.x - d.w / 2 + 'px';
        },
        width: function(d){
            return Math.max(d.w, 1) + 'px';
        },
        height: function(d, i){
            return config.fringeSize + 'px';
        },
        'background-color': function(d){
            return fringeColorScale(d.normalizedValue);
        }
    };
};

cirrus.attribute.axis.labelY = function(config){
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

cirrus.attribute.axis.tickY = function(config){
    var lineH = 1;
    return {
        width: config.tickSize + 'px',
        height: lineH + 'px',
        position: 'absolute',
        left: config.margin.left - config.tickSize + 'px',
        top: function(d, i){
            return d.labelY + 'px';
        }
    };
};

cirrus.attribute.axis.gridY = function(config){
    var lineH = 1;
    return {
        width: config.chartWidth + 'px',
        height: lineH + 'px',
        position: 'absolute',
        left: config.margin.left + 'px',
        top: function(d, i){
            return config.margin.top + d.labelY + 'px';
        }
    };
};

cirrus.attribute.axis.fringeY = function(config){
    var fringeColorScale = d3.scale.linear().domain([0, 1]).range(['yellow', 'limegreen']);
    var h = 3;
    return {
        position: 'absolute',
        left: config.margin.left - config.fringeSize + 'px',
        top: function(d, i){
            return d.y - h / 2 + 'px';
        },
        width: function(d){
            return config.fringeSize + 'px';
        },
        height: function(d, i){
            return h + 'px';
        },
        'background-color': function(d){
            return fringeColorScale(d.normalizedValue);
        }
    };
};
