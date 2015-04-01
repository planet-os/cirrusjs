dadavis.utils = {};

dadavis.utils.override = function(_objA, _objB) { for (var x in _objA) { if (x in _objB) { _objB[x] = _objA[x]; } } };

dadavis.utils.computeRandomNumericArray = function(count, min, max){
    return d3.range(count || 0).map(function(d, i){ return ~~(Math.random() * (max - min) + min); });
};

dadavis.utils.computeRandomTimeArray = function(count, min, max){
    return d3.range(count || 0).map(function(d, i){ return ~~(Math.random() * (max - min) + min); });
};

dadavis.utils.getRandomNumericData = function(maxShapeCount, maxLayerCount){
    var shapeCount = ~~(Math.random() * (maxShapeCount || 10)) + 2;
    var layerCount = ~~(Math.random() * (maxLayerCount || 5)) + 2;
    return d3.range(layerCount).map(function(d, i){
        return {name: 'name' + i, values: dadavis.utils.computeRandomNumericArray(shapeCount, 10, 100)};
    })
};

dadavis.utils.getRandomTimeData = function(maxShapeCount, maxLayerCount){
    var shapeCount = ~~(Math.random() * (maxShapeCount || 10)) + 2;
    var layerCount = ~~(Math.random() * (maxLayerCount || 5)) + 2;
    return d3.range(layerCount).map(function(d, i){
        return {name: 'name' + i, values: dadavis.utils.computeRandomTimeArray(shapeCount, 10, 100)};
    })
};
