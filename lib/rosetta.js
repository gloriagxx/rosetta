var supportEvent = require('./supportEvent.js'),
    utils = require('./utils.js'),
    query = utils.query,
    toType = utils.toType,
    extend = utils.extend,
    toPlainArray = utils.toPlainArray,
    isOriginalTag = utils.isOriginalTag,
    isDomNode = utils.isDomNode,
    isString = utils.isString,

    ATTACHED = 'attached',
    DETACHED = 'detached',
    CREATED = 'created',
    ATTRIBUTECHANGE = 'attributeChange',
    refers = {},
    _elemClass = {};


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

        extend(attr, options, true);
        Rosetta.render(Rosetta.create(type, attr, children), root, true);
        this.trigger(ATTRIBUTECHANGE, this);
    }

    function destroy() {
        this.off();
        this.root.remove();
        delete ref(this.name);
        this.trigger(DETACHED, this);
    }

    function on(type, listener, context, ifOnce) {
        var queue = this.events[type] || (this.events[type] = []);
        queue.push({
            f: listener,
            o: context,
            ifOnce: ifOnce
        });
    }

    function trigger(type) {
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
    var elems = query('.r-element');
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

            var root = Rosetta.render(Rosetta.create(type, options, childrenArr), item, true),
                newClass = (root.getAttribute('class') || '')? (root.getAttribute('class') || '') + ' ' + type : type;

            root.setAttribute('class', newClass);
            show.call(root);
        }
    }
}

function defaultDisplay(nodeName) {
    var element, display;
    var elementDisplay = {};
    if (!elementDisplay[nodeName]) {
        element = document.createElement(nodeName);
        document.body.appendChild(element);
        display = getComputedStyle(element, '').getPropertyValue("display");
        element.parentNode.removeChild(element);
        display == "none" && (display = "block");
        elementDisplay[nodeName] = display;
    }
    return elementDisplay[nodeName];
}

function show () {
    this.style.display == "none" && (this.style.display = '');
    if (getComputedStyle(this, '').getPropertyValue("display") == "none") {
        this.style.display = defaultDisplay(this.nodeName)
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
                container.setAttribute('class', '.content');
                dom.parentElement.replaceChild(container, dom);
                for (var j = 0; j < newDom.length; j++) {
                    container.appendChild(newDom[j]);
                }
            } else {
                dom.parentElement.removeChild(dom);
            }
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
            obj.root.setAttribute(i, item || '');
        } else {
            obj.root.addEventListener(supportEvent[i], item, false);
        }
    }

    if ((isDomNode(root) && root.getAttribute('type') == 'r-element') || force == true) {
        root.parentElement.replaceChild(obj.root, root);
        obj.trigger(ATTACHED, obj);
        obj.isAttached = true;
        return obj.root;
    } else {
        if (root.isRosettaElem == true) {
            root.children = root.children || [];

            root.children.push(obj);
        } else {
            if (obj.root) {
                root.appendChild(obj.root);
            } else {
                root.innerHTML = obj;
            }

        }
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

            if (!!NewClass) {
                elemObj = new NewClass();
            }

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
            elemObj.renderFunc(elemObj);
            elemObj.name = attr.ref ? attr.ref : '';
            if (!!attr.ref) {
                addElem(attr.ref, elemObj);
            }

            extend(elemObj.attrs, attr, true);

            elemObj.trigger(CREATED, elemObj);
        }

        return result;
    }

}

function register(type, renderFunc) {
    var elemClass = createElemClass(type, renderFunc);
    addElemClass(type, elemClass);
    return elemClass;
}

var Rosetta = {
    init: init,

    ref: ref,

    getElemClass: getElemClass,

    addElemClass: addElemClass,

    addElem: addElem,

    render: render,

    create: create,

    register: register
};

module.exports = Rosetta;


