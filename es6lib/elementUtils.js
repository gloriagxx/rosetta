/**
 *
 * @module query
 * @param {string} selector - the selector string for the wanted DOM
 * @param {HTMLNode} element - the scope in which selector will be seached in
 */
export function query(selector, element) {
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        slice = [].slice,
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
        simpleSelectorRE = /^[\w-]*$/,
        isSimple = simpleSelectorRE.test(nameOnly);

    if (!element) {
        element = document;
    }

    return (element.getElementById && isSimple && maybeID) ?
        ((found = element.getElementById(nameOnly)) ? [found] : []) :
        (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
        slice.call(
            isSimple && !maybeID && element.getElementsByClassName ?
            maybeClass ? element.getElementsByClassName(nameOnly) :
            element.getElementsByTagName(selector) :
            element.querySelectorAll(selector)
        );
}

/**
 *
 * @module bind
 * @param {string} type - the event name
 * @param {function} listener - callback of the event which will be executed when the event has been triggered
 * @param {object} context - the custom context when executing callback
 * @param {boolean} ifOnce - determin whether the callback which be executed only once
 */
export function bind(type, listener, context, ifOnce) {
    this.events = this.events || {};
    var queue = this.events[type] || (this.events[type] = []);
    queue.push({
        f: listener,
        o: context,
        ifOnce: ifOnce
    });
}


/**
 *
 * @module fire
 * @param {string} type - trigger event which is represented by type
 */
export function trigger(type) {
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

/**
 *
 * @module updateRefs
 * @param {object} obj - the rosetta element instance
 * @param {HTMLNode} dom - the htmlnode of the rosetta element instance
 */
export function updateRefs(obj, dom) {
    for (var key in obj.$) {
        var node = query('[ref="' + key + '"]', dom);
        obj.$[key] = node;
    }
}

/**
 *
 * @function for triggering event on children
 * @param {object} obj - rosetta element instance
 * @param {string} type - event name
 */
export function triggerChildren(obj, type) {
    for (var key in obj.rosettaElems) {
        var item = obj.rosettaElems[key];
        triggerChildren(item, type);
        item[type].call(item);
        item.fire(type, item);
    }
}


export function updateChildElemRoot() {

}


export function eventDelegate() {

}


export function findContext() {

}

export function getID() {

}

export function getParent() {

}

export function appendRoot() {

}