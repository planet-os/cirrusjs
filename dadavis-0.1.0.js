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
        minorTickSize: 3,
        tickYCount: 5,
        axisXTickSkip: "auto",
        dotSize: 2,
        gutterPercent: 10,
        colors: [ "skyblue", "orange", "lime", "orangered", "violet", "yellow", "brown", "pink" ],
        renderer: "svg"
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
        noPadding: false,
        events: d3.dispatch("hover", "hoverOut"),
        internalEvents: d3.dispatch("setHover", "hideHover", "resize")
    };
    (function initialize(config, cache) {
        dadavis.utils.override(_config, config);
        cache.container = d3.select(config.containerSelector);
        cache.container.html(dadavis.template.main);
        d3.select(window).on("resize.namespace" + ~~(Math.random() * 1e3), dadavis.utils.throttle(function() {
            cache.internalEvents.resize();
        }, 200));
    })(config, cache);
    function rebindEvents(config, cache) {
        var that = this;
        cache.internalEvents.on("resize", function() {
            that.resize();
        });
    }
    function computeAutomaticConfig(config, cache) {
        this.setConfig({
            width: cache.container.node().offsetWidth,
            height: cache.container.node().offsetHeight
        });
    }
    function computeCache(config, cache, data) {
        if (data) {
            cache.previousData = data;
            cache.data = data;
        } else {
            cache.data = cache.previousData;
        }
        cache.chartWidth = config.width - config.margin.left - config.margin.right;
        cache.chartHeight = config.height - config.margin.top - config.margin.bottom;
        if (config.type === "line") {
            cache.noPadding = true;
        }
    }
    exports = {};
    exports.setConfig = function(newConfig) {
        dadavis.utils.override(newConfig, config);
        return this;
    };
    exports.resize = function() {
        cache.container.html(dadavis.template.main);
        this.render();
        return this;
    };
    exports.downloadAsPNG = function(callback) {
        dadavis.utils.convertToImage(config, cache, callback);
        return this;
    };
    exports.setHovering = function(hoverData) {
        cache.internalEvents.setHover(hoverData);
        return this;
    };
    exports.hideHovering = function() {
        cache.internalEvents.hideHover();
        return this;
    };
    exports.render = function(data) {
        rebindEvents.call(this, config, cache);
        computeAutomaticConfig.call(this, config, cache);
        computeCache.call(this, config, cache, data);
        cache.scaleX = dadavis.scale.x(config, cache);
        cache.scaleY = dadavis.scale.y(config, cache);
        cache.layout = dadavis.layout.data(config, cache);
        cache.axesLayout = dadavis.layout.axes(config, cache);
        dadavis.component.chart(config, cache);
        dadavis.component.axisX(config, cache);
        dadavis.component.axisY(config, cache);
        dadavis.interaction.hovering(config, cache);
        return this;
    };
    d3.rebind(exports, cache.events, "on");
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

dadavis.utils.computeRandomTimeArray = function(count, dateNow) {
    var dayInMillis = 1e3 * 60 * 60 * 24;
    var dateNow = new Date().getTime() - count * dayInMillis;
    return d3.range(count || 0).map(function(d, i) {
        return dateNow + i * dayInMillis;
    });
};

dadavis.utils.getRandomNumericData = function(shapeCount, layerCount) {
    return d3.range(layerCount).map(function(d, i) {
        return {
            name: "name" + i,
            values: dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100)
        };
    });
};

dadavis.utils.getRandomTimeData = function(shapeCount, layerCount) {
    var dateNow = new Date().getTime();
    return d3.range(layerCount).map(function(d, i) {
        return {
            name: "name" + i,
            values: dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100),
            keys: dadavis.utils.computeRandomTimeArray(shapeCount, dateNow)
        };
    });
};

