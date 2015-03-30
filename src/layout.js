dadavis.getLayout = function(config, cache){

    var percentScaleY = cache.scaleY.copy();
    var stackedScaleY = cache.scaleY.copy();

    return cache.data.map(function(d, i){

        var val = d.values;
        cache.scaleX.domain([0, val.length]);
        cache.scaleY.domain([0, d3.max(val)]);

        var transposed = d3.transpose(cache.data.map(function(d, i){ return d.values; }));

        var previous = null;
        return val.map(function(dB, iB){

            percentScaleY.domain([0, d3.sum(transposed[iB])]);
            stackedScaleY.domain([0, d3.max(transposed.map(function(d, i){ return d3.sum(d); }))]);

            var datum = {
                value: dB,
                index: iB,
                parentData: d,
                x: cache.scaleX(iB),
                y: cache.chartHeight - cache.scaleY(dB),
                stackedPercentY: cache.chartHeight - percentScaleY(d3.sum(transposed[iB].slice(0, i+1))),
                stackedY: cache.chartHeight - stackedScaleY(d3.sum(transposed[iB].slice(0, i+1))),
                w: cache.scaleX(1),
                h: cache.scaleY(dB),
                stackedPercentH: percentScaleY(dB),
                stackedH: stackedScaleY(dB),
                layerCount: cache.data.length,
                layerIndex: i
            };

            datum.previous = previous || datum;
            previous = datum;

            return datum;

        });

    });
};
