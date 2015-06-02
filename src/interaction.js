dadavis.interaction = {};

dadavis.interaction.hovering = function(config, _config){

    var hoveringContainer = _config.container.select('.hovering')

    if(!!hoveringContainer.on('mousemove')){
        return this;
    }

    hoveringContainer.style({
            width: _config.chartWidth + 'px',
            height: _config.chartHeight + 'px',
            position: 'absolute',
            opacity: 0
        })
        .on('mousemove', function(){
            var mouse = d3.mouse(this);
            var x = _config.shapeLayout[0].map(function(d, i){
                return d.x;
            });

            var mouseOffset = _config.shapeLayout[0][0].w / 2;
            var idxUnderMouse = d3.bisect(x, mouse[0] - mouseOffset);
            idxUnderMouse = Math.min(idxUnderMouse, x.length - 1);

            setHovering(idxUnderMouse);

            _config.events.hover({
                mouse: mouse,
                x: x,
                idx: idxUnderMouse
            });
        })
        .on('mouseenter', function(){
            hoveringContainer.style({opacity: 1});
        })
        .on('mouseout', function(){
            hoveringContainer.style({opacity: 0});
            _config.events.hoverOut();
        });

    var hoverLine = dadavis.interaction.hoverLine(config, _config);
    var tooltip = dadavis.interaction.tooltip(config, _config);

    _config.internalEvents.on('setHover', function(hoverData){
        setHovering(hoverData.idx);
    });

    _config.internalEvents.on('hideHover', function(){
        hoveringContainer.style({opacity: 0});
    });

    var setHovering = function(idxUnderMouse){
        var dataUnderMouse = _config.shapeLayout[0][idxUnderMouse];

        var tooltipsData = _config.shapeLayout.map(function(d, i){
            return d[idxUnderMouse];
        });

        hoveringContainer.style({opacity: 1});
        hoverLine(dataUnderMouse);
        tooltip(tooltipsData);
    };
};

dadavis.interaction.tooltip = function(config, _config){

    return function(tooltipsData){
        var hoveringContainer = _config.container.select('.hovering');

        var tooltip = hoveringContainer.selectAll('.tooltip')
            .data(tooltipsData);
        tooltip.enter().append('div')
            .attr({'class': 'tooltip'})
            .style({
                position: 'absolute',
                'pointer-events': 'none',
                'z-index': 2
            });
        tooltip
            .html(function(d, i){
                return config.tooltipFormatter(d);
            })
            .style({
                left: function(d, i){
                    return d.x + 'px';
                },
                top: function(d, i){
                    var y = d.stackedY;
                    if(config.subtype === 'simple'){
                        y = d.y;
                    }
                    else if(config.subtype === 'percent'){
                        y = d.stackedPercentY;
                    }
                    return y + 'px';
                },
                'background-color': function(d, i){
                    return d.color;
                }
            });
        tooltip.exit().remove();
    }
};

dadavis.interaction.hoverLine = function(config, _config){

    var hoverLine = _config.container.select('.hovering')
        .append('div')
        .attr({'class': 'hover-line'})
        .style({
            position: 'absolute',
            width: '1px',
            height: _config.chartHeight + 'px',
            left: config.margin.left + 'px',
            'pointer-events': 'none'
        });

    return function(dataUnderMouse){

        hoverLine.style({
            left: dataUnderMouse.x + 'px'
        });
    };
};