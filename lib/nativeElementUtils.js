import {document, extend} from './utils.js';
import {handleAttr, handleEvent} from './elementUtils.js';
import patch from 'virtual-dom/patch'
import diff from 'virtual-dom/diff';
import h from 'virtual-dom/h';


export function updateNative(opts) {
    var oldTree = this.vTree;
    var dom = this.root;
    var attr = this.attr;
    var vChildren = this.children;
    var nativeType = this.type;
    var newAttr = extend({}, attr, opts);


    var newTree = Rosetta.create(nativeType, newAttr, vChildren);
    var patches = diff(oldTree, newTree);

    // 更新树
    var dom = patch(dom, patches, {
        document: document
    });

    extend(newTree, {
        _attr: newAttr,
        _nativeType: nativeType,
        _vChildren: vChildren,
        _updateNative: updateNative
    });

    this.attr = newAttr;
    this.vTree = newTree;
    this.children = vChildren;
    this.root = dom;

    handleEvent(dom, _shouldDelegateEvents);
    _shouldDelegateEvents = {};
}


export function createNative(type, initAttr, children) {
    if (window.boost) {
        window.boost.support = ['View'];
        if (window.boost.support.indexOf(type) >= 0) {
            // 将initAttr转换为对应this.properties的type的attr真实值，并处理好vtree要求的事件属性格式
            // 生成vtree
            var result = handleAttr(initAttr);
            var attr = result.attr;
            var eventObj = result.eventObj;
            var events = result.events;

            var newAttr = extend({
                attributes: attr
            }, eventObj, true);

            var vTree = h.call(this, type, newAttr, children);
            vTree.__events = events;
            extend(_shouldDelegateEvents, events, true);

            extend(vTree, {
                _attr: attr,
                _nativeType: type,
                _vChildren: children,
                _updateNative: updateNative
            });

            return vTree;
        }
    }
}


export function renderNative (vTree, dom) {
    var type = vTree._nativeType;

    if (window.boost) {
        window.boost.support = ['View'];
        if (window.boost.support.indexOf(type) >= 0) {
            var nObj = new Object({
                attr: vTree._attr,
                type: vTree._nativeType,
                update: vTree._updateNative,
                children: vTree._vChildren,
                root: dom,
                vTree,
            });

            return nObj;
        }
    }
}
