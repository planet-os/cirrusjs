cirrus.interaction = {};

cirrus.interaction.hovering = function(config, _config){

    var hoveringContainer = _config.container.select('.hovering')
        .style({
            width: _config.chartWidth + 'px',
            height: _config.chartHeight + 'px',
            position: 'absolute',
            opacity: 0
        });

    if(!!hoveringContainer.on('mousemove')){
        return this;
    }

    hoveringContainer
        .on('mousemove', function(){
            var mouse = d3.mouse(this);
            var x = _config.shapeLayout[0].points.map(function(d, i){
                return d.x;
            });

            //TODO should work with other than grid
            //var gridH = _config.shapeLayout[0][0].gridH;
            //var idxUnderMouseY = Math.floor((_config.chartHeight - mouse[1]) / gridH);
            //idxUnderMouseY = Math.min(idxUnderMouseY, _config.chartHeight / gridH - 1);

            var mouseOffsetX = _config.shapeLayout[0].width / 2;
            var idxUnderMouse = d3.bisect(x, mouse[0] - mouseOffsetX);
            idxUnderMouse = Math.min(idxUnderMouse, x.length - 1);

            var hoverData = {
                mouse: mouse,
                x: x,
                idx: idxUnderMouse,
                //idxY: idxUnderMouseY
                idxY: 0
            };

            setHovering(hoverData);

            _config.events.hover(hoverData);
        })
        .on('mouseenter', function(){
            hoveringContainer.style({opacity: 1});
        })
        .on('mouseout', function(){
            hoveringContainer.style({opacity: 0});
            _config.events.hoverOut();
        });

    var hoverLine = cirrus.interaction.hoverLine(config, _config);
    var tooltip = cirrus.interaction.tooltip(config, _config);

    _config.internalEvents.on('setHover', function(hoverData){
        setHovering(hoverData);
    });

    _config.internalEvents.on('hideHover', function(){
        hoveringContainer.style({opacity: 0});
    });

    var setHovering = function(hoverData){
        var dataUnderMouse = _config.shapeLayout[hoverData.idxY][hoverData.idx];

        var tooltipsData = _config.shapeLayout.map(function(d, i){
            return d[hoverData.idx];
        });

        if(!_config.multipleTooltip){
            tooltipsData = [tooltipsData[hoverData.idxY]];
        }

        hoveringContainer.style({opacity: 1});
        //hoverLine(dataUnderMouse);
        tooltip(tooltipsData);
    };
};

cirrus.interaction.tooltip = function(config, _config){

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
                    return d.y + 'px';
                },
                'background-color': function(d, i){
                    return d.color;
                }
            });
        tooltip.exit().remove();
    }
};

cirrus.interaction.hoverLine = function(config, _config){

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