cirrus.renderer = {svg: null, canvas: null};

cirrus.renderer.svg = function(element){
    var svgRenderer = {};
    var svg = d3.select(element).append('svg')
        .attr({
            width: element.offsetWidth,
            height: element.offsetHeight
        })
        .style({
            position: 'absolute'
        });

    svgRenderer.polygon = function(options){
        var points = options.attributes.map(function(d){
            return [d.x, d.y];
        });

        svg.append('path')
            .attr({
                d: 'M' + points.join('L'),
                fill: options.fill || 'silver',
                stroke: options.stroke || 'silver'
            });
        return this;
    };

    svgRenderer.rect = function(options){
        path = svg.append('rect')
            .attr(options.attributes)
            .attr({
                fill: options.fill || 'silver',
                stroke: options.stroke || 'silver'
            });
        return this;
    };

    return svgRenderer;
};

cirrus.renderer.canvas = function(element){
    var canvasRenderer = {};
    var canvas = d3.select(element).append('canvas')
        .attr({
            width: element.offsetWidth,
            height: element.offsetHeight
        })
        .style({
            position: 'absolute'
        });
    var path = null;
    var ctx = canvas.node().getContext("2d");

    canvasRenderer.polygon = function(options){
        var points = options.attributes.map(function(d){
            return [d.x, d.y];
        });

        var fill = options.fill;
        if(options.fill === 'none' || !options.fill){
            fill = 'transparent'
        }
        ctx.fillStyle = fill;
        ctx.strokeStyle = options.stroke;
        ctx.beginPath();
        points.forEach(function(d, i){
            if(i === 0){
                ctx.moveTo(d[0], d[1]);
            }
            else{
                ctx.lineTo(d[0], d[1]);
            }
        });
        ctx.fill();
        ctx.stroke();
        return this;
    };

    canvasRenderer.rect = function(options){
        ctx.fillStyle = options.fill;
        ctx.strokeStyle = options.stroke;
        ctx.fillRect(options.attributes.x, options.attributes.y, options.attributes.width, options.attributes.height);
        return this;
    };

    canvasRenderer.circle = function(options){
        ctx.fillStyle = options.fill;
        ctx.strokeStyle = options.stroke;
        context.beginPath();
        context.arc(options.x, options.y, options.r, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();

        return this;
    };

    return canvasRenderer;
};