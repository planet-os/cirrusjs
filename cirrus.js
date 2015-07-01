var cirrus = {
    version: "0.1.1"
};

cirrus.init = function(initialConfig) {
    var config = {
        container: ".container",
        width: "auto",
        height: "auto",
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
            return d.data.y;
        },
        axisXAngle: null,
        tickSize: 8,
        minorTickSize: 4,
        fringeSize: 8,
        tickYCount: 5,
        axisXTickSkip: "auto",
        continuousXAxis: false,
        gutterPercent: 10,
        renderer: "svg",
        scaleType: "time",
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
        colorList: cirrus.utils.defaultColors
    };
    var _config = {
        width: null,
        height: null,
        chartWidth: 500,
        chartHeight: 500,
        data: null,
        visibleData: null,
        shapeLayout: null,
        scaleX: null,
        scaleY: null,
        axesLayout: {},
        legendLayout: {},
        fringeLayout: {},
        previousData: null,
        container: null,
        dataLayersToHide: [],
        outerPadding: null,
        gutterPercent: 10,
        multipleTooltip: true,
        continuousXAxis: false,
        type: "bar",
        subtype: "stacked",
        events: d3.dispatch("hover", "hoverOut", "legendClick"),
        internalEvents: d3.dispatch("setHover", "hideHover", "resize", "legendClick")
    };
    cirrus.utils.override(initialConfig, config);
    var exports = {};
    exports.initialize = cirrus.utils.once(function(config, _config) {
        var that = this;
        _config.container = d3.select(config.container);
        _config.container.html(cirrus.template.main);
        _config.internalEvents.on("legendClick", function(toHide) {
            _config.dataLayersToHide = toHide;
            that.render();
        });
    });
    exports.setConfig = function(newConfig) {
        cirrus.utils.override(newConfig, config);
        return this;
    };
    exports.getConfig = function() {
        return config;
    };
    exports._getConfig = function() {
        return _config;
    };
    exports.resize = function() {
        this.render();
        return this;
    };
    exports.downloadAsPNG = function(callback) {
        cirrus.utils.convertToImage(config, _config, callback);
        return this;
    };
    exports.setHovering = function(hoverData) {
        _config.internalEvents.setHover(hoverData);
        return this;
    };
    exports.hideHovering = function() {
        _config.internalEvents.hideHover();
        return this;
    };
    exports.render = function(data) {
        if (!cirrus.data.validate(config, _config, data)) {
            console.error("Invalid data", data);
            return this;
        }
        this.initialize.call(this, config, _config);
        cirrus.automatic.config.call(this, config, _config);
        _config.scaleX = cirrus.scale.x(config, _config);
        _config.scaleY = cirrus.scale.y(config, _config);
        _config.scaleColor = cirrus.scale.color(config, _config);
        _config.shapeLayout = cirrus.layout.shape(config, _config);
        _config.axesLayout.x = cirrus.layout.axes.x(config, _config);
        _config.axesLayout.y = cirrus.layout.axes.y(config, _config);
        _config.legendLayout = cirrus.layout.legend(config, _config);
        cirrus.component.chart(config, _config);
        cirrus.component.shapes(config, _config);
        cirrus.component.axisX(config, _config);
        cirrus.component.axisY(config, _config);
        cirrus.component.title(config, _config);
        cirrus.component.legend(config, _config);
        cirrus.interaction.hovering(config, _config);
        return this;
    };
    d3.rebind(exports, _config.events, "on");
    return exports;
};

cirrus.utils = {};

cirrus.utils.override = function(_objA, _objB) {
    for (var x in _objA) {
        if (x in _objB) {
            _objB[x] = _objA[x];
        }
    }
};

cirrus.utils.computeRandomNumericArray = function(count, min, max) {
    return d3.range(count || 0).map(function(d, i) {
        return ~~(Math.random() * (max - min) + min);
    });
};

cirrus.utils.computeRandomTimeArray = function(count, dateNow) {
    var dayInMillis = 1e3 * 60 * 60 * 24;
    var dateNow = new Date().getTime() - count * dayInMillis;
    return d3.range(count || 0).map(function(d, i) {
        return dateNow + i * dayInMillis;
    });
};

