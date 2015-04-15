dadavis.renderer = {svg: null, canvas: null};

dadavis.renderer.svg = function(element){
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
            .attr(attributes);
        return this;
    };

    return svgRenderer;
};

dadavis.renderer.canvas = function(element){
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
            return ;
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

    return canvasRenderer;
};