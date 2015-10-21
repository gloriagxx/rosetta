(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 *
 * @module query
 * @param {string} selector - the selector string for the wanted DOM
 * @param {HTMLNode} element - the scope in which selector will be seached in
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.query = query;
exports.bind = bind;
exports.trigger = trigger;
exports.updateRefs = updateRefs;
exports.triggerChildren = triggerChildren;
exports.getParent = getParent;
exports.attributeToProperty = attributeToProperty;
exports.handleAttr = handleAttr;
exports.updateChildElemRoot = updateChildElemRoot;
exports.appendRoot = appendRoot;
exports.handleContent = handleContent;
exports.handleEvent = handleEvent;

function query(selector, element) {
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

    return element.getElementById && isSimple && maybeID ? (found = element.getElementById(nameOnly)) ? [found] : [] : element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11 ? [] : slice.call(isSimple && !maybeID && element.getElementsByClassName ? maybeClass ? element.getElementsByClassName(nameOnly) : element.getElementsByTagName(selector) : element.querySelectorAll(selector));
}

/**
 *
 * @module bind
 * @param {string} type - the event name
 * @param {function} listener - callback of the event which will be executed when the event has been triggered
 * @param {object} context - the custom context when executing callback
 * @param {boolean} ifOnce - determin whether the callback which be executed only once
 */

function bind(type, listener, context, ifOnce) {
    this.events = this.events || {};
    var queue = this.events[type] || (this.events[type] = []);
    queue.push({
        f: listener,
        o: context,
        ifOnce: ifOnce
    });
}

/**
 *
 * @module fire
 * @param {string} type - trigger event which is represented by type
 */

function trigger(type) {
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
}

/**
 *
 * @module updateRefs
 * @param {object} obj - the rosetta element instance
 * @param {HTMLNode} dom - the htmlnode of the rosetta element instance
 */

function updateRefs(obj) {
    var dom = obj.root;

    for (var key in obj.$) {
        var node = query('[ref="' + key + '"]', dom);
        obj.$[key] = node;
    }
}

/**
 *
 * @function for triggering event on children
 * @param {object} obj - rosetta element instance
 * @param {string} type - event name
 */

function triggerChildren(obj, type) {
    for (var key in obj.rosettaElems) {
        var item = obj.rosettaElems[key];
        triggerChildren(item, type);
        item[type].call(item);
        item.fire(type, item);
    }
}

/*
 * @function getParent找到每个content的一级rosetta element的dom
 *
 */

function getParent(_x) {
    var _again = true;

    _function: while (_again) {
        var dom = _x;
        parent = undefined;
        _again = false;

        var parent = dom.parentElement;
        if (!parent) {
            return;
        }

        if (parent.getAttribute('isRosettaElem') === 'true') {
            return parent;
        } else {
            _x = parent;
            _again = true;
            continue _function;
        }
    }
}

/**
 * @function attributeToProperty
 * @param name
 * @param value
 */

function attributeToProperty(name, value) {
    if (name) {
        var item = this.properties[name] || String;
        var supportType = [Boolean, Date, Number, String, Array, Object];
        var index = supportType.indexOf(item);
        var typeFunc = supportType[index];
        var currentValue = this[name] || null;

        if (index < 0) {
            var typeFunc = item.type;
        }

        if (!(typeof typeFunc() == typeof value)) {
            // deserialize Boolean or Number values from attribute
            value = deserializeValue(value, typeFunc, currentValue);
        }

        // only act if the value has changed
        if (value !== currentValue) {
            if (isPlainObject(value)) {
                var configValue = extend({}, value, true);
            }

            this.__config[name] = configValue;
            this[name] = value;
        }

        return value;
    }
}

/*
 * @function handleAttr: change attributes to goal structure, if !!rosettaObj then change attributes to real value according to properties' type
 * @param {json} attr: attributes of elements
 * @param {object} rosettaObj: rosetta element instance
 */

function handleAttr(attr, rosettaObj) {
    // 处理attributes，转换为attr和事件分离的格式；如果需要toRealType，则转换类型（比较消耗性能）
    var eventObj = {};
    var events = {};

    for (var name in attr) {
        var item = attr[name];

        if (!!rosettaObj) {
            attr[name] = attributeToProperty.call(this, name, item);
        }

        if (supportEvent[name]) {
            eventObj['ev-' + supportEvent[name]] = item;
            events[supportEvent[name]] = 0; // root element代理之后设置为true
            delete attr[name];
        }
    }

    return {
        eventObj: eventObj,
        attr: attr,
        events: events
    };
}

/*
 * @function
 *
 */

function updateChildElemRoot(obj) {
    var rosettaElems = obj.rosettaElems;
    var root = obj.root;

    for (var id in rosettaElems) {
        var item = rosettaElems[id];

        var dom = query('[elemID="' + id + '"]', root);
        item.root = dom[0];
    }
}

/*
 * @function
 *
 */

function appendRoot(dom, parent, ifReplace) {
    var classes = root.getAttribute('class');

    if (ifReplace == true) {
        var v = dom.getAttribute('class');
        dom.setAttribute('class', (v + ' ' + classes).replace(/r-invisible/g, ''));
        root.parentElement.replaceChild(dom, root);
    } else {
        root.appendChild(dom);
        root.setAttribute('class', classes.replace(/r-invisible/g, ''));
    }
}

/*
 *@function handleContent, put children into right place in the content
 * @param {array} contents contains children dom as an array
 */

function handleContent(contents, _shouldReplacedContent) {
    (contents || []).map(function (content, index) {
        var parent = getParent(content);
        var num = parent.getAttribute('shouldReplacedContent');
        var children = _shouldReplacedContent[parseInt(num)];

        var newWrapper = document.createElement('div');
        newWrapper.setAttribute('class', 'content');

        var tmp = document.createDocumentFragment();
        for (var i = 0; i < children.length; i++) {
            var n = children[i];

            tmp.appendChild(n);
        }
        var selector = content.getAttribute('select');
        var result = query(selector, tmp);

        (children || []).map(function (child, i, arr) {
            var index = result.indexOf(child);
            if (index >= 0) {
                newWrapper.appendChild(arr.splice(i, 1)[0]);
            }
        });

        if (newWrapper.children.length > 0) {
            content.parentElement.replaceChild(newWrapper, content);
        }
    });
}

/*
 * @function
 *
 */

function handleEvent(obj) {
    // 遍历每个子element
    for (var id in obj.rosettaElems) {
        (function (childID, childObj) {
            // 每个子element需要代理的事件
            var events = childObj.__events;

            for (var type in events) {
                (function (eventName, ifBinded, obj) {
                    var root = obj.root;

                    if (ifBinded === 0) {
                        if (root.addEventListener) {
                            root.addEventListener(eventName, function (e) {
                                e.stopPropagation();
                                eventRealCB(e, obj);
                            }, false);
                        } else {
                            root.attachEvent('on' + eventName, function (e) {
                                e.stopPropagation();
                                eventRealCB(e, obj);
                            });
                        }
                    }
                })(type, events[type], childObj);
                events[type] = 1;
            }

            // 对每个子element的root进行事件绑定，并阻止冒泡
        })(id, obj.rosettaElems[id]);
    }
}

function eventRealCB(e, obj) {
    var parent = e.target;
    var root = obj.root;

    function findCB(parent) {
        if (parent == root || !parent) {
            return;
        }

        var realCallback = EvStore(parent)[e.type];
        if (!!realCallback) {
            realCallback.call(obj, e);
        } else {
            parent = parent.parentElement;
            findCB(parent);
        }
    }

    findCB(parent);
}

},{}],2:[function(require,module,exports){
/**
 *
 *  file: htmlimport.js
 *  version: 1.0.0
 *  update: 2015.7.20
 *
 */

'use strict';

var head = document.getElementsByTagName('head')[0],
    resMap = {},
    pkgMap = {},
    factoryMap = {},
    loadingMap = {},
    scriptsMap = {},
    timeout = 5000;

/**
 *
 *
 *  example:
 *
    Rosetta.resourceMap({
        res: {
            'https://ss1.bdstatic.com/5eN1bjq8AAUYm2zgoY3K/r/www/cache/static/protocol/https/jquery/jquery-1.10.2.min_f2fb5194': {
                type: 'js',
                url: 'https://ss1.bdstatic.com/5eN1bjq8AAUYm2zgoY3K/r/www/cache/static/protocol/https/jquery/jquery-1.10.2.min_f2fb5194.js' //,
                //pkg: 'merge1'
                //,
                //deps: ['comp/a-xxx', 'comp/a-yyy', 'comp/a-rrrr', 'a-slider.css']
            },

            'a-slider.css': {
                type: 'css',
                url: 'a-slider_xxxxxx.css',
                pkg: 'merge2'
            }
        },

        pkg: {
            'merge1': {
                type: 'js',
                url: 'merge1_sds2121.js'
            },

            'merge2': {
                type: 'css',
                url: 'merge1_sds2121.css'
            }
        }
    })
 *
 */

function resourceMap(obj) {
    var key = '',
        res = '',
        pkg = '';

    res = obj.res;

    for (key in res) {
        resMap[key] = res[key];
    }

    pkg = obj.pkg;

    for (key in pkg) {
        pkgMap[key] = pkg[key];
    }
}

function alias(url) {
    return url.replace(/\.js$/i, '');
}

function createScript(url, id, onerror) {
    if (url in scriptsMap) return;

    scriptsMap[url] = true;

    var script = document.createElement('script');

    if (onerror) {
        var tid;

        (function () {
            var onload = function onload() {
                clearTimeout(tid);
                var queue = loadingMap[alias(id)];

                if (queue) {
                    for (var i = 0, n = queue.length; i < n; i++) {
                        queue[i]();
                    }
                    delete loadingMap[url];
                }
            };

            tid = setTimeout(onerror, timeout);

            script.onerror = function () {
                clearTimeout(tid);
                onerror();
            };

            if ('onload' in script) {
                script.onload = onload;
            } else {
                script.onreadystatechange = function () {
                    if (this.readyState == 'loaded' || this.readyState == 'complete') {
                        onload();
                    }
                };
            }
        })();
    }
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
    return script;
}

function createCSS(url, id, onerror) {
    if (url in scriptsMap) return;

    scriptsMap[url] = true;

    var link = document.createElement('link');

    if (onerror) {
        var _onload = function _onload() {
            clearTimeout(tid);
            var queue = loadingMap[alias(id)];

            if (queue) {
                for (var i = 0, n = queue.length; i < n; i++) {
                    queue[i]();
                }
                delete loadingMap[url];
            }
        };

        var tid = setTimeout(onerror, timeout);

        var link = document.createElement('link');
        link.href = url;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        head.appendChild(link);
        _onload();
    }
}
/**
 *
 * @module htmlImport
 * @param {array} urls - Array of resources to be loaded
 *
 */
function htmlImport(urls, onload, onerror) {
    if (typeof urls == 'string') {
        urls = [urls];
    }

    var needMap = {};
    var needNum = 0;

    onerror = onerror || function () {};

    function findNeed(depArr) {
        for (var i = 0, n = depArr.length; i < n; i++) {
            var dep = alias(depArr[i]);

            if (!(dep in factoryMap)) {
                var child = resMap[dep] || resMap[dep + '.js'];

                if (child && 'deps' in child) {
                    findNeed(child.deps);
                }
            }

            if (dep in needMap) {
                continue;
            }

            needMap[dep] = true;
            needNum++;

            loadScript(dep, updateNeed, onerror);
        }
    }

    function updateNeed() {
        if (0 == needNum--) {
            onload && onload.apply(window);
        }
    }

    findNeed(urls);
    updateNeed();
}

function loadScript(id, callback, onerror) {
    var queue = loadingMap[id] || (loadingMap[id] = []);
    queue.push(callback);

    //
    // resource map query
    //
    var res = resMap[id] || resMap[id + '.js'] || {};
    var pkg = res.pkg;
    var url;
    var type = '';

    if (pkg) {
        url = pkgMap[pkg].url;
        type = pkgMap[pkg].type;
    } else {
        url = res.url || id;
        type = res.type;
    }

    if (type == 'js') {
        createScript(url, id, onerror && function () {
            onerror(id);
        });
    } else if (type == 'css') {
        createCSS(url, id, onerror && function () {
            onerror(id);
        });
    }
}

htmlImport.factoryMap = factoryMap;
htmlImport.resourceMap = resourceMap;

module.exports = htmlImport;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var ATTACHED = 'attached';
exports.ATTACHED = ATTACHED;
var DETACHED = 'detached';
exports.DETACHED = DETACHED;
var CREATED = 'created';
exports.CREATED = CREATED;
var READY = 'ready';
exports.READY = READY;
var ATTRIBUTECHANGE = 'attributeChanged';
exports.ATTRIBUTECHANGE = ATTRIBUTECHANGE;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
var plainDOM = {
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
    'div': 'div',
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
exports.plainDOM = plainDOM;

},{}],5:[function(require,module,exports){
/*@require ./rosetta.css*/

/**
 * Rosetta - webcomponents like javascript library accelerate UI development
 * version 1.1.0
 *
 */

// define module dependency
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rosettaElementJs = require('./rosettaElement.js');

var _rosettaElementJs2 = _interopRequireDefault(_rosettaElementJs);

var _lifeEventsJs = require('./lifeEvents.js');

var _htmlImport = require('./htmlImport');

var _htmlImport2 = _interopRequireDefault(_htmlImport);

var _supportEventJs = require('./supportEvent.js');

var _supportEventJs2 = _interopRequireDefault(_supportEventJs);

var _utilsJs = require('./utils.js');

var _elementUtilsJs = require('./elementUtils.js');

// vdom relavent

var _virtualDomH = require('virtual-dom/h');

var _virtualDomH2 = _interopRequireDefault(_virtualDomH);

var _virtualDomCreateElement = require('virtual-dom/create-element');

var _virtualDomCreateElement2 = _interopRequireDefault(_virtualDomCreateElement);

var _evStore = require("ev-store");

var _evStore2 = _interopRequireDefault(_evStore);

// define private instances
var _allRendered = false; // 调用init的开始置为false，本次渲染所有组件render完毕就是true；如果存在因未定义而未渲染的也算作是true，因此可以理解为“本次符合渲染条件的都渲染完了”
var _refers = {}; // to store ref of Rosetta element instance in Rosetta
var _elemClass = {};
var _shouldReplacedContent = [];

function findRosettaTag() {
    var elems = [];
    if (!!document.getElementsByClassName) {
        elems = document.getElementsByClassName('r-element');
    } else if (!!document.querySelectorAll) {
        elems = document.querySelectorAll('.r-element');
    } else {
        var doms = document.getElementsByTagName('*');
        for (var i = 0; i < doms.length; i++) {
            var item = doms[i];
            if (item.tagName.toLowerCase().indexOf('r-') >= 0) {
                elems.push(item);
            }
        }
    }

    return elems;
}

/*
 * @function start parse document and render rosetta element
 */
function init() {
    // 找到页面的r-xxx元素
    // 如果是Rosetta已经注册的元素类型，则create、render
    _allRendered = false;
    var elems = findRosettaTag();
    var i = 0;

    for (; i < elems.length; i++) {
        var item = elems[i];
        var type = item.tagName.toLowerCase();
        var options = {};
        var attrs = item.attributes || {};
        var children = [].slice.call(item.children);
        var n = 0;

        for (; n < attrs.length; n++) {
            var content = attrs[n];
            options[content.name] = content.value;
        }

        if (getElemClass(type)) {
            Rosetta.render(Rosetta.create(type, options, children), item, true);
        }
    }

    _allRendered = true;
    _utilsJs.fire.call(Rosetta, 'ready');
}

/*
 * @function to create rosetta element obj
 * @param {string} type, type of rosetta element
 * @param {object} initArr, attributes of the newly created element
 * @return {object} vTree, contains referer of rosetta instance
 */
function create(type) {
    var initAttr = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (!(0, _utilsJs.isString)(type)) {
        return;
    }

    var children = [].slice.call(arguments, 2);
    children = (0, _utilsJs.toPlainArray)(children);
    var vTree = '';

    if ((0, _utilsJs.isOriginalTag)(type)) {
        // 将initAttr转换为对应this.properties的type的attr真实值，并处理好vtree要求的事件属性格式
        // 生成vtree
        var result = (0, _elementUtilsJs.handleAttr)(initAttr);
        var attr = result.attr;
        var eventObj = result.eventObj;
        var events = result.events;

        var newAttr = (0, _utilsJs.extend)({
            attributes: attr
        }, eventObj, true);

        vTree = _virtualDomH2['default'].call(this, type, newAttr, children);
        vTree.__events = events;

        return vTree;
    } else {
        // 查找是否存在class
        var ElemClass = getElemClass[type];
        if (!ElemClass) {
            return;
        }

        // 生成rosetta elem的id
        var elemID = Math.random();

        // 生成element实例
        var elemObj = new ElemClass();

        // 设置name为initAttr.ref的值
        elemObj.name = initAttr.ref ? initAttr.ref && ref(initAttr.ref, elemObj) : '';
        // 将initAttr转换为对应this.properties的type的attr真实值，并处理好vtree要求的事件属性格式
        var result = (0, _elementUtilsJs.handleAttr)(initAttr, elemObj);
        var attr = result.attr;
        var eventObj = result.eventObj;
        var events = result.events; // 设置id，设置elem实例的property为attribute
        attr.elemID = elemID;

        // 生成vtree
        vTree = elemObj.__t(elemObj, elemObj.$);

        // 处理children，将children存起来，方便根节点render的时候统一处理children content的事情
        if (children) {
            // rosetta节点的children都需要走content过滤的逻辑
            children.map(function (item, index) {
                if (!item.nodeType) {
                    children[index] = (0, _virtualDomCreateElement2['default'])(item);
                }
            });

            // 给当前的vtree序列号，便于根节点知道要把children插入到哪个content
            // 疑似bug，需要重点单测
            _shouldReplacedContent.push(children);
            vTree.properties.attributes.shouldReplacedContent = _shouldReplacedContent.length - 1;
        }

        //vtree和robj相互引用，方便后面获取
        elemObj.vTree = vTree;
        vTree.rObj = elemObj;
        vTree.__events = events;

        // 派发created事件
        elemObj.fire(_lifeEventsJs.CREATED, elemObj);
        elemObj.created.call(elemObj);

        return vTree;
    }
}

/*
 * @function render element to dom, or render all the element in the document.body
 * @param {object} vTree is the vtree of rosetta element instance to be render to parent dom
 * @param {domnode} parentDOM is where rosetta element to be rendered to
 * @param {boolean} ifReplace represent whether to append to parentDOM or replace it
 */
function render(vTree, parentDOM, ifReplace) {
    // 如果没有参数，表示全document渲染dom
    if (!vTree) {
        init();
        return;
    }

    // 处理parentDOM
    if ((0, _utilsJs.isString)(parentDOM)) {
        parentDOM = qurey(parentDOM)[0];
    }

    // 生成dom
    var dom = (0, _virtualDomCreateElement2['default'])(vTree);
    // 从vtree获得rosetta element instance
    var rObj = vTree.rObj;

    if (!parentDOM) {
        return;
    }

    if (!!rObj && rObj.isRosettaElem == true) {
        rObj.root = dom;
        var contents = (0, _utilsJs.query)('content', rObj.root);
        // 处理content
        (0, _elementUtilsJs.handleContent)(contents, _shouldReplacedContent);
        // 疑似bug
        _shouldReplacedContent = [];
        // 更新内部dom节点的ref
        (0, _elementUtilsJs.updateRefs)(rObj);
        // 更新自己的ref到rosetta
        setRef(rObj.__config.ref, rObj);
        // 更新内部rosetta element instance的root（render前都是虚拟dom，嵌套的子element实际没有dom类型的root）
        (0, _elementUtilsJs.updateChildElemRoot)(rObj);
        // 处理事件绑定: 遍历每个子rosetta element绑定事件，绑定自己的事情
        (0, _elementUtilsJs.handleEvent)(rObj);
        // 派发element的ready事件（已经有dom，但是并未appedn到父节点上）
        (0, _elementUtilsJs.triggerChildren)(rObj, 'domready');
        // 更新dom
        (0, _elementUtilsJs.appendRoot)(dom, parentDOM, ifReplace);
        // 派发attached事件相关
        (0, _elementUtilsJs.triggerChildren)(rObj, _lifeEventsJs.ATTACHED);
        rObj.fire(_lifeEventsJs.ATTACHED, rObj);
        rObj.attached.call(rObj);
        return rObj;
    } else {
        // 处理事件代理

        // dom append到parentdom上
        (0, _elementUtilsJs.appendRoot)(dom, parentDOM, ifReplace);
    }

    // 逻辑
    // 更新content逻辑：获取所有的content标签，找到他的第一级rosetta element，获取这个rosetta element需要替换的content的编号shouldReplacedContent，查找children dom
    // 更新事件逻辑：将事件代理到每一级rosetta element的根root上，保存一份old已绑定事件，方便update的时候diff增加；当根节点上事件触发的时候，通过evstore查找当前dom上是否有对应事件的callback，如果有则执行，否则递归到parent；阻止冒泡（update的时候将当前的和old进行diff绑定diff的）
    // 更新内部ref逻辑：将ref属性设置到节点的attribute上，已经有dom的时候query一下ref=xxx获得dom，然后更新$
}

/*
 * @function for execute callback when current render all done
 * @params {function} cb, callbacks for all elements render done
 * @params {boolean} ifOnce, if execute once
 */
function ready(cb, ifOnce) {
    if ((0, _utilsJs.isFunction)(cb)) {
        ifOnce = ifOnce === true ? true : false;
        if (_allRendered == true) {
            cb();
            !ifOnce && _utilsJs.bind.call(Rosetta, 'ready', cb, null, ifOnce);
        } else {
            _utilsJs.bind.call(Rosetta, 'ready', cb, null, ifOnce);
        }
    }
}

/*
 *
 *
 */

function getElemClass(type) {
    if (!type) {
        return;
    }

    return _elemClass[type];
}

/*
 * @function
 *
 */
function setElemClass(type, newClass) {
    if (!!type && !!newClass) {
        _elemClass[type] = newClass;
    }
}

/*
 * @function
 *
 */
function getRef(key, value) {
    if (!key) {
        return;
    }
    return _refers[key];
}

/*
 * @function
 *
 */
function setRef(key, value) {
    if (!!key && !!value) {
        _refers[key] = value;
    }
}

/**
 *
 * @param {json} options - options for prototype of custom element
 * @example, if it has no default value, then the value can be String/Object/
    {
        is: 'r-xxx'
        ready: function() {}
        created: function() {}
        attached: function() {}
        dettached: function() {}
        attributeChanged: function() {}
        extends: 'type name'
        properties: {
            aaa: 'string',//used for deserializezing from an attribute
            bbb: [],
            prop: {
                type: String,
                notify: true,
                readOnly: true
            }
        }
    }
 * @param options.properties.xxx.type - Boolean, Date, Number, String, Array or Object
 * @param options.properties.xxx.value - boolean, number, string or function
 * String. No serialization required.
 * Date or Number. Serialized using  toString.
 * Boolean. Results in a non-valued attribute to be either set (true) or removed (false).
 * Array or Object. Serialized using JSON.stringify.
 *
 */
function Rosetta(opts) {
    // 组件注册接口
    // 创建新的组件class
    // 标记异步import加载器的该类型组件class已经定义
    // 返回类型为创建的新组件class
    var type = opts.is;
    var newClass = (0, _rosettaElementJs2['default'])(opts);

    setElemClass(type, newClass);
    _htmlImport2['default'].factoryMap[opts.__rid] = true;
    return newClass;
}

(0, _utilsJs.extend)(Rosetta, {
    'ref': ref,

    'render': render,

    'create': create,

    'ready': ready,

    'import': _htmlImport2['default'],

    'config': _htmlImport2['default'].resourceMap
});

exports['default'] = Rosetta;
module.exports = exports['default'];

},{"./elementUtils.js":1,"./htmlImport":2,"./lifeEvents.js":3,"./rosettaElement.js":6,"./supportEvent.js":7,"./utils.js":8,"ev-store":10,"virtual-dom/create-element":13,"virtual-dom/h":14}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = elementClassFactory;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsJs = require('./utils.js');

var _lifeEventsJs = require('./lifeEvents.js');

var _elementUtilsJs = require('./elementUtils.js');

var _supportEventJs = require('./supportEvent.js');

var _supportEventJs2 = _interopRequireDefault(_supportEventJs);

/**
 * @function for event binding
 * @param {string} eventName - the name of the event
 * @param {string} listener - callback of the event
 * @param {object} context - the custom context when executing callback
 * @param {string} ifOnce - whether the callback will be executed once
 */
function on(eventName, listener, context, ifOnce) {
    _elementUtilsJs.bind.call(this, eventName, listener, context, ifOnce);
}

/**
 * @function for event triggering only once
 * @param {string} eventName - the name of the event
 * @param {function} listener - callback of the event
 * @param {object} context - the custom context when executing callback
 */
function once(eventName, listener, context) {
    this.on(eventName, listener, context, true);
}

/**
 * @function for event unbinding
 * @param {string} eventName - the name of the event to be unbinded
 */
function off(eventName) {
    if (!eventName) {
        this.events = [];
    }

    delete this.events[eventName];
}

/**
 * @function for event triggering
 * @param {string} eventName - the name of the event
 */
function fire(eventName) {
    _elementUtilsJs.trigger.call(this, eventName);
}

/**
 *
 * @function for update rosetta element instance properties and rerendering UI
 * @param {object} options - new value of properties for updating
 */
function update(opts) {
    var oldTree = this.vTree;
    var rootNode = this.root;
    var type = this.type;
    var attr = {};
    var flag = false;

    // 判断是不是更新的数据和已有的数据存在不同
    for (var key in opts) {
        if (this.__config[key] != options[i]) {
            flag = true;
            break;
        }
    }

    if (!flag) {
        return;
    }

    // 更新property
    (0, _utilsJs.extend)(this, opts, true);
    // 更新__config
    (0, _utilsJs.extend)(this.__config, (0, _utilsJs.extend)({}, opts, true));

    // 生成新vtree和pathes
    var newTree = this.__t(this, this.$);
    var oldAttrs = oldTree.properties.attributes;
    var newAttrs = newTree.properties.attributes;

    (0, _utilsJs.extend)(newAttrs, {
        isRosettaElem: oldAttrs.isRosettaElem,
        shouldReplacedContent: oldAttrs.shouldReplacedContent,
        elemID: oldAttrs.elemID
    }, true);

    var patches = diff(oldTree, newTree);

    // 更新树
    this.root = patch(this.root, patches);
    this.vTree = newTree;
    this.vTree.rObj = oldTree.rObj;

    // 更新ref的引用
    updateRefs(rObj);

    // 更新事件代理(不用移除旧的事件绑定)
    (0, _elementUtilsJs.handleEvent)(rObj);

    // 执行attributechange相关逻辑
    triggerChildren(this, _lifeEventsJs.ATTRIBUTECHANGE);
    this.fire(_lifeEventsJs.ATTRIBUTECHANGE, this);
    this.attributeChanged.call(this);
}

/**
 *
 * @function for destroy rosetta element instance
 * @description: remove dom/ unbind event / remove obj from rosetta elems
 */
function destroy() {
    // 事件解绑
    this.off();
    // 移除dom
    this.root.parentElement.removeChild(this.root);
    delete Rosetta.ref(this.name);

    // 触发dettached相关事件
    triggerChildren(this, _lifeEventsJs.DETACHED);
    this.fire(_lifeEventsJs.DETACHED, this);
    this.isAttached = false;
    this.dettached.call(this);
}

/**
 *
 * @function for creating child rosetta element instance
 * @param {string} elemType - type of custom lement to be created
 * @attr {object} attr - initial value of properties to be set to rosetta element instance
 */
function create(elemType, attr) {
    // rosetta element模板中会调用这个接口
    // 调用rosetta的create方法，返回节点的vtree
    var vTree = Rosetta.create.apply(Rosetta, arguments);

    // 将此vtree的引用放在this的中，保存attr.ref的引用
    if (!!attr && !!attr.ref) {
        // 疑似bug
        this.$[attr.ref] = vTree;
    }

    // 如果该字节点为rosettaElement，则存储生成的字节点的到父节点this的rosettaElems中存起来
    if (!!vTree && !!vTree.rObj && vTree.rObj.isRosettaElem == true) {
        // 将子节点为rosettaElem的放到rosettaChildren里
        // 根element需要知道内嵌子element
        this.rosettaChildren[vTree.rObj.elemID] = vTree.rObj;

        // 内嵌子element需要知道嵌套中的根element
        vTree.rObj.parentObj = this;
    } else {
        // 将非rosetta element的子节点处理的事件保存到this上，作为rosetta element需要为子节点代理的事件；暂时不支持嵌套时的rosetta标签绑定事件的写法
        (0, _utilsJs.extend)(this.shouldDelegateEvents, vTree.__events, true);
    }

    return vTree;
}

/**
 *
 * @function for creating new rosetta element class
 * @prototypeOpts {object} prototypeOpts - new settings for rosetta element prototype
 *
 */

function elementClassFactory(prototypeOpts) {

    /**
     * constructor for new custom elements
     *
     * @class CustomElement
     * @constructor
     * @param {object} options - the custom options of the new element
     */

    var CustomElement = function CustomElement(initAttr) {
        _classCallCheck(this, CustomElement);

        (0, _utilsJs.extend)(this, {
            'name': '',

            '$': {},

            'events': {},

            '__config': {},

            'isAttached': false,

            'rosettaChildren': {},

            'shouldDelegateEvents': {}

        }, true);

        // 初始化的时候将组件类定义的this.properties的数据转为实例的property和__config的值
        for (var key in this.properties) {
            var content = this.properties[key];
            var value = content.value;

            if ((0, _utilsJs.isFunction)(content) && value === undefined) {
                value = new content();
            } else {
                // throw type error
            }

            if ((0, _utilsJs.isPlainObject)(value)) {
                value = (0, _utilsJs.extend)({}, value, true);
            }

            this[key] = value;
            this.__config[key] = (0, _utilsJs.extend)({}, value, true);
        }

        // 将实例初始化的值更新property和__config
    };

    prototypeOpts.type = prototypeOpts.is;

    (0, _utilsJs.extend)(CustomElement.prototype, {
        is: '',

        ready: function ready() {},

        created: function created() {},

        attached: function attached() {},

        dettached: function dettached() {},

        attributeChanged: function attributeChanged() {},

        __t: function __t() {},

        properties: {}

    }, prototypeOpts, {
        update: update,

        destroy: destroy,

        isRosettaElem: true,

        on: on,

        once: once,

        off: off,

        fire: fire,

        create: create

    }, true);

    return CustomElement;
}

module.exports = exports['default'];

},{"./elementUtils.js":1,"./lifeEvents.js":3,"./supportEvent.js":7,"./utils.js":8}],7:[function(require,module,exports){
/**
 * Module representing the supported events
 * @module supportEvent
 * @type {object}
 * @exports supportEvent
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = supportEvent = {
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
    onMouseEnter: 'mouseover',
    onMouseLeave: 'mouseout',
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
module.exports = exports['default'];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.isString = isString;
exports.isDomNode = isDomNode;
exports.isOriginalTag = isOriginalTag;
exports.isWindow = isWindow;
exports.isPlainObject = isPlainObject;
exports.isArray = isArray;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.extend = extend;
exports.camelize = camelize;
exports.toPlainArray = toPlainArray;
exports.deserializeValue = deserializeValue;

var _plainDOMJs = require('./plainDOM.js');

function noopHandler(value) {
    return value;
}

/**
 *
 * @module typeHandlers
 *
 */
// helper for deserializing properties of various types to strings
var typeHandlers = {
    'string': noopHandler,
    'undefined': noopHandler,

    'date': function date(value) {
        return new Date(Date.parse(value) || Date.now());
    },

    'boolean': function boolean(value) {
        if (value === '') {
            return true;
        }
        return value === 'false' ? false : !!value;
    },

    'number': function number(value) {
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

    'object': function object(value, currentValue) {
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
    'function': function _function(value, currentValue) {
        return currentValue;
    }
};

exports.typeHandlers = typeHandlers;
/**
 *
 * @module isString
 * @param {object} elem
 */

function isString(elem) {
    return typeof elem == 'string';
}

/**
 *
 * @module isDomNode
 * @param {object} elem
 */

function isDomNode(elem) {
    return !!(elem && elem.nodeType === 1);
}

/**
 *
 * @module isOriginalTag
 * @param {string} str
 */

function isOriginalTag(str) {
    return !!_plainDOMJs.plainDOM[str];
}

/**
 *
 * @module isWindow
 * @param {object} obj
 */

function isWindow(obj) {
    return obj != null && obj == obj.window;
}

/**
 *
 * @module isPlainObject
 * @param {object} obj
 */

function isPlainObject(obj) {
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

function isArray(value) {
    return value instanceof Array;
}

/**
 *
 * @module isObject
 * @param {object} value
 */

function isObject(value) {
    return typeof value == 'object';
}

/**
 *
 * @module isFunction
 * @param {object} obj
 */

function isFunction(obj) {
    return typeof obj == 'function' || false;
}

/**
 *
 * @module extend
 * @param {object} target - the object which to append new json values
 */
function extendInternal(target, source, deep) {
    for (var key in source) if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
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

function extend(target) {
    var deep;
    var target = arguments[0];
    var args = [].slice.call(arguments, 1);
    var end = arguments[arguments.length - 1];

    if (typeof end == 'boolean') {
        deep = end;
        args.pop();
    }

    args.forEach(function (arg) {
        extendInternal(target, arg, deep);
    });
    return target;
}

/**
 *
 * @module camelize
 * @param {string} key
 */

function camelize(key) {
    var _reg = /-(.)/g;
    return key.replace(_reg, function (_, txt) {
        return txt.toUpperCase();
    });
}

/**
 *
 * @module toPlainArray
 * @param {object} data - turn the data into plain array
 */

function toPlainArray(data) {
    var result = [];

    for (var i = 0; i < data.length; i++) {
        var item = data[i];

        if (isArray(item)) {
            result = result.concat(toPlainArray(item));
        } else {
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

function deserializeValue(value, typeFunc, currentValue) {
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

},{"./plainDOM.js":4}],9:[function(require,module,exports){

},{}],10:[function(require,module,exports){
'use strict';

var OneVersionConstraint = require('individual/one-version');

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

},{"individual/one-version":12}],11:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":11}],13:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":23}],14:[function(require,module,exports){
var h = require("./virtual-hyperscript/index.js")

module.exports = h

},{"./virtual-hyperscript/index.js":26}],15:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],16:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"dup":10,"individual/one-version":18}],17:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11}],18:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"./index.js":17,"dup":12}],19:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":9}],20:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],21:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],22:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":30,"is-object":20}],23:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":28,"../vnode/is-vnode.js":31,"../vnode/is-vtext.js":32,"../vnode/is-widget.js":33,"./apply-properties":22,"global/document":19}],24:[function(require,module,exports){
'use strict';

