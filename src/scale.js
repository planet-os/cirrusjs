dadavis.scale = {};

dadavis.scale.x = function(config, cache){

    var keys = dadavis.utils.extractValues(cache.data, config.keyX);
    var allKeys = d3.merge(dadavis.utils.extractValues(cache.data, config.keyX));

    var scaleX = d3.time.scale().range([config.outerPadding, cache.chartWidth - config.outerPadding]);;
    if(config.scaleType === 'time'){
        allKeys = allKeys.map(function(d, i){
            return new Date(d);
        });

        scaleX.domain(d3.extent(allKeys));
    }
    else if(config.scaleType === 'ordinal'){
        scaleX.domain([0, keys[0].length - 1]);
    }
    else{
        scaleX.domain(d3.extent(allKeys));
    }

    return scaleX;
};

dadavis.scale.y = function(config, cache){

    var values = d3.merge(dadavis.utils.extractValues(cache.data, config.keyY));

    return d3.scale.linear().range([0, cache.chartHeight]).domain([0, d3.max(values)]);
};