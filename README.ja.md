# PrintCode - Extension of VS Code

VS Code に印刷機能を追加！

[README for English](https://github.com/nobuhito/vscode.printcode/blob/master/README.ja.md)

[日本語Blog](https://about.gitlab.com/2017/12/04/illustrations-and-icons-on-gitlab-com/)

![image](https://raw.githubusercontent.com/nobuhito/vscode.printcode/master/printcode.gif?raw=true)

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

Key           | Default | Description
--------------|--------:|-------------
tabSize       |       2 | タブの表示スペースサイズ
fontSize      |      12 | 印刷時のフォントサイズ
browserPath   |    none | デフォルトブラウザ以外で開く場合のパス
webServerPort |    3000 | ローカルWebServerのポートナンバー

## Notes

ブラウザ上にはAdSenseが表示されますが、印刷物には表示されません。

AdSenseの表示が不要な方はGitHubよりクローンして自分で修正することも出来ます😁

## Release Notes

See [Changelog](https://github.com/nobuhito/vscode.printcode/blob/master/CHANGELOG.md).
