import fs from 'fs';
import { execSync } from 'child_process';

export function findChromePath() {
    try {
        const result = execSync('where chrome.exe').toString();
        const path = result.split('\n')[0].trim();
        if (path && fs.existsSync(path)) {
            return path;
        }
    } catch (e) { }

    const possiblePaths = [
        process.env['ProgramFiles'] ? `${process.env['ProgramFiles']}\\Google\\Chrome\\Application\\chrome.exe` : null,
        process.env['ProgramFiles(x86)'] ? `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe` : null,
        process.env['LOCALAPPDATA'] ? `${process.env['LOCALAPPDATA']}\\Google\\Chrome\\Application\\chrome.exe` : null
    ].filter(path => path && fs.existsSync(path));

    if (possiblePaths.length > 0) {
        return possiblePaths[0];
    }

    return null;
}