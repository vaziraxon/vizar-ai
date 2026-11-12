// In-memory stand-in for the service-role Supabase client, covering only the
// query-builder calls the AI beta code makes. It also enforces the database's
// "one open voice session per user" unique index (error code 23505).
import { randomUUID } from "node:crypto";

export const db = {
  tables: { ai_beta_users: [], ai_settings: [], ai_usage: [], voice_sessions: [], interview_questions: [] },
  nextUsageId: 1,
  reset() {
    for (const k of Object.keys(this.tables)) this.tables[k] = [];
    this.nextUsageId = 1;
    this.tables.ai_settings.push({
      id: 1,
      monthly_budget_usd: 5,
      claude_enabled: true,
      voice_enabled: true,
      voice_model: "gpt-realtime-2.1-mini",
      sweep_token: "11111111-2222-3333-4444-555555555555",
    });
  },
};
db.reset();

const DEFAULTS = {
  ai_usage: () => ({ id: db.nextUsageId++, input_tokens: 0, output_tokens: 0, seconds: 0, cost_usd: 0, created_at: new Date().toISOString() }),
  voice_sessions: () => ({ id: randomUUID(), remote_id: null, ended_at: null, end_reason: null, seconds_used: null, cost_usd: null, evaluation: null }),
};

function pick(row, columns) {
  if (!columns || columns === "*") return { ...row };
  const out = {};
  for (const c of columns.split(",").map((s) => s.trim()).filter(Boolean)) out[c] = row[c];
  return out;
}

class Query {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.op = "select";
    this.columns = "*";
    this.countMode = null;
    this.head = false;
    this.mode = "many";
    this.orderBy = null;
    this.max = null;
    this.returning = false;
  }
  select(columns = "*", opts = {}) {
    if (this.op === "select") {
      this.columns = columns;
      this.countMode = opts.count ?? null;
      this.head = Boolean(opts.head);
    } else {
      this.returning = true;
      this.columns = columns;
    }
    return this;
  }
  insert(values) {
    this.op = "insert";
    this.values = Array.isArray(values) ? values : [values];
    return this;
  }
  update(values) {
    this.op = "update";
    this.values = values;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }
  eq(c, v) {
    this.filters.push((r) => r[c] === v);
    return this;
  }
  is(c, v) {
    this.filters.push((r) => (v === null ? r[c] === null || r[c] === undefined : r[c] === v));
    return this;
  }
  not(c, op, v) {
    if (op === "is" && v === null) this.filters.push((r) => r[c] !== null && r[c] !== undefined);
    return this;
  }
  gte(c, v) {
    this.filters.push((r) => String(r[c]) >= String(v));
    return this;
  }
  in(c, list) {
    this.filters.push((r) => list.includes(r[c]));
    return this;
  }
  order(c, opts = {}) {
    this.orderBy = { c, asc: opts.ascending !== false };
    return this;
  }
  limit(n) {
    this.max = n;
    return this;
  }
  returns() {
    return this;
  }
  maybeSingle() {
    this.mode = "maybe";
    return this;
  }
  single() {
    this.mode = "single";
    return this;
  }
  rows() {
    return db.tables[this.table].filter((r) => this.filters.every((f) => f(r)));
  }
  run() {
    const table = db.tables[this.table];
    let data;
    if (this.op === "insert") {
      const inserted = [];
      for (const v of this.values) {
        const row = { ...(DEFAULTS[this.table]?.() ?? {}), ...v };
        if (this.table === "voice_sessions" && !row.ended_at && table.some((r) => r.user_id === row.user_id && !r.ended_at)) {
          return { data: null, error: { code: "23505", message: "duplicate key value violates unique constraint voice_sessions_one_active" } };
        }
        if (this.table === "ai_beta_users") {
          if (table.some((r) => r.user_id === row.user_id)) return { data: null, error: { code: "23505", message: "duplicate" } };
          if (table.length >= 25) return { data: null, error: { code: "23514", message: "AI beta is limited to 25 users" } };
        }
        table.push(row);
        inserted.push(row);
      }
      data = inserted;
    } else if (this.op === "update") {
      data = this.rows();
      for (const r of data) Object.assign(r, this.values);
    } else if (this.op === "delete") {
      data = this.rows();
      db.tables[this.table] = table.filter((r) => !data.includes(r));
    } else {
      data = this.rows();
      if (this.orderBy) {
        const { c, asc } = this.orderBy;
        data = [...data].sort((a, b) => (String(a[c]) < String(b[c]) ? -1 : String(a[c]) > String(b[c]) ? 1 : 0) * (asc ? 1 : -1));
      }
      if (this.max !== null) data = data.slice(0, this.max);
    }
    const count = data.length;
    if (this.op !== "select" && !this.returning) return { data: null, error: null };
    data = data.map((r) => pick(r, this.columns));
    if (this.head) return { data: null, error: null, count };
    if (this.mode === "single") return data.length === 1 ? { data: data[0], error: null } : { data: null, error: { code: "PGRST116", message: "not one row" } };
    if (this.mode === "maybe") return { data: data[0] ?? null, error: null };
    return { data, error: null, count: this.countMode ? count : null };
  }
  then(resolve, reject) {
    try {
      resolve(this.run());
    } catch (e) {
      reject(e);
    }
  }
}

export const fakeClient = { from: (table) => new Query(table) };

export function createAdminClient() {
  return fakeClient;
}
