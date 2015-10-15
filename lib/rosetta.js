/*@require ./rosetta.css*/
/** Rosetta v1.0.2**/

var _refers = {},
    _elemClass = {},
    _allRendered = false;

var supportEvent = require('./supportEvent.js'),
    utils = require('./utils.js'),
    isArray = utils.isArray,
    query = utils.query,
    toType = utils.toType,
    extend = utils.extend,
    toPlainArray = utils.toPlainArray,
    isOriginalTag = utils.isOriginalTag,
    isDomNode = utils.isDomNode,
    isString = utils.isString,
    isFunction = utils.isFunction,
    bind = utils.bind,
    fire = utils.fire,
    deserializeValue = utils.deserializeValue,
    typeHandlers = utils.typeHandlers,
    updateRefs = utils.updateRefs,
    triggerChildren = utils.triggerChildren,


    htmlImport = require('./htmlImport.js'),
    lifeEvents = require('./lifeEvents.js'),

    ATTACHED = lifeEvents.ATTACHED,
    DETACHED = lifeEvents.DETACHED,
    CREATED = lifeEvents.CREATED,
    READY = lifeEvents.READY,
    ATTRIBUTECHANGE = lifeEvents.ATTRIBUTECHANGE;

var _shouldReplacedContent = [];

var h = require('./virtual-dom/h');
var createElement = require('./virtual-dom/create-element');

var createElementClass = require('./createElementClass.js');

var _eventDelegatorObj = {};

var EvStore = require("./virtual-dom/node_modules/ev-store")


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
            this.__config[name] = value;
            this[name] = value;
        }

        return value;
  }
}

/**
 *
 *
 *
 *
 */
function getRealAttr(attr, toRealType) {
    var eventObj = {};

    for (var i in attr) {
        var item = attr[i];

        if (toRealType === true) {
            attr[i] = attributeToProperty.call(this, i, item);
        }

        if (supportEvent[i]) {
            eventObj['ev-' + supportEvent[i]] = item;
            delete attr[i];
            Rosetta._eventDelegatorObj[supportEvent[i]] = true;
        }
    }

    attr = attr || {};

    return {
        eventObj: eventObj,
        attr: attr
    }
}


function init() {
    var elems = [];
    _allRendered = false;

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
            options = {};

        if (type.indexOf('r-') == 0) {
            var attrs = item.attributes || {};

            var children = item.children,
                childrenArr = [].slice.call(children);

            for(var n = 0; n < attrs.length; n++) {
                var k = attrs[n];
                options[k.name] = k.value;
            }

            if (elemClass(type)) {
                var obj = Rosetta.render(Rosetta.create(type, options, childrenArr), item, true);
            }
        }
    }

    _allRendered = true;

    fire.call(Rosetta, 'ready');
}


function ref(key, value) {
    if (!key) {
        return;
    }

    if (value != undefined) {
        _refers[key] = value;
    } else {
        return _refers[key];
    }
}

function elemClass(type, newClass) {
    if (newClass != undefined) {
        _elemClass[type] = newClass;
    } else {
        return _elemClass[type];
    }
}


function appendRoot(dom, root, force) {
    var classes = root.getAttribute('class');

    if (force == true) {
        var v = dom.getAttribute('class');
        dom.setAttribute('class', (v + ' ' + classes).replace(/r-invisible/g, ''));
        root.parentElement.replaceChild(dom, root);
    } else {
        root.appendChild(dom);
        root.setAttribute('class', classes.replace(/r-invisible/g, ''));
    }

}


function getParent(dom) {
    var parent = dom.parentElement;
    if (!parent) {
        return ;
    }

    if (parent.getAttribute('isRosettaElem') == 'true') {
        return parent;
    } else {
        return getParent(parent);
    }
}

function getID(currentDOM) {
    var id = currentDOM.getAttribute('rosettaElemID');
    if (!!id) {
        return id;
    } else {
        return getID(currentDOM.parentElement);
    }
}

function findContext(currentDOM, rootRosettaElem) {
    var id = getID(currentDOM);
    return rootRosettaElem.rosettaElems[id];
}

function eventDelegate(root, eventDelegatorObj) {
    var self = this;

    for (var type in eventDelegatorObj) {
        (function(eventName) {
            root.bindedEvent = root.bindedEvent || {};

            if (root.bindedEvent[eventName] !== true) {
                root.addEventListener(eventName, function(e) {
                    var parent = e.target;
                    function findCB(parent) {
                        if (parent == root || !parent) {
                            return;
                        }

                        var cb = EvStore(parent)[eventName];
                        if (!!cb) {
                            var context = findContext(parent, self);
                            cb.call(context, e);
                        } else {
                            parent = parent.parentElement;
                            findCB(parent);
                        }
                    }

                    findCB(parent);

                }, false);
                root.bindedEvent[eventName] = true;
            }

        })(type);
    }
}

function updateChildElemRoot(obj) {
    var rosettaElems = obj.rosettaElems;
    var root = obj.root;

    for (var id in rosettaElems) {
        var item = rosettaElems[id];

        var dom = query('[rosettaElemID="' + id + '"]', root);
        item.root = dom[0];
        console.log(dom);
    }
}