dadavis.utils.throttle = function(callback, limit) {
    var wait = false;
    var timer = null;
    return function() {
        if (!wait) {
            callback.apply(this, arguments);
            wait = true;
            clearTimeout(timer);
            timer = setTimeout(function() {
                wait = false;
                callback.apply(this, arguments);
            }, limit);
        }
    };
};

dadavis.utils.convertToImage = function(config, cache, callback) {
    var clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: false
    });
    var chartNode = cache.container.node();
    var xhtml = new XMLSerializer().serializeToString(chartNode);
    var size = {
        width: chartNode.offsetWidth,
        height: chartNode.offsetHeight,
        rootFontSize: 14
    };
    var XMLString = '<svg xmlns="http://www.w3.org/2000/svg"' + ' width="' + size.width + '"' + ' height="' + size.height + '"' + ' font-size="' + size.rootFontSize + '"' + ">" + "<foreignObject>" + xhtml + "</foreignObject>" + "</svg>";
    var canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        var png = canvas.toDataURL("image/png");
        if (!callback) {
            var result = '<a href="' + png + '" download="converted-image">Download</a>';
            var pngContainer = document.createElement("div");
            pngContainer.id = "#png-container";
            pngContainer.innerHTML = result;
            pngContainer.querySelector("a").dispatchEvent(clickEvent);
        } else {
            callback.call(this, png);
        }
    };
    img.src = "data:image/svg+xml;base64," + btoa(XMLString);
};

dadavis.template = {};

dadavis.template.main = '<div class="chart">' + '<div class="panel">' + '<div class="shape"></div>' + '<div class="hovering"></div>' + "</div>" + '<div class="axis-x"></div>' + '<div class="axis-y"></div>' + "</div>";

dadavis.layout = {
    data: {},
    axes: {}
};

dadavis.layout.data = function(config, cache) {
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
                key: d.keys ? d.keys[i] : i
            };
            datum.previous = previous || datum;
            previous = datum;
            return datum;
        });
    });
};

dadavis.layout.axes = function(config, cache) {
    var scaleY = cache.scaleY.copy();
    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();
    var transposed = d3.transpose(cache.data.map(function(d) {
        return d.values;
    }));
    var domainMax = d3.max(cache.data.map(function(d) {
        return d3.max(d.values);
    }));
    scaleY.domain([ domainMax, 0 ]);
    var stackedDomainMax = d3.max(transposed.map(function(d) {
        return d3.sum(d);
    }));
    stackedScaleY.domain([ stackedDomainMax, 0 ]);
    var percentDomainMax = d3.max(transposed.map(function(d) {
        return d3.sum(d);
    }));
    percentScaleY.domain([ percentDomainMax, 0 ]);
    return d3.range(config.tickYCount).map(function(d, i) {
        var value = i * domainMax / (config.tickYCount - 1);
        return {
            label: value,
            stackedLabel: i * stackedDomainMax / (config.tickYCount - 1),
            labelY: scaleY(value)
        };
    });
};

dadavis.attribute = {
    bar: {},
    line: {},
    point: {},
    axis: {}
};

dadavis.attribute.bar.simple = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return d.map(function(dB, iB) {
            var gutterW = dB.paddedW / 100 * config.gutterPercent;
            return {
                x: dB.paddedX,
                y: dB.y,
                width: dB.paddedW - gutterW,
                height: dB.h
            };
        });
    });
};

dadavis.attribute.bar.percent = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return d.map(function(dB, iB) {
            var gutterW = dB.paddedW / 100 * config.gutterPercent;
            return {
                x: dB.paddedX,
                y: dB.stackedPercentY,
                width: dB.paddedW - gutterW,
                height: dB.stackedPercentH
            };
        });
    });
};

dadavis.attribute.bar.stacked = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return d.map(function(dB, iB) {
            var gutterW = dB.paddedW / 100 * config.gutterPercent;
            return {
                x: dB.paddedX,
                y: dB.stackedY,
                width: dB.paddedW - gutterW,
                height: dB.stackedH
            };
        });
    });
};

