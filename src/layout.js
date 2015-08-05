cirrus.layout = {
    shape: {},
    axes: {},
    legend: {},
    fringes: {},
    line: {},
    bar: {},
    grid: {}
};

cirrus.layout.bar.simple = function(config, _config){
    var previousValue = null;
    var minW = _config.chartWidth;
    _config.visibleData[0].values.forEach(function(d, i){
        var key = cirrus.utils.getKey(config.scaleType, d, i);

        var diff = _config.scaleX(key) - _config.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = key;
    });
    minW = Math.max(minW, 1);

    return _config.visibleData.map(function(d, i){

        return d.values.map(function(dB, iB){
            var key = cirrus.utils.getKey(config.scaleType, dB, iB);
            var gutterW = minW / 100 * _config.gutterPercent;

            return {
                data: dB,
                color: d.color || _config.scaleColor(dB.color),
                x: _config.scaleX(key),
                y: _config.chartHeight - _config.scaleY(dB.y),
                width: minW - gutterW,
                height: _config.scaleY(dB.y)
            };
        });
    });
};

cirrus.layout.bar.stacked = function(config, _config){
    var stackedScaleY = _config.scaleY.copy();

    var values = cirrus.utils.extractValues(_config.visibleData, 'y');
    var valuesTransposed = d3.transpose(values);

    var previousValue = null;
    var minW = _config.chartWidth;
    _config.visibleData[0].values.forEach(function(d, i){
        var key = cirrus.utils.getKey(config.scaleType, d, i);

        var diff = _config.scaleX(key) - _config.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = key;
    });
    minW = Math.max(minW, 1);

    return _config.visibleData.map(function(d, i){

            return d.values.map(function(dB, iB){
                stackedScaleY.domain([0, d3.max(valuesTransposed.map(function(d, i){
                    return d3.sum(d);
                }))]);

                var key = cirrus.utils.getKey(config.scaleType, dB, iB);

                var gutterW = minW / 100 * _config.gutterPercent;

                var datum = {
                    data: dB,
                    color: d.color || _config.scaleColor(dB.color),
                    x: _config.scaleX(key),
                    y: _config.chartHeight - stackedScaleY(d3.sum(valuesTransposed[iB].slice(0, i + 1))),
                    width: minW - gutterW,
                    height: stackedScaleY(dB.y)
                };

                return datum;
            });

        });
};

cirrus.layout.bar.percent = function(config, _config){
    var percentScaleY = _config.scaleY.copy();

    var values = cirrus.utils.extractValues(_config.visibleData, 'y');
    var valuesTransposed = d3.transpose(values);

    var previousValue = null;
    var minW = _config.chartWidth;
    _config.visibleData[0].values.forEach(function(d, i){
        var key = cirrus.utils.getKey(config.scaleType, d, i);

        var diff = _config.scaleX(key) - _config.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = key;
    });
    minW = Math.max(minW, 1);

    return _config.visibleData.map(function(d, i){

        return d.values.map(function(dB, iB){
            percentScaleY.domain([0, d3.sum(valuesTransposed[iB])]);

            var key = cirrus.utils.getKey(config.scaleType, dB, iB);

            var gutterW = minW / 100 * _config.gutterPercent;

            var datum = {
                data: dB,
                color: d.color || _config.scaleColor(dB.color),
                x: _config.scaleX(key),
                y: _config.chartHeight - percentScaleY(d3.sum(valuesTransposed[iB].slice(0, i + 1))),
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

cirrus.layout.grid.heatmap = function(config, _config){
    var previousValue = null;
    var minW = _config.chartWidth;
    _config.visibleData[0].values.forEach(function(d, i){
        var key = cirrus.utils.getKey(config.scaleType, d, i);

        var diff = _config.scaleX(key) - _config.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = key;
    });
    minW = Math.max(minW, 1);

    var gridH = _config.chartHeight / _config.visibleData.length;

    return _config.visibleData.map(function(d, i){

        return d.values.map(function(dB, iB){

            var key = cirrus.utils.getKey(config.scaleType, dB, iB);

            var gutterW = minW / 100 * _config.gutterPercent;

            var datum = {
                data: dB,
                color: d.color || _config.scaleColor(dB.color),
                x: _config.scaleX(key) - minW / 2,
                y: _config.chartHeight - gridH * dB.y - gridH,
                width: minW - gutterW,
                height: gridH
            };

            return datum;
        });

    });
};

cirrus.layout.grid.contour = function(config, _config){
        if(!Conrec){
            console.log('Conrec.js is needed for the contour layout to work.');
            return false;
        }

        var data2 = d3.transpose(_config.data.map(function(d){
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
        var magicNumberA = _config.chartWidth / (data2.length-2);
        var magicNumberB = _config.chartHeight / (data2[0].length-4);
        var x = d3.scale.linear().range([-magicNumberA, _config.chartWidth + magicNumberA*2]).domain([0, data2.length]);
        var y = d3.scale.linear().range([_config.chartHeight + magicNumberB, -magicNumberB*2]).domain([0, data2[0].length]);

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

cirrus.layout.axes.x = function(config, _config){
    var scaleX = _config.scaleX.copy();

    if(_config.continuousXAxis){

        return scaleX.ticks().map(function(d, i){
            return {
                key: d,
                x: scaleX(d)
            };
        });
    }
    else{
        return _config.visibleData[0].values.map(function(d, i){

            var key = d.x;
            if(config.scaleType === 'time'){
                key = new Date(key);
            }
            else if(config.scaleType === 'ordinal'){
                key = i;
            }

            return {
                key: d.x,
                x: scaleX(key)
            };
        });
    }
};

cirrus.layout.axes.y = function(config, _config){
    var scaleY = _config.scaleY.copy();
    var percentScaleY = _config.scaleY.copy();
    var stackedScaleY = _config.scaleY.copy();

    var values = cirrus.utils.extractValues(_config.visibleData, 'y');
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
            label: value,
            stackedLabel: i * stackedDomainMax / (config.tickYCount - 1),
            labelY: scaleY(value)
        };
    });
};

cirrus.layout.legend = function(config, _config){

    return _config.data.map(function(d, i){
        return {name: d.name, color: d.color};
    });
};

cirrus.layout.fringes.y = function(config, _config){

    //TODO

    //return _config.shapeLayout.map(function(d, i){
    //
    //});
};
