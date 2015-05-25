dadavis.data = {};

dadavis.data.validate = function(config, cache, _data){
    var dataIsValid = false;
    if(_data && typeof _data === 'object'){
        var isNotNull = false;
        _data.forEach(function(d){
            isNotNull = isNotNull || !!d.values.length;
        });

        if(isNotNull){
            cache.previousData = _data;
            cache.data = _data;
            dataIsValid = true;
        }
    }

    if(cache.previousData){
        cache.data = cache.previousData;
        dataIsValid = true;
    }

    cache.visibleData = cache.data.filter(function(d){
        return cache.dataLayersToHide.indexOf(d.name) === -1;
    });

    return dataIsValid;
};