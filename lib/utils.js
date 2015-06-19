function noopHandler(value) {
    return value;
}

var plainDom = require('./plainDom.js'),

    isString = module.exports.isString = function(elem) {
        return typeof elem == 'string';
    },

    isDomNode = module.exports.isDomNode = function(elem) {
        return !!(elem && elem.nodeType === 1);
    },

    isOriginalTag = module.exports.isOriginalTag = function(str) {
        return !!plainDom[str];
    },

    isWindow = module.exports.isWindow = function(obj) {
        return obj != null && obj == obj.window;
    },

    isPlainObject = module.exports.isPlainObject = function(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    },

    isArray = module.exports.isArray = function(value) {
        return value instanceof Array;
    },

    isObject = module.exports.isObject = function(value) {
        return typeof value == 'object';
    },

    isFunction = module.exports.isFunction = function(obj) {
        return typeof obj == 'function' || false;
    }

    extend = module.exports.extend = function(target) {
        var end = [].slice.call(arguments, arguments.length - 2),
            deep = false,
            params = null;

        target = target || {};

        if (end === true) {
            deep = true;
            params = [].slice.call(arguments, 1, arguments.length - 2);
        } else {
            params = [].slice.call(arguments, 1);
        }

        params.map(function(source, index) {
            for (key in source) {
                if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                    if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                        target[key] = {};
                    }

                    if (isArray(source[key]) && !isArray(target[key])) {
                        target[key] = [];
                    }

                    extend(target[key], source[key], deep);
                } else if (source[key] !== undefined) {
                    target[key] = source[key];
                }
            }
        });

        return target;
    },

    camelize = module.exports.camelize = function(key) {
        var _reg = /-(.)/g;
        return key.replace(_reg, function(_, txt) {
            return txt.toUpperCase();
        });
    },

    toPlainArray = module.exports.toPlainArray = function(data, result) {
        if (!result) {
            var result = [];
        }

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (isArray(item)) {
                toPlainArray(item, result);
            } else {
                result.push(item);
            }
        }

        return result;
    },

    query = module.exports.query = function(selector, element) {
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            slice = [].slice,
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
            simpleSelectorRE = /^[\w-]*$/,
            isSimple = simpleSelectorRE.test(nameOnly);

        if (!element) {
            element = document;
        }

        return (element.getElementById && isSimple && maybeID) ?
            ((found = element.getElementById(nameOnly)) ? [found] : []) :
            (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
            slice.call(
                isSimple && !maybeID && element.getElementsByClassName ?
                maybeClass ? element.getElementsByClassName(nameOnly) :
                element.getElementsByTagName(selector) :
                element.querySelectorAll(selector)
            );
    },


    bind = module.exports.bind = function(type, listener, context, ifOnce) {
        this.events = this.events || {};
        var queue = this.events[type] || (this.events[type] = []);
        queue.push({
            f: listener,
            o: context,
            ifOnce: ifOnce
        });
    },

    fire = module.exports.fire = function(type) {
        this.events = this.events || {};
        var slice = [].slice,
            list = this.events[type];

        if (!list) {
            return;
        }

        var arg = slice.call(arguments, 1);
        for (var i = 0, j = list.length; i < j; i++) {
            var cb = list[i];
            if (cb.f.apply(cb.o, arg) === false) {
                break;
            }

            if (cb.ifOnce === true) {
                list.splice(i, 1);
                i--;
                j--;
            }
        }
    },

    deserializeValue = module.exports.deserializeValue = function(value, currentValue) {
        // attempt to infer type from default value
        var inferredType = typeof currentValue;
        // invent 'date' type value for Date
        if (currentValue instanceof Date) {
            inferredType = 'date';
        }
        // delegate deserialization via type string
        return typeHandlers[inferredType](value, currentValue);
    },

    // helper for deserializing properties of various types to strings
    typeHandlers = module.exports.typeHandlers = {
        string: noopHandler,
        'undefined': noopHandler,

        date: function(value) {
            return new Date(Date.parse(value) || Date.now());
        },

        boolean: function(value) {
            if (value === '') {
                return true;
            }
            return value === 'false' ? false : !!value;
        },

        number: function(value) {
            var n = parseFloat(value);
            // hex values like "0xFFFF" parseFloat as 0
            if (n === 0) {
                n = parseInt(value);
            }
            return isNaN(n) ? value : n;
            // this code disabled because encoded values (like "0xFFFF")
            // do not round trip to their original format
            //return (String(floatVal) === value) ? floatVal : value;
        },

        object: function(value, currentValue) {
            if (currentValue === null) {
                return value;
            }
            try {
                // If the string is an object, we can parse is with the JSON library.
                // include convenience replace for single-quotes. If the author omits
                // quotes altogether, parse will fail.
                return JSON.parse(value.replace(/'/g, '"'));
            } catch (e) {
                // The object isn't valid JSON, return the raw value
                return value;
            }
        },

        // avoid deserialization of functions
        'function': function(value, currentValue) {
            return currentValue;
        }
    };
