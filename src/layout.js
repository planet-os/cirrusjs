dadavis.layout = {
    data: {},
    axes: {},
    fringes: {}
};

dadavis.layout.data = function(config, cache){

    cache.visibleData = cache.data.filter(function(d){
        return cache.dataLayersToHide.indexOf(d.name) === -1;
    });

    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();

    var values = dadavis.utils.extractValues(cache.visibleData, config.keyY);
    var valuesTransposed = d3.transpose(values);

    var previousValue = null;
    var minW = cache.chartWidth;
    cache.visibleData[0].values.forEach(function(d, i){

        var value = d[config.keyX];
        if(config.scaleType === 'time'){
            value = new Date(value);
        }
        else if(config.scaleType === 'ordinal'){
            value = i;
        }

        var diff = cache.scaleX(value) - cache.scaleX(previousValue);
        if(i !== 0 && diff < minW){
            minW = diff;
        }

        previousValue = value;
    });
    minW = Math.max(minW, 1);

    return cache.visibleData.map(function(d, i){

        var previous = null;
        return d.values.map(function(dB, iB){

            percentScaleY.domain([0, d3.sum(valuesTransposed[iB])]);
            stackedScaleY.domain([0, d3.max(valuesTransposed.map(function(d, i){
                return d3.sum(d);
            }))]);

            var key = dB[config.keyX];
            if(config.scaleType === 'time'){
                key = new Date(key);
            }
            else if(config.scaleType === 'ordinal'){
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

dadavis.layout.axes.x = function(config, cache){
    var scaleX = cache.scaleX.copy();

    if(config.continuousXAxis){

        return scaleX.ticks().map(function(d, i){
            return {
                key: d,
                x: scaleX(d)
            };
        });
    }
    else{
        return cache.visibleData[0].values.map(function(d, i){

            var key = d[config.keyX];
            if(config.scaleType === 'time'){
                key = new Date(key);
            }
            else if(config.scaleType === 'ordinal'){
                key = i;
            }

            return {
                key: d[config.keyX],
                x: scaleX(key)
            };
        });
    }
};

dadavis.layout.axes.y = function(config, cache){
    var scaleY = cache.scaleY.copy();
    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();

    var values = dadavis.utils.extractValues(cache.visibleData, config.keyY);
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

dadavis.layout.legend = function(config, cache){

    return cache.data.map(function(d, i){
        return {name: d.name, color: d.color};
    });
};

dadavis.layout.fringes.y = function(config, cache){

    //TODO

    //return cache.layout.map(function(d, i){
    //
    //});
};
