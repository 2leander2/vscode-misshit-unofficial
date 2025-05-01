import * as vscode from 'vscode';

export function parseOutput(output: string, severity: vscode.DiagnosticSeverity): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const regex = /In (.*?), line (\d+)\r?\n\|\s*(.*?)\r?\n\|(\s*)(\^+)\s+style:\s+(.*?)\s*\[(.+?)\]/gs;
    const matches = [...output.matchAll(regex)];
    
    const results = matches.map(m => ({
        filePath: m[1],
        line: parseInt(m[2], 10),
        code: m[3],
        columnStart: m[4].length,
        columnWidth: m[5].length,
        message: m[6],
        tag: m[7],
    }));

    for (const result of results) {
        const { line, columnStart, columnWidth, message, tag } = result;
        const range = new vscode.Range(
            new vscode.Position(line - 1, columnStart - 1),
            new vscode.Position(line - 1, columnStart - 1 + columnWidth) // Highlight the range of the pointer
        );
        
        const diagnostic = new vscode.Diagnostic(
            range,
            message,
            severity
        );
        
        if (tag) {
            diagnostic.code = tag;
        }
        diagnostic.source = 'MISS_HIT';
        
        diagnostics.push(diagnostic);
    }

    return diagnostics;
}