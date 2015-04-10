dadavis.utils = {};

dadavis.utils.override = function(_objA, _objB){
    for(var x in _objA){
        if(x in _objB){
            _objB[x] = _objA[x];
        }
    }
};

dadavis.utils.computeRandomNumericArray = function(count, min, max){
    return d3.range(count || 0).map(function(d, i){
        return ~~(Math.random() * (max - min) + min);
    });
};

dadavis.utils.computeRandomTimeArray = function(count, dateNow){
    var dayInMillis = 1000 * 60 * 60 * 24;
    var dateNow = new Date().getTime() - count * dayInMillis;
    return d3.range(count || 0).map(function(d, i){
        return dateNow + i * dayInMillis;
    });
};

dadavis.utils.getRandomNumericData = function(shapeCount, layerCount){
    return d3.range(layerCount).map(function(d, i){
        return {
            name: 'name' + i,
            values: dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100)
        };
    })
};

dadavis.utils.getRandomTimeData = function(shapeCount, layerCount){
    var dateNow = new Date().getTime();
    return d3.range(layerCount).map(function(d, i){
        return {
            name: 'name' + i,
            values: dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100),
            keys: dadavis.utils.computeRandomTimeArray(shapeCount, dateNow),
        };
    });
};

dadavis.utils.throttle = function(callback, limit){
    var wait = false;
    var timer = null;
    return function(){
        if(!wait){
            callback.apply(this, arguments);
            wait = true;
            clearTimeout(timer);
            timer = setTimeout(function(){
                wait = false;
                callback.apply(this, arguments);
            }, limit);
        }
    };
};

dadavis.utils.convertToImage = function(config, cache){

    var clickEvent = new MouseEvent("click", {"view": window, "bubbles": true, "cancelable": false});

    var chartNode = cache.container.node();
    var xhtml = new XMLSerializer().serializeToString(chartNode);

    var size = {width: chartNode.offsetWidth, height: chartNode.offsetHeight, rootFontSize: 14};

    var XMLString = '<svg xmlns="http://www.w3.org/2000/svg"' +
        ' width="' + size.width + '"' +
        ' height="' + size.height + '"' +
        ' font-size="' + size.rootFontSize + '"' +
        '>' +
        '<foreignObject>' +
        xhtml +
        '</foreignObject>' +
        '</svg>';

    var canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    var ctx = canvas.getContext("2d");

    var img = new Image();
    img.onload = function(){
        ctx.drawImage(img, 0, 0);
        var png = canvas.toDataURL("image/png");
        var result = '<a href="' + png + '" download="converted-image">Download</a>';
        var pngContainer = document.createElement('div');
        pngContainer.id = '#png-container';
        pngContainer.innerHTML = result;
        pngContainer.querySelector('a').dispatchEvent(clickEvent);
    };
    img.src = "data:image/svg+xml;base64," + btoa(XMLString);
};
