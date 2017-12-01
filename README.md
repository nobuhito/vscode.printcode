# PrintCode - Extension of VS Code

PrintCode added printing function to VS Code!!

[日本語 README](https://github.com/nobuhito/vscode.printcode/blob/master/README.ja.md)

![image](https://github.com/nobuhito/vscode.printcode/blob/master/printcode.gif)

## Marketplace

https://marketplace.visualstudio.com/items?itemName=nobuhito.printcode

## Features

PrintCode temporarily saves the code displayed in the VS Code as an HTML file and displays it by the browser and prints it.

## Usage

1. Press the `F1` key
2. Select or Type `PrintCode`
3. The browser launches and displays the code
4. A print dialog opens and you can print!!

## Configuration Options

Key      | Default | Description
---------|--------:|-------------
tabSize  |       2 | The number of spaces a tab is equal to
fontSize |      12 | Controls the font size in pixels

## Notes

The Internet environment is necessary for using PrintCode.

The created HTML file gets [CodeMirror][] library from CDN. This is to avoid the [limitation][issue47416] that Chrome can not read local files.

[CodeMirror]: http://codemirror.net/
[issue47416]: https://bugs.chromium.org/p/chromium/issues/detail?id=47416

## Release Notes

### 1.0.0

Initial release of PrintCode.