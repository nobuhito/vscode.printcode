exports.resolveAliases = function(language) {
  const codemirror = require("codemirror/addon/runmode/runmode.node.js");
  require("codemirror/mode/meta.js");

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
};