var EvStore = require('ev-store');

module.exports = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function(node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

},{"ev-store":16}],25:[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],26:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var VNode = require('../vnode/vnode.js');
var VText = require('../vnode/vtext.js');
var isVNode = require('../vnode/is-vnode');
var isVText = require('../vnode/is-vtext');
var isWidget = require('../vnode/is-widget');
var isHook = require('../vnode/is-vhook');
var isVThunk = require('../vnode/is-thunk');

var parseTag = require('./parse-tag.js');
var softSetHook = require('./hooks/soft-set-hook.js');
var evHook = require('./hooks/ev-hook.js');

module.exports = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }


    return new VNode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new VText(c));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isHook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' +
        'Expected a VNode / Vthunk / VWidget / string but:\n' +
        'got:\n' +
        errorString(data.foreignObject) +
        '.\n' +
        'The parent vnode is:\n' +
        errorString(data.parentVnode)
        '\n' +
        'Suggested fix: change your `h(..., [ ... ])` callsite.';
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}

},{"../vnode/is-thunk":29,"../vnode/is-vhook":30,"../vnode/is-vnode":31,"../vnode/is-vtext":32,"../vnode/is-widget":33,"../vnode/vnode.js":35,"../vnode/vtext.js":36,"./hooks/ev-hook.js":24,"./hooks/soft-set-hook.js":25,"./parse-tag.js":27,"x-is-array":21}],27:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

},{"browser-split":15}],28:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":29,"./is-vnode":31,"./is-vtext":32,"./is-widget":33}],29:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],30:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],31:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":34}],32:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":34}],33:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],34:[function(require,module,exports){
module.exports = "1"

},{}],35:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":29,"./is-vhook":30,"./is-vnode":31,"./is-widget":33,"./version":34}],36:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":34}]},{},[5]);