dadavis.attribute.point.stacked = function(config, cache) {
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

dadavis.attribute.line.simple = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return d.map(function(dB, iB) {
            return [ dB.x, dB.y ];
        });
    });
};

dadavis.attribute.line.stacked = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return d.map(function(dB, iB) {
            return [ dB.x, dB.stackedY ];
        });
    });
};

dadavis.attribute.line.area = function(config, cache) {
    return cache.layout.map(function(d, i) {
        var line = d.map(function(dB, iB) {
            return [ dB.x, dB.stackedY ];
        });
        var previousLine = null;
        if (i === 0) {
            previousLine = d.map(function(dB, iB) {
                return [ dB.x, cache.chartHeight ];
            }).reverse();
        } else {
            previousLine = cache.layout[i - 1].map(function(dB, iB) {
                return [ dB.x, dB.stackedY ];
            }).reverse();
        }
        return line.concat(previousLine);
    });
};

dadavis.attribute.axis.labelX = function(config, cache) {
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
            }
        };
    }
    labelAttr.display = function(d, i) {
        return i % (cache.axisXTickSkipAuto || config.axisXTickSkip) ? "none" : "block";
    };
    labelAttr.top = config.tickSize + "px";
    return labelAttr;
};

dadavis.attribute.axis.tickX = function(config, cache) {
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
            return (i % (cache.axisXTickSkipAuto || config.axisXTickSkip) ? config.minorTickSize : config.tickSize) + "px";
        }
    };
};

dadavis.attribute.axis.labelY = function(config, cache) {
    return {
        position: "absolute",
        left: function(d, i) {
            var labelW = this.offsetWidth;
            return config.margin.left - labelW - config.tickSize + "px";
        },
        top: function(d, i) {
            var labelH = this.offsetHeight;
            return d.labelY - labelH / 2 + "px";
        }
    };
};

