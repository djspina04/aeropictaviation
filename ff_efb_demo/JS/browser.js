function UrlList() {
    var list = [];

    this.retArr = function() {
        return list;
    };

    this.iterator = function(){
        var index = -1;
        var checkIndex = function(idx) {
            return (idx >= 0 && idx + 1 <= list.length);
        };
        return {
            prev: function() {
                if (checkIndex(--index)) {
                    return list[index];
                }
                index = 0;
                return null;
            },
            next: function() {
                if (checkIndex(++index)) {
                    return list[index];
                }
                index = list.length - 1;
                return null;
            },
            add: function(item) {
                list.push(item);
                index++;
            },
            remove: function(idx) {
                if (checkIndex(idx)) {
                    list.splice(idx, 1);
                }
            },
            removeLast: function() {
                if (index == list.length - 1) {
                    index--;
                }
                list.pop();
            },
            shiftIndex: function() {
                index++;
            }
        };
    }
}

function NavHistory() {
    var histByTab = new Map();

    this.addTabId = function(id) {
        let list = new UrlList();
        histByTab.set(id, {list: list, it: list.iterator()});
    };

    this.addTabIdWithUrl = function(id, url) {
        let list = new UrlList();
        let it = list.iterator();
        it.add(url);
        histByTab.set(id, {list: list, it: it});
    };

    this.addUrlByTabId = function(id, url) {
        histByTab.get(id).it.add(url);
    };

    this.getHistByTabId = function(id) {
        return histByTab.get(id);
    };

    this.deleteTab = function(id) {
        histByTab.delete(id);
    }
}

var navHist = new NavHistory();
var currentIFrameId = "";
var previousIFrameId = "";

window.onload = function() {
    if (document.location.host == '') {
        createTabWithIframe();
        iframeNavigate('http://flightfactor.aero', currentIFrameId);
        previousIFrameId = currentIFrameId;
    }
};

function iframeNavigate(url, identifier) {
    var iframe = document.getElementById("iframe" + identifier);
    var tab = document.getElementById("label" + identifier);
    var address = document.getElementById("urlDisplay");
    var favicon = document.getElementById("favicon");

    if (url == "../EFB.html") {
        tab.innerHTML = "EFB";
        favicon.src = "./Resources/browser/favicon.ico";
    } else {
        if (isValidURL(url) == false) {
            if (isValidURL("http://" + url) == true) {
                url = "http://" + url;
            }
        }
        if (isValidURLbyhost(url) == true) {
            tab.innerHTML = extractDomain(url);
            favicon.src = url + "/favicon.ico";

        } else {
            url = "https://www.google.com/search?q=" + url.replace(" ", "+");
            favicon.src = url + "/favicon.ico";
            tab.innerHTML = extractDomain(url);
        }
    }
    iframe.src = url;
    address.innerHTML = url;
}

function createTabWithIframe(url) {
    var tabbar = document.getElementById("tabdiv");
    var webdiv = document.getElementById("webdiv");
    if (tabbar.innerHTML.indexOf("New Tab") !== -1) {

    } else {

        var id = generateUUID();
        previousIFrameId = currentIFrameId;

        if (url == null || url == undefined) {
            url = "http://flightfactor.aero";
        }
        //console.log('create: ' + url);

        var newiframe = document.createElement("IFRAME");
        newiframe.src = url;
        newiframe.target = "iframe" + id;
        newiframe.name = "iframe" + id;
        newiframe.id = "iframe" + id;
        newiframe.width = "100%";
        newiframe.style.position = "relative;";
        newiframe.style.height = "calc(100vh - 164px)";
        newiframe.style.width = "100vw";
        newiframe.style.border = "none";
        //newiframe.sandbox="allow-scripts allow-same-origin allow-popups allow-forms";

        tabbar.innerHTML += '<div id="tab' + id + '" class="navButton addButton tabDiv" onclick="selectiframe(\'' + id + '\')">' +
            '<div id="label' + id + '" class="tabLabel">New Tab</div><img src="./Resources/browser/cancel.png" height="12" onclick="killTab(\'' + id + '\')" align="right"></div>';
        //tabbar.innerHTML += "<button id='tab" + id + "' class='navButton addButton' onclick='selectiframe(\"" + id + "\")' title='" + id + "'>New Tab <img src='Resources/browser/cancel.png' width='12px' height='12px' onclick='killTab(\"" + id + "\");'></img></button>";
        webdiv.appendChild(newiframe);
        //webdiv.innerHTML += "<iframe src='" + url + "' target='iframe" + id + "' name='iframe" + id + "' id='iframe" + id + "' width='100%' style='position: relative; height:calc(100vh - 60px); width:25vw; border: none; background-color:white;' sandbox=\"allow-scripts allow-same-origin allow-popups allow-forms	\"></iframe>";
        var address = document.getElementById("urlInput").focus();
        showiframe(id);
        currentIFrameId = id;
        navHist.addTabIdWithUrl(currentIFrameId, url);
    }
}

