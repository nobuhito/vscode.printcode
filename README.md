![version](https://vsmarketplacebadge.apphb.com/version-short/nobuhito.printcode.svg)
![installs](https://vsmarketplacebadge.apphb.com/installs-short/nobuhito.printcode.svg)
![rating](https://vsmarketplacebadge.apphb.com/rating-short/nobuhito.printcode.svg)
![trendDaily](https://vsmarketplacebadge.apphb.com/trending-daily/nobuhito.printcode.svg)
![trendWeekly](https://vsmarketplacebadge.apphb.com/trending-weekly/nobuhito.printcode.svg)
![trandMonthly](https://vsmarketplacebadge.apphb.com/trending-monthly/nobuhito.printcode.svg)

# PrintCode - Extension of VS Code

You can print the code from VSCode!

[Product page](https://printcode.launchaco.com/)

[README for Japanese](https://github.com/nobuhito/vscode.printcode/blob/master/README.ja.md)

[Blog for Japanese](https://blog.bulkus.net/tags/printcode/)

![image](https://raw.githubusercontent.com/nobuhito/vscode.printcode/master/printcode.gif?raw=true)

## Marketplace

https://marketplace.visualstudio.com/items?itemName=nobuhito.printcode

## Features

PrintCode converts the code being edited into an HTML file, displays it by browser and prints it.

## Usage

1.  Press the `F1` key
2.  Select or type `PrintCode`
3.  The browser launches and displays the code
4.  A print dialog opens and you can print!!

## Configuration Options

| Key              |  Default | Description                                  |
| ---------------- | -------: | -------------------------------------------- |
| tabSize          |        2 | The number of spaces a tab is equal to       |
| fontSize         |       12 | Controls the font size in pixels             |
| paperSize        |       a4 | Paper size and orientation                   |
| lineNumbers      |       on | Print line numbers                           |
| useTrueLineNumbers |   true | When printing a region, don't start from 1   |
| skipBeforeTag    | PRINTCODE_SKIPBEFORE | Don't print anything before this string |
| skipAfterTag     | PRINTCODE_SKIPAFTER  | Don't print anything after this string  |
| printFilePath    | filename | Amount of file's path info in document title |
| browserPath      |     none | Open with your non-default browser           |
| webServerPort    |     4649 | Port number for local WebServer.             |
| disableTelemetry |    false | Dont't include Google Analytics code on page |
| autoPrint        |     true | Pop up print dialog automatically            |

## Release Notes

See [Changelog](https://github.com/nobuhito/vscode.printcode/blob/master/CHANGELOG.md).

## Thank you

@janilahti (#6, #7, #12)

I like [osushi/お寿司](https://osushi.love/nobuhito) very much.
