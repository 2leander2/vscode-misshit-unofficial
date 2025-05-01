import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

export function getActualFileUri(inputUri: vscode.Uri): vscode.Uri | null {
    // On Windows, paths are case-insensitive, but the file system may have a different case.
    // Without this, miss_hit may not match the file name correctly.
    if (os.platform() !== 'win32') {
        return null;
    }
    
    const dir = path.dirname(inputUri.fsPath);
    const baseNameLower = path.basename(inputUri.fsPath).toLowerCase();

    try {
        const files = fs.readdirSync(dir);
        const realName = files.find(f => f.toLowerCase() === baseNameLower);

        if (realName) {
            return vscode.Uri.file(path.join(dir, realName));
        }
    } catch (err) {
        console.error(`Failed to resolve actual file name for: ${inputUri.fsPath}`, err);
    }

    return null;
}
