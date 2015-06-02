var expect = chai.expect;

describe('Attributes', function() {

    var data, fixture;

    beforeEach(function(){
        data = [{name: 'name0', values: [{x: 1433101832287, y: 12}]}];
        fixture = document.querySelector('#fixture-container');
    });

    afterEach(function(){
        fixture.innerHTML = '';
    });

    it('computes attributes for a bar shape', function(){
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

        var ds = dadavis.init(config).render(data);

        var internalConfig = ds._getConfig();
        var attributes = dadavis.attribute.bar.simple(config, internalConfig);

        expect(Object.keys(attributes[0][0])).to.eql(['x', 'y', 'width', 'height', 'color']);
    });

    it('computes attributes for a line shape', function(){
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

        var ds = dadavis.init(config).render(data);

        var internalConfig = ds._getConfig();
        var attributes = dadavis.attribute.line.simple(config, internalConfig);

        expect(Object.keys(attributes[0])).to.eql(['points', 'color']);
    });

});