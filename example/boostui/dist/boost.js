(function(window, undefined) {
    var NAMESPACE = "blend-" ;
    /**
 * @file uix.js
 * @author zhangyuanwei
 */
/*
获取UIX版本信息
 */
var UIX_VERSION = (function () {
    var ua = navigator.userAgent.toLowerCase();
    var v = ua.match(/uix\/(\d+\.\d+\.\d+\.\d+)/);
    return v ? v[1] : undefined;
})();

var IS_UIX = UIX_VERSION !== undefined;
var UIX_ACTION_BACK = 'back';
var ACTION_BACK_CLASS = NAMESPACE + 'action-' + UIX_ACTION_BACK;
// TODO more action

if (IS_UIX) {
    (function () {
        var htmlElem = document.getElementsByTagName('HTML')[0];
        var className = htmlElem.className;
        htmlElem.className = className + ' ' + NAMESPACE + 'boost';
    })();
}

function color2Hex(str) {

    function toHex(n) {
        n = Math.max(Math.min(Math.floor(n), 0xFF), 0) + 0x100;
        return n.toString(16).substring(1);
    }

    function rgb(r, g, b) {
        return '#ff' + toHex(r) + toHex(g) + toHex(b);
    }

    function rgba(r, g, b, a) {
        a = a * 0xFF;
        return '#' + toHex(a) + toHex(r) + toHex(g) + toHex(b);
    }

    color2Hex = function (str) {
        return (new Function('rgb', 'rgba', 'return ' + str)).call(null, rgb, rgba);
    };

    return color2Hex(str);
}

    /*! Hammer.JS - v2.0.4 - 2014-09-28
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2014 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge]
 * @returns {Object} dest
 */
function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
function merge(dest, src) {
    return extend(dest, src, true);
}

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        extend(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument;
    return (doc.defaultView || doc.parentWindow);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = last.deltaX - input.deltaX;
        var deltaY = last.deltaY - input.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y > 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) - getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.allow = true; // used by Input.TouchMouse to disable mouse events
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down, and mouse events are allowed (see the TouchMouse input)
        if (!this.pressed || !this.allow) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */
function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        // when we're in a touch event, so  block all upcoming mouse events
        // most mobile browser also emit mouseevents, right after touchstart
        if (isTouch) {
            this.mouse.allow = false;
        } else if (isMouse && !this.mouse.allow) {
            return;
        }

        // reset the allowMouse when we're done
        if (inputEvent & (INPUT_END | INPUT_CANCEL)) {
            this.mouse.allow = true;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        // not needed with native support for the touchAction property
        if (NATIVE_TOUCH_ACTION) {
            return;
        }

        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE);
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // pan-x and pan-y can be combined
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_PAN_X + ' ' + TOUCH_ACTION_PAN_Y;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.id = uniqueId();

    this.manager = null;
    this.options = merge(options || {}, this.defaults);

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        extend(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(withState) {
            self.manager.emit(self.options.event + (withState ? stateStr(state) : ''), input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(true);
        }

        emit(); // simple 'eventName' events

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(true);
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = extend({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {
        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        this._super.emit.call(this, input);
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            this.manager.emit(this.options.event + inOut, input);
        }
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 500, // minimal time of the pointer to be pressed
        threshold: 5 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.65,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.velocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.velocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.velocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.direction &&
            input.distance > this.options.threshold &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.direction);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 2, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED ) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create an manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.4';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, { enable: false }],
        [PinchRecognizer, { enable: false }, ['rotate']],
        [SwipeRecognizer,{ direction: DIRECTION_HORIZONTAL }],
        [PanRecognizer, { direction: DIRECTION_HORIZONTAL }, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, { event: 'doubletap', taps: 2 }, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    options = options || {};

    this.options = merge(options, Hammer.defaults);
    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        extend(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        var recognizers = this.recognizers;
        recognizer = this.get(recognizer);
        recognizers.splice(inArray(recognizers, recognizer), 1);

        this.touchAction.update();
        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    each(manager.options.cssProps, function(value, name) {
        element.style[prefixed(element.style, name)] = add ? value : '';
    });
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

extend(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

if (typeof define == TYPE_FUNCTION && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

    //     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    return new Z(dom, selector)
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
      slice.call(
        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }
  $.noop = function() {}

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    constructor: zepto.Z,
    length: 0,

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    concat: function(){
      var i, value, args = []
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i]
        args[i] = zepto.isZ(value) ? value.toArray() : value
      }
      return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
    },

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var computedStyle, element = this[0]
        if(!element) return
        computedStyle = getComputedStyle(element, '')
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

// by zhangyuanwei
var _Zepto = window.Zepto;
var _$ = window.$;
var hasZepto = "Zepto" in window;
var has$ = "$" in window;


Zepto.noConflict = function(deep){
    if(window.$ === Zepto){
      if(has$){
        window.$ = _$;
      }else{
        delete window.$;
      }
    }

    if(deep && window.Zepto === Zepto){
      if(hasZepto){
        window.Zepto = _Zepto;
      }else{
        delete window.Zepto;
      }
    }
    return Zepto;
};

window.Zepto = window.$ = Zepto;

    //     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (callback === undefined || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

    //     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

// The following code is heavily inspired by jQuery's $.fn.data()

;(function($){
  var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
    exp = $.expando = 'Zepto' + (+new Date()), emptyArray = []

  // Get value from node:
  // 1. first try key as given,
  // 2. then try camelized key,
  // 3. fall back to reading "data-*" attribute.
  function getData(node, name) {
    var id = node[exp], store = id && data[id]
    if (name === undefined) return store || setData(node)
    else {
      if (store) {
        if (name in store) return store[name]
        var camelName = camelize(name)
        if (camelName in store) return store[camelName]
      }
      return dataAttr.call($(node), name)
    }
  }

  // Store value under camelized key on node
  function setData(node, name, value) {
    var id = node[exp] || (node[exp] = ++$.uuid),
      store = data[id] || (data[id] = attributeData(node))
    if (name !== undefined) store[camelize(name)] = value
    return store
  }

  // Read all "data-*" attributes from a node
  function attributeData(node) {
    var store = {}
    $.each(node.attributes || emptyArray, function(i, attr){
      if (attr.name.indexOf('data-') == 0)
        store[camelize(attr.name.replace('data-', ''))] =
          $.zepto.deserializeValue(attr.value)
    })
    return store
  }

  $.fn.data = function(name, value) {
    return value === undefined ?
      // set multiple values via object
      $.isPlainObject(name) ?
        this.each(function(i, node){
          $.each(name, function(key, value){ setData(node, key, value) })
        }) :
        // get value from first element
        (0 in this ? getData(this[0], name) : undefined) :
      // set value on all elements
      this.each(function(){ setData(this, name, value) })
  }

  $.fn.removeData = function(names) {
    if (typeof names == 'string') names = names.split(/\s+/)
    return this.each(function(){
      var id = this[exp], store = id && data[id]
      if (store) $.each(names || store, function(key){
        delete store[names ? camelize(this) : key]
      })
    })
  }

  // Generate extended `remove` and `empty` functions
  ;['remove', 'empty'].forEach(function(methodName){
    var origFn = $.fn[methodName]
    $.fn[methodName] = function() {
      var elements = this.find('*')
      if (methodName === 'remove') elements = elements.add(this)
      elements.removeData()
      return origFn.call(this)
    }
  })
})(Zepto)

    //     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
    longTapDelay = 750,
    gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }

  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
      .bind('MSGestureEnd', function(e){
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
        if (swipeDirectionFromVelocity) {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
        }
      })
      .on('touchstart MSPointerDown pointerdown', function(e){
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if (e.touches && e.touches.length === 1 && touch.x2) {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
        // adds the current touch contact for IE gesture recognition
        if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
      })
      .on('touchmove MSPointerMove pointermove', function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY

        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
      .on('touchend MSPointerUp pointerup', function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
        cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              touch.el.trigger(event)

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto)

    //     Zepto.js
//     (c) 2010-2015 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor, hashIndex
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

    /**
 * 组件 类工厂
 * @file widget.js
 * @author zhangyuanwei
 */
;(function ($) {
    'use strict';
    var widgetMap = {};
    /**
     * widget 类工厂
     *
     * @param {string} name  widget名
     * @param {Function} base 父类
     * @param {Object} prototype 原型
     * @return {Function} 类构造函数
     */
    $.widget = function (name, base, prototype) {
        /**
         * 组件全名
         */
        var fullName;
        /**
         * 组件构造函数
         */
        var constructor;
        /**
         * 基础原型
         */
        var basePrototype;
        /**
         * 用于实现 this._super 调用
         */
        var proxiedPrototype = {};
        var namespace = name.split('.')[0];

        name = name.split('.')[1];
        fullName = namespace + '-' + name;

        if (!prototype) {
            prototype = base;
            base = $.Widget;
        }

        $[namespace] = $[namespace] || {};
        constructor = widgetMap[name] = $[namespace][name] = function (options, element) {
            // 检查是否是通过 new 调用的(instanceof)
            if (!this._createWidget) {
                return new constructor(options, element);
            }

            // 没有参数的时候用于继承时候构造原型
            if (arguments.length) {
                this._createWidget(options, element);
            }
        };

        basePrototype = new base();
        basePrototype.options = $.widget.extend({}, basePrototype.options);

        // 将原型复制到代理对象上，提供 this._super 和 this._superApply 支持
        $.each(prototype, function (prop, value) {

            var _super;
            var _superApply;

            if (!$.isFunction(value)) {
                proxiedPrototype[prop] = value;
            }
            else {
                _super = function () {
                    return base.prototype[prop].apply(this, arguments);
                };
                _superApply = function (args) {
                    return base.prototype[prop].apply(this, args);
                };
                proxiedPrototype[prop] = function () {
                    var returnValue;
                    var __super = this._super;
                    var __superApply = this._superApply;

                    try {
                        returnValue = value.apply(this, arguments);
                    }
                    finally {
                        this._super = __super;
                        this.__superApply = __superApply;
                    }

                    return returnValue;
                };
            }
        });

        constructor.prototype = $.widget.extend(basePrototype, proxiedPrototype, {
            constructor: constructor,
            namespace: namespace,
            widgetName: name,
            widgetFullName: fullName
        });

        $.widget.bridge(name, constructor);

        return constructor;
    };


    $.widget.has = function (name) {
        return widgetMap.hasOwnProperty(name);
    };

    var slice = Array.prototype.slice;

    /**
     * extend 复制对象属性到 target 上
     *
     * @param {Object} target 要复制到的对象
     * @return {undefined}
     */
    $.widget.extend = function (target) {
        var input = slice.call(arguments, 1);
        var inputIndex = 0;
        var inputLength = input.length;
        var key;
        var value;

        for (; inputIndex < inputLength; inputIndex++) {
            for (key in input[inputIndex]) {
                value = input[inputIndex][key];
                if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
                    if ($.isPlainObject(value)) {
                        // Clone objects
                        target[key] = $.isPlainObject(target[key]) ?
                            $.widget.extend({}, target[key], value) :
                            $.widget.extend({}, value);
                    }
                    else {
                        // Copy everything else by reference
                        target[key] = value;
                    }
                }
            }
        }

        return target;
    };


    var widgetMagic = '__iqzll3wmdjthuxr_';
    /**
     * bridge 扩展Zepto.fn
     *
     * @param {string} name name
     * @param {Object} constructor constructor
     */
    $.widget.bridge = function (name, constructor) {
        var fullName = constructor.prototype.widgetFullName || name;
        var dataKey = widgetMagic + fullName;

        $.fn[name] = function (options) {
            var isMethodCall = typeof options === 'string';
            var args = slice.call(arguments, 1);
            var returnValue = this;

            if (isMethodCall) {
                // 函数调用
                this.each(function () {
                    var $this = $(this);
                    var instance = $this.data(dataKey);
                    var methodValue;

                    if (options === 'instance') {
                        returnValue = instance;
                        return false;
                    }

                    if (options === 'destroy') {
                        if (instance.destroy) {
                            instance.destroy();
                        }
                        $this.removeData(dataKey);
                        return;
                    }

                    if (!instance) {
                        // TODO Error
                        throw new Error('cannot call methods on ' + name + ' prior to initialization; ' +
                            'attempted to call method "' + options + '"');
                    }

                    if (!$.isFunction(instance[options]) || options.charAt(0) === '_') {
                        // TODO Error
                        throw new Error('no such method "' + options + '" for ' + name + ' widget instance');
                    }

                    methodValue = instance[options].apply(instance, args);
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue;
                        return false;
                    }
                });
            }
            else {
                // 初始化
                // 支持多个初始化参数
                if (args.length) {
                    options = $.widget.extend.apply(null, [{}, options].concat(args));
                }

                this.each(function () {
                    var $this = $(this);
                    var instance = $this.data(dataKey);
                    if (instance) {
                        // 已经初始化过
                        instance.option(options || {});
                        if (instance._init) {
                            instance._init();
                        }
                    }
                    else {
                        $this.data(dataKey, new constructor(options, this));
                    }
                });
            }

            return returnValue;
        };
    };

    var noop = function () {};

    /**
     * $.Widget 父类
     *
     */
    $.Widget = function (/* options, element */) {};

    $.Widget.prototype = {
        options: {},
        /**
         * 创建组件
         * @private
         * @param  {Object} options 配置
         * @param  {HTMLElement} element DOM元素
         */
        _createWidget: function (options, element) {
            this.element = $(element);
            this.options = $.widget.extend({},
                this.options,
                this._getCreateOptions(),
                options);

            this._create();
            this._trigger('create', null, this._getCreateEventData());
            this._init();
        },
        /**
         * @private
         * @return {Object}
         */
        _getCreateOptions: function () {
            return this.element.data(this.widgetFullName);
        },
        /**
         * @private
         */
        _getCreateEventData: noop,
        /**
         * @private
         */
        _create: noop,
        /**
         * @private
         */
        _init: noop,
        destroy: function () {
            this._destroy();
            // TODO 批量删除事件绑定好像不大好做 -_-!!
            // var $this = this.element;
            // $this.off(this.widgetName);
        },
        /**
         * @private
         */
        _destroy: noop,
        /**
         * 派发事件
         * @private
         * @param  {string} type 事件类型
         * @param  {string} originalEvent 原始事件
         * @param  {Object} data 传递的数据
         * @return {[type]}
         */
        _trigger: function (type, originalEvent, data) {
            var event;
            var callback = this.options[type];

            type = this.widgetName + ':' + type;
            data = data || {};
            event = $.Event(type, {
                originalEvent: originalEvent
            });
            this.element.trigger(event, data);
            return !($.isFunction(callback) &&
                callback.apply(this.element[0], [event].concat(data)) === false || event.isDefaultPrevented());
        },
        option: function (key, value) {
            var options = key;
            var parts;
            var currentOpt;
            var i;

            if (arguments.length === 0) {
                // 得到所有的 options 值
                return $.widget.extend({}, this.options);
            }

            if (typeof key === 'string') {
                options = {};
                parts = key.split('.');
                key = parts.shift();
                if (parts.length) {
                    // key = "a.b.c.d"
                    currentOpt = options[key] = $.widget.extend({}, this, options[key]);
                    for (i = 0; i < parts.length - 1; i++) {
                        key = parts[i];
                        currentOpt[key] = currentOpt[key] || {};
                        currentOpt = currentOpt[key];
                    }
                    key = parts.pop();
                    if (arguments.length === 1) {
                        return currentOpt[key] === undefined ? null : currentOpt[key];
                    }
                    currentOpt[key] = value;
                }
                else {
                    if (arguments.length === 1) {
                        return this.options[key] === undefined ? null : this.options[key];
                    }
                    options[key] = value;
                }
            }

            this._setOptions(options);
            return this;
        },
        /**
         * 设置options
         * @private
         * @param {Object} options 传入的options
         * @return {Object} 当前对象
         */
        _setOptions: function (options) {
            var key;
            for (key in options) {
                this._setOption(key, options[key]);
            }

            return this;
        },
        /**
         * 设置option
         * @private
         * @param {string} key key
         * @param {Object|string|number|Function|boolean} value value
         * @return {Object} 当前对象
         */
        _setOption: function (key, value) {
            this.options[key] = value;
            return this;
        }
    };
})(Zepto);

    ;(function($){/* globals NAMESPACE */
/* eslint-disable fecs-camelcase */
/**
 * @file checkbox 组件
 * @author dingquan
 */

'use strict';

$.widget('blend.checkbox', {
    /**
     * 组件的默认选项，可以由多重覆盖关系
     */
    options: {
        itemSelector: '.' + NAMESPACE + 'checkbox',
        itemLabel: NAMESPACE + 'checkbox-label',
        type: 'group',
        itemSelected: NAMESPACE + 'checkbox-checked',
        itemSelectAll: NAMESPACE + 'checkbox-all'
    },
    _create: function () {

        /**
         * this.element 组件对应的单个 Zepto/jQuery 对象
         */
        var $this = this.element;

        /**
         * 经过继承的 options
         */
        var options = this.options;


        this.$group = $this.find(options.itemSelector); //
        this.$label = $this.find('.' + options.itemLabel);
        this.$container = $this;

    },
    /**
     * _init 初始化的时候调用
     */
    _init: function () {
        this._initEvent();
    },
    _checkGroup: function (curElem) {

        var that = this;
        var EventSelected = that.$container.find('.' + that.options.itemSelected);
        var EventSelector = that.$container.find(that.options.itemSelector);

        var eventData = {
            checked: 0
        };

        if (that.options.type === 'radio') {
            EventSelected.removeClass(that.options.itemSelected);
            curElem.addClass(that.options.itemSelected);
            eventData.checked++;
        }
        else {

            var len = 0;
            // 判断有无已勾选
            EventSelector.each(function () {
                var $this = $(this);
                if (!$this.hasClass(that.options.itemSelectAll)) {
                    len++;
                    if ($this.hasClass(that.options.itemSelected)) {
                        eventData.checked++;
                    }
                }
            });

            if (curElem.hasClass(that.options.itemSelectAll)) {
                if (eventData.checked < len) {
                    EventSelector.each(function () {
                        $(this).addClass(that.options.itemSelected);
                    });
                    eventData.checked = len;
                }
                else {
                    EventSelected.removeClass(that.options.itemSelected);
                    eventData.checked = 0;
                }
            }
            else {

                if (curElem.hasClass(that.options.itemSelected)) {
                    curElem.removeClass(that.options.itemSelected);
                    eventData.checked--;
                }
                else {
                    curElem.addClass(that.options.itemSelected);
                    eventData.checked++;
                }

            }
            if (eventData.checked < len) {
                that.$container.find('.' + that.options.itemSelectAll).removeClass(that.options.itemSelected);
            }
            else {
                that.$container.find('.' + that.options.itemSelectAll).addClass(that.options.itemSelected);
            }
        }
        that._trigger('checked', null, eventData);
    },
    _initEvent: function () {

        var that = this;

        this.$group.on('tap, click', function () {
            if (that._trigger('beforechecked', null, {})) {
                var curElem = $(this);
                that._checkGroup(curElem);
            }
        });
        this.$label.on('tap, click', function () {
            if (that._trigger('beforechecked', null, {})) {
                var curElem = that.$group.eq([that.$label.index($(this))]);
                that._checkGroup(curElem);
            }
        });
    },
    /**
     *
     * @return {*}
     * 获取value值函数
     */
    getValues: function () {
        var $this;
        var valArr = [];
        var val;
        var elems = this.$group;
        for (var i = 0; i < elems.length; i++) {
            $this = $(elems[i]);
            if ($this.hasClass(NAMESPACE + 'checkbox-checked') || $this.hasClass(NAMESPACE + 'button-checkbox-checked') && !$this.hasClass(NAMESPACE + 'checkbox-all')) {
                val = this.options.values[i];
                valArr.push(this.options.values[i]);
            }
        }
        if (this.options.type === 'radio') {
            return val;
        }
        return valArr;
    }
});
})(Zepto)
;(function($){/**
 * counter 组件
 * @file counter.js
 * @author zhangyuanwei
 */
'use strict';
$.widget('blend.counter', {

    /**
     * 组件的默认选项，可以由多从覆盖关系
     */
    options: {
        minusSelector: '.' + NAMESPACE + 'counter-minus',
        plusSelector: '.' + NAMESPACE + 'counter-plus',
        inputSelector: '.' + NAMESPACE + 'counter-input',
        minValue: 0,
        maxValue: Infinity,
        disableClass: NAMESPACE + 'disabled',
        step: 1,
        asyn: false // true/false

    },

    /**
     * _create 创建组件时调用一次
     * @private
     */
    _create: function () {

        /**
         * this 对象为一个 组件 实例
         * 不是 Zepto/jQuery 对象
         * 也不是 Dom 对象
         */

        /**
         * this.element 组件对应的单个 Zepto/jQuery 对象
         */
        var $el = this.element;

        /**
         * 经过继承的 options
         */
        var options = this.options;

        /**
         * 建议: Zepto/jQuery 对象变量名前加 $
         */
        this.$minus = $el.find(options.minusSelector); // !!!选择器选择的时候需要指定范围!!!
        this.$plus = $el.find(options.plusSelector);
        this.$input = $el.find(options.inputSelector);
    },

    /**
     * _init 初始化的时候调用
     * @private
     */
    _init: function () {
        var options = this.options;
        var minValue = Number(options.minValue);
        var maxValue = Number(options.maxValue);

        this._minValue = isNaN(minValue) ? 0 : minValue;
        this._maxValue = isNaN(maxValue) ? Infinity : maxValue;

        this._initValue();
        this._initEvent();
    },

    /**
     * _initValue 自定义的成员函数，
     * 所有以下划线开头的函数不可在外部调用
     * @private
     */
    _initValue: function () {
        // var initValue = Number(this.$input.val());
        // this._value = isNaN(initValue) ? 0 : initValue;
        var value = Number(this.$input.val());
        if (isNaN(value)) {
            return;
        }
        if (this._maxValue <= this._minValue) {
            this.$minus.addClass(this.options.disableClass);
            this.$plus.addClass(this.options.disableClass);
        }
        else {
            this.$minus.toggleClass(this.options.disableClass, value <= this._minValue);
            this.$plus.toggleClass(this.options.disableClass, value >= this._maxValue);
        }
        value = Math.min(this._maxValue, Math.max(this._minValue, value));
        this.$input.val(value);
        this._value = value;
    },

    /**
     * 初始化控件事件
     * @private
     */
    _initEvent: function () {
        var thisObj = this;
        var step = Number(this.options.step);
        step = isNaN(step) ? 1 : step;
        this.$plus.on('click', function () {
            thisObj.value(thisObj._value + step);
        });
        this.$minus.on('click', function () {
            thisObj.value(thisObj._value - step);
        });
        this.$input.on('blur', function () {
            thisObj.value(Number(thisObj.$input.val()) || thisObj._value);
        });
    },

    /**
     * value 自定义的成员方法,
     * 没有返回值或者返回值为 undefined 时会保持调用链，
     * 如果返回值不为 undefined 则将该值返回，不能再次链式调用
     *
     * @param {number} n 设置value值
     * @return {undefined}
     */
    value: function (n) {
        var value;
        var oldValue;
        var eventData;

        if (arguments.length > 0) {
            value = Number(n);
            if (isNaN(value)) {
                return;
            }
            if (this._maxValue <= this._minValue) {
                this.$minus.addClass(this.options.disableClass);
                this.$plus.addClass(this.options.disableClass);
            }
            else {
                this.$minus.toggleClass(this.options.disableClass, value <= this._minValue);
                this.$plus.toggleClass(this.options.disableClass, value >= this._maxValue);
            }
            value = Math.min(this._maxValue, Math.max(this._minValue, value));
            oldValue = this._value;

            if (oldValue === value) {
                return;
            }

            eventData = {
                oldValue: oldValue,
                newValue: value
            };

            if (this.options.asyn) {
                var counter = this;
                var updateData = {
                    oldValue: oldValue,
                    newValue: value
                };
                eventData.callback = function () {
                    counter.$input.val(value);
                    counter._value = value;
                    counter._trigger('update', null, updateData);
                };
                this._trigger('beforeupdate', null, eventData);
            }
            else {

                /**
                 * this._trigger 派发自定义事件
                 * 使用 jQuery/Zepto 的事件机制
                 * 监听时需要加上模块名
                 * eg: $("xx").navbar().on("navbar:xxx", function(){
                 *    // 可以通过 return false 影响程序执行
                 *    return false;
                 * });
                 */
                if (this._trigger('beforeupdate', null, eventData)) {
                    this.$input.val(value);
                    this._value = value;
                    this._trigger('update', null, eventData);
                }
            }

        }
        else {
            return this._value;
        }
    }

});
})(Zepto)
;(function($){/**
 * @function dialog
 * @name dialog
 * @author wangzhonghua
 * @file dialog.js
 * @date 2015.02.05
 * @memberof $.fn or $.blend
 * @grammar  $('.test').dialog().show(),$.blend.dialog().show()
 * @desc 页面级dialog
 * @param {Object} options 组件配置（以下参数为配置项）
 * @param {String} options.id (可选, 默认值: 随机数) dialog id
 * @param {Interval} options.top (可选, 默认值: null) dialog 自定义top值
 * @param {String} options.addCssClass (可选, 默认值: \'\') dialog最外层自定义class
 * @param {String} options.title (可选, 默认值: 标题) dialog 标题
 * @param {String} options.content (可选, 默认值: \'\') dialog 内容
 * @param {String} options.cancelText (可选, 默认值: 取消) dialog 取消按钮的文案
 * @param {String} options.cancelClass (可选, 默认值: \'\') dialog 取消按钮的自定义class
 * @param {String} options.doneText (可选, 默认值: 确认) dialog 确认按钮的文案
 * @param {String} options.doneClass (可选, 默认值: \'\') dialog 确认按钮的自定义class
 * @param {String} options.maskTapClose (可选, 默认值: false) mask被点击后是否关闭dialog
 * @example
 * 	1、$('.dialog').dialog(), $('.dialog')为dialog自定义节点,并不是dialog的容器,切记
 * 	2、var dialog = $.blend.dialog({
 * 						title: 'my title',
 * 						message: 'my message',
 * 					});
 * 		  dialog.show();
 */
'use strict';
$.widget('blend.dialog', {
    /*配置项*/
    options: {
        id: null,
        hasHeader: true,        // 是否有diaload头
        top: undefined,         // 自定义dialog距离顶部距离
        addCssClass: null,
        title: '标题',          // dialog标题
        content: '',            // dialog内容
        cancelText: '取消',     // 取消按钮自定义文案
        cancelClass: '',
        confirmText: '确认',    // 确认按钮自定义文案
        confirmClass: '',
        maskTapClose: false,    // 点击mask，关闭dialog
        renderType: 0,            // 渲染方式，0 是DOM渲染，1是js渲染,2是自定义
        btnStatus: 3             // 控制cancel按钮(2)和confirm按钮(1) 的和值
    },
    /**
     * _create 创建组件时调用一次
     * @private
     */
    _create: function () {
        var options = this.options;

        this.$body = $('body');
        this.id = options.id || 'dialog-' + (((1 + Math.random()) * 0x1000) | 0).toString(16);
        this.addCssClass = options.addCssClass ? options.addCssClass : '';
        this.title = options.title;
        this.content = options.content;
        this.cancelText = options.cancelText;
        this.cancelClass = options.cancelClass;
        this.confirmText = options.confirmText;
        this.confirmClass = options.confirmClass;
        this.hasHeader = options.hasHeader;
        this.autoCloseDone = true;
        this.maskTapClose = options.maskTapClose;
        this.top = options.top;
        this.renderType = options.renderType;
        this.useCustom = (this.renderType === 2) ? true : false;    // renderType为2表示使用自定义dom
        this.btnStatus = options.btnStatus;
        this.$el = this.element;
    },
    /**
     * 初始化
     * @private
     */
    _init: function () {
        var me = this;
        /**
         * UIX 环境的初始化
         */
        if (IS_UIX) {
            if (this._uix !== null) {
                // (this._uix.destroy)&&(this._uix.destroy());
            }

            require(['blend'], function (blend) {
                me._uix = me._createUIXDialog(blend);
            });

            return;
        }
        /**
         * 使用提供的默认方式
         */
        if (!this.useCustom) {
            this.$el = this._createHTMLDialog();
            this._bindEvent();
        }
    },
    /**
     * 创建UIX的Dialog
     * @param {Object} blend 通过blend2 require的变量
     * @private
     */
    _createUIXDialog: function (blend) {

        if (this.useCustom) {
            // console.error('UIX暂不支持自定义dialog');
            return;
        }

        var $el = this.$el;

        var title = $el.find('.' + NAMESPACE + 'dialog-header').text() || this.title;
        var content = $el.find('.' + NAMESPACE + 'dialog-body').text() || this.content;
        var confirmText = $el.find('.' + NAMESPACE + 'dialog-confirm').text() || this.confirmText;
        var cancelText = $el.find('.' + NAMESPACE + 'dialog-cancel').text() || this.cancelText;

        // create Dialog
        var uixDialog = blend.create('dialog', {
            title: title,
            description: content
        });

        if ((this.btnStatus & 1) > 0) {
            var confirmItem = uixDialog.create({
                text: confirmText
            });
            confirmItem.bind('ontap', (function (that) {
                return function () {
                    that._trigger('confirm');
                };
            })(this));

            uixDialog.append(confirmItem);
        }

        if ((this.btnStatus & 2) > 0) {
            var cancelItem = uixDialog.create({
                text: cancelText
            });
            cancelItem.bind('ontap', (function (that) {
                return function () {
                    that._trigger('cancel');
                };
            })(this));

            uixDialog.append(cancelItem);
        }

        this._uixDialog = uixDialog;
    },
    /**
     * 创建web的dialog
     * @private
     * @return {HTMLElement}
     */
    _createHTMLDialog: function () {

        // 已经创建过dialog
        if (this.jsRendered) {
            return this.$el;
        }

        // 根据传递的参数
        var outerEle;
        var curEle;
        if (this.renderType === 0) {
            curEle = this.$el;
            curEle.find('.' + NAMESPACE + 'dialog-footer a')
            .addClass(NAMESPACE + 'dialog-btn');
            outerEle = curEle;
        }
        else if (this.renderType === 1) {
            outerEle = this._getDialogHtml();
        }

        this.$title = outerEle.find('.' + NAMESPACE + 'dialog-title');
        this.$content = outerEle.find('.' + NAMESPACE + 'dialog-body');
        this.$header = outerEle.find('.' + NAMESPACE + 'dialog-header');

        if (!this.hasHeader) {
            // this.$content.addClass(NAMESPACE + 'dialog-tips');
            this.$header.remove();
        }

        if (!this.btnStatus) {
            outerEle.find('.' + NAMESPACE + 'dialog-footer').remove();
        }
        else {
            if ((this.btnStatus & 1) <= 0) {
                outerEle.find('.' + NAMESPACE + 'dialog-confirm').remove();
            }
            if ((this.btnStatus & 2) <= 0) {
                outerEle.find('.' + NAMESPACE + 'dialog-cancel').remove();
            }
        }

        this.jsRendered = true;
        return outerEle;
    },
    /**
     * 为dialog相关元素添加事件
     * @private
     */
    _bindEvent: function () {
        var self = this;
        $(window).on('orientationchange resize', function () {
            self.setPosition();
        });
        this.$el.on('tap, click', '.' + (this.cancelClass || NAMESPACE + 'dialog-cancel'), function () {
            self._trigger('cancel');
            self.autoCloseDone && self.hide();
        }).on('tap, click', '.' + (this.doneClass || NAMESPACE + 'dialog-confirm'), function () {
            self._trigger('confirm');
            self.autoCloseDone && self.hide();
        }).on('dialog.close', function () {
            self.hide();
        });
    },
    /**
     * 定义事件派发
     * @param {Object} event 事件对象
     * @private
     */
    _trigger: function (event) {
        this.$el.trigger('dialog:' + event);
    },
    /**
     * 生成dialog html片段
     * @private
     * @return {HTMLElement}
     */
    _getDialogHtml: function () {

        var dom = '<div class="' + NAMESPACE + 'dialog-header">' + this.title + '</div>'
                      + '<div class="' + NAMESPACE + 'dialog-body">' + this.content + '</div>'
                      + '<div class="' + NAMESPACE + 'dialog-footer">'
                         +  '<a href="javascript:void(0);" class="' + this.confirmClass + ' ' + NAMESPACE + 'dialog-confirm ' + NAMESPACE + 'dialog-btn">' + this.confirmText + '</a>'
                         +  '<a href="javascript:void(0);" class="' + this.cancelClass + ' ' + NAMESPACE + 'dialog-cancel ' + NAMESPACE + 'dialog-btn">' + this.cancelText + '</a>'
                      + '</div>';
        this.$el.append(dom);
        return this.$el;
    },
    /**
     * 显示dialog
     * @param {string} content 指定show方法要展示的body内容
     * @return {Object}
     */
    show: function (content) {

        if (IS_UIX) {
            this._uixDialog.show();
            return null;
        }

        var self = this;
        if (this.lock) {
            return this.$el;
        }
        if (!this.hasRendered) {
            this.$el.appendTo(this.$body);
            this.hasRendered = true;        // 标记已经渲染
        }
        this.setPosition();
        this.mask(0.5);
        (content) && this.$content.html(content);
        window.setTimeout(function () {
            self.$el.addClass(NAMESPACE + 'dialog-show');
            self._trigger('show');
            self.lock = false;
        }, 50);
        this.lock = true;
        return this.$el;
    },
    /**
     * 关闭dialog
     * @return {Object}
     */
    hide: function () {
        var self = this;
        if (this.lock) {
            return this.$el;
        }
        window.setTimeout(function () {
            self.unmask();
            self.lock = false;
        }, 50);
        this._trigger('hide');
        this.lock = true;
        return this.$el.removeClass(NAMESPACE + 'dialog-show');
    },
    /**
     * 销毁dialog
     * @return {Object}
     */
    destroy: function () {
        this.unmask();
        if (this.$el) {
            this.$el.remove();
            this.$el = [];
        }
        return this.$el;
    },
    /**
     * 显示mask
     * @param {number} opacity 透明度
     */
    mask: function (opacity) {
        var self = this;
        opacity = opacity ? ' style="opacity:' + opacity + ';"' : '';
        var bodyHeight = document.body.clientHeight || document.body.offsetHeight;
        (this.maskDom = $('<div class="' + NAMESPACE + 'dialog-mask"' + opacity + '></div>')).prependTo(this.$body);
        this.maskDom.css('height', bodyHeight);
        this.maskDom.on('click', function (e) {
            e.preventDefault();
            self.maskTapClose && self.hide();
        }).on('touchmove', function (e) {
            e.preventDefault();
        });
    },
    /**
     * 关闭mask
     */
    unmask: function () {
        this.maskDom.off('touchstart touchmove').remove();
    },
    /**
     * 设置dialog位置
     * @return {Object}
     */
    setPosition: function () {
        var top = typeof this.top === 'undefined' ?
        (window.innerHeight / 2) - (this.$el[0].clientHeight / 2) : parseInt(this.top, 10);
        var left = (window.innerWidth / 2) - (this.$el[0].clientWidth / 2);
        return this.$el.css({
            top: top + 'px',
            left: left + 'px'
        });
    }
});
})(Zepto)
;(function($){/**
 * fixedBar
 * @file fixedBar.js
 * @author wangzhonghua
 * @date 2015.02.05
 * @memberof $.fn or $.blend
 * 	$.boost.fixedBar()
 */
'use strict';
$.widget('blend.fixedBar', {
    /**
     * 初始化组件
     * @private
     */
    _init: function () {
        // 此处是解决某些浏览器，如uc，横竖屏切换时，由于地址栏的显隐现象，导致的fixedBar不能落底的问题。
        $(window).on('resize orientationchange', function () {
            window.scrollBy(0, 0);
        });
    }
});})(Zepto)
;(function($){/* globals NAMESPACE */
/* eslint-disable fecs-camelcase */
/**
 * @file formgroup 组件
 * @author wanghongliang02
 */

$.widget('blend.formgroup', {
    /**
     * 组件的默认选项
     */
    options: {
        labelClass: NAMESPACE + 'formgroup-label',
        inputClass: NAMESPACE + 'formgroup-input',
        // selectClass: NAMESPACE + 'formgroup-select',
        btnClass: NAMESPACE + 'formgroup-btn',
        errorClass: NAMESPACE + 'formgroup-error',
        validate: false,  // false/blur/true,
        /**
         * custon validate function
         * @param {string} msg error msg
         * @param {Object} $ele element
         * @param {Function} cb callback function
         * @return {boolean|string}
         */
        validateFunction: function (msg, $ele, cb) {
            return true;
        },
        asyn: false  // true/false
    },
    /**
     * _create 创建组件时调用一次
     */
    _create: function () {
        var formgroup = this;
        var validate = formgroup.options.validate;
        var events = false;
        // 预留其他事件接口(input/paste...)
        switch (validate) {
            case true:
                events = 'blur';
                break;
            case 'blur':
                events = 'blur';
                break;
            default :
                validate = false;
        }
        formgroup.events = events;
        if (!$.isFunction(formgroup.options.validateFunction)) {
            formgroup.options.validateFunction = function () {
            };
        }
    },
    /**
     * _init 初始化的时候调用
     */
    _init: function () {
        var formgroup = this;
        var $el = formgroup.element;
        formgroup.$inputItem = $el.find('.' + formgroup.options.inputClass);
        if (formgroup.options.validate && formgroup.events) {
            formgroup._initEvent();
        }
    },
    /**
     * 初始化事件
     * @private
     */
    _initEvent: function () {
        var formgroup = this;
        formgroup.$inputItem.on('focus.formgroup', function (e) {
            var $me = $(this);
            formgroup._removeError();
        });
        formgroup.$inputItem.on(formgroup.events + '.formgroup', function (e) {
            var $me = $(this);
            var value = $me.val();
            if (formgroup.options.validate) {
                formgroup._validate(value, $me);
            }
        });
    },
    /**
     * remove error class
     * @private
     */
    _removeError: function () {
        var formgroup = this;
        formgroup.element.removeClass(formgroup.options.errorClass);
    },
    /**
     * show error
     * @param {string} msg error tips
     * @private
     */
    _showError: function (msg) {
        var formgroup = this;
        formgroup.element.addClass(formgroup.options.errorClass);
        // TODO error tip
        var toast = $[NAMESPACE.substr(0, NAMESPACE.length - 1)].toast();
        toast.show(msg, 1000);
    },
    /**
     *
     * @param {string} value input value
     * @param {Object} $ele element
     * @private
     */
    _validate: function (value, $ele) {
        var formgroup = this;
        if (formgroup.options.asyn === true) {
            formgroup.options.validateFunction(value, $ele, function (ret) {
                if (ret && typeof ret === 'string') {
                    formgroup._showError(ret);
                }
            });
        }
        else {
            var ret = formgroup.options.validateFunction(value, $ele);
            if (ret && typeof ret === 'string') {
                formgroup._showError(ret);
            }
        }
    },
    /**
     * 更新或者获取当前表单项的值
     * @param {string} value 欲更新或者获取当前表单项的值
     * @return {mix}
     * @private
     */
    _value: function (value) {
        var formgroup = this;
        if (typeof value === 'undefined') {
            return formgroup.$inputItem.val();
        }
        formgroup.$inputItem.val(value);
    },
    /**
     * 销毁formgroup对象
     * @private
     */
    _destroy: function () {
        var formgroup = this;
        if (formgroup.options.validate && formgroup.events) {
            formgroup.$inputItem.off(formgroup.events + '.formgroup');
            formgroup.$inputItem.off('focus.formgroup');
        }
    },
    /**
     * 更新或者获取当前表单项的值
     * @param {string} value 欲更新或者获取当前表单项的值
     * @return {mix}
     * @private
     */
    value: function (value) {
        return this._value(value);
    }

});
})(Zepto)
;(function($){/**
 * gallery 组件
 * Created by dingquan on 15-3-24.
 *
 * @file gallery.js
 * @author dingquan
 */

'use strict';
// var NAMESPACE = "blend-";
$.widget('blend.gallery', {
    /**
     * 组件的默认选项，可以由多重覆盖关系
     */
    options: {
    },
    /**
     * 创建组件是调用一次
     * @private
     */
    _create: function () {
        /**
         * this.element 组件对应的单个 Zepto/jQuery 对象
         */
        this.$el = this.element;
        /**
         * 经过继承的 options
         */
        var options = this.options;

        if (!options.data || !options.data.length) {
            throw new Error('data can not be empty');
        }
    },
    /**
     * _init 初始化的时候调用
     * @private
     */
    _init: function () {

        var me = this;

        if (IS_UIX) {
            // UIX
            if (this._uix !== null) {
              // (this._uix.destroy)&&(this._uix.destroy());
            }
            require(['blend'], function (blend) {
                me._uix = me._initUIXGallery(blend);
            });

        }
        else {
            /**
             * web gallery 初始化
             */
            this._createMask();   // 创建遮罩mask
            this._setting();    // 设置相关内部属性
            this._renderHTML();
            this._bindHandler();
        }
    },
    /**
     * 初始化 uix gallery
     * @private
     * @param  {Object} blend blend对象
     * @return {[type]}
     */
    _initUIXGallery: function (blend) {

        var uixGallery = blend.create('gallery', {
            images: this.options.data
        });

        return uixGallery;

    },
    /**
     * 创建遮罩mask
     * @private
     */
    _createMask: function () {

        if (this.mask) {
            // 已经初始化过mask
            return;
        }

        var mask = document.createElement('div');
        mask.classList.add(NAMESPACE + 'gallery-mask');
        document.querySelector('body').appendChild(this.mask = mask);

    },
    /**
     * 根据传入options 设置内部变量
     * @private
     */
    _setting: function () {

        var opts = this.options;
        // 幻灯片外层容器
        this.wrap = this.mask;
        // 幻灯片 内容list
        this.data = opts.data;
        // 内容类型 dom or pic
        this.type = 'pic';
        // 滑动方向
        this.isVertical = false;
        // Overspread mode
        this.isOverspread = opts.isOverspread || false;
        // 图片切换时间间隔
        this.duration = opts.duration || 2000;
        // 指定开始播放的图片index
        this.initIndex = opts.initIndex || 0;
        if (this.initIndex > this.data.length - 1 || this.initIndex < 0) {
            this.initIndex = 0;
        }
        // touchstart prevent default to fixPage
        this.fixPage = true;
        this.slideIndex = this.slideIndex || this.initIndex || 0;

        this.axis = 'X';
        this.reverseAxis = this.axis === 'Y' ? 'X' : 'Y';

        this.width = this.width || this.wrap.clientWidth || document.body.clientWidth || document.body.offsetWidth;
        this.height = this.height || this.wrap.clientHeight || document.body.clientHeight || document.body.offsetHeight;

        this.ratio = this.height / this.width;
        this.scale = this.width;
        // Callback function when your finger is moving
        this.onslide = opts.onslide;
        // Callback function when your finger touch the screen
        this.onslidestart = opts.onslidestart;
        // Callback function when the finger move out of the screen
        this.onslideend = opts.onslideend;
        // Callback function when the finger move out of the screen
        this.onslidechange = opts.onslidechange;

        this.offset = this.offset || {
            X: 0,
            Y: 0
        };
        this.useZoom = opts.useZoom || false;
        // looping logic adjust
        if (this.data.length < 2) {
            this.isLooping = false;
            this.isAutoPlay = false;
        }
        else {
            this.isLooping = opts.isLooping || false;
            this.isAutoplay = false;
        }
        // little trick set, when you chooce tear & vertical same time
        // iSlider overspread mode will be set true autometicly
        if (opts.animateType === 'card' && this.isVertical) {
            this.isOverspread = true;
        }
        // 自动播放模式
        if (this.isAutoplay) {
            this.show();
            this._play();
        }

        if (this.useZoom) {
            this._addZoomPlugin();
            this._initZoom(opts);
        }

        this.infoType = opts.infoType || 0;
        this.bottomHeight = (this.infoType === 1) ? '50px' : '116px';
        // debug mode
        this.log = opts.isDebug ? function (str) {
                window.console.log(str);
            } : function () {
        };
        // set Damping function
        this._setUpDamping();
        // stop autoplay when window blur
        // this._setPlayWhenFocus();
        // set animate Function
        this._animateFunc =
        opts.animateType in this._animateFuncs ? this._animateFuncs[opts.animateType] : this._animateFuncs['default'];
    },
    /**
     * transform 移动动画
     * @private
     * @type {Object}
     */
    _animateFuncs: {
        'default': function (dom, axis, scale, i, offset) {
            dom.style.webkitTransform = 'translateZ(0) translate' + axis + '(' + (offset + scale * (i - 1)) + 'px)';
        }
    },
    /**
     * @private
     */
    _setUpDamping: function () {
        var oneIn2 = this.scale >> 1;
        var oneIn4 = oneIn2 >> 1;
        var oneIn16 = oneIn4 >> 2;
        this._damping = function (distance) {
            var dis = Math.abs(distance);
            var result;
            if (dis < oneIn2) {
                result = dis >> 1;
            }
            else if (dis < oneIn2 + oneIn4) {
                result = oneIn4 + (dis - oneIn2 >> 2);
            }
            else {
                result = oneIn4 + oneIn16 + (dis - oneIn2 - oneIn4 >> 3);
            }
            return distance > 0 ? result : -result;
        };
    },
    /**
    * render single item html by idx
    * @private
    * @param {element} el ..
    * @param {number}  i  ..
    */
    _renderItem: function (el, i) {
        var item;
        var html;
        var len = this.data.length;
        // get the right item of data
        if (!this.isLooping) {
            item = this.data[i] || {empty: true};
        }
        else {
            if (i < 0) {
                item = this.data[len + i];
            }
            else if (i > len - 1) {
                item = this.data[i - len];
            }
            else {
                item = this.data[i];
            }
        }
        if (item.empty) {
            el.innerHTML = '';
            el.style.background = '';
            return;
        }
        if (this.type === 'pic') {
            if (!this.isOverspread) {
                html = item.height / item.width > this.ratio ?
                '<img  height="' + this.height + '" src="' + item.image + '">' :
                '<img width="' + this.width + '" src="' + item.image + '">';
            }
            else {
                el.style.background = 'url(' + item.image + ') 50% 50% no-repeat';
                el.style.backgroundSize = 'cover';
            }
        }
        else if (this.type === 'dom') {
            html = item.image;
        }
        html && (el.innerHTML = html);
    },
    /**
     * render list html
     * @private
     */
    _renderHTML: function () {

        this.outer && (this.outer.innerHTML = '');
        // initail ul element
        var outer = this.outer || document.createElement('ul');
        outer.style.cssText =
        'height:' + this.height + 'px;width:' + this.width + 'px;margin:0;padding:0;list-style:none;';
        // storage li elements, only store 3 elements to reduce memory usage
        this.els = [];
        for (var i = 0; i < 3; i++) {
            var li = document.createElement('li');
            li.className = this.type === 'dom' ? NAMESPACE + 'gallery-dom' : NAMESPACE + 'gallery-pic';
            li.style.cssText = 'height:' + this.height + 'px;width:' + this.width + 'px;';
            this.els.push(li);
            // prepare style animation
            this._animateFunc(li, this.axis, this.scale, i, 0);

            if (this.isVertical && (this._opts.animateType === 'rotate' || this._opts.animateType === 'flip')) {
                this._renderItem(li, 1 - i + this.slideIndex);
            }
            else {
                this._renderItem(li, i - 1 + this.slideIndex);
            }
            outer.appendChild(li);
        }
        this._initLoadImg();
        // append ul to div#canvas
        if (!this.outer) {
            this.outer = outer;
            this.wrap.appendChild(outer);
        }

        if (!this.topMenu) {
            this._renderTopAndBottom();
        }
    },
    /**
     * 渲染顶部和底部
     * @private
     */
    _renderTopAndBottom: function () {

        var topMenu = this.topMenu || document.createElement('div');
        var topBack = this.topBack || document.createElement('span');
        var topTitle = this.topTitle || document.createElement('div');

        topMenu.classList.add(NAMESPACE + 'gallery-top');
        topBack.classList.add(NAMESPACE + 'gallery-top-back');
        topTitle.classList.add(NAMESPACE + 'gallery-top-title');

        topMenu.appendChild(topBack);
        topMenu.appendChild(this.topTitle = topTitle);

        topBack.addEventListener('click', (function (val) {
            var that = val;

            return function (e) {
                that.outer.innerHTML = '';
                // that.mask.style.visibility = "hidden";
                that.mask.style.display = 'none';
                that._hideMenu();
            };
        })(this));

        var bottomMenu = this.bottomMenu || document.createElement('div');
        bottomMenu.classList.add(NAMESPACE + 'gallery-bottom');
        if (this.infoType === 1) {
          bottomMenu.classList.add(NAMESPACE + 'gallery-type-1');  
        }

        // 底部内容展示

        var bottomInfoWrap = this.bottomInfoWrap || document.createElement('div');
        bottomInfoWrap.classList.add(NAMESPACE + 'gallery-bottom-info-wrap');


        var bottomInfo = this.bottomInfo || document.createElement('div');
        bottomInfo.classList.add(NAMESPACE + 'gallery-bottom-info');


        var bottomPage = this.bottomPage || document.createElement('span');
        bottomPage.classList.add(NAMESPACE + 'gallery-bottom-page');

        bottomInfoWrap.appendChild(this.bottomPage = bottomPage);
        bottomInfoWrap.appendChild(this.bottomInfo = bottomInfo);

        bottomMenu.appendChild(bottomInfoWrap);

        this.wrap.appendChild(this.topMenu = topMenu);
        this.wrap.appendChild(this.bottomMenu = bottomMenu);
    },
    /**
     *  preload img when slideChange
     *  @private
     *  @param {number} dataIndex means which image will be load
     */
    _preloadImg: function (dataIndex) {
        var len = this.data.length;
        var idx = dataIndex;
        var self = this;
        var loadImg = function (index) {
            if (index > -1 && !self.data[index].loaded) {
                var preloadImg = new Image();
                preloadImg.src = self.data[index].image;
                self.data[index].loaded = 1;
            }
        };
        if (self.type !== 'dom') {
            var nextIndex = idx + 2 > len - 1 ? (idx + 2) % len : idx + 2;
            var prevIndex = idx - 2 < 0 ? len - 2 + idx : idx - 2;
            loadImg(nextIndex);
            loadImg(prevIndex);
        }
    },
    /**
     *  load extra imgs when renderHTML
     *  @private
     */
    _initLoadImg: function () {
        var data = this.data;
        var len = data.length;
        var idx = this.initIndex;
        var self = this;
        /*if (idx >= len - 1) {
            // fix bug
            return;
        }*/
        if (this.type !== 'dom' && len > 3) {
            var nextIndex = idx + 2 > len ? (idx + 1) % len : idx + 1;
            var prevIndex = idx - 1 < 0 ? len - 1 + idx : idx - 1;
            data[idx].loaded = 1;
            data[nextIndex].loaded = 1;
            if (self.isLooping) {
                data[prevIndex].loaded = 1;
            }
            setTimeout(function () {
                self._preloadImg(idx);
            }, 200);
        }
    },
    /**
     * @private
     */
    _play: function () {
        var self = this;
        var duration = this.duration;
        clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = setInterval(function () {
            self._slideTo(self.slideIndex + 1);
        }, duration);
    },
    /**
     * 滑动到指定的图片
     * @private
     * @param  {number} dataIndex 图片索引
     */
    _slideTo: function (dataIndex) {

        var data = this.data;
        var els = this.els;
        var idx = dataIndex;
        var n = dataIndex - this.slideIndex;
        if (Math.abs(n) > 1) {
            var nextEls = n > 0 ? this.els[2] : this.els[0];
            this._renderItem(nextEls, idx);
        }
        // preload when slide
        this._preloadImg(idx);
        // get right item of data
        if (data[idx]) {
            this.slideIndex = idx;
        }
        else {
            if (this.isLooping) {
                this.slideIndex = n > 0 ? 0 : data.length - 1;
            }
            else {
                this.slideIndex = this.slideIndex;
                n = 0;
            }
        }

        this.log('pic idx:' + this.slideIndex);
        this.topTitle.innerText = this.data[this.slideIndex].title;
        this.bottomInfo.innerText = this.data[this.slideIndex].description;
        this.bottomPage.innerText = (this.slideIndex + 1) + '/' + this.data.length;

        // keep the right order of items
        var sEle;
        if (this.isVertical && (this._opts.animateType === 'rotate' || this._opts.animateType === 'flip')) {
            if (n > 0) {
                sEle = els.pop();
                els.unshift(sEle);
            }
            else if (n < 0) {
                sEle = els.shift();
                els.push(sEle);
            }
        }
        else {
            if (n > 0) {
                sEle = els.shift();
                els.push(sEle);
            }
            else if (n < 0) {
                sEle = els.pop();
                els.unshift(sEle);
            }
        }
        // slidechange should render new item
        // and change new item style to fit animation
        if (n !== 0) {
            if (Math.abs(n) > 1) {
                this._renderItem(els[0], idx - 1);
                this._renderItem(els[2], idx + 1);
            }
            else if (Math.abs(n) === 1) {
                this._renderItem(sEle, idx + n);
            }
            sEle.style.webkitTransition = 'none';
            sEle.style.visibility = 'hidden';
            setTimeout(function () {
                sEle.style.visibility = 'visible';
            }, 200);
            // this.onslidechange && this.onslidechange(this.slideIndex);
            // this.dotchange && this.dotchange();
        }
        // do the trick animation
        for (var i = 0; i < 3; i++) {
            if (els[i] !== sEle) {
                els[i].style.webkitTransition = 'all .3s ease';
            }
            this._animateFunc(els[i], this.axis, this.scale, i, 0);
        }

        // stop playing when meet the end of data
        if (this.isAutoplay && !this.isLooping && this.slideIndex === data.length - 1) {
            this._pause();
        }
    },
    /**
     * 暂停自动播放
     * @private
     */
    _pause: function () {
        clearInterval(this.autoPlayTimer);
    },
    /**
     * judge the device
     * @private
     * @return {Object} 事件
     */
    _device: function () {
        var hasTouch = !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch);
        var startEvt = hasTouch ? 'touchstart' : 'mousedown';
        var moveEvt = hasTouch ? 'touchmove' : 'mousemove';
        var endEvt = hasTouch ? 'touchend' : 'mouseup';
        return {
            hasTouch: hasTouch,
            startEvt: startEvt,
            moveEvt: moveEvt,
            endEvt: endEvt
        };
    },
    /**
     * 绑定事件
     * @private
     */
    _bindHandler: function () {

        var outer = this.outer;
        var device = this._device();
        if (!device.hasTouch) {
            outer.style.cursor = 'pointer';
            outer.ondragstart = function (evt) {
                if (evt) {
                    return false;
                }
                return true;
            };
        }

        outer.addEventListener(device.startEvt, this);
        outer.addEventListener(device.moveEvt, this);
        outer.addEventListener(device.endEvt, this);
        window.addEventListener('orientationchange', this);
    },
    handleEvent: function (evt) {
        var device = this._device();
        switch (evt.type) {
            case device.startEvt:
                this._startHandler(evt);
                break;
            case device.moveEvt:
                this._moveHandler(evt);
                break;
            case device.endEvt:
                this._endHandler(evt);
                break;
            case 'touchcancel':
                this._endHandler(evt);
                break;
            case 'orientationchange':
                this._orientationchangeHandler();
                break;
            case 'focus':
                this.isAutoplay && this._play();
                break;
            case 'blur':
                this._pause();
                break;
        }
    },
    /**
     * 处理touchStart事件
     * @private
     * @param  {Event} evt ...
     */
    _startHandler: function (evt) {
        if (this.fixPage) {
            evt.preventDefault();
        }

        var device = this._device();
        // console.log(device);
        this.isMoving = true;
        this._pause();
        // this.onslidestart && this.onslidestart();
        this.log('Event: beforeslide');
        this.startTime = new Date().getTime();
        this.startX = device.hasTouch ? evt.targetTouches[0].pageX : evt.pageX;
        this.startY = device.hasTouch ? evt.targetTouches[0].pageY : evt.pageY;
        this.zoomStartHandler && this.zoomStartHandler(evt);  // zoom 事件
    },
    /**
     * 处理touchMove事件
     * @private
     * @param  {Event} evt ...
     */
    _moveHandler: function (evt) {
        if (this.isMoving) {

            var device = this._device();
            var len = this.data.length;
            var axis = this.axis;
            var reverseAxis = this.reverseAxis;
            var offset = {
                X: device.hasTouch ? evt.targetTouches[0].pageX - this.startX : evt.pageX - this.startX,
                Y: device.hasTouch ? evt.targetTouches[0].pageY - this.startY : evt.pageY - this.startY
            };
            var res = this.zoomMoveHandler ? this.zoomMoveHandler(evt) : false;  // zoom  事件
            // var res = false;
            if (!res && Math.abs(offset[axis]) - Math.abs(offset[reverseAxis]) > 10) {
                evt.preventDefault();
                this.onslide && this.onslide(offset[axis]);
                this.log('Event: onslide');
                if (!this.isLooping) {
                    // 未开启循环
                    if (offset[axis] > 0 && this.slideIndex === 0 || offset[axis] < 0 && this.slideIndex === len - 1) {
                        offset[axis] = this._damping(offset[axis]);
                    }
                }
                for (var i = 0; i < 3; i++) {
                    var item = this.els[i];
                    item.style.webkitTransition = 'all 0s';
                    this._animateFunc(item, axis, this.scale, i, offset[axis]);
                }
            }
            this.offset = offset;
        }
    },
    /**
     * 处理touchEnd事件
     * @private
     * @param  {Event} evt ...
     */
    _endHandler: function (evt) {
        this.isMoving = false;
        var offset = this.offset;
        var axis = this.axis;
        var boundary = this.scale / 2;
        var endTime = new Date().getTime();
        // a quick slide time must under 300ms
        // a quick slide should also slide at least 14 px
        boundary = endTime - this.startTime > 300 ? boundary : 14;
        var res = this.zoomEndHandler ? this.zoomEndHandler(evt) : false; // zoom  事件
        // var res = false;

        var absOffset = Math.abs(offset[axis]);
        var absReverseOffset = Math.abs(offset[this.reverseAxis]);
        if (!res && offset[axis] >= boundary && absReverseOffset < absOffset) {
            this._slideTo(this.slideIndex - 1);
        }
        else if (!res && offset[axis] < -boundary && absReverseOffset < absOffset) {
            this._slideTo(this.slideIndex + 1);
        }
        else if (!res) {
            this._slideTo(this.slideIndex);

            if (this.isMenuShow) {
                this._hideMenu();
            }
            else {
                this._showMenu();
            }
        }
        // create tap event if offset < 10
        if (Math.abs(this.offset.X) < 10 && Math.abs(this.offset.Y) < 10) {
            this.tapEvt = document.createEvent('Event');
            this.tapEvt.initEvent('tap', true, true);
            if (!evt.target.dispatchEvent(this.tapEvt)) {
                evt.preventDefault();
            }
        }
        this.offset.X = this.offset.Y = 0;
        this.isAutoplay && this._play();
        // this.onslideend && this.onslideend(this.slideIndex);
        this.log('Event: afterslide');
    },
    /**
     * @private
     */
    _destroy: function () {
        var outer = this.outer;
        var device = this._device();
        outer.removeEventListener(device.startEvt, this);
        outer.removeEventListener(device.moveEvt, this);
        outer.removeEventListener(device.endEvt, this);
        window.removeEventListener('orientationchange', this);
        window.removeEventListener('focus', this);
        window.removeEventListener('blur', this);
        this.wrap.innerHTML = '';
    },
    /**
     * 展示顶部和底部
     * @private
     */
    _showMenu: function () {

        this.topMenu.style.webkitTransform = 'translate3d(0, 0, 0)';
        this.bottomMenu.style.webkitTransform = 'translate3d(0, 0, 0)';
        this.isMenuShow = true;
    },
    /**
     * 隐藏顶部和底部
     * @private
     */
    _hideMenu: function () {

        this.topMenu.style.webkitTransform = 'translate3d(0, -44px, 0)';
        // this.bottomMenu.style.webkitTransform = 'translate3d(0, 116px, 0)';
        this.bottomMenu.style.webkitTransform = 'translate3d(0, ' + this.bottomHeight + ', 0)';
        this.isMenuShow = false;
    },
    /**
     * 指定展示第几张图片
     * @public
     * @param  {number} val 图片索引
     */
    show: function (val) {

        if (IS_UIX && this._uix) {
            this._uix.show();
            return;
        }

        if (val < 0 || isNaN(parseInt(val, 10))) {
            val = 0;
        }
        else if (val >= this.data.length) {
            val = this.data.length - 1;
        }

        this.initIndex = val;
        this._renderHTML();

        this._slideTo(val);
        this.mask.style.visibility = 'visible';
        this.mask.style.display = 'block';


        /* if (!this.outer || !this.outer.innerHTML) {
            this._renderHTML();
        }*/

        var that = this;
        setTimeout(function(){
            that._showMenu();
        },300);
        // this._showMenu();
    },
    /**
     * 隐藏gallery
     * @public
     */
    hide: function () {
        this.mask.style.display = 'none';
        this.mask.style.visibility = 'hidden';
    },
    extend: function (plugin, main) {
        if (!main) {
            main = this;
        }
        Object.keys(plugin).forEach(function (property) {
            Object.defineProperty(main, property, Object.getOwnPropertyDescriptor(plugin, property));
        });
    },
    /**
     * 增加图片的缩放功能
     * @private
     */
    _addZoomPlugin: function () {
        var has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
        var minScale = 1 / 2;
        var viewScope = {};
        function generateTranslate(x, y, z, scale) {
            return 'translate' + (has3d ? '3d(' : '(') + x
            + 'px,' + y + (has3d ? 'px,' + z + 'px)' : 'px)') + 'scale(' + scale + ')';
        }
        function getDistance(a, b) {
            var x;
            var y;
            x = a.left - b.left;
            y = a.top - b.top;
            return Math.sqrt(x * x + y * y);
        }
        function generateTransformOrigin(x, y) {
            return x + 'px ' + y + 'px';
        }
        function getTouches(touches) {
            return Array.prototype.slice.call(touches).map(function (touch) {
                return {
                    left: touch.pageX,
                    top: touch.pageY
                };
            });
        }
        function calculateScale(start, end) {
            var startDistance = getDistance(start[0], start[1]);
            var endDistance = getDistance(end[0], end[1]);
            return endDistance / startDistance;
        }
        function getComputedTranslate(obj) {
            var result = {
                translateX: 0,
                translateY: 0,
                translateZ: 0,
                scaleX: 1,
                scaleY: 1,
                offsetX: 0,
                offsetY: 0
            };
            var offsetX = 0;
            var offsetY = 0;
            if (!window.getComputedStyle || !obj) {
                return result;
            }
            var style = window.getComputedStyle(obj);
            var transform;
            var origin;
            transform = style.webkitTransform || style.mozTransform;
            origin = style.webkitTransformOrigin || style.mozTransformOrigin;
            var par = origin.match(/(.*)px\s+(.*)px/);
            if (par.length > 1) {
                offsetX = par[1] - 0;
                offsetY = par[2] - 0;
            }
            if (transform === 'none') {
                return result;
            }
            var mat3d = transform.match(/^matrix3d\((.+)\)$/);
            var mat2d = transform.match(/^matrix\((.+)\)$/);
            var str;
            if (mat3d) {
                str = mat3d[1].split(', ');
                result = {
                    translateX: str[12] - 0,
                    translateY: str[13] - 0,
                    translateZ: str[14] - 0,
                    offsetX: offsetX - 0,
                    offsetY: offsetY - 0,
                    scaleX: str[0] - 0,
                    scaleY: str[5] - 0,
                    scaleZ: str[10] - 0
                };
            }
            else if (mat2d) {
                str = mat2d[1].split(', ');
                result = {
                    translateX: str[4] - 0,
                    translateY: str[5] - 0,
                    offsetX: offsetX - 0,
                    offsetY: offsetY - 0,
                    scaleX: str[0] - 0,
                    scaleY: str[3] - 0
                };
            }
            return result;
        }
        function getCenter(a, b) {
            return {
                x: (a.x + b.x) / 2,
                y: (a.y + b.y) / 2
            };
        }
        // 初始化缩放参数等
        function initZoom(opts) {
            this.currentScale = 1;
            this.zoomFactor = opts.zoomFactor || 2;
        }
        function startHandler(evt) {
            if (this.useZoom) {
                var node = this.els[1].querySelector('img');
                var transform = getComputedTranslate(node);
                this.startTouches = getTouches(evt.targetTouches);
                this._startX = transform.translateX - 0;
                this._startY = transform.translateY - 0;
                this.currentScale = transform.scaleX;
                this.zoomNode = node;
                var pos = getPosition(node);
                // console.log(evt.targetTouches);
                if (evt.targetTouches.length === 2) {
                    this.lastTouchStart = null;
                    var touches = evt.touches;
                    var touchCenter = getCenter({
                        x: touches[0].pageX,
                        y: touches[0].pageY
                    }, {
                        x: touches[1].pageX,
                        y: touches[1].pageY
                    });
                    node.style.webkitTransformOrigin =
                    generateTransformOrigin(touchCenter.x - pos.left, touchCenter.y - pos.top);
                }
                else if (evt.targetTouches.length === 1) {
                    var time = new Date().getTime();
                    this.gesture = 0;
                    if (time - this.lastTouchStart < 300) {
                        evt.preventDefault();
                        this.gesture = 3;
                    }
                    this.lastTouchStart = time;
                }
            }
        }
        function moveHandler(evt) {
            var result = 0;
            var node = this.zoomNode;
            var device = this._device();
            if (device.hasTouch) {
                if (evt.targetTouches.length === 2 && this.useZoom) {
                    node.style.webkitTransitionDuration = '0';
                    evt.preventDefault();
                    this._scaleImage(evt);
                    result = 2;
                }
                else if (evt.targetTouches.length === 1 && this.useZoom && this.currentScale > 1) {
                    node.style.webkitTransitionDuration = '0';
                    evt.preventDefault();
                    this._moveImage(evt);
                    result = 1;
                }
                this.gesture = result;
                return result;
            }
        }
        function handleDoubleTap(evt) {
            var zoomFactor = this.zoomFactor || 2;
            var node = this.zoomNode;
            var pos = getPosition(node);
            this.currentScale = this.currentScale === 1 ? zoomFactor : 1;
            node.style.webkitTransform = generateTranslate(0, 0, 0, this.currentScale);
            if (this.currentScale !== 1) {
                node.style.webkitTransformOrigin =
                generateTransformOrigin(evt.touches[0].pageX - pos.left, evt.touches[0].pageY - pos.top);
            }
        }
        // 缩放图片
        function scaleImage(evt) {
            var moveTouces = getTouches(evt.targetTouches);
            var scale = calculateScale(this.startTouches, moveTouces);
            // Object.defineProperty(evt,"scale",{"writable":true});
            var tmpscale = evt.scale || scale;
            // evt.scale = evt.scale || scale;
            var node = this.zoomNode;
            scale = this.currentScale * tmpscale < minScale ? minScale : this.currentScale * tmpscale;
            node.style.webkitTransform = generateTranslate(0, 0, 0, scale);
        }
        function endHandler(evt) {
            var result = 0;
            if (this.gesture === 2) {
                // 双手指 todo
                this._resetImage(evt);
                result = 2;
            }
            else if (this.gesture === 1) {
                // 放大拖拽 todo
                this._resetImage(evt);
                result = 1;
            }
            else if (this.gesture === 3) {
                // 双击
                this._handleDoubleTap(evt);
                this._resetImage(evt);
            }
            return result;
        }
        // 拖拽图片
        function moveImage(evt) {
            var node = this.zoomNode;
            var device = this._device();
            var offset = {
                X: device.hasTouch ? evt.targetTouches[0].pageX - this.startX : evt.pageX - this.startX,
                Y: device.hasTouch ? evt.targetTouches[0].pageY - this.startY : evt.pageY - this.startY
            };
            this.moveOffset = {
                x: this._startX + offset.X - 0,
                y: this._startY + offset.Y - 0
            };
            node.style.webkitTransform = generateTranslate(this.moveOffset.x, this.moveOffset.y, 0, this.currentScale);
        }
        function getPosition(element) {
            var pos = {
                left: 0,
                top: 0
            };
            do {
                pos.top += element.offsetTop || 0;
                pos.left += element.offsetLeft || 0;
                element = element.offsetParent;
            } while (element);
            return pos;
        }
        function valueInViewScope(node, value, tag) {
            var min;
            var max;
            var pos = getPosition(node);
            viewScope = {
                start: {
                    left: pos.left,
                    top: pos.top
                },
                end: {
                    left: pos.left + node.clientWidth,
                    top: pos.top + node.clientHeight
                }
            };
            var str = tag === 1 ? 'left' : 'top';
            min = viewScope.start[str];
            max = viewScope.end[str];
            return value >= min && value <= max;
        }
        function overFlow(node, obj1) {
            var result = 0;
            var isX1In = valueInViewScope(node, obj1.start.left, 1);
            var isX2In = valueInViewScope(node, obj1.end.left, 1);
            var isY1In = valueInViewScope(node, obj1.start.top, 0);
            var isY2In = valueInViewScope(node, obj1.end.top, 0);
            if (isX1In !== isX2In && isY1In !== isY2In) {
                if (isX1In && isY2In) {
                    result = 1;
                }
                else if (isX1In && isY1In) {
                    result = 2;
                }
                else if (isX2In && isY2In) {
                    result = 3;
                }
                else {
                    result = 4;
                }
            }
            else if (isX1In === isX2In) {
                if (!isY1In && isY2In) {
                    result = 5;
                }
                else if (!isY2In && isY1In) {
                    result = 6;
                }
            }
            else if (isY1In === isY2In) {
                if (!isX1In && isX2In) {
                    result = 7;
                }
                else if (isX1In && !isX2In) {
                    result = 8;
                }
            }
            else if (isY1In === isY2In === isX1In === isX2In) {
                result = 9;
            }
            return result;
        }
        function resetImage(evt) {
            if (this.currentScale === 1) {
                return;
            }
            // var node = this.zoomNode, left, top, trans, w, h, pos, start, end, parent, flowTag;
            var node = this.zoomNode;
            var left;
            var top;
            var trans;
            var w;
            var h;
            var pos;
            var start;
            var end;
            var parent;
            var flowTag;
            trans = getComputedTranslate(node);
            parent = node.parentNode;
            w = node.clientWidth * trans.scaleX;
            h = node.clientHeight * trans.scaleX;
            pos = getPosition(node);
            start = {
                left: (1 - trans.scaleX) * trans.offsetX + pos.left + trans.translateX,
                top: (1 - trans.scaleX) * trans.offsetY + pos.top + trans.translateY
            };
            end = {
                left: start.left + w,
                top: start.top + h
            };
            left = start.left;
            top = start.top;
            flowTag = overFlow(parent, {
                start: start,
                end: end
            });
            switch (flowTag) {
                case 1:
                    left = viewScope.start.left;
                    top = viewScope.end.top - h;
                    break;
                case 2:
                    left = viewScope.start.left;
                    top = viewScope.start.top;
                    break;
                case 3:
                    left = viewScope.end.left - w;
                    top = viewScope.end.top - h;
                    break;
                case 4:
                    left = viewScope.end.left - w;
                    top = viewScope.start.top;
                    break;
                case 5:
                    top = viewScope.end.top - h;
                    break;
                case 6:
                    top = viewScope.start.top;
                    break;
                case 7:
                    left = viewScope.end.left - w;
                    break;
                case 8:
                    left = viewScope.start.left;
                    break;
            }
            if (w < parent.clientWidth) {
                left = pos.left - (trans.scaleX - 1) * node.clientWidth / 2;
            }
            if (h < parent.clientHeight) {
                top = pos.top - (trans.scaleX - 1) * node.clientHeight / 2;
            }
            node.style.webkitTransitionDuration = '100ms';
            node.style.webkitTransform =
            generateTranslate(trans.translateX + left - start.left, trans.translateY + top - start.top,
            0, trans.scaleX);
        }
        this.extend({
            /**
             * @private
             * @type {Function}
             */
            _initZoom: initZoom,
            /**
             * @private
             * @type {Function}
             */
            _scaleImage: scaleImage,
            /**
             * @private
             * @type {Function}
             */
            _moveImage: moveImage,
            /**
             * @private
             * @type {Function}
             */
            _resetImage: resetImage,
            /**
             * @private
             * @type {Function}
             */
            _handleDoubleTap: handleDoubleTap,
            zoomMoveHandler: moveHandler,
            zoomEndHandler: endHandler,
            zoomStartHandler: startHandler
        });
    }

});
})(Zepto)
;(function($){/* globals NAMESPACE */
/* globals IS_UIX */
/* globals color2Hex */
/* globals ACTION_BACK_CLASS */
/* eslint-disable fecs-camelcase */
/**
 * @file header 组件
 * @author zhangyuanwei
 */

'use strict';
/**
 * 定义一个组件
 */


$.widget('blend.header', {
    options: {
        leftSelector: '.' + NAMESPACE + 'header-left',
        rightSelector: '.' + NAMESPACE + 'header-right',
        titleSelector: '.' + NAMESPACE + 'header-title',
        itemSelector: '.' + NAMESPACE + 'header-item'
    },
    _create: function () {
        this._uix = null;
    },
    _init: function () {
        var me = this;
        if (IS_UIX) {
            if (this._uix !== null) {
                this._uix.destroy();
            }
            require(['blend'], function (blend) {
                me._uix = me._initUIXComponent(blend);
                me._uix.render();
            });
        }

        // this._initUIXComponent();
    },
    _initUIXComponent: function (blend) {
        var $el = this.element;
        var options = this.options;
        var uixTitle;

        var $leftItems = $el.find(options.leftSelector).find(options.itemSelector);
        var $rightItems = $el.find(options.rightSelector).find(options.itemSelector);
        var $titleItems = $el.find(options.titleSelector).find(options.itemSelector);

        uixTitle = blend.create('title', {
            text: $titleItems.text()
            // TODO 支持Image
        });


        uixTitle.setStyle({
            backgroundColor: color2Hex($el.css('background-color')),
            color: color2Hex($el.css('color'))
        });


        $leftItems.each(__genItemIterator(function (obj) {
            uixTitle.addLeftItem(obj);
        }));

        $rightItems.each(__genItemIterator(function (obj) {
            uixTitle.addRightItem(obj);
        }));


        return uixTitle;
    }
});


function __genItemIterator(cb) {
    return function (i, item) {
        var $item = $(item);
        var retObj = {};
        var nodeName = item.nodeName;

        if ($item.hasClass(ACTION_BACK_CLASS)) {
            retObj.action = {
                operator: 'back'
            };
        }
        else if (nodeName && nodeName.toUpperCase() === 'A') {
            retObj.action = {
                url: item.href
            };
        }

        retObj.text = $item.text();

        // TODO more event
        // TODO style
        cb(retObj);
    };
}
})(Zepto)
;(function($){/* globals NAMESPACE */
/* globals Hammer */
/* eslint-disable fecs-camelcase */
/**
 * @file list 组件
 * @author wanghongliang02
 */

$.widget('blend.list', {
    /**
     * 组件的默认选项，可以由多重覆盖关系
     */
    options: {
        del: true,  // 删除的开关
        animate: true,  // 动画的开关
        itemClass: NAMESPACE + 'list-item',     // 滑动的element的class
        animateClass: NAMESPACE + 'list-animation', // 动画实现的class
        itemContentClass: NAMESPACE + 'list-item-content',  // 列表主体element的class
        itemDeleteActiveClass: NAMESPACE + 'list-item-delete-active',   // 列表删除激活时的class
        asyn: false,    // 删除的异步模式开关
        exceptionElement: false // 不删除的元素, 填写css的class
    },
    /**
     * _create 创建组件时调用一次
     */
    _create: function () {
        // 保存上一个删除的dom，for revert
        this.$tempEl = null;
        this.tempIndex = null;
        this.deleteWidth = '-54px';
        this.deleteBtnClass = NAMESPACE + 'list-item-delete';
    },
    /**
     * _init 初始化的时候调用
     */
    _init: function () {
        var list = this;
        if (!list.options.del) {
            this._destroy();
            return;
        }
        if (list.options.animate) {
            list.element.addClass(list.options.animateClass);
        }
        else {
            list.element.removeClass(list.options.animateClass);
        }
        list._initEvent();
    },
    /**
     * 绑定事件
     * @private
     */
    _initEvent: function () {
        var list = this;
        var $items = list.element.find('.' + list.options.itemClass);
        $items.each(function () {
            var $this = $(this);
            var hammer = $this.data('hammer');
            if (!hammer) {
                hammer = new Hammer(this);
            }
            $this.data('hammer', hammer);
            if ($this.hasClass(list.options.exceptionClass)) {
                return;
            }
            hammer.on('swipeleft', function (ev) {
                if ($this.find('.' + list.deleteBtnClass).length === 0) {
                    $this.parent().append('<span class="' + list.deleteBtnClass + '">删除</span>');
                }
                $this.addClass(list.options.itemDeleteActiveClass);
                $this.find('.' + list.options.itemContentClass).css('left', list.deleteWidth);
            });
        });
        if (!list.eventInit) {
            list.eventInit = true;
            list.element.on('click.list', '.' + list.deleteBtnClass, function (e) {
                var $parent = $(this).closest('.' + list.options.itemClass);
                list.tempIndex = $parent.index();
                $parent.data('height', $parent.height());

                var eventData = {};
                eventData.ele = $parent;
                if (list.options.asyn) {
                    eventData.callback = function () {
                        $parent.height(0);
                        setTimeout(function () {
                            list.$tempEl = $parent.detach();
                            list.$tempEl.removeClass(list.options.itemDeleteActiveClass);
                            list.$tempEl.find('.' + list.options.itemContentClass).css('left', 0);
                        }, list.options.animate ? 500 : 0);
                    };
                    list._trigger('beforedelete', null, eventData);
                }
                else {
                    if (list._trigger('beforedelete', null, eventData)) {
                        $parent.height(0);
                        setTimeout(function () {
                            list.$tempEl = $parent.detach();
                            list.$tempEl.removeClass(list.options.itemDeleteActiveClass);
                            list.$tempEl.find('.' + list.options.itemContentClass).css('left', 0);
                        }, list.options.animate ? 500 : 0);
                    }
                }
            });
            // 未点击删除时的恢复
            list.element.on('touchstart.list', function (e) {
                var $target = $(e.target);
                var className = list.deleteBtnClass;
                if (!$target.hasClass(className) &&
                    list.element.find('.' + list.options.itemDeleteActiveClass).length === 1) {
                    var $el = list.element.find('.' + list.options.itemDeleteActiveClass);
                    if ($el.length === 1) {
                        $el.removeClass(list.options.itemDeleteActiveClass);
                        $el.find('.' + list.options.itemContentClass).css('left', 0);
                    }
                }
            });
        }

    },
    /**
     * destroy the swipe event
     * 取消一个列表的滑动删除效果
     * @private
     */
    _destroy: function () {
        var list = this;
        var $items = list.element.find('.' + list.options.itemClass);
        $items.each(function () {
            var hammer = $(this).data('hammer');
            if (hammer) {
                hammer.off('swipeleft');
            }
        });
        list.eventInit = false;
        list.element.off('click.list', '.' + list.deleteBtnClass);
        list.element.off('touchstart.list');
    },
    /**
     * 刷新配置
     */
    refresh: function () {
        this._init();
    },
    /**
     * 用于删除失败时的恢复
     */
    revert: function () {
        var list = this;
        if (list.tempIndex === null || list.tempIndex === -1) {
            return;
        }
        var height = list.$tempEl.data('height');
        var $lastItem = list.element.find('.' + list.options.itemClass).eq(list.tempIndex);
        if ($lastItem.length === 1) {
            list.$tempEl.insertBefore($lastItem).height(height);
        }
        else {
            list.$tempEl.appendTo(list.element).height(height);
        }
    }

});
})(Zepto)
;(function($){/**
 * @function loading
 * @file loading.js
 * @name loading
 * @author wangzhonghua
 * @date 2015.02.05
 * @memberof $.fn or $.blend
 * @grammar  $('.test').loading().show(),$.blend.loading().show()
 * @desc 页面级loading
 * @param {Object} opts 组件配置（以下参数为配置项）
 * @param {String} opts.loadingClass (可选, 默认值:\'\') loading节点的className
 * @param {String} opts.loadingHtml (可选, 默认值:\'\') loading节点
 *
 * @example
 * 	1、$('.j_test_loading').loading(), $('.j_test_loading')为loading自定义节点,并不是容器,切记
 * 	2、var loading = $.blend.loading({
 * 						loadingClass: 'my_define'
 * 					});
 * 		  loading.show();
 *  3、var loading = $.blend.loading({
 * 						loadingHtml: '<div class="my_define">loading...</div>'
 * 					});
 * 		  loading.show();
 */
'use strict';
$.widget('blend.loading', {
	/*配置项*/
    options: {
        loadingClass: '',
        loadingHtml: ''
    },
    /**
     * _create 创建组件时调用一次
     * @private
     */
    _create: function () {
        var options = this.options;
        this.$el = this.element;
        this.$body = $('body');
        this.loadingHtml = options.loadingHtml || '<div data-' + NAMESPACE + 'widget="loading" class="' + (options.loadingClass || '') + ' ' + NAMESPACE + 'loading"></div>';
    },
    /**
     * 组件初始化
     * @private
     */
    _init: function () {
        if (this.$el.length) {
            this.show();
        }
        else {
            this.defaultSegment = true;
        }
    },
    /**
     * 显示dialog
     * @private
     * @return {Object} 当前Zepto对象
     */
    show: function () {
        if (!this.$el.length) {
            (this.$el = $(this.loadingHtml)).appendTo(this.$body);
        }
        return this.$el.show();
    },
    /**
     * 关闭loading
     * @private
     * @return {Object} 当前Zepto对象
     */
    hide: function () {
        return this.$el.hide();
    },
    /**
     * 销毁toast
     * @private
     * @return {Object} 当前Zepto对象
     */
    destroy: function () {
        if (this.defaultSegment) {
            this.$el.remove();
            this.$el = [];
        }
        return this.$el;
    }
});})(Zepto)
;(function($){/* globals NAMESPACE */
/* eslint-disable fecs-camelcase */
/**
 * @file nav 组件
 * @author wanghongliang02
 */

$.widget('blend.nav', {
    /**
     * 组件的默认选项，可以由多重覆盖关系
     */
    options: {
        column: 3,
        animate: true,
        time: 500,
        expand: '更多',
        pack: '收起',
        itemClass: NAMESPACE + 'nav-item',
        row: false
    },
    /**
     * _create 创建组件时调用一次
     */
    _create: function () {
        var nav = this;
        var $el = nav.element;
        nav.$items = $el.find('.' + nav.options.itemClass);

        nav.expandClass = NAMESPACE + 'nav-expand';
        nav.animateClass = NAMESPACE + 'nav-animation';
        nav.expandedClass = NAMESPACE + 'nav-expanded';
        nav.columnClassPre = NAMESPACE + 'nav-column-';
        nav.hideClass = NAMESPACE + 'nav-item-hide';
        nav.noborderClass = NAMESPACE + 'nav-item-no-border';
        nav.columnRange = [3, 4, 5];
    },
    /**
     * _init 初始化的时候调用
     */
    _init: function () {
        var nav = this;
        if (nav.options.animate) {
            nav.element.addClass(nav.animateClass);
        }
        else {
            nav.element.removeClass(nav.animateClass);
        }
        nav._colunm();
        nav._row();
        if (!nav.inited) {
            nav._initEvent();
            nav.inited = true;
        }
    },
    /**
     *
     * @private
     */
    _initEvent: function () {
        var nav = this;
        nav.element.on('click.nav', '.' + nav.expandClass, function (e) {
            var $this = $(this);
            if ($this.hasClass(nav.expandedClass)) {
                var height = nav.$items.eq(0).height();
                nav.element.css('height', 15 + height * nav.options.row);
                $this.removeClass(nav.expandedClass);
                var max = nav.options.row * nav.options.column;
                nav.$items.each(function (i) {
                    var $navItem = $(this);
                    if (i >= max - 1) {
                        if (nav.options.animate) {
                            setTimeout(function () {
                                $navItem.addClass(nav.hideClass);
                            }, nav.options.time);
                        }
                        else {
                            $navItem.addClass(nav.hideClass);
                        }
                    }
                    if (i >= max - nav.options.column) {
                        if (nav.options.animate) {
                            setTimeout(function () {
                                $navItem.addClass(nav.noborderClass);
                            }, nav.options.time);
                        }
                        else {
                            $navItem.addClass(nav.noborderClass);
                        }
                    } else {
                        if (nav.options.animate) {
                            setTimeout(function () {
                                $navItem.removeClass(nav.noborderClass);
                            }, nav.options.time);
                        }
                        else {
                            $navItem.removeClass(nav.noborderClass);
                        }
                    }
                });
                if (nav.options.animate) {
                    setTimeout(function () {
                        $this.html(nav.options.expand);
                    }, nav.options.time);
                }
                else {
                    $this.html(nav.options.expand);
                }
            }
            else {
                var len = nav.$items.length;
                var row = Math.ceil(len / nav.options.column) + (len % nav.options.column ? 0 : 1);
                height = nav.$items.eq(0).height() * row + 15;
                nav.element.css('height', height);
                $this.addClass(nav.expandedClass);
                nav.$items.removeClass(nav.hideClass);
                $this.html(nav.options.pack);
                var offset = len % nav.options.column || nav.options.column;
                var max = len - offset;
                nav.$items.each(function (i) {
                    var $this = $(this);
                    if (i >= max) {
                        $this.addClass(nav.noborderClass);
                    } else {
                        $this.removeClass(nav.noborderClass);
                    }
                });
            }
            if (nav.options.expandHandle && $.isFunction(nav.options.expandHandle)) {
                nav.options.expandHandle(e);
            }

        });
    },
    /**
     * _column 自定义的成员函数，
     * 所有以下划线开头的函数不可在外部调用
     */
    _colunm: function () {
        var nav = this;
        var $el = nav.element;
        /**
         * 处理column范围
         */
        if (nav.options.column && $.inArray(nav.options.column, nav.columnRange) === -1) {
            nav.options.column = 3;
        }
        var columnClass = [];
        for (var i = 0; i < nav.columnRange.length; i++) {
            columnClass.push(nav.columnClassPre + nav.columnRange[i]);
        }
        $el.removeClass(columnClass.join(' ')).addClass(nav.columnClassPre + nav.options.column);
    },
    /**
     * _row 自定义的成员函数，
     * @private
     */
    _row: function () {
        var nav = this;
        var option = nav.options;
        if (option.row === false) {
            nav._removeExpand();
            return;
        }
        option.row = parseInt(option.row, 10);
        if (option.row < 1) {
            option.row = false;
            nav._removeExpand();
            return;
        }

        var length = nav.$items.length;
        var max = option.column * option.row;
        if (max >= length) {
            nav._removeExpand();
            return;
        }
        nav._addExpand(max);
    },
    /**
     * remove expand
     * @private
     */
    _removeExpand: function () {
        var nav = this;
        var $el = nav.element;
        var len = nav.$items.length;
        var row = Math.ceil(len / nav.options.column);
        var height = nav.$items.eq(0).height() * row + 15;
        $el.css('height', height);
        $el.find('.' + nav.expandClass).remove();
        nav.$items.removeClass(this.hideClass);
        var max = (option.column - 1) * option.row;
        nav.$items.each(function (i) {
            var $this = $(this);
            if (i >= max) {
                $this.addClass(nav.noborderClass);
            } else {
                $this.removeClass(nav.noborderClass);
            }
        });
    },
    /**
     * @param {number} max 最大行数
     * @private
     */
    _addExpand: function (max) {
        var nav = this;
        nav.$items.each(function (i) {
            var $this = $(this);
            if (i >= max - nav.options.column) {
                $this.addClass(nav.noborderClass);
            } else {
                $this.removeClass(nav.noborderClass);
            }
            if (i >= max - 1) {
                $this.addClass(nav.hideClass);
            }
            else {
                $this.removeClass(nav.hideClass);
            }
        });
        var height = nav.$items.eq(0).height();
        nav.element.css('height', 15 + height * nav.options.row);
        if (nav.element.find('.' + nav.expandClass).length === 1) {
            nav.element.find('.' + nav.expandClass).removeClass(nav.expandedClass).html(nav.options.expand);
        }
        else {
            nav.element.append('<span class="' +
                nav.options.itemClass + ' ' + nav.expandClass + '">' + nav.options.expand + '</span>');
        }
    },
    /**
     * 销毁对象
     * @private
     */
    _destroy: function () {
        var nav = this;
        nav.options.row = false;
        nav._removeExpand();
        nav.element.off('click.nav', '.' + nav.expandClass);
    },
    /**
     * 设置列数
     * 没有返回值或者返回值为 undefined 时会保持调用链，
     * 如果返回值不为 undefined 则将该值返回，不能再次链式调用
     * @param {number} num 列数
     * @return {undefined}
     */
    column: function (num) {
        if (arguments.length === 0) {
            return this.options.column;
        }
        if (num && $.inArray(num, this.columnRange) === -1) {
            return;
        }
        this.options.column = num;
        this._colunm();
        this._row();
    },
    /**
     * 设置行数
     * 没有返回值或者返回值为 undefined 时会保持调用链，
     * 如果返回值不为 undefined 则将该值返回，不能再次链式调用
     * @param {number} num 行数
     * @return {undefined}
     */
    row: function (num) {
        if (arguments.length === 0) {
            return this.options.row;
        }
        if (num === false) {
            this.options.row = false;
            this._removeExpand();
            return;
        }
        var row = parseInt(num, 10);
        if (!row || row <= 0) {
            return;
        }
        this.options.row = row;
        this._row();
    }
});
})(Zepto)
;(function($){

})(Zepto)
;(function($){/* globals NAMESPACE */
/* eslint-disable fecs-camelcase */
/**
 * 侧边导航组件
 *
 * @file sidenav.js
 * @author dingquan
 */
$.widget('blend.sidenav', {

    options: {
        limit: 44,
        // type: 1 // 类型，1为连续滚动
    },
	/**
	 * 创建组件
	 * @private
	 */
    _create: function () {
    },
	/**
	 * 初始化组件
	 * @private
	 */
    _init: function () {

        var opts = this.options;

        this.navId = 'wZijePQW';   // 自定义， 用于建立nav和content一一对应关系

        this.$el = this.element;
        this.limit = opts.limit;
        this.type = opts.type;

        this.navs = this.$el.find('.blend-sidenav-nav li');
        this.contents = this.$el.find('.blend-sidenav-content .blend-sidenav-item');

        this._initSidePosition();   // 初始化side位置
        this._initContent();    // 初始化右侧内容

        this._bindEvent();
    },
    /**
     * 初始化左侧side 位置, 只在页面加载时候执行一次
     * @private
     */
    _initSidePosition: function () {
        var doc = document;
        var originScrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
        if (originScrollTop > 0) {
            this.$el.find('.blend-sidenav-nav').css('top', 0);
        }
    },
    /**
     * 初始化右侧显示
     * @private
     */
    _initContent: function () {
        var activeIndex;
        var nav;
        for (var i = 0, len = this.navs.length; i < len; i++) {
            nav = this.navs.eq(i);
            if (nav.hasClass('blend-sidenav-active')) {
                activeIndex = i;
            }
            // 建立导航和内容的对应关系
            nav.data(this.navId, i);
            this.contents.eq(i).data(this.navId, i);
        }
        if (!activeIndex) {
            activeIndex = 0;
            this.navs.eq(0).addClass('blend-sidenav-active');
        }
        if (this.type === 1) {
            this.contents.show();
            return;
        }
        this.contents.hide();
        this.contents.eq(activeIndex).show();

    },
    /**
     * 绑定事件
     * @private
     */
    _bindEvent: function () {
        var doc = document;
        var me = this;
        var $side = this.$el.find('.blend-sidenav-nav');
        var flag = false;
        /*window.onscroll = function (e) {
            // $side.append("aaaa<br>");
            var scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
            if (scrollTop >= me.limit) {
                // $side.css('top', 0);
                if(flag){return;}
                $side.css('position', 'fixed');
                flag = true;
            }
            else {
                // $side.css('top', null);
                $side.css('position', 'absolute');
                flag = false;
            }
        };*/

       /* var timer = setInterval(function(){
            console.log(new Date().getTime() + "----");
            var scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
            if (scrollTop >= me.limit) {
                // $side.css('top', 0);
                $side.css('position', 'fixed');
            }
            else {
                // $side.css('top', null);
                $side.css('position', 'absolute');

            }
        },100);*/
        
        /*var hammer = new Hammer(this.$el[0]);
        hammer.on('panmove',function (e) {
            
            var scrollTop = doc.documentElement.scrollTop || doc.body.scrollTop;
            console.log(scrollTop);
            if (scrollTop >= me.limit) {
                // $side.css('top', 0);
                $side.css('position', 'fixed');
            }
            else {
                // $side.css('top', null);
                $side.css('position', 'absolute');

            }
        });*/



        var $nav = this.$el.find('.blend-sidenav-nav ul');
        $nav.on('tap, click', function (e) {
            e.preventDefault();
            $nav.find('li').removeClass('blend-sidenav-active');
            var target = e.target || e.srcElement;
            var nodeName = target.nodeName.toLowerCase();
            var blendId;
            if (nodeName === 'li') {
                blendId = $(target).data(me.navId);
                $(target).addClass('blend-sidenav-active');
                me.contents.hide();
                me.contents.eq(blendId).show();
            }
        });
    }
});

})(Zepto)
;(function($){/**
 * Slider 组件
 * Created by dingquan on 15-02-03
 * @file slider.js
 * @author dingquan
 */
'use strict';
$.widget('blend.slider', {
    /**
     * 组件的默认选项，可以由多重覆盖关系
     */
    options: {
        autoSwipe: true,            // 自动滚动,默认开启
        continuousScroll: true,     // 连续滚动
        axisX: true,                // 滚动方向,默认x轴滚动
        transitionType: 'ease',     // 过渡类型
        // duration: 0.6,
        speed: 2000,                // 切换的时间间隔
        theme: "d2",
        // needDirection: false,    // 是否需要左右切换的按钮
        ratio: "normal"     // normal/wide/square/small
    },
    /**
     * 创建组件调用一次
     * @private
     */
    _create: function () {

        /**
         * this.element 组件对应的单个 Zepto/jQuery 对象
         */
        var $el = this.element;
        /**
         * 经过继承的 options
         */
        var options = this.options;

        var ratioClass = NAMESPACE + 'slider-';
        switch (options.ratio) {
            case 'wide':
                ratioClass += 'wide';
                break;
            case 'square':
                ratioClass += 'square';
                break;
            case 'small':
                ratioClass += 'small';
                break;
            default :
                ratioClass += 'normal';
        }
        $el.addClass(ratioClass);

        this.$container = $el;
        this.$ul = $el.find('.' + NAMESPACE + 'slides');
        this.$li = $el.find('.' + NAMESPACE + 'slides li');

        this.liWidth = this.$li.width();
        this.liHeight = this.$li.height();
        this.liLength = this.$li.length;

        this.autoScroll = null;     // 自动播放interval对象
        this._index = 0;            // 当前幻灯片位置

        if (typeof options.theme !== 'string') {
            options.theme = 'default';
        }

        this._addComponents(options.theme);
    },
    /**
     * _init 初始化的时候调用
     * @private
     */
    _init: function () {

        var opts = this.options;
        var that = this;
        var $ul = this.$ul;
        var $li = this.$li;

        /**
         * 连续滚动，需要复制dom
         */
        if (opts.continuousScroll) {
            $ul.prepend($li.last().clone()).append($li.first().clone());
            if (opts.axisX) {
                that._fnTranslate($ul.children().first(), that.liWidth * -1);
                that._fnTranslate($ul.children().last(), that.liWidth * that.liLength);
            }
            else {
                that._fnTranslate($ul.children().first(), that.liHeight * -1);
                that._fnTranslate($ul.children().last(), that.liHeight * that.liLength);
            }
        }

        /**
         * 给初始图片定位
         */
        if (opts.axisX) {
            $li.each(function (i) {
                that._fnTranslate($(this), that.liWidth * i);
            });
        }
        else {
            $li.each(function (i) {
                that._fnTranslate($(this), that.liHeight * i);
            });
        }

        that._fnAutoSwipe();
        this._initEvent();
        // this._initView();
    },
    /**
     * 初始化事件绑定
     * @private
     */
    _initEvent: function () {
        var that = this;
        // 绑定触摸
        var hammer = new Hammer(this.$container[0]);

        hammer.on('panstart', function (e) {

            that.startX = e.center.x;
            that.startY = e.center.y;
        });

        hammer.on('panmove', function (e) {

            if (that.options.autoSwipe) {
                clearInterval(that.autoScroll);
            }

            that.curX = e.center.x;
            that.curY = e.center.y;

            that.moveX = that.curX - that.startX;
            that.moveY = that.curY - that.startY;

            that._fnTransition(that.$ul, 0);

            if (that.options.axisX) {
                // console.log(-(that.liWidth * (parseInt(that._index)) - that.moveX));
                that._fnTranslate(that.$ul, -(that.liWidth * (parseInt(that._index, 10)) - that.moveX));
            }

        });

        hammer.on('panend', function (e) {

            var opts = that.options;
            var _touchDistance = 50;

            if (opts.axisX) {
                that.moveDistance = that.moveX;
            }
            else {
                that.moveDistance = that.moveY;
            }

            // 距离小
            if (Math.abs(that.moveDistance) <= _touchDistance) {
                that._fnScroll(.3);
            }
            else {
                // 距离大
                // 手指触摸上一屏滚动
                if (that.moveDistance > _touchDistance) {
                    that._fnMovePrev();
                    that._fnAutoSwipe();
                // 手指触摸下一屏滚动
                }
                else if (that.moveDistance < -_touchDistance) {
                    that._fnMoveNext();
                    that._fnAutoSwipe();
                }
            }

            that.moveX = 0;
            that.moveY = 0;
        });
    },
    /**
     * 根据不同的theme添加组件和初始化样式
     * @private
     * @param {string} theme 幻灯片主题,目前支持有限的几个
     */
    _addComponents: function (theme) {

        var $el = this.$container;

        if (theme === 'a1') {
            $el.addClass(NAMESPACE + 'slider-a1');
            this._initControl();
        }
        if (theme === 'a2') {
            $el.addClass(NAMESPACE + 'slider-a2');
            this._initControl();
        }
        if (theme === 'd1') {
            $el.addClass(NAMESPACE + 'slider-title');
        }
        if (theme === 'd2') {
            $el.addClass(NAMESPACE + 'slider-title');
            this._initControl();
        }
    },
    /**
     * 初始化control控件
     * @private
     */
    _initControl: function () {

        var $el = this.$container;
        var liLength = this.liLength;

        var html = '';
        for (var i = 0; i < liLength; i++) {
            html += (i === 0) ? '<li><a class="' + NAMESPACE + 'slider-active"></a></li>' : '<li><a></a></li>';
        }

        var $ol = $('<ol class="' + NAMESPACE + 'slider-control-nav">' + html + '</ol>');

        $el.append($ol);

        this.$controlOl = $ol;
    },
    /**
     * 初始化title
     * @private
     */
    _initTitle: function () {
        // to do
        // var $el = this.$container;
    },
    /*
     * css 过渡
     * @private
     * @param {Object} dom  zepto object
     * @param {number} num - transition number
     */
    _fnTransition: function (dom, num) {

        var opts = this.options;
        dom.css({
            '-webkit-transition': 'all ' + num + 's ' + opts.transitionType,
            'transition': 'all ' + num + 's ' + opts.transitionType
        });
    },
    /**
     * css 滚动
     * @private
     * @param  {Object} dom    zepto object
     * @param  {number} result translate number
     */
    _fnTranslate: function (dom, result) {

        var opts = this.options;

        if (opts.axisX) {
            dom.css({
                '-webkit-transform': 'translate3d(' + result + 'px,0,0)',
                'transform': 'translate3d(' + result + 'px,0,0)'
            });
        }
        else {
            dom.css({
                '-webkit-transform': 'translate3d(0,' + result + 'px,0)',
                'transform': 'translate3d(0,' + result + 'px,0)'
            });
        }
    },
    /**
     * 下一屏滚动
     * @private
     */
    _fnMoveNext: function () {
        this._index ++;
        this._fnMove();
        /*if(opts.lazyLoad){
            if(opts.continuousScroll){
                fnLazyLoad(_index+2);
            }else{
                fnLazyLoad(_index+1);
            }
        }*/
    },
    /**
     * 上一屏滚动
     * @private
     */
    _fnMovePrev: function () {
        this._index --;
        this._fnMove();
        // 第一次往右滚动懒加载图片
        /*if(firstMovePrev && opts.lazyLoad){
            var i = _liLength-1;
            for(i; i <= (_liLength+1); i++){
                fnLazyLoad(i);
            }
            firstMovePrev = false;
            return;
        }
        if(!firstMovePrev && opts.lazyLoad){
            fnLazyLoad(_index);
        }*/
    },
    /**
     * 自动滑动
     * @private
     */
    _fnAutoSwipe: function () {
        var that = this;
        var opts = this.options;

        if (opts.autoSwipe) {
            this.autoScroll = setInterval(function () {
                that._fnMoveNext();
            }, opts.speed);
        }
    },
    /**
     * [_fnMove description]
     * @private
     */
    _fnMove: function () {
        var that = this;
        var opts = this.options;
        // var _vars = this._vars;
        // var _liLength = this.liLength;

        if (opts.continuousScroll) {
            if (that._index >= that.liLength) {
                that._fnScroll(.3);
                that._index = 0;
                setTimeout(function () {
                    that._fnScroll(0);
                }, 300);
            }
            else if (that._index < 0) {
                that._fnScroll(.3);
                that._index = that.liLength - 1;
                setTimeout(function () {
                    that._fnScroll(0);
                }, 300);
            }
            else {
                that._fnScroll(.3);
            }
        }
        else {
            if (that._index >= that.liLength) {
                that._index = 0;
            }
            else if (that._index < 0) {
                that._index = that.liLength - 1;
            }
            that._fnScroll(.3);
        }

        that._setDotActive();

        // callback(_index);
    },
    /**
     * 滑动
     * @private
     * @param  {number} num num
     */
    _fnScroll: function (num) {
        var $ul = this.$ul;
        var _index = this._index;
        var _liWidth = this.liWidth;
        var _liHeight = this.liHeight;
        var opts = this.options;

        this._fnTransition($ul, num);
        if (opts.axisX) {
            this._fnTranslate($ul, -_index * _liWidth);
        }
        else {
            this._fnTranslate($ul, -_index * _liHeight);
        }
    },
    /**
     * 设置圆点的状态
     * @private
     */
    _setDotActive: function () {
        this.$controlOl.find('li a').removeClass(NAMESPACE + 'slider-active');
        this.$controlOl.find('li').eq(this._index).find('a').addClass(NAMESPACE + 'slider-active');
    },
    /**
     * 下一张幻灯片
     * @return {Object} 当前Zepto对象
     */
    next: function () {
        this._fnMoveNext();
        return this.$container;
    },
    /**
     * 上一张幻灯片
     * @return {Object} 当前Zepto对象
     */
    prev: function () {
        this._fnMovePrev();
        return this.$container;
    },
    /**
     * 暂停
     * @return {Object} 当前Zepto对象
     */
    paused: function () {
        clearInterval(this.autoScroll);
        return this.$container;
    },
    start: function(){
        clearInterval(this.autoScroll);
        
        this._fnAutoSwipe();
        return this.$container;
       
    }

});})(Zepto)
;(function($){/* globals NAMESPACE */
/* eslint-disable fecs-camelcase */
/**
 * @file sug 组件
 * @author wanghongliang02
 */

$.widget('blend.sug', {
    /**
     * 组件的默认选项，可以由多重覆盖关系
     */
    options: {
        itemClass: NAMESPACE + 'sug-tip-content-item',
        inputClass: NAMESPACE + 'sug-search-input',
        buttonClass: NAMESPACE + 'sug-search-button',
        history: true, // 搜索历史记录开关
        historyAjax: false, // 是否异步读历史数据，url/false，默认json，jsonp请在url后添加callback=?
        historyData: undefined, // 历史记录数据 [1, 2]
        // 读取联想词列表数据的key
        list: 'list',
        createEle: undefined,
        callback: function (key) {
        }, // 事件
        // todo 预留
        suggest: false
    },
    /**
     * _create 创建组件时调用一次
     */
    _create: function () {
        var sug = this;
        var $el = sug.element;
        sug.$input = $el.find('.' + sug.options.inputClass);
        sug.$button = $el.find('.' + sug.options.buttonClass);
        sug.$tip = $el.find('.' + NAMESPACE + 'sug-tip');
        sug.$tipContent = $el.find('.' + NAMESPACE + 'sug-tip-content');
        sug._initEvent();
    },
    /**
     * _init 初始化的时候调用
     */
    _init: function () {
    },
    /**
     *
     * @private
     */
    _initEvent: function () {
        var sug = this;
        sug.element.on('click.sug', '.' + sug.options.itemClass, function () {
            var $item = $(this);
            var key = $item.data('key');
            if (sug.options.callback && $.isFunction(sug.options.callback)) {
                if (sug.options.callback(key) === false) {
                    return;
                }
            }
            sug.$input.val(key);
            sug.$button.trigger('click tap');
            sug._hide();
        });
        sug.element.on('focus.sug', '.' + sug.options.inputClass, function () {
            if (!sug.options.history) {
                return;
            }
            // todo 定位
            if (sug.options.historyAjax) {
                $.getJSON(sug.options.historyAjax, function (res) {
                    sug._createEle(res);
                });
            }
            else {
                if (sug.$tip.find('.' + sug.options.itemClass).length > 0) {
                    sug._show();
                    return;
                }
                var local = {
                    errno: 0,
                    data: []
                };
                local.data[sug.options.list] = sug.options.historyData || [];
                sug._createEle(local);
            }

        });
    },
    /**
     * 销毁对象
     * @private
     */
    _destroy: function () {
        var sug = this;
        sug.element.off('click.sug', '.' + sug.options.itemClass);
        sug.element.off('focus.sug', '.' + sug.options.inputClass);
        sug.element.find('.' + sug.options.itemClass).remove();
        sug._hide();
    },
    /**
     * 隐藏提示框
     * @private
     */
    _hide: function () {
        var sug = this;
        sug.$tip.hide();
    },
    /**
     * 显示提示框
     * @private
     */
    _show: function () {
        var sug = this;
        sug.$tip.show();
    },
    /**
     * 创建提示项
     * @param {Object} res 返回数据
     * @private
     */
    _createEle: function (res) {
        var sug = this;
        if (sug.options.createEle && $.isFunction(sug.options.createEle)) {
            sug.options.createEle(res, sug.$tipContent);
        }
        else {
            if (res.errno !== 0) {
                return;
            }
            var list = res.data[sug.options.list];
            if (!list || !list.length) {
                return;
            }
            var len = list.length;
            sug.$tipContent.empty();
            for (var i = 0; i < len; i++) {
                sug.$tipContent.append('<li data-key="' + list[i] +
                    '" class="' + sug.options.itemClass + '">' + list[i] + '</li>');
            }
        }
        if (sug.element.find('.' + sug.options.itemClass).length > 0) {
            sug._show();
        }
    },
    /**
     * todo 预留
     * 搜索关键词提示
     * @private
     */
    _suggest: function () {
    },
    /**
     * 清除历史记录
     */
    clear: function () {
        var sug = this;
        if (!sug.options.history) {
            return;
        }
        sug.$tipContent.empty();
        sug._hide();
        if (!sug.options.historyAjax) {
            sug.options.historyData = undefined;
        }
        if (sug.options.clear && $.isFunction(sug.options.clear)) {
            sug.options.clear();
        }
    },
    /**
     * 更新历史数据
     * @param {Array} historyData 历史记录数据
     */
    refreshHistoryData: function (historyData) {
        var sug = this;
        if (!$.isArray(historyData)) {
            return;
        }
        sug.$tipContent.empty();
        sug.options.historyData = historyData;
    }
});
})(Zepto)
;(function($){/* globals NAMESPACE */
/* eslint-disable fecs-camelcase */
/**
 * @file tab 组件
 * @author wanghongliang02
 */

$.widget('blend.tab', {
    /**
     * 组件的默认选项，可以由多重覆盖关系
     */
    options: {
        start: 0,
        animate: true,
        activeClass: NAMESPACE + 'tab-header-item-active',
        animateClass: NAMESPACE + 'tab-animation'
    },
    /**
     * _create 创建组件时调用一次
     */
    _create: function () {
        var tab = this;
        var $el = this.element;
        tab._itemSelector = '.' + NAMESPACE + 'tab-header-item';
        tab._itemContentSelector = '.' + NAMESPACE + 'tab-content-item';
        tab._itemActiveSelector = '.' + NAMESPACE + 'tab-header-active';
        tab.$headerItem = $el.find(tab._itemSelector);
        tab.$contentItem = $el.find(tab._itemContentSelector);
        tab.$activeEle = $el.find(tab._itemActiveSelector);
        // 计算active宽度和位置
        tab.itemWidth = this.$headerItem.eq(0).width();
        tab.$activeEle.css('width', this.itemWidth);
        tab.itemOffsetX = 0;
        tab.current = 0;

    },
    /**
     * _init 初始化的时候调用
     */
    _init: function () {
        var tab = this;

        tab._checkStart();
        if (!tab.inited) {
            tab._initEvent();
            tab.inited = true;
        }
        tab._switch(tab.options.start);

        if (tab.options.animate) {
            // 初始化的时候不出动画
            setTimeout(function () {
                tab.element.addClass(tab.options.animateClass);
            }, 0);
        }
        else {
            tab.element.removeClass(tab.options.animateClass);
        }


    },
    /**
     * 验证初始化的start参数
     * @private
     */
    _checkStart: function () {
        var tab = this;
        var lenth = tab.$headerItem.length;
        tab.options.start = parseInt(tab.options.start, 10);
        if (tab.options.start < 0 || tab.options.start >= lenth) {
            tab.options.start = 0;
        }
        tab.current = tab.options.start;
    },

    /**
     *
     * @private
     */
    _initEvent: function () {
        var tab = this;
        tab.$headerItem.on('click.tab', function (e) {
            var index = $(this).index();
            tab._switch(index);
        });
    },
    /**
     * tab切换
     * @param {number} index 要切换到tab序号。
     * @private
     */
    _switch: function (index) {
        var tab = this;
        if (arguments.length === 0) {
            tab.current = tab.options.start;
        }
        else {
            tab.current = index;
        }

        var left = tab.itemOffsetX + tab.current * tab.itemWidth;
        tab.$activeEle.css('left', left);
        tab.$contentItem.hide();
        tab.$contentItem.eq(tab.current).show();
        tab.$headerItem.removeClass(tab.options.activeClass);
        tab.$headerItem.eq(tab.current).addClass(tab.options.activeClass);
    },
    /**
     * 销毁tab对象
     * @private
     */
    _destroy: function () {
        var tab = this;
        tab.$headerItem.off('click.tab');
    },

    /**
     * 切换到某个tab,获取当前的tab
     * @param {number=} index 切换的tab序号
     * @return {current|*|number} 当前tab序号或者不返回
     */
    active: function (index) {
        var tab = this;
        if (arguments.length === 0) {
            return tab.current;
        }
        this._switch(index);
    }

});
})(Zepto)
;(function($){/**
 * @file toast.js
 * @name toast
 * @author wangzhonghua
 * @date 2015.02.05
 */
'use strict';
$.widget('blend.toast', {
    /*配置项*/
    options: {
        toastClass: '',
        toastTpl: '',
        delay: 2500
    },
    /**
     * _create 创建组件时调用一次
     * @private
     */
    _create: function () {
        var options = this.options;
        this.$el = this.element;
        this.$body = $('body');
        this.toastTpl = options.toastTpl || '<div data-' + NAMESPACE + 'widget="toast" class="' + (options.toastClass || '') + ' ' + NAMESPACE + 'toast">{%content%}</div>';
    },
    /**
     * 初始化组件调用
     * @private
     */
    _init: function () {
        !this.$el.length && (this.defaultSegment = true);
    },
    /**
     * 设置延时消失
     * @param {number} delay 设置延时的时间
     * @private
     */
    _setDelay: function (delay) {
        var self = this;
        delay = parseInt(delay, 10) || this.options.delay;
        clearTimeout(this.timeout);
        this.timeOut = window.setTimeout(function () {
            self.hide();
        }, delay);
    },
    /**
     * 显示toast
     * @param  {string} content 需要展示的内容
     * @param  {number} delay 延时的时间
     * @return {Object} 当前Zepto对象
     */
    show: function (content, delay) {
        if (!content) {
            return false;
        }
        if (!this.$el.length) {
            (this.$el = $(this.toastTpl.replace(/{%content%}/g, content))).appendTo(this.$body);
        }
        else {
            this.$el.html(content);
        }
        this._setDelay(delay);
        return this.$el.show();
    },
    /**
     * 关闭toast
     * @return {Object} 当前Zepto对象
     */
    hide: function () {
        return this.$el.hide();
    },
    /**
     * 销毁toast
     * @return {[type]}
     */
    destroy: function () {
        if (this.defaultSegment) {
            this.$el.remove();
            this.$el = [];
        }
        return this.$el;
    }
});
})(Zepto)
;(function($){/* globals NAMESPACE */
/* eslint-disable fecs-camelcase */
/**
 * 顶部二级导航
 * @file topnav.js
 * @author dingquan@baidu.com
 */

$.widget('blend.topnav', {
    /**
     * 配置信息
     */
    options: {
        defaultIcon: true
    },
    /**
     * 创建组件
     * @private
     */
    _create: function () {

    },
    /**
     * 初始化组件
     * @private
     */
    _init: function () {
        var opt = this.options;
        this.$el = this.element;

        this.defaultIcon = opt.defaultIcon;

        this._initUI();
        this._bindEvent();
    },
    /**
     * 初始化UI, 增加相应的class
     * @private
     */
    _initUI: function () {
        var contentHTML = this.$el.html();

        // 外层增加wrapper
        var $wrapper = $('<div class="' + NAMESPACE + 'topnav-wrapper"></div>');
        $wrapper.html(contentHTML);

        this.$el.empty().append($wrapper);

        var $items = this.$items = this.$el.find('.' + NAMESPACE + 'topnav-item');

        if (this.defaultIcon) {
            for (var i = 0, len = $items.length; i < len; i++) {
                var item = $items[i];

                if (item.getElementsByTagName('ul').length > 0) {
                    $(item).find('span').addClass(NAMESPACE + 'topnav-arrow')
                    .addClass(NAMESPACE + 'topnav-downarrow');
                }
            }
        }
        /**
         * show 整个nav
         */
        this.$el.show();

    },
    /**
     * 导航相关事件绑定
     * @private
     */
    _bindEvent: function () {

        var $items = this.$items;

        for (var i = 0, len = $items.length; i < len; i++) {
            var $item = $items.eq(i);

            $item.on('tap, click', function (e) {
                var $this = $(this);
                var $ul = $(this).find('ul');
                var $span = $(this).find('span');
                var isActive = $(this).hasClass(NAMESPACE + 'topnav-active') ? true : false;

                $items.not(i).removeClass(NAMESPACE + 'topnav-active');
                $items.not(i).find('ul').hide();
                $items.not(i).find('span').removeClass(NAMESPACE + 'topnav-uparrow')
                .addClass(NAMESPACE + 'topnav-downarrow');

                if (isActive) {
                    $this.removeClass(NAMESPACE + 'topnav-active');
                    $ul.hide();
                    $span.removeClass(NAMESPACE + 'topnav-uparrow').addClass(NAMESPACE + 'topnav-downarrow');
                }
                else {
                    $this.addClass(NAMESPACE + 'topnav-active');
                    $ul.show();
                    $span.removeClass(NAMESPACE + 'topnav-downarrow').addClass(NAMESPACE + 'topnav-uparrow');
                }

            });
        }
    }

});
})(Zepto)
    /**
 * 对于带有特定属性的dom节点,自动初始化
 * @file init.js
 * @author zhangyuanwei
 */
;(function ($) {
    // TODO 判断UA环境,给body增加class
    $(function () {
        $('[data-blend-widget]').each(function (i, elem) {
            var $elem = $(elem);
            var widgetAttr = $elem.data('blend-widget');
            var widgetNames = widgetAttr.split(',');
            var widgetNameLen = widgetNames.length;
            var index;
            var name;
            for (index = 0; index < widgetNameLen; index++) {
                name = widgetNames[index];
                if ($.widget.has(name)) {
                    $elem[name]();
                }
                else {
                    // TODO error report
                    throw new Error('Unknow blend widget \"' + name + '\"');
                    // console.error('Unknow blend widget \"' + name + '\"');
                }
            }
        });
    });
})(Zepto);


})(window);