dadavis.attribute.axis.tickY = function(config, cache) {
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

dadavis.interaction = {};

dadavis.interaction.hovering = function(config, cache) {
    var hoveringContainer = cache.container.select(".hovering").style({
        width: cache.chartWidth + "px",
        height: cache.chartHeight + "px",
        position: "absolute",
        opacity: 0
    }).on("mousemove", function() {
        var mouse = d3.mouse(this);
        var x = cache.layout[0].map(function(d, i) {
            return config.type === "bar" ? d.paddedX : d.x;
        });
        var mouseOffset = config.type === "bar" ? cache.layout[0][0].paddedW : cache.layout[0][0].w / 2;
        var idxUnderMouse = d3.bisect(x, mouse[0] - mouseOffset);
        setHovering(idxUnderMouse);
        cache.events.hover({
            mouse: mouse,
            x: x,
            idx: idxUnderMouse
        });
    }).on("mouseenter", function() {
        hoveringContainer.style({
            opacity: 1
        });
    }).on("mouseout", function() {
        hoveringContainer.style({
            opacity: 0
        });
        cache.events.hoverOut();
    });
    var hoverLine = dadavis.interaction.hoverLine(config, cache);
    var tooltip = dadavis.interaction.tooltip(config, cache);
    cache.internalEvents.on("setHover", function(hoverData) {
        setHovering(hoverData.idx);
    });
    cache.internalEvents.on("hideHover", function() {
        hoveringContainer.style({
            opacity: 0
        });
    });
    var setHovering = function(idxUnderMouse) {
        var dataUnderMouse = cache.layout[0][idxUnderMouse];
        var tooltipsData = cache.layout.map(function(d, i) {
            return d[idxUnderMouse];
        });
        hoveringContainer.style({
            opacity: 1
        });
        hoverLine(dataUnderMouse);
        tooltip(tooltipsData);
    };
};

dadavis.interaction.tooltip = function(config, cache) {
    return function(tooltipsData) {
        var hoveringContainer = cache.container.select(".hovering");
        var tooltip = hoveringContainer.selectAll(".tooltip").data(tooltipsData);
        tooltip.enter().append("div").attr({
            "class": "tooltip"
        }).style({
            position: "absolute",
            "pointer-events": "none"
        });
        tooltip.html(function(d, i) {
            return d.value;
        }).style({
            left: function(d, i) {
                return (config.type === "bar" ? d.paddedX + d.paddedW / 2 : d.x) + "px";
            },
            top: function(d, i) {
                var y = d.stackedY;
                if (config.subtype === "simple") {
                    y = d.y;
                } else if (config.subtype === "percent") {
                    y = d.stackedPercentY;
                }
                return y + "px";
            },
            "background-color": function(d, i) {
                return config.colors[i];
            }
        });
        tooltip.exit().remove();
    };
};

dadavis.interaction.hoverLine = function(config, cache) {
    var hoverLine = cache.container.select(".hovering").append("div").attr({
        "class": "hover-line"
    }).style({
        position: "absolute",
        width: "1px",
        height: cache.chartHeight + "px",
        left: config.margin.left + "px",
        "pointer-events": "none"
    });
    return function(dataUnderMouse) {
        var hoverLineX = config.type === "bar" ? dataUnderMouse.paddedX + dataUnderMouse.paddedW / 2 : dataUnderMouse.x;
        hoverLine.style({
            left: hoverLineX + "px"
        });
    };
};

dadavis.scale = {};

dadavis.scale.x = function(config, cache) {
    return d3.scale.linear().range([ 0, cache.chartWidth ]);
};

dadavis.scale.y = function(config, cache) {
    return d3.scale.linear().range([ 0, cache.chartHeight ]);
};

dadavis.renderer = {
    svg: null,
    canvas: null
};

dadavis.renderer.svg = function(element) {
    var svgRenderer = {};
    var svg = d3.select(element).append("svg").attr({
        width: element.offsetWidth,
        height: element.offsetHeight
    }).style({
        position: "absolute"
    });
    svgRenderer.polygon = function(attributes) {
        svg.append("path").attr({
            d: "M" + attributes.points.join("L"),
            fill: attributes.fill || "silver",
            stroke: attributes.stroke || "silver"
        });
        return this;
    };
    svgRenderer.rect = function(attributes) {
        path = svg.append("rect").attr(attributes.rect).attr({
            fill: attributes.fill || "silver",
            stroke: attributes.stroke || "silver"
        });
        return this;
    };
    return svgRenderer;
};

dadavis.renderer.canvas = function(element) {
    var canvasRenderer = {};
    var canvas = d3.select(element).append("canvas").attr({
        width: element.offsetWidth,
        height: element.offsetHeight
    }).style({
        position: "absolute"
    });
    var path = null;
    var ctx = canvas.node().getContext("2d");
    canvasRenderer.polygon = function(attributes) {
        var fill = attributes.fill;
        if (attributes.fill === "none" || !attributes.fill) {
            fill = "transparent";
        }
        ctx.fillStyle = fill;
        ctx.strokeStyle = attributes.stroke;
        ctx.beginPath();
        attributes.points.forEach(function(d, i) {
            if (i === 0) {
                ctx.moveTo(d[0], d[1]);
            } else {
                ctx.lineTo(d[0], d[1]);
            }
        });
        ctx.fill();
        ctx.stroke();
        return this;
    };
    canvasRenderer.rect = function(attributes) {
        ctx.fillStyle = attributes.fill;
        ctx.strokeStyle = attributes.stroke;
        ctx.fillRect(attributes.rect.x, attributes.rect.y, attributes.rect.width, attributes.rect.height);
        return this;
    };
    return canvasRenderer;
};

dadavis.component = {};

dadavis.component.chart = function(config, cache) {
    var chartContainer = cache.container.select(".chart").style({
        position: "absolute",
        width: cache.chartWidth + "px",
        height: cache.chartHeight + "px"
    });
    var panelContainer = chartContainer.select(".panel").style({
        position: "absolute",
        left: config.margin.left + "px",
        top: config.margin.top + "px",
        width: cache.chartWidth + "px",
        height: cache.chartHeight + "px"
    });
    var shapeContainer = chartContainer.select(".shape").style({
        position: "absolute",
        width: cache.chartWidth + "px",
        height: cache.chartHeight + "px"
    });
    var shapeAttr = dadavis.attribute[config.type][config.subtype](config, cache);
    var renderer = dadavis.renderer[config.renderer](shapeContainer.node());
    console.time("rendering");
    if (config.type === "line") {
        shapeAttr.forEach(function(d, i) {
            var color = null;
            if (config.subtype === "area") {
                color = config.colors[i];
            } else {
                color = "none";
            }
            renderer.polygon({
                points: d,
                fill: color,
                stroke: config.colors[i]
            });
        });
    } else {
        shapeAttr.forEach(function(d, i) {
            d.forEach(function(dB, iB) {
                renderer.rect({
                    rect: dB,
                    fill: config.colors[i],
                    stroke: config.colors[i]
                });
            });
        });
    }
    console.timeEnd("rendering");
    return this;
};

dadavis.component.axisX = function(config, cache) {
    var axisXContainer = cache.container.select(".axis-x").style({
        width: cache.chartWidth + "px",
        height: config.margin.bottom + "px",
        position: "absolute",
        top: cache.chartHeight + config.margin.top + "px",
        left: config.margin.left + "px",
        "border-top": "1px solid black"
    });
    var labelsX = axisXContainer.selectAll("div.label").data(cache.layout[0]);
    labelsX.enter().append("div").classed("label", true).style({
        position: "absolute"
    });
    labelsX.html(function(d, i) {
        var key = d.parentData.keys ? d.parentData.keys[i] : i;
        if (config.labelFormatterX) {
            return config.labelFormatterX(key, i);
        } else {
            return key;
        }
    }).style(dadavis.attribute.axis.labelX(config, cache));
    if (config.axisXTickSkip === "auto") {
        var widestLabel = d3.max(labelsX[0].map(function(d) {
            return d.offsetWidth;
        }));
        cache.axisXTickSkipAuto = Math.ceil(cache.layout[0].length / ~~(cache.chartWidth / widestLabel));
    }
    labelsX.style(dadavis.attribute.axis.labelX(config, cache));
    labelsX.exit().remove();
    var ticksX = axisXContainer.selectAll("div.tick").data(cache.layout[0]);
    ticksX.enter().append("div").classed("tick", true).style({
        position: "absolute"
    }).style({
        "background-color": "black"
    });
    ticksX.style(dadavis.attribute.axis.tickX(config, cache));
    ticksX.exit().remove();
};

dadavis.component.axisY = function(config, cache) {
    var axisYContainer = cache.container.select(".axis-y").style({
        width: config.margin.left + "px",
        height: cache.chartHeight + "px",
        position: "absolute",
        top: config.margin.top + "px",
        left: 0 + "px",
        "border-right": "1px solid black"
    });
    var labelsY = axisYContainer.selectAll("div.label").data(cache.axesLayout);
    labelsY.enter().append("div").classed("label", true);
    labelsY.html(function(d, i) {
        if (config.subtype === "simple") {
            return d.label;
        } else {
            return d.stackedLabel;
        }
    }).style(dadavis.attribute.axis.labelY(config, cache));
    labelsY.exit().remove();
    var ticksY = axisYContainer.selectAll("div.tick").data(cache.axesLayout);
    ticksY.enter().append("div").classed("tick", true).style({
        "background-color": "black"
    });
    ticksY.style(dadavis.attribute.axis.tickY(config, cache));
    ticksY.exit().remove();
};

if (typeof define === "function" && define.amd) {
    define(dadavis);
} else if (typeof module === "object" && module.exports) {
    var d3 = require("d3");
    module.exports = dadavis;
}