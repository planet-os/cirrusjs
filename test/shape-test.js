var expect = chai.expect;

describe('Shape', function() {

    var defaultData = dadavis.utils.getRandomTimeData(50, 5);
    var fixture;

    beforeEach(function(){
        fixture = document.querySelector('#fixture-container');
    });

    afterEach(function(){
        fixture.innerHTML = '';
    });

    describe('Rendering', function(){

        it('renders bars', function(){
            dadavis.init({
                    container: fixture,
                    renderer: 'svg',
                    type: 'bar'
                })
                .render(defaultData);

            var bars = fixture.querySelector('svg rect');

            expect(bars).to.exist;
        });

        it('renders lines', function(){
            dadavis.init({
                    container: fixture,
                    renderer: 'svg',
                    type: 'line'
                })
                .render(defaultData);

            var bars = fixture.querySelector('svg path');

            expect(bars).to.exist;
        });

    });

});