const vscode = require("vscode");
const http = require("http");
const content = require("./content");
const path = require("path");
const fs = require("fs");
const config = require("./config").get();

let server = null;
let portNumberInUse = null;

exports.run = function() {
  return new Promise((resolve, reject) => {
    if (server !== null && config.port !== portNumberInUse) {
      server.close(function() {});
      server = null;
    }

    if (server == null) {
      server = http.createServer(requestHandler);
      server.on("error", function(err) {
        if (err) {
          if (err.code === "EADDRINUSE") {
            vscode.window.showInformationMessage(
              `Unable to print: Port ${config.port} is in use. \
Please set different port number in User Settings: printcode.webServerPort \
and Reload Window, or end the process reserving the port.`
            );
          } else if (err.code === "EACCES") {
            vscode.window.showInformationMessage(
              `Unable to print: No permission to use port ${config.port}. \
Please set different port number in User Settings: printcode.webServerPort \
and Reload Window.`
            );
          }
          server.close();
          server = null;
          portNumberInUse = null;
          reject();
        }
      });

      server.on("request", (request, response) => {
        response.on("finish", () => {
          request.socket.destroy();
        });
      });

      server.listen(config.webServerPort);
    }

    resolve();
  });
};

let requestHandler = (request, response) => {
  if (request.url.replace(/\?mode\=.*$/, "") == "/") {
    let editor = vscode.window.activeTextEditor;
    if (editor == undefined) {
      return;
    }

    let language = editor.document.languageId;
    let text = editor.document.getText();
    let html = content.build(text, language);
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
};
