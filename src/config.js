const vscode = require("vscode");

exports.get = () => {
  let config = new Config();
  return config;
};

class Config {
  // these could be moved to package.json as configuration objects
  constructor() {
    this.paperSpecs = {
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
        width: "215mm"
      },
      letterLand: {
        name: "letter landscape",
        width: "279mm"
      },
      legal: {
        name: "legal",
        width: "215mm"
      },
      legalLand: {
        name: "legal landscape",
        width: "356mm"
      }
    };

    let myConfig = vscode.workspace.getConfiguration("printcode", null);
    let editorConfig = vscode.workspace.getConfiguration("editor", null);

    this.tabSize = myConfig.get("tabSize");
    this.fontSize = myConfig.get("fontSize");
    this.fontFamily = editorConfig.get("fontFamily");

    this.disableTelemetry = myConfig.get("disableTelemetry");
    this.printFilePath = myConfig.get("printFilePath");
    this.autoPrint = myConfig.get("autoPrint");
    this.printInfo = "vscode.printcode";

    this.paperSize = myConfig.get("paperSize");
    this.paperSize =
      this.paperSpecs[this.paperSize] === undefined ? "a4" : this.paperSize;

    let lineNumbers = myConfig.get("lineNumbers");
    this.lineNumbering = "true";
    if (
      lineNumbers === "off" ||
      (lineNumbers === "editor" && editorConfig.get("lineNumbers") === "off")
    ) {
      this.lineNumbering = "false";
    }

    this.browserPath = myConfig.get("browserPath");

    this.webServerPort = myConfig.get("webServerPort");

    this.additionalStyleSheet = myConfig.get("additionalStyleSheet");
  }
}
