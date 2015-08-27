var cirrus = {version: '0.1.1'};

cirrus.init = function(initialConfig){

    var config = {
        container: '.container',
        width: null,
        height: null,
        margin: {top: 20, right: 20, bottom: 50, left: 50},
        type: 'bar',
        subtype: 'stacked',
        labelFormatterX: function(d){ return d; },
        tooltipFormatter: function(d){ return d.data.y; },
        axisXAngle: null,
        tickSize: 8,
        minorTickSize: 4,
        tickYCount: 5,
        axisXTickSkip: 0,
        fringeSize: 8,
        continuousXAxis: false,
        gutterPercent: 10,
        renderer: 'svg',
        scaleType: 'time',
        outerPadding: 0,
        showFringe: false,
        showAxes: true,
        showXGrid: true,
        showYGrid: false,
        showLegend: false,
        autoTypeThreshold: 30,
        chartTitle: null,
        axisXTitle: null,
        axisYTitle: null,
        colorList: cirrus.utils.defaultColors,
        multipleTooltip: true,

        chartWidth: 500,
        chartHeight: 500,
        data: null,
        previousData: null,
        visibleData: null,
        dataLayersToHide: [],
        shapeLayout: null,
        axesLayout: {},
        legendLayout: {},
        fringeLayout: {},
        scaleX: null,
        scaleY: null,
        events: d3.dispatch('hover', 'hoverOut', 'legendClick'),
        internalEvents: d3.dispatch('setHover', 'hideHover', 'resize', 'legendClick')
    };

    var initialConfig = initialConfig;

    cirrus.utils.override(initialConfig, config);

    var exports = {};

    exports.initialize = cirrus.utils.once(function(config){
        var that = this;

        config.container = d3.select(config.container);
        config.container.html(cirrus.template.main);

        config.internalEvents.on('legendClick', function(toHide){
            config.dataLayersToHide = toHide;
            that.render();
        });
    });

    exports.setConfig = function(newConfig){
        cirrus.utils.override(newConfig, config);
        return this;
    };

    exports.getConfig = function(){
        return config;
    };

    exports._getConfig = function(){
        return config;
    };

    exports.resize = function(){
        this.render();
        return this;
    };

    exports.downloadAsPNG = function(callback){
        cirrus.utils.convertToImage(config, callback);
        return this;
    };

    exports.setHovering = function(hoverData){
        config.internalEvents.setHover(hoverData);
        return this;
    };

    exports.hideHovering = function(){
        config.internalEvents.hideHover();
        return this;
    };

    exports.render = function(data){

        if(!cirrus.data.validate(config, data)){
            console.error('Invalid data', data);
            return this;
        }

        this.initialize.call(this, config);
        cirrus.automatic.configuration.call(this, initialConfig, config);

        config.scaleX = cirrus.scale.x(config);
        config.scaleY = cirrus.scale.y(config);
        config.scaleColor = cirrus.scale.color(config);

        config.shapeLayout = cirrus.layout[config.type][config.subtype](config);
        config.axesLayout.x = cirrus.layout.axes.x(config);
        config.axesLayout.y = cirrus.layout.axes.y(config);
        config.legendLayout = cirrus.layout.legend(config);

        cirrus.component.chart(config);
        cirrus.component.shapes(config);
        cirrus.component.axisX(config);
        cirrus.component.axisY(config);
        cirrus.component.title(config);
        cirrus.component.legend(config);

        cirrus.interaction.hovering(config);

        return this;
    };

    d3.rebind(exports, config.events, "on");

    return exports;
};
