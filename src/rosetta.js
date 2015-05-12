(function() {
    var Rosetta = {};

    (function() {
        function isString(elem) {
            return typeof elem == 'string';
        }

        function isDomNode(elem) {
            return !!(elem && elem.nodeType === 1);
        }

        function isOriginalTag(str) {
            return !!plainDom[str];
        }

        function isWindow(obj) {
            return obj != null && obj == obj.window;
        }

        function isPlainObject(obj) {
            return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
        }

        function isArray(value) {
            return value instanceof Array;
        }

        function isObject(value) {
            return typeof value == 'object';
        }

        function extend(target) {
            var end = [].slice.call(arguments, arguments.length - 2),
                deep = false,
                params = null;

            if (end === true) {
                deep = true;
                params = [].slice.call(arguments, 1, arguments.length - 2);
            } else {
                params = [].slice.call(arguments, 1);
            }

            params.map(function(source, index) {
                for (key in source) {
                    if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                        if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                            target[key] = {};
                        }

                        if (isArray(source[key]) && !isArray(target[key])) {
                            target[key] = [];
                        }

                        extend(target[key], source[key], deep);
                    } else if (source[key] !== undefined) {
                        target[key] = source[key];
                    }
                }
            });

            return target;
        }

        function camelize(key) {
            var _reg = /-(.)/g;
            return key.replace(_reg, function(_, txt) {
                return txt.toUpperCase();
            });
        }

        function toPlainArray(data, result) {
            if (!result) {
                var result = [];
            }

            for (var i = 0; i < data.length; i++) {
                var item = data[i];
                if (isArray(item)) {
                    toPlainArray(item, result);
                } else {
                    result.push(item);
                }
            }

            return result;
        }

        function query(selector, element) {
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


        var plainDom = {
                content: 'content',
                a: 'a',
                abbr: 'abbr',
                address: 'address',
                area: 'area',
                article: 'article',
                aside: 'aside',
                audio: 'audio',
                b: 'b',
                base: 'base',
                bdi: 'bdi',
                bdo: 'bdo',
                big: 'big',
                blockquote: 'blockquote',
                body: 'body',
                br: 'br',
                button: 'button',
                canvas: 'canvas',
                caption: 'caption',
                cite: 'cite',
                code: 'code',
                col: 'col',
                colgroup: 'colgroup',
                data: 'data',
                datalist: 'datalist',
                dd: 'dd',
                del: 'del',
                details: 'details',
                dfn: 'dfn',
                dialog: 'dialog',
                div: 'div',
                dl: 'dl',
                dt: 'dt',
                em: 'em',
                embed: 'embed',
                fieldset: 'fieldset',
                figcaption: 'figcaption',
                figure: 'figure',
                footer: 'footer',
                form: 'form',
                h1: 'h1',
                h2: 'h2',
                h3: 'h3',
                h4: 'h4',
                h5: 'h5',
                h6: 'h6',
                head: 'head',
                header: 'header',
                hgroup: 'hgroup',
                hr: 'hr',
                html: 'html',
                i: 'i',
                iframe: 'iframe',
                img: 'img',
                input: 'input',
                ins: 'ins',
                kbd: 'kbd',
                keygen: 'keygen',
                label: 'label',
                legend: 'legend',
                li: 'li',
                link: 'link',
                main: 'main',
                map: 'map',
                mark: 'mark',
                menu: 'menu',
                menuitem: 'menuitem',
                meta: 'meta',
                meter: 'meter',
                nav: 'nav',
                noscript: 'noscript',
                object: 'object',
                ol: 'ol',
                optgroup: 'optgroup',
                option: 'option',
                output: 'output',
                p: 'p',
                param: 'param',
                picture: 'picture',
                pre: 'pre',
                progress: 'progress',
                q: 'q',
                rp: 'rp',
                rt: 'rt',
                ruby: 'ruby',
                s: 's',
                samp: 'samp',
                script: 'script',
                section: 'section',
                select: 'select',
                small: 'small',
                source: 'source',
                span: 'span',
                strong: 'strong',
                style: 'style',
                sub: 'sub',
                summary: 'summary',
                sup: 'sup',
                table: 'table',
                tbody: 'tbody',
                td: 'td',
                textarea: 'textarea',
                tfoot: 'tfoot',
                th: 'th',
                thead: 'thead',
                time: 'time',
                title: 'title',
                tr: 'tr',
                track: 'track',
                u: 'u',
                ul: 'ul',
                'var': 'var',
                video: 'video',
                wbr: 'wbr',

                // SVG
                circle: 'circle',
                clipPath: 'clipPath',
                defs: 'defs',
                ellipse: 'ellipse',
                g: 'g',
                line: 'line',
                linearGradient: 'linearGradient',
                mask: 'mask',
                path: 'path',
                pattern: 'pattern',
                polygon: 'polygon',
                polyline: 'polyline',
                radialGradient: 'radialGradient',
                rect: 'rect',
                stop: 'stop',
                svg: 'svg',
                text: 'text',
                tspan: 'tspan'
            },

            supportEvent = {
                // 只支持原生的
                onClick: 'click',
                onDoubleClick: 'doubleclick',
                onDrag: 'drag',
                onDragEnd: 'dragend',
                onDragEnter: 'dragenter',
                onDragExit: 'dragexit',
                onDragLeave: 'dragleave',
                onDragOver: 'dragover',
                onDragStart: 'dragstart',
                onDrop: 'drop',
                onMouseDown: 'mousedown',
                onMouseEnter: 'mouseenter',
                onMouseLeave: 'mouseleave',
                onMouseMove: 'mousemove',
                onMouseOut: 'mouseout',
                onMouseOver: 'mouseover',
                onMouseUp: 'mouseup',


                onTouchStart: 'touchstart',
                onTouchEnd: 'touchend',
                onTouchCancel: 'touchcancel',
                onTouchMove: 'touchmove',


                onScroll: 'scroll',
                onWheel: 'wheel',


                onCopy: 'copy',
                onCut: 'cut',
                onPaste: 'paste',


                onKeyDown: 'keydown',
                onKeyPress: 'keypress',
                onKeyUp: 'keyup',


                onFocus: 'focus',
                onBlur: 'blur',


                onChange: 'change',
                onInput: 'input',
                onSubmit: 'submit'
            },

            ATTACHED = 'attached',
            DETACHED = 'detached',
            CREATED = 'created',
            ATTRIBUTECHANGE = 'attributeChange';

        Rosetta = (function() {
            function createElemClassFactory(type, renderFunc) {
                return (function(type, renderFunc) {
                    function CustomElement(options) {
                        extend(this, {
                            type: type,

                            name: name,

                            renderFunc: renderFunc,

                            refs: {},

                            events: {},

                            isAttached: false
                        }, options || {}, true);
                    }

                    function update(options) {
                        extend(this.attrs, options, true);
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

            function toType(attr) {
                var value = null;

                try {
                    value = eval(attr);

                    if (isArray(value)) {
                        value.map(function(item, index) {
                            value[index] = toType(item);
                        });
                    } else {
                        for (var i in value) {
                            var v = value[i];
                            value[i] = toType(v);
                        }
                    }
                } catch (e) {
                    value = attr;
                }

                return value;
            }

            // create的trigger之前执行renderfunc
            function create(type, attr) {
                var children = [].slice.call(arguments, 2),
                    children = toPlainArray(children),
                    result = null;

                attr = toType(attr || '');

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
                var elemClass = createElemClassFactory(type, renderFunc);
                addElemClass(type, elemClass);
                return elemClass;
            }

            var refers = {};
            var _elemClass = {};

            return {
                init: init,

                ref: ref,

                getElemClass: getElemClass,

                addElemClass: addElemClass,

                addElem: addElem,

                render: render,

                create: create,

                register: register
            };
        })();
    })();

    window.Rosetta = Rosetta;
})();

var readyRE = /complete|loaded|interactive/,
    ready = function(callback) {
        if (readyRE.test(document.readyState) && document.body) {
            callback();
        } else document.addEventListener('DOMContentLoaded', function() {
            callback();
        }, false)
        return this
    }

ready(Rosetta.init);
