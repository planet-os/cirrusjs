cirrus.data = {};

cirrus.data.validate = function(config, _config, _data){

    var dataIsValid = false;
    if(_data && typeof _data === 'object'){
        var isNotNull = false;
        _data.forEach(function(d){
            isNotNull = isNotNull || !!d.values.length;
        });

        if(isNotNull){
            var data = JSON.parse(JSON.stringify(_data));
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