const vscode = require('vscode');
const tabCompletation = require('./completation.js')

function activate(context) {

    vscode.languages.registerCompletionItemProvider('mcfunction', {
        provideCompletionItems(document, position/*, token, context */) {

            if (document.lineAt(position.line).text.length !== 0) {
                let char = document.lineAt(position.line).text.charCodeAt(0);
                if (char < 97 || char > 122)
                    return [];
            } 

            return tabCompletation(document.lineAt(position.line).text, 0, position.character)
        }
    }, ...[".", ",", "[", "{", " ", "/", ":", "=", "!", "_", "#"])

    let disposable = vscode.commands.registerCommand('extension.sayHello', function () {

        vscode.window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;