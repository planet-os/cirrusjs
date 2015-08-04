cirrus.layout = {
    data: {},
    axes: {},
    fringes: {}
};

cirrus.layout.shape = function(config, _config){

    var percentScaleY = _config.scaleY.copy();
    var stackedScaleY = _config.scaleY.copy();

    var values = cirrus.utils.extractValues(_config.visibleData, 'y');
    var valuesTransposed = d3.transpose(values);

    var previousValue = null;
    var minW = _config.chartWidth;
    _config.visibleData[0].values.forEach(function(d, i){

        var value = d.x;
        if(config.scaleType === 'time'){
            value = new Date(value);
        }
        else if(config.scaleType === 'ordinal'){
            value = i;
        }

        var diff = _config.scaleX(value) - _config.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = value;
    });
    minW = Math.max(minW, 1);

    var gridH = _config.chartHeight / _config.visibleData.length;

    return _config.visibleData.map(function(d, i){

        var previous = null;
        return d.values.map(function(dB, iB){

            percentScaleY.domain([0, d3.sum(valuesTransposed[iB])]);
            stackedScaleY.domain([0, d3.max(valuesTransposed.map(function(d, i){
                return d3.sum(d);
            }))]);

            var key = dB.x;
            if(config.scaleType === 'time'){
                key = new Date(key);
            }
            else if(config.scaleType === 'ordinal'){
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

cirrus.layout.contour = function(config, _config){
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

    var layerNum = 15;
    var xs = d3.range(0, data2.length);
    var ys = d3.range(0, data2[0].length);
    var zs = d3.range(0, 255, 255 / layerNum);

    // This seems wrong...
    var magicNumberA = _config.chartWidth / (data2.length-2);
    var magicNumberB = _config.chartHeight / (data2[0].length-4);
    var x = d3.scale.linear().range([-magicNumberA, _config.chartWidth + magicNumberA*2]).domain([0, data2.length]);
    var y = d3.scale.linear().range([_config.chartHeight + magicNumberB, -magicNumberB*2]).domain([0, data2[0].length]);

    var colorScale = d3.scale.linear().domain([0, 255]).range(["yellow", "red"]);
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
            var testX = d3.extent(a.map(function(d){ return d.x; }));
            var testY = d3.extent(a.map(function(d){ return d.y; }));
            var areaA = (testX[1] - testX[0]) * (testY[1] - testY[0]);
            var testX = d3.extent(b.map(function(d){ return d.x; }));
            var testY = d3.extent(b.map(function(d){ return d.y; }));
            var areaB = (testX[1] - testX[0]) * (testY[1] - testY[0]);
            return areaB - areaA;
        });

    return contourListScaled;
};
