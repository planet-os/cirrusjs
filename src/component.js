dadavis.component = {};

dadavis.component.chart = function(config, cache){
    var chartContainer = cache.container.select('.chart').style({
        position: 'absolute',
        width: cache.chartWidth + 'px',
        height: cache.chartHeight + 'px'
    });

    var panelContainer = chartContainer.select('.panel').style({
        position: 'absolute',
        left: config.margin.left + 'px',
        top: config.margin.top + 'px',
        width: cache.chartWidth + 'px',
        height: cache.chartHeight + 'px'
    });

    var shapeContainer = chartContainer.select('.shape').style({
        position: 'absolute',
        width: cache.chartWidth + 'px',
        height: cache.chartHeight + 'px'
    });

    var shapeAttr = dadavis.attribute[config.type][config.subtype](config, cache);

    var renderer = dadavis.renderer[config.renderer](shapeContainer.node());

    //console.time('rendering');

    if(config.type === 'line'){
        shapeAttr.forEach(function(d, i){
            var color = null;
            if(config.subtype === 'area'){
                color = config.colors[i];
            }
            else{
                color = 'none';
            }
            renderer.polygon({points: d, fill: color, stroke: config.colors[i]});
        });
    }
    else{
        shapeAttr.forEach(function(d, i){
            d.forEach(function(dB, iB){
                renderer.rect({rect: dB, fill: config.colors[i], stroke: config.colors[i]});
            });
        });
    }
    //console.timeEnd('rendering');

    return this;
};

dadavis.component.axisX = function(config, cache){

    var axisXContainer = cache.container.select('.axis-x')
        .style({
            width: cache.chartWidth + 'px',
            height: config.margin.bottom + 'px',
            position: 'absolute',
            top: cache.chartHeight + config.margin.top + 'px',
            left: config.margin.left + 'px',
            'border-top': '1px solid black'
        });

    var labelsX = axisXContainer.selectAll('div.label')
        .data(cache.layout[0]);

    labelsX.enter().append('div').classed('label', true)
        .style({
            position: 'absolute'
        });

    labelsX
        .html(function(d, i){
            if(config.labelFormatterX){
                return config.labelFormatterX(d.key, i);
            }
            else{
                return d.key;
            }
        })
        .style(dadavis.attribute.axis.labelX(config, cache));

    if(config.axisXTickSkip === 'auto'){
        var widestLabel = d3.max(labelsX[0].map(function(d){
            return d.offsetWidth;
        }));
        cache.axisXTickSkipAuto = Math.ceil(cache.layout[0].length / ~~(cache.chartWidth / widestLabel));
    }

    labelsX.style(dadavis.attribute.axis.labelX(config, cache));

    labelsX.exit().remove();

    var ticksX = axisXContainer.selectAll('div.tick')
        .data(cache.layout[0]);

    ticksX.enter().append('div').classed('tick', true)
        .style({position: 'absolute'})
        .style({'background-color': 'black'});

    ticksX.style(dadavis.attribute.axis.tickX(config, cache));

    ticksX.exit().remove();
};

dadavis.component.axisY = function(config, cache){

    var axisYContainer = cache.container.select('.axis-y')
        .style({
            width: config.margin.left + 'px',
            height: cache.chartHeight + 'px',
            position: 'absolute',
            top: config.margin.top + 'px',
            left: 0 + 'px',
            'border-right': '1px solid black'
        });

    var labelsY = axisYContainer.selectAll('div.label')
        .data(cache.axesLayout);

    labelsY.enter().append('div').classed('label', true);

    labelsY
        .html(function(d, i){
            if(config.subtype === 'simple'){
                return d.label;
            }
            else{
                return d.stackedLabel;
            }
        })
        .style(dadavis.attribute.axis.labelY(config, cache));

    labelsY.exit().remove();

    var ticksY = axisYContainer.selectAll('div.tick')
        .data(cache.axesLayout);

    ticksY.enter().append('div').classed('tick', true)
        .style({'background-color': 'black'});

    ticksY.style(dadavis.attribute.axis.tickY(config, cache));

    ticksY.exit().remove();
};

if(typeof define === "function" && define.amd){
    define(dadavis);
}
else if(typeof module === "object" && module.exports){
    var d3 = require('d3');
    module.exports = dadavis;
}
