cirrus.component = {};

cirrus.component.chart = function(config){
    var chartContainer = config.container.select('.chart').style({
        position: 'absolute',
        width: config.width + 'px',
        height: config.height + 'px'
    });

    var panelContainer = chartContainer.select('.panel').style({
        position: 'absolute',
        left: config.margin.left + 'px',
        top: config.margin.top + 'px',
        width: config.chartWidth + 'px',
        height: config.chartHeight + 'px'
    });

    var shapeContainer = chartContainer.select('.shape').style({
        position: 'absolute',
        width: config.chartWidth + 'px',
        height: config.chartHeight + 'px'
    });

};

cirrus.component.shapes = function(config){

    var shapeAttr = config.shapeLayout;

    var shapeContainer = config.container.select('.shape');
    shapeContainer.html('');
    var renderer = cirrus.renderer[config.renderer](shapeContainer.node());

    //console.time('rendering');

    if(config.type === 'line' && config.subtype === 'area'){
        shapeAttr.forEach(function(d, i){
            var previousAttributes = null;
            var strokeColor = d[0].color;
            var fillColor = 'transparent';
            if(i === 0){
                previousAttributes = JSON.parse(JSON.stringify(d))
                    .map(function(d){
                        d.y = config.chartHeight;
                        return d;
                    });
            }
            else{
                previousAttributes = JSON.parse(JSON.stringify(shapeAttr[i-1]));
            }
            var points = d.concat(previousAttributes.reverse())
                .map(function(d){
                    return [d.x, d.y];
                });
            renderer.polygon({points: points, fill: strokeColor, stroke: fillColor});
        });
    }
    else if(config.type === 'line'){
        shapeAttr.forEach(function(d, i){
            var points = d.map(function(d){
                    return [d.x, d.y];
                });
            var strokeColor = 'transparent';
            var fillColor = d[0].color;
            renderer.polygon({points: points, fill: strokeColor, stroke: fillColor});
        });
    }
    else if(config.type === 'grid' && config.subtype === 'heatmap'){
        shapeAttr.forEach(function(d, i){
            d.forEach(function(dB, iB){
                renderer.rect({attributes: dB, fill: dB.color, stroke: dB.color});
            });
        });
    }
    else if(config.type === 'grid' && config.subtype === 'contour'){
        shapeAttr.forEach(function(d, i){
            var points = d.map(function(d){
                    return [d.x, d.y];
                });
            renderer.polygon({points: points, fill: d[0].color, stroke: d[0].color});
        });
    }
    else{
        shapeAttr.forEach(function(d, i){
            d.forEach(function(dB, iB){
                renderer.rect({attributes: dB, fill: dB.color, stroke: dB.color});
            });
        });
    }
    //console.timeEnd('rendering');

    return this;
};

cirrus.component.title = function(config){

    if(config.chartTitle){
        config.container.select('.title')
            .html(config.chartTitle)
            .style({
                width: '100%',
                'text-align': 'center'
            });
    }

    if(config.axisXTitle){
        config.container.select('.axis-title-x')
            .html(config.axisXTitle)
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
        config.container.select('.axis-title-y')
            .html(config.axisYTitle)
            .style({
                transform: 'rotate(-90deg) translate(-' + config.height / 2 + 'px)',
                'transform-origin': '0 0'
            });
    }
};

cirrus.component.axisX = function(config){

    if(!config.showAxes){
        return;
    }

    // TODO: use renderer (needs new text, line could proxy to polygon)

    // in layout
    config.axisXPositionLayout = function(){
        return {
            width: config.chartWidth + 'px',
            height: config.margin.bottom + 'px',
            position: 'absolute'
        };
    };

    var axisLines = cirrus.layout.axes.line(config);
    var axisXContainer = config.container.select('.axis-x');
    axisXContainer.append('div').classed('axis-x-line', true)
        .style({position: 'absolute', 'background-color': 'black'})
        .style({
            top: axisLines.lineXTop,
            left: axisLines.lineXLeft,
            width: axisLines.lineXWidth,
            height: axisLines.lineXHeight
        });

    config.axesLayout.x.forEach(function(d){
        axisXContainer.append('div').classed('label', true)
            .style({position: 'absolute'})
            .style({
                top: d.top,
                left: d.left,
                'transform-origin': d['transform-origin'],
                transform: d.transform
            })
            .html(d.label);
    });

    if(config.showXGrid){

        config.axesLayout.x.forEach(function(d){
            axisXContainer.append('div').classed('grid-line-x', true)
                .style({position: 'absolute', 'background-color': 'black'})
                .style({
                    top: d.gridTop,
                    left: d.gridLeft,
                    width: d.gridWidth,
                    height: d.gridHeight
                });
        });
    }

    config.axesLayout.x.forEach(function(d){
        axisXContainer.append('div').classed('tick', true)
            .style({position: 'absolute', 'background-color': 'black'})
            .style({
                top: d.tickTop,
                left: d.tickLeft,
                width: d.tickWidth,
                height: d.tickHeight
            });
    });
};

cirrus.component.axisY = function(config){

    if(!config.showAxes){
        return;
    }

    var axisYContainer = config.container.select('.axis-y')
        .style({
            width: config.margin.left + 'px',
            height: config.chartHeight + 'px',
            position: 'absolute',
            top: config.margin.top + 'px',
            left: 0 + 'px',
            'border-right': '1px solid black'
        });

    if(config.showYGrid){
        var gridX = config.container.select('.grid-y')
            .selectAll('div.grid-line-y')
            .data(config.axesLayout.y);

        gridX.enter().append('div').classed('grid-line-y', true)
            .style({position: 'absolute'})
            .style({'background-color': '#eee'});

        gridX.style(cirrus.attribute.axis.gridY(config));

        gridX.exit().remove();
    }

    var labelsY = axisYContainer.selectAll('div.label')
        .data(config.axesLayout.y);

    labelsY.enter().append('div').classed('label', true);

    labelsY
        .html(function(d, i){
            if(config.subtype === 'simple' || config.subtype === 'grid'){
                return d.label;
            }
            else{
                return d.stackedLabel;
            }
        })
        .style(cirrus.attribute.axis.labelY(config));

    labelsY.exit().remove();

    var ticksY = axisYContainer.selectAll('div.tick')
        .data(config.axesLayout.y);

    ticksY.enter().append('div').classed('tick', true)
        .style({'background-color': 'black'});

    ticksY.style(cirrus.attribute.axis.tickY(config));

    ticksY.exit().remove();
};

cirrus.component.legend = function(config){

    if(!config.showLegend){
        return this;
    }

    var legend = config.container.select('.legend')
        .style({
            position: 'absolute'
        });

    var legendItems = legend.selectAll('p.legend-item')
        .data(config.legendLayout);

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

                    config.events.legendClick(toHide);
                    config.internalEvents.legendClick(toHide);
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
    define(cirrus);
}
else if(typeof module === "object" && module.exports){
    var d3 = require('d3');
    module.exports = cirrus;
}
