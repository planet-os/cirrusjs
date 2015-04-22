dadavis.scale = {};

dadavis.scale.x = function(config, cache){

    var keys = dadavis.utils.extractValues(cache.data, config.keyX);
    var allKeys = d3.merge(keys);

    var range = [config.outerPadding, cache.chartWidth - config.outerPadding];
    var scaleX = null;
    if(config.scaleType === 'time'){
        scaleX = d3.time.scale().range(range);
        allKeys = allKeys.map(function(d, i){
            return new Date(d);
        });

        scaleX.domain(d3.extent(allKeys));
    }
    else if(config.scaleType === 'ordinal'){
        scaleX = d3.scale.linear().range(range);
        scaleX.domain([0, keys[0].length - 1]);
    }
    else{
        scaleX = d3.scale.linear().range(range);
        scaleX.domain(d3.extent(allKeys));
    }

    return scaleX;
};

dadavis.scale.y = function(config, cache){

    var values = d3.merge(dadavis.utils.extractValues(cache.data, config.keyY));

    return d3.scale.linear().range([0, cache.chartHeight]).domain([0, d3.max(values)]);
};