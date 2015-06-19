(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var es5shim = require('./lib/shims.js'),

    Rosetta = require('./lib/rosetta.js'),

    readyRE = /complete/,
    ready = function(callback) {
        if (readyRE.test(document.readyState) && document.body) {
            callback();
        } else {
            if (!document.addEventListener) {
                window.attachEvent('onload', callback);
            } else {
                document.addEventListener('DOMContentLoaded', function() {
                    callback();
                }, false);
            }
        }
    };

window.Rosetta = Rosetta;

ready(Rosetta.init);

},{"./lib/rosetta.js":5,"./lib/shims.js":6}],2:[function(require,module,exports){
var utils = require('./utils.js'),
    bind = utils.bind,
    fire = utils.fire,
    isDomNode = utils.isDomNode,

    lifeEvents = require('./lifeEvents.js'),
    ATTACHED = lifeEvents.ATTACHED,
    DETACHED = lifeEvents.DETACHED,
    CREATED = lifeEvents.CREATED
    ATTRIBUTECHANGE = lifeEvents.ATTRIBUTECHANGE;


function createElemClass(type, renderFunc) {
    function update(options) {
        // extend(this.attrs, options, true);
        var children = this.children,
            root = this.root,
            type = this.type;

        extend(this.attrs, options, true);
        this.root = Rosetta.render(this, root, true);
        this.trigger(ATTRIBUTECHANGE, this);
    }

    function destroy() {
        this.off();
        this.root.parentElement.removeChild(this.root);
        this.trigger(DETACHED, this);
        delete ref(this.name);
    }

    function on(type, listener, context, ifOnce) {
        bind.call(this, type, listener, context, ifOnce);
    }

    function trigger(type) {
        fire.call(this, type);
    }

    function off(type) {
        if (!type) {
            this.events = [];
        }

        delete this.events[type];
    }

    function once(type, listener, context) {
        this.on(type, listener, context, true);
    }


    function create(type, attr) {
        var obj = Rosetta.create.apply(Rosetta, arguments);
        if (!!attr && !!attr.ref) {
            if (obj.isRosettaElem == true) {
                this.refs[attr.ref] = obj.root;
            } else if (isDomNode(obj)) {
                this.refs[attr.ref] = obj;
            }
        }

        return obj;
    }
    return (function(type, renderFunc) {
        function CustomElement(options) {
            extend(this, {
                type: type,

                name: name,

                renderFunc: renderFunc,

                refs: {},

                events: {},

                isAttached: false,

                attrs: {}
            }, options || {}, true);
        }

        CustomElement.prototype = {
            update: update,

            destroy: destroy,

            isRosettaElem: true,

            on: on,

            trigger: trigger,

            off: off,

            once: once,

            create: create

        };

        return CustomElement;

    })(type, renderFunc);
}

module.exports = createElemClass;
},{"./lifeEvents.js":3,"./utils.js":8}],3:[function(require,module,exports){
module.exports.ATTACHED = 'attached';
module.exports.DETACHED = 'detached';
module.exports.CREATED = 'created';
module.exports.ATTRIBUTECHANGE = 'attributeChange';
},{}],4:[function(require,module,exports){
var plainDom = {
    content: 'content',
    a: 'a',
    abbr: 'abbr',
    address: 'address',
    area: 'area',
    article: 'article',
    aside: 'aside',
    audio: 'audio',
    b: 'b',
    base: 'base',
    bdi: 'bdi',
    bdo: 'bdo',
    big: 'big',
    blockquote: 'blockquote',
    body: 'body',
    br: 'br',
    button: 'button',
    canvas: 'canvas',
    caption: 'caption',
    cite: 'cite',
    code: 'code',
    col: 'col',
    colgroup: 'colgroup',
    data: 'data',
    datalist: 'datalist',
    dd: 'dd',
    del: 'del',
    details: 'details',
    dfn: 'dfn',
    dialog: 'dialog',
    div: 'div',
    dl: 'dl',
    dt: 'dt',
    em: 'em',
    embed: 'embed',
    fieldset: 'fieldset',
    figcaption: 'figcaption',
    figure: 'figure',
    footer: 'footer',
    form: 'form',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    head: 'head',
    header: 'header',
    hgroup: 'hgroup',
    hr: 'hr',
    html: 'html',
    i: 'i',
    iframe: 'iframe',
    img: 'img',
    input: 'input',
    ins: 'ins',
    kbd: 'kbd',
    keygen: 'keygen',
    label: 'label',
    legend: 'legend',
    li: 'li',
    link: 'link',
    main: 'main',
    map: 'map',
    mark: 'mark',
    menu: 'menu',
    menuitem: 'menuitem',
    meta: 'meta',
    meter: 'meter',
    nav: 'nav',
    noscript: 'noscript',
    object: 'object',
    ol: 'ol',
    optgroup: 'optgroup',
    option: 'option',
    output: 'output',
    p: 'p',
    param: 'param',
    picture: 'picture',
    pre: 'pre',
    progress: 'progress',
    q: 'q',
    rp: 'rp',
    rt: 'rt',
    ruby: 'ruby',
    s: 's',
    samp: 'samp',
    script: 'script',
    section: 'section',
    select: 'select',
    small: 'small',
    source: 'source',
    span: 'span',
    strong: 'strong',
    style: 'style',
    sub: 'sub',
    summary: 'summary',
    sup: 'sup',
    table: 'table',
    tbody: 'tbody',
    td: 'td',
    textarea: 'textarea',
    tfoot: 'tfoot',
    th: 'th',
    thead: 'thead',
    time: 'time',
    title: 'title',
    tr: 'tr',
    track: 'track',
    u: 'u',
    ul: 'ul',
    'var': 'var',
    video: 'video',
    wbr: 'wbr',

    // SVG
    circle: 'circle',
    clipPath: 'clipPath',
    defs: 'defs',
    ellipse: 'ellipse',
    g: 'g',
    line: 'line',
    linearGradient: 'linearGradient',
    mask: 'mask',
    path: 'path',
    pattern: 'pattern',
    polygon: 'polygon',
    polyline: 'polyline',
    radialGradient: 'radialGradient',
    rect: 'rect',
    stop: 'stop',
    svg: 'svg',
    text: 'text',
    tspan: 'tspan'
};

module.exports = plainDom;
},{}],5:[function(require,module,exports){
/*@require ./rosetta.css*/
/**Rosetta v1.0,0**/
var supportEvent = require('./supportEvent.js'),
    utils = require('./utils.js'),
    query = utils.query,
    toType = utils.toType,
    objToString = utils.objToString,
    extend = utils.extend,
    toPlainArray = utils.toPlainArray,
    isOriginalTag = utils.isOriginalTag,
    isDomNode = utils.isDomNode,
    isString = utils.isString,
    isFunction = utils.isFunction,
    bind = utils.bind,
    fire = utils.fire,

    _refers = {},
    _elemClass = {},
    allRendered = false,

    lifeEvents = require('./lifeEvents.js'),
    ATTACHED = lifeEvents.ATTACHED,
    DETACHED = lifeEvents.DETACHED,
    CREATED = lifeEvents.CREATED
    ATTRIBUTECHANGE = lifeEvents.ATTRIBUTECHANGE;

var createElemClass = require('./createElementClass.js');

function attributeToAttrs(name, value) {
  // try to match this attribute to a property (attributes are
  // all lower-case, so this is case-insensitive search)
    if (name) {
        // filter out 'mustached' values, these are to be
        // get original value
        var currentValue = this.attrs[name];
        if (typeof currentValue != typeof value) {
            // deserialize Boolean or Number values from attribute
            value = deserializeValue(value, currentValue);
        }

        // only act if the value has changed
        if (value !== currentValue) {
            // install new value (has side-effects)
            this.attrs[name] = value;
        }
  }

}

function updateDom(obj) {
    if (obj.isRosettaElem == true) {
        // content的判断

        obj.root = obj.__t(obj, obj.attrs, obj.ref);

        replaceContent(obj);
    }

    for (var i in obj.attrs) {
        var item = obj.attrs[i];
        if (!supportEvent[i]) {
            if (!!item) {
                if (isString(item)) {
                    obj.root.setAttribute(i, item || '');
                }
            }
        } else {
            delegate(document.body, obj.root, i, item);
        }
    }

    return obj;
}

function appendRoot(obj, root, force) {
    if ((isDomNode(root) && root.getAttribute('type') == 'r-element') || force == true) {
        root.parentElement.replaceChild(obj.root, root);
    } else {
        if (root.isRosettaElem == true) {
            root.children = root.children || [];
            root.children.push(obj);
        } else {
            if (obj.root) {
                root.appendChild(obj.root);
            } else {
                root.innerHTML += obj;
            }

        }
    }
    return obj;
}

function delegate(parent, child, type, cb) {
    var callback = function(event) {
        obj = event.srcElement ? event.srcElement : event.target;
        while(!!obj && obj != parent.parentElement) {
            if (obj == child) {
                cb(event);
                break;
            }
            obj = obj.parentElement;
        }
    };

    if (parent.addEventListener) {
        parent.addEventListener(supportEvent[type], callback, false);
    } else {
        parent.attachEvent('on' + supportEvent[type], callback);
    }
}

function replaceContent(obj) {
    obj.holder = {};
    var contents = query('content', obj.root);

    for (var i = 0; i < contents.length; i++) {
        var item = contents[i];
        obj.holder[item.getAttribute('selector')] = item;
    }

    // deal with content
    var tmp = document.createDocumentFragment();
    if (obj.children && obj.children.length > 0) {
        for (var i = 0; i < obj.children.length; i++) {
            var item = obj.children[i];

            tmp.appendChild(item);
        }

        for (var i in obj.holder) {
            var dom = obj.holder[i];
            var newDom = query(i, tmp);
            if (newDom.length > 0) {
                var container = document.createElement('div');
                container.setAttribute('class', 'content');
                container.setAttribute('selector', i);
                dom.parentElement.replaceChild(container, dom);
                for (var j = 0; j < newDom.length; j++) {
                    container.appendChild(newDom[j]);
                }
            } else {
                dom.parentElement.removeChild(dom);
            }
        }
    } else {
        for (var i in obj.holder) {
            var dom = obj.holder[i];
            dom.parentElement.removeChild(dom);
        }
    }
}


function init() {
    var elems = [];
    allRendered = false;
    if (!!document.getElementsByClassName) {
        elems = document.getElementsByClassName('r-element');
    } else if (!!document.querySelectorAll) {
        elems = document.querySelectorAll('.r-element');
    } else {
        var doms = document.getElementsByTagName('*')
        for (var i = 0; i < doms.length; i++) {
            var item = doms[i];
            if (item.tagName.toLowerCase().indexOf('r-') >= 0) {
                elems.push(item);
            }
        }
    }

    for (var i = 0; i < elems.length; i++) {
        var item = elems[i],
            type = item.tagName.toLowerCase(),
            attrs = item.attributes,
            options = {};

        if (type.indexOf('r-') == 0) {
            var children = item.children,
                childrenArr = [].slice.call(children);

            for (var n = 0; n < attrs.length; n++) {
                var attr = attrs[n];
                options[attr.name] = attr.nodeValue;
            }

            Rosetta.render(Rosetta.create(type, options, childrenArr), item, true);
        }
    }
    allRendered = true;
    fire.call(Rosetta, 'ready');
}

function ref(key, value) {
    if (value) {
        _refers[key] = value;
    } else {
        return _refers[key];
    }
}

function getElemClass(type) {
    return _elemClass[type];
}

function addElemClass(type, elemClass) {
    _elemClass[type] = elemClass
}


function render(obj, root, force) {
    if (isString(root)) {
        root = query(root)[0];
    }

    if (!obj) {
        return;
    }

    obj = updateDom(obj);
    obj = appendRoot(obj, root, force);

    if (obj.isRosettaElem == true) {
        var type = obj.type;


        newClass = (obj.root.getAttribute('class') || '')? (obj.root.getAttribute('class') || '') + ' ' + type : type;

        obj.root.setAttribute('class', newClass.replace(/r-invisible/g, ''));

        obj.isAttached = true;
        obj.trigger(ATTACHED, obj);
        return obj.root;
    }
}

function getRealAttr(attr, toRealType) {
    var eventObj = {};

    for (var i in attr) {
        var item = attr[i];

        if (toRealType === true) {
            attributeToAttrs.call(this, i, item);
        }

        if (supportEvent[i]) {
            eventObj['ev-' + supportEvent[i]] = item;
        }
    }

    attr = attr || {};

    return {
        eventObj: eventObj,
        attr: attr
    }
}

// create的trigger之前执行renderfunc
function create(type, attr) {
    var children = [].slice.call(arguments, 2),
        children = toPlainArray(children),
        result = null;

    attr = attr || {};

    if (isString(type)) {
        if (isOriginalTag(type)) {
            var node = document.createElement(type);
            attr = getRealAttr(attr).attr;
            node.attrs = attr;

            result = node;

        } else {
            var NewClass = getElemClass(type),
                elemObj = null;

            if (!NewClass) {
                return;
            }

            elemObj = new NewClass();
            result = elemObj;
        }

        if (!!result) {
            for (var i = 0; i < children.length; i++) {
                var item = children[i];

                render(item, result);
            }
        }

        if (isString(type) && !isOriginalTag(type)) {
            result.renderFunc(result);
            result.name = attr.ref ? attr.ref : '';
            getRealAttr.call(result, attr, true);
            result.attrs = result.attrs || attr;

            if (!!attr.ref) {
                ref(attr.ref, result);
            }

            result.trigger(CREATED, result);
        } else {
            result.root = result;
        }

        return result;
    }

}


function register(type, renderFunc) {
    var elemClass = createElemClass(type, renderFunc);
    addElemClass(type, elemClass);
    return elemClass;
}

function ready(cb) {
    if (isFunction(cb)) {
        if (allRendered == true) {
            cb();
        } else {
            bind.call(Rosetta, 'ready', cb);
        }
    }
}

var Rosetta = {
    init: init,

    ref: ref,

    getElemClass: getElemClass,

    addElemClass: addElemClass,

    render: render,

    create: create,

    register: register,

    ready: ready
};

module.exports = Rosetta;



},{"./createElementClass.js":2,"./lifeEvents.js":3,"./supportEvent.js":7,"./utils.js":8}],6:[function(require,module,exports){
/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    'use strict';

    /*global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
var ArrayPrototype = Array.prototype;
var ObjectPrototype = Object.prototype;
var FunctionPrototype = Function.prototype;
var StringPrototype = String.prototype;
var NumberPrototype = Number.prototype;
var array_slice = ArrayPrototype.slice;
var array_splice = ArrayPrototype.splice;
var array_push = ArrayPrototype.push;
var array_unshift = ArrayPrototype.unshift;
var call = FunctionPrototype.call;

// Having a toString local variable name breaks in Opera so use to_string.
var to_string = ObjectPrototype.toString;

var isArray = Array.isArray || function isArray(obj) {
    return to_string.call(obj) === '[object Array]';
};

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, tryFunctionObject = function tryFunctionObject(value) { try { fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]'; isCallable = function isCallable(value) { if (typeof value !== 'function') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };
var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };
var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };

var isArguments = function isArguments(value) {
    var str = to_string.call(value);
    var isArgs = str === '[object Arguments]';
    if (!isArgs) {
        isArgs = !isArray(value) &&
          value !== null &&
          typeof value === 'object' &&
          typeof value.length === 'number' &&
          value.length >= 0 &&
          isCallable(value.callee);
    }
    return isArgs;
};


/* inlined from http://npmjs.com/define-properties */
var defineProperties = (function (has) {
  var supportsDescriptors = Object.defineProperty && (function () {
      try {
          Object.defineProperty({}, 'x', {});
          return true;
      } catch (e) { /* this is ES3 */
          return false;
      }
  }());

  // Define configurable, writable and non-enumerable props
  // if they don't exist.
  var defineProperty;
  if (supportsDescriptors) {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          Object.defineProperty(object, name, {
              configurable: true,
              enumerable: false,
              writable: true,
              value: method
          });
      };
  } else {
      defineProperty = function (object, name, method, forceAssign) {
          if (!forceAssign && (name in object)) { return; }
          object[name] = method;
      };
  }
  return function defineProperties(object, map, forceAssign) {
      for (var name in map) {
          if (has.call(map, name)) {
            defineProperty(object, name, map[name], forceAssign);
          }
      }
  };
}(ObjectPrototype.hasOwnProperty));


//
// Util
// ======
//

/* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
var isPrimitive = function isPrimitive(input) {
    var type = typeof input;
    return input === null || (type !== 'object' && type !== 'function');
};

var ES = {
    // ES5 9.4
    // http://es5.github.com/#x9.4
    // http://jsperf.com/to-integer
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
    ToInteger: function ToInteger(num) {
        var n = +num;
        if (n !== n) { // isNaN
            n = 0;
        } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
            n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
        return n;
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */
    ToPrimitive: function ToPrimitive(input) {
        var val, valueOf, toStr;
        if (isPrimitive(input)) {
            return input;
        }
        valueOf = input.valueOf;
        if (isCallable(valueOf)) {
            val = valueOf.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        toStr = input.toString;
        if (isCallable(toStr)) {
            val = toStr.call(input);
            if (isPrimitive(val)) {
                return val;
            }
        }
        throw new TypeError();
    },

    // ES5 9.9
    // http://es5.github.com/#x9.9
    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */
    ToObject: function (o) {
        /*jshint eqnull: true */
        if (o == null) { // this matches both null and undefined
            throw new TypeError("can't convert " + o + ' to object');
        }
        return Object(o);
    },

    /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */
    ToUint32: function ToUint32(x) {
        return x >>> 0;
    }
};


//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

var Empty = function Empty() {};

defineProperties(FunctionPrototype, {
    bind: function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (!isCallable(target)) {
            throw new TypeError('Function.prototype.bind called on incompatible ' + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = array_slice.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var bound;
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    args.concat(array_slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    args.concat(array_slice.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = Math.max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push('$' + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only
        // way to set the length property of a function.
        // In environments where Content Security Policies enabled (Chrome extensions,
        // for ex.) all use of eval or Function costructor throws an exception.
        // However in all of these environments Function.prototype.bind exists
        // and so this code will never be executed.
        bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    }
});

// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var owns = call.bind(ObjectPrototype.hasOwnProperty);


//
// Array
// =====
//

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
var spliceNoopReturnsEmptyArray = (function () {
    var a = [1, 2];
    var result = a.splice();
    return a.length === 2 && isArray(result) && result.length === 0;
}());
defineProperties(ArrayPrototype, {
    // Safari 5.0 bug where .splice() returns undefined
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) {
            return [];
        } else {
            return array_splice.apply(this, arguments);
        }
    }
}, !spliceNoopReturnsEmptyArray);

var spliceWorksWithEmptyObject = (function () {
    var obj = {};
    ArrayPrototype.splice.call(obj, 0, 0, 1);
    return obj.length === 1;
}());
defineProperties(ArrayPrototype, {
    splice: function splice(start, deleteCount) {
        if (arguments.length === 0) { return []; }
        var args = arguments;
        this.length = Math.max(ES.ToInteger(this.length), 0);
        if (arguments.length > 0 && typeof deleteCount !== 'number') {
            args = array_slice.call(arguments);
            if (args.length < 2) {
                args.push(this.length - start);
            } else {
                args[1] = ES.ToInteger(deleteCount);
            }
        }
        return array_splice.apply(this, args);
    }
}, !spliceWorksWithEmptyObject);



// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
defineProperties(Array, { isArray: isArray });

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object('a');
var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

var properlyBoxesContext = function properlyBoxed(method) {
    // Check node 0.6.21 bug where third parameter is not boxed
    var properlyBoxesNonStrict = true;
    var properlyBoxesStrict = true;
    if (method) {
        method.call('foo', function (_, __, context) {
            if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
        });

        method.call([1], function () {
            'use strict';

            properlyBoxesStrict = typeof this === 'string';
        }, 'x');
    }
    return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
};

defineProperties(ArrayPrototype, {
    forEach: function forEach(fun /*, thisp*/) {
        var object = ES.ToObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (!isCallable(fun)) {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                // context
                fun.call(thisp, self[i], i, object);
            }
        }
    }
}, !properlyBoxesContext(ArrayPrototype.forEach));

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
defineProperties(ArrayPrototype, {
    map: function map(fun /*, thisp*/) {
        var object = ES.ToObject(this),
            self = splitString && isString(this) ? this.split('') : object,
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (!isCallable(fun)) {
            throw new TypeError(fun + ' is not a function');
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                result[i] = fun.call(thisp, self[i], i, object);
            }
        }
        return result;
    }
}, !properlyBoxesContext(ArrayPrototype.map));


// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
var hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
defineProperties(ArrayPrototype, {
    indexOf: function indexOf(sought /*, fromIndex */) {
        var self = splitString && isString(this) ? this.split('') : ES.ToObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = ES.ToInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    }
}, hasFirefox2IndexOfBug);



//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14

// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
var hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
    hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype'),
    hasStringEnumBug = !owns('x', '0'),
    dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
    ],
    dontEnumsLength = dontEnums.length;

