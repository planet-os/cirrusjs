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

    svgRenderer.polygon = function(attributes){
        svg.append('path')
            .attr({
                d: 'M' + attributes.points.join('L'),
                fill: attributes.fill || 'silver',
                stroke: attributes.stroke || 'silver'
            });
        return this;
    };

    svgRenderer.rect = function(attributes){
        path = svg.append('rect')
            .attr(attributes.rect)
            .attr({
                fill: attributes.fill || 'silver',
                stroke: attributes.stroke || 'silver'
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

    canvasRenderer.polygon = function(attributes){
        var fill = attributes.fill;
        if(attributes.fill === 'none' || !attributes.fill){
            fill = 'transparent'
        }
        ctx.fillStyle = fill;
        ctx.strokeStyle = attributes.stroke;
        ctx.beginPath();
        attributes.points.forEach(function(d, i){
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

    canvasRenderer.rect = function(attributes){
        ctx.fillStyle = attributes.fill;
        ctx.strokeStyle = attributes.stroke;
        ctx.fillRect(attributes.rect.x, attributes.rect.y, attributes.rect.width, attributes.rect.height);
        return this;
    };

    canvasRenderer.circle = function(attributes){
        ctx.fillStyle = attributes.fill;
        ctx.strokeStyle = attributes.stroke;
        context.beginPath();
        context.arc(attributes.circle.x, attributes.circle.y, attributes.circle.r, 0, 2 * Math.PI, false);
        context.fill();
        context.stroke();

        return this;
    };

    return canvasRenderer;
};