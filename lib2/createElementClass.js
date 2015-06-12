var h = require('./virtual-dom/h'),
    diff = require('./virtual-dom/diff'),
    patch = require('./virtual-dom/patch'),
    createElement = require('./virtual-dom/create-element');


var utils = require('./utils.js'),
    bind = utils.bind,
    fire = utils.fire,
    isDomNode = utils.isDomNode,

    lifeEvents = require('./lifeEvents.js'),
    ATTACHED = lifeEvents.ATTACHED,
    DETACHED = lifeEvents.DETACHED,
    CREATED = lifeEvents.CREATED
    ATTRIBUTECHANGE = lifeEvents.ATTRIBUTECHANGE;


var supportEvent = require('./supportEvent.js'),
    utils = require('./utils.js'),
    isString = utils.isString;


var Delegator = require('./dom-delegator');


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


function update(options) {
    var oldTree = this.vTree;
    var attrs = this.root.attributes,
        root = this.root,
        type = this.type,
        attr = {};

    for (var n = 0; n < attrs.length; n++) {
        var item = attrs[n];
        attr[item.name] = item.nodeValue;
    }

    attr = toType(attr || '') || {};
    attr = extend(attr, options);

    var newTree = this.__t(this, attr, this.refs);

    // (function(__t, self, attr, refs) {
    //     var a = {};
    //     a.create = function(type, attr) {
    //         if (!isString(type)) {
    //             return;
    //         }

    //         attr = toType(attr || '') || {};
    //         console.log(attr);

    //         var contentChildren = [].slice.call(arguments, 2) || [];

    //         contentChildren = toPlainArray(contentChildren);

    //         contentChildren.map(function(item, index) {
    //             if (typeof item == 'number') {
    //                 contentChildren[index] = '' + item;
    //             } else if(item.isRosettaElem == true) {
    //                 contentChildren[index] = item.vTree;
    //             }
    //         });

    //         var eventObj = {};
    //         for (var i in attr) {
    //             var item = attr[i];
    //             if (supportEvent[i]) {
    //                 eventObj['ev-' + supportEvent[i]] = item;
    //                 var delegator = Delegator();
    //                 delegator.listenTo(supportEvent[i]);
    //             }
    //         }

    //         var newAttrs = extend({
    //             attributes: attr
    //         }, eventObj, true);


    //         var vTree = h.call(this, type, newAttrs, contentChildren);
    //         return vTree;
    //     }

    //     newTree = __t(a, attr, refs);
    // })(this.__t, this, attr, this.refs)

    var patches = diff(oldTree, newTree);

    this.root = patch(this.root, patches);

    this.attrs = attr;
    for (var i in this.attrs) {
        var item = this.attrs[i];
        if (!supportEvent[i]) {
            if (!!item) {
                if (!isString(item)) {
                    item = objToString(item);
                }
            }
            this.root.setAttribute(i, item || '');
        }
    }

    Rosetta.triggerChildren(this, ATTRIBUTECHANGE);
    this.trigger(ATTRIBUTECHANGE, this);
}


function destroy() {
    this.off();
    this.root.parentElement.removeChild(this.root);
    Rosetta.triggerChildren(this, DETACHED);
    this.trigger(DETACHED, this);
    delete ref(this.name);
}

function create(type, attr) {
    var obj = Rosetta.create.apply(Rosetta, arguments);
    // to update refs, something wrong here

    if (!!attr && !!attr.ref) {
        this.refs[attr.ref] = obj;
    }

    if (obj.isRosettaElem == true) {
        this.rosettaElems = this.rosettaElems || [];
        this.rosettaElems.push(obj);
    }

    return obj;
}



function createElementClass(type, renderFunc) {
    /**
     * constructor for new custom elements
     *
     * @class CustomElement
     * @constructor
     */

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

        create: create,

        __t: function(){}

    };

    return CustomElement;
}

module.exports = createElementClass;