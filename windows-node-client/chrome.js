import fs from 'fs';
import { exec, execSync, spawn as spawnProcess } from 'child_process';
import { join } from 'path'

function spawn(profile, link) {
    const chromeArgs = [
        // `--profile-directory="${profile}"`,
        "--disable-features=DisableLoadExtensionCommandLineSwitch",
        `--load-extension=${join(import.meta.dirname, '..', 'browser-extension-client')}`,
        '--window-size=1920,1080',
        '--window-position=100,100',
        link
    ]


    switch (process.platform) {
        case 'win32':
            {
                const path = findPath()
                const chrome = spawnProcess(path, chromeArgs);
                return chrome
            }

        case 'darwin':
            {
                const chrome = spawnProcess("open", [
                    "-na",
                    "Google Chrome",
                    "--args",
                    ...chromeArgs
                ]);

                return chrome
            }

        default:
            break;
    }



}

function kill() {
    switch (process.platform) {
        case 'win32':
            exec('taskkill /F /IM chrome.exe /T')
            break;

        case 'darwin':
            exec("pkill -f 'Google Chrome'")
            break;

        default:
            break;
    }
}

function findPath() {
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

export default {
    spawn, kill
}
