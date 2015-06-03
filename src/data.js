dadavis.data = {};

dadavis.data.validate = function(config, _config, _data){

    var data = JSON.parse(JSON.stringify(_data));

    var dataIsValid = false;
    if(data && typeof data === 'object'){
        var isNotNull = false;
        data.forEach(function(d){
            isNotNull = isNotNull || !!d.values.length;
        });

        if(isNotNull){
            _config.previousData = data;
            _config.data = data;
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