defineProperties(Object, {
    keys: function keys(object) {
        var isFn = isCallable(object),
            isArgs = isArguments(object),
            isObject = object !== null && typeof object === 'object',
            isStr = isObject && isString(object);

        if (!isObject && !isFn && !isArgs) {
            throw new TypeError('Object.keys called on a non-object');
        }

        var theKeys = [];
        var skipProto = hasProtoEnumBug && isFn;
        if ((isStr && hasStringEnumBug) || isArgs) {
            for (var i = 0; i < object.length; ++i) {
                theKeys.push(String(i));
            }
        }

        if (!isArgs) {
            for (var name in object) {
                if (!(skipProto && name === 'prototype') && owns(object, name)) {
                    theKeys.push(String(name));
                }
            }
        }

        if (hasDontEnumBug) {
            var ctor = object.constructor,
                skipConstructor = ctor && ctor.prototype === object;
            for (var j = 0; j < dontEnumsLength; j++) {
                var dontEnum = dontEnums[j];
                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                    theKeys.push(dontEnum);
                }
            }
        }
        return theKeys;
    }
});

var keysWorksWithArguments = Object.keys && (function () {
    // Safari 5.0 bug
    return Object.keys(arguments).length === 2;
}(1, 2));
var originalKeys = Object.keys;
defineProperties(Object, {
    keys: function keys(object) {
        if (isArguments(object)) {
            return originalKeys(ArrayPrototype.slice.call(object));
        } else {
            return originalKeys(object);
        }
    }
}, !keysWorksWithArguments);



