cirrus.automatic = {};

cirrus.automatic.configuration = function(initialConfig, config){

    if(initialConfig.type === 'auto'){
        var dataLength = config.data[0].values.length;
        if(initialConfig.autoTypeThreshold && dataLength < initialConfig.autoTypeThreshold){
            config.type = 'bar';
            config.continuousXAxis = false;
            config.outerPadding = 'auto';
        }
        else{
            config.type = 'line';
            config.continuousXAxis = true;
        }
    }

    if(initialConfig.width === 'auto' || !config.width){
        config.width = config.container.node().offsetWidth;
    }
    config.chartWidth = config.width - config.margin.left - config.margin.right;

    if(initialConfig.height === 'auto' || !config.height){
        config.height = config.container.node().offsetHeight;
    }
    config.chartHeight = config.height - config.margin.top - config.margin.bottom;

    if(initialConfig.outerPadding === 'auto' || config.type === 'bar' || config.type === 'grid'){
        var keys = cirrus.utils.extractValues(config.data, 'x');
        config.outerPadding = config.chartWidth / (keys[0].length) / 2;
    }

    if(config.type === 'line'){
        config.outerPadding = 0;
    }

    if(config.type === 'grid'){
        config.gutterPercent = 0;
        config.multipleTooltip = false;
    }

    config.data.forEach(function(d, i){
        if (d3.keys(d.values[0]).indexOf('color') > -1) {
            d.color = null;
        }
        else if(!d.color){
            d.color = config.colorList[i % config.colorList.length];
        }
    });

    return this;
};