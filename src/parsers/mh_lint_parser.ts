import * as vscode from 'vscode';

export function parseOutput(output: string): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const regex = /In (.*?), line (\d+)\r?\n\|\s*(.*?)\r?\n\|(\s*)(\^+)\s+check\s+\((\w+)\):\s+(.*?)\s*\[(.+?)\]/gs;
    const matches = [...output.matchAll(regex)];
    
    const results = matches.map(m => {
        const level = m[6].toLowerCase();
        let mappedSeverity : vscode.DiagnosticSeverity;
        
        switch(level) {
            case "low":
                mappedSeverity = vscode.DiagnosticSeverity.Information;
                break;
            case "medium":
                mappedSeverity = vscode.DiagnosticSeverity.Warning;
                break;
            case "high":
                mappedSeverity = vscode.DiagnosticSeverity.Error;
                break;
            default:
                mappedSeverity = vscode.DiagnosticSeverity.Information;
        }
        
        return {
            filePath: m[1],
            line: parseInt(m[2], 10),
            code: m[3],
            columnStart: m[4].length,
            columnWidth: m[5].length,
            checkLevel: level,
            severity: mappedSeverity,
            message: m[7],
            tag: m[8],
        };
    });
    for (const result of results) {
        const { line, columnStart, columnWidth, severity, message, tag } = result;
        const range = new vscode.Range(
            new vscode.Position(line - 1, columnStart - 1),
            new vscode.Position(line - 1, columnStart - 1 + columnWidth)
        );
        
        const diagnostic = new vscode.Diagnostic(
            range,
            message,
            severity
        );
        
        if (tag) {
            diagnostic.code = tag;
        }
        diagnostic.source = 'mh_lint';
        
        diagnostics.push(diagnostic);
    }

    return diagnostics;
}
