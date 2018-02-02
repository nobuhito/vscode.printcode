const vscode = require('vscode');
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const http = require("http");
const codemirror = require("codemirror/addon/runmode/runmode.node.js");
require("codemirror/mode/meta.js");

let server = null;

function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.print', function () {
        let port = vscode.workspace.getConfiguration("printcode").get("webServerPort");

        if (server == null) {
            server = http.createServer(requestHandler);
            server.listen(port, (err) => {
                if (err) {
                    return console.log(err);
                }
            });
        }

        let editor = vscode.window.activeTextEditor;
        let language = editor.document.languageId;
        var mode = resolveAliase(language);
        let url = "http://localhost:" + port + "/?mode=" + mode;

        let browserPath = vscode.workspace.getConfiguration("printcode").get("browserPath");
        if (browserPath != "") {
            child_process.exec("\"" + browserPath + "\" " + url);
        } else {
            let platform = process.platform;
            switch (platform) {
                case "darwin":
                    child_process.exec("open " + url);
                    break;
                case "linux":
                    child_process.exec("xdg-open " + url);
                    break;
                case "win32":
                    child_process.exec("start " + url);
                    break;
            }
        }
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;

const requestHandler = (request, response) => {
    if (request.url.replace(/\?mode\=.*$/, "") == "/") {
        let editor = vscode.window.activeTextEditor;
        if (editor == undefined) { return; }
        let html = getHtml(editor);
        response.end(html);
    } else if (/^\/_node_modules/.test(request.url)) {
        let file = path.join(__dirname, "..", request.url.replace("/_node_modules", "node_modules"));
        fs.readFile(file, "utf8", (err, text) => {
            if (err) {
                response.end(err.code + ": " + err.message);
            }
            response.end(text);
        });
    } else {
        response.end("");
    }
}

function getHtml(editor) {
    let language = editor.document.languageId;
    let text = editor.document.getText();
    let html = buildHtml(text, language);
    return html;
}

function buildHtml(text, language) {
    var body = text.EscapeForJSON();
    var mode = resolveAliase(language);

    let css = "/_node_modules/codemirror/lib/codemirror.css";
    let js = "/_node_modules/codemirror/lib/codemirror.js";
    let lang = "/_node_modules/codemirror/mode/" + mode + "/" + mode + ".js";

    // for htmlmixed
    let xml = "/_node_modules/codemirror/mode/xml/xml.js";
    let javascript = "/_node_modules/codemirror/mode/javascript/javascript.js";
    let stylesheet = "/_node_modules/codemirror/mode/css/css.js";

    // for htmlembedded
    let multiplex = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.31.0/addon/mode/multiplex.min.js";
    let htmlmixed = "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.31.0/mode/htmlmixed/htmlmixed.js";

    let myConfig = vscode.workspace.getConfiguration("printcode");
    let tabSize = myConfig.get("tabSize");
    let fontSize = myConfig.get("fontSize");
    let fontFamily = vscode.workspace.getConfiguration("editor").get("fontFamily");

    let content = JSON.stringify(codemirror.modeInfo
        .filter((d) => {
            return d.mode == mode;
        }), null, "  ");

    let html = `
<!doctype html>
    <head>
    <meta charset="utf-8">
    <title>vscode.printcode</title>

    <script src="${js}"></script>
    <link rel="stylesheet" href="${css}">
    <script src="${lang}"></script>
    <style>
         /* https://qiita.com/cognitom/items/d39d5f19054c8c8fd592 */
        .CodeMirror {
            height: auto;
            font-size: ${fontSize}pt;
            font-family: ${fontFamily};
            line-height: 1.2;
            width: 210mm;
        }
        body { margin: 0; padding: 0; }
        #ad, #content { display: none; }
        @page {
            size: A4;
            margin: 10mm;
        }
        @media screen {
            body {
                background: #eee;
            }
            #ad, #content {
                display: block;
                padding: 1em;
            }
            .CodeMirror {
                background: white;
                box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
                margin: 5mm;
            }
        }
    </style>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-112594767-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-112594767-1');
    </script>
</head>
<body>

    <div id="ad">
        <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <!-- vscode.printcode -->
        <ins class="adsbygoogle"
            style="display:inline-block;width:728px;height:90px"
            data-ad-client="ca-pub-9262536077732967"
            data-ad-slot="2774722832"></ins>
        <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
    </div>

    <div id="code"></div>

    <pre id="content">ModeInfo:<code>${content}</code></pre>
</body>
    <script>
        var head = document.getElementsByTagName("head")[0];

        if (["htmlembedded", "htmlmixed"].indexOf("${mode}") > -1) {
            var addScripts = ["${xml}", "${javascript}", "${stylesheet}"];
            for (var script of addScripts) {
                var source = document.createElement("script");
                source.setAttribute("src", script);
                head.appendChild(source);
            }
        }

        if ("${mode}" == "htmlembedded") {
            var addScripts = ["${multiplex}", "${htmlmixed}"];
            for (var script of addScripts) {
                var source = document.createElement("script");
                source.setAttribute("src", script);
                head.appendChild(source);
            }
        }

        window.addEventListener("load", function(event) {
            var cm = CodeMirror(document.getElementById("code"), {
                value: "",
                lineNumbers: true,
                lineWrapping: true,
                tabSize: ${tabSize},
                readOnly: true,
                scrollbarStyle: null,
                viewportMargin: Infinity,
                mode: "${mode}"
            });

            cm.on("changes", function() {
                document.querySelector(".CodeMirror-scroll").style.height = cm.doc.height;
                // window.print();
            });

            cm.doc.setValue("${body}");
        });
    </script>
</html>
`;
    return html.trim();
}

function resolveAliase(language) {
    var table = {};
    var lines = codemirror.modeInfo;
    for (const line of lines) {
        var items = [];
        items.push(line.name);
        items.push(line.name.toLowerCase());
        items.push(line.mode);
        items = items.concat(line.ext);
        items = items.concat(line.alias);
        for (const item of items) {
            table[item] = line.mode;
        }
    }
    return table[language];
}

// https://qiita.com/qoAop/items/777c1e1e859097f7eb82#comment-22d9876ea23dfef952f9
String.prototype.EscapeForJSON = function () {
    return ("" + this).replace(/\W/g, function (c) {
        return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4);
    });
};