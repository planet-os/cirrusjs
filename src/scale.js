dadavis.scale = {};

dadavis.scale.x = function(config, cache){
    return d3.scale.linear().range([0, cache.chartWidth]);
};

dadavis.scale.y = function(config, cache){
    return d3.scale.linear().range([0, cache.chartHeight]);
};