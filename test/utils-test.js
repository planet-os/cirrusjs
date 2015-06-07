var expect = chai.expect;

describe('Utils', function() {

    it('generates random data for testing', function(){
        var randomNumericData = cirrus.utils.getRandomNumericData(2, 3);

        expect(randomNumericData[0].name).to.equal('name0');
        expect(randomNumericData[0].values[0].x).to.satisfy(function(d){ return typeof d === 'number'; });
        expect(randomNumericData[0].values[0].y).to.satisfy(function(d){ return typeof d === 'number'; });

        var randomTimeData = cirrus.utils.getRandomTimeData(2, 3);
        var firstDate = new Date(randomTimeData[0].values[0].x);

        expect(firstDate.getFullYear()).to.equal(2015);
    });

});