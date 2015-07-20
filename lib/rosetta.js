/*@require ./rosetta.css*/
/** Rosetta v1.0.1**/

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

    htmlImport = require('./htmlImport.js'),

    lifeEvents = require('./lifeEvents.js'),
    ATTACHED = lifeEvents.ATTACHED,
    DETACHED = lifeEvents.DETACHED,
    CREATED = lifeEvents.CREATED
    ATTRIBUTECHANGE = lifeEvents.ATTRIBUTECHANGE;

var _shouldReplacedContent = [];

var h = require('./virtual-dom/h'),
    createElement = require('./virtual-dom/create-element');

var Delegator = require('./dom-delegator');
var createElementClass = require('./createElementClass.js');

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


function init() {
    var elems = [];
    _allRendered = false;

    var delegator = Delegator();

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

            var obj = Rosetta.render(Rosetta.create(type, options, childrenArr), item, true);
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

function getParent(dom) {
    var parent = dom.parentElement;
    if (!parent) {
        return ;
    }

    if (parent.getAttribute('isrosettaelem') == 'true') {
        return parent;
    } else {
        return getParent(parent);
    }
}

function render(vTree, root, force) {
    if (!vTree) {
        init();
        return;
    }

    if (isString(root)) {
        root = query(root)[0];
    }

    var obj = vTree.realObj;

    if (!vTree || !root) {
        return;
    }

    var dom = createElement(vTree);

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

        appendRoot(dom, root, force);

        obj.isAttached = true;

        ref(obj.attrs.ref, obj);

        triggerChildren(obj, ATTACHED);

        obj.trigger(ATTACHED, obj);

        return obj;
    } else {
        appendRoot(dom, root, force);
    }

    // dom and children events delegation
}


/**
 * Returns vTree of newly created element instance
 *
 * @method create
 * @return {Object} vTree
 */

function create(type, attr) {
    if (!isString(type)) {
        return;
    }

    attr = attr || {};

    var childrenContent = [].slice.call(arguments, 2);

    childrenContent = toPlainArray(childrenContent);
    var vTree = '';

    if (isOriginalTag(type)) {
        var tmp = getRealAttr(attr);
        var eventObj = tmp.eventObj;
        attr = tmp.attr;

        var newAttrs = extend({
            attributes: attr
        }, eventObj, true);

        vTree = h.call(this, type, newAttrs, childrenContent);

        return vTree;
    } else {
        var NewClass = elemClass(type),
            elemObj = null;

        if (!NewClass) {
            return;
        }

        elemObj = new NewClass();

        elemObj.renderFunc(elemObj);


        elemObj.name = attr.ref ? attr.ref && ref(attr.ref, elemObj) : '';

        getRealAttr.call(elemObj, attr, true);
        elemObj.attrs = elemObj.attrs || attr;

        vTree = elemObj.__t(elemObj, elemObj.attrs, elemObj.$);

        vTree.properties.attributes.isrosettaelem = true;
        if (childrenContent) {
            childrenContent.map(function(item, index) {
                if (!item.nodeType) {
                    childrenContent[index] = createElement(item);
                }
            });

            _shouldReplacedContent.push(childrenContent);
            vTree.properties.attributes.shouldReplacedContent = _shouldReplacedContent.length - 1;
        }

        elemObj.vTree = vTree;
        elemObj.trigger(CREATED, elemObj);
        vTree.realObj = elemObj;

        return vTree;
    }
}

function register(type, renderFunc) {
    var newClass = createElementClass(type, renderFunc);

    elemClass(type, newClass);
    return newClass;
}

function ready(cb) {
    if (isFunction(cb)) {
        if (_allRendered == true) {
            cb();
        } else {
            bind.call(Rosetta, 'ready', cb);
        }
    }
}


var Rosetta = function(options) {
    var newClass = createElementClass(type, options);

    elemClass(type, newClass);
    return newClass;
};


extend(Rosetta, {
    'ref': ref,

    'render': render,

    'create': create,

    'ready': ready,

    'import': htmlImport
});

module.exports = Rosetta;