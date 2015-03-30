var dadavis = { version: '0.1.0' };

dadavis.init = function(_config){

    var config = {
        containerSelector: '.container',
        width: 500,
        height: 500,
        margin: {top: 20, right: 20, bottom: 50, left: 50},
        type: 'bar',
        subtype: 'stacked'
    }

    var cache = {
        chartWidth: 500,
        chartHeight: 500,
        data: null,
        layout: null,
        scaleX: null,
        scaleY: null,
        previousData: null,
        container: null
    };

    dadavis.utils.override(_config, config);

    cache.container = d3.select(config.containerSelector);
    cache.container.html(dadavis.template.main);

    exports = {};

    exports.setConfig = function(newConfig) {
        dadavis.utils.override(newConfig, config);
        return this;
    };

    exports.render = function(data) {
        if (data) {
            cache.previousData = data;
            cache.data = data;
        }
        else {
            cache.data = cache.previousData;
        }

        this.setConfig({
            width: cache.container.node().offsetWidth,
            height: cache.container.node().offsetHeight
        });
        cache.chartWidth = config.width - config.margin.left - config.margin.right;
        cache.chartHeight = config.height - config.margin.top - config.margin.bottom;

        cache.scaleX = d3.scale.linear().range([0, cache.chartWidth]);
        cache.scaleY = d3.scale.linear().range([0, cache.chartHeight]);

        cache.layout = dadavis.getLayout.call(this, config, cache);

        dadavis.render.chart(config, cache);

        return this;
    };

    return exports;
}
