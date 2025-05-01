import { exec } from 'child_process';
import * as vscode from 'vscode';

// Diagnostic collections for lint and style separately
const lintDiagnostics = vscode.languages.createDiagnosticCollection('misshit-lint');
const styleDiagnostics = vscode.languages.createDiagnosticCollection('misshit-style');

function parseMissHitOutput(output: string, severity: vscode.DiagnosticSeverity): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];

    const lines = output.split('\n');
    for (const line of lines) {
        const match = line.match(/^(.+):(\d+):(\d+):\s+(.*)$/);
        if (match) {
            const [, file, lineStr, colStr, message] = match;
            const lineNum = parseInt(lineStr, 10) - 1;
            const colNum = parseInt(colStr, 10) - 1;

            const range = new vscode.Range(
                new vscode.Position(lineNum, colNum),
                new vscode.Position(lineNum, colNum + 1)
            );

            diagnostics.push(new vscode.Diagnostic(range, message, severity));
        }
    }

    return diagnostics;
}

function runMissHit(command: string, document: vscode.TextDocument, collection: vscode.DiagnosticCollection, severity: vscode.DiagnosticSeverity) {
    return new Promise<void>((resolve) => {
        exec(`${command} "${document.fileName}"`, (error, stdout, stderr) => {
            if (error && !stdout) {
                vscode.window.showErrorMessage(`[MISS_HIT] ${command} failed: ${stderr}`);
                collection.set(document.uri, []);
                return resolve();
            }

            const diagnostics = parseMissHitOutput(stdout, severity);
            collection.set(document.uri, diagnostics);
            resolve();
        });
    });
}

async function lintAndStyle(document: vscode.TextDocument) {
    if (document.languageId !== 'matlab') {
        return;
    }

    await runMissHit('mh_lint', document, lintDiagnostics, vscode.DiagnosticSeverity.Warning);
    await runMissHit('mh_style', document, styleDiagnostics, vscode.DiagnosticSeverity.Information);
}

export function activate(context: vscode.ExtensionContext) {
    // Run on save
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
            lintAndStyle(document);
        })
    );

    // Command to manually run
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
