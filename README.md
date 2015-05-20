# rosetta


# dist目录的rosetta
* 支持ie版：rosetta-ie.js
* 非ie版：rosetta.js


# 快速开始

## 一、 自定义element示例
    Rosetta的Custom Elements是开发UI的基础模块。Custom Elements是html、css、js的集合，构成一个完整、独立的功能单元。

### 1、定义element
* html
```
    <element type="r-tab">
        <link rel="import" href="r-b.html">

        <template>
            <div class="tab-panel" onClick={ toggle }>
                <content select=".panel-a">

                </content>
                <content select=".panel-b">

                </content>
            </div>
            <div class="tab-container">
                <content select=".content-a">

                </content>
                <content select=".content-b">

                </content>
            </div>

            <r-b>
            </r-b>
        </template>
    </element>
```

* js
```
    Rosetta.register('r-tab', function(rTab) {
        // rTab.type == 'r-tab';
        // rTab.root = rootDom;
        // rTab.attr = '{aaa: '11', bbb:'121'}';

        function toggle () {
            console.log(111);
        }
    });
```

* css
```
    :host {

    }

    a::content {

    }

    div::content {

    }

    .tab-panel {

    }

    .tab-container {

    }
```

### 2、完整的定义element
* html + js + css

```
    <element type="r-tab">
        <link rel="import"  href="r-b.html">
        <style type="text/css">
            :host {

            }

            a::content {

            }

            div::content {

            }

            .tab-panel {

            }

            .tab-container {

            }
        </style>
        <script type="text/javascript">
            Rosetta.register('r-tab', function(rTab) {
                // rTab.type == 'r-tab';
                // rTab.root = rootDom;
                // rTab.attr = '{aaa: '11', bbb:'121'}';
                var items = [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 4}];

                function toggle () {
                    console.log(111);
                }
            });
        </script>

        <template>
            <div class="tab-panel" onClick={ toggle }>
                <content select=".panel-a">

                </content>
                <content select=".panel-b">

                </content>
            </div>
            <div class="tab-container">
                <content select=".content-a">

                </content>
                <content select=".content-b">

                </content>
            </div>

            <r-b>
            </r-b>
        </template>
    </element>
```


### 3、 使用element
```
    <!DOCTYPE html>
    <html>
    <head>
        <title></title>
    </head>
    <body>
        <link rel="import" href="tabA"/>
        <r-tab name="tabA">
            <div class=".panel-a {$tpl.testClass}">
                <div>{$tpl.aaa}</div>
            </div>
            <div class=".panel-b" ref="panelb">
                <div>dddd</div>
            </div>
            <div class=".content-a">
                第一个tab的content
            </div>
            <div class=".content-b">
                第二个tab的content
            </div>
        </r-tab>
        <r-xxx>
        </r-xxx>
        <script type="text/javascript" src="rosetta.js"></script>
    </body>
    </html>
```


### 4、 自定义element约定
* element可以只有html或只有js
* 可以用外链形式引用静态资源，也可以内联
* element由<element type="r-xxx">包裹
* html由template包裹
* js用script标签
* css用style内联
* element标签需要闭合
* 标准的html标签不允许被覆盖
* element命名规则：1、由'-'链接'r'和后缀名，比如r-tab，这里的'tab'就是后缀名


### 5、 css设置样式
* auto scoping，编译时自动加上element类型的class
* 设置根元素样式
:host {
    color: red;
}


### 6、 js和html的变量、节点相互引用
* 通过html的ref值，实现js对html节点的引用
```
    <element type="r-tab">
        <link rel="import"  href="r-b.html">

        <script type="text/javascript">
            Rosetta.register('r-tab', function(rTab) {
                // rTab.type == 'r-tab';
                // rTab.root = rootDom;
                // rTab.attr = '{aaa: '11', bbb:'121'}';
                var items = [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 4}];

                $(ref.panel).hasClass('tab-panel');
            });
        </script>

        <template>
            <div class="tab-panel" ref="panel">
                <content select=".panel-a">

                </content>
                <content select=".panel-b">

                </content>
            </div>
            <div class="tab-container">
                <content select=".content-a">

                </content>
                <content select=".content-b">

                </content>
            </div>

            <r-b>
            </r-b>
        </template>
    </element>
```

