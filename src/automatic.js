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
        this.setConfig({
            width: _config.container.node().offsetWidth
        });
    }

    if(config.height === 'auto' || !config.height){
        this.setConfig({
            height: _config.container.node().offsetHeight
        });
    }

    _config.chartWidth = config.width - config.margin.left - config.margin.right;
    _config.chartHeight = config.height - config.margin.top - config.margin.bottom;

    if(config.outerPadding === 'auto' || config.type === 'bar'){
        var keys = cirrus.utils.extractValues(_config.data, config.keyX);
        _config.outerPadding = _config.chartWidth / (keys[0].length) / 2;
    }

    if(config.type === 'line'){
        _config.outerPadding = 0;
    }

    if(config.subtype === 'grid' && !(config.gutterPercent >= 0)){
        _config.gutterPercent = 0;
    }

    _config.data.forEach(function(d, i){
        if(d.values[0].color){
            d.color = null;
        }
        else if(!d.color){
            d.color = config.colorList[i % config.colorList.length];
        }
    });

    return this;
};