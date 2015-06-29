cirrus.component = {};

cirrus.component.chart = function(config, _config){
    var chartContainer = _config.container.select('.chart').style({
        position: 'absolute',
        width: _config.width + 'px',
        height: _config.height + 'px'
    });

    var panelContainer = chartContainer.select('.panel').style({
        position: 'absolute',
        left: config.margin.left + 'px',
        top: config.margin.top + 'px',
        width: _config.chartWidth + 'px',
        height: _config.chartHeight + 'px'
    });

    var shapeContainer = chartContainer.select('.shape').style({
        position: 'absolute',
        width: _config.chartWidth + 'px',
        height: _config.chartHeight + 'px'
    });

};

cirrus.component.shapes = function(config, _config){

    var shapeAttr = cirrus.attribute[_config.type][_config.subtype](config, _config);

    var shapeContainer = _config.container.select('.shape');
    shapeContainer.html('');
    var renderer = cirrus.renderer[config.renderer](shapeContainer.node());

    //console.time('rendering');

    if(_config.type === 'line'){
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

cirrus.component.title = function(config, _config){

    if(config.chartTitle){
        _config.container.select('.title')
            .html(config.chartTitle)
            .style({
                width: '100%',
                'text-align': 'center'
            });
    }

    if(config.axisXTitle){
        _config.container.select('.axis-title-x')
            .html(config.axisXTitle)
            .style({
                top: function(){
                    return _config.height - this.offsetHeight + 'px';
                },
                position: 'absolute',
                width: '100%',
                'text-align': 'center'
            });
    }

    if(config.axisYTitle){
        _config.container.select('.axis-title-y')
            .html(config.axisYTitle)
            .style({
                transform: 'rotate(-90deg) translate(-' + _config.height / 2 + 'px)',
                'transform-origin': '0 0'
            });
    }
};

cirrus.component.axisX = function(config, _config){

    if(!config.showAxes){
        return;
    }

    var axisXContainer = _config.container.select('.axis-x')
        .style({
            width: _config.chartWidth + 'px',
            height: config.margin.bottom + 'px',
            position: 'absolute',
            top: _config.chartHeight + config.margin.top + 'px',
            left: config.margin.left + 'px',
            'border-top': '1px solid black'
        });

    if(config.showFringe){
        var fringeX = axisXContainer.selectAll('div.fringe-x')
            .data(_config.shapeLayout[0]);

        fringeX.enter().append('div').classed('fringe-x', true)
            .style({position: 'absolute'});

        fringeX.style(cirrus.attribute.axis.fringeX(config, _config));

        fringeX.exit().remove();
    }

    var labelsX = axisXContainer.selectAll('div.label')
        .data(_config.axesLayout.x);

    labelsX.enter().append('div').classed('label', true)
        .style({
            position: 'absolute'
        });

    labelsX
        .html(function(d, i){
            return config.labelFormatterX(d.key, i);
        })
        .style(cirrus.attribute.axis.labelX(config, _config));

    labelsX.style(cirrus.attribute.axis.labelX(config, _config));

    labelsX.exit().remove();

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

    if(config.showXGrid){
        var gridX = _config.container.select('.grid-x')
            .selectAll('div.grid-line-x')
            .data(_config.axesLayout.x);

        gridX.enter().append('div').classed('grid-line-x', true)
            .style({position: 'absolute'})
            .style({'background-color': '#eee'});

        gridX.style(cirrus.attribute.axis.gridX(config, _config));

        if(config.axisXTickSkip === 'auto'){
            gridX.style({
                height: function(d, i){
                    var toSkip = skipped.indexOf(i) !== -1;
                    return (toSkip ? 0 : d.height) + 'px';
                }
            });
        }

        gridX.exit().remove();
    }

    var ticksX = axisXContainer.selectAll('div.tick')
        .data(_config.axesLayout.x);

    ticksX.enter().append('div').classed('tick', true)
        .style({position: 'absolute'})
        .style({'background-color': 'black'});

    ticksX.style(cirrus.attribute.axis.tickX(config, _config));

    if(config.axisXTickSkip === 'auto'){
        ticksX.style({
            height: function(d, i){
                var toSkip = skipped.indexOf(i) !== -1;
                return (toSkip ? config.minorTickSize : config.tickSize) + 'px';
            }
        });
    }

    ticksX.exit().remove();
};

cirrus.component.axisY = function(config, _config){

    if(!config.showAxes){
        return;
    }

    var axisYContainer = _config.container.select('.axis-y')
        .style({
            width: config.margin.left + 'px',
            height: _config.chartHeight + 'px',
            position: 'absolute',
            top: config.margin.top + 'px',
            left: 0 + 'px',
            'border-right': '1px solid black'
        });

    if(config.showFringe){
        var fringeY = axisYContainer.selectAll('div.fringe-y')
            .data(_config.shapeLayout[0]); // TODO only works for single layer

        fringeY.enter().append('div').classed('fringe-y', true)
            .style({position: 'absolute'});

        fringeY.style(cirrus.attribute.axis.fringeY(config, _config));

        fringeY.exit().remove();
    }

    if(config.showYGrid){
        var gridX = _config.container.select('.grid-y')
            .selectAll('div.grid-line-y')
            .data(_config.axesLayout.y);

        gridX.enter().append('div').classed('grid-line-y', true)
            .style({position: 'absolute'})
            .style({'background-color': '#eee'});

        gridX.style(cirrus.attribute.axis.gridY(config, _config));

        gridX.exit().remove();
    }

    var labelsY = axisYContainer.selectAll('div.label')
        .data(_config.axesLayout.y);

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
        .style(cirrus.attribute.axis.labelY(config, _config));

    labelsY.exit().remove();

    var ticksY = axisYContainer.selectAll('div.tick')
        .data(_config.axesLayout.y);

    ticksY.enter().append('div').classed('tick', true)
        .style({'background-color': 'black'});

    ticksY.style(cirrus.attribute.axis.tickY(config, _config));

    ticksY.exit().remove();
};

cirrus.component.legend = function(config, _config){

    if(!config.showLegend){
        return this;
    }

    var legend = _config.container.select('.legend')
        .style({
            position: 'absolute'
        });

    var legendItems = legend.selectAll('p.legend-item')
        .data(_config.legendLayout);

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

                    _config.events.legendClick(toHide);
                    _config.internalEvents.legendClick(toHide);
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
            return _config.width - this.offsetWidth + 'px';
        }
    });
};

if(typeof define === "function" && define.amd){
    define(cirrus);
}
else if(typeof module === "object" && module.exports){
    var d3 = require('d3');
    module.exports = cirrus;
}
