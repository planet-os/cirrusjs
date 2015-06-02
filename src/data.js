dadavis.data = {};

dadavis.data.validate = function(config, _config, _data){
    var dataIsValid = false;
    if(_data && typeof _data === 'object'){
        var isNotNull = false;
        _data.forEach(function(d){
            isNotNull = isNotNull || !!d.values.length;
        });

        if(isNotNull){
            _config.previousData = _data;
            _config.data = _data;
            dataIsValid = true;
        }
    }

    if(_config.previousData){
        _config.data = _config.previousData;
        dataIsValid = true;
    }

    _config.visibleData = _config.data.filter(function(d){
        return _config.dataLayersToHide.indexOf(d.name) === -1;
    });

    return dataIsValid;
};