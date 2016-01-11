(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libRosettaCoreJs = require('./lib/rosettaCore.js');

var _libRosettaCoreJs2 = _interopRequireDefault(_libRosettaCoreJs);

var _libUtilsJs = require('./lib/utils.js');

require('./lib/shims.js');
var readyRE = /complete/;

function ready(callback) {
    if (readyRE.test(_libUtilsJs.document.readyState) && _libUtilsJs.document.body) {
        callback();
    } else {
        if (!_libUtilsJs.document.addEventListener) {
            window.attachEvent('onload', callback);
        } else {
            _libUtilsJs.document.addEventListener('DOMContentLoaded', function () {
                callback();
            }, false);
        }
    }
}

window.Rosetta = _libRosettaCoreJs2['default'];

ready(_libRosettaCoreJs2['default'].render);

},{"./lib/rosettaCore.js":5,"./lib/shims.js":7,"./lib/utils.js":9}],2:[function(require,module,exports){
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
exports.getPatches = getPatches;
exports.updateRosettaChildren = updateRosettaChildren;
exports.findRosettaTag = findRosettaTag;
exports.classNameToClass = classNameToClass;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsJs = require('./utils.js');

var _supportEventJs = require('./supportEvent.js');

var _evStore = require("ev-store");

var _evStore2 = _interopRequireDefault(_evStore);

var _virtualDomH = require('virtual-dom/h');

var _virtualDomH2 = _interopRequireDefault(_virtualDomH);

var _virtualDomDiff = require('virtual-dom/diff');

var _virtualDomDiff2 = _interopRequireDefault(_virtualDomDiff);

var _virtualDomCreateElement = require('virtual-dom/create-element');

var _virtualDomCreateElement2 = _interopRequireDefault(_virtualDomCreateElement);

window.diff = _virtualDomDiff2['default'];
/**
 *
 * @module query
 * @param {string} selector - the selector string for the wanted DOM
 * @param {HTMLNode} element - the scope in which selector will be seached in
 */

function query(selector, element) {
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        slice = [].slice,
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
        simpleSelectorRE = /^[\w-]*$/,
        isSimple = simpleSelectorRE.test(nameOnly);

    if (!element) {
        element = _utilsJs.document;
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

    (obj.rosettaChildren || []).map(function (childItem) {
        var item = childItem;
        updateRefs(item);
    });
}

/**
 *
 * @function for triggering event on children
 * @param {object} obj - rosetta element instance
 * @param {string} type - event name
 */

function triggerChildren(obj, type) {
    (obj.rosettaChildren || []).map(function (childItem) {
        var item = childItem;
        triggerChildren(item, type);
        item[type].call(item);
        item.fire(type, item);
    });
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
            return _utilsJs.document;
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
            value = (0, _utilsJs.deserializeValue)(value, typeFunc, currentValue);
        }

        // only act if the value has changed
        if (value !== currentValue) {
            if ((0, _utilsJs.isPlainObject)(value)) {
                var configValue = (0, _utilsJs.extend)({}, value, true);
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
            attr[name] = attributeToProperty.call(rosettaObj, name, item);
        }

        if (_supportEventJs.supportEvent[name]) {
            eventObj['ev-' + _supportEventJs.supportEvent[name]] = item;
            events[_supportEventJs.supportEvent[name]] = 0; // root element代理之后设置为true
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
    var rosettaChildren = obj.rosettaChildren;
    var root = obj.root;

    (rosettaChildren || []).map(function (item) {
        var id = item.elemID;

        var dom = query('[elemID="' + id + '"][class~="' + item.type + '"]', root);
        dom[0].rObj = item;
        item.root = dom[0];

        updateChildElemRoot(item);
    });
}

/*
 * @function
 *
 */

function appendRoot(dom, parent, ifReplace) {
    var classes = parent.getAttribute('class') || '';

    if (ifReplace == true) {
        var v = dom.getAttribute('class');
        dom.setAttribute('class', (v + ' ' + classes).replace(/r-invisible/g, ''));
        parent.parentElement.replaceChild(dom, parent);
    } else {
        parent.appendChild(dom);
        parent.setAttribute('class', classes.replace(/r-invisible/g, ''));
    }
}

/*
 *@function handleContent, put children into right place in the content
 * @param {array} contents contains children dom as an array
 */

function handleContent(rObj, _shouldReplacedContent) {
    var contents = query('content', rObj.root);

    (contents || []).map(function (content, index) {
        var parent = getParent(content) || rObj.root;
        var num = parent.getAttribute('shouldReplacedContent');
        var children = _shouldReplacedContent[parseInt(num)];
        var newWrapper = _utilsJs.document.createElement(_utilsJs.defaultTag);
        newWrapper.setAttribute('class', 'content');

        var tmp = _utilsJs.document.createDocumentFragment();
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

        if (newWrapper.childNodes.length > 0) {
            content.parentElement.replaceChild(newWrapper, content);
        } // !important! :don't remove content node ,because it will cause vdom diff error
    });
}

/*
 * @function
 *
 */

function handleEvent(obj, _shouldDelegateEvents) {
    function bindEvent(childObj) {
        // 每个子element需要代理的事件
        var events = childObj.shouldDelegateEvents;
        var root = childObj.root;

        root.bindedEvent = root.bindedEvent || {};

        for (var type in events) {

            (function (eventName) {
                if (root && !root.bindedEvent[eventName]) {
                    if (root.addEventListener) {
                        root.addEventListener(eventName, eventRealCB, true);
                    } else {
                        root.attachEvent('on' + eventName, eventRealCB);
                    }
                    root.bindedEvent[eventName] = eventRealCB;
                }
            })(type);
        }
    }

    function handleChildren(obj) {
        bindEvent(obj);
        // 遍历每个子element
        (obj.rosettaChildren || []).map(function (childItem) {
            (function (childObj) {
                handleChildren(childObj);
            })(childItem);
        });
    }

    if (obj.isRosettaElem !== true) {
        window.shouldDelegateEvents = _shouldDelegateEvents;
        window.root = obj;
        handleChildren(window);
    } else {
        handleChildren(obj);
    }
}

function eventRealCB(e) {
    var root = e.currentTarget;
    var parent = e.target;
    var obj = root.rObj;

    function findCB(parent) {
        if (!parent) {
            return;
        }

        var realCallback = (0, _evStore2['default'])(parent)[e.type];
        if (!!realCallback) {
            var parentRElem = getParent(parent);
            if (parentRElem == root) {
                realCallback.call(obj, e);
            }
        } else {
            parent = parent.parentElement;
            findCB(parent);
        }
    }

    findCB(parent);
}

/*
 * @function getPatches
 * @param obj
 * @param oldTree
 */

function getPatches(rObj, opts) {
    var obj = (0, _utilsJs.extend)({}, rObj);
    var oldTree = obj.vTree;
    // 生成新vtree和patches
    var newTree = obj.__t(obj, obj.$);
    var oldAttrs = oldTree.properties.attributes;
    var newAttrs = newTree.properties.attributes;

    (0, _utilsJs.extend)(newAttrs, {
        isRosettaElem: oldAttrs.isRosettaElem,
        shouldReplacedContent: oldAttrs.shouldReplacedContent,
        elemID: oldAttrs.elemID,
        'class': oldAttrs['class'],
        id: oldAttrs['id']
    }, true);

    return {
        newTree: newTree,
        patches: (0, _virtualDomDiff2['default'])(oldTree, newTree, {
            document: _utilsJs.document
        })
    };
}

/*
 * @function updateRosettaChildren : 将newObj中已经在oldObj中的替换为oldObj的值
 * @param oldObj
 * @param newObj
 *
 */

function updateRosettaChildren(oldRChildren, newRChildren) {
    // var oldLen = oldRChildren.length;

    // (newRChildren || []).map((itemChild, index) => {
    //     if (index >= oldLen) {
    //         oldRChildren.push(itemChild);
    //     }
    // });

    // return oldRChildren;
    return newRChildren;
}

function findRosettaTag() {
    var elems = [];
    if (!!_utilsJs.document.getElementsByClassName) {
        elems = _utilsJs.document.getElementsByClassName('r-element');
    } else if (!!_utilsJs.document.querySelectorAll) {
        elems = _utilsJs.document.querySelectorAll('.r-element');
    } else {
        var doms = _utilsJs.document.getElementsByTagName('*');
        for (var i = 0; i < doms.length; i++) {
            var item = doms[i];
            if (item.tagName.toLowerCase().indexOf('r-') >= 0) {
                elems.push(item);
            }
        }
    }

    return elems;
}

function classNameToClass(opts) {
    if (opts && opts.className) {
        var oldO = (opts['class'] || '').split(' ');
        var newO = opts.className.split(' ');
        opts['class'] = oldO.concat(newO).join(' ');
        delete opts.className;
    }

    return opts;
}

},{"./supportEvent.js":8,"./utils.js":9,"ev-store":11,"virtual-dom/create-element":14,"virtual-dom/diff":15,"virtual-dom/h":16}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.htmlImport = htmlImport;

var _utilsJs = require('./utils.js');

/**
 *
 *  file: htmlimport.js
 *  version: 1.0.0
 *  update: 2015.7.20
 *
 */

var head = _utilsJs.document.getElementsByTagName('head')[0],
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

    var script = _utilsJs.document.createElement('script');

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

    var link = _utilsJs.document.createElement('link');

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

        var link = _utilsJs.document.createElement('link');
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

},{"./utils.js":9}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
/*@require ./rosetta.css*/

/**
 * Rosetta - webcomponents like javascript library accelerate UI development
 * version 1.1.1
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

var _supportEventJs = require('./supportEvent.js');

var _utilsJs = require('./utils.js');

var _elementUtilsJs = require('./elementUtils.js');

// vdom relavent

var _virtualDomH = require('virtual-dom/h');

var _virtualDomH2 = _interopRequireDefault(_virtualDomH);

var _virtualDomCreateElement = require('virtual-dom/create-element');

var _virtualDomCreateElement2 = _interopRequireDefault(_virtualDomCreateElement);

// define private instances
var _allRendered = false; // 调用init的开始置为false，本次渲染所有组件render完毕就是true；如果存在因未定义而未渲染的也算作是true，因此可以理解为“本次符合渲染条件的都渲染完了”
var _refers = {}; // to store ref of Rosetta element instance in Rosetta
var _elemClass = {};
var _shouldReplacedContent = [];
var _shouldDelegateEvents = {};

/*
 * @function start parse document and render rosetta element
 */
function init() {
    // 找到页面的r-xxx元素
    // 如果是Rosetta已经注册的元素类型，则create、render
    _allRendered = false;
    var elems = (0, _elementUtilsJs.findRosettaTag)();
    var i = 0;

    for (; i < elems.length; i++) {
        var item = elems[i];
        var type = item.tagName.toLowerCase();
        var options = {};
        var attrs = item.attributes || {};
        var children = [].slice.call(item.childNodes);
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
    _elementUtilsJs.trigger.call(Rosetta, 'ready');
}

/*
 * @function to create rosetta element obj
 * @param {string} type, type of rosetta element
 * @param {object} initArr, attributes of the newly created element
 * @return {object} vTree, contains referer of rosetta instance
 */
function create(type, initAttr) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
    }

    if (!(0, _utilsJs.isString)(type)) {
        return;
    }
    var vTree = '';
    var l = children.length;
    var len = undefined;

    initAttr = initAttr || {};
    initAttr = (0, _elementUtilsJs.classNameToClass)(initAttr);

    if (l > 0) {
        len = children[l - 1];
    }
    if (typeof len === 'number') {
        children = [].slice.call(children, 0, l - 1);
    } else {
        len = 0;
    }

    len = len || 0;
    children = (0, _utilsJs.toPlainArray)(children);

    if (type.indexOf('-') < 0) {
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
        (0, _utilsJs.extend)(_shouldDelegateEvents, events, true);

        return vTree;
    } else {
        // 查找是否存在class
        var ElemClass = getElemClass(type);
        if (!ElemClass) {
            return false;
        }

        // 生成rosetta elem的id
        // var elemID = len++;
        var elemID = Math.random();

        // 生成element实例
        var elemObj = new ElemClass();

        // 设置name为initAttr.ref的值
        elemObj.name = initAttr.ref ? initAttr.ref : '';
        // 将initAttr转换为对应this.properties的type的attr真实值，并处理好vtree要求的事件属性格式
        var result = (0, _elementUtilsJs.handleAttr)(initAttr, elemObj);
        var attr = result.attr;
        var eventObj = result.eventObj;
        var events = result.events; // 设置id，设置elem实例的property为attribute
        elemObj.elemID = elemID;

        // 生成vtree
        vTree = elemObj.__t(elemObj, elemObj.$);

        // 处理children，将children存起来，方便根节点render的时候统一处理children content的事情
        // rosetta节点的children都需要走content过滤的逻辑
        children.map(function (item, index) {
            if (!item.nodeType) {
                children[index] = (0, _virtualDomCreateElement2['default'])(item, {
                    document: _utilsJs.document
                });
            }
        });

        // 给当前的vtree序列号，便于根节点知道要把children插入到哪个content
        // 疑似bug，需要重点单测
        if (!!children) {
            _shouldReplacedContent.push(children);
        }

        // 更新rosetta element节点的属性值，因为rosetta element在编译的时候__t里有自动生成的代码，于是只能外围更新了
        (0, _utilsJs.extend)(vTree.properties.attributes, {
            shouldReplacedContent: _shouldReplacedContent.length - 1,
            isRosettaElem: true,
            'class': (vTree.properties.attributes['class'] + ' ' + (initAttr['class'] || '')).trim(),
            elemID: elemID,
            id: initAttr['id']
        }, true);

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
    if (vTree === undefined) {
        init();
        return;
    }

    // 处理parentDOM
    if ((0, _utilsJs.isString)(parentDOM)) {
        parentDOM = qurey(parentDOM)[0];
    }

    // 生成dom
    var dom = (0, _virtualDomCreateElement2['default'])(vTree, {
        document: _utilsJs.document
    });

    // 从vtree获得rosetta element instance
    var rObj = vTree.rObj;

    if (!parentDOM) {
        return;
    }

    if (!!rObj && rObj.isRosettaElem == true) {
        dom.rObj = rObj;
        rObj.root = dom;
        // 处理content
        (0, _elementUtilsJs.handleContent)(rObj, _shouldReplacedContent);
        // 疑似bug
        _shouldReplacedContent = [];
        // 更新内部dom节点的ref
        (0, _elementUtilsJs.updateRefs)(rObj);
        // 更新自己的ref到rosetta
        setRef(rObj.ref, rObj);

        // 派发element的ready事件（已经有dom，但是并未appedn到父节点上）
        (0, _elementUtilsJs.triggerChildren)(rObj, 'ready');
        rObj.ready.call(rObj);
        rObj.fire('ready', rObj);

        // 更新dom
        (0, _elementUtilsJs.appendRoot)(dom, parentDOM, ifReplace);
        // 更新内部rosetta element instance的root（render前都是虚拟dom，嵌套的子element实际没有dom类型的root）
        (0, _elementUtilsJs.updateChildElemRoot)(rObj);
        // 处理事件绑定: 遍历每个子rosetta element绑定事件，绑定自己的事情
        (0, _elementUtilsJs.handleEvent)(rObj);

        // 派发attached事件相关
        (0, _elementUtilsJs.triggerChildren)(rObj, _lifeEventsJs.ATTACHED);
        rObj.attached.call(rObj);
        rObj.fire(_lifeEventsJs.ATTACHED, rObj);
        return rObj;
    } else {
        // 处理事件代理
        (0, _elementUtilsJs.handleEvent)(_utilsJs.document, _shouldDelegateEvents);
        _shouldDelegateEvents = {};
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
            !ifOnce && _elementUtilsJs.bind.call(Rosetta, 'ready', cb, null, ifOnce);
        } else {
            _elementUtilsJs.bind.call(Rosetta, 'ready', cb, null, ifOnce);
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
        detached: function() {}
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
    _htmlImport.htmlImport.factoryMap[opts.__rid] = true;
    return newClass;
}

(0, _utilsJs.extend)(Rosetta, {
    'ref': getRef,

    render: render,
    create: create,
    ready: ready,

    'import': _htmlImport.htmlImport,

    'config': _htmlImport.htmlImport.resourceMap
});

exports['default'] = Rosetta;
module.exports = exports['default'];

},{"./elementUtils.js":2,"./htmlImport":3,"./lifeEvents.js":4,"./rosettaElement.js":6,"./supportEvent.js":8,"./utils.js":9,"virtual-dom/create-element":14,"virtual-dom/h":16}],6:[function(require,module,exports){
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

// vdom relavent

var _virtualDomPatch = require('virtual-dom/patch');

var _virtualDomPatch2 = _interopRequireDefault(_virtualDomPatch);

var _virtualDomCreateElement = require('virtual-dom/create-element');

var _virtualDomCreateElement2 = _interopRequireDefault(_virtualDomCreateElement);

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
 * @param {object} opts - new value of properties for updating
 */
function update(opts) {
    var rObj = this;
    var oldTree = this.vTree;
    var rootNode = this.root;
    var type = this.type;
    var attr = {};
    var flag = false;

    // 判断是不是更新的数据和已有的数据存在不同
    for (var key in opts) {
        if (this.__config[key] != opts[key]) {
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

    var oldRChildren = rObj.rosettaChildren;
    rObj.rosettaChildren = [];

    var result = (0, _elementUtilsJs.getPatches)(rObj, opts);
    var patches = result.patches;
    var newTree = result.newTree;

    rObj.vTree = newTree;
    newTree.rObj = rObj;

    // 更新树
    this.root = (0, _virtualDomPatch2['default'])(rootNode, patches, {
        document: _utilsJs.document
    });

    (0, _elementUtilsJs.updateChildElemRoot)(rObj);
    // 更新ref的引用
    (0, _elementUtilsJs.updateRefs)(rObj);
    this.root.rObj = rObj;

    // 更新事件代理(不用移除旧的事件绑定)
    (0, _elementUtilsJs.handleEvent)(rObj);

    // 执行attributechange相关逻辑
    (0, _elementUtilsJs.triggerChildren)(this, _lifeEventsJs.ATTRIBUTECHANGE);
    this.attributeChanged.call(this);
    this.fire(_lifeEventsJs.ATTRIBUTECHANGE, this);
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

    // 触发detached相关事件
    (0, _elementUtilsJs.triggerChildren)(this, _lifeEventsJs.DETACHED);
    this.detached.call(this);
    this.fire(_lifeEventsJs.DETACHED, this);
    this.isAttached = false;
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
    var childrenLen = this.rosettaChildren.length;
    var vTree = Rosetta.create.apply(Rosetta, [elemType, attr].concat([].slice.call(arguments, 2)).concat(childrenLen));

    // 将此vtree的引用放在this的中，保存attr.ref的引用
    if (!!attr && !!attr.ref) {
        // 疑似bug
        this.$[attr.ref] = vTree;
    }

    // 如果该字节点为rosettaElement，则存储生成的字节点的到父节点this的rosettaChildren中存起来
    if (!!vTree && !!vTree.rObj && vTree.rObj.isRosettaElem == true) {
        // 将子节点为rosettaElem的放到rosettaChildren里
        // 根element需要知道内嵌子element
        this.rosettaChildren.push(vTree.rObj);

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

            'rosettaChildren': [],

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

        detached: function detached() {},

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

},{"./elementUtils.js":2,"./lifeEvents.js":4,"./supportEvent.js":8,"./utils.js":9,"virtual-dom/create-element":14,"virtual-dom/patch":24}],7:[function(require,module,exports){
'use strict';

var _utilsJs = require('./utils.js');

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
})(undefined, function () {

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
    var isCallable; /* inlined from https://npmjs.com/is-callable */
    var fnToStr = Function.prototype.toString,
        tryFunctionObject = function tryFunctionObject(value) {
        try {
            fnToStr.call(value);
            return true;
        } catch (e) {
            return false;
        }
    },
        fnClass = '[object Function]',
        genClass = '[object GeneratorFunction]';
    isCallable = function isCallable(value) {
        if (typeof value !== 'function') {
            return false;
        }
        if (hasToStringTag) {
            return tryFunctionObject(value);
        }
        var strClass = to_string.call(value);
        return strClass === fnClass || strClass === genClass;
    };
    var isRegex; /* inlined from https://npmjs.com/is-regex */
    var regexExec = RegExp.prototype.exec,
        tryRegexExec = function tryRegexExec(value) {
        try {
            regexExec.call(value);
            return true;
        } catch (e) {
            return false;
        }
    },
        regexClass = '[object RegExp]';
    isRegex = function isRegex(value) {
        if (typeof value !== 'object') {
            return false;
        }
        return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass;
    };
    var isString; /* inlined from https://npmjs.com/is-string */
    var strValue = String.prototype.valueOf,
        tryStringObject = function tryStringObject(value) {
        try {
            strValue.call(value);
            return true;
        } catch (e) {
            return false;
        }
    },
        stringClass = '[object String]';
    isString = function isString(value) {
        if (typeof value === 'string') {
            return true;
        }
        if (typeof value !== 'object') {
            return false;
        }
        return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass;
    };

    var isArguments = function isArguments(value) {
        var str = to_string.call(value);
        var isArgs = str === '[object Arguments]';
        if (!isArgs) {
            isArgs = !isArray(value) && value !== null && typeof value === 'object' && typeof value.length === 'number' && value.length >= 0 && isCallable(value.callee);
        }
        return isArgs;
    };

    /* inlined from http://npmjs.com/define-properties */
    var defineProperties = (function (has) {
        var supportsDescriptors = Object.defineProperty && (function () {
            try {
                Object.defineProperty({}, 'x', {});
                return true;
            } catch (e) {
                /* this is ES3 */
                return false;
            }
        })();

        // Define configurable, writable and non-enumerable props
        // if they don't exist.
        var defineProperty;
        if (supportsDescriptors) {
            defineProperty = function (object, name, method, forceAssign) {
                if (!forceAssign && name in object) {
                    return;
                }
                Object.defineProperty(object, name, {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: method
                });
            };
        } else {
            defineProperty = function (object, name, method, forceAssign) {
                if (!forceAssign && name in object) {
                    return;
                }
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
    })(ObjectPrototype.hasOwnProperty);

    //
    // Util
    // ======
    //

    /* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
    var isPrimitive = function isPrimitive(input) {
        var type = typeof input;
        return input === null || type !== 'object' && type !== 'function';
    };

    var ES = {
        // ES5 9.4
        // http://es5.github.com/#x9.4
        // http://jsperf.com/to-integer
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
        ToInteger: function ToInteger(num) {
            var n = +num;
            if (n !== n) {
                // isNaN
                n = 0;
            } else if (n !== 0 && n !== 1 / 0 && n !== -(1 / 0)) {
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
        ToObject: function ToObject(o) {
            /*jshint eqnull: true */
            if (o == null) {
                // this matches both null and undefined
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
        bind: function bind(that) {
            // .length is 1
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
            var binder = function binder() {

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

                    var result = target.apply(this, args.concat(array_slice.call(arguments)));
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
                    return target.apply(that, args.concat(array_slice.call(arguments)));
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
    })();
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
    })();
    defineProperties(ArrayPrototype, {
        splice: function splice(start, deleteCount) {
            if (arguments.length === 0) {
                return [];
            }
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
    defineProperties(Array, {
        isArray: isArray
    });

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
                if (typeof context !== 'object') {
                    properlyBoxesNonStrict = false;
                }
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
    var hasDontEnumBug = !({
        'toString': null
    }).propertyIsEnumerable('toString'),
        hasProtoEnumBug = (function () {}).propertyIsEnumerable('prototype'),
        hasStringEnumBug = !owns('x', '0'),
        dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
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
            if (isStr && hasStringEnumBug || isArgs) {
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
    })(1, 2);
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
    })();

    if (!replaceReportsGroupsCorrectly) {
        StringPrototype.replace = function replace(searchValue, replaceValue) {
            var isFn = isCallable(replaceValue);
            var hasCapturingGroups = isRegex(searchValue) && /\)[*?]/.test(searchValue.source);
            if (!isFn || !hasCapturingGroups) {
                return str_replace.call(this, searchValue, replaceValue);
            } else {
                var wrappedReplaceValue = function wrappedReplaceValue(match) {
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
});

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
        _slice.call(_utilsJs.document.documentElement);
    } catch (e) {
        // Fails in IE < 9
        // This will work for genuine arrays, array-like objects,
        // NamedNodeMap (attributes, entities, notations),
        // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
        // and will not fail on other DOM objects (as do DOM elements in IE < 9)
        Array.prototype.slice = function (begin, end) {
            // IE < 9 gets unhappy with an undefined end argument
            end = typeof end !== 'undefined' ? end : this.length;

            // For native Array objects, we use the native slice function
            if (Object.prototype.toString.call(this) === '[object Array]') {
                return _slice.call(this, begin, end);
            }

            // For array like object we handle it ourselves.
            var i,
                cloned = [],
                size,
                len = this.length;

            // Handle negative value for "begin"
            var start = begin || 0;
            start = start >= 0 ? start : len + start;

            // Handle negative value for "end"
            var upTo = end ? end : len;
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
})();

},{"./utils.js":9}],8:[function(require,module,exports){
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
exports.supportEvent = supportEvent;

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.isString = isString;
exports.isDomNode = isDomNode;
exports.isWindow = isWindow;
exports.isPlainObject = isPlainObject;
exports.isArray = isArray;
exports.isObject = isObject;
exports.isFunction = isFunction;
exports.extend = extend;
exports.camelize = camelize;
exports.toPlainArray = toPlainArray;
exports.deserializeValue = deserializeValue;
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

var document = window.boost || window.document;
exports.document = document;
var defaultTag = window.boost ? 'View' : 'div';
exports.defaultTag = defaultTag;

},{}],10:[function(require,module,exports){

},{}],11:[function(require,module,exports){
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

},{"individual/one-version":13}],12:[function(require,module,exports){
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
},{}],13:[function(require,module,exports){
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

},{"./index.js":12}],14:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":26}],15:[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":46}],16:[function(require,module,exports){
var h = require("./virtual-hyperscript/index.js")

module.exports = h

},{"./virtual-hyperscript/index.js":33}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"dup":11,"individual/one-version":20}],19:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"dup":12}],20:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"./index.js":19,"dup":13}],21:[function(require,module,exports){
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
},{"min-document":10}],22:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],23:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],24:[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":29}],25:[function(require,module,exports){
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
                if (attrName == 'checked') {
                    node.checked = false;
                }
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
                if (attrName == 'value' || attrName == 'checked') {
                    node[attrName] = attrValue;
                } else {
                    node.setAttribute(attrName, attrValue)
                }
            }
        }

        return
    }

    if (previousValue && isObject(previousValue) &&
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

},{"../vnode/is-vhook.js":37,"is-object":22}],26:[function(require,module,exports){
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

},{"../vnode/handle-thunk.js":35,"../vnode/is-vnode.js":38,"../vnode/is-vtext.js":39,"../vnode/is-widget.js":40,"./apply-properties":25,"global/document":21}],27:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],28:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var render = require("./create-element")
var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = render(vText, renderOptions)

        if (parentNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, bIndex) {
    var children = []
    var childNodes = domNode.childNodes
    var len = childNodes.length
    var i
    var reverseIndex = bIndex.reverse

    for (i = 0; i < len; i++) {
        children.push(domNode.childNodes[i])
    }

    var insertOffset = 0
    var move
    var node
    var insertNode
    var chainLength
    var insertedLength
    var nextSibling
    for (i = 0; i < len;) {
        move = bIndex[i]
        chainLength = 1
        if (move !== undefined && move !== i) {
            // try to bring forward as long of a chain as possible
            while (bIndex[i + chainLength] === move + chainLength) {
                chainLength++;
            }

            // the element currently at this index will be moved later so increase the insert offset
            if (reverseIndex[i] > i + chainLength) {
                insertOffset++
            }

            node = children[move]
            insertNode = childNodes[i + insertOffset] || null
            insertedLength = 0
            while (node !== insertNode && insertedLength++ < chainLength) {
                domNode.insertBefore(node, insertNode);
                node = children[move + insertedLength];
            }

            // the moved element came from the front of the array so reduce the insert offset
            if (move + chainLength < i) {
                insertOffset--
            }
        }

        // element at this index is scheduled to be removed so increase insert offset
        if (i in bIndex.removes) {
            insertOffset++
        }

        i += chainLength
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        console.log(oldRoot)
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":40,"../vnode/vpatch.js":43,"./apply-properties":25,"./create-element":26,"./update-widget":30}],29:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches) {
    return patchRecursive(rootNode, patches)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions) {
        renderOptions = { patch: patchRecursive }
        if (ownerDocument !== document) {
            renderOptions.document = ownerDocument
        }
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./dom-index":27,"./patch-op":28,"global/document":21,"x-is-array":23}],30:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":40}],31:[function(require,module,exports){
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

},{"ev-store":18}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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

},{"../vnode/is-thunk":36,"../vnode/is-vhook":37,"../vnode/is-vnode":38,"../vnode/is-vtext":39,"../vnode/is-widget":40,"../vnode/vnode.js":42,"../vnode/vtext.js":44,"./hooks/ev-hook.js":31,"./hooks/soft-set-hook.js":32,"./parse-tag.js":34,"x-is-array":23}],34:[function(require,module,exports){
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

},{"browser-split":17}],35:[function(require,module,exports){
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

},{"./is-thunk":36,"./is-vnode":38,"./is-vtext":39,"./is-widget":40}],36:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],37:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],38:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":41}],39:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":41}],40:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],41:[function(require,module,exports){
module.exports = "1"

},{}],42:[function(require,module,exports){
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

},{"./is-thunk":36,"./is-vhook":37,"./is-vnode":38,"./is-widget":40,"./version":41}],43:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":41}],44:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":41}],45:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
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

},{"../vnode/is-vhook":37,"is-object":22}],46:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true;
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var bChildren = reorder(aChildren, b.children)

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (bChildren.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, bChildren.moves))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b);
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true;
        }
    }

    return false;
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {

    var bKeys = keyIndex(bChildren)

    if (!bKeys) {
        return bChildren
    }

    var aKeys = keyIndex(aChildren)

    if (!aKeys) {
        return bChildren
    }

    var bMatch = {}, aMatch = {}

    for (var aKey in bKeys) {
        bMatch[bKeys[aKey]] = aKeys[aKey]
    }

    for (var bKey in aKeys) {
        aMatch[aKeys[bKey]] = bKeys[bKey]
    }

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen
    var shuffle = []
    var freeIndex = 0
    var i = 0
    var moveIndex = 0
    var moves = {}
    var removes = moves.removes = {}
    var reverse = moves.reverse = {}
    var hasMoves = false

    while (freeIndex < len) {
        var move = aMatch[i]
        if (move !== undefined) {
            shuffle[i] = bChildren[move]
            if (move !== moveIndex) {
                moves[move] = moveIndex
                reverse[moveIndex] = move
                hasMoves = true
            }
            moveIndex++
        } else if (i in aMatch) {
            shuffle[i] = undefined
            removes[i] = moveIndex++
            hasMoves = true
        } else {
            while (bMatch[freeIndex] !== undefined) {
                freeIndex++
            }

            if (freeIndex < len) {
                var freeChild = bChildren[freeIndex]
                if (freeChild) {
                    shuffle[i] = freeChild
                    if (freeIndex !== moveIndex) {
                        hasMoves = true
                        moves[freeIndex] = moveIndex
                        reverse[moveIndex] = freeIndex
                    }
                    moveIndex++
                }
                freeIndex++
            }
        }
        i++
    }

    if (hasMoves) {
        shuffle.moves = moves
    }

    return shuffle
}

function keyIndex(children) {
    var i, keys

    for (i = 0; i < children.length; i++) {
        var child = children[i]

        if (child.key !== undefined) {
            keys = keys || {}
            keys[child.key] = i
        }
    }

    return keys
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":35,"../vnode/is-thunk":36,"../vnode/is-vnode":38,"../vnode/is-vtext":39,"../vnode/is-widget":40,"../vnode/vpatch":43,"./diff-props":45,"x-is-array":23}]},{},[1]);
