cirrus.data = {};

cirrus.data.validate = function(config, _data){

    var dataIsValid = false;
    if(_data && typeof _data === 'object'){
        var isNotNull = false;
        _data.forEach(function(d){
            isNotNull = isNotNull || !!d.values.length;
        });
        if(isNotNull){
            var data = JSON.parse(JSON.stringify(_data));
            config.previousData = data;
            config.data = data;
            dataIsValid = true;
        }
    }
    else if(config.previousData){
        config.data = config.previousData;
        dataIsValid = true;
    }

    if(config.data){
        config.visibleData = config.data.filter(function(d){
            return config.dataLayersToHide.indexOf(d.name) === -1;
        });
    }

    return dataIsValid;
};