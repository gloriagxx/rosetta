/*@require ./rosetta.css*/
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

    ATTACHED = 'attached',
    DETACHED = 'detached',
    CREATED = 'created',
    ATTRIBUTECHANGE = 'attributeChange',
    refers = {},
    _elemClass = {},
    allRendered = false;


function bind(type, listener, context, ifOnce) {
    this.events = this.events || {};
    var queue = this.events[type] || (this.events[type] = []);
    queue.push({
        f: listener,
        o: context,
        ifOnce: ifOnce
    });
}

function fire(type) {
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


function createElemClass(type, renderFunc) {
    function update(options) {
        // extend(this.attrs, options, true);
        var children = this.children,
            attrs = this.root.attributes,
            root = this.root,
            type = this.type,
            attr = {};

        for (var n = 0; n < attrs.length; n++) {
            var item = attrs[n];
            attr[item.name] = item.nodeValue;
        }

        attr = toType(attr || '') || {};
        extend(this.attrs, attr, options, true);
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

function ref(key, value) {
    if (value) {
        refers[key] = value;
    } else {
        return refers[key];
    }
}

function getElemClass(type) {
    return _elemClass[type];
}

function addElemClass(type, elemClass) {
    _elemClass[type] = elemClass
}

function addElem(name, elemObj) {
    refers[name] = elemObj;
}

function render(obj, root, force) {
    if (isString(root)) {
        root = query(root)[0];
    }

    if (!obj) {
        return;
    }

    if (obj.isRosettaElem == true) {
        obj.root = obj.__t(obj, obj.attrs, obj.ref);

        replaceContent(obj);
    } else if (isDomNode(obj)) {
        obj.root = obj;
    }

    for (var i in obj.attrs) {
        var item = obj.attrs[i];
        if (!supportEvent[i]) {
            if (!!item) {
                if (!isString(item)) {
                    item = objToString(item);
                }
                obj.root.setAttribute(i, item);
            }
        } else {
            if (obj.root.addEventListener) {
                obj.root.addEventListener(supportEvent[i], item, false);
            } else {
                obj.root.attachEvent('on' + supportEvent[i], item);
            }
        }
    }

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

    if (obj.isRosettaElem == true) {
        obj.isAttached = true;
        var type = obj.type;
        newClass = (obj.root.getAttribute('class') || '')? (obj.root.getAttribute('class') || '') + ' ' + type : type;

        obj.root.setAttribute('class', newClass.replace(/r-invisible/g, ''));
        obj.trigger(ATTACHED, obj);
        return obj.root;
    }
}

// create的trigger之前执行renderfunc
function create(type, attr) {
    var children = [].slice.call(arguments, 2),
        children = toPlainArray(children),
        result = null;

    attr = toType(attr || '') || {};

    if (isString(type)) {
        if (isOriginalTag(type)) {
            var node = document.createElement(type);
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
                // content的判断

                render(item, result);
            }
        }

        if (isString(type) && !isOriginalTag(type)) {
            result.renderFunc(result);
            result.name = attr.ref ? attr.ref : '';
            extend(result.attrs, attr, true);

            if (!!attr.ref) {
                addElem(attr.ref, result);
            }

            result.trigger(CREATED, result);
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

    addElem: addElem,

    render: render,

    create: create,

    register: register,

    ready: ready
};

module.exports = Rosetta;


