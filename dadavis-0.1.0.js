var dadavis = {
    version: "0.1.0"
};

dadavis.init = function(_config) {
    var config = {
        containerSelector: ".container",
        width: 500,
        height: 500,
        margin: {
            top: 20,
            right: 20,
            bottom: 50,
            left: 50
        },
        type: "bar",
        subtype: "stacked",
        labelFormatterX: null,
        axisXAngle: null,
        tickSize: 10,
        tickYCount: 5,
        axisXTickSkip: null,
        dotSize: 2
    };
    var cache = {
        chartWidth: 500,
        chartHeight: 500,
        data: null,
        layout: null,
        scaleX: null,
        scaleY: null,
        previousData: null,
        container: null,
        noPadding: false
    };
    dadavis.utils.override(_config, config);
    cache.container = d3.select(config.containerSelector);
    cache.container.html(dadavis.template.main);
    exports = {};
    exports.setConfig = function(newConfig) {
        dadavis.utils.override(newConfig, config);
        return this;
    };
    exports.render = function(data) {
        if (data) {
            cache.previousData = data;
            cache.data = data;
        } else {
            cache.data = cache.previousData;
        }
        this.setConfig({
            width: cache.container.node().offsetWidth,
            height: cache.container.node().offsetHeight
        });
        cache.chartWidth = config.width - config.margin.left - config.margin.right;
        cache.chartHeight = config.height - config.margin.top - config.margin.bottom;
        if (config.type === "line") {
            cache.noPadding = true;
        }
        cache.scaleX = d3.scale.linear().range([ 0, cache.chartWidth ]);
        cache.scaleY = d3.scale.linear().range([ 0, cache.chartHeight ]);
        cache.layout = dadavis.getLayout.data.call(this, config, cache);
        cache.axesLayout = dadavis.getLayout.axes.call(this, config, cache);
        dadavis.render.chart(config, cache);
        return this;
    };
    return exports;
};

dadavis.utils = {};

dadavis.utils.override = function(_objA, _objB) {
    for (var x in _objA) {
        if (x in _objB) {
            _objB[x] = _objA[x];
        }
    }
};

dadavis.utils.computeRandomNumericArray = function(count, min, max) {
    return d3.range(count || 0).map(function(d, i) {
        return ~~(Math.random() * (max - min) + min);
    });
};

dadavis.utils.computeRandomTimeArray = function(count, min, max) {
    return d3.range(count || 0).map(function(d, i) {
        return ~~(Math.random() * (max - min) + min);
    });
};

dadavis.utils.getRandomNumericData = function(maxShapeCount, maxLayerCount) {
    var shapeCount = ~~(Math.random() * (maxShapeCount || 10)) + 2;
    var layerCount = ~~(Math.random() * (maxLayerCount || 5)) + 2;
    return d3.range(layerCount).map(function(d, i) {
        return {
            name: "name" + i,
            values: dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100)
        };
    });
};

dadavis.utils.getRandomTimeData = function(maxShapeCount, maxLayerCount) {
    var shapeCount = ~~(Math.random() * (maxShapeCount || 10)) + 2;
    var layerCount = ~~(Math.random() * (maxLayerCount || 5)) + 2;
    return d3.range(layerCount).map(function(d, i) {
        return {
            name: "name" + i,
            values: dadavis.utils.computeRandomTimeArray(shapeCount, 10, 100)
        };
    });
};

dadavis.template = {};

dadavis.template.main = "" + '<svg class="chart">' + '<g class="panel"></g>' + "</svg>" + '<div class="axis-x"></div>' + '<div class="axis-y"></div>';

dadavis.getLayout = {
    data: {},
    axes: {}
};

dadavis.getLayout.data = function(config, cache) {
    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();
    var paddedScaleX = cache.scaleX.copy();
    return cache.data.map(function(d, i) {
        var val = d.values;
        paddedScaleX.domain([ 0, val.length ]);
        cache.scaleX.domain([ 0, val.length - 1 ]);
        cache.scaleY.domain([ 0, d3.max(val) ]);
        var transposed = d3.transpose(cache.data.map(function(d, i) {
            return d.values;
        }));
        var previous = null;
        return val.map(function(dB, iB) {
            percentScaleY.domain([ 0, d3.sum(transposed[iB]) ]);
            stackedScaleY.domain([ 0, d3.max(transposed.map(function(d, i) {
                return d3.sum(d);
            })) ]);
            var datum = {
                value: dB,
                index: iB,
                parentData: d,
                paddedX: paddedScaleX(iB),
                x: cache.scaleX(iB),
                y: cache.chartHeight - cache.scaleY(dB),
                stackedPercentY: cache.chartHeight - percentScaleY(d3.sum(transposed[iB].slice(0, i + 1))),
                stackedY: cache.chartHeight - stackedScaleY(d3.sum(transposed[iB].slice(0, i + 1))),
                paddedW: paddedScaleX(1),
                w: cache.scaleX(1),
                h: cache.scaleY(dB),
                stackedPercentH: percentScaleY(dB),
                stackedH: stackedScaleY(dB),
                layerCount: cache.data.length,
                layerIndex: i,
                key: d.keys[i]
            };
            datum.previous = previous || datum;
            previous = datum;
            return datum;
        });
    });
};

