dadaviz.render = {};

dadaviz.render.chart = function(config, cache){
    var chart = d3.select('.container .chart')
        .attr({
            width: config.width,
            height: config.height
        });

    var panelAttr = {
        transform: 'translate(' + [config.margin.left, config.margin.top] + ')',
        height: config.chartHeight,
        width: config.chartWidth
    };

    var panel = chart.select('.panel')
        .attr(panelAttr);

    var layers = panel.selectAll('.layer')
        .data(cache.layout);

    layers.enter().append('g').classed('layer', true);

    layers.exit().remove();

    layers.call(function(){
        dadaviz.render[config.type].call(this, config, cache);
    });

    chart.select('.axes').call(function(){
        dadaviz.render.axes.call(this, config, cache);
    });
};

dadaviz.render.bar = function(config, cache){
    var shapes = this.selectAll('.shape')
        .data(function(d, i){ return d; });

    shapes.enter().append('rect').classed('shape', true)
        .attr(dadaviz.getAttr[config.type][config.subtype]())
        .style({opacity: 0});

    shapes.transition()
        .attr(dadaviz.getAttr[config.type][config.subtype]())
        .style({opacity: 1});

    shapes.exit().remove();
};

dadaviz.render.line = function(config, cache){
    var lines = this.selectAll('.line')
        .data(function(d, i){ return d; });

    lines.enter().append('path').classed('line', true)
        .attr(dadaviz.getAttr[config.type][config.subtype]())
        .style({opacity: 0});

    lines.transition()
        .attr(dadaviz.getAttr[config.type][config.subtype]())
        .style({opacity: 1});

    lines.exit().remove();

    var shapes = this.selectAll('.shape')
        .data(function(d, i){ return d; });

    shapes.enter().append('circle').classed('shape', true)
        .attr(dadaviz.getAttr['point'][config.subtype]())
        .style({opacity: 0});

    shapes.transition()
        .attr(dadaviz.getAttr['point'][config.subtype]())
        .style({opacity: 1});

    shapes.exit().remove();
};

dadaviz.render.axes = function(config, cache){
    var axisX = d3.svg.axis()
        .scale(cache.scaleX)
        .orient("bottom");

    var axes = this.select('.axis-x')
        .attr({
            transform: 'translate(' + [config.margin.left, config.height - config.margin.bottom] + ')'
        })
        .call(axisX);

    var axisY = d3.svg.axis()
        .scale(cache.scaleY)
        .orient('left');

    var axes = this.select('.axis-y')
        .attr({
            transform: 'translate(' + [config.margin.left, config.margin.top] + ')'
        })
        .call(axisY);
};
