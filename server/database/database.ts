import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
const databasePath = join(import.meta.dirname, "database.json");

const schema = {
  devices: [],
};

let database: schema;
if (!existsSync(databasePath)) {
  writeFileSync(databasePath, JSON.stringify(schema));
  database = schema;
} else {
  database = JSON.parse(readFileSync(databasePath).toString());
}

setInterval(() => writeFileSync(databasePath, JSON.stringify(database)), 1000);

export function newDevice(ID: string, profiles: profile[]) {
  const device = database.devices.find((device) => device.ID === ID);

  if (!device) {
    return;
  }

  database.devices.push({
    ID,
    profiles,
  });
}

type device = {
  ID: string;
  profiles: profile[];
};

type profile = string;

type schema = {
  devices: device[];
};
