cirrus.automatic = {};

cirrus.automatic.config = function(config, _config){

    if(config.type === 'auto'){
        var dataLength = _config.data[0].values.length;
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

    if(config.width === 'auto' || !config.width){
        _config.width = _config.container.node().offsetWidth;
    }
    _config.chartWidth = _config.width - config.margin.left - config.margin.right;

    if(config.height === 'auto' || !config.height){
        _config.height = _config.container.node().offsetHeight;
    }
    _config.chartHeight = _config.height - config.margin.top - config.margin.bottom;

    if(config.outerPadding === 'auto' || config.type === 'bar'){
        var keys = cirrus.utils.extractValues(_config.data, config.keyX);
        _config.outerPadding = _config.chartWidth / (keys[0].length) / 2;
    }

    if(config.type === 'line'){
        _config.outerPadding = 0;
    }

    if(config.subtype === 'grid'){
        _config.gutterPercent = 0;
        _config.multipleTooltip = false;
    }

    _config.data.forEach(function(d, i){
        if (d3.keys(d.values[0]).indexOf('color') > -1) {
            d.color = null;
        }
        else if(!d.color){
            d.color = config.colorList[i % config.colorList.length];
        }
    });

    return this;
};