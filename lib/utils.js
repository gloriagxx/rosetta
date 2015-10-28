function noopHandler(value) {
    return value;
}

/**
 *
 * @module typeHandlers
 *
 */
// helper for deserializing properties of various types to strings
export var typeHandlers = {
    'string': noopHandler,
    'undefined': noopHandler,

    'date': (value) => {
        return new Date(Date.parse(value) || Date.now());
    },

    'boolean': (value) => {
        if (value === '') {
            return true;
        }
        return value === 'false' ? false : !!value;
    },

    'number': (value) => {
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

    'object': (value, currentValue) => {
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
    'function': (value, currentValue) => {
        return currentValue;
    }
};

/**
 *
 * @module isString
 * @param {object} elem
 */
export function isString(elem) {
    return typeof elem == 'string';
}

/**
 *
 * @module isDomNode
 * @param {object} elem
 */

export function isDomNode(elem) {
    return !!(elem && elem.nodeType === 1);
}


/**
 *
 * @module isWindow
 * @param {object} obj
 */
export function isWindow(obj) {
    return obj != null && obj == obj.window;
}

/**
 *
 * @module isPlainObject
 * @param {object} obj
 */
export function isPlainObject(obj) {
    if (obj === undefined || obj === null) {
        return false;
    }
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
}

/**
 *
 * @module isArray
 * @param {object} value
 */
export function isArray(value) {
    return value instanceof Array;
}

/**
 *
 * @module isObject
 * @param {object} value
 */
export function isObject(value) {
    return typeof value == 'object';
}

/**
 *
 * @module isFunction
 * @param {object} obj
 */
export function isFunction(obj) {
    return typeof obj == 'function' || false;
}

/**
 *
 * @module extend
 * @param {object} target - the object which to append new json values
 */
function extendInternal(target, source, deep) {
    for (var key in source)
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

// Copy all but undefined properties from one or more
// objects to the `target` object.
export function extend(target) {
    var deep;
    var target = arguments[0];
    var args = [].slice.call(arguments, 1);
    var end = arguments[arguments.length - 1];

    if (typeof end == 'boolean') {
        deep = end;
        args.pop();
    }

    args.forEach(function(arg) {
        extendInternal(target, arg, deep);
    })
    return target;
}

/**
 *
 * @module camelize
 * @param {string} key
 */
export function camelize(key) {
    var _reg = /-(.)/g;
    return key.replace(_reg, function(_, txt) {
        return txt.toUpperCase();
    });
}

/**
 *
 * @module toPlainArray
 * @param {object} data - turn the data into plain array
 */
export function toPlainArray(data) {
    var result = [];

    for (var i = 0; i < data.length; i++) {
        var item = data[i];

        if (isArray(item)) {
            result = result.concat(toPlainArray(item));
        } else {
            if (typeof item == 'number') {
                item += '';
            }
            result.push(item);
        }
    }

    return result;
}


/**
 *
 * @module deserializeValue
 * @param {object} value - new value which will be deserialized according to the type of currentValue
 * @param {object} currentValue - old value which to determin the type of the new value in the first param
 */
export function deserializeValue(value, typeFunc, currentValue) {
    if (typeFunc == undefined) {
        inferredType = 'undefined';
    } else {
        // attempt to infer type from default value
        var inferredType = typeof typeFunc();
        // invent 'date' type value for Date
        if (typeFunc == Date) {
            inferredType = 'date';
        }
    }

    // delegate deserialization via type string
    return typeHandlers[inferredType](value, currentValue);
}

export var document = window.boost || window.document;
export var defaultTag = window.boost ? 'View' : 'div';
