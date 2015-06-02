var dadavis = {
    version: "0.1.1"
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
        labelFormatterX: function(d) {
            return d;
        },
        tooltipFormatter: function(d) {
            return d.value;
        },
        axisXAngle: null,
        tickSize: 15,
        minorTickSize: 10,
        fringeSize: 8,
        tickYCount: 5,
        axisXTickSkip: "auto",
        continuousXAxis: false,
        dotSize: 2,
        gutterPercent: 10,
        renderer: "svg",
        scaleType: "time",
        keyX: "x",
        keyY: "y",
        outerPadding: 0,
        showFringe: false,
        showAxes: true,
        showXGrid: false,
        showYGrid: false,
        showLegend: false,
        autoTypeThreshold: 30,
        chartTitle: null,
        axisXTitle: null,
        axisYTitle: null,
        colorList: dadavis.utils.defaultColors
    };
    var cache = {
        chartWidth: 500,
        chartHeight: 500,
        data: null,
        visibleData: null,
        layout: null,
        scaleX: null,
        scaleY: null,
        axesLayout: {},
        legendLayout: {},
        fringeLayout: {},
        previousData: null,
        container: null,
        noPadding: false,
        dataLayersToHide: [],
        events: d3.dispatch("hover", "hoverOut", "legendClick"),
        internalEvents: d3.dispatch("setHover", "hideHover", "resize", "legendClick")
    };
    var exports = {};
    exports.initialize = dadavis.utils.once(function(config, cache) {
        dadavis.utils.override(_config, config);
        cache.container = d3.select(config.containerSelector);
        cache.container.html(dadavis.template.main);
        d3.select(window).on("resize.namespace" + ~~(Math.random() * 1e3), dadavis.utils.throttle(function() {
            cache.internalEvents.resize();
        }, 200));
        var that = this;
        cache.internalEvents.on("resize", function() {
            that.resize();
        });
        cache.internalEvents.on("legendClick", function(toHide) {
            cache.dataLayersToHide = toHide;
            that.render();
        });
    });
    exports.setConfig = function(newConfig) {
        dadavis.utils.override(newConfig, config);
        return this;
    };
    exports.resize = function() {
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
        if (!dadavis.data.validate(config, cache, data)) {
            console.error("Invalid data", data);
            return this;
        }
        this.initialize.call(this, config, cache);
        dadavis.automatic.config.call(this, config, cache);
        cache.scaleX = dadavis.scale.x(config, cache);
        cache.scaleY = dadavis.scale.y(config, cache);
        cache.layout = dadavis.layout.data(config, cache);
        cache.axesLayout.x = dadavis.layout.axes.x(config, cache);
        cache.axesLayout.y = dadavis.layout.axes.y(config, cache);
        cache.legendLayout = dadavis.layout.legend(config, cache);
        dadavis.component.chart(config, cache);
        dadavis.component.shapes(config, cache);
        dadavis.component.axisX(config, cache);
        dadavis.component.axisY(config, cache);
        dadavis.component.title(config, cache);
        dadavis.component.legend(config, cache);
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
    var x = d3.range(shapeCount);
    return d3.range(layerCount).map(function(d, i) {
        var y = dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100);
        var values = d3.zip(x, y).map(function(d, i) {
            return {
                x: d[0],
                y: d[1]
            };
        });
        return {
            name: "name" + i,
            values: values
        };
    });
};

dadavis.utils.defaultColors = [ "skyblue", "orange", "lime", "orangered", "violet", "yellow", "brown", "pink" ];

