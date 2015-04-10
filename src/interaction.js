dadavis.interaction = {};

dadavis.interaction.hovering = function(config, cache){

    var hoveringContainer = cache.container.select('.hovering')
        .style({
            width: cache.chartWidth + 'px',
            height: cache.chartHeight + 'px',
            position: 'absolute',
            opacity: 0
        })
        .on('mousemove', function(){
            var mouse = d3.mouse(this);
            var x = cache.layout[0].map(function(d, i){
                return d.x;
            });

            var idxUnderMouse = d3.bisect(x, mouse[0] - cache.layout[0][0].w / 2);
            var dataUnderMouse = cache.layout[0][idxUnderMouse];

            var tooltipsData = cache.layout.map(function(d, i){
                return d[idxUnderMouse];
            });

            hoverLine(dataUnderMouse);
            tooltip(tooltipsData);
        })
        .on('mouseenter', function(){
            hoveringContainer.style({opacity: 1});
        })
        .on('mouseout', function(){
            hoveringContainer.style({opacity: 0});
        });

    var hoverLine = dadavis.interaction.hoverLine(config, cache);
    var tooltip = dadavis.interaction.tooltip(config, cache);
};

dadavis.interaction.tooltip = function(config, cache){

    return function(tooltipsData){
        var hoveringContainer = cache.container.select('.hovering');

        var tooltip = hoveringContainer.selectAll('.tooltip')
            .data(tooltipsData);
        tooltip.enter().append('div')
            .attr({'class': 'tooltip'})
            .style({
                position: 'absolute',
                'pointer-events': 'none'
            });
        tooltip
            .html(function(d, i){
                return d.value;
            })
            .style({
                left: function(d, i){
                    return ((config.type === 'bar') ? d.paddedX + d.paddedW / 2 : d.x) + 'px';
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
                    return config.colors[i];
                }
            });
        tooltip.exit().remove();
    }
};

dadavis.interaction.hoverLine = function(config, cache){

    var hoverLine = cache.container.select('.hovering')
        .append('div')
        .attr({'class': 'hover-line'})
        .style({
            position: 'absolute',
            width: '1px',
            height: cache.chartHeight + 'px',
            left: config.margin.left + 'px',
            'pointer-events': 'none'
        });

    return function(dataUnderMouse){
        var hoverLineX = (config.type === 'bar') ? dataUnderMouse.paddedX + dataUnderMouse.paddedW / 2 : dataUnderMouse.x;

        hoverLine.style({
            left: hoverLineX + 'px'
        });
    };
};