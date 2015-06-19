var utils = require('./utils.js'),
    bind = utils.bind,
    fire = utils.fire,
    isDomNode = utils.isDomNode,

    lifeEvents = require('./lifeEvents.js'),
    ATTACHED = lifeEvents.ATTACHED,
    DETACHED = lifeEvents.DETACHED,
    CREATED = lifeEvents.CREATED
    ATTRIBUTECHANGE = lifeEvents.ATTRIBUTECHANGE;


function createElemClass(type, renderFunc) {
    function update(options) {
        // extend(this.attrs, options, true);
        var children = this.children,
            root = this.root,
            type = this.type;

        extend(this.attrs, options, true);
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

module.exports = createElemClass;