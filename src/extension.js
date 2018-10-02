const vscode = require("vscode");
const command = require("./command.js");
const config = require("./config").get();

function activate(context) {
  let disposable = vscode.commands.registerCommand("extension.print", () => {
    console.log(command);
    console.log(config);
    command.print();
  });

  context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