dadavis.utils.getRandomTimeData = function(shapeCount, layerCount) {
    var dateNow = new Date().getTime();
    var x = dadavis.utils.computeRandomTimeArray(shapeCount, dateNow);
    return d3.range(layerCount).map(function(d, i) {
        var y = dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100);
        var values = d3.zip(x, y).map(function(d, i) {
            return {
                x: d[0],
                y: d[1]
            };
        });
        return {
            name: "name" + i,
            values: values
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

dadavis.utils.extractValues = function(data, key) {
    return data.map(function(d) {
        return d.values.map(function(dB) {
            return dB[key];
        });
    });
};

dadavis.utils.once = function once(fn, context) {
    var result;
    return function() {
        if (fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }
        return result;
    };
};

dadavis.data = {};

dadavis.data.validate = function(config, cache, _data) {
    var dataIsValid = false;
    if (_data && typeof _data === "object") {
        var isNotNull = false;
        _data.forEach(function(d) {
            isNotNull = isNotNull || !!d.values.length;
        });
        if (isNotNull) {
            cache.previousData = _data;
            cache.data = _data;
            dataIsValid = true;
        }
    }
    if (cache.previousData) {
        cache.data = cache.previousData;
        dataIsValid = true;
    }
    cache.visibleData = cache.data.filter(function(d) {
        return cache.dataLayersToHide.indexOf(d.name) === -1;
    });
    return dataIsValid;
};

dadavis.automatic = {};

dadavis.automatic.config = function(config, cache) {
    if (config.type === "auto") {
        var dataLength = cache.data[0].values.length;
        if (dataLength < config.autoTypeThreshold) {
            this.setConfig({
                type: "bar",
                continuousXAxis: false,
                outerPadding: "auto"
            });
        } else {
            this.setConfig({
                type: "line",
                continuousXAxis: true
            });
        }
    }
    this.setConfig({
        width: cache.container.node().offsetWidth,
        height: cache.container.node().offsetHeight
    });
    cache.chartWidth = config.width - config.margin.left - config.margin.right;
    cache.chartHeight = config.height - config.margin.top - config.margin.bottom;
    if (config.outerPadding === "auto") {
        var keys = dadavis.utils.extractValues(cache.data, config.keyX);
        this.setConfig({
            outerPadding: cache.chartWidth / keys[0].length / 2
        });
    }
    if (config.type === "line") {
        cache.noPadding = true;
    }
    cache.data.forEach(function(d, i) {
        if (!d.color) {
            d.color = config.colorList[i % config.colorList.length];
        }
    });
    return this;
};

dadavis.template = {};

dadavis.template.main = '<div class="chart">' + '<div class="title"></div>' + '<div class="axis-title-y"></div>' + '<div class="grid-x"></div>' + '<div class="grid-y"></div>' + '<div class="panel">' + '<div class="shape"></div>' + '<div class="hovering"></div>' + "</div>" + '<div class="axis-x"></div>' + '<div class="axis-y"></div>' + '<div class="axis-title-x"></div>' + '<div class="legend"></div>' + "</div>";

dadavis.layout = {
    data: {},
    axes: {},
    fringes: {}
};

dadavis.layout.data = function(config, cache) {
    cache.visibleData = cache.data.filter(function(d) {
        return cache.dataLayersToHide.indexOf(d.name) === -1;
    });
    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();
    var values = dadavis.utils.extractValues(cache.visibleData, config.keyY);
    var valuesTransposed = d3.transpose(values);
    var previousValue = null;
    var minW = cache.chartWidth;
    cache.visibleData[0].values.forEach(function(d, i) {
        var value = d[config.keyX];
        if (config.scaleType === "time") {
            value = new Date(value);
        } else if (config.scaleType === "ordinal") {
            value = i;
        }
        var diff = cache.scaleX(value) - cache.scaleX(previousValue);
        if (i !== 0 && diff < minW) {
            minW = diff;
        }
        previousValue = value;
    });
    minW = Math.max(minW, 1);
    return cache.visibleData.map(function(d, i) {
        var previous = null;
        return d.values.map(function(dB, iB) {
            percentScaleY.domain([ 0, d3.sum(valuesTransposed[iB]) ]);
            stackedScaleY.domain([ 0, d3.max(valuesTransposed.map(function(d, i) {
                return d3.sum(d);
            })) ]);
            var key = dB[config.keyX];
            if (config.scaleType === "time") {
                key = new Date(key);
            } else if (config.scaleType === "ordinal") {
                key = iB;
            }
            var value = dB[config.keyY];
            var gutterW = minW / 100 * config.gutterPercent;
            var datum = {
                key: dB[config.keyX],
                value: value,
                normalizedValue: value / cache.scaleY.domain()[1],
                index: iB,
                parentData: d,
                x: cache.scaleX(key),
                y: cache.chartHeight - cache.scaleY(value),
                stackedPercentY: cache.chartHeight - percentScaleY(d3.sum(valuesTransposed[iB].slice(0, i + 1))),
                stackedY: cache.chartHeight - stackedScaleY(d3.sum(valuesTransposed[iB].slice(0, i + 1))),
                w: minW,
                h: cache.scaleY(value),
                gutterW: gutterW,
                stackedPercentH: percentScaleY(value),
                stackedH: stackedScaleY(value),
                layerCount: cache.visibleData.length,
                layerIndex: i,
                centerX: cache.scaleX(key) + minW / 2,
                color: d.color
            };
            datum.previous = previous || datum;
            previous = datum;
            return datum;
        });
    });
};

dadavis.layout.axes.x = function(config, cache) {
    var scaleX = cache.scaleX.copy();
    if (config.continuousXAxis) {
        return scaleX.ticks().map(function(d, i) {
            return {
                key: d,
                x: scaleX(d)
            };
        });
    } else {
        return cache.visibleData[0].values.map(function(d, i) {
            var key = d[config.keyX];
            if (config.scaleType === "time") {
                key = new Date(key);
            } else if (config.scaleType === "ordinal") {
                key = i;
            }
            return {
                key: d[config.keyX],
                x: scaleX(key)
            };
        });
    }
};

dadavis.layout.axes.y = function(config, cache) {
    var scaleY = cache.scaleY.copy();
    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();
    var values = dadavis.utils.extractValues(cache.visibleData, config.keyY);
    var valuesTransposed = d3.transpose(values);
    var domainMax = d3.max(d3.merge(values));
    scaleY.domain([ domainMax, 0 ]);
    var stackedDomainMax = d3.max(valuesTransposed.map(function(d) {
        return d3.sum(d);
    }));
    stackedScaleY.domain([ stackedDomainMax, 0 ]);
    var percentDomainMax = d3.max(valuesTransposed.map(function(d) {
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

dadavis.layout.legend = function(config, cache) {
    return cache.data.map(function(d, i) {
        return {
            name: d.name,
            color: d.color
        };
    });
};

dadavis.layout.fringes.y = function(config, cache) {};

dadavis.attribute = {
    bar: {},
    line: {},
    point: {},
    axis: {}
};

dadavis.attribute.bar.simple = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return d.map(function(dB, iB) {
            return {
                x: dB.x - dB.w / 2 + dB.gutterW / 2,
                y: dB.y,
                width: dB.w - dB.gutterW,
                height: dB.h,
                color: d[0].color
            };
        });
    });
};

dadavis.attribute.bar.percent = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return d.map(function(dB, iB) {
            return {
                x: dB.x - dB.w / 2 + dB.gutterW / 2,
                y: dB.stackedPercentY,
                width: dB.w - dB.gutterW,
                height: dB.stackedPercentH,
                color: d[0].color
            };
        });
    });
};

dadavis.attribute.bar.stacked = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return d.map(function(dB, iB) {
            return {
                x: dB.x - dB.w / 2 + dB.gutterW / 2,
                y: dB.stackedY,
                width: dB.w - dB.gutterW,
                height: dB.stackedH,
                color: d[0].color
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
                return d.centerX;
            }
        },
        cy: function(d, i) {
            return d.stackedY;
        }
    };
};

