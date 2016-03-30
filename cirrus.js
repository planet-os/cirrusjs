var cirrus = {
    version: "0.1.2"
};

cirrus.init = function(initialConfig) {
    var config = {
        container: ".container",
        width: null,
        height: null,
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
        labelFormatterY: function(d) {
            return d;
        },
        tooltipFormatter: function(d) {
            return d.data.y;
        },
        axisXAngle: null,
        tickSize: 8,
        minorTickSize: 4,
        tickYCount: 5,
        axisXTickSkip: 0,
        fringeSize: 8,
        continuousXAxis: false,
        gutterPercent: 10,
        renderer: "svg",
        scaleType: "time",
        outerPadding: 0,
        showFringe: false,
        showXAxis: true,
        showYAxis: true,
        showXGrid: true,
        showYGrid: false,
        showLegend: false,
        autoTypeThreshold: 30,
        chartTitle: null,
        axisXTitle: null,
        axisYTitle: null,
        colorList: cirrus.utils.defaultColors,
        multipleTooltip: true,
        chartWidth: 500,
        chartHeight: 500,
        data: null,
        previousData: null,
        visibleData: null,
        dataLayersToHide: [],
        shapeLayout: null,
        axesLayout: {},
        legendLayout: {},
        fringeLayout: {},
        scaleX: null,
        scaleY: null,
        events: d3.dispatch("hover", "hoverOut", "legendClick"),
        internalEvents: d3.dispatch("setHover", "hideHover", "resize", "legendClick")
    };
    var initialConfig = initialConfig;
    cirrus.utils.override(initialConfig, config);
    var exports = {};
    exports.initialize = cirrus.utils.once(function(config) {
        var that = this;
        config.container = d3.select(config.container);
        config.container.html(cirrus.template.main);
        config.internalEvents.on("legendClick", function(toHide) {
            config.dataLayersToHide = toHide;
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
        return config;
    };
    exports.resize = function() {
        this.render();
        return this;
    };
    exports.downloadAsPNG = function(callback) {
        cirrus.utils.convertToImage(config, callback);
        return this;
    };
    exports.setHovering = function(hoverData) {
        config.internalEvents.setHover(hoverData);
        return this;
    };
    exports.hideHovering = function() {
        config.internalEvents.hideHover();
        return this;
    };
    exports.render = function(data) {
        if (!cirrus.data.validate(config, data)) {
            console.error("Invalid data", data);
            return this;
        }
        this.initialize.call(this, config);
        cirrus.automatic.configuration.call(this, initialConfig, config);
        config.scaleX = cirrus.scale.x(config);
        config.scaleY = cirrus.scale.y(config);
        config.scaleColor = cirrus.scale.color(config);
        config.shapeLayout = cirrus.layout[config.type][config.subtype](config);
        config.axesLayout.x = cirrus.layout.axes.x(config);
        config.axesLayout.y = cirrus.layout.axes.y(config);
        config.legendLayout = cirrus.layout.legend(config);
        cirrus.component.chart(config);
        cirrus.component.shapes(config);
        cirrus.component.axisX(config);
        cirrus.component.axisY(config);
        cirrus.component.title(config);
        cirrus.component.legend(config);
        cirrus.interaction.hovering(config);
        return this;
    };
    d3.rebind(exports, config.events, "on");
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

cirrus.utils.convertToImage = function(config, callback) {
    var clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: false
    });
    var chartNode = config.container.node();
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

cirrus.utils.getKey = function(scaleType, d, i) {
    var key = d.x;
    if (scaleType === "time") {
        key = new Date(key);
    } else if (scaleType === "ordinal") {
        key = i;
    }
    return key;
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

cirrus.data.validate = function(config, _data) {
    var dataIsValid = false;
    if (_data && typeof _data === "object") {
        var isNotNull = false;
        _data.forEach(function(d) {
            isNotNull = isNotNull || !!d.values.length;
        });
        if (isNotNull) {
            var data = JSON.parse(JSON.stringify(_data));
            config.previousData = data;
            config.data = data;
            dataIsValid = true;
        }
    } else if (config.previousData) {
        config.data = config.previousData;
        dataIsValid = true;
    }
    if (config.data) {
        config.visibleData = config.data.filter(function(d) {
            return config.dataLayersToHide.indexOf(d.name) === -1;
        });
    }
    return dataIsValid;
};

cirrus.automatic = {};

cirrus.automatic.configuration = function(initialConfig, config) {
    if (initialConfig.type === "auto") {
        var dataLength = config.data[0].values.length;
        if (initialConfig.autoTypeThreshold && dataLength < initialConfig.autoTypeThreshold) {
            config.type = "bar";
            config.continuousXAxis = false;
            config.outerPadding = "auto";
        } else {
            config.type = "line";
            config.continuousXAxis = true;
        }
    }
    if (initialConfig.width === "auto" || !config.width) {
        config.width = config.container.node().offsetWidth;
    }
    config.chartWidth = config.width - config.margin.left - config.margin.right;
    if (initialConfig.height === "auto" || !config.height) {
        config.height = config.container.node().offsetHeight;
    }
    config.chartHeight = config.height - config.margin.top - config.margin.bottom;
    if (initialConfig.outerPadding === "auto" || config.type === "bar" || config.type === "grid") {
        var keys = cirrus.utils.extractValues(config.data, "x");
        config.outerPadding = config.chartWidth / keys[0].length / 2;
    }
    if (config.type === "line") {
        config.outerPadding = 0;
    }
    if (config.type === "grid") {
        config.gutterPercent = 0;
        config.multipleTooltip = false;
    }
    config.data.forEach(function(d, i) {
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
    shape: {},
    axes: {},
    legend: {},
    fringes: {},
    line: {},
    bar: {},
    grid: {}
};

cirrus.layout.bar.simple = function(config) {
    var previousValue = null;
    var minW = config.chartWidth;
    config.visibleData[0].values.forEach(function(d, i) {
        var key = cirrus.utils.getKey(config.scaleType, d, i);
        var diff = config.scaleX(key) - config.scaleX(previousValue);
        if (i !== 0 && diff < minW) {
            minW = diff;
        }
        previousValue = key;
    });
    minW = Math.max(minW, 1);
    return config.visibleData.map(function(d, i) {
        return d.values.map(function(dB, iB) {
            var key = cirrus.utils.getKey(config.scaleType, dB, iB);
            var gutterW = minW / 100 * config.gutterPercent;
            return {
                data: dB,
                color: d.color || config.scaleColor(dB.color),
                x: config.scaleX(key),
                y: config.chartHeight - config.scaleY(dB.y),
                width: minW - gutterW,
                height: config.scaleY(dB.y)
            };
        });
    });
};

cirrus.layout.bar.stacked = function(config) {
    var stackedScaleY = config.scaleY.copy();
    var values = cirrus.utils.extractValues(config.visibleData, "y");
    var valuesTransposed = d3.transpose(values);
    var previousValue = null;
    var minW = config.chartWidth;
    config.visibleData[0].values.forEach(function(d, i) {
        var key = cirrus.utils.getKey(config.scaleType, d, i);
        var diff = config.scaleX(key) - config.scaleX(previousValue);
        if (i !== 0 && diff < minW) {
            minW = diff;
        }
        previousValue = key;
    });
    minW = Math.max(minW, 1);
    return config.visibleData.map(function(d, i) {
        return d.values.map(function(dB, iB) {
            stackedScaleY.domain([ 0, d3.max(valuesTransposed.map(function(d, i) {
                return d3.sum(d);
            })) ]);
            var key = cirrus.utils.getKey(config.scaleType, dB, iB);
            var gutterW = minW / 100 * config.gutterPercent;
            var datum = {
                data: dB,
                color: d.color || config.scaleColor(dB.color),
                x: config.scaleX(key),
                y: config.chartHeight - stackedScaleY(d3.sum(valuesTransposed[iB].slice(0, i + 1))),
                width: minW - gutterW,
                height: stackedScaleY(dB.y)
            };
            return datum;
        });
    });
};

cirrus.layout.bar.percent = function(config) {
    var percentScaleY = config.scaleY.copy();
    var values = cirrus.utils.extractValues(config.visibleData, "y");
    var valuesTransposed = d3.transpose(values);
    var previousValue = null;
    var minW = config.chartWidth;
    config.visibleData[0].values.forEach(function(d, i) {
        var key = cirrus.utils.getKey(config.scaleType, d, i);
        var diff = config.scaleX(key) - config.scaleX(previousValue);
        if (i !== 0 && diff < minW) {
            minW = diff;
        }
        previousValue = key;
    });
    minW = Math.max(minW, 1);
    return config.visibleData.map(function(d, i) {
        return d.values.map(function(dB, iB) {
            percentScaleY.domain([ 0, d3.sum(valuesTransposed[iB]) ]);
            var key = cirrus.utils.getKey(config.scaleType, dB, iB);
            var gutterW = minW / 100 * config.gutterPercent;
            var datum = {
                data: dB,
                color: d.color || config.scaleColor(dB.color),
                x: config.scaleX(key),
                y: config.chartHeight - percentScaleY(d3.sum(valuesTransposed[iB].slice(0, i + 1))),
                width: minW - gutterW,
                height: percentScaleY(dB.y)
            };
            return datum;
        });
    });
};

cirrus.layout.line.stacked = cirrus.layout.bar.stacked;

cirrus.layout.line.area = cirrus.layout.bar.stacked;

cirrus.layout.line.simple = cirrus.layout.bar.simple;

cirrus.layout.grid.heatmap = function(config) {
    var previousValue = null;
    var minW = config.chartWidth;
    config.visibleData[0].values.forEach(function(d, i) {
        var key = cirrus.utils.getKey(config.scaleType, d, i);
        var diff = config.scaleX(key) - config.scaleX(previousValue);
        if (i !== 0 && diff < minW) {
            minW = diff;
        }
        previousValue = key;
    });
    minW = Math.max(minW, 1);
    var gridH = config.chartHeight / config.visibleData.length;
    return config.visibleData.map(function(d, i) {
        return d.values.map(function(dB, iB) {
            var key = cirrus.utils.getKey(config.scaleType, dB, iB);
            var gutterW = minW / 100 * config.gutterPercent;
            var datum = {
                data: dB,
                color: d.color || config.scaleColor(dB.color),
                x: config.scaleX(key) - minW / 2,
                y: config.chartHeight - gridH * dB.y - gridH,
                width: minW - gutterW,
                height: gridH
            };
            return datum;
        });
    });
};

cirrus.layout.grid.contour = function(config) {
    if (!Conrec) {
        console.log("Conrec.js is needed for the contour layout to work.");
        return false;
    }
    var data2 = d3.transpose(config.data.map(function(d) {
        return d.values.map(function(dB) {
            return dB.color;
        });
    }));
    var cliff = -1e3;
    data2.push(d3.range(data2[0].length).map(function() {
        return cliff;
    }));
    data2.unshift(d3.range(data2[0].length).map(function() {
        return cliff;
    }));
    data2.forEach(function(d) {
        d.push(cliff);
        d.unshift(cliff);
    });
    var layerNum = 10;
    var dataMax = d3.max(d3.merge(data2));
    var xs = d3.range(0, data2.length);
    var ys = d3.range(0, data2[0].length);
    var zs = d3.range(0, dataMax, dataMax / layerNum);
    var magicNumberA = config.chartWidth / (data2.length - 2);
    var magicNumberB = config.chartHeight / (data2[0].length - 4);
    var x = d3.scale.linear().range([ -magicNumberA, config.chartWidth + magicNumberA * 2 ]).domain([ 0, data2.length ]);
    var y = d3.scale.linear().range([ config.chartHeight + magicNumberB, -magicNumberB * 2 ]).domain([ 0, data2[0].length ]);
    var colorScale = d3.scale.linear().domain([ 0, dataMax ]).range([ "yellow", "red" ]);
    var c = new Conrec();
    c.contour(data2, 0, xs.length - 1, 0, ys.length - 1, xs, ys, zs.length, zs);
    var contourList = c.contourList();
    var contourListScaled = contourList.map(function(d) {
        return d.map(function(dB) {
            return {
                x: x(dB.x),
                y: y(dB.y),
                color: colorScale(d.level)
            };
        });
    }).sort(function(a, b) {
        var extentXA = d3.extent(a.map(function(d) {
            return d.x;
        }));
        var extentYA = d3.extent(a.map(function(d) {
            return d.y;
        }));
        var areaA = (extentXA[1] - extentXA[0]) * (extentYA[1] - extentYA[0]);
        var extentXB = d3.extent(b.map(function(d) {
            return d.x;
        }));
        var extentYB = d3.extent(b.map(function(d) {
            return d.y;
        }));
        var areaB = (extentXB[1] - extentXB[0]) * (extentYB[1] - extentYB[0]);
        return areaB - areaA;
    });
    return contourListScaled;
};

cirrus.layout.axes.line = function(config) {
    var chartBottom = config.chartHeight + config.margin.top;
    var lineThickness = 1;
    var labelAttr = {};
    labelAttr.lineXTop = chartBottom + "px";
    labelAttr.lineXLeft = config.margin.left + "px";
    labelAttr.lineXWidth = config.chartWidth + "px";
    labelAttr.lineXHeight = lineThickness + "px";
    return labelAttr;
};

cirrus.layout.axes.x = function(config) {
    var ticks = config.visibleData[0].values.map(function(d, i) {
        var key = d.x;
        if (config.scaleType === "time") {
            key = new Date(key);
        } else if (config.scaleType === "ordinal") {
            key = i;
        }
        return {
            key: d.x,
            x: config.scaleX(key),
            label: config.labelFormatterX(d.x, i) + ""
        };
    });
    var previousNotSkippedLabelWidth = 0;
    return ticks.map(function(d, i) {
        var labelAttr = {};
        labelAttr.key = d.key;
        labelAttr.x = d.x;
        labelAttr.label = i % config.axisXTickSkip ? "" : d.label;
        var fontSize = 8;
        var labelWidth = labelAttr.label.length * fontSize;
        var chartBottom = config.chartHeight + config.margin.top;
        labelAttr["transform-origin"] = "0%";
        if (config.axisXAngle < 0) {
            labelAttr.left = config.margin.left + labelAttr.x + "px";
            labelAttr.transform = "rotate(" + config.axisXAngle + "deg)";
        } else if (config.axisXAngle > 0) {
            labelAttr.left = config.margin.left + labelAttr.x + "px";
            labelAttr.transform = "rotate(" + config.axisXAngle + "deg)";
        } else {
            labelAttr.left = config.margin.left + labelAttr.x + "px";
            labelAttr.transform = "rotate(0deg)";
        }
        var isSkipped = false;
        if (config.axisXTickSkip === "auto") {
            if (d.x >= previousNotSkippedLabelWidth) {
                previousNotSkippedLabelWidth = d.x + labelWidth;
            } else {
                isSkipped = true;
            }
        }
        labelAttr.skipped = isSkipped || !!(i % config.axisXTickSkip);
        labelAttr.top = chartBottom + config.tickSize + "px";
        var tickW = 1;
        labelAttr.tickTop = chartBottom + "px";
        labelAttr.tickLeft = config.margin.left + labelAttr.x - tickW / 2 + "px";
        labelAttr.tickWidth = tickW + "px";
        labelAttr.tickHeight = (i % config.axisXTickSkip ? config.minorTickSize : config.tickSize) + "px";
        var lineW = 1;
        labelAttr.gridTop = config.margin.top + "px";
        labelAttr.gridLeft = config.margin.left + labelAttr.x - lineW / 2 + "px";
        labelAttr.gridWidth = lineW + "px";
        labelAttr.gridHeight = (i % config.axisXTickSkip ? 0 : config.chartHeight) + "px";
        return labelAttr;
    });
};

cirrus.layout.axes.y = function(config) {
    var scaleY = config.scaleY.copy();
    var percentScaleY = config.scaleY.copy();
    var stackedScaleY = config.scaleY.copy();
    var values = cirrus.utils.extractValues(config.visibleData, "y");
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
            label: config.labelFormatterY(value),
            stackedLabel: i * stackedDomainMax / (config.tickYCount - 1),
            labelY: scaleY(value)
        };
    });
};

cirrus.layout.legend = function(config) {
    return config.data.map(function(d, i) {
        return {
            name: d.name,
            color: d.color
        };
    });
};

cirrus.attribute = {
    axis: {}
};

cirrus.attribute.axis.labelX = function(config) {
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

cirrus.attribute.axis.tickX = function(config) {
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

cirrus.attribute.axis.gridX = function(config) {
    var lineW = 1;
    return {
        top: config.margin.top + "px",
        left: function(d, i) {
            return config.margin.left + d.x - lineW / 2 - this.offsetWidth + "px";
        },
        width: lineW + "px",
        height: function(d, i) {
            return (i % config.axisXTickSkip ? 0 : config.chartHeight) + "px";
        }
    };
};

cirrus.attribute.axis.fringeX = function(config) {
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

cirrus.attribute.axis.labelY = function(config) {
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

cirrus.attribute.axis.tickY = function(config) {
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

cirrus.attribute.axis.gridY = function(config) {
    var lineH = 1;
    return {
        width: config.chartWidth + "px",
        height: lineH + "px",
        position: "absolute",
        left: config.margin.left + "px",
        top: function(d, i) {
            return config.margin.top + d.labelY + "px";
        }
    };
};

cirrus.attribute.axis.fringeY = function(config) {
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

cirrus.interaction.hovering = function(config) {
    var hoveringContainer = config.container.select(".hovering").style({
        width: config.chartWidth + "px",
        height: config.chartHeight + "px",
        position: "absolute",
        opacity: 0
    });
    if (!!hoveringContainer.on("mousemove")) {
        return false;
    }
    if (config.subtype === "contour") {
        return false;
    }
    hoveringContainer.on("mousemove", function() {
        var mouse = d3.mouse(this);
        var x = config.shapeLayout[0].map(function(d, i) {
            return d.x;
        });
        var y = config.shapeLayout[0].map(function(d, i) {
            return d.y;
        });
        var mouseOffsetX = config.shapeLayout[0][0].width / 2;
        var idxUnderMouse = d3.bisect(x, mouse[0] - mouseOffsetX);
        idxUnderMouse = Math.min(idxUnderMouse, x.length - 1);
        var hoverData = {
            mouse: mouse,
            x: x,
            idx: idxUnderMouse
        };
        setHovering(hoverData);
        config.events.hover(hoverData);
    }).on("mouseenter", function() {
        hoveringContainer.style({
            opacity: 1
        });
    }).on("mouseout", function() {
        hoveringContainer.style({
            opacity: 0
        });
        config.events.hoverOut();
    });
    var hoverLine = cirrus.interaction.hoverLine(config);
    var tooltip = cirrus.interaction.tooltip(config);
    config.internalEvents.on("setHover", function(hoverData) {
        setHovering(hoverData);
    });
    config.internalEvents.on("hideHover", function() {
        hoveringContainer.style({
            opacity: 0
        });
    });
    var setHovering = function(hoverData) {
        var tooltipsData = config.shapeLayout.map(function(d, i) {
            return d[hoverData.idx];
        });
        var y = tooltipsData.map(function(d) {
            return d.y;
        });
        y.sort(function(a, b) {
            return a - b;
        });
        var idxY = d3.bisectRight(y, hoverData.mouse[1]);
        idxY = Math.min(y.length - idxY, y.length - 1);
        if (!config.multipleTooltip) {
            tooltipsData = [ tooltipsData[idxY] ];
        }
        var dataUnderMouse = config.shapeLayout[idxY][hoverData.idx];
        hoveringContainer.style({
            opacity: 1
        });
        hoverLine(dataUnderMouse);
        tooltip(tooltipsData);
    };
};

cirrus.interaction.tooltip = function(config) {
    return function(tooltipsData) {
        var hoveringContainer = config.container.select(".hovering");
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
                return d.y + "px";
            },
            "background-color": function(d, i) {
                return d.color;
            }
        });
        tooltip.exit().remove();
    };
};

cirrus.interaction.hoverLine = function(config) {
    var hoverLine = config.container.select(".hovering").append("div").attr({
        "class": "hover-line"
    }).style({
        position: "absolute",
        width: "1px",
        height: config.chartHeight + "px",
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

cirrus.scale.x = function(config) {
    var keys = cirrus.utils.extractValues(config.visibleData, "x");
    var allKeys = d3.merge(keys);
    var range = [ config.outerPadding, config.chartWidth - config.outerPadding ];
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

cirrus.scale.y = function(config) {
    var values = d3.merge(cirrus.utils.extractValues(config.visibleData, "y"));
    return d3.scale.linear().range([ 0, config.chartHeight ]).domain([ 0, d3.max(values) ]);
};

cirrus.scale.color = function(config) {
    var values = d3.merge(cirrus.utils.extractValues(config.visibleData, "color"));
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
    svgRenderer.polygon = function(options) {
        svg.append("path").attr({
            d: "M" + options.points.join("L"),
            fill: options.fill || "silver",
            stroke: options.stroke || "silver"
        });
        return this;
    };
    svgRenderer.rect = function(options) {
        path = svg.append("rect").attr(options.attributes).attr({
            fill: options.fill || "silver",
            stroke: options.stroke || "silver"
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
    canvasRenderer.polygon = function(options) {
        var fill = options.fill;
        if (options.fill === "none" || !options.fill) {
            fill = "transparent";
        }
        ctx.fillStyle = fill;
        ctx.strokeStyle = options.stroke;
        ctx.beginPath();
        options.points.forEach(function(d, i) {
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
    canvasRenderer.rect = function(options) {
        ctx.fillStyle = options.fill;
        ctx.strokeStyle = options.stroke;
        ctx.fillRect(options.attributes.x, options.attributes.y, options.attributes.width, options.attributes.height);
        return this;
    };
    canvasRenderer.circle = function(options) {
        ctx.fillStyle = options.fill;
        ctx.strokeStyle = options.stroke;
        context.beginPath();
        context.arc(options.x, options.y, options.r, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();
        return this;
    };
    return canvasRenderer;
};

cirrus.component = {};

cirrus.component.chart = function(config) {
    var chartContainer = config.container.select(".chart").style({
        position: "absolute",
        width: config.width + "px",
        height: config.height + "px"
    });
    var panelContainer = chartContainer.select(".panel").style({
        position: "absolute",
        left: config.margin.left + "px",
        top: config.margin.top + "px",
        width: config.chartWidth + "px",
        height: config.chartHeight + "px"
    });
    var shapeContainer = chartContainer.select(".shape").style({
        position: "absolute",
        width: config.chartWidth + "px",
        height: config.chartHeight + "px"
    });
};

cirrus.component.shapes = function(config) {
    var shapeAttr = config.shapeLayout;
    var shapeContainer = config.container.select(".shape");
    shapeContainer.html("");
    var renderer = cirrus.renderer[config.renderer](shapeContainer.node());
    if (config.type === "line" && config.subtype === "area") {
        shapeAttr.forEach(function(d, i) {
            var previousAttributes = null;
            var strokeColor = d[0].color;
            var fillColor = "transparent";
            if (i === 0) {
                previousAttributes = JSON.parse(JSON.stringify(d)).map(function(d) {
                    d.y = config.chartHeight;
                    return d;
                });
            } else {
                previousAttributes = JSON.parse(JSON.stringify(shapeAttr[i - 1]));
            }
            var points = d.concat(previousAttributes.reverse()).map(function(d) {
                return [ d.x, d.y ];
            });
            renderer.polygon({
                points: points,
                fill: strokeColor,
                stroke: fillColor
            });
        });
    } else if (config.type === "line") {
        shapeAttr.forEach(function(d, i) {
            var points = d.map(function(d) {
                return [ d.x, d.y ];
            });
            var strokeColor = "transparent";
            var fillColor = d[0].color;
            renderer.polygon({
                points: points,
                fill: strokeColor,
                stroke: fillColor
            });
        });
    } else if (config.type === "grid" && config.subtype === "heatmap") {
        shapeAttr.forEach(function(d, i) {
            d.forEach(function(dB, iB) {
                renderer.rect({
                    attributes: dB,
                    fill: dB.color,
                    stroke: dB.color
                });
            });
        });
    } else if (config.type === "grid" && config.subtype === "contour") {
        shapeAttr.forEach(function(d, i) {
            var points = d.map(function(d) {
                return [ d.x, d.y ];
            });
            renderer.polygon({
                points: points,
                fill: d[0].color,
                stroke: d[0].color
            });
        });
    } else {
        shapeAttr.forEach(function(d, i) {
            d.forEach(function(dB, iB) {
                renderer.rect({
                    attributes: dB,
                    fill: dB.color,
                    stroke: dB.color
                });
            });
        });
    }
    return this;
};

cirrus.component.title = function(config) {
    if (config.chartTitle) {
        config.container.select(".title").html(config.chartTitle).style({
            width: "100%",
            "text-align": "center"
        });
    }
    if (config.axisXTitle) {
        config.container.select(".axis-title-x").html(config.axisXTitle).style({
            top: function() {
                return config.height - this.offsetHeight + "px";
            },
            position: "absolute",
            width: "100%",
            "text-align": "center"
        });
    }
    if (config.axisYTitle) {
        config.container.select(".axis-title-y").html(config.axisYTitle).style({
            transform: "rotate(-90deg) translate(-" + config.height / 2 + "px)",
            "transform-origin": "0 0"
        });
    }
};

cirrus.component.axisX = function(config) {
    if (!config.showXAxis) {
        return;
    }
    config.axisXPositionLayout = function() {
        return {
            width: config.chartWidth + "px",
            height: config.margin.bottom + "px",
            position: "absolute"
        };
    };
    var axisLines = cirrus.layout.axes.line(config);
    var axisXContainer = config.container.select(".axis-x");
    axisXContainer.append("div").classed("axis-x-line", true).style({
        position: "absolute",
        "background-color": "black"
    }).style({
        top: axisLines.lineXTop,
        left: axisLines.lineXLeft,
        width: axisLines.lineXWidth,
        height: axisLines.lineXHeight
    });
    config.axesLayout.x.forEach(function(d) {
        axisXContainer.append("div").classed("label", true).style({
            position: "absolute"
        }).style({
            top: d.top,
            left: d.left,
            "transform-origin": d["transform-origin"],
            transform: d.transform,
            display: d.skipped ? "none" : "block"
        }).html(d.label);
    });
    if (config.showXGrid) {
        config.axesLayout.x.forEach(function(d) {
            axisXContainer.append("div").classed("grid-line-x", true).style({
                position: "absolute",
                "background-color": "black"
            }).style({
                top: d.gridTop,
                left: d.gridLeft,
                width: d.gridWidth,
                height: d.gridHeight,
                display: d.skipped ? "none" : "block"
            });
        });
    }
    config.axesLayout.x.forEach(function(d) {
        axisXContainer.append("div").classed("tick", true).style({
            position: "absolute",
            "background-color": "black"
        }).style({
            top: d.tickTop,
            left: d.tickLeft,
            width: d.tickWidth,
            height: d.tickHeight,
            display: d.skipped ? "none" : "block"
        });
    });
};

cirrus.component.axisY = function(config) {
    if (!config.showYAxis) {
        return;
    }
    var axisYContainer = config.container.select(".axis-y").style({
        width: config.margin.left + "px",
        height: config.chartHeight + "px",
        position: "absolute",
        top: config.margin.top + "px",
        left: 0 + "px",
        "border-right": "1px solid black"
    });
    if (config.showYGrid) {
        var gridX = config.container.select(".grid-y").selectAll("div.grid-line-y").data(config.axesLayout.y);
        gridX.enter().append("div").classed("grid-line-y", true).style({
            position: "absolute"
        }).style({
            "background-color": "#eee"
        });
        gridX.style(cirrus.attribute.axis.gridY(config));
        gridX.exit().remove();
    }
    var labelsY = axisYContainer.selectAll("div.label").data(config.axesLayout.y);
    labelsY.enter().append("div").classed("label", true);
    labelsY.html(function(d, i) {
        if (config.subtype === "simple" || config.subtype === "grid" || config.subtype === "area") {
            return d.label;
        } else {
            return d.stackedLabel;
        }
    }).style(cirrus.attribute.axis.labelY(config));
    labelsY.exit().remove();
    var ticksY = axisYContainer.selectAll("div.tick").data(config.axesLayout.y);
    ticksY.enter().append("div").classed("tick", true).style({
        "background-color": "black"
    });
    ticksY.style(cirrus.attribute.axis.tickY(config));
    ticksY.exit().remove();
};

cirrus.component.legend = function(config) {
    if (!config.showLegend) {
        return this;
    }
    var legend = config.container.select(".legend").style({
        position: "absolute"
    });
    var legendItems = legend.selectAll("p.legend-item").data(config.legendLayout);
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
            config.events.legendClick(toHide);
            config.internalEvents.legendClick(toHide);
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
    define(cirrus);
} else if (typeof module === "object" && module.exports) {
    var d3 = require("d3");
    module.exports = cirrus;
}