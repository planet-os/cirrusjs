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
        subtype: "stacked"
    };
    var cache = {
        chartWidth: 500,
        chartHeight: 500,
        data: null,
        layout: null,
        scaleX: null,
        scaleY: null,
        previousData: null,
        container: null
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
        cache.scaleX = d3.scale.linear().range([ 0, cache.chartWidth ]);
        cache.scaleY = d3.scale.linear().range([ 0, cache.chartHeight ]);
        cache.layout = dadavis.getLayout.call(this, config, cache);
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

dadavis.utils.computeRandomArray = function(count, min, max) {
    return d3.range(count || 0).map(function(d, i) {
        return ~~(Math.random() * (max - min) + min);
    });
};

dadavis.utils.getRandomData = function(maxShapeCount, maxLayerCount) {
    var shapeCount = ~~(Math.random() * (maxShapeCount || 10)) + 2;
    var layerCount = ~~(Math.random() * (maxLayerCount || 5)) + 2;
    return d3.range(layerCount).map(function(d, i) {
        return {
            name: "name" + i,
            values: dadavis.utils.computeRandomArray(shapeCount, 10, 100)
        };
    });
};

dadavis.template = {};

dadavis.template.main = "" + '<svg class="chart">' + '<g class="panel"></g>' + '<g class="axes">' + '<g class="axis-x"></g>' + '<g class="axis-y"></g>' + "</g>" + "</svg>";

dadavis.getLayout = function(config, cache) {
    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();
    return cache.data.map(function(d, i) {
        var val = d.values;
        cache.scaleX.domain([ 0, val.length ]);
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
                x: cache.scaleX(iB),
                y: cache.chartHeight - cache.scaleY(dB),
                stackedPercentY: cache.chartHeight - percentScaleY(d3.sum(transposed[iB].slice(0, i + 1))),
                stackedY: cache.chartHeight - stackedScaleY(d3.sum(transposed[iB].slice(0, i + 1))),
                w: cache.scaleX(1),
                h: cache.scaleY(dB),
                stackedPercentH: percentScaleY(dB),
                stackedH: stackedScaleY(dB),
                layerCount: cache.data.length,
                layerIndex: i
            };
            datum.previous = previous || datum;
            previous = datum;
            return datum;
        });
    });
};

dadavis.getAttr = {
    bar: {},
    line: {},
    point: {}
};

dadavis.getAttr.bar.simple = function(dParent, iParent) {
    return {
        x: function(d, i) {
            return d.x;
        },
        y: function(d, i) {
            return d.y;
        },
        width: function(d, i) {
            return d.w;
        },
        height: function(d, i) {
            return d.h;
        }
    };
};

dadavis.getAttr.bar.grouped = function(dParent, iParent) {
    return {
        x: function(d, i, j) {
            return d.x + j * (d.w / d.layerCount - d.w * .04);
        },
        y: function(d, i) {
            return d.y;
        },
        width: function(d, i) {
            return d.w / d.layerCount - d.w * .04;
        },
        height: function(d, i) {
            return d.h;
        }
    };
};

dadavis.getAttr.bar.percent = function(dParent, iParent) {
    return {
        x: function(d, i) {
            return d.x;
        },
        y: function(d, i) {
            return d.stackedPercentY;
        },
        width: function(d, i) {
            return d.w;
        },
        height: function(d, i) {
            return d.stackedPercentH;
        }
    };
};

dadavis.getAttr.bar.stacked = function(dParent, iParent) {
    return {
        x: function(d, i) {
            return d.x;
        },
        y: function(d, i) {
            return d.stackedY;
        },
        width: function(d, i) {
            return d.w;
        },
        height: function(d, i) {
            return d.stackedH;
        }
    };
};

dadavis.getAttr.point.stacked = function(dParent, iParent) {
    return {
        cx: function(d, i) {
            return d.x + d.w / 2;
        },
        cy: function(d, i) {
            return d.stackedY;
        }
    };
};

dadavis.getAttr.line.stacked = function(dParent, iParent) {
    return {
        d: function(d, i) {
            return "M" + [ [ d.previous.x + d.w / 2, d.previous.stackedY ], [ d.x + d.w / 2, d.stackedY ] ].join("L");
        }
    };
};

