cirrus.layout = {
    shape: {},
    axes: {},
    legend: {},
    fringes: {},
    line: {},
    bar: {},
    grid: {}
};

cirrus.layout.bar.simple = function(config){
    var previousValue = null;
    var minW = config.chartWidth;
    config.visibleData[0].values.forEach(function(d, i){
        var key = cirrus.utils.getKey(config.scaleType, d, i);

        var diff = config.scaleX(key) - config.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = key;
    });
    minW = Math.max(minW, 1);

    return config.visibleData.map(function(d, i){

        return d.values.map(function(dB, iB){
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

cirrus.layout.bar.stacked = function(config){
    var stackedScaleY = config.scaleY.copy();

    var values = cirrus.utils.extractValues(config.visibleData, 'y');
    var valuesTransposed = d3.transpose(values);

    var previousValue = null;
    var minW = config.chartWidth;
    config.visibleData[0].values.forEach(function(d, i){
        var key = cirrus.utils.getKey(config.scaleType, d, i);

        var diff = config.scaleX(key) - config.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = key;
    });
    minW = Math.max(minW, 1);

    return config.visibleData.map(function(d, i){

            return d.values.map(function(dB, iB){
                stackedScaleY.domain([0, d3.max(valuesTransposed.map(function(d, i){
                    return d3.sum(d);
                }))]);

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

cirrus.layout.bar.percent = function(config){
    var percentScaleY = config.scaleY.copy();

    var values = cirrus.utils.extractValues(config.visibleData, 'y');
    var valuesTransposed = d3.transpose(values);

    var previousValue = null;
    var minW = config.chartWidth;
    config.visibleData[0].values.forEach(function(d, i){
        var key = cirrus.utils.getKey(config.scaleType, d, i);

        var diff = config.scaleX(key) - config.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = key;
    });
    minW = Math.max(minW, 1);

    return config.visibleData.map(function(d, i){

        return d.values.map(function(dB, iB){
            percentScaleY.domain([0, d3.sum(valuesTransposed[iB])]);

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

cirrus.layout.grid.heatmap = function(config){
    var previousValue = null;
    var minW = config.chartWidth;
    config.visibleData[0].values.forEach(function(d, i){
        var key = cirrus.utils.getKey(config.scaleType, d, i);

        var diff = config.scaleX(key) - config.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = key;
    });
    minW = Math.max(minW, 1);

    var gridH = config.chartHeight / config.visibleData.length;

    return config.visibleData.map(function(d, i){

        return d.values.map(function(dB, iB){

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

cirrus.layout.grid.contour = function(config){
    if(!Conrec){
        console.log('Conrec.js is needed for the contour layout to work.');
        return false;
    }

    var data2 = d3.transpose(config.data.map(function(d){
        return d.values.map(function(dB){
            return dB.color;
        });
    }));

    var cliff = -1000;
    data2.push(d3.range(data2[0].length).map(function() { return cliff; }));
    data2.unshift(d3.range(data2[0].length).map(function() { return cliff; }));
    data2.forEach(function(d) {
        d.push(cliff);
        d.unshift(cliff);
    });

    var layerNum = 10;
    var dataMax = d3.max(d3.merge(data2));
    var xs = d3.range(0, data2.length);
    var ys = d3.range(0, data2[0].length);
    var zs = d3.range(0, dataMax, dataMax / layerNum);

    // This seems wrong...
    var magicNumberA = config.chartWidth / (data2.length-2);
    var magicNumberB = config.chartHeight / (data2[0].length-4);
    var x = d3.scale.linear().range([-magicNumberA, config.chartWidth + magicNumberA*2]).domain([0, data2.length]);
    var y = d3.scale.linear().range([config.chartHeight + magicNumberB, -magicNumberB*2]).domain([0, data2[0].length]);

    var colorScale = d3.scale.linear().domain([0, dataMax]).range(["yellow", "red"]);
    var c = new Conrec;
    c.contour(data2, 0, xs.length - 1, 0, ys.length - 1, xs, ys, zs.length, zs);

    var contourList = c.contourList();

    var contourListScaled = contourList
        .map(function(d){
            return d.map(function(dB){
                return {x: x(dB.x), y: y(dB.y), color: colorScale(d.level)};
            });
        })
        .sort(function(a, b){
            var extentXA = d3.extent(a.map(function(d){ return d.x; }));
            var extentYA = d3.extent(a.map(function(d){ return d.y; }));
            var areaA = (extentXA[1] - extentXA[0]) * (extentYA[1] - extentYA[0]);
            var extentXB = d3.extent(b.map(function(d){ return d.x; }));
            var extentYB = d3.extent(b.map(function(d){ return d.y; }));
            var areaB = (extentXB[1] - extentXB[0]) * (extentYB[1] - extentYB[0]);
            return areaB - areaA;
        });

    return contourListScaled;
};

cirrus.layout.axes.line = function(config){
    var chartBottom = config.chartHeight + config.margin.top;
    var lineThickness = 1;
    var labelAttr = {};
    labelAttr.lineXTop = chartBottom + 'px';
    labelAttr.lineXLeft = config.margin.left + 'px';
    labelAttr.lineXWidth = config.chartWidth + 'px';
    labelAttr.lineXHeight = lineThickness + 'px';
    return labelAttr;
};

cirrus.layout.axes.x = function(config){
    var ticks = config.visibleData[0].values.map(function(d, i){

        var key = d.x;
        if(config.scaleType === 'time'){
            key = new Date(key);
        }
        else if(config.scaleType === 'ordinal'){
            key = i;
        }

        return {
            key: d.x,
            x: config.scaleX(key),
            label: config.labelFormatterX(d.x, i) + ''
        };
    });

    var previousNotSkippedLabelWidth = 0;
    return ticks.map(function(d, i){

        var labelAttr = {};
        labelAttr.key = d.key;
        labelAttr.x = d.x;
        labelAttr.label = (i % config.axisXTickSkip) ? '' : d.label;

        var fontSize = 8;
        var labelWidth = labelAttr.label.length * fontSize;
        var chartBottom = config.chartHeight + config.margin.top;

        labelAttr['transform-origin'] = '0%';

        if(config.axisXAngle < 0){
            //labelAttr.left = config.margin.left + labelAttr.x - labelWidth + 'px';
            labelAttr.left = config.margin.left + labelAttr.x + 'px';
            labelAttr.transform = 'rotate(' + config.axisXAngle + 'deg)';
        }
        else if(config.axisXAngle > 0){
            labelAttr.left = config.margin.left + labelAttr.x + 'px';
            labelAttr.transform ='rotate(' + config.axisXAngle + 'deg)';
        }
        else{
            //labelAttr.left = config.margin.left + labelAttr.x - labelWidth / 2 + 'px';
            labelAttr.left = config.margin.left + labelAttr.x + 'px';
            labelAttr.transform = 'rotate(0deg)';
        }

        var isSkipped = false;
        if(config.axisXTickSkip === 'auto'){
            if(d.x >= previousNotSkippedLabelWidth){
                previousNotSkippedLabelWidth = d.x + labelWidth;
            }
            else{
                isSkipped = true;
            }
        }

        labelAttr.skipped = (isSkipped || !!(i % config.axisXTickSkip));
        labelAttr.top = chartBottom + config.tickSize + 'px';

        var tickW = 1;
        labelAttr.tickTop = chartBottom + 'px';
        labelAttr.tickLeft = config.margin.left + labelAttr.x - tickW / 2+ 'px';
        labelAttr.tickWidth = tickW + 'px';
        labelAttr.tickHeight = ((i % config.axisXTickSkip) ? config.minorTickSize : config.tickSize) + 'px';

        var lineW = 1;
        labelAttr.gridTop = config.margin.top + 'px';
        labelAttr.gridLeft = config.margin.left + labelAttr.x - lineW / 2 + 'px';
        labelAttr.gridWidth = lineW + 'px';
        labelAttr.gridHeight = ((i % config.axisXTickSkip) ? 0 : config.chartHeight) + 'px';

        return labelAttr;
    });
};

cirrus.layout.axes.y = function(config){
    var scaleY = config.scaleY.copy();
    var percentScaleY = config.scaleY.copy();
    var stackedScaleY = config.scaleY.copy();

    var values = cirrus.utils.extractValues(config.visibleData, 'y');
    var valuesTransposed = d3.transpose(values);

    var domainMax = d3.max(d3.merge(values));
    scaleY.domain([domainMax, 0]);

    var stackedDomainMax = d3.max(valuesTransposed.map(function(d){
        return d3.sum(d);
    }));
    stackedScaleY.domain([stackedDomainMax, 0]);

    var percentDomainMax = d3.max(valuesTransposed.map(function(d){
        return d3.sum(d);
    }));
    percentScaleY.domain([percentDomainMax, 0]);

    return d3.range(config.tickYCount).map(function(d, i){
        var value = i * domainMax / (config.tickYCount - 1);
        return {
            label: config.labelFormatterY(value),
            stackedLabel: i * stackedDomainMax / (config.tickYCount - 1),
            labelY: scaleY(value)
        };
    });
};

cirrus.layout.legend = function(config){

    return config.data.map(function(d, i){
        return {name: d.name, color: d.color};
    });
};