/**
 *
 * @function to render
 *
 */

function render(rTree, root, force) {
    if (!rTree) {
        init();
        return;
    }

    if (isString(root)) {
        root = query(root)[0];
    }

    var obj = rTree.realObj;

    if (!rTree || !root) {
        return;
    }

    var dom = createElement(rTree);

    if (obj && obj.isRosettaElem == true) {
        obj.root = dom;

        var contents = query('content', obj.root);

        (contents || []).map(function(content, index){
            var parent = getParent(content);
            var num = parent.getAttribute('shouldReplacedContent');
            var children = _shouldReplacedContent[parseInt(num)];

            var newWrapper = document.createElement('div');
            newWrapper.setAttribute('class', 'content');
            content.parentElement.replaceChild(newWrapper, content);

            var tmp = document.createDocumentFragment();
            for (var i = 0; i < children.length; i++) {
                var n = children[i];

                tmp.appendChild(n);
            }
            var selector = content.getAttribute('select');
            var result = query(selector, tmp);

            (children || []).map(function(child, i, arr) {
                var index = result.indexOf(child);
                if (index >= 0) {
                    newWrapper.appendChild(arr.splice(i, 1)[0]);
                }
            });

            if (newWrapper.children.length <= 0) {
                newWrapper.parentElement.removeChild(newWrapper);
            }
        });

        updateRefs(obj, dom);

        obj.ready.call(this);

        appendRoot(dom, root, force);

        obj.isAttached = true;

        ref(obj.__config.ref, obj);

        eventDelegate.call(obj, dom, Rosetta._eventDelegatorObj);
        Rosetta._eventDelegatorObj = {};

        updateChildElemRoot(obj);

        obj.attached.call(obj);

        triggerChildren(obj, ATTACHED);

        obj.fire(ATTACHED, obj);

        return obj;

    } else {

        eventDelegate.call(window, document, Rosetta._eventDelegatorObj);
        Rosetta._eventDelegatorObj = {};


        appendRoot(dom, root, force);
    }

    // dom and children events delegation
}


/**
 * Returns rTree of newly created element instance
 *
 * @function create
 * @param {string} type - type of element to be created
 * @param {object} attr - attributes for initialize custom element instance
 * @param {object} arguments[2...] - children of custom element instance
 * @return {HTMLDOMElement}
 */

function create(type, attr) {
    if (!isString(type)) {
        return;
    }

    attr = attr || {};

    var childrenContent = [].slice.call(arguments, 2);

    childrenContent = toPlainArray(childrenContent);
    var rTree = '';

    if (isOriginalTag(type)) {
        var tmp = getRealAttr(attr);
        var eventObj = tmp.eventObj;
        attr = tmp.attr;


        var newAttrs = extend({
            attributes: attr
        }, eventObj, true);

        rTree = h.call(this, type, newAttrs, childrenContent);

        return rTree;
    } else {
        var NewClass = elemClass(type),
            elemObj = null,
            rosettaElemID = Math.random();

        if (!NewClass) {
            return;
        }

        elemObj = new NewClass();

        elemObj.name = attr.ref ? attr.ref && ref(attr.ref, elemObj) : '';

        var realAttr = getRealAttr.call(elemObj, attr, true);

        extend(elemObj, realAttr.attr);

        rTree = elemObj.__t(elemObj, elemObj.$);

        rTree.properties.attributes.rosettaElemID = rosettaElemID;
        elemObj.rosettaElemID = rosettaElemID;

        if (childrenContent) {
            childrenContent.map(function(item, index) {
                if (!item.nodeType) {
                    childrenContent[index] = createElement(item);
                }
            });

            _shouldReplacedContent.push(childrenContent);
            rTree.properties.attributes.shouldReplacedContent = _shouldReplacedContent.length - 1;
        }

        elemObj.rTree = rTree;

        elemObj.created.call(elemObj);

        elemObj.fire(CREATED, elemObj);
        rTree.realObj = elemObj;

        // rTreeDom = createElement(rTree);
        // rTreeDom.rTree = rTree;

        return rTree;
    }
}


/**
 *
 * @function
 *
 */
function ready(cb, ifOnce) {
    if (isFunction(cb)) {
        ifOnce = ifOnce === true ? true : false;
        if (_allRendered == true) {
            cb();
            !ifOnce && bind.call(Rosetta, 'ready', cb, null, ifOnce);
        } else {
            bind.call(Rosetta, 'ready', cb, null, ifOnce);
        }
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

var Rosetta = function(options) {
    var type = options.is;
    var newClass = createElementClass(options);

    elemClass(type, newClass);
    htmlImport.factoryMap[options.__rid] = true;
    return newClass;
};


extend(Rosetta, {
    'ref': ref,

    'render': render,

    'create': create,

    'ready': ready,

    'import': htmlImport,

    'config': htmlImport.resourceMap,

    '_eventDelegatorObj': _eventDelegatorObj,

    'eventDelegate': eventDelegate
});


module.exports = Rosetta;