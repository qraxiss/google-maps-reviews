import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export function SQLPath(SQLFile) {
    return join(import.meta.dirname, '..', 'sql', SQLFile)
}

export function readSQL(SQLFile) {
    const path = SQLPath(SQLFile)

    if (!existsSync(path)) {
        throw new Error('SQL file not found!')
    }

    return readFileSync(path).toString()
}