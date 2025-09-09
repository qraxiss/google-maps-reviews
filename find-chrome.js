import fs from 'fs';
import { execSync } from 'child_process';

function findChrome() {
    try {
        const result = execSync('where chrome.exe').toString();
        const path = result.split('\n')[0].trim();
        if (path && fs.existsSync(path)) {
            return path;
        }
    } catch (e) { }

    try {
        const cmd = 'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe" /ve';
        const result = execSync(cmd).toString().trim().split('\n');
        const valueLine = result[result.length - 1].trim();
        const parts = valueLine.split('    ');
        if (parts.length >= 2) {
            const path = parts[1].trim().replace(/^"(.+)"$/, '$1');
            if (fs.existsSync(path)) {
                return path;
            }
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

console.log(findChrome());