cirrus.utils.getRandomNumericData = function(shapeCount, layerCount) {
    var x = d3.range(shapeCount);
    return d3.range(layerCount).map(function(d, i) {
        var y = cirrus.utils.computeRandomNumericArray(shapeCount, 10, 100);
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

cirrus.utils.defaultColors = [ "skyblue", "orange", "lime", "orangered", "violet", "yellow", "brown", "pink" ];

cirrus.utils.getRandomTimeData = function(shapeCount, layerCount) {
    var dateNow = new Date().getTime();
    var x = cirrus.utils.computeRandomTimeArray(shapeCount, dateNow);
    return d3.range(layerCount).map(function(d, i) {
        var y = cirrus.utils.computeRandomNumericArray(shapeCount, 10, 100);
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

cirrus.utils.getRandomHeatmapData = function(shapeCount, layerCount) {
    var dateNow = new Date().getTime();
    var x = cirrus.utils.computeRandomTimeArray(shapeCount, dateNow);
    return d3.range(layerCount).map(function(d, i) {
        var y = cirrus.utils.computeRandomNumericArray(shapeCount, 10, 100);
        var values = d3.zip(x, y).map(function(dB, iB) {
            return {
                x: dB[0],
                y: i,
                color: dB[1]
            };
        });
        return {
            name: "name" + i,
            values: values
        };
    });
};

cirrus.utils.throttle = function(callback, limit) {
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

cirrus.utils.convertToImage = function(config, _config, callback) {
    var clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: false
    });
    var chartNode = _config.container.node();
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

cirrus.utils.extractValues = function(data, key) {
    return data.map(function(d) {
        return d.values.map(function(dB) {
            return dB[key];
        });
    });
};

cirrus.utils.once = function once(fn, context) {
    var result;
    return function() {
        if (fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }
        return result;
    };
};

cirrus.data = {};

cirrus.data.validate = function(config, _config, _data) {
    var dataIsValid = false;
    if (_data && typeof _data === "object") {
        var isNotNull = false;
        _data.forEach(function(d) {
            isNotNull = isNotNull || !!d.values.length;
        });
        if (isNotNull) {
            var data = JSON.parse(JSON.stringify(_data));
            _config.previousData = data;
            _config.data = data;
            dataIsValid = true;
        }
    } else if (_config.previousData) {
        _config.data = _config.previousData;
        dataIsValid = true;
    }
    if (_config.data) {
        _config.visibleData = _config.data.filter(function(d) {
            return _config.dataLayersToHide.indexOf(d.name) === -1;
        });
    }
    return dataIsValid;
};

cirrus.automatic = {};

cirrus.automatic.config = function(config, _config) {
    if (config.type === "auto") {
        var dataLength = _config.data[0].values.length;
        if (dataLength < config.autoTypeThreshold) {
            _config.type = "bar";
            _config.continuousXAxis = false;
            _config.outerPadding = "auto";
        } else {
            _config.type = "line";
            _config.continuousXAxis = true;
        }
    } else {
        _config.type = config.type;
        _config.subtype = config.subtype;
    }
    if (config.width === "auto" || !config.width) {
        _config.width = _config.container.node().offsetWidth;
    }
    _config.chartWidth = _config.width - config.margin.left - config.margin.right;
    if (config.height === "auto" || !config.height) {
        _config.height = _config.container.node().offsetHeight;
    }
    _config.chartHeight = _config.height - config.margin.top - config.margin.bottom;
    if (config.outerPadding === "auto" || config.type === "bar") {
        var keys = cirrus.utils.extractValues(_config.data, "x");
        _config.outerPadding = _config.chartWidth / keys[0].length / 2;
    }
    if (_config.type === "line") {
        _config.outerPadding = 0;
    }
    if (_config.subtype === "grid") {
        _config.gutterPercent = 0;
        _config.multipleTooltip = false;
    }
    _config.data.forEach(function(d, i) {
        if (d3.keys(d.values[0]).indexOf("color") > -1) {
            d.color = null;
        } else if (!d.color) {
            d.color = config.colorList[i % config.colorList.length];
        }
    });
    return this;
};

cirrus.template = {};

cirrus.template.main = '<div class="chart">' + '<div class="title"></div>' + '<div class="axis-title-y"></div>' + '<div class="grid-x"></div>' + '<div class="grid-y"></div>' + '<div class="panel">' + '<div class="shape"></div>' + '<div class="hovering"></div>' + "</div>" + '<div class="axis-x"></div>' + '<div class="axis-y"></div>' + '<div class="axis-title-x"></div>' + '<div class="legend"></div>' + "</div>";

cirrus.layout = {
    data: {},
    axes: {},
    fringes: {}
};

cirrus.layout.shape = function(config, _config) {
    var percentScaleY = _config.scaleY.copy();
    var stackedScaleY = _config.scaleY.copy();
    var values = cirrus.utils.extractValues(_config.visibleData, "y");
    var valuesTransposed = d3.transpose(values);
    var previousValue = null;
    var minW = _config.chartWidth;
    _config.visibleData[0].values.forEach(function(d, i) {
        var value = d.x;
        if (config.scaleType === "time") {
            value = new Date(value);
        } else if (config.scaleType === "ordinal") {
            value = i;
        }
        var diff = _config.scaleX(value) - _config.scaleX(previousValue);
        if (i !== 0 && diff < minW) {
            minW = diff;
        }
        previousValue = value;
    });
    minW = Math.max(minW, 1);
    var gridH = _config.chartHeight / _config.visibleData.length;
    return _config.visibleData.map(function(d, i) {
        var previous = null;
        return d.values.map(function(dB, iB) {
            percentScaleY.domain([ 0, d3.sum(valuesTransposed[iB]) ]);
            stackedScaleY.domain([ 0, d3.max(valuesTransposed.map(function(d, i) {
                return d3.sum(d);
            })) ]);
            var key = dB.x;
            if (config.scaleType === "time") {
                key = new Date(key);
            } else if (config.scaleType === "ordinal") {
                key = iB;
            }
            var gutterW = minW / 100 * _config.gutterPercent;
            var datum = {
                data: dB,
                normalizedValue: dB.y / _config.scaleY.domain()[1],
                color: d.color || _config.scaleColor(dB.color),
                x: _config.scaleX(key),
                y: _config.chartHeight - _config.scaleY(dB.y),
                w: minW - gutterW,
                h: _config.scaleY(dB.y),
                centerX: _config.scaleX(key) - minW / 2,
                stackedPercentY: _config.chartHeight - percentScaleY(d3.sum(valuesTransposed[iB].slice(0, i + 1))),
                stackedPercentH: percentScaleY(dB.y),
                gridY: _config.chartHeight - gridH * dB.y - gridH,
                gridH: gridH,
                stackedY: _config.chartHeight - stackedScaleY(d3.sum(valuesTransposed[iB].slice(0, i + 1))),
                stackedH: stackedScaleY(dB.y)
            };
            datum.previous = previous || datum;
            previous = datum;
            return datum;
        });
    });
};

cirrus.layout.axes.x = function(config, _config) {
    var scaleX = _config.scaleX.copy();
    if (_config.continuousXAxis) {
        return scaleX.ticks().map(function(d, i) {
            return {
                key: d,
                x: scaleX(d)
            };
        });
    } else {
        return _config.visibleData[0].values.map(function(d, i) {
            var key = d.x;
            if (config.scaleType === "time") {
                key = new Date(key);
            } else if (config.scaleType === "ordinal") {
                key = i;
            }
            return {
                key: d.x,
                x: scaleX(key)
            };
        });
    }
};

cirrus.layout.axes.y = function(config, _config) {
    var scaleY = _config.scaleY.copy();
    var percentScaleY = _config.scaleY.copy();
    var stackedScaleY = _config.scaleY.copy();
    var values = cirrus.utils.extractValues(_config.visibleData, "y");
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

cirrus.layout.legend = function(config, _config) {
    return _config.data.map(function(d, i) {
        return {
            name: d.name,
            color: d.color
        };
    });
};

cirrus.layout.fringes.y = function(config, _config) {};

cirrus.attribute = {
    bar: {},
    line: {},
    point: {},
    axis: {}
};

cirrus.attribute.bar.simple = function(config, _config) {
    return _config.shapeLayout.map(function(d, i) {
        return d.map(function(dB, iB) {
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

cirrus.attribute.bar.percent = function(config, _config) {
    return _config.shapeLayout.map(function(d, i) {
        return d.map(function(dB, iB) {
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

cirrus.attribute.bar.grid = function(config, _config) {
    return _config.shapeLayout.map(function(d, i) {
        return d.map(function(dB, iB) {
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

cirrus.attribute.bar.stacked = function(config, _config) {
    return _config.shapeLayout.map(function(d, i) {
        return d.map(function(dB, iB) {
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

cirrus.attribute.line.simple = function(config, _config) {
    return _config.shapeLayout.map(function(d, i) {
        return {
            points: d.map(function(dB, iB) {
                return [ dB.x, dB.y ];
            }),
            color: d[0].color
        };
    });
};

cirrus.attribute.line.stacked = function(config, _config) {
    return _config.shapeLayout.map(function(d, i) {
        return {
            points: d.map(function(dB, iB) {
                return [ dB.x, dB.stackedY ];
            }),
            color: d[0].color
        };
    });
};

cirrus.attribute.line.area = function(config, _config) {
    return _config.shapeLayout.map(function(d, i) {
        var line = d.map(function(dB, iB) {
            return [ dB.x, dB.stackedY ];
        });
        var previousLine = null;
        if (i === 0) {
            previousLine = d.map(function(dB, iB) {
                return [ dB.x, _config.chartHeight ];
            }).reverse();
        } else {
            previousLine = _config.shapeLayout[i - 1].map(function(dB, iB) {
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

cirrus.attribute.axis.labelX = function(config, _config) {
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

cirrus.attribute.axis.tickX = function(config, _config) {
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

cirrus.attribute.axis.gridX = function(config, _config) {
    var lineW = 1;
    return {
        top: config.margin.top + "px",
        left: function(d, i) {
            return config.margin.left + d.x - lineW / 2 - this.offsetWidth + "px";
        },
        width: lineW + "px",
        height: function(d, i) {
            return (i % config.axisXTickSkip ? 0 : _config.chartHeight) + "px";
        }
    };
};

cirrus.attribute.axis.fringeX = function(config, _config) {
    var fringeColorScale = d3.scale.linear().domain([ 0, 1 ]).range([ "yellow", "limegreen" ]);
    return {
        left: function(d, i) {
            return d.x - d.w / 2 + "px";
        },
        width: function(d) {
            return Math.max(d.w, 1) + "px";
        },
        height: function(d, i) {
            return config.fringeSize + "px";
        },
        "background-color": function(d) {
            return fringeColorScale(d.normalizedValue);
        }
    };
};

cirrus.attribute.axis.labelY = function(config, _config) {
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

cirrus.attribute.axis.tickY = function(config, _config) {
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

cirrus.attribute.axis.gridY = function(config, _config) {
    var lineH = 1;
    return {
        width: _config.chartWidth + "px",
        height: lineH + "px",
        position: "absolute",
        left: config.margin.left + "px",
        top: function(d, i) {
            return config.margin.top + d.labelY + "px";
        }
    };
};

cirrus.attribute.axis.fringeY = function(config, _config) {
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

cirrus.interaction = {};

cirrus.interaction.hovering = function(config, _config) {
    var hoveringContainer = _config.container.select(".hovering").style({
        width: _config.chartWidth + "px",
        height: _config.chartHeight + "px",
        position: "absolute",
        opacity: 0
    });
    if (!!hoveringContainer.on("mousemove")) {
        return this;
    }
    hoveringContainer.on("mousemove", function() {
        var mouse = d3.mouse(this);
        var x = _config.shapeLayout[0].map(function(d, i) {
            return d.x;
        });
        var gridH = _config.shapeLayout[0][0].gridH;
        var idxUnderMouseY = Math.floor((_config.chartHeight - mouse[1]) / gridH);
        idxUnderMouseY = Math.min(idxUnderMouseY, _config.chartHeight / gridH - 1);
        var mouseOffsetX = _config.shapeLayout[0][0].w / 2;
        var idxUnderMouse = d3.bisect(x, mouse[0] - mouseOffsetX);
        idxUnderMouse = Math.min(idxUnderMouse, x.length - 1);
        var hoverData = {
            mouse: mouse,
            x: x,
            idx: idxUnderMouse,
            idxY: idxUnderMouseY
        };
        setHovering(hoverData);
        _config.events.hover(hoverData);
    }).on("mouseenter", function() {
        hoveringContainer.style({
            opacity: 1
        });
    }).on("mouseout", function() {
        hoveringContainer.style({
            opacity: 0
        });
        _config.events.hoverOut();
    });
    var hoverLine = cirrus.interaction.hoverLine(config, _config);
    var tooltip = cirrus.interaction.tooltip(config, _config);
    _config.internalEvents.on("setHover", function(hoverData) {
        setHovering(hoverData);
    });
    _config.internalEvents.on("hideHover", function() {
        hoveringContainer.style({
            opacity: 0
        });
    });
    var setHovering = function(hoverData) {
        var dataUnderMouse = _config.shapeLayout[hoverData.idxY][hoverData.idx];
        var tooltipsData = _config.shapeLayout.map(function(d, i) {
            return d[hoverData.idx];
        });
        if (!_config.multipleTooltip) {
            tooltipsData = [ tooltipsData[hoverData.idxY] ];
        }
        hoveringContainer.style({
            opacity: 1
        });
        hoverLine(dataUnderMouse);
        tooltip(tooltipsData);
    };
};

cirrus.interaction.tooltip = function(config, _config) {
    return function(tooltipsData) {
        var hoveringContainer = _config.container.select(".hovering");
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
                } else if (config.subtype === "grid") {
                    y = d.gridY;
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

cirrus.interaction.hoverLine = function(config, _config) {
    var hoverLine = _config.container.select(".hovering").append("div").attr({
        "class": "hover-line"
    }).style({
        position: "absolute",
        width: "1px",
        height: _config.chartHeight + "px",
        left: config.margin.left + "px",
        "pointer-events": "none"
    });
    return function(dataUnderMouse) {
        hoverLine.style({
            left: dataUnderMouse.x + "px"
        });
    };
};

cirrus.scale = {};

cirrus.scale.x = function(config, _config) {
    var keys = cirrus.utils.extractValues(_config.visibleData, "x");
    var allKeys = d3.merge(keys);
    var range = [ _config.outerPadding, _config.chartWidth - _config.outerPadding ];
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

cirrus.scale.y = function(config, _config) {
    var values = d3.merge(cirrus.utils.extractValues(_config.visibleData, "y"));
    return d3.scale.linear().range([ 0, _config.chartHeight ]).domain([ 0, d3.max(values) ]);
};

cirrus.scale.color = function(config, _config) {
    var values = d3.merge(cirrus.utils.extractValues(_config.visibleData, "color"));
    return d3.scale.linear().range([ "yellow", "red" ]).domain([ 0, d3.max(values) ]);
};

cirrus.renderer = {
    svg: null,
    canvas: null
};

cirrus.renderer.svg = function(element) {
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

cirrus.renderer.canvas = function(element) {
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

cirrus.component = {};

cirrus.component.chart = function(config, _config) {
    var chartContainer = _config.container.select(".chart").style({
        position: "absolute",
        width: _config.width + "px",
        height: _config.height + "px"
    });
    var panelContainer = chartContainer.select(".panel").style({
        position: "absolute",
        left: config.margin.left + "px",
        top: config.margin.top + "px",
        width: _config.chartWidth + "px",
        height: _config.chartHeight + "px"
    });
    var shapeContainer = chartContainer.select(".shape").style({
        position: "absolute",
        width: _config.chartWidth + "px",
        height: _config.chartHeight + "px"
    });
};

cirrus.component.shapes = function(config, _config) {
    var shapeAttr = cirrus.attribute[_config.type][_config.subtype](config, _config);
    var shapeContainer = _config.container.select(".shape");
    shapeContainer.html("");
    var renderer = cirrus.renderer[config.renderer](shapeContainer.node());
    if (_config.type === "line") {
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

cirrus.component.title = function(config, _config) {
    if (config.chartTitle) {
        _config.container.select(".title").html(config.chartTitle).style({
            width: "100%",
            "text-align": "center"
        });
    }
    if (config.axisXTitle) {
        _config.container.select(".axis-title-x").html(config.axisXTitle).style({
            top: function() {
                return _config.height - this.offsetHeight + "px";
            },
            position: "absolute",
            width: "100%",
            "text-align": "center"
        });
    }
    if (config.axisYTitle) {
        _config.container.select(".axis-title-y").html(config.axisYTitle).style({
            transform: "rotate(-90deg) translate(-" + _config.height / 2 + "px)",
            "transform-origin": "0 0"
        });
    }
};

cirrus.component.axisX = function(config, _config) {
    if (!config.showAxes) {
        return;
    }
    var axisXContainer = _config.container.select(".axis-x").style({
        width: _config.chartWidth + "px",
        height: config.margin.bottom + "px",
        position: "absolute",
        top: _config.chartHeight + config.margin.top + "px",
        left: config.margin.left + "px",
        "border-top": "1px solid black"
    });
    if (config.showFringe) {
        var fringeX = axisXContainer.selectAll("div.fringe-x").data(_config.shapeLayout[0]);
        fringeX.enter().append("div").classed("fringe-x", true).style({
            position: "absolute"
        });
        fringeX.style(cirrus.attribute.axis.fringeX(config, _config));
        fringeX.exit().remove();
    }
    var labelsX = axisXContainer.selectAll("div.label").data(_config.axesLayout.x);
    labelsX.enter().append("div").classed("label", true).style({
        position: "absolute"
    });
    labelsX.html(function(d, i) {
        return config.labelFormatterX(d.key, i);
    }).style(cirrus.attribute.axis.labelX(config, _config));
    labelsX.style(cirrus.attribute.axis.labelX(config, _config));
    labelsX.exit().remove();
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
    if (config.showXGrid) {
        var gridX = _config.container.select(".grid-x").selectAll("div.grid-line-x").data(_config.axesLayout.x);
        gridX.enter().append("div").classed("grid-line-x", true).style({
            position: "absolute"
        }).style({
            "background-color": "#eee"
        });
        gridX.style(cirrus.attribute.axis.gridX(config, _config));
        if (config.axisXTickSkip === "auto") {
            gridX.style({
                height: function(d, i) {
                    var toSkip = skipped.indexOf(i) !== -1;
                    return (toSkip ? 0 : d.height) + "px";
                }
            });
        }
        gridX.exit().remove();
    }
    var ticksX = axisXContainer.selectAll("div.tick").data(_config.axesLayout.x);
    ticksX.enter().append("div").classed("tick", true).style({
        position: "absolute"
    }).style({
        "background-color": "black"
    });
    ticksX.style(cirrus.attribute.axis.tickX(config, _config));
    if (config.axisXTickSkip === "auto") {
        ticksX.style({
            height: function(d, i) {
                var toSkip = skipped.indexOf(i) !== -1;
                return (toSkip ? config.minorTickSize : config.tickSize) + "px";
            }
        });
    }
    ticksX.exit().remove();
};

cirrus.component.axisY = function(config, _config) {
    if (!config.showAxes) {
        return;
    }
    var axisYContainer = _config.container.select(".axis-y").style({
        width: config.margin.left + "px",
        height: _config.chartHeight + "px",
        position: "absolute",
        top: config.margin.top + "px",
        left: 0 + "px",
        "border-right": "1px solid black"
    });
    if (config.showFringe) {
        var fringeY = axisYContainer.selectAll("div.fringe-y").data(_config.shapeLayout[0]);
        fringeY.enter().append("div").classed("fringe-y", true).style({
            position: "absolute"
        });
        fringeY.style(cirrus.attribute.axis.fringeY(config, _config));
        fringeY.exit().remove();
    }
    if (config.showYGrid) {
        var gridX = _config.container.select(".grid-y").selectAll("div.grid-line-y").data(_config.axesLayout.y);
        gridX.enter().append("div").classed("grid-line-y", true).style({
            position: "absolute"
        }).style({
            "background-color": "#eee"
        });
        gridX.style(cirrus.attribute.axis.gridY(config, _config));
        gridX.exit().remove();
    }
    var labelsY = axisYContainer.selectAll("div.label").data(_config.axesLayout.y);
    labelsY.enter().append("div").classed("label", true);
    labelsY.html(function(d, i) {
        if (config.subtype === "simple" || config.subtype === "grid") {
            return d.label;
        } else {
            return d.stackedLabel;
        }
    }).style(cirrus.attribute.axis.labelY(config, _config));
    labelsY.exit().remove();
    var ticksY = axisYContainer.selectAll("div.tick").data(_config.axesLayout.y);
    ticksY.enter().append("div").classed("tick", true).style({
        "background-color": "black"
    });
    ticksY.style(cirrus.attribute.axis.tickY(config, _config));
    ticksY.exit().remove();
};

cirrus.component.legend = function(config, _config) {
    if (!config.showLegend) {
        return this;
    }
    var legend = _config.container.select(".legend").style({
        position: "absolute"
    });
    var legendItems = legend.selectAll("p.legend-item").data(_config.legendLayout);
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
            _config.events.legendClick(toHide);
            _config.internalEvents.legendClick(toHide);
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
            return _config.width - this.offsetWidth + "px";
        }
    });
};

if (typeof define === "function" && define.amd) {
    define(cirrus);
} else if (typeof module === "object" && module.exports) {
    var d3 = require("d3");
    module.exports = cirrus;
}