import '../../lib/shims.js';
import elementClassFactory from '../../lib/rosettaElement.js';


describe('rosetta element test', () => {
    it('elementClassFactory', () => {
        var newClass = elementClassFactory({
            is: 'r-aaa',

            aaa: function() {
                console.log('enter');
            },

            properties: {
                a: {
                    type: String,
                    value: 'sssss'
                },

                testfunc: {
                    type: Function,
                    value: function(){
                        alert(this);
                    }
                }
            },
            testClick: function(e) {
                console.log(this);
                return false;
            },
            attached: function() {
                console.log(this);

                this.update({
                    a: 'dfsdfs'
                });

                // this.update({
                //     a: 'ddd'
                // });
            },
            changeSelect: function() {
            },
            attributeChanged: function() {
            }
        });
        var elem = new newClass({
            a: 1111
        });

        for(var key in elem) {
            console.log(key, ' ::: ' , elem[key]);
        }
    });
});
