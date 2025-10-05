import { mainDb } from '../config/database.js';

const HINTS = [
  {
    id: 1,
    title: 'Table Enumeration',
    content: 'Start with simple tables like debug_flags (check is_active=1). But beware, not all flags are real! Try: SELECT * FROM debug_flags WHERE is_active=1',
  },
  {
    id: 2,
    title: 'Finding Hidden Tables',
    content: 'Look deeper: admin_panel, security_audit_logs, system_internal_config. The admin_panel table mentions a cipher method. Check: SELECT * FROM admin_panel WHERE setting_name LIKE "%cipher%"',
  },
  {
    id: 3,
    title: 'Decoding the Flag',
    content: 'The real flag is in system_internal_config with config_type="security_flag". It uses ROT13 cipher (Caesar shift by 13). To decode: A↔N, B↔O, etc. SYNT becomes FLAG.',
  },
];

const SECOND_HINT_DELAY = 300 * 1000; // 5 minutes
const THIRD_HINT_DELAY = 600 * 1000;  // 10 minutes

interface HintWithLock {
  id: number;
  title: string;
  content: string;
  unlocked: boolean;
  unlocksAt?: number;
}

export function getHintsForUser(userId: number): HintWithLock[] {
  const stmt = mainDb.prepare(`
    SELECT hints_opened, first_hint_opened_at, second_hint_opened_at
    FROM hint_states
    WHERE user_id = ?
  `);

  let state = stmt.get(userId) as any;

  if (!state) {
    const insertStmt = mainDb.prepare(`
      INSERT INTO hint_states (user_id, hints_opened)
      VALUES (?, '[]')
    `);
    insertStmt.run(userId);

    state = { hints_opened: '[]', first_hint_opened_at: null, second_hint_opened_at: null };
  }

  const hintsOpened: number[] = JSON.parse(state.hints_opened || '[]');
  const firstHintTime = state.first_hint_opened_at ? new Date(state.first_hint_opened_at).getTime() : null;
  const secondHintTime = state.second_hint_opened_at ? new Date(state.second_hint_opened_at).getTime() : null;
  const now = Date.now();

  return HINTS.map((hint) => {
    const unlocked = hintsOpened.includes(hint.id);

    let unlocksAt: number | undefined;

    if (!unlocked) {
      if (hint.id === 1) {
        unlocksAt = undefined;
      } else if (hint.id === 2) {
        if (!firstHintTime) {
          unlocksAt = Infinity;
        } else {
          unlocksAt = firstHintTime + SECOND_HINT_DELAY;
        }
      } else if (hint.id === 3) {
        if (!secondHintTime) {
          unlocksAt = Infinity;
        } else {
          unlocksAt = secondHintTime + THIRD_HINT_DELAY;
        }
      }
    }

    return {
      ...hint,
      unlocked,
      unlocksAt: unlocksAt !== undefined && unlocksAt !== Infinity ? unlocksAt : undefined,
    };
  });
}

export function unlockHint(userId: number, hintId: number): HintWithLock[] {
  const hints = getHintsForUser(userId);
  const hint = hints.find((h) => h.id === hintId);

  if (!hint) {
    throw new Error('Invalid hint ID');
  }

  if (hint.unlocked) {
    throw new Error('Hint already unlocked');
  }

  if (hint.unlocksAt && hint.unlocksAt > Date.now()) {
    const secondsRemaining = Math.ceil((hint.unlocksAt - Date.now()) / 1000);
    throw new Error(`Hint unlocks in ${secondsRemaining} seconds`);
  }

  const stmt = mainDb.prepare(`
    SELECT hints_opened, first_hint_opened_at, second_hint_opened_at
    FROM hint_states
    WHERE user_id = ?
  `);

  const state = stmt.get(userId) as any;
  const hintsOpened: number[] = JSON.parse(state.hints_opened || '[]');

  if (!hintsOpened.includes(hintId)) {
    hintsOpened.push(hintId);
  }

  const updates: any = {
    hints_opened: JSON.stringify(hintsOpened),
  };

  if (hintId === 1 && !state.first_hint_opened_at) {
    updates.first_hint_opened_at = new Date().toISOString();
  }

  if (hintId === 2 && !state.second_hint_opened_at) {
    updates.second_hint_opened_at = new Date().toISOString();
  }

  const updateStmt = mainDb.prepare(`
    UPDATE hint_states
    SET hints_opened = ?,
        first_hint_opened_at = COALESCE(?, first_hint_opened_at),
        second_hint_opened_at = COALESCE(?, second_hint_opened_at)
    WHERE user_id = ?
  `);

  updateStmt.run(
    updates.hints_opened,
    updates.first_hint_opened_at || null,
    updates.second_hint_opened_at || null,
    userId
  );

  return getHintsForUser(userId);
}