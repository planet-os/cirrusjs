dadavis.render = {};

dadavis.render.chart = function(config, cache){
    var chartContainer = cache.container.select('.chart').style({
        position: 'absolute'
    });

    var panelContainer = chartContainer.select('.panel').style({
        position: 'absolute',
        left: config.margin.left + 'px',
        top: config.margin.top + 'px'
    });

    var params = {
        width: config.width,
        height: config.height,
        type: Two.Types.svg
    };
    var two = new Two(params).appendTo(panelContainer.node());

    var panel = two.makeGroup();

    var shapeAttr = dadavis.getAttr[config.type][config.subtype](config, cache);
    var colors = ['skyblue', 'orange', 'lime', 'orangered', 'violet', 'yellow', 'brown', 'pink'];

    console.time('rendering');
    if(config.type === 'line'){
        cache.layout.forEach(function(d, i){
            var curve = two.makePolygon.apply(two, shapeAttr[i].concat([true]));
            if(config.subtype === 'area'){
                curve.fill = colors[i];
            }
            else{
                curve.fill = 'transparent';
            }
            curve.stroke = colors[i];
            var layer = two.makeGroup(curve);
            panel.add(layer);
        });
    }
    else{
        cache.layout.forEach(function(d, i){
            var layer = two.makeGroup();
            d.forEach(function(dB, iB){
                var layout = d[iB];
                var x = shapeAttr.x(layout, iB, i);
                var y = shapeAttr.y(layout, iB, i);
                var width = shapeAttr.width(layout, iB, i);
                var height = shapeAttr.height(layout, iB, i);

                var rect = two.makeRectangle(x, y, width, height);
                rect.fill = colors[i];
                layer.add(rect);
            });
            panel.add(layer);
        });
    }
    console.timeEnd('rendering');

    console.time('update');
    two.update();
    console.timeEnd('update');

    cache.container.select('.axis-x').call(function(){
        dadavis.render.axisX.call(this, config, cache);
    });

    cache.container.select('.axis-y').call(function(){
        dadavis.render.axisY.call(this, config, cache);
    });
};

dadavis.render.bar = function(config, cache){
    var shapes = this.selectAll('.shape')
        .data(function(d, i){
            return d;
        });

    shapes.enter().append('rect')
        .attr({
            'class': function(d, i){
                return 'shape layer' + d.layerIndex + ' index' + d.index;
            }
        })
        .attr(dadavis.getAttr[config.type][config.subtype](config, cache))
        .style({opacity: 0});

    shapes.transition()
        .attr(dadavis.getAttr[config.type][config.subtype](config, cache))
        .style({opacity: 1});

    shapes.exit().remove();
};

dadavis.render.line = function(config, cache){

    var lines = this.selectAll('.line')
        .data(function(d, i){
            return d;
        });

    lines.enter().append('path').classed('line', true)
        .attr(dadavis.getAttr[config.type][config.subtype](config, cache))
        .style({opacity: 0});

    lines.transition()
        .attr(dadavis.getAttr[config.type][config.subtype](config, cache))
        .style({opacity: 1});

    lines.exit().remove();

    var shapes = this.selectAll('.shape')
        .data(function(d, i){
            return d;
        });

    shapes.enter().append('circle').classed('shape', true)
        .attr(dadavis.getAttr['point'][config.subtype](config, cache))
        .attr({r: config.dotSize})
        .style({opacity: 0});

    shapes.transition()
        .attr(dadavis.getAttr['point'][config.subtype](config, cache))
        .style({opacity: 1});

    shapes.exit().remove();
};

dadavis.render.axisX = function(config, cache){

    this.style({
        width: cache.chartWidth + 'px',
        height: config.margin.bottom + 'px',
        position: 'absolute',
        top: cache.chartHeight + config.margin.top + 'px',
        left: config.margin.left + 'px'
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
        .style(dadavis.getAttr.axis.labelX(config, cache))
        .style({
            display: function(d, i){
                return (i % config.axisXTickSkip) ? 'none' : 'block';
            }
        });

    labelsX.exit().remove();

    var ticksX = this.selectAll('div.tick')
        .data(cache.layout[0]);

    ticksX.enter().append('div').classed('tick', true)
        .style({position: 'absolute'});

    ticksX.style(dadavis.getAttr.axis.tickX(config, cache));

    ticksX.exit().remove();
};

dadavis.render.axisY = function(config, cache){

    this.style({
        width: config.margin.left + 'px',
        height: cache.chartHeight + 'px',
        position: 'absolute',
        top: config.margin.top + 'px',
        left: 0 + 'px'
    });

    var labelsY = this.selectAll('div.label')
        .data(cache.axesLayout);

    labelsY.enter().append('div').classed('label', true);

    labelsY
        .html(function(d, i){
            if(config.subtype === 'stacked'){
                return d.stackedLabel;
            }
            else{
                return d.label;
            }
        })
        .style(dadavis.getAttr.axis.labelY(config, cache));

    labelsY.exit().remove();

    var ticksY = this.selectAll('div.tick')
        .data(cache.axesLayout);

    ticksY.enter().append('div').classed('tick', true);

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
