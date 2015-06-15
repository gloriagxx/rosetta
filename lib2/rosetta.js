// how to deal with subElements lifecycle
// how to delegate event pf subElements

var _refers = {},
    _elemClass = {},
    _allRendered = false;

var supportEvent = require('./supportEvent.js'),
    utils = require('./utils.js'),
    isArray = utils.isArray,
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
    deserializeValue = utils.deserializeValue,
    typeHandlers = utils.typeHandlers,

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
        // deserialize Boolean or Number values from attribute
        var value = deserializeValue(value, currentValue);
        // only act if the value has changed
        if (value !== currentValue) {
            // install new value (has side-effects)
            this.attrs[name] = value;
        }
  }

}
function updatevNodeContent(vNodeFactory, contentChildren) {

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

        var attrs = item.getAttribute('data');

        if (type.indexOf('r-') == 0) {
            var children = item.children,
                childrenArr = [].slice.call(children);

            options = JSON.parse(attrs) || {};

            var obj = Rosetta.render(Rosetta.create(type, options, childrenArr), item, true);

            if (options && options.ref) {
                ref(options.ref, obj);
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

function triggerChildren(obj, type) {
    (obj.rosettaElems || []).map(function(item, index) {
        triggerChildren(item.rosettaElems || []);

        item.trigger(type, item);
    });
}

function appendRoot(dom, root, force) {
    root.parentElement.replaceChild(dom, root);
}

function getRealAttr(attr, toRealType) {
    var eventObj = {};

    for (var i in attr) {
        var item = attr[i];

        // if (toRealType === true) {
        //     attributeToAttrs.call(this, i, item);
        // }

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


function render(vTree, root, force) {
    if (isString(root)) {
        root = query(root)[0];
    }

    var obj = vTree.realObj;

    if (!vTree || !root) {
        return;
    }

    var dom = createElement(vTree);
    var classes = root.getAttribute('class');

    obj.root = dom;

    var contents = query('content', obj.root);
    (contents || []).map(function(content, index){
        var parent = $(content).parents('[isrosettaelem=true]')[0];
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
        var selector = content.getAttribute('selector');
        var result = query(selector, tmp);


        (children || []).map(function(child, i) {
            if (result.indexOf(child) >= 0) {
                newWrapper.appendChild(child);
            }
        });

        if ($(newWrapper).children().length <= 0) {
            newWrapper.parentElement.removeChild(newWrapper);
        }
    });

    for (var key in obj.refs) {
        var node = query('[ref="' + key + '"]', dom);
        obj.refs[key] = node;
    }

    appendRoot(obj.root, root, force);

    if (obj.isRosettaElem == true) {
        var v = dom.getAttribute('class');

        dom.setAttribute('class', (v + ' ' + classes).replace(/r-invisible/g, ''));

        obj.isAttached = true;

        triggerChildren(obj, ATTACHED);

        obj.trigger(ATTACHED, obj);
    }
    return obj;
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
        elemObj.attrs = attr;

        vTree = elemObj.__t(elemObj, elemObj.attrs, elemObj.refs);

        vTree.properties.attributes.isrosettaelem = true;
        if (childrenContent) {
            childrenContent.map(function(item, index) {
                if (item.properties) {
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


var Rosetta = {
    init: init,

    ref: ref,

    elemClass: elemClass,

    render: render,

    create: create,

    register: register,

    ready: ready,

    triggerChildren: triggerChildren

};

module.exports = Rosetta;