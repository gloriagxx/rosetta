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


function addToRefs(ref, obj) {
    obj.refs[ref] = obj;
}


function update(options) {
    var oldTree = this.vTree;

    var attrs = extend(this.attrs, options, true);

    var newTree = this.__t(this, attrs, this.refs);
    var patches = diff(oldTree, newTree);
    this.root = patch(this.root, patches);
}


function destroy() {
    this.off();
    this.root.parentElement.removeChild(this.root);
    this.trigger(DETACHED, this);
    delete ref(this.name);
}

function create(type, attr) {
    var vTree = Rosetta.create.apply(Rosetta, arguments);
    // to update refs, something wrong here

    if (!!attr && !!attr.ref) {
        addToRefs(attr.ref, this);
    }

    return vTree;
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