//
// String
// ======
//


var str_replace = StringPrototype.replace;
var replaceReportsGroupsCorrectly = (function () {
    var groups = [];
    'x'.replace(/x(.)?/g, function (match, group) {
        groups.push(group);
    });
    return groups.length === 1 && typeof groups[0] === 'undefined';
}());

if (!replaceReportsGroupsCorrectly) {
    StringPrototype.replace = function replace(searchValue, replaceValue) {
        var isFn = isCallable(replaceValue);
        var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
        if (!isFn || !hasCapturingGroups) {
            return str_replace.call(this, searchValue, replaceValue);
        } else {
            var wrappedReplaceValue = function (match) {
                var length = arguments.length;
                var originalLastIndex = searchValue.lastIndex;
                searchValue.lastIndex = 0;
                var args = searchValue.exec(match) || [];
                searchValue.lastIndex = originalLastIndex;
                args.push(arguments[length - 2], arguments[length - 1]);
                return replaceValue.apply(this, args);
            };
            return str_replace.call(this, searchValue, wrappedReplaceValue);
        }
    };
}

}));


/**
* Shim for "fixing" IE's lack of support (IE < 9) for applying slice
* on host objects like NamedNodeMap, NodeList, and HTMLCollection
* (technically, since host objects have been implementation-dependent,
* at least before ES6, IE hasn't needed to work this way).
* Also works on strings, fixes IE < 9 to allow an explicit undefined
* for the 2nd argument (as in Firefox), and prevents errors when
* called on other DOM objects.
*/
(function () {
    'use strict';
    var _slice = Array.prototype.slice;

    try {
        // Can't be used with DOM elements in IE < 9
        _slice.call(document.documentElement);
    } catch (e) { // Fails in IE < 9
        // This will work for genuine arrays, array-like objects,
        // NamedNodeMap (attributes, entities, notations),
        // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
        // and will not fail on other DOM objects (as do DOM elements in IE < 9)
        Array.prototype.slice = function (begin, end) {
            // IE < 9 gets unhappy with an undefined end argument
            end = (typeof end !== 'undefined') ? end : this.length;

            // For native Array objects, we use the native slice function
            if (Object.prototype.toString.call(this) === '[object Array]'){
                return _slice.call(this, begin, end);
            }

            // For array like object we handle it ourselves.
            var i, cloned = [],
                size, len = this.length;

            // Handle negative value for "begin"
            var start = begin || 0;
            start = (start >= 0) ? start: len + start;

            // Handle negative value for "end"
            var upTo = (end) ? end : len;
            if (end < 0) {
                upTo = len + end;
            }

            // Actual expected size of the slice
            size = upTo - start;

            if (size > 0) {
                cloned = new Array(size);
                if (this.charAt) {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this.charAt(start + i);
                    }
                } else {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this[start + i];
                    }
                }
            }

            return cloned;
        };
    }
}());

},{}],7:[function(require,module,exports){
var supportEvent = {
    // 只支持原生的
    onClick: 'click',
    onDoubleClick: 'doubleclick',
    onDrag: 'drag',
    onDragEnd: 'dragend',
    onDragEnter: 'dragenter',
    onDragExit: 'dragexit',
    onDragLeave: 'dragleave',
    onDragOver: 'dragover',
    onDragStart: 'dragstart',
    onDrop: 'drop',
    onMouseDown: 'mousedown',
    onMouseEnter: 'mouseenter',
    onMouseLeave: 'mouseleave',
    onMouseMove: 'mousemove',
    onMouseOut: 'mouseout',
    onMouseOver: 'mouseover',
    onMouseUp: 'mouseup',


    onTouchStart: 'touchstart',
    onTouchEnd: 'touchend',
    onTouchCancel: 'touchcancel',
    onTouchMove: 'touchmove',


    onScroll: 'scroll',
    onWheel: 'wheel',


    onCopy: 'copy',
    onCut: 'cut',
    onPaste: 'paste',


    onKeyDown: 'keydown',
    onKeyPress: 'keypress',
    onKeyUp: 'keyup',


    onFocus: 'focus',
    onBlur: 'blur',


    onChange: 'change',
    onInput: 'input',
    onSubmit: 'submit'
};

module.exports = supportEvent;
},{}],8:[function(require,module,exports){
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

},{"./plainDom.js":4}]},{},[1]);