function killTab(id) {
    if (id != currentIFrameId) {
        previousIFrameId = currentIFrameId;
    }
    document.getElementById("tab" + id).remove();
    document.getElementById("iframe" + id).remove();
    var iframe = document.getElementById("iframe" + previousIFrameId);
    iframe.style.width = "100%";
    iframe.focus();
    navHist.deleteTab(id);
}

function onBrowse(name, url, disposition) {
    previousIFrameId = currentIFrameId;
    createTabWithIframe();
    iframeNavigate(url, currentIFrameId);
    //console.log("Url: " + url + "<br>Name: " + name + "<br>Dispo: " + disposition);
}

function onAddressChange(frame_id, url, navigation_type) {
    previousIFrameId = currentIFrameId;
    createTabWithIframe();
    iframeNavigate(url, currentIFrameId);
    //console.log("Url: " + url + "<br>Name: " + name + "<br>Dispo: " + disposition);
    //console.log("framid: " + frame_id + "<br>Url: " + url);
}

function onLoadStart(frame_id, url, transition_type) {

}

function onLoadEnd(frame_id, url, transition_type) {
    changeTabTitle(frame_id, url, transition_type);
}

function changeTabTitle(id, url, transition_type) {
    id = id.replace("iframe", "");
    var iframe = document.getElementById("iframe" + id);
    var tab = document.getElementById("tab" + id);

    if (url.indexOf("youtube.com") > -1) {
        //alertify.log(id + "<br>" + url + "<br>" + transition_type);
    }
    if (transition_type == 200) {
        //iframe.src = url;
        //tab.innerHTML = extractDomain(url);
        //console.log(id + "<br>" + url + "<br>" + transition_type);
    }
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

function keypressed(e) {
    if (e.keyCode == 13) {
        navHist.addUrlByTabId(currentIFrameId, document.getElementById("urlInput").value);
        iframeNavigate(document.getElementById("urlInput").value, currentIFrameId);
    }
}

function pageBack() {
    let it = navHist.getHistByTabId(currentIFrameId).it;
    let url = it.prev();
    if (url != null) {
        iframeNavigate(url, currentIFrameId);
    }
}

function pageForward() {
    let it = navHist.getHistByTabId(currentIFrameId).it;
    let url = it.next();
    if (url != null) {
        iframeNavigate(url, currentIFrameId);
    }
}

function clickUpdate() {
    //var iframe = document.getElementById("iframe" + currentIFrameId);
    //iframe.contentDocument.history.back();
    //var list = navHist.getHistByTabId(currentIFrameId).list;
    //dbg.text('list: ' + list.retArr().toString());
}

function selectiframe(id) {
    var iframe = document.getElementById("iframe" + id);
    iframe.focus();
    if (currentIFrameId != id) {
        previousIFrameId = currentIFrameId;
    }
    currentIFrameId = id;
    showiframe(id);

}

function showiframe(id) {
    var elements = document.body.getElementsByTagName('iframe');
    for (i = 0; i < (elements.length); i++) {
        elements[i].style.width = "0%"; // display: block / none ???
    }
    var webdiv = document.getElementById("webdiv");
    var iframe = document.getElementById("iframe" + id);
    var tab = document.getElementById("tab" + id);
    var address = document.getElementById("urlDisplay");
    var favicon = document.getElementById("favicon");
    var urlinput = document.getElementById("urlInput");
    if (tab.innerHTML == "New Tab") {

        address.innerHTML = "";
        urlInput.value = "";
        urlInput.focus();
    } else {
        address.innerHTML = iframe.src;
        urlinput.value = "";
    }

    if (iframe.src == "../EFB.html") {
        tab.innerHTML = "EFB";
        favicon.src = "./Resources/browser/favicon.ico";
    } else {
        var domain = extractDomain(iframe.src);
        if (domain === '') {
            favicon.src = "./Resources/browser/favicon.ico";
        } else {
            favicon.src = "http://" + extractDomain(iframe.src) + "/favicon.ico";
        }
    }

    if (tab.innerHTML.indexOf("EFB") !== -1) {
        address.innerHTML = "EFB";
        //alert("EFB TAB");
        urlinput.value = "";
    }
    iframe.style.width = "100%";
}

function isValidURL(str) {
    var pattern = new RegExp("^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$", 'i');
    if (!pattern.test(str)) {
        return false;
    } else {
        if (str.indexOf(" ") > -1) {
            return false
        }
        return true;
    }
}

function generateUUID() {
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function isValidURLbyhost(str) {
    var a = document.createElement('a');
    a.href = str;
    return (a.host && a.host != window.location.host);
}