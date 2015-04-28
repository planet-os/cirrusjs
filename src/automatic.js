dadavis.automatic = {};

dadavis.automatic.config = function(config, cache){

    if(config.type === 'auto'){
        var dataLength = cache.data[0].values.length;
        if(dataLength < config.autoTypeThreshold){
            this.setConfig({
                type: 'bar',
                continuousXAxis: false,
                outerPadding: 'auto'
            });
        }
        else{
            this.setConfig({
                type: 'line',
                continuousXAxis: true
            });
        }
    }

    if(config.outerPadding === 'auto'){
        var keys = dadavis.utils.extractValues(cache.data, config.keyX);
        config.outerPadding = cache.chartWidth / keys[0].length / 4;
    }

    this.setConfig({
        width: cache.container.node().offsetWidth,
        height: cache.container.node().offsetHeight
    });

    cache.chartWidth = config.width - config.margin.left - config.margin.right;
    cache.chartHeight = config.height - config.margin.top - config.margin.bottom;

    if(config.type === 'line'){
        cache.noPadding = true;
    }
    return this;
};