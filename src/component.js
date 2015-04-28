dadavis.component = {};

dadavis.component.chart = function(config, cache){
    var chartContainer = cache.container.select('.chart').style({
        position: 'absolute',
        width: config.width + 'px',
        height: config.height + 'px'
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

};

dadavis.component.shapes = function(config, cache){

    var shapeAttr = dadavis.attribute[config.type][config.subtype](config, cache);

    var shapeContainer = cache.container.select('.shape');
    shapeContainer.html('');
    var renderer = dadavis.renderer[config.renderer](shapeContainer.node());

    //console.time('rendering');

    if(config.type === 'line'){
        shapeAttr.forEach(function(d, i){
            var color = null;
            if(config.subtype === 'area'){
                color = d.color;
            }
            else{
                color = 'none';
            }
            renderer.polygon({points: d.points, fill: color, stroke: d.color});
        });
    }
    else{
        shapeAttr.forEach(function(d, i){
            d.forEach(function(dB, iB){
                renderer.rect({rect: dB, fill: dB.color, stroke: dB.color});
            });
        });
    }
    //console.timeEnd('rendering');

    return this;
};

dadavis.component.title = function(config, cache){

    if(config.chartTitle){
        d3.select('.title')
            .html('Chart Title')
            .style({
                width: '100%',
                'text-align': 'center'
            });
    }

    if(config.axisXTitle){
        d3.select('.axis-title-x')
            .html('X Axis Title')
            .style({
                top: function(){
                    return config.height - this.offsetHeight + 'px';
                },
                position: 'absolute',
                width: '100%',
                'text-align': 'center'
            });
    }

    if(config.axisYTitle){
        d3.select('.axis-title-y')
            .html('Y Axis Title')
            .style({
                transform: 'rotate(-90deg) translate(-' + config.height / 2 + 'px)',
                'transform-origin': '0 0'
            });
    }
};

dadavis.component.axisX = function(config, cache){

    if(!config.showAxes){
        return;
    }

    var axisXContainer = cache.container.select('.axis-x')
        .style({
            width: cache.chartWidth + 'px',
            height: config.margin.bottom + 'px',
            position: 'absolute',
            top: cache.chartHeight + config.margin.top + 'px',
            left: config.margin.left + 'px',
            'border-top': '1px solid black'
        });

    if(config.showFringe){
        var fringeX = axisXContainer.selectAll('div.fringe-x')
            .data(cache.layout[0]);

        fringeX.enter().append('div').classed('fringe-x', true)
            .style({position: 'absolute'});

        fringeX.style(dadavis.attribute.axis.fringeX(config, cache));

        fringeX.exit().remove();
    }

    if(config.showXGrid){
        var gridX = cache.container.select('.grid-x')
            .selectAll('div.grid-line-x')
            .data(cache.axesLayout.x);

        gridX.enter().append('div').classed('grid-line-x', true)
            .style({position: 'absolute'})
            .style({'background-color': '#eee'});

        gridX.style(dadavis.attribute.axis.gridX(config, cache));

        gridX.exit().remove();
    }

    var labelsX = axisXContainer.selectAll('div.label')
        .data(cache.axesLayout.x);

    labelsX.enter().append('div').classed('label', true)
        .style({
            position: 'absolute'
        });

    labelsX
        .html(function(d, i){
            return config.labelFormatterX(d.key, i);
        })
        .style(dadavis.attribute.axis.labelX(config, cache));

    var skipped = [];
    if(config.axisXTickSkip === 'auto'){
        var previous = null;
        labelsX[0].forEach(function(d, i){
            var hide = false;
            if(previous){
                hide = parseFloat(d.style.left) - parseFloat(previous.style.left) < d.offsetWidth;
            }
            if(!hide){
                previous = d;
            }
            else{
                skipped.push(i);
            }
            d3.select(d).style({opacity: +!hide});
            return d.offsetWidth;
        });
    }

    labelsX.style(dadavis.attribute.axis.labelX(config, cache));

    labelsX.exit().remove();

    var ticksX = axisXContainer.selectAll('div.tick')
        .data(cache.axesLayout.x);

    ticksX.enter().append('div').classed('tick', true)
        .style({position: 'absolute'})
        .style({'background-color': 'black'});

    ticksX.style(dadavis.attribute.axis.tickX(config, cache))
        .style({
            height: function(d, i){
                if(config.axisXTickSkip === 'auto'){
                    var toSkip = skipped.indexOf(i) !== -1;
                    return (toSkip ? config.minorTickSize : config.tickSize) + 'px';
                }
                return ((i % config.axisXTickSkip) ? config.minorTickSize : config.tickSize) + 'px';
            }
        });

    ticksX.exit().remove();
};

dadavis.component.axisY = function(config, cache){

    if(!config.showAxes){
        return;
    }

    var axisYContainer = cache.container.select('.axis-y')
        .style({
            width: config.margin.left + 'px',
            height: cache.chartHeight + 'px',
            position: 'absolute',
            top: config.margin.top + 'px',
            left: 0 + 'px',
            'border-right': '1px solid black'
        });

    if(config.showFringe){
        var fringeY = axisYContainer.selectAll('div.fringe-y')
            .data(cache.layout[0]); // TODO only works for single layer

        fringeY.enter().append('div').classed('fringe-y', true)
            .style({position: 'absolute'});

        fringeY.style(dadavis.attribute.axis.fringeY(config, cache));

        fringeY.exit().remove();
    }

    if(config.showYGrid){
        var gridX = cache.container.select('.grid-y')
            .selectAll('div.grid-line-y')
            .data(cache.axesLayout.y);

        gridX.enter().append('div').classed('grid-line-y', true)
            .style({position: 'absolute'})
            .style({'background-color': '#eee'});

        gridX.style(dadavis.attribute.axis.gridY(config, cache));

        gridX.exit().remove();
    }

    var labelsY = axisYContainer.selectAll('div.label')
        .data(cache.axesLayout.y);

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
        .data(cache.axesLayout.y);

    ticksY.enter().append('div').classed('tick', true)
        .style({'background-color': 'black'});

    ticksY.style(dadavis.attribute.axis.tickY(config, cache));

    ticksY.exit().remove();
};

dadavis.component.legend = function(config, cache){

    if(!config.showLegend){
        return this;
    }

    var legend = cache.container.select('.legend')
        .style({
            position: 'absolute'
        });

    var legendItems = legend.selectAll('p.legend-item')
        .data(cache.legendLayout);

    legendItems.enter().append('p').classed('legend-item', true)
        .each(function(d, i){
            var that = this;
            var a = d3.select(this)
                .append('a')
                .style({
                    cursor: 'pointer'
                })
                .on('click', function(){
                    var element = d3.select(that);
                    d3.select(that).classed('unchecked', !element.classed('unchecked'));
                    var toHide = [];
                    legendItems.each(function(d){
                        if(this.classList.contains('unchecked')){
                            toHide.push(d.name);
                        }
                    });

                    cache.events.legendClick(toHide);
                    cache.internalEvents.legendClick(toHide);
                });

            a.append('span')
                .attr({
                    'class': 'legend-color'
                })
                .style({
                    display: 'inline-block',
                    width: 10 + 'px',
                    height: 10 + 'px',
                    'border-radius': 5 + 'px',
                    'background-color': function(d, i){
                        return d.color;
                    }
                });

            a.append('span')
                .attr({
                    'class': 'legend-name'
                })
                .style({
                    display: 'inline-block'
                })
                .html(function(){
                    return d.name;
                });
        });

    legendItems.exit().remove();

    legend.style({
        left: function(){
            return config.width - this.offsetWidth + 'px';
        }
    });
};

if(typeof define === "function" && define.amd){
    define(dadavis);
}
else if(typeof module === "object" && module.exports){
    var d3 = require('d3');
    module.exports = dadavis;
}
