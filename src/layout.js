dadavis.layout = {
    data: {},
    axes: {}
};

dadavis.layout.data = function(config, cache){

    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();
    var paddedScaleX = cache.scaleX.copy();

    return cache.data.map(function(d, i){

        var val = d.values;
        paddedScaleX.domain([0, val.length]);
        cache.scaleX.domain([0, val.length - 1]);
        cache.scaleY.domain([0, d3.max(val)]);

        var transposed = d3.transpose(cache.data.map(function(d, i){
            return d.values;
        }));

        var previous = null;
        return val.map(function(dB, iB){

            percentScaleY.domain([0, d3.sum(transposed[iB])]);
            stackedScaleY.domain([0, d3.max(transposed.map(function(d, i){
                return d3.sum(d);
            }))]);

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

dadavis.layout.axes = function(config, cache){
    var scaleY = cache.scaleY.copy();
    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();

    var transposed = d3.transpose(cache.data.map(function(d){
        return d.values;
    }));

    var domainMax = d3.max(cache.data.map(function(d){
        return d3.max(d.values);
    }));
    scaleY.domain([domainMax, 0]);

    var stackedDomainMax = d3.max(transposed.map(function(d){
        return d3.sum(d);
    }));
    stackedScaleY.domain([stackedDomainMax, 0]);

    var percentDomainMax = d3.max(transposed.map(function(d){
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
