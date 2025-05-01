import { exec } from 'child_process';
import * as vscode from 'vscode';
import { parseOutput as parseMhLintOutput } from './parsers/mh_lint_parser';
import { parseOutput as parseMhStyleOutput } from './parsers/mh_style_parser';
import { getActualFileUri } from './utils/file_utils';

const lintDiagnostics = vscode.languages.createDiagnosticCollection('misshit-lint');
const styleDiagnostics = vscode.languages.createDiagnosticCollection('misshit-style');

function runMhLint(document: vscode.TextDocument, collection: vscode.DiagnosticCollection) {
    return new Promise<void>((resolve) => {
        const env = { ...process.env, PYTHONIOENCODING: 'UTF-8' };
        const actualUri = getActualFileUri(document.uri) || document.uri;
        exec(`mh_lint "${actualUri.fsPath}"`, { env, encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error && !stdout) {
                vscode.window.showErrorMessage(`[MISS_HIT] mh_lint failed: ${stderr}`);
                collection.set(actualUri, []);
                return resolve();
            }

            const diagnostics = parseMhLintOutput(stdout);
            collection.set(actualUri, diagnostics);
            resolve();
        });
    });
}

function runMhStyle(document: vscode.TextDocument, collection: vscode.DiagnosticCollection, severity: vscode.DiagnosticSeverity) {
    return new Promise<void>((resolve) => {
        const env = { ...process.env, PYTHONIOENCODING: 'UTF-8' };
        const actualUri = getActualFileUri(document.uri) || document.uri;
        exec(`mh_style --fix "${actualUri.fsPath}"`, { env, encoding: 'utf8' }, (error, stdout, stderr) => {
            if (error && !stdout) {
                vscode.window.showErrorMessage(`[MISS_HIT] mh_style failed: ${stderr}`);
                collection.set(actualUri, []);
                return resolve();
            }

            const diagnostics = parseMhStyleOutput(stdout, severity);
            collection.set(actualUri, diagnostics);
            resolve();
        });
    });
}

async function lintAndStyle(document: vscode.TextDocument) {
    if (document.languageId !== 'matlab') {
        return;
    }
    await runMhLint(document, lintDiagnostics);
    await runMhStyle(document, styleDiagnostics, vscode.DiagnosticSeverity.Information);
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
            lintAndStyle(document);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-misshit-unofficial.lintAndStyle', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                lintAndStyle(editor.document);
            }
        })
    );
    
    context.subscriptions.push(
        vscode.workspace.onDidRenameFiles((event) => {
            for (const file of event.files) {
                lintDiagnostics.delete(file.oldUri);
                styleDiagnostics.delete(file.oldUri);
            }
        })
    );
    
    context.subscriptions.push(
        vscode.workspace.onDidDeleteFiles((event) => {
            for (const file of event.files) {
                lintDiagnostics.delete(file);
                styleDiagnostics.delete(file);
            }
        })
    );
}

export function deactivate() {
    lintDiagnostics.dispose();
    styleDiagnostics.dispose();
}
