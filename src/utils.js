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

    var x = d3.range(shapeCount);

    return d3.range(layerCount).map(function(d, i){
        var y = dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100);
        var values = d3.zip(x, y).map(function(d, i){
            return {x: d[0], y: d[1]};
        });
        return {
            name: 'name' + i,
            values: values
        };
    })
};

dadavis.utils.defaultColors = ['skyblue', 'orange', 'lime', 'orangered', 'violet', 'yellow', 'brown', 'pink'];

dadavis.utils.getRandomTimeData = function(shapeCount, layerCount){
    var dateNow = new Date().getTime();

    var x = dadavis.utils.computeRandomTimeArray(shapeCount, dateNow);

    return d3.range(layerCount).map(function(d, i){
        var y = dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100);
        var values = d3.zip(x, y).map(function(d, i){
            return {x: d[0], y: d[1]};
        });
        return {
            name: 'name' + i,
            values: values
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

dadavis.utils.convertToImage = function(config, _config, callback){

    var clickEvent = new MouseEvent("click", {"view": window, "bubbles": true, "cancelable": false});

    var chartNode = _config.container.node();
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
        if(!callback){
            var result = '<a href="' + png + '" download="converted-image">Download</a>';
            var pngContainer = document.createElement('div');
            pngContainer.id = '#png-container';
            pngContainer.innerHTML = result;
            pngContainer.querySelector('a').dispatchEvent(clickEvent);
        }
        else{
            callback.call(this, png);
        }
    };
    img.src = "data:image/svg+xml;base64," + btoa(XMLString);
};

dadavis.utils.extractValues = function(data, key){
    return data.map(function(d){
        return d.values.map(function(dB){
            return dB[key];
        });
    });
};

dadavis.utils.once = function once(fn, context) {
    var result;

    return function() {
        if(fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }
        return result;
    };
};
