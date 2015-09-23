var h = require('./virtual-dom/h'),
    diff = require('./virtual-dom/diff'),
    patch = require('./virtual-dom/patch'),
    createElement = require('./virtual-dom/create-element');


var utils = require('./utils.js'),
    bind = utils.bind,
    fire = utils.fire,
    isDomNode = utils.isDomNode,
    updateRefs = utils.updateRefs,

    triggerChildren = utils.triggerChildren,

    lifeEvents = require('./lifeEvents.js'),
    ATTACHED = lifeEvents.ATTACHED,
    DETACHED = lifeEvents.DETACHED,
    CREATED = lifeEvents.CREATED
    ATTRIBUTECHANGE = lifeEvents.ATTRIBUTECHANGE;


var supportEvent = require('./supportEvent.js'),
    isString = utils.isString,
    isFunction = utils.isFunction;

/**
 * @function for event binding
 * @param {string} type - the name of the event
 * @param {string} listener - callback of the event
 * @param {object} context - the custom context when executing callback
 * @param {string} ifOnce - whether the callback will be executed once
 */
function on(type, listener, context, ifOnce) {
    bind.call(this, type, listener, context, ifOnce);
}

/**
 * @function for event triggering
 * @param {string} type - the name of the event
 */
function trigger(type) {
    fire.call(this, type);
}


/**
 * @function for event unbinding
 * @param {string} type - the name of the event to be unbinded
 */
function off(type) {
    if (!type) {
        this.events = [];
    }

    delete this.events[type];
}

/**
 * @function for event triggering only once
 * @param {string} type - the name of the event
 * @param {function} listener - callback of the event
 * @param {object} context - the custom context when executing callback
 */
function once(type, listener, context) {
    this.on(type, listener, context, true);
}


/**
 *
 * @function for update rosetta element instance properties and rerendering UI
 * @param {object} options - new value of properties for updating
 */

function update(options) {
    var oldTree = this.rTree,
        root = this.root,
        type = this.type,
        attr = {},
        flag = false;

    for (var i in options) {
        if (this.__config[i] != options[i]) {
            flag = true;
        }
    }

    if (!flag) {
        return;
    }

    attr = extend(this.__config, options, true);
    extend(this, attr, true);

    var newTree = this.__t(this, this.$);
    newTree.properties.attributes.isRosettaElem = oldTree.properties.attributes.isRosettaElem;
    newTree.properties.attributes.shouldReplacedContent = oldTree.properties.attributes.shouldReplacedContent;

    var patches = diff(oldTree, newTree);

    this.root = patch(this.root, patches);
    this.rTree = newTree;

    updateRefs(this, this.root);

    Rosetta.eventDelegate.call(this.rTree.realObj, this.root, Rosetta._eventDelegatorObj);
    Rosetta._eventDelegatorObj = {};

    this.attributeChanged.call(this);
    triggerChildren(this, ATTRIBUTECHANGE);
    this.fire(ATTRIBUTECHANGE, this);
}


/**
 *
 * @function for destroy rosetta element instance
 *
 */
function destroy() {
    this.off();
    this.root.parentElement.removeChild(this.root);

    this.dettached.call(this);

    this.isAttached = false;
    triggerChildren(this, DETACHED);
    this.fire(DETACHED, this);
    delete Rosetta.ref(this.name);
}


/**
 *
 * @function for creating child rosetta element instance
 * @param {string} type - type of custom lement to be created
 * @attr {object} attr - initial value of properties to be set to rosetta element instance
 */
function create(type, attr) {
    var obj = Rosetta.create.apply(Rosetta, arguments);
    // to update refs, something wrong here

    var rTree = obj;//obj.rTree;

    if (!!attr && !!attr.ref) {
        this.$[attr.ref] = rTree;
    }

    if (rTree && rTree.realObj && rTree.realObj.isRosettaElem == true) {
        this.rosettaElems = this.rosettaElems || [];
        this.rosettaElems.push(rTree.realObj);
    }

    return obj;
}

/**
 *
 * @function for creating new rosetta element class
 * @param {string} type - new type of rosetta element class
 * @protoOptions {object} protoOptions - new settings for prototype of rosetta element
 *
 */

function createElementClass(protoOptions) {
    var type = protoOptions.is;

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

            name: '',

            '$': {},

            events: {},

            __config: {},


            isAttached: false

        }, options || {}, true);

        var self = this;

        for (var key in this.properties) {
            var value = this.properties[key];
            var re = value.value;

            if (re == undefined) {
                re = new value();
            }

            this.__config[key] = re;
            this[key] = re;
        }
    }
    extend(CustomElement.prototype, {
        is: '',
        ready: function () {
        },
        created: function () {
        },
        attached: function () {
        },
        dettached: function () {
        },
        attributeChanged: function () {
        },
        properties: {},
        __t: function () {
        },
        eventDelegator: {}
    }, protoOptions, {
        update: update,
        destroy: destroy,
        isRosettaElem: true,
        on: on,
        once: once,
        off: off,
        fire: trigger,
        create: create
    }, true);

    return CustomElement;
}

module.exports = createElementClass;