* 通过scope实现，html中模版表示直接引用js变量
```
    <element type="r-tab">
        <link rel="import"  href="r-b.html">

        <script type="text/javascript">
            Rosetta.register('r-tab', function(rTab) {
                // rTab.type == 'r-tab';
                // rTab.root = rootDom;
                // rTab.attr = '{aaa: '11', bbb:'121'}';
                var items = [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 4}];

                function toggle () {
                    console.log(111);
                }
            });
        </script>

        <template>
            <div class="tab-panel" onClick={ toggle }>
                <content select=".panel-a">

                </content>
                <content select=".panel-b">

                </content>
            </div>
            <div class="tab-container">
                <content select=".content-a">

                </content>
                <content select=".content-b">

                </content>
            </div>

            <r-b>
            </r-b>
        </template>
    </element>
```


### 7、 实例化一个element
* Rosetta主动负责页面加载时的element实例化解析，不需要显式调用

```
    <!DOCTYPE html>
    <html>
    <head>
        <title></title>
    </head>
    <body>
        <link rel="import" href="r-tab.html">
        <r-tab name="tabA">
            <div class=".panel-a {$tpl.testClass}">
                <div>{$tpl.aaa}</div>
            </div>
            <div class=".panel-b">
                <div>dddd</div>
            </div>
            <div class=".content-a">
                第一个tab的content
            </div>
            <div class=".content-b">
                第二个tab的content
            </div>
        </r-tab>
    </body>
    </html>
```

* 支持block和非block两种组件加载模式
    ** 默认非block：静态资源按页面打包外链
    ** block：静态资源inline
    ** 控制css加载完再显示组件防治页面闪动


* 动态实例化一个element
```
    Rosetta.create(name, attr);
```

* 将element实例渲染到dom节点上
```
    Rosetta.render(Rosetta.create(name, attr), root, forceToReplace);
```

* 开始标签解析（runtime自动调用，无需手动执行。）
```
    Rosetta.init();
```

### 8、全局访问element对象

```
    <body>
        <r-tab ref="tabA">
            <div class=".panel-a {$tpl.testClass}">
                <div>{$tpl.aaa}</div>
            </div>
            <div class=".panel-b">
                <div>dddd</div>
            </div>
            <div class=".content-a">
                第一个tab的content
            </div>
            <div class=".content-b">
                第二个tab的content
            </div>
        </r-tab>
    </body>
```

* 使用的时候给element的ref赋值
* runtime会自动把ref为tabA的element对象放置在Rosetta里
* 通过接口Rosetta.ref('tabA')获得对象


### 9、 element实例生命周期
* 初始化执行过程中的生命周期变化
    ** register注册element类
    ** 遍历element
    ** 实例化类
    ** 执行拼接模版，渲染数据
    ** 执行自定义js render逻辑
    ** append（或者replace）到root


* 生命周期事件监听
    ** created（初始化时派发）
    ** attached (html渲染到root后派发)
    ** detached（调用elemObj.destroy()时派发）
    ** attributechanged（调用elemObj.update(attr)时派发）
```
    <element type="r-tab">
        <template>
            <div>
                测试
            </div>
        </template>
        <script type="text/javascript">
            Rosetta.register('r-tab', function(tag) {
                tag.on('created', function() {

                });
                tag.on('attributechanged', function() {

                });
                tag.on('detached', function() {

                });
            });
        </script>
    </element>
```


### 10、 模版表达式：支持js的语法，以'{}'包装
* 引用js定义变量
```
    <element type="r-tab">
        <link rel="import" href="r-b.html">

        <script type="text/javascript">
            Rosetta.register('r-tab', function(tag) {
                var items = [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 4}];

                function toggle () {
                    console.log(111);
                }
            });
        </script>

        <template>
            <div class="tab-panel" onClick={ toggle }>
                <content select=".panel-a">

                </content>
                <content select=".panel-b">

                </content>
            </div>
            <div class="tab-container">
                <content select=".content-a">

                </content>
                <content select=".content-b">

                </content>
            </div>

            <r-b>
            </r-b>
        </template>
    </element>
```

* ref定位dom
```
    <element type="r-tab">
        <link rel="import"  href="r-b.html">

        <script type="text/javascript">
            Rosetta.register('r-tab', function(tag) {
                var items = [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 4}];

                tag.ref.panel.hasClass('tab-panel');
            });
        </script>

        <template>
            <div class="tab-panel" ref="panel">
                <content select=".panel-a">

                </content>
                <content select=".panel-b">

                </content>
            </div>
            <div class="tab-container">
                <content select=".content-a">

                </content>
                <content select=".content-b">

                </content>
            </div>

            <r-b>
            </r-b>
        </template>
    </element>
```

* 事件绑定

```
    <element type="r-tab">
        <link rel="import"  href="r-b.html">

        <script type="text/javascript">
            Rosetta.register('r-tab', function(tag) {
                var items = [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 4}];

                function toggle () {
                    console.log(111);
                }
            });
        </script>

        <template>
            <div class="tab-panel" onClick={ toggle }>
                <content select=".panel-a">

                </content>
                <content select=".panel-b">

                </content>
            </div>
            <div class="tab-container">
                <content select=".content-a">

                </content>
                <content select=".content-b">

                </content>
            </div>

            <r-b>
            </r-b>
        </template>
    </element>
```

* 条件和循环
```
    <element type="r-tab">
        <link rel="import"  href="r-b.html">

        <script type="text/javascript">
            Rosetta.register('r-tab', function(tag) {
                var items = [{a: 1, b: 2}, {a: 2, b: 3}, {a: 3, b: 4}];
                var a = true;
                function toggle () {
                    console.log(111);
                }
            });
        </script>

        <template>
            <div class="tab-panel" onClick={ toggle }>
                {if (attrs.list.length > 0) {
                    (attrs.list || []).map(function(item, index) {
                      var className = 'bla-' + index;

                      return (
                        <li class={className}>{item}</li>
                      )
                    }
                }}
                <content select=".panel-a">

                </content>
                <content select=".panel-b">

                </content>
            </div>
            <div class="tab-container">
                <content select=".content-a">

                </content>
                <content select=".content-b">

                </content>
            </div>

            <r-b>
            </r-b>
        </template>
    </element>
```


### 11、 嵌套
```
    <element type="r-tab">
        <link rel="import"  href="r-b.html">

        <template>
            <div class="tab-panel" onClick={ toggle }>
                <content select=".panel-a">

                </content>
                <content select=".panel-b">

                </content>
            </div>
            <div class="tab-container">
                <content select=".content-a">

                </content>
                <content select=".content-b">

                </content>
            </div>

            <r-b>
            </r-b>
        </template>
    </element>
```


使用步骤：
* 声明依赖：<link rel="import"  href="r-b.html">
* 使用自定义标签：<r-b></r-b>


## 二、API
### 初始化设置
Rosetta.settings.brackets


### 自定义标签
```
    /**
     * Custom Element
     **/

        /**
         * description:
            * to register a new type(class) of element, and define its factorys
         * params:
         *  * elemType
            * type: string
            * desc: new element type to register
         *  * renderFunc
            * type: function
             *desc:context of factory is the obj of rootDom
         * demo:

            Rosetta.register('r-tab', function(rTab) {
                var el = rTab.el;
                var attr = rTab.attr;
                var $el = $(el);
                var $aaa = $el.find('.aaa');

                $el.delegate('click', '.aaa', function() {
                    alert(test);
                });
            })
         *
         **/
        Rosetta.register(elemType, renderFunc)


        /**
         * description:
         *  * to dynamicly create a instance of elemType element, and mounted on the targetDom which is the root of the new instance, with attr as its initial configurations
         * params:
         *  * elemType:
            * type: string
            * desc: which type of element to be created
         *  * attr:
            * type: json object
            * desc: attributes for initialize the elemType instance
         * demo:

            Rosetta.create('r-tab', {
                select: 1,
                model: {
                    name: 'aaa'
                }
            })
        **/

        Rosetta.create(elemType, attr)


        /**
         * description:
         *  * to append html fragment to root, and call all the initial function
         * params:
         *  * elemObj
         *  * root
         *  * force: whether replace root
         **/
         Rosetta.render(elemObj, root, force);

    /**
     * Element instance
     **/

        /**
         * desc: 'rTab' is the instance of an r-tab element
         * property:
         *  attrs: attributes when initialized, or updated later
         *  root: root domNode of the element
         *  type: element Class name
         *  name: element instance ref
         *  refs: dom ref of internal definition template
         **/
        rTab.type
        rTab.name
        rTab.attrs
        rTab.refs
        rTab.root
        rTab.isAttached


        rTab.update(data)
        rTab.destroy()


        /**
         * element instance lifecycle
         **/
        created: when create called
        updated: when update attrs
        destroyed: when destroy called
```

```
    /**
     * update variable values and render tpl
     **/
    elemObj.update({
        a: 123,
        c: 323
    });

```

```
    /**
     * destroy elemObj and remove dom node
     **/
    elemObj.destroy();
```


## 三、兼容性


## 四、 应用级别最佳实践示例
* 见demos
* 不推荐在element的js里用异步加载js，虽然支持这样的用法。理由是和整个element设计初衷相违背
* 自由组合现有架构和技术选型



## 五、 对比
### Rosetta VS web components


### Rosetta VS react