dadavis.render = {};

dadavis.render.chart = function(config, cache) {
    var chart = d3.select(".container .chart").attr({
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
    chart.select(".axes").call(function() {
        dadavis.render.axes.call(this, config, cache);
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
    }).attr(dadavis.getAttr[config.type][config.subtype]()).style({
        opacity: 0
    });
    shapes.transition().attr(dadavis.getAttr[config.type][config.subtype]()).style({
        opacity: 1
    });
    shapes.exit().remove();
};

dadavis.render.line = function(config, cache) {
    var dotSize = 2;
    var lines = this.selectAll(".line").data(function(d, i) {
        return d;
    });
    lines.enter().append("path").classed("line", true).attr(dadavis.getAttr[config.type][config.subtype]()).style({
        opacity: 0
    });
    lines.transition().attr(dadavis.getAttr[config.type][config.subtype]()).style({
        opacity: 1
    });
    lines.exit().remove();
    var shapes = this.selectAll(".shape").data(function(d, i) {
        return d;
    });
    shapes.enter().append("circle").classed("shape", true).attr(dadavis.getAttr["point"][config.subtype]()).attr({
        r: dotSize
    }).style({
        opacity: 0
    });
    shapes.transition().attr(dadavis.getAttr["point"][config.subtype]()).style({
        opacity: 1
    });
    shapes.exit().remove();
};

dadavis.render.axes = function(config, cache) {
    var tickSize = 10;
    var tickCountY = 5;
    var axisX = cache.container.style({
        position: "absolute"
    }).selectAll("div.axis-x").data([ 0 ]);
    axisX.enter().append("div").classed("axis-x", true).style({
        width: cache.chartWidth + "px",
        height: config.margin.bottom + "px",
        position: "absolute",
        top: cache.chartHeight + config.margin.top + "px",
        left: config.margin.left + "px"
    });
    var labelsX = axisX.selectAll("div.label").data(cache.layout[0]);
    labelsX.enter().append("div").classed("label", true);
    labelsX.html(function(d, i) {
        return i;
    }).style({
        position: "absolute",
        left: function(d, i) {
            return d.index * d.w + d.w / 2 - this.offsetWidth / 2 + "px";
        },
        top: tickSize + "px"
    });
    labelsX.exit().remove();
    var ticksX = axisX.selectAll("div.tick").data(cache.layout[0]);
    ticksX.enter().append("div").classed("tick", true);
    ticksX.style({
        position: "absolute",
        left: function(d, i) {
            return d.index * d.w + d.w / 2 + "px";
        },
        width: 1 + "px",
        height: tickSize + "px"
    });
    ticksX.exit().remove();
    var axisY = cache.container.selectAll("div.axis-y").data([ 0 ]);
    axisY.enter().append("div").classed("axis-y", true).style({
        width: config.margin.left + "px",
        height: cache.chartHeight + "px",
        position: "absolute",
        top: config.margin.top + "px",
        left: 0 + "px"
    });
    axisY.exit().remove();
    var axisScaleY = cache.scaleY.copy();
    var domainMax = d3.max(cache.data.map(function(d, i) {
        return d3.max(d.values);
    }));
    axisScaleY.domain([ domainMax, 0 ]);
    var labelsY = axisY.selectAll("div.label").data(d3.range(tickCountY));
    labelsY.enter().append("div").classed("label", true);
    labelsY.html(function(d, i) {
        return i * domainMax / 4;
    }).style({
        position: "absolute",
        left: 0 + "px",
        top: function(d, i) {
            return axisScaleY(i * domainMax / 4) - this.offsetHeight / 2 + "px";
        }
    });
    labelsY.exit().remove();
    var ticksY = axisY.selectAll("div.tick").data(d3.range(tickCountY));
    ticksY.enter().append("div").classed("tick", true);
    ticksY.style({
        width: tickSize + "px",
        height: 1 + "px",
        position: "absolute",
        left: config.margin.left - tickSize + "px",
        top: function(d, i) {
            return axisScaleY(i * domainMax / 4) + "px";
        }
    });
    ticksY.exit().remove();
};