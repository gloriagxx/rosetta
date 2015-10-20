/**
 *
 *  file: htmlimport.js
 *  version: 1.0.0
 *  update: 2015.7.20
 *
 */

var head = document.getElementsByTagName('head')[0],
    resMap = {},
    pkgMap = {},
    factoryMap = {},
    loadingMap = {},
    scriptsMap = {},
    timeout = 5000;

/**
 *
 *
 *  example:
 *
    Rosetta.resourceMap({
        res: {
            'https://ss1.bdstatic.com/5eN1bjq8AAUYm2zgoY3K/r/www/cache/static/protocol/https/jquery/jquery-1.10.2.min_f2fb5194': {
                type: 'js',
                url: 'https://ss1.bdstatic.com/5eN1bjq8AAUYm2zgoY3K/r/www/cache/static/protocol/https/jquery/jquery-1.10.2.min_f2fb5194.js' //,
                //pkg: 'merge1'
                //,
                //deps: ['comp/a-xxx', 'comp/a-yyy', 'comp/a-rrrr', 'a-slider.css']
            },

            'a-slider.css': {
                type: 'css',
                url: 'a-slider_xxxxxx.css',
                pkg: 'merge2'
            }
        },

        pkg: {
            'merge1': {
                type: 'js',
                url: 'merge1_sds2121.js'
            },

            'merge2': {
                type: 'css',
                url: 'merge1_sds2121.css'
            }
        }
    })
 *
 */

function resourceMap (obj) {
    var key = '',
        res = '',
        pkg = '';

    res = obj.res;

    for (key in res) {
        resMap[key] = res[key];
    }

    pkg = obj.pkg;

    for (key in pkg) {
        pkgMap[key] = pkg[key];
    }
}



function alias (url) {
    return url.replace(/\.js$/i, '');
}


function createScript (url, id, onerror) {
    if (url in scriptsMap) return;


    scriptsMap[url] = true;

    var script = document.createElement('script');

    if (onerror) {
        var tid = setTimeout(onerror, timeout);

        script.onerror = function() {
            clearTimeout(tid);
            onerror();
        };

        function onload() {
            clearTimeout(tid);
            var queue = loadingMap[alias(id)];

            if (queue) {
                for (var i = 0, n = queue.length; i < n; i++) {
                    queue[i]();
                }
                delete loadingMap[url];
            }
        }

        if ('onload' in script) {
            script.onload = onload;
        } else {
            script.onreadystatechange = function() {
                if (this.readyState == 'loaded' || this.readyState == 'complete') {
                    onload();
                }
            }
        }
    }
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
    return script;
}

function createCSS (url, id, onerror) {
    if (url in scriptsMap) return;


    scriptsMap[url] = true;

    var link = document.createElement('link');

    if (onerror) {
        var tid = setTimeout(onerror, timeout);

        function onload() {
            clearTimeout(tid);
            var queue = loadingMap[alias(id)];

            if (queue) {
                for (var i = 0, n = queue.length; i < n; i++) {
                    queue[i]();
                }
                delete loadingMap[url];
            }
        }

        var link = document.createElement('link');
        link.href = url;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        head.appendChild(link);
        onload();
    }
}
/**
 *
 * @module htmlImport
 * @param {array} urls - Array of resources to be loaded
 *
 */
function htmlImport (urls, onload, onerror) {
    if (typeof urls == 'string') {
        urls = [urls];
    }

    var needMap = {};
    var needNum = 0;

    onerror = onerror || function() {};

    function findNeed (depArr) {
        for (var i = 0, n = depArr.length; i < n; i++) {
            var dep = alias(depArr[i]);

            if (!(dep in factoryMap)) {
                var child = resMap[dep] || resMap[dep + '.js'];

                if (child && 'deps' in child) {
                    findNeed(child.deps);
                }
            }

            if (dep in needMap) {
                continue;
            }

            needMap[dep] = true;
            needNum++;

            loadScript(dep, updateNeed, onerror);
        }
    }


    function updateNeed () {
        if (0 == needNum--) {
            onload && onload.apply(window);
        }
    }

    findNeed(urls);
    updateNeed();
}


function loadScript (id, callback, onerror) {
    var queue = loadingMap[id] || (loadingMap[id] = []);
    queue.push(callback);

    //
    // resource map query
    //
    var res = resMap[id] || resMap[id + '.js'] || {};
    var pkg = res.pkg;
    var url;
    var type = '';

    if (pkg) {
        url = pkgMap[pkg].url;
        type = pkgMap[pkg].type;
    } else {
        url = res.url || id;
        type = res.type;
    }

    if (type == 'js') {
        createScript(url, id, onerror && function() {
            onerror(id);
        });
    } else if (type == 'css') {
        createCSS(url, id, onerror && function() {
            onerror(id);
        });
    }
}

htmlImport.factoryMap = factoryMap;
htmlImport.resourceMap = resourceMap;

module.exports = htmlImport;