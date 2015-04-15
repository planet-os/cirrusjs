dadavis.render = {};

dadavis.render.chart = function(config, cache){
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

    var shapeAttr = dadavis.getAttr[config.type][config.subtype](config, cache);


    var renderer = dadavis.renderer[config.renderer](shapeContainer.node());

    console.time('rendering');

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
                var line = renderer.rect({rect: dB, fill: config.colors[i], stroke: config.colors[i]});
            });
        });
    }
    console.timeEnd('rendering');

    cache.container.select('.axis-x').call(function(){
        dadavis.render.axisX.call(this, config, cache);
    });

    cache.container.select('.axis-y').call(function(){
        dadavis.render.axisY.call(this, config, cache);
    });
};

dadavis.render.axisX = function(config, cache){

    this.style({
        width: cache.chartWidth + 'px',
        height: config.margin.bottom + 'px',
        position: 'absolute',
        top: cache.chartHeight + config.margin.top + 'px',
        left: config.margin.left + 'px',
        'border-top': '1px solid black'
    });

    var labelsX = this.selectAll('div.label')
        .data(cache.layout[0]);

    labelsX.enter().append('div').classed('label', true)
        .style({
            position: 'absolute'
        });

    labelsX
        .html(function(d, i){
            var key = d.parentData.keys ? d.parentData.keys[i] : i;
            if(config.labelFormatterX){
                return config.labelFormatterX(key, i);
            }
            else{
                return key;
            }
        })
        .style(dadavis.getAttr.axis.labelX(config, cache));

    if(config.axisXTickSkip === 'auto'){
        var widestLabel = d3.max(labelsX[0].map(function(d){
            return d.offsetWidth;
        }));
        cache.axisXTickSkipAuto = Math.ceil(cache.layout[0].length / ~~(cache.chartWidth / widestLabel));
    }

    labelsX.style(dadavis.getAttr.axis.labelX(config, cache));

    labelsX.exit().remove();

    var ticksX = this.selectAll('div.tick')
        .data(cache.layout[0]);

    ticksX.enter().append('div').classed('tick', true)
        .style({position: 'absolute'})
        .style({'background-color': 'black'});

    ticksX.style(dadavis.getAttr.axis.tickX(config, cache));

    ticksX.exit().remove();
};

dadavis.render.axisY = function(config, cache){

    this.style({
        width: config.margin.left + 'px',
        height: cache.chartHeight + 'px',
        position: 'absolute',
        top: config.margin.top + 'px',
        left: 0 + 'px',
        'border-right': '1px solid black'
    });

    var labelsY = this.selectAll('div.label')
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
        .style(dadavis.getAttr.axis.labelY(config, cache));

    labelsY.exit().remove();

    var ticksY = this.selectAll('div.tick')
        .data(cache.axesLayout);

    ticksY.enter().append('div').classed('tick', true)
        .style({'background-color': 'black'});

    ticksY.style(dadavis.getAttr.axis.tickY(config, cache));

    ticksY.exit().remove();
};

if(typeof define === "function" && define.amd){
    define(dadavis);
}
else if(typeof module === "object" && module.exports){
    var d3 = require('d3');
    module.exports = dadavis;
}
