const vscode = require("vscode");
const config = require("./config").get();
const funcs = require("./funcs");
const path = require("path");

exports.build = function(text, language) {
  // https://qiita.com/qoAop/items/777c1e1e859097f7eb82#comment-22d9876ea23dfef952f9
  let body = escape(text);

  let mode = funcs.resolveAliases(language);

  let css = "/_node_modules/codemirror/lib/codemirror.css";
  let js = "/_node_modules/codemirror/lib/codemirror.js";
  let lang = "/_node_modules/codemirror/mode/" + mode + "/" + mode + ".js";

  // for htmlmixed
  let xml = "/_node_modules/codemirror/mode/xml/xml.js";
  let javascript = "/_node_modules/codemirror/mode/javascript/javascript.js";
  let stylesheet = "/_node_modules/codemirror/mode/css/css.js";

  // for htmlembedded
  let multiplex = "/_node_modules/codemirror/addon/mode/multiplex.js";
  let htmlmixed = "/_node_modules/codemirror/mode/htmlmixed/htmlmixed.js";

  // for clikes
  let clike = "/_node_modules/codemirror/mode/clike/clike.js";

  let folder = null;
  let resource = vscode.window.activeTextEditor.document.uri;
  let filePath = resource.fsPath || "";
  let folderPath = "";

  // better? https://github.com/cg-cnu/vscode-path-tools/blob/master/src/pathTools.ts
  if (resource.scheme === "file") {
    // file is an actual file on disk
    folder = vscode.workspace.getWorkspaceFolder(resource);
    if (folder) {
      // ...and is located inside workspace folder
      folderPath = folder.uri.fsPath;
    }
  }

  switch (config.printFilePath) {
    case "none":
      // show legacy document title
      break;
    case "full":
      config.printInfo = filePath;
      break;
    case "relative":
    case "pretty":
      // partial path relative to workspace root
      if (folder) {
        config.printInfo = filePath.replace(folderPath, "").substr(1);
      } else {
        // or should we show full path if no relative path available?
        config.printInfo = path.basename(filePath);
      }
      break;
    default:
      // default matches config default value "filename" and anything else
      config.printInfo = path.basename(filePath);
  }
  // skip HTML encoding of '&' and '<' since they're quite rare in filenames

  let printPopup = config.autoPrint ? `window.print();` : "";

  let googleAnalyticsSnipplet = config.disableTelemetry
    ? ""
    : `
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-112594767-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-112594767-1');
    </script>
    `;
  let html = `
<!doctype html>
    <head>
    <meta charset="utf-8">
    <title>${config.printInfo}</title>

    <script src="${js}"></script>
    <link rel="stylesheet" href="${css}">
    <script src="${lang}"></script>
    <style>
         /* https://qiita.com/cognitom/items/d39d5f19054c8c8fd592 */
        .CodeMirror {
            height: auto;
            font-size: ${config.fontSize}pt;
            font-family: ${config.fontFamily};
            line-height: 1.2;
            width: ${config.paperSpecs[config.paperSize].width};
        }
        body { margin: 0; padding: 0; }
        @page {
            size: ${config.paperSpecs[config.paperSize].name};
            margin: 10mm;
        }
        @media screen {
            body {
                background: #eee;
            }
            .CodeMirror {
                background: white;
                box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
                margin: 5mm;
            }
        }
    </style>
    ${googleAnalyticsSnipplet}
</head>
<body>

    <div id="code"></div>

    <script>
        var head = document.getElementsByTagName("head")[0];
        var addScripts = [];

        if (["htmlembedded", "htmlmixed"].indexOf("${mode}") > -1) {
          addScripts.push("${xml}", "${javascript}", "${stylesheet}");
        }

        if ("${mode}" == "htmlembedded") {
          addScripts.push("${multiplex}", "${htmlmixed}");
        }

        if ("${mode}" == "php") {
          addScripts.push("${xml}", "${javascript}", "${stylesheet}", "${htmlmixed}");
        }

        var clikes = ["php", "dart"];
        if (clikes.indexOf("${mode}") > -1) {
          addScripts.push("${clike}");
        }

        if (addScripts.length > 0) {
          for (var script of addScripts) {
            var source = document.createElement("script");
            source.setAttribute("src", script);
            head.appendChild(source);
          }
        }

        window.addEventListener("load", function(event) {
            var cm = CodeMirror(document.getElementById("code"), {
                value: "",
                lineNumbers: ${config.lineNumbering},
                lineWrapping: true,
                tabSize: ${config.tabSize},
                readOnly: true,
                scrollbarStyle: null,
                viewportMargin: Infinity,
                mode: "${mode}"
            });

            cm.on("changes", function() {
                // document.querySelector(".CodeMirror-scroll").style.height = cm.doc.height;
                ${printPopup}
            });

            cm.doc.setValue("${body}");
        });
    </script>
</body>
</html>
`;
  return html.trim();
};

escape = text => {
  return ("" + text).replace(/\W/g, function(c) {
    return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
};
