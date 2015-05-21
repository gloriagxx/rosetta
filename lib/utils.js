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

    toType = module.exports.toType = function(attr) {
        var value = null;

        try {
            value = eval(attr);

            if (isArray(value)) {
                value.map(function(item, index) {
                    value[index] = toType(item);
                });
            } else {
                for (var i in value) {
                    var v = value[i];
                    value[i] = toType(v);
                }
            }
        } catch (e) {
            try {
                value = JSON.parse(attr);
            } catch (e) {
                value = attr;
            }
        }

        return value;
    },

    objToString = module.exports.objToString = function(obj, indeep) {
        switch (typeof obj) {
            case "string":
                return "'" + obj + "'";
            case "function":
                return obj.name || obj.toString();
            case "object":
                var indent = Array(indeep || 1).join('\t'),
                    isArray = Array.isArray(obj);
                return ('{[' [+isArray] + Object.keys(obj).map(function(key) {
                    return '\n\t' + indent + (isArray ? '' : key + ': ') + objToString(obj[key], (indeep || 1) + 1);
                }).join(',') + '\n' + indent + '}]' [+isArray]).replace(/[\s\t\n]+(?=(?:[^\'"]*[\'"][^\'"]*[\'"])*[^\'"]*$)/g, '');
            default:
                return obj.toString();
        }
    };
