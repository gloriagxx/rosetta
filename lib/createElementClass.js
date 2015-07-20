var h = require('./virtual-dom/h'),
    diff = require('./virtual-dom/diff'),
    patch = require('./virtual-dom/patch'),
    createElement = require('./virtual-dom/create-element');


var utils = require('./utils.js'),
    bind = utils.bind,
    fire = utils.fire,
    isDomNode = utils.isDomNode,
    updateRefs = utils.updateRefs,

    lifeEvents = require('./lifeEvents.js'),
    ATTACHED = lifeEvents.ATTACHED,
    DETACHED = lifeEvents.DETACHED,
    CREATED = lifeEvents.CREATED
    ATTRIBUTECHANGE = lifeEvents.ATTRIBUTECHANGE;


var supportEvent = require('./supportEvent.js'),
    utils = require('./utils.js'),
    isString = utils.isString;

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

function triggerChildren(obj, type) {
    (obj.rosettaElems || []).map(function(item, index) {
        triggerChildren(item.rosettaElems || []);

        item.trigger(type, item);
    });
}

function update(options) {
    var oldTree = this.vTree,
        root = this.root,
        type = this.type,
        attr = {};

    attr = extend(this.attrs, options, true);
    var newTree = this.__t(this, attr, this.refs);
    var patches = diff(oldTree, newTree);
    this.root = patch(this.root, patches);
    this.vTree = newTree;
    this.attrs = attr;

    Rosetta.updateRefs(this, this.root);

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

    if (obj.realObj && obj.realObj.isRosettaElem == true) {
        this.rosettaElems = this.rosettaElems || [];
        this.rosettaElems.push(obj.realObj);
    }

    return obj;
}



function createElementClass(type, protoOptions) {
    /**
     * constructor for new custom elements
     *
     * @class CustomElement
     * @constructor
     * @param {object} options - the custom options of the new element
     */

    function CustomElement(options) {
        extend(this, {
            type: type,

            name: name,

            '$': {},

            events: {},

            isAttached: false,

            attrs: {}
        }, options || {}, true);
    }

    extend(CustomElement.prototype, protoOptions, {
        update: update,

        destroy: destroy,

        isRosettaElem: true,

        on: on,

        once: once,

        off: off,

        fire: trigger,

        create: create,

        __t: function(){}

    }, true);

    return CustomElement;
}

module.exports = createElementClass;