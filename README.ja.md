# PrintCode - Extension of VS Code

VS Code に印刷機能を追加！

[English README](https://github.com/nobuhito/vscode.printcode/blob/master/README.md)

![image](https://github.com/nobuhito/vscode.printcode/blob/master/printcode.gif?raw=true))

## Marketplace

https://marketplace.visualstudio.com/items?itemName=nobuhito.printcode

## Features

PrintCodeはVS Codeに表示しているコードをHTMLファイルとして一時保存し、それをブラウザで表示させて印刷します。

## Usage

1. `F1` キーを押す
2. `PrintCode` を選択もしくは入力
3. ブラウザが立ち上がってコードを表示
4. 印刷ダイアログが開き印刷できる！

## Configuration Options

Key      | Default | Description
---------|--------:|-------------
tabSize  |       2 | タブの表示スペースサイズ
fontSize |      12 | 印刷時のフォントサイズ

## Notes

PrintCodeの利用にはインターネット環境が必要です。

作成されたHTMLファイルはCDNから [CodeMirror][] ライブラリを取得します。 これはChromeがローカルファイルを読み込めない [制限][issue47416] を回避するためです。

[CodeMirror]: http://codemirror.net/
[issue47416]: https://bugs.chromium.org/p/chromium/issues/detail?id=47416

## Release Notes

### 1.0.0

PrintCodeを初めてリリース