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
        obj.holder[item.getAttribute('select')] = item;
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
                container.setAttribute('select', i);
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


