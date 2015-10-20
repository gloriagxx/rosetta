import '../../lib/shims.js';
import * as utils from '../../es6lib/utils.js';

var typeCases = [
    '1',
    undefined,
    function() {},
    123, ({
        a: 1
    }),
    true,
    false,
    'false',
    null,
    Date(), +new Date(),
    document.createElement('div'), [1, 2, 3]
];

describe('utils test', () => {
    it('type value handler test', () => {
        var typeHandlers = utils.typeHandlers;

        var caseStr = 'test';
        var caseUndefined = undefined;
        var caseDate = +Date();
        var caseBoolean = 'true';
        var caseNumber = 1111.3;
        var caseObject = {
            testa: '1',
            testb: 'testb'
        };
        var caseFunc = function() {
            console.log('test func');
        };


        expect(caseStr).toBe(typeHandlers['string'](caseStr));
        expect(caseUndefined).toBe(typeHandlers['undefined'](caseUndefined));
        expect('object').toBe(typeof typeHandlers['date'](caseDate));
        expect(true).toBe(typeHandlers['boolean'](caseBoolean));
        expect(caseNumber).toBe(typeHandlers['number'](caseNumber + ''));
        expect(caseObject).toEqual(typeHandlers['object'](JSON.stringify(caseObject)));
        expect(caseFunc).toBe(typeHandlers['function'](caseFunc, caseFunc));
    });

    it('isString test', () => {
        expect(true).toBe(utils.isString(typeCases[0]));
        expect(false).toBe(utils.isString(typeCases[1]));
        expect(false).toBe(utils.isString(typeCases[2]));
        expect(false).toBe(utils.isString(typeCases[3]));
        expect(false).toBe(utils.isString(typeCases[4]));
        expect(false).toBe(utils.isString(typeCases[5]));
        expect(false).toBe(utils.isString(typeCases[6]));
        expect(true).toBe(utils.isString(typeCases[7]));
        expect(false).toBe(utils.isString(typeCases[8]));
        expect(true).toBe(utils.isString(typeCases[9]));
        expect(false).toBe(utils.isString(typeCases[10]));
        expect(false).toBe(utils.isString(typeCases[11]));
    });

    it('isDomNode test', () => {
        expect(false).toBe(utils.isDomNode(typeCases[0]));
        expect(false).toBe(utils.isDomNode(typeCases[1]));
        expect(false).toBe(utils.isDomNode(typeCases[2]));
        expect(false).toBe(utils.isDomNode(typeCases[3]));
        expect(false).toBe(utils.isDomNode(typeCases[4]));
        expect(false).toBe(utils.isDomNode(typeCases[5]));
        expect(false).toBe(utils.isDomNode(typeCases[6]));
        expect(false).toBe(utils.isDomNode(typeCases[7]));
        expect(false).toBe(utils.isDomNode(typeCases[8]));
        expect(false).toBe(utils.isDomNode(typeCases[9]));
        expect(false).toBe(utils.isDomNode(typeCases[10]));
        expect(true).toBe(utils.isDomNode(typeCases[11]));
    });

    it('isOriginalTag test', () => {
        expect(false).toBe(utils.isOriginalTag('r-aaa'));
        expect(true).toBe(utils.isOriginalTag('div'));
    });

    it('isWindow test', () => {
        expect(true).toBe(utils.isWindow(window));
        expect(false).toBe(utils.isWindow(null));
        expect(false).toBe(utils.isWindow(''));
    });

    it('isPlainObject test', () => {
        expect(false).toBe(utils.isPlainObject(typeCases[0]));
        expect(false).toBe(utils.isPlainObject(typeCases[1]));
        expect(false).toBe(utils.isPlainObject(typeCases[2]));
        expect(false).toBe(utils.isPlainObject(typeCases[3]));
        expect(true).toBe(utils.isPlainObject(typeCases[4]));
        expect(false).toBe(utils.isPlainObject(typeCases[5]));
        expect(false).toBe(utils.isPlainObject(typeCases[6]));
        expect(false).toBe(utils.isPlainObject(typeCases[7]));
        expect(false).toBe(utils.isPlainObject(typeCases[9]));
        expect(false).toBe(utils.isPlainObject(typeCases[10]));
        expect(false).toBe(utils.isPlainObject(typeCases[11]));
        expect(false).toBe(utils.isPlainObject(typeCases[12]));
        expect(false).toBe(utils.isPlainObject(typeCases[8]));
    });

    it('isArray test', () => {
        expect(false).toBe(utils.isArray(typeCases[0]));
        expect(false).toBe(utils.isArray(typeCases[1]));
        expect(false).toBe(utils.isArray(typeCases[2]));
        expect(false).toBe(utils.isArray(typeCases[3]));
        expect(false).toBe(utils.isArray(typeCases[4]));
        expect(false).toBe(utils.isArray(typeCases[5]));
        expect(false).toBe(utils.isArray(typeCases[6]));
        expect(false).toBe(utils.isArray(typeCases[7]));
        expect(false).toBe(utils.isArray(typeCases[8]));
        expect(false).toBe(utils.isArray(typeCases[9]));
        expect(false).toBe(utils.isArray(typeCases[10]));
        expect(false).toBe(utils.isArray(typeCases[11]));
        expect(true).toBe(utils.isArray(typeCases[12]));
    });
    it('isObject test', () => {
        expect(false).toBe(utils.isObject(typeCases[0]));
        expect(false).toBe(utils.isObject(typeCases[1]));
        expect(false).toBe(utils.isObject(typeCases[2]));
        expect(false).toBe(utils.isObject(typeCases[3]));
        expect(true).toBe(utils.isObject(typeCases[4]));
        expect(false).toBe(utils.isObject(typeCases[5]));
        expect(false).toBe(utils.isObject(typeCases[6]));
        expect(false).toBe(utils.isObject(typeCases[7]));
        expect(true).toBe(utils.isObject(typeCases[8]));
        expect(false).toBe(utils.isObject(typeCases[9]));
        expect(false).toBe(utils.isObject(typeCases[10]));
        expect(true).toBe(utils.isObject(typeCases[11]));
        expect(true).toBe(utils.isObject(typeCases[12]));
    });

    it('isFunction test', () => {
        expect(false).toBe(utils.isFunction(typeCases[0]));
        expect(false).toBe(utils.isFunction(typeCases[1]));
        expect(true).toBe(utils.isFunction(typeCases[2]));
        expect(false).toBe(utils.isFunction(typeCases[3]));
        expect(false).toBe(utils.isFunction(typeCases[4]));
        expect(false).toBe(utils.isFunction(typeCases[5]));
        expect(false).toBe(utils.isFunction(typeCases[6]));
        expect(false).toBe(utils.isFunction(typeCases[7]));
        expect(false).toBe(utils.isFunction(typeCases[8]));
        expect(false).toBe(utils.isFunction(typeCases[9]));
        expect(false).toBe(utils.isFunction(typeCases[10]));
        expect(false).toBe(utils.isFunction(typeCases[11]));
        expect(false).toBe(utils.isFunction(typeCases[12]));
    });


    it('extend test', () => {
        var target = {
            a: {
                b: {
                    c: 123
                }
            }
        };
        var case1 = {
            a: {
                b: 112
            }
        };
        var result = utils.extend({}, target, case1, true);

        expect(result).toEqual({
            a: {
                b: 112
            }
        });
        expect(target).toEqual({
            a: {
                b: {
                    c: 123
                }
            }
        });
        case1 = {
            a: {
                b: [1, 2, 3]
            }
        };
        target = {
            a: {
                b: [1, 2, 3]
            }
        };

        expect(result).toEqual({
            a: {
                b: 112
            }
        });


        case1 = {
            a: {
                c: {
                    bb: 1212
                }
            }
        };
        var re = utils.extend({}, case1, true);
        case1.a.c = 222;
        expect(re).toEqual({
            a: {
                c: {
                    bb: 1212
                }
            }
        });

    });

    it('camelize test', () => {
        //
        let case1 = 'r-aaa';

        expect(utils.camelize(case1)).toBe('rAaa');
        // 
        let case2 = 'r';
        expect(utils.camelize(case2)).toBe('r');
    });

    it('toPlainArray test', () => {
        let case1 = [];
        expect(utils.toPlainArray(case1)).toEqual([]);

        case1 = [1, 2];
        expect(utils.toPlainArray(case1)).toEqual([1, 2]);

        case1 = [1, 2, []];
        expect(utils.toPlainArray(case1)).toEqual([1, 2, ]);

        case1 = [1, 2, [3]];
        expect(utils.toPlainArray(case1)).toEqual([1, 2, 3]);

        case1 = [1, 2, [3, [4]]];
        expect(utils.toPlainArray(case1)).toEqual([1, 2, 3, 4]);
    });


    // it('query test', () => {

    // });


    // it('bind test', () => {

    // });


    // it('fire test', () => {

    // });

    it('deserializeValue test', () => {
        // string
        let value = '111';
        let currentValue = '222';
        expect(utils.deserializeValue(value, String, currentValue)).toBe(value);


        // json
        value = '{"a": 1, "b": 2, "c": {"d": 3}}';
        currentValue = {
            aaa: 1
        };
        expect(utils.deserializeValue(value, Object, currentValue)).toEqual({
            a: 1,
            b: 2,
            c: {
                d: 3
            }
        });

        //array
        value = '[1,2,4]';
        currentValue = [2,35,3];
        expect(utils.deserializeValue(value, Array, currentValue)).toEqual([1,2,4]);

        // date
        value = new Date();
        currentValue = new Date();
        expect(+utils.deserializeValue(+value, Date, currentValue)).toEqual(+value);

        //undefined
        value = undefined;
        expect(utils.deserializeValue(value)).toEqual(undefined);

        //boolean

        value = 'false';
        expect(utils.deserializeValue(value, Boolean), true).toBe(false);

        //number
        value = '12.3';
        expect(utils.deserializeValue(value, Number), 12).toBe(12.3);

        //function
        value = 'function() {alert(1);}';
        expect(utils.deserializeValue(value, Function, (function(){return 1})())).toEqual((function(){return 1})());
    });
});
