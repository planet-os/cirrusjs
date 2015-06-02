dadavis.automatic = {};

dadavis.automatic.config = function(config, _config){

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

    if(config.outerPadding === 'auto'){
        var keys = dadavis.utils.extractValues(_config.data, config.keyX);
        this.setConfig({
            outerPadding: _config.chartWidth / (keys[0].length) / 2
        });
    }

    if(config.type === 'line'){
        _config.noPadding = true;
    }

    _config.data.forEach(function(d, i){
        if(!d.color){
            d.color = config.colorList[i % config.colorList.length];
        }
    });

    return this;
};