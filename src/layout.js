dadavis.layout = {
    data: {},
    axes: {}
};

dadavis.layout.data = function(config, cache){

    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();

    var values = dadavis.utils.extractValues(cache.data, config.keyY);
    var valuesTransposed = d3.transpose(values);
    var firstPoint = cache.data[0].values[0][config.keyX];
    var secondPoint = cache.data[0].values[1][config.keyX];

    return cache.data.map(function(d, i){

        var previous = null;
        return d.values.map(function(dB, iB){

            percentScaleY.domain([0, d3.sum(valuesTransposed[iB])]);
            stackedScaleY.domain([0, d3.max(valuesTransposed.map(function(d, i){
                return d3.sum(d);
            }))]);

            var w = null;
            var key = dB[config.keyX];
            if(config.scaleType === 'time'){
                key = new Date(key);
                w = cache.scaleX(new Date(secondPoint)) - cache.scaleX(new Date(firstPoint));
            }
            else if(config.scaleType === 'ordinal'){
                w = cache.scaleX(1) - cache.scaleX(0);
                key = iB;
            }
            else{
                w = cache.scaleX(secondPoint) - cache.scaleX(firstPoint);
            }

            var value = dB[config.keyY];

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
                w: w,
                h: cache.scaleY(value),
                stackedPercentH: percentScaleY(value),
                stackedH: stackedScaleY(value),
                layerCount: cache.data.length,
                layerIndex: i,
                centerX: cache.scaleX(key) + w / 2
            };

            datum.previous = previous || datum;
            previous = datum;
            return datum;
        });

    });
};

dadavis.layout.axes = function(config, cache){
    var scaleY = cache.scaleY.copy();
    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();

    var values = dadavis.utils.extractValues(cache.data, config.keyY);
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
