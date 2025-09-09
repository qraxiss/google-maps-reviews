import { spawn } from 'child_process'
import { findChromePath } from './find-chrome.js';



export function spawnChrome(profile, link) {
  switch (process.platform) {
    case 'win32':
      {
        const path = findChromePath()

        const chrome = spawn(path, [
          `--profile-directory="${profile}"`,
          "--disable-features=DisableLoadExtensionCommandLineSwitch",
          '--load-extension=/Users/qraxisslemonhaze/Documents/GitHub/google-maps-reviews/browser-extension-client',
          link
        ]);

        return chrome
      }

    case 'darwin':
      {
        const chrome = spawn("open", [
          "-na",
          "Google Chrome",
          "--args",
          `--profile-directory="${profile}"`,
          "--disable-features=DisableLoadExtensionCommandLineSwitch",
          '--load-extension=/Users/qraxisslemonhaze/Documents/GitHub/google-maps-reviews/browser-extension-client',
          link
        ]);

        return chrome
      }

    default:
      break;
  }



}


