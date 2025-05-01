import * as vscode from 'vscode';

export function parseOutput(output: string, severity: vscode.DiagnosticSeverity): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    console.log(output);
    const lines = output.split('\n');
    let currentFile = '';
    let currentLine = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip summary line
        if (line.startsWith('MISS_HIT Style Summary')) {
            continue;
        }
        
        // Pattern 1: "In <filepath>, line <number>"
        const fileLineMatch = line.match(/^\s*In\s+(.+?),\s*line\s+(\d+)\s*$/);
        if (fileLineMatch) {
            currentFile = fileLineMatch[1];
            currentLine = parseInt(fileLineMatch[2], 10) - 1; // VSCode is 0-indexed
            continue;
        }
        
        // Pattern 2: The caret line showing error position
        const caretMatch = line.match(/^\|\s+([\s^]+)\s+style:\s+(.+)\s+\[(.+?)\]$/);
        if (caretMatch && currentLine >= 0) {
            const caretLine = caretMatch[1];
            const message = caretMatch[2];
            const rule = caretMatch[3];
            
            // Find start and end columns from the caret marks
            const startCol = caretLine.indexOf('^');
            const endCol = caretLine.lastIndexOf('^') + 1;
            
            if (startCol !== -1) {
                const range = new vscode.Range(
                    new vscode.Position(currentLine, startCol),
                    new vscode.Position(currentLine, endCol)
                );
                
                const diagnostic = new vscode.Diagnostic(
                    range,
                    message,
                    severity
                );
                
                diagnostic.source = 'style checker';
                diagnostic.code = rule;
                
                diagnostics.push(diagnostic);
            }
            continue;
        }
        
        // Skip code line (starts with "| " but isn't an error line)
        if (line.startsWith('| ')) {
            continue;
        }
        
        // Pattern 3: "<filepath>:<line>: style: <message> [<rule>]"
        // Updated to handle [fixed] and other variations
        const simpleMatch = line.match(/^(.+?):(\d+):\s+style:\s+(.+?)\s+\[(.+?)\]$/);
        if (simpleMatch) {
            const filePath = simpleMatch[1];
            const lineNum = parseInt(simpleMatch[2], 10) - 1; // VSCode is 0-indexed
            const message = simpleMatch[3];
            const rule = simpleMatch[4];
            
            // For this pattern, we don't have specific column info, so we'll use the whole line
            const range = new vscode.Range(
                new vscode.Position(lineNum, 0),
                new vscode.Position(lineNum, 100) // Large enough to cover most lines
            );
            
            const diagnostic = new vscode.Diagnostic(
                range,
                message,
                severity
            );
            
            diagnostic.source = 'style checker';
            diagnostic.code = rule;
            
            diagnostics.push(diagnostic);
        }
    }
    
    return diagnostics;
}