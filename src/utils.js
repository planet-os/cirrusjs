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
    })
};
