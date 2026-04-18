/**
 * Ztelier Common Kit — Context Loader
 * v1.0.0 (2026-04-17)
 *
 * ztelier-context.json の読み込みと軽量バリデーションを提供。
 * - localStorage（セッション継続）
 * - ファイルアップロード（別会場 / 他端末 からの持込）
 * - 空テンプレート生成（新規セッション開始）
 *
 * 依存なし。ブラウザ標準API（localStorage / File API）のみ使用。
 *
 * 使い方:
 *   // 既存セッション読み込み
 *   const ctx = ZtelierContext.load('aw-20260417-company-a');
 *
 *   // 空テンプレート
 *   const ctx = ZtelierContext.empty({ session_id: 'aw-...', company_name: '...' });
 *
 *   // ファイルから読込
 *   const ctx = await ZtelierContext.loadFromFile(fileInput.files[0]);
 *
 *   // バリデーション（エラーがあれば配列で返る、空配列ならOK）
 *   const errors = ZtelierContext.validate(ctx);
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    // Writer との相互参照のため、既存の ZtelierContext があればマージ
    global.ZtelierContext = Object.assign({}, global.ZtelierContext || {}, factory());
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SCHEMA_VERSION   = '1.1.0';
  const ZTELIER_VERSION  = '1.1.0';
  const STORAGE_PREFIX   = 'ztelier-context:';   // localStorage キー接頭辞
  const STORAGE_INDEX    = 'ztelier-context:__index__';  // セッションID一覧

  // ============================================================
  // Empty / Seed
  // ============================================================

  /**
   * 空の Ztelier Context を生成する。
   * @param {{session_id?: string, company_name?: string, created_by?: string}} [seed]
   * @returns {Object} 空テンプレート
   */
  function empty(seed) {
    const now = new Date().toISOString();
    const sessionId = (seed && seed.session_id) || _generateSessionId(seed && seed.company_name);

    return {
      meta: {
        schema_version: SCHEMA_VERSION,
        ztelier_version: ZTELIER_VERSION,
        session_id: sessionId,
        created_at: now,
        updated_at: now,
        created_by: (seed && seed.created_by) || null
      },
      customer: {
        company_name: (seed && seed.company_name) || '',
        industry: null,
        industry_label: null,
        employee_count_range: null,
        annual_revenue_range: null,
        headquarters_location: null,
        current_zscaler_status: null,
        aw_context: null
      },
      amplify:  { completed: false },
      maaz:     { completed: false },
      showtoku: { completed: false },
      forg:     { completed: false },
      endeavor: { completed: false }
    };
  }

  function _generateSessionId(companyName) {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const slug = (companyName || 'unnamed')
      .toLowerCase()
      .replace(/[^a-z0-9ぁ-んァ-ヶ一-龠]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'unnamed';
    return `aw-${yyyy}${mm}${dd}-${slug}`;
  }

  // ============================================================
  // LocalStorage I/O
  // ============================================================

  /**
   * localStorage から Context を読み込む。
   * 存在しない場合は null を返す。
   * @param {string} sessionId
   * @returns {Object|null}
   */
  function load(sessionId) {
    if (!sessionId) throw new Error('[ZtelierContext.load] sessionId is required');
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + sessionId);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('[ZtelierContext.load] failed:', e);
      return null;
    }
  }

  /**
   * localStorage 保存済みの全セッションIDを返す。
   * @returns {string[]}
   */
  function listSessions() {
    try {
      const raw = localStorage.getItem(STORAGE_INDEX);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      // インデックス破損時は個別キーから再構築
      const result = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX) && k !== STORAGE_INDEX) {
          result.push(k.slice(STORAGE_PREFIX.length));
        }
      }
      return result;
    }
  }

  // ============================================================
  // File I/O
  // ============================================================

  /**
   * File オブジェクト（<input type="file">）から Context を読み込む。
   * @param {File} file
   * @returns {Promise<Object>}
   */
  function loadFromFile(file) {
    if (!file) return Promise.reject(new Error('[ZtelierContext.loadFromFile] file is required'));

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const ctx = JSON.parse(String(reader.result));
          const errors = validate(ctx);
          if (errors.length > 0) {
            const summary = errors.slice(0, 3).map(e => `- ${e.path}: ${e.message}`).join('\n');
            console.warn(`[ZtelierContext.loadFromFile] ${errors.length} validation issues:\n${summary}`);
          }
          resolve(ctx);
        } catch (e) {
          reject(new Error(`JSON parse failed: ${e.message}`));
        }
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsText(file, 'utf-8');
    });
  }

  // ============================================================
  // Validation（軽量版 — ajv 不要で動く）
  // ============================================================

  /**
   * 必須フィールドと型の基本チェック。
   * 厳密なスキーマ検証は ajv で別途行う想定。
   * @param {any} ctx
   * @returns {Array<{path: string, message: string}>}
   */
  function validate(ctx) {
    const errors = [];

    if (!ctx || typeof ctx !== 'object') {
      return [{ path: '', message: 'ctx must be an object' }];
    }

    // meta
    if (!ctx.meta || typeof ctx.meta !== 'object') {
      errors.push({ path: 'meta', message: 'required' });
    } else {
      if (!ctx.meta.schema_version) errors.push({ path: 'meta.schema_version', message: 'required' });
      if (!ctx.meta.ztelier_version) errors.push({ path: 'meta.ztelier_version', message: 'required' });
      if (!ctx.meta.session_id) errors.push({ path: 'meta.session_id', message: 'required' });
      if (!ctx.meta.created_at) errors.push({ path: 'meta.created_at', message: 'required' });

      if (ctx.meta.schema_version && ctx.meta.schema_version !== SCHEMA_VERSION) {
        errors.push({
          path: 'meta.schema_version',
          message: `expected ${SCHEMA_VERSION}, got ${ctx.meta.schema_version}. Use ZtelierMigrate.migrate() first.`
        });
      }
    }

    // customer
    if (!ctx.customer || typeof ctx.customer !== 'object') {
      errors.push({ path: 'customer', message: 'required' });
    } else if (!ctx.customer.company_name) {
      errors.push({ path: 'customer.company_name', message: 'required' });
    }

    // 各ツールは completed フラグ必須
    ['amplify', 'maaz', 'showtoku', 'forg', 'endeavor'].forEach(tool => {
      if (ctx[tool] && typeof ctx[tool].completed !== 'boolean') {
        errors.push({ path: `${tool}.completed`, message: 'must be boolean' });
      }
    });

    // Forg F値の整合性（実装 v4.1.0+ 準拠: forg = (S×L) / (C×LP)）
    if (ctx.forg && ctx.forg.completed && ctx.forg.variables) {
      const v = ctx.forg.variables;
      if (typeof v.S === 'number' && typeof v.L === 'number' &&
          typeof v.C === 'number' && typeof v.LP === 'number') {
        const denom = v.C * v.LP;
        const computed = denom > 0 ? (v.S * v.L) / denom : (v.S > 0 ? 99 : 0);
        if (ctx.forg.F_value != null && Math.abs(ctx.forg.F_value - computed) > 0.01) {
          errors.push({
            path: 'forg.F_value',
            message: `inconsistent with variables: expected ${computed.toFixed(3)}, got ${ctx.forg.F_value}. Formula: (S×L)/(C×LP)`
          });
        }
      }
    }

    return errors;
  }

  /**
   * 特定ツールの結果が「使える状態」か判定。
   * Endeavor が他ツール結果を参照するときに使用。
   * @param {Object} ctx
   * @param {string} toolName - 'amplify'|'maaz'|'showtoku'|'forg'|'endeavor'
   * @returns {boolean}
   */
  function isToolReady(ctx, toolName) {
    return !!(ctx && ctx[toolName] && ctx[toolName].completed === true);
  }

  // ============================================================
  // Exports
  // ============================================================

  return {
    // Constants
    SCHEMA_VERSION,
    ZTELIER_VERSION,
    STORAGE_PREFIX,
    STORAGE_INDEX,

    // Core
    empty,
    load,
    loadFromFile,
    listSessions,
    validate,
    isToolReady,

    version: '1.1.0'
  };
}));
