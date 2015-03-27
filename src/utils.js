dadaviz.utils = {};

dadaviz.utils.override = function(_objA, _objB) { for (var x in _objA) { if (x in _objB) { _objB[x] = _objA[x]; } } };

dadaviz.utils.computeRandomArray = function(count, min, max){
    return d3.range(count || 0).map(function(d, i){ return ~~(Math.random() * (max - min) + min); });
};

dadaviz.utils.getRandomData = function(){
    var shapeCount = ~~(Math.random() * 10) + 2;
    var layerCount = ~~(Math.random() * 5) + 2;
    return d3.range(layerCount).map(function(d, i){
        return {name: 'name' + i, values: dadaviz.utils.computeRandomArray(shapeCount, 10, 100)};
    })
};
