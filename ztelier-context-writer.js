/**
 * Ztelier Common Kit — Context Writer
 * v1.0.0 (2026-04-17)
 *
 * ztelier-context.json の書き込み・更新・エクスポートを提供。
 *
 * 使い方:
 *   // 保存（updated_at 自動更新）
 *   ZtelierContext.save(ctx);
 *
 *   // ツール単位の部分更新（設計書「読み書き責任」準拠）
 *   ZtelierContext.updateTool(ctx, 'forg', { completed: true, F_value: 0.38, ... });
 *   ZtelierContext.save(ctx);
 *
 *   // ファイルとしてダウンロード
 *   ZtelierContext.exportToFile(ctx);  // ファイル名は session_id から自動
 *
 *   // セッション削除
 *   ZtelierContext.remove(sessionId);
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    global.ZtelierContext = Object.assign({}, global.ZtelierContext || {}, factory());
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_PREFIX = 'ztelier-context:';
  const STORAGE_INDEX  = 'ztelier-context:__index__';

  // ============================================================
  // Save / Remove
  // ============================================================

  /**
   * localStorage に保存。updated_at を自動更新し、インデックスにも追加。
   * @param {Object} ctx
   * @returns {Object} 保存された ctx（updated_at 更新済み）
   */
  function save(ctx) {
    if (!ctx || !ctx.meta || !ctx.meta.session_id) {
      throw new Error('[ZtelierContext.save] ctx.meta.session_id is required');
    }

    ctx.meta.updated_at = new Date().toISOString();

    const key = STORAGE_PREFIX + ctx.meta.session_id;
    try {
      localStorage.setItem(key, JSON.stringify(ctx));
      _addToIndex(ctx.meta.session_id);
    } catch (e) {
      // QuotaExceededError 等
      if (e.name === 'QuotaExceededError') {
        throw new Error('[ZtelierContext.save] localStorage quota exceeded. Consider cleaning old sessions.');
      }
      throw e;
    }

    return ctx;
  }

  /**
   * セッション削除
   * @param {string} sessionId
   */
  function remove(sessionId) {
    if (!sessionId) throw new Error('[ZtelierContext.remove] sessionId is required');
    localStorage.removeItem(STORAGE_PREFIX + sessionId);
    _removeFromIndex(sessionId);
  }

  function _addToIndex(sessionId) {
    try {
      const raw = localStorage.getItem(STORAGE_INDEX);
      const arr = raw ? JSON.parse(raw) : [];
      if (!arr.includes(sessionId)) {
        arr.push(sessionId);
        localStorage.setItem(STORAGE_INDEX, JSON.stringify(arr));
      }
    } catch (e) {
      // インデックス失敗でもメイン保存は成功しているので無視
      console.warn('[ZtelierContext] failed to update session index:', e);
    }
  }

  function _removeFromIndex(sessionId) {
    try {
      const raw = localStorage.getItem(STORAGE_INDEX);
      if (!raw) return;
      const arr = JSON.parse(raw).filter(id => id !== sessionId);
      localStorage.setItem(STORAGE_INDEX, JSON.stringify(arr));
    } catch (e) {
      console.warn('[ZtelierContext] failed to update session index:', e);
    }
  }

  // ============================================================
  // Partial Update
  // ============================================================

  /**
   * ツール単位の結果を更新。深いマージを行わず、ツールセクション全体を差し替える。
   * 設計書「読み書き責任」準拠：各ツールは自セクションのみ書き込む。
   *
   * @param {Object} ctx
   * @param {'amplify'|'maaz'|'showtoku'|'forg'|'endeavor'|'customer'} section
   * @param {Object} data
   * @returns {Object} 更新後の ctx（参照は同じ）
   */
  function updateTool(ctx, section, data) {
    const validSections = ['amplify', 'maaz', 'showtoku', 'forg', 'endeavor', 'customer'];
    if (!validSections.includes(section)) {
      throw new Error(`[ZtelierContext.updateTool] invalid section: ${section}`);
    }
    if (!ctx || typeof ctx !== 'object') {
      throw new Error('[ZtelierContext.updateTool] ctx must be an object');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('[ZtelierContext.updateTool] data must be an object');
    }

    ctx[section] = Object.assign({}, ctx[section] || {}, data);
    ctx.meta.updated_at = new Date().toISOString();
    return ctx;
  }

  /**
   * パス指定での細粒度更新。ネストしたフィールドの変更に使う。
   * 例: update(ctx, 'forg.variables.S', 0.45)
   *
   * @param {Object} ctx
   * @param {string} path - ドット区切りパス
   * @param {any} value
   * @returns {Object} 更新後の ctx
   */
  function update(ctx, path, value) {
    if (!path) throw new Error('[ZtelierContext.update] path is required');
    const keys = path.split('.');
    let cursor = ctx;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (cursor[k] == null || typeof cursor[k] !== 'object') {
        cursor[k] = {};
      }
      cursor = cursor[k];
    }
    cursor[keys[keys.length - 1]] = value;

    if (ctx.meta) ctx.meta.updated_at = new Date().toISOString();
    return ctx;
  }

  // ============================================================
  // Export
  // ============================================================

  /**
   * Context を JSON ファイルとしてダウンロードさせる。
   * ファイル名は session_id ベース。
   * @param {Object} ctx
   * @param {string} [filename] - 省略時は "ztelier-context-<session_id>.json"
   */
  function exportToFile(ctx, filename) {
    if (!ctx) throw new Error('[ZtelierContext.exportToFile] ctx is required');

    const sessionId = (ctx.meta && ctx.meta.session_id) || 'unknown';
    const name = filename || `ztelier-context-${sessionId}.json`;

    const json = JSON.stringify(ctx, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // クリーンアップ（同期的な click 後でOK、次のマイクロタスクで解放）
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);

    return name;
  }

  /**
   * Context を Clipboard にコピー。
   * @param {Object} ctx
   * @returns {Promise<void>}
   */
  function copyToClipboard(ctx) {
    if (!navigator.clipboard) {
      return Promise.reject(new Error('Clipboard API not available'));
    }
    const json = JSON.stringify(ctx, null, 2);
    return navigator.clipboard.writeText(json);
  }

  // ============================================================
  // Exports
  // ============================================================

  return {
    save,
    remove,
    update,
    updateTool,
    exportToFile,
    copyToClipboard,
    version: '1.0.0'
  };
}));