dadavis.getLayout.axes = function(config, cache) {
    var axisStackedScaleY = cache.scaleY.copy();
    var stackedDomainMax = d3.max(cache.data.map(function(d, i) {
        return d3.sum(d.values);
    }));
    axisStackedScaleY.domain([ stackedDomainMax, 0 ]);
    var axisScaleY = cache.scaleY.copy();
    var domainMax = d3.max(cache.data.map(function(d, i) {
        return d3.max(d.values);
    }));
    axisScaleY.domain([ domainMax, 0 ]);
    return d3.range(config.tickYCount).map(function(d, i) {
        return {
            label: i * domainMax / (config.tickYCount - 1),
            stackedLabel: i * stackedDomainMax / (config.tickYCount - 1),
            labelY: axisScaleY(i * domainMax / (config.tickYCount - 1))
        };
    });
};

dadavis.getAttr = {
    bar: {},
    line: {},
    point: {},
    axis: {}
};

dadavis.getAttr.bar.simple = function(config, cache) {
    return {
        x: function(d, i) {
            return d.paddedX;
        },
        y: function(d, i) {
            return d.y;
        },
        width: function(d, i) {
            return d.paddedW;
        },
        height: function(d, i) {
            return d.h;
        }
    };
};

dadavis.getAttr.bar.grouped = function(config, cache) {
    return {
        x: function(d, i, j) {
            return d.paddedX + j * (d.paddedW / d.layerCount - d.w * .04);
        },
        y: function(d, i) {
            return d.y;
        },
        width: function(d, i) {
            return d.paddedW / d.layerCount - d.paddedW * .04;
        },
        height: function(d, i) {
            return d.h;
        }
    };
};

dadavis.getAttr.bar.percent = function(config, cache) {
    return {
        x: function(d, i) {
            return d.paddedX;
        },
        y: function(d, i) {
            return d.stackedPercentY;
        },
        width: function(d, i) {
            return d.paddedW;
        },
        height: function(d, i) {
            return d.stackedPercentH;
        }
    };
};

dadavis.getAttr.bar.stacked = function(config, cache) {
    return {
        x: function(d, i) {
            return d.paddedX;
        },
        y: function(d, i) {
            return d.stackedY;
        },
        width: function(d, i) {
            return d.paddedW;
        },
        height: function(d, i) {
            return d.stackedH;
        }
    };
};

dadavis.getAttr.point.stacked = function(config, cache) {
    return {
        cx: function(d, i) {
            if (cache.noPadding) {
                return d.x;
            } else {
                return d.paddedX + d.paddedW / 2;
            }
        },
        cy: function(d, i) {
            return d.stackedY;
        }
    };
};

dadavis.getAttr.line.stacked = function(config, cache) {
    return {
        d: function(d, i) {
            if (cache.noPadding) {
                return "M" + [ [ d.previous.x, d.previous.stackedY ], [ d.x, d.stackedY ] ].join("L");
            } else {
                return "M" + [ [ d.previous.paddedX + d.paddedW / 2, d.previous.stackedY ], [ d.paddedX + d.paddedW / 2, d.stackedY ] ].join("L");
            }
        }
    };
};

dadavis.getAttr.axis.labelX = function(config, cache) {
    var labelAttr = {};
    if (config.axisXAngle < 0) {
        labelAttr = {
            left: function(d, i) {
                if (cache.noPadding) {
                    return d.index * d.w - this.offsetWidth + "px";
                } else {
                    return d.index * d.paddedW + d.paddedW / 2 - this.offsetWidth + "px";
                }
            },
            top: config.tickSize + "px",
            "transform-origin": "100%",
            transform: "rotate(" + config.axisXAngle + "deg)"
        };
    } else if (config.axisXAngle > 0) {
        labelAttr = {
            left: function(d, i) {
                if (cache.noPadding) {
                    return d.index * d.w + "px";
                } else {
                    return d.index * d.paddedW + d.paddedW / 2 + "px";
                }
            },
            top: config.tickSize + "px",
            "transform-origin": "0%",
            transform: "rotate(" + config.axisXAngle + "deg)"
        };
    } else {
        labelAttr = {
            left: function(d, i) {
                if (cache.noPadding) {
                    return d.index * d.w - this.offsetWidth / 2 + "px";
                } else {
                    return d.index * d.paddedW + d.paddedW / 2 - this.offsetWidth / 2 + "px";
                }
                return d.index * d.w + d.w / 2 - this.offsetWidth / 2 + "px";
            },
            top: config.tickSize + "px"
        };
    }
    return labelAttr;
};

dadavis.getAttr.axis.tickX = function(config, cache) {
    return {
        left: function(d, i) {
            if (cache.noPadding) {
                return d.index * d.w - this.offsetWidth + "px";
            } else {
                return d.index * d.paddedW + d.paddedW / 2 - this.offsetWidth + "px";
            }
        },
        width: 1 + "px",
        height: function(d, i) {
            return (i % config.axisXTickSkip ? config.tickSize / 3 : config.tickSize) + "px";
        }
    };
};

