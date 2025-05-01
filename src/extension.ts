import { exec } from 'child_process';
import * as vscode from 'vscode';
import { parseOutput as parseMhLintOutput } from './parsers/mh_lint_parser';
import { parseOutput as parseMhStyleOutput } from './parsers/mh_style_parser';

const lintDiagnostics = vscode.languages.createDiagnosticCollection('misshit-lint');
const styleDiagnostics = vscode.languages.createDiagnosticCollection('misshit-style');

function runMhLint(document: vscode.TextDocument, collection: vscode.DiagnosticCollection, severity: vscode.DiagnosticSeverity) {
    return new Promise<void>((resolve) => {
        const env = { ...process.env, PYTHONIOENCODING: 'UTF-8' };

        exec(`mh_lint "${document.fileName}"`, {env}, (error, stdout, stderr) => {
            if (error && !stdout) {
                vscode.window.showErrorMessage(`[MISS_HIT] mh_lint failed: ${stderr}`);
                collection.set(document.uri, []);
                return resolve();
            }

            const diagnostics = parseMhLintOutput(stdout, severity);
            collection.set(document.uri, diagnostics);
            resolve();
        });
    });
}

function runMhStyle(document: vscode.TextDocument, collection: vscode.DiagnosticCollection, severity: vscode.DiagnosticSeverity) {
    return new Promise<void>((resolve) => {
        const env = { ...process.env, PYTHONIOENCODING: 'UTF-8' };
        
        exec(`mh_style --fix "${document.fileName}"`, {env}, (error, stdout, stderr) => {
            if (error && !stdout) {
                vscode.window.showErrorMessage(`[MISS_HIT] mh_style failed: ${stderr}`);
                collection.set(document.uri, []);
                return resolve();
            }

            const diagnostics = parseMhStyleOutput(stdout, severity);
            collection.set(document.uri, diagnostics);
            resolve();
        });
    });
}

async function lintAndStyle(document: vscode.TextDocument) {
    if (document.languageId !== 'matlab') {
        return;
    }
    await runMhLint(document, lintDiagnostics, vscode.DiagnosticSeverity.Warning);
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
}

export function deactivate() {
    lintDiagnostics.dispose();
    styleDiagnostics.dispose();
}
