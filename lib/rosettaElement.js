import {extend, isFunction, isPlainObject, isDomNode, document} from './utils.js';
import {ATTACHED, DETACHED, CREATED, ATTRIBUTECHANGE} from './lifeEvents.js';
import {bind, trigger, handleEvent, updateRefs, triggerChildren, updateChildElemRoot, getPatches, updateRosettaChildren} from './elementUtils.js';
import {supportEvent} from './supportEvent.js';


// vdom relavent
import patch from 'virtual-dom/patch'

/**
 * @function for event binding
 * @param {string} eventName - the name of the event
 * @param {string} listener - callback of the event
 * @param {object} context - the custom context when executing callback
 * @param {string} ifOnce - whether the callback will be executed once
 */
function on(eventName, listener, context, ifOnce) {
    bind.call(this, eventName, listener, context, ifOnce);
}

/**
 * @function for event triggering only once
 * @param {string} eventName - the name of the event
 * @param {function} listener - callback of the event
 * @param {object} context - the custom context when executing callback
 */
function once(eventName, listener, context) {
    this.on(eventName, listener, context, true);
}

/**
 * @function for event unbinding
 * @param {string} eventName - the name of the event to be unbinded
 */
function off(eventName) {
    if (!eventName) {
        this.events = [];
    }

    delete this.events[eventName];
}

/**
 * @function for event triggering
 * @param {string} eventName - the name of the event
 */
function fire(eventName) {
    trigger.call(this, eventName);
}

/**
 *
 * @function for update rosetta element instance properties and rerendering UI
 * @param {object} opts - new value of properties for updating
 */
function update(opts) {
    var rObj = this;
    var oldTree = this.vTree;
    var rootNode = this.root;
    var type = this.type;
    var attr = {};
    var flag = false;


    // 判断是不是更新的数据和已有的数据存在不同
    for (var key in opts) {
        if (this.__config[key] != opts[key]) {
            flag = true;
            break;
        }
    }

    if (!flag) {
        return;
    }

    // 更新property
    extend(this, opts, true);
    // 更新__config
    extend(this.__config, extend({}, opts, true));

    var oldRChildren = rObj.rosettaChildren;
    rObj.rosettaChildren = [];

    var re = getPatches(rObj, oldTree);
    var patches = re.patches;
    var newTree = re.newTree;
    var newObj = re.obj;

    rObj.rosettaChildren = updateRosettaChildren(oldRChildren, newObj.rosettaChildren);

    // 更新树
    this.root = patch(rootNode, patches, {
        document: document
    });
    this.vTree = newTree;
    this.vTree.rObj = rObj;

    updateChildElemRoot(rObj);
    // 更新ref的引用
    updateRefs(rObj);

    // 更新事件代理(不用移除旧的事件绑定)
    handleEvent(rObj);

    // 执行attributechange相关逻辑
    triggerChildren(this, ATTRIBUTECHANGE);
    this.attributeChanged.call(this);
    this.fire(ATTRIBUTECHANGE, this);
}

/**
 *
 * @function for destroy rosetta element instance
 * @description: remove dom/ unbind event / remove obj from rosetta elems
 */
function destroy() {
    // 事件解绑
    this.off();
    // 移除dom
    this.root.parentElement.removeChild(this.root);
    delete Rosetta.ref(this.name);

    // 触发dettached相关事件
    triggerChildren(this, DETACHED);
    this.dettached.call(this);
    this.fire(DETACHED, this);
    this.isAttached = false;
}

/**
 *
 * @function for creating child rosetta element instance
 * @param {string} elemType - type of custom lement to be created
 * @attr {object} attr - initial value of properties to be set to rosetta element instance
 */
function create(elemType, attr) {
    // rosetta element模板中会调用这个接口
    // 调用rosetta的create方法，返回节点的vtree
    var childrenLen = this.rosettaChildren.length;
    var vTree = Rosetta.create.apply(Rosetta, [elemType, attr].concat([].slice.call(arguments, 2)).concat(childrenLen));

    // 将此vtree的引用放在this的中，保存attr.ref的引用
    if (!!attr && !!attr.ref) {
        // 疑似bug
        this.$[attr.ref] = vTree;
    }

    // 如果该字节点为rosettaElement，则存储生成的字节点的到父节点this的rosettaChildren中存起来
    if (!!vTree && !!vTree.rObj && vTree.rObj.isRosettaElem == true) {
        // 将子节点为rosettaElem的放到rosettaChildren里
        // 根element需要知道内嵌子element
        var tmp = {};
        tmp.obj = vTree.rObj;
        tmp.id = vTree.rObj.elemID;
        this.rosettaChildren.push(tmp);

        // 内嵌子element需要知道嵌套中的根element
        vTree.rObj.parentObj = this;
    } else {
        // 将非rosetta element的子节点处理的事件保存到this上，作为rosetta element需要为子节点代理的事件；暂时不支持嵌套时的rosetta标签绑定事件的写法
        extend(this.shouldDelegateEvents, vTree.__events, true);
    }

    return vTree;
}

/**
 *
 * @function for creating new rosetta element class
 * @prototypeOpts {object} prototypeOpts - new settings for rosetta element prototype
 *
 */

export default function elementClassFactory(prototypeOpts) {

    /**
     * constructor for new custom elements
     *
     * @class CustomElement
     * @constructor
     * @param {object} options - the custom options of the new element
     */

    class CustomElement {
        constructor(initAttr) {
            extend(this, {
                'name': '',

                '$': {},

                'events': {},

                '__config': {},


                'isAttached': false,

                'rosettaChildren': [],

                'shouldDelegateEvents': {}

            }, true);


            // 初始化的时候将组件类定义的this.properties的数据转为实例的property和__config的值
            for (var key in this.properties) {
                var content = this.properties[key];
                var value = content.value;

                if (isFunction(content) && value === undefined) {
                    value = new content();
                } else {
                    // throw type error
                }

                if (isPlainObject(value)) {
                    value = extend({}, value, true);
                }

                this[key] = value;
                this.__config[key] = extend({}, value, true);
            }

            // 将实例初始化的值更新property和__config
        }
    }

    prototypeOpts.type = prototypeOpts.is;

    extend(CustomElement.prototype, {
        is: '',

        ready: function() {},

        created: function() {},

        attached: function() {},

        dettached: function() {},

        attributeChanged: function() {},

        __t: function() {},

        properties: {}

    }, prototypeOpts, {
        update,

        destroy,

        isRosettaElem: true,

        on,

        once,

        off,

        fire,

        create

    }, true);

    return CustomElement;
}