dadavis.getAttr.axis.labelY = function(config, cache) {
    return {
        position: "absolute",
        left: 0 + "px",
        top: function(d, i) {
            var labelH = 10;
            return d.labelY - labelH / 2 + "px";
        }
    };
};

dadavis.getAttr.axis.tickY = function(config, cache) {
    return {
        width: config.tickSize + "px",
        height: 1 + "px",
        position: "absolute",
        left: config.margin.left - config.tickSize + "px",
        top: function(d, i) {
            return d.labelY + "px";
        }
    };
};

dadavis.render = {};

dadavis.render.chart = function(config, cache) {
    var chart = cache.container.style({
        position: "absolute"
    }).select(".chart").attr({
        width: config.width,
        height: config.height
    });
    var panelAttr = {
        transform: "translate(" + [ config.margin.left, config.margin.top ] + ")",
        height: config.chartHeight,
        width: config.chartWidth
    };
    var panel = chart.select(".panel").attr(panelAttr);
    var layers = panel.selectAll(".layer").data(cache.layout);
    layers.enter().append("g").classed("layer", true);
    layers.exit().remove();
    layers.call(function() {
        dadavis.render[config.type].call(this, config, cache);
    });
    cache.container.select(".axis-x").call(function() {
        dadavis.render.axisX.call(this, config, cache);
    });
    cache.container.select(".axis-y").call(function() {
        dadavis.render.axisY.call(this, config, cache);
    });
};

dadavis.render.bar = function(config, cache) {
    var shapes = this.selectAll(".shape").data(function(d, i) {
        return d;
    });
    shapes.enter().append("rect").attr({
        "class": function(d, i) {
            return "shape layer" + d.layerIndex + " index" + d.index;
        }
    }).attr(dadavis.getAttr[config.type][config.subtype](config, cache)).style({
        opacity: 0
    });
    shapes.transition().attr(dadavis.getAttr[config.type][config.subtype](config, cache)).style({
        opacity: 1
    });
    shapes.exit().remove();
};

dadavis.render.line = function(config, cache) {
    var lines = this.selectAll(".line").data(function(d, i) {
        return d;
    });
    lines.enter().append("path").classed("line", true).attr(dadavis.getAttr[config.type][config.subtype](config, cache)).style({
        opacity: 0
    });
    lines.transition().attr(dadavis.getAttr[config.type][config.subtype](config, cache)).style({
        opacity: 1
    });
    lines.exit().remove();
    var shapes = this.selectAll(".shape").data(function(d, i) {
        return d;
    });
    shapes.enter().append("circle").classed("shape", true).attr(dadavis.getAttr["point"][config.subtype](config, cache)).attr({
        r: config.dotSize
    }).style({
        opacity: 0
    });
    shapes.transition().attr(dadavis.getAttr["point"][config.subtype](config, cache)).style({
        opacity: 1
    });
    shapes.exit().remove();
};

dadavis.render.axisX = function(config, cache) {
    this.style({
        width: cache.chartWidth + "px",
        height: config.margin.bottom + "px",
        position: "absolute",
        top: cache.chartHeight + config.margin.top + "px",
        left: config.margin.left + "px"
    });
    var labelsX = this.selectAll("div.label").data(cache.layout[0]);
    labelsX.enter().append("div").classed("label", true).style({
        position: "absolute"
    });
    labelsX.html(function(d, i) {
        if (config.labelFormatterX) {
            return config.labelFormatterX(d.parentData.keys[i], i);
        } else {
            return d.parentData.keys[i];
        }
    }).style(dadavis.getAttr.axis.labelX(config, cache)).style({
        display: function(d, i) {
            return i % config.axisXTickSkip ? "none" : "block";
        }
    });
    labelsX.exit().remove();
    var ticksX = this.selectAll("div.tick").data(cache.layout[0]);
    ticksX.enter().append("div").classed("tick", true).style({
        position: "absolute"
    });
    ticksX.style(dadavis.getAttr.axis.tickX(config, cache));
    ticksX.exit().remove();
};

dadavis.render.axisY = function(config, cache) {
    this.style({
        width: config.margin.left + "px",
        height: cache.chartHeight + "px",
        position: "absolute",
        top: config.margin.top + "px",
        left: 0 + "px"
    });
    var labelsY = this.selectAll("div.label").data(cache.axesLayout);
    labelsY.enter().append("div").classed("label", true);
    labelsY.html(function(d, i) {
        if (config.subtype === "stacked") {
            return d.stackedLabel;
        } else {
            return d.label;
        }
    }).style(dadavis.getAttr.axis.labelY(config, cache));
    labelsY.exit().remove();
    var ticksY = this.selectAll("div.tick").data(cache.axesLayout);
    ticksY.enter().append("div").classed("tick", true);
    ticksY.style(dadavis.getAttr.axis.tickY(config, cache));
    ticksY.exit().remove();
};