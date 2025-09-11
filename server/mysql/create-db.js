import { exec } from 'child_process'
import { SQLPath } from './read-sql.js';

const sqlFilePath = SQLPath('create-db.sql');

const command = `sudo mysql -u root < ${sqlFilePath}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Error setting up database.');
    console.error(error.message);
    process.exit(1);
  }

  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
});