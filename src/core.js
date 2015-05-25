var dadavis = {version: '0.1.1'};

dadavis.init = function(_config){

    var config = {
        containerSelector: '.container',
        width: 500,
        height: 500,
        margin: {top: 20, right: 20, bottom: 50, left: 50},
        type: 'bar',
        subtype: 'stacked',
        labelFormatterX: function(d){ return d; },
        tooltipFormatter: function(d){ return d.value; },
        axisXAngle: null,
        tickSize: 15,
        minorTickSize: 10,
        fringeSize: 8,
        tickYCount: 5,
        axisXTickSkip: 'auto',
        continuousXAxis: false,
        dotSize: 2,
        gutterPercent: 10,
        renderer: 'svg',
        scaleType: 'time',
        keyX: 'x',
        keyY: 'y',
        outerPadding: 0,
        showFringe: false,
        showAxes: true,
        showXGrid: false,
        showYGrid: false,
        showLegend: false,
        autoTypeThreshold: 30,
        chartTitle: null,
        axisXTitle: null,
        axisYTitle: null,
        colorList: dadavis.utils.defaultColors
    };

    var cache = {
        chartWidth: 500,
        chartHeight: 500,
        data: null,
        visibleData: null,
        layout: null,
        scaleX: null,
        scaleY: null,
        axesLayout: {},
        legendLayout: {},
        fringeLayout: {},
        previousData: null,
        container: null,
        noPadding: false,
        dataLayersToHide: [],
        events: d3.dispatch('hover', 'hoverOut', 'legendClick'),
        internalEvents: d3.dispatch('setHover', 'hideHover', 'resize', 'legendClick'),
    };

    var exports = {};

    exports.initialize = dadavis.utils.once(function(config, cache){
        dadavis.utils.override(_config, config);

        cache.container = d3.select(config.containerSelector);
        cache.container.html(dadavis.template.main);

        d3.select(window).on('resize.namespace' + ~~(Math.random()*1000), dadavis.utils.throttle(function(){
            cache.internalEvents.resize();
        }, 200));

        var that = this;
        cache.internalEvents.on('resize', function(){
            that.resize();
        });
        cache.internalEvents.on('legendClick', function(toHide){
            cache.dataLayersToHide = toHide;
            that.render();
        });
    });

    exports.setConfig = function(newConfig){
        dadavis.utils.override(newConfig, config);
        return this;
    };

    exports.resize = function(){
        this.render();
        return this;
    };

    exports.downloadAsPNG = function(callback){
        dadavis.utils.convertToImage(config, cache, callback);
        return this;
    };

    exports.setHovering = function(hoverData){
        cache.internalEvents.setHover(hoverData);
        return this;
    };

    exports.hideHovering = function(){
        cache.internalEvents.hideHover();
        return this;
    };

    exports.render = function(data){

        if(!dadavis.data.validate(config, cache, data)){
            console.error('Invalid data', data);
            return this;
        }

        this.initialize.call(this, config, cache);
        dadavis.automatic.config.call(this, config, cache);

        cache.scaleX = dadavis.scale.x(config, cache);
        cache.scaleY = dadavis.scale.y(config, cache);

        cache.layout = dadavis.layout.data(config, cache);
        cache.axesLayout.x = dadavis.layout.axes.x(config, cache);
        cache.axesLayout.y = dadavis.layout.axes.y(config, cache);
        cache.legendLayout = dadavis.layout.legend(config, cache);

        //cache.fringeLayout.y = dadavis.layout.fringes.y(config, cache);
        //console.log(cache.fringeLayout.y);

        dadavis.component.chart(config, cache);
        dadavis.component.shapes(config, cache);
        dadavis.component.axisX(config, cache);
        dadavis.component.axisY(config, cache);
        dadavis.component.title(config, cache);
        dadavis.component.legend(config, cache);
        dadavis.interaction.hovering(config, cache);

        return this;
    };

    d3.rebind(exports, cache.events, "on");

    return exports;
};
