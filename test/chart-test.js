var expect = chai.expect;

describe('Chart', function() {

    var defaultData = dadavis.utils.getRandomTimeData(50, 5);
    var fixture, chartContainer1, chartContainer2;

    beforeEach(function(){
        fixture = document.querySelector('#fixture-container');

        chartContainer1 = document.createElement("div");
        chartContainer1.classList.add("chart-container");
        fixture.appendChild(chartContainer1);

        chartContainer2 = document.createElement("div");
        chartContainer2.classList.add("chart-container");
        fixture.appendChild(chartContainer2);
    });

    afterEach(function(){
        fixture.innerHTML = '';
    });

    describe('Instantiation', function(){

        it('works with minimal configuration', function(){
            dadavis.init({
                    container: chartContainer1
                })
                .render(defaultData);

            expect(chartContainer1.querySelector('.chart')).exist;
        });

        it('takes a selector or a DOM element as container', function(){
            dadavis.init({
                    container: '.chart-container'
                })
                .render(defaultData);

            expect(chartContainer1.querySelector('.chart')).exist;
        });

        it('can instantiate multiple charts', function(){
            dadavis.init({
                    container: chartContainer1
                })
                .render(defaultData);

            dadavis.init({
                    container: chartContainer2
                })
                .render(defaultData);

            expect(chartContainer1.querySelector('.chart')).exist;
            expect(chartContainer2.querySelector('.chart')).exist;
        });

    });

    describe('Rendering', function(){

        it('can use SVG or Canvas', function(){
            dadavis.init({
                    container: chartContainer1,
                    renderer: 'svg'
                })
                .render(defaultData);

            dadavis.init({
                    container: chartContainer2,
                    renderer: 'canvas'
                })
                .render(defaultData);

            expect(chartContainer1.querySelector('svg')).exist;
            expect(chartContainer1.querySelector('canvas')).to.be.null;
            expect(chartContainer2.querySelector('canvas')).exist;
            expect(chartContainer2.querySelector('svg')).to.be.null;
        });

        it('renders a set of components', function(){
            dadavis.init({
                    container: chartContainer1
                })
                .render(defaultData);

            var componentClasseNames = ['title', 'axis-title-x', 'axis-title-y', 'grid-x', 'grid-y',
                'panel', 'shape', 'axis-x', 'axis-y', 'legend'];

            componentClasseNames.forEach(function(componentClassName){
                expect(chartContainer1.querySelector('.' + componentClassName)).exist;
            });

        });

    });

});