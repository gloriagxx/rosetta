<!DOCTYPE html>
<html>
<head>
    <title>server render</title>
    <meta charset="utf-8">
    <link rel="stylesheet" type="text/css" href="./static/style.css" />
    <link rel="stylesheet" type="text/css" href="/boostui/dist/boost.css">
    <script type="text/javascript" src="/boostui/dist/boost.js"></script>
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no,initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
</head>
<body>
    <div id="wrap">

        <div class="body">
            <link rel="import" href="/elements/r-tabs.html" />
            <r-tabs></r-tabs>
            <r-tabs items='[{title: "卡片1", selector: ".content1"}, {title: "卡片2", selector: ".content2"}, {title: "卡片3", selector: ".content3"}]' class="r-element" ref="tabs2">
              <div class="content1">内容 1</div>
              <div class="content2">内容 2</div>
              <div class="content3">内容 3</div>
            </r-tabs>


            <link rel="import" href="/elements/r-slider.html" />
            <r-slider>
                <ul class="blend-slides">
                    <li>
                        <img src="http://pic.4j4j.cn/upload/pic/20130530/f41069c61a.jpg">
                        <div class="blend-slider-title">这是图片1的标题</div>
                    </li>
                    <li>
                        <img src="http://pic.4j4j.cn/upload/pic/20130530/f41069c61a.jpg">
                        <div class="blend-slider-title">这是图片2的标题</div>
                    </li>
                    <li>
                        <img src="http://pic.4j4j.cn/upload/pic/20130530/f41069c61a.jpg">
                        <div class="blend-slider-title">这是图片3的标题</div>
                    </li>
                    <li>
                        <img src="http://pic.4j4j.cn/upload/pic/20130530/f41069c61a.jpg">
                        <div class="blend-slider-title">这是图片4的标题</div>
                    </li>
                </ul>
            </r-slider>
        </div>
    </div>
    <script type="text/javascript" src="/static/rosetta/dist/Rosetta.js"></script>
    <script type="text/javascript">
        Rosetta.ready(function() {
            alert(1);
            var tabs2 = Rosetta.ref('tabs2');
            var slider = Rosetta.ref('slider');

            tabs2.switchTo(1);
        });

    </script>
</body>
</html>
