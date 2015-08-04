cirrus.attribute = {
    bar: {},
    line: {},
    point: {},
    axis: {}
};

cirrus.attribute.bar.simple = function(config, _config){
    return _config.shapeLayout.map(function(d, i){
        return d.map(function(dB, iB){
            return {
                x: dB.centerX,
                y: dB.y,
                width: dB.w,
                height: dB.h,
                color: dB.color
            };
        });
    });
};

cirrus.attribute.bar.percent = function(config, _config){
    return _config.shapeLayout.map(function(d, i){
        return d.map(function(dB, iB){
            return {
                x: dB.centerX,
                y: dB.stackedPercentY,
                width: dB.w,
                height: dB.stackedPercentH,
                color: dB.color
            };
        });
    });
};

cirrus.attribute.bar.grid = function(config, _config){
    return _config.shapeLayout.map(function(d, i){
        return d.map(function(dB, iB){
            return {
                x: dB.centerX,
                y: dB.gridY,
                width: dB.w,
                height: dB.gridH,
                color: dB.color
            };
        });
    });
};

cirrus.attribute.bar.stacked = function(config, _config){
    return _config.shapeLayout.map(function(d, i){
        return d.map(function(dB, iB){
            return {
                x: dB.centerX,
                y: dB.stackedY,
                width: dB.w,
                height: dB.stackedH,
                color: dB.color
            };
        });
    });
};

cirrus.attribute.line.simple = function(config, _config){
    return _config.shapeLayout.map(function(d, i){
        return {
            points: d.map(function(dB, iB){
                return [dB.x, dB.y];
            }),
            color: d[0].color
        };
    });
};

cirrus.attribute.line.stacked = function(config, _config){
    return _config.shapeLayout.map(function(d, i){
        return {
            points: d.map(function(dB, iB){
                return [dB.x, dB.stackedY];
            }),
            color: d[0].color
        };
    });
};

cirrus.attribute.line.area = function(config, _config){
    return _config.shapeLayout.map(function(d, i){
        var line = d.map(function(dB, iB){
            return [dB.x, dB.stackedY];
        });

        var previousLine = null;
        if(i === 0){
            previousLine = d.map(function(dB, iB){
                return [dB.x, _config.chartHeight];
            }).reverse();
        }
        else{
            previousLine = _config.shapeLayout[i - 1].map(function(dB, iB){
                return [dB.x, dB.stackedY];
            }).reverse();
        }

        var points = line.concat(previousLine);

        return {
            points: points,
            color: d[0].color
        };
    });
};

cirrus.attribute.line.contour = function(config, _config){
    return _config.contourLayout.map(function(d, i){
        return {
            points: d.map(function(dB, iB){
                return [dB.x, dB.y];
            }),
            color: d[0].color
        };
    });
};

cirrus.attribute.axis.labelX = function(config, _config){
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

cirrus.attribute.axis.tickX = function(config, _config){
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

cirrus.attribute.axis.gridX = function(config, _config){
    var lineW = 1;
    return {
        top: config.margin.top + 'px',
        left: function(d, i){
            return config.margin.left + d.x - lineW / 2 - this.offsetWidth + 'px';
        },
        width: lineW + 'px',
        height: function(d, i){
            return ((i % config.axisXTickSkip) ? 0 : _config.chartHeight) + 'px';
        }
    };
};

cirrus.attribute.axis.fringeX = function(config, _config){
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

cirrus.attribute.axis.labelY = function(config, _config){
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

cirrus.attribute.axis.tickY = function(config, _config){
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

cirrus.attribute.axis.gridY = function(config, _config){
    var lineH = 1;
    return {
        width: _config.chartWidth + 'px',
        height: lineH + 'px',
        position: 'absolute',
        left: config.margin.left + 'px',
        top: function(d, i){
            return config.margin.top + d.labelY + 'px';
        }
    };
};

cirrus.attribute.axis.fringeY = function(config, _config){
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
