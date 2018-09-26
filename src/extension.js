const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const http = require("http");
const codemirror = require("codemirror/addon/runmode/runmode.node.js");
require("codemirror/mode/meta.js");

let server = null;
let portNumberInUse = null;
let firstLineNumber = 1;

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.print",
    function() {
      let port = vscode.workspace
        .getConfiguration("printcode")
        .get("webServerPort");

      if (server !== null && port !== portNumberInUse) {
        server.close(function() {});
        server = null;
      }

      if (server == null) {
        server = http.createServer(requestHandler);
        server.on("error", function(err) {
          if (err.code === "EADDRINUSE") {
            vscode.window.showInformationMessage(
              `Unable to print: Port ${port} is in use. \
Please set different port number in User Settings: printcode.webServerPort \
and Reload Window, or end the process reserving the port.`
            );
          } else if (err.code === "EACCES") {
            vscode.window.showInformationMessage(
              `Unable to print: No permission to use port ${port}. \
Please set different port number in User Settings: printcode.webServerPort \
and Reload Window.`
            );
          }
          server.close();
          server = null;
          portNumberInUse = null;
          return console.log(err);
        });
        server.on("request", (request, response) => {
          response.on("finish", () => {
            request.socket.destroy();
          });
        });

        server.listen(port, () => {});
        portNumberInUse = port;
        setTimeout(function() {
          printIt();
        }, 100);
      } else {
        printIt();
      }

      function printIt() {
        if (!server) {
          return;
        }

        let editor = vscode.window.activeTextEditor;
        let language = editor.document.languageId;
        var mode = resolveAliases(language);
        let url = "http://localhost:" + port + "/?mode=" + mode;

        let browserPath = vscode.workspace
          .getConfiguration("printcode")
          .get("browserPath");
        if (browserPath != "") {
          child_process.exec('"' + browserPath + '" ' + url);
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
      }
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

const requestHandler = (request, response) => {
  if (request.url.replace(/\?mode\=.*$/, "") == "/") {
    let editor = vscode.window.activeTextEditor;
    if (editor == undefined) {
      return;
    }
    let html = getHtml(editor);
    response.end(html);
  } else if (/^\/_node_modules/.test(request.url)) {
    let file = path.join(
      __dirname,
      "..",
      request.url.replace("/_node_modules", "node_modules")
    );
    fs.readFile(file, "utf8", (err, text) => {
      if (err) {
        response.end(err.code + ": " + err.message);
      }
      response.end(text);
    });
  } else {
    response.end("");
  }
}; // PRINTCODE_SKIPBEFORE // example tag -- anything before that will not be printed

function getHtml(editor) {
  let myConfig = vscode.workspace.getConfiguration("printcode", null);
  let useTrueLineNumbers = myConfig.get("useTrueLineNumbers");
  let skipBeforeTag = myConfig.get("skipBeforeTag");
  let skipAfterTag = myConfig.get("skipAfterTag");

  let language = editor.document.languageId;
  let text = editor.document.getText();

  let skipBeforeMatch = new RegExp(skipBeforeTag);
  if (text.match(skipBeforeMatch)) {
    let actualLines = (text.match(/\r?\n/g) || '').length + 1;
    let replaceBeforeMatch = new RegExp(`^[\\s\\S]+${skipBeforeTag}\\S*\\s*`, "m");
    text = text.replace(replaceBeforeMatch, "");
    let printingLines = (text.match(/\r?\n/g) || '').length + 1;
    if (useTrueLineNumbers) {
      firstLineNumber = actualLines - printingLines + 1;
    } else {
      firstLineNumber = 1;
    }
  }
  let skipAfterMatch = new RegExp(skipAfterTag);
  if (text.match(skipAfterMatch)) {
    // matching several variations of comments from different languages
    let replaceAfterMatch = new RegExp(`\\s*\\S*[/*#/'%!-]*\\s*${skipAfterTag}[\\s\\S]+`, "m");
    text = text.replace(replaceAfterMatch, "");
  }

  let html = buildHtml(text, language);
  return html;
} // PRINTCODE_SKIPAFTER example tag -- anything after that will not be printed

function buildHtml(text, language) {
  var body = text.EscapeForJSON();
  var mode = resolveAliases(language);

  let css = "/_node_modules/codemirror/lib/codemirror.css";
  let js = "/_node_modules/codemirror/lib/codemirror.js";
  let lang = "/_node_modules/codemirror/mode/" + mode + "/" + mode + ".js";

  // these could be moved to package.json as configuration objects
  let paperSpecs = {
    a3: {
      name: "A3",
      width: "297mm"
    },
    a3Land: {
      name: "A3 landscape",
      width: "420mm"
    },
    a4: {
      name: "A4",
      width: "210mm"
    },
    a4Land: {
      name: "A4 landscape",
      width: "297mm"
    },
    a5: {
      name: "A5",
      width: "148mm"
    },
    a5Land: {
      name: "A5 landscape",
      width: "210mm"
    },
    letter: {
      name: "letter",
      width: "216mm"
    },
    letterLand: {
      name: "letter landscape",
      width: "280mm"
    },
    legal: {
      name: "legal",
      width: "216mm"
    },
    legalLand: {
      name: "legal landscape",
      width: "357mm"
    }
  };

  // for htmlmixed
  let xml = "/_node_modules/codemirror/mode/xml/xml.js";
  let javascript = "/_node_modules/codemirror/mode/javascript/javascript.js";
  let stylesheet = "/_node_modules/codemirror/mode/css/css.js";

  // for htmlembedded
  let multiplex = "/_node_modules/codemirror/addon/mode/multiplex.js";
  let htmlmixed = "/_node_modules/codemirror/mode/htmlmixed/htmlmixed.js";

  // for clikes
  let clike = "/_node_modules/codemirror/mode/clike/clike.js";

  let myConfig = vscode.workspace.getConfiguration("printcode", null);
  let tabSize = myConfig.get("tabSize");
  let fontSize = myConfig.get("fontSize");
  let fontFamily = vscode.workspace
    .getConfiguration("editor", null)
    .get("fontFamily");
  let disableTelemetry = myConfig.get("disableTelemetry");
  let printFilePath = myConfig.get("printFilePath");
  let lineNumbers = myConfig.get("lineNumbers");
  let autoPrint = myConfig.get("autoPrint");
  let printInfo = "vscode.printcode";

  let paperSize = myConfig.get("paperSize");
  paperSize = paperSpecs[paperSize] === undefined ? "a4" : paperSize;

  let lineNumbering = "true";
  if (
    lineNumbers === "off" ||
    (lineNumbers === "editor" &&
      vscode.workspace.getConfiguration("editor", null).get("lineNumbers") ===
        "off")
  ) {
    lineNumbering = "false";
  }

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

  switch (printFilePath) {
    case "none":
      // show legacy document title
      break;
    case "full":
      printInfo = filePath;
      break;
    case "relative":
    case "pretty":
      // partial path relative to workspace root
      if (folder) {
        printInfo = filePath.replace(folderPath, "").substr(1);
      } else {
        // or should we show full path if no relative path available?
        printInfo = path.basename(filePath);
      }
      break;
    default:
      // default matches config default value "filename" and anything else
      printInfo = path.basename(filePath);
  }
  // skip HTML encoding of '&' and '<' since they're quite rare in filenames

  let printPopup = autoPrint ? `window.print();` : "";

  let googleAnalyticsSnipplet = disableTelemetry
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
    <title>${printInfo}</title>

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
            width: ${paperSpecs[paperSize].width};
        }
        body { margin: 0; padding: 0; }
        @page {
            size: ${paperSpecs[paperSize].name};
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
                lineNumbers: ${lineNumbering},
                firstLineNumber: ${firstLineNumber},
                lineWrapping: true,
                tabSize: ${tabSize},
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
}

function resolveAliases(language) {
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
String.prototype.EscapeForJSON = function() {
  return ("" + this).replace(/\W/g, function(c) {
    return "\\u" + ("000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
};
