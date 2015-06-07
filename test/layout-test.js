var expect = chai.expect;

describe('Layout', function() {

    var data, fixture;

    beforeEach(function(){
        data = [{name: 'name0', values: [{x: 1433101832287, y: 12}]}];
        fixture = document.querySelector('#fixture-container');
    });

    afterEach(function(){
        fixture.innerHTML = '';
    });

    it('computes layouts for shapes, axes, legends', function(){
        var config = {
            container: fixture,
            width: 300,
            height: 200,
            margin: {top: 0, right: 0, bottom: 0, left: 0},
            type: 'bar',
            subtype: 'simple',
            renderer: 'svg',
            scaleType: 'time'
        };

        var ds = cirrus.init(config).render(data);

        var internalConfig = ds._getConfig();

        var shapeLayout = internalConfig.shapeLayout[0];
        expect(shapeLayout[0].h).to.equal(config.height);
        expect(shapeLayout[0].key).to.equal(data[0].values[0].x);

        var axisLayoutX = internalConfig.axesLayout.x;
        expect(axisLayoutX[0].key).to.equal(data[0].values[0].x);

        var axisLayoutY = internalConfig.axesLayout.y;
        var labelsY = axisLayoutY.map(function(d){
            return d.label;
        });
        expect(labelsY).to.eql([0, 3, 6, 9, 12]);

        var legendLayout = internalConfig.legendLayout;
        expect(legendLayout[0].name).to.equal(data[0].name);
    });

});