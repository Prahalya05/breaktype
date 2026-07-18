import { createFreshDB, SCHEMA_VERSION, type BreakTypeDB } from './schema'

const STORAGE_KEY = 'breaktype:data'

// Each entry migrates from its index version to index+1. v1 is the initial
// release, so there is nothing to migrate yet — this stub exists so future
// schema changes have somewhere to go without breaking existing users' data.
const migrations: Array<(old: unknown) => BreakTypeDB> = []

export function loadDB(): BreakTypeDB {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return createFreshDB()

  try {
    let parsed = JSON.parse(raw) as { schemaVersion?: number }
    let version = parsed.schemaVersion ?? 0
    while (version < SCHEMA_VERSION) {
      const migrate = migrations[version]
      if (!migrate) break
      parsed = migrate(parsed)
      version = parsed.schemaVersion ?? version + 1
    }
    return parsed as BreakTypeDB
  } catch (err) {
    console.warn('breaktype: failed to load/migrate local data, starting fresh', err)
    return createFreshDB()
  }
}

export function saveDB(db: BreakTypeDB): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}
