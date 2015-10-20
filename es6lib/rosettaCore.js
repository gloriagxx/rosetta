/*@require ./rosetta.css*/

/**
 * Rosetta - webcomponents like javascript library accelerate UI development
 * version 1.1.0
 *
 */

// define module dependency
import elementClassFactory from './rosettaElement.js';
import {ATTACHED, DETACHED, CREATED, ATTRIBUTECHANGE} from './lifeEvents.js';
import htmlImport from './htmlImport';
import supportEvent from './supportEvent.js';
import {isArray, query, extend, toPlainArray, isOriginalTag, isDomNode, isString, isFunction, bind, fire, deserializeValue, typeHandlers} from './utils.js';
import {updateRefs, triggerChildren} from './elementUtils.js';


// vdom relavent
import h from 'virtual-dom/h';
import createElement from 'virtual-dom/create-element';
import EvStore from "./virtual-dom/node_modules/ev-store";


// define private instances
var _allRendered = false; // 调用init的开始置为false，本次渲染所有组件render完毕就是true；如果存在因未定义而未渲染的也算作是true，因此可以理解为“本次符合渲染条件的都渲染完了”
var _refers = {}; // to store ref of Rosetta element instance in Rosetta
var _elemClass = {};



/**
 *
 * @param {json} options - options for prototype of custom element
 * @example, if it has no default value, then the value can be String/Object/
    {
        is: 'r-xxx'
        ready: function() {}
        created: function() {}
        attached: function() {}
        dettached: function() {}
        attributeChanged: function() {}
        extends: 'type name'
        properties: {
            aaa: 'string',//used for deserializezing from an attribute
            bbb: [],
            prop: {
                type: String,
                notify: true,
                readOnly: true
            }
        }
    }
 * @param options.properties.xxx.type - Boolean, Date, Number, String, Array or Object
 * @param options.properties.xxx.value - boolean, number, string or function
 * String. No serialization required.
 * Date or Number. Serialized using  toString.
 * Boolean. Results in a non-valued attribute to be either set (true) or removed (false).
 * Array or Object. Serialized using JSON.stringify.
 *
 */
function Rosetta(opts) {
    // 组件注册接口
    // 创建新的组件class
    // 标记异步import加载器的该类型组件class已经定义
    // 返回类型为创建的新组件class
    var type = opts.is;
    var newClass = elementClassFactory(opts);

    //
    setElemClass(type, newClass);
    htmlImport.factoryMap[opts.__rid] = true;
    return newClass;
}


function findRosettaTag() {
    var elems = [];
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

    return elems;
}

/*
 * @function start parse document and render rosetta element
 */
function init() {
    // 找到页面的r-xxx元素
    // 如果是Rosetta已经注册的元素类型，则create、render
    _allRendered = false;
    var elems = findRosettaTag();
    var i = 0;

    for (; i < elems.length; i++) {
        var item = elems[i];
        var type = item.tagName.toLowerCase();
        var options = {};
        var attrs = item.attributes || {};
        var children = [].slice.call(item.children);
        var n = 0;

        for (; n < attrs.length; n++) {
            var content = attrs[n];
            options[content.name] = content.value;
        }

        if (getElemClass(type)) {
            Rosetta.render(Rosetta.create(type, options, children), item, true);
        }
    }

    _allRendered = true;
    fire.call(Rosetta, 'ready');
}

/*
 * @function to create rosetta element obj
 * @param {string} type, type of rosetta element
 * @param {object} initArr, attributes of the newly created element
 * @return {object} vTree, contains referer of rosetta instance
 */
function create(type, initAttr = {}) {
    if (!isString(type)) {
        return;
    }

    var children = [].slice.call(arguments, 2);
    children = toPlainArray(children);

    if (isOriginalTag(type)) {
        // 将initAttr转换为对应this.properties的type的attr真实值，并处理好vtree要求的事件属性格式
        // 生成vtree

    } else {
        // 查找是否存在class
        // 生成rosetta elem的id
        // 生成element实例
        // 设置name为initAttr.ref的值
        // 将initAttr转换为对应this.properties的type的attr真实值，并处理好vtree要求的事件属性格式
        // 设置id，设置elem实例的property为attribute
        // 存一份自己的需要delegate的event，设置到
        // 生成vtree
        // 处理children，将children存起来，方便根节点render的时候统一处理children content的事情
        // 给当前的vtree以序列编号，便于根节点知道要把children插入到哪个content


    }
}

/*
 * @function
 * @
 */
function render() {
    // 从vtree获得rosetta element instance
    // 处理content
    // 更新内部dom节点的ref
    // 更新自己的ref到rosetta
    // 更新内部rosetta element instance的root（render前都是虚拟dom，嵌套的子element实际没有dom类型的root）
    // 处理事件绑定: 遍历每个子rosetta element绑定事件，绑定自己的事情
    // 更新dom







    // 更新content逻辑：获取所有的content标签，找到他的第一级rosetta element，获取这个rosetta element需要替换的content的编号shouldReplacedContent，查找children dom
    // 更新事件逻辑：将事件代理到每一级rosetta element的根root上，保存一份old已绑定事件，方便update的时候diff增加；当根节点上事件触发的时候，通过evstore查找当前dom上是否有对应事件的callback，如果有则执行，否则递归到parent；阻止冒泡（update的时候将当前的和old进行diff绑定diff的）
    // 更新内部ref逻辑：将ref属性设置到节点的attribute上，已经有dom的时候query一下ref=xxx获得dom，然后更新$

}

/*
 * @function for execute callback when current render all done
 * @params {function} cb, callbacks for all elements render done
 * @params {boolean} ifOnce, if execute once
 */
function ready(cb, ifOnce) {
    if (isFunction(cb)) {
        ifOnce = ifOnce === true ? true : false;
        if (_allRendered == true) {
            cb();
            !ifOnce && bind.call(Rosetta, 'ready', cb, null, ifOnce);
        } else {
            bind.call(Rosetta, 'ready', cb, null, ifOnce);
        }
    }
}

/*
 *
 *
 */

function getElemClass() {

}

function setElemClass() {

}

function getRef() {

}

function setRef() {

}

function getRealAttr() {

}