dadavis.attribute.line.simple = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return {
            points: d.map(function(dB, iB) {
                return [ dB.x, dB.y ];
            }),
            color: d[0].color
        };
    });
};

dadavis.attribute.line.stacked = function(config, cache) {
    return cache.layout.map(function(d, i) {
        return {
            points: d.map(function(dB, iB) {
                return [ dB.x, dB.stackedY ];
            }),
            color: d[0].color
        };
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
        var points = line.concat(previousLine);
        return {
            points: points,
            color: d[0].color
        };
    });
};

dadavis.attribute.axis.labelX = function(config, cache) {
    var labelAttr = {};
    if (config.axisXAngle < 0) {
        labelAttr = {
            left: function(d, i) {
                return d.x - this.offsetWidth + "px";
            },
            "transform-origin": "100%",
            transform: "rotate(" + config.axisXAngle + "deg)"
        };
    } else if (config.axisXAngle > 0) {
        labelAttr = {
            left: function(d, i) {
                return d.x + "px";
            },
            "transform-origin": "0%",
            transform: "rotate(" + config.axisXAngle + "deg)"
        };
    } else {
        labelAttr = {
            left: function(d, i) {
                return d.x - this.offsetWidth / 2 + "px";
            }
        };
    }
    labelAttr.display = function(d, i) {
        return i % config.axisXTickSkip ? "none" : "block";
    };
    labelAttr.top = config.tickSize + "px";
    return labelAttr;
};

dadavis.attribute.axis.tickX = function(config, cache) {
    var tickW = 1;
    return {
        left: function(d, i) {
            return d.x - tickW / 2 + "px";
        },
        width: tickW + "px",
        height: function(d, i) {
            return (i % config.axisXTickSkip ? config.minorTickSize : config.tickSize) + "px";
        }
    };
};

dadavis.attribute.axis.gridX = function(config, cache) {
    var lineW = 1;
    return {
        top: config.margin.top + "px",
        left: function(d, i) {
            return config.margin.left + d.x - lineW / 2 - this.offsetWidth + "px";
        },
        width: lineW + "px",
        height: function(d, i) {
            return (i % config.axisXTickSkip ? 0 : cache.chartHeight) + "px";
        }
    };
};

dadavis.attribute.axis.fringeX = function(config, cache) {
    var fringeColorScale = d3.scale.linear().domain([ 0, 1 ]).range([ "yellow", "limegreen" ]);
    return {
        left: function(d, i) {
            return d.x - d.w / 2 + d.gutterW / 2 + "px";
        },
        width: function(d) {
            return Math.max(d.w - d.gutterW, 1) + "px";
        },
        height: function(d, i) {
            return config.fringeSize + "px";
        },
        "background-color": function(d) {
            return fringeColorScale(d.normalizedValue);
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
    var lineH = 1;
    return {
        width: config.tickSize + "px",
        height: lineH + "px",
        position: "absolute",
        left: config.margin.left - config.tickSize + "px",
        top: function(d, i) {
            return d.labelY + "px";
        }
    };
};

dadavis.attribute.axis.gridY = function(config, cache) {
    var lineH = 1;
    return {
        width: cache.chartWidth + "px",
        height: lineH + "px",
        position: "absolute",
        left: config.margin.left + "px",
        top: function(d, i) {
            return config.margin.top + d.labelY + "px";
        }
    };
};

dadavis.attribute.axis.fringeY = function(config, cache) {
    var fringeColorScale = d3.scale.linear().domain([ 0, 1 ]).range([ "yellow", "limegreen" ]);
    var h = 3;
    return {
        position: "absolute",
        left: config.margin.left - config.fringeSize + "px",
        top: function(d, i) {
            return d.y - h / 2 + "px";
        },
        width: function(d) {
            return config.fringeSize + "px";
        },
        height: function(d, i) {
            return h + "px";
        },
        "background-color": function(d) {
            return fringeColorScale(d.normalizedValue);
        }
    };
};

dadavis.interaction = {};

dadavis.interaction.hovering = function(config, cache) {
    var hoveringContainer = cache.container.select(".hovering");
    if (!!hoveringContainer.on("mousemove")) {
        return this;
    }
    hoveringContainer.style({
        width: cache.chartWidth + "px",
        height: cache.chartHeight + "px",
        position: "absolute",
        opacity: 0
    }).on("mousemove", function() {
        var mouse = d3.mouse(this);
        var x = cache.layout[0].map(function(d, i) {
            return d.x;
        });
        var mouseOffset = cache.layout[0][0].w / 2;
        var idxUnderMouse = d3.bisect(x, mouse[0] - mouseOffset);
        idxUnderMouse = Math.min(idxUnderMouse, x.length - 1);
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
            "pointer-events": "none",
            "z-index": 2
        });
        tooltip.html(function(d, i) {
            return config.tooltipFormatter(d);
        }).style({
            left: function(d, i) {
                return d.x + "px";
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
                return d.color;
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
        hoverLine.style({
            left: dataUnderMouse.x + "px"
        });
    };
};

dadavis.scale = {};

dadavis.scale.x = function(config, cache) {
    var keys = dadavis.utils.extractValues(cache.visibleData, config.keyX);
    var allKeys = d3.merge(keys);
    var range = [ config.outerPadding, cache.chartWidth - config.outerPadding ];
    var scaleX = null;
    if (config.scaleType === "time") {
        scaleX = d3.time.scale().range(range);
        allKeys = allKeys.map(function(d, i) {
            return new Date(d);
        });
        scaleX.domain(d3.extent(allKeys));
    } else if (config.scaleType === "ordinal") {
        scaleX = d3.scale.linear().range(range);
        scaleX.domain([ 0, keys[0].length - 1 ]);
    } else {
        scaleX = d3.scale.linear().range(range);
        scaleX.domain(d3.extent(allKeys));
    }
    return scaleX;
};

dadavis.scale.y = function(config, cache) {
    var values = d3.merge(dadavis.utils.extractValues(cache.visibleData, config.keyY));
    return d3.scale.linear().range([ 0, cache.chartHeight ]).domain([ 0, d3.max(values) ]);
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
    canvasRenderer.circle = function(attributes) {
        ctx.fillStyle = attributes.fill;
        ctx.strokeStyle = attributes.stroke;
        context.beginPath();
        context.arc(attributes.circle.x, attributes.circle.y, attributes.circle.r, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
        return this;
    };
    return canvasRenderer;
};

dadavis.component = {};

dadavis.component.chart = function(config, cache) {
    var chartContainer = cache.container.select(".chart").style({
        position: "absolute",
        width: config.width + "px",
        height: config.height + "px"
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
};

dadavis.component.shapes = function(config, cache) {
    var shapeAttr = dadavis.attribute[config.type][config.subtype](config, cache);
    var shapeContainer = cache.container.select(".shape");
    shapeContainer.html("");
    var renderer = dadavis.renderer[config.renderer](shapeContainer.node());
    if (config.type === "line") {
        shapeAttr.forEach(function(d, i) {
            var color = null;
            if (config.subtype === "area") {
                color = d.color;
            } else {
                color = "none";
            }
            renderer.polygon({
                points: d.points,
                fill: color,
                stroke: d.color
            });
        });
    } else {
        shapeAttr.forEach(function(d, i) {
            d.forEach(function(dB, iB) {
                renderer.rect({
                    rect: dB,
                    fill: dB.color,
                    stroke: dB.color
                });
            });
        });
    }
    return this;
};

dadavis.component.title = function(config, cache) {
    if (config.chartTitle) {
        d3.select(".title").html("Chart Title").style({
            width: "100%",
            "text-align": "center"
        });
    }
    if (config.axisXTitle) {
        d3.select(".axis-title-x").html("X Axis Title").style({
            top: function() {
                return config.height - this.offsetHeight + "px";
            },
            position: "absolute",
            width: "100%",
            "text-align": "center"
        });
    }
    if (config.axisYTitle) {
        d3.select(".axis-title-y").html("Y Axis Title").style({
            transform: "rotate(-90deg) translate(-" + config.height / 2 + "px)",
            "transform-origin": "0 0"
        });
    }
};

dadavis.component.axisX = function(config, cache) {
    if (!config.showAxes) {
        return;
    }
    var axisXContainer = cache.container.select(".axis-x").style({
        width: cache.chartWidth + "px",
        height: config.margin.bottom + "px",
        position: "absolute",
        top: cache.chartHeight + config.margin.top + "px",
        left: config.margin.left + "px",
        "border-top": "1px solid black"
    });
    if (config.showFringe) {
        var fringeX = axisXContainer.selectAll("div.fringe-x").data(cache.layout[0]);
        fringeX.enter().append("div").classed("fringe-x", true).style({
            position: "absolute"
        });
        fringeX.style(dadavis.attribute.axis.fringeX(config, cache));
        fringeX.exit().remove();
    }
    if (config.showXGrid) {
        var gridX = cache.container.select(".grid-x").selectAll("div.grid-line-x").data(cache.axesLayout.x);
        gridX.enter().append("div").classed("grid-line-x", true).style({
            position: "absolute"
        }).style({
            "background-color": "#eee"
        });
        gridX.style(dadavis.attribute.axis.gridX(config, cache));
        gridX.exit().remove();
    }
    var labelsX = axisXContainer.selectAll("div.label").data(cache.axesLayout.x);
    labelsX.enter().append("div").classed("label", true).style({
        position: "absolute"
    });
    labelsX.html(function(d, i) {
        return config.labelFormatterX(d.key, i);
    }).style(dadavis.attribute.axis.labelX(config, cache));
    var skipped = [];
    if (config.axisXTickSkip === "auto") {
        var previous = null;
        labelsX[0].forEach(function(d, i) {
            var hide = false;
            if (previous) {
                hide = parseFloat(d.style.left) - parseFloat(previous.style.left) < d.offsetWidth;
            }
            if (!hide) {
                previous = d;
            } else {
                skipped.push(i);
            }
            d3.select(d).style({
                opacity: +!hide
            });
            return d.offsetWidth;
        });
    }
    labelsX.style(dadavis.attribute.axis.labelX(config, cache));
    labelsX.exit().remove();
    var ticksX = axisXContainer.selectAll("div.tick").data(cache.axesLayout.x);
    ticksX.enter().append("div").classed("tick", true).style({
        position: "absolute"
    }).style({
        "background-color": "black"
    });
    ticksX.style(dadavis.attribute.axis.tickX(config, cache)).style({
        height: function(d, i) {
            if (config.axisXTickSkip === "auto") {
                var toSkip = skipped.indexOf(i) !== -1;
                return (toSkip ? config.minorTickSize : config.tickSize) + "px";
            }
            return (i % config.axisXTickSkip ? config.minorTickSize : config.tickSize) + "px";
        }
    });
    ticksX.exit().remove();
};

dadavis.component.axisY = function(config, cache) {
    if (!config.showAxes) {
        return;
    }
    var axisYContainer = cache.container.select(".axis-y").style({
        width: config.margin.left + "px",
        height: cache.chartHeight + "px",
        position: "absolute",
        top: config.margin.top + "px",
        left: 0 + "px",
        "border-right": "1px solid black"
    });
    if (config.showFringe) {
        var fringeY = axisYContainer.selectAll("div.fringe-y").data(cache.layout[0]);
        fringeY.enter().append("div").classed("fringe-y", true).style({
            position: "absolute"
        });
        fringeY.style(dadavis.attribute.axis.fringeY(config, cache));
        fringeY.exit().remove();
    }
    if (config.showYGrid) {
        var gridX = cache.container.select(".grid-y").selectAll("div.grid-line-y").data(cache.axesLayout.y);
        gridX.enter().append("div").classed("grid-line-y", true).style({
            position: "absolute"
        }).style({
            "background-color": "#eee"
        });
        gridX.style(dadavis.attribute.axis.gridY(config, cache));
        gridX.exit().remove();
    }
    var labelsY = axisYContainer.selectAll("div.label").data(cache.axesLayout.y);
    labelsY.enter().append("div").classed("label", true);
    labelsY.html(function(d, i) {
        if (config.subtype === "simple") {
            return d.label;
        } else {
            return d.stackedLabel;
        }
    }).style(dadavis.attribute.axis.labelY(config, cache));
    labelsY.exit().remove();
    var ticksY = axisYContainer.selectAll("div.tick").data(cache.axesLayout.y);
    ticksY.enter().append("div").classed("tick", true).style({
        "background-color": "black"
    });
    ticksY.style(dadavis.attribute.axis.tickY(config, cache));
    ticksY.exit().remove();
};

dadavis.component.legend = function(config, cache) {
    if (!config.showLegend) {
        return this;
    }
    var legend = cache.container.select(".legend").style({
        position: "absolute"
    });
    var legendItems = legend.selectAll("p.legend-item").data(cache.legendLayout);
    legendItems.enter().append("p").classed("legend-item", true).each(function(d, i) {
        var that = this;
        var a = d3.select(this).append("a").style({
            cursor: "pointer"
        }).on("click", function() {
            var element = d3.select(that);
            d3.select(that).classed("unchecked", !element.classed("unchecked"));
            var toHide = [];
            legendItems.each(function(d) {
                if (this.classList.contains("unchecked")) {
                    toHide.push(d.name);
                }
            });
            cache.events.legendClick(toHide);
            cache.internalEvents.legendClick(toHide);
        });
        a.append("span").attr({
            "class": "legend-color"
        }).style({
            display: "inline-block",
            width: 10 + "px",
            height: 10 + "px",
            "border-radius": 5 + "px",
            "background-color": function(d, i) {
                return d.color;
            }
        });
        a.append("span").attr({
            "class": "legend-name"
        }).style({
            display: "inline-block"
        }).html(function() {
            return d.name;
        });
    });
    legendItems.exit().remove();
    legend.style({
        left: function() {
            return config.width - this.offsetWidth + "px";
        }
    });
};

if (typeof define === "function" && define.amd) {
    define(dadavis);
} else if (typeof module === "object" && module.exports) {
    var d3 = require("d3");
    module.exports = dadavis;
}