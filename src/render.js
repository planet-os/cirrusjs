dadavis.render = {};

dadavis.render.chart = function(config, cache){
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
        dadavis.render[config.type].call(this, config, cache);
    });

    chart.select('.axes').call(function(){
        dadavis.render.axes.call(this, config, cache);
    });
};

dadavis.render.bar = function(config, cache){
    var shapes = this.selectAll('.shape')
        .data(function(d, i){ return d; });

    shapes.enter().append('rect')
        .attr({'class': function(d, i){ return 'shape layer' + d.layerIndex + ' index' + d.index; }})
        .attr(dadavis.getAttr[config.type][config.subtype]())
        .style({opacity: 0});

    shapes.transition()
        .attr(dadavis.getAttr[config.type][config.subtype]())
        .style({opacity: 1});

    shapes.exit().remove();
};

dadavis.render.line = function(config, cache){
    var dotSize = 2;

    var lines = this.selectAll('.line')
        .data(function(d, i){ return d; });

    lines.enter().append('path').classed('line', true)
        .attr(dadavis.getAttr[config.type][config.subtype]())
        .style({opacity: 0});

    lines.transition()
        .attr(dadavis.getAttr[config.type][config.subtype]())
        .style({opacity: 1});

    lines.exit().remove();

    var shapes = this.selectAll('.shape')
        .data(function(d, i){ return d; });

    shapes.enter().append('circle').classed('shape', true)
        .attr(dadavis.getAttr['point'][config.subtype]())
        .attr({r: dotSize})
        .style({opacity: 0});

    shapes.transition()
        .attr(dadavis.getAttr['point'][config.subtype]())
        .style({opacity: 1});

    shapes.exit().remove();
};

dadavis.render.axes = function(config, cache){

    var tickSize = 10;
    var tickCountY = 5;

    var axisX = cache.container
        .style({position: 'absolute'}) //TODO should not be here
        .selectAll('div.axis-x')
        .data([0]);

    axisX.enter().append('div').classed('axis-x', true)
        .style({
            width: cache.chartWidth + 'px',
            height: config.margin.bottom + 'px',
            position: 'absolute',
            top: cache.chartHeight + config.margin.top + 'px',
            left: config.margin.left + 'px'
        });

    var labelsX = axisX.selectAll('div.label')
        .data(cache.layout[0]);

    labelsX.enter().append('div').classed('label', true);

    labelsX.html(function(d, i){
            return i;
        })
        .style({
            position: 'absolute',
            left: function(d, i){
                return d.index * d.w + d.w / 2 - this.offsetWidth / 2 + 'px';
            },
            top: tickSize + 'px'
        });

    labelsX.exit().remove();

    var ticksX = axisX.selectAll('div.tick')
        .data(cache.layout[0]);

    ticksX.enter().append('div').classed('tick', true);

    ticksX.style({
            position: 'absolute',
            left: function(d, i){ return d.index * d.w + d.w / 2 + 'px'; },
            width: 1 + 'px',
            height: tickSize + 'px'
        });

    ticksX.exit().remove();

    var axisY = cache.container
        .selectAll('div.axis-y')
        .data([0]);

    axisY.enter().append('div').classed('axis-y', true)
        .style({
            width: config.margin.left + 'px',
            height: cache.chartHeight + 'px',
            position: 'absolute',
            top: config.margin.top + 'px',
            left: 0 + 'px'
        });

    axisY.exit().remove();

    //TODO belongs in layout
    var axisScaleY = cache.scaleY.copy();
    // var domainMax = d3.max(cache.data.map(function(d, i){ return d3.sum(d.values); }));
    var domainMax = d3.max(cache.data.map(function(d, i){ return d3.max(d.values); }));
    axisScaleY.domain([domainMax, 0]);

    var labelsY = axisY.selectAll('div.label')
        .data(d3.range(tickCountY));

    labelsY.enter().append('div').classed('label', true);

    labelsY.html(function(d, i){
            return i * domainMax / 4;
        })
        .style({
            position: 'absolute',
            left: 0 + 'px',
            top: function(d, i){
                return axisScaleY(i * domainMax / 4)  - this.offsetHeight / 2 + 'px';
            },
        });

    labelsY.exit().remove();

    var ticksY = axisY.selectAll('div.tick')
        .data(d3.range(tickCountY));

    ticksY.enter().append('div').classed('tick', true);

    ticksY.style({
            width: tickSize + 'px',
            height: 1 + 'px',
            position: 'absolute',
            left: config.margin.left - tickSize + 'px',
            top: function(d, i){
                return axisScaleY(i * domainMax / 4) + 'px';
            },
        });

    ticksY.exit().remove();
};
