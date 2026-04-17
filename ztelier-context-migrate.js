/**
 * Ztelier Common Kit — Context Migration
 * v1.0.0 (2026-04-17)
 *
 * スキーマバージョン間のマイグレーションを行う。
 * 現時点では v1.0.0 のみ（no-op）。将来 v1.1.0 等が出た際に migrations[] に追加する。
 *
 * マイグレーションルール:
 *   - 各 migration は純粋関数（入力を破壊しない）
 *   - 上位バージョンは下位バージョンを全て通過することで到達（カスケード）
 *   - 失敗時は例外を投げる（データ破損防止）
 *
 * 使い方:
 *   const migrated = ZtelierMigrate.migrate(oldCtx);  // 最新版へ
 *   const migrated = ZtelierMigrate.migrate(oldCtx, '1.1.0');  // 指定版へ
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    global.ZtelierMigrate = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const LATEST_VERSION = '1.0.0';

  /**
   * マイグレーション定義。
   * key = fromVersion, value = { to, fn(ctx) }
   *
   * 新バージョン追加手順:
   *   1. 下の migrations に entry 追加
   *   2. fn は副作用なしの純粋関数で書く
   *   3. LATEST_VERSION を更新
   *
   * 例（将来の v1.1.0 追加時）:
   *   '1.0.0': {
   *     to: '1.1.0',
   *     fn: (ctx) => {
   *       const next = JSON.parse(JSON.stringify(ctx));
   *       // ここで構造変換
   *       next.meta.schema_version = '1.1.0';
   *       return next;
   *     }
   *   }
   */
  const migrations = {
    // 現時点では空。v1.0.0 が最新。
  };

  /**
   * セマンティックバージョン比較。
   * a < b → -1, a === b → 0, a > b → 1
   */
  function _compareVersion(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if (pa[i] < pb[i]) return -1;
      if (pa[i] > pb[i]) return 1;
    }
    return 0;
  }

  /**
   * ctx を指定バージョンまでカスケードマイグレーション。
   * @param {Object} ctx
   * @param {string} [targetVersion=LATEST_VERSION]
   * @returns {Object} 新しい ctx（元の ctx は変更されない）
   */
  function migrate(ctx, targetVersion) {
    if (!ctx || !ctx.meta) {
      throw new Error('[ZtelierMigrate] ctx.meta is required');
    }

    const target = targetVersion || LATEST_VERSION;
    let current = ctx.meta.schema_version;

    if (!current) {
      throw new Error('[ZtelierMigrate] ctx.meta.schema_version is missing');
    }

    const cmp = _compareVersion(current, target);
    if (cmp === 0) {
      return ctx;  // 既に target と同じ
    }
    if (cmp > 0) {
      throw new Error(
        `[ZtelierMigrate] downgrade not supported: current=${current}, target=${target}`
      );
    }

    // カスケード実行
    let next = ctx;
    const applied = [];
    const guard = 100;  // 無限ループ防止
    let steps = 0;

    while (_compareVersion(next.meta.schema_version, target) < 0) {
      if (steps++ > guard) {
        throw new Error(`[ZtelierMigrate] migration cascade exceeded ${guard} steps`);
      }

      const from = next.meta.schema_version;
      const migration = migrations[from];

      if (!migration) {
        throw new Error(
          `[ZtelierMigrate] no migration path from ${from}. ` +
          `Available: ${Object.keys(migrations).join(', ') || '(none)'}`
        );
      }

      try {
        next = migration.fn(next);
        applied.push(`${from} → ${migration.to}`);
      } catch (e) {
        throw new Error(
          `[ZtelierMigrate] migration ${from} → ${migration.to} failed: ${e.message}`
        );
      }

      if (next.meta.schema_version !== migration.to) {
        throw new Error(
          `[ZtelierMigrate] migration ${from} → ${migration.to} did not update schema_version correctly ` +
          `(got ${next.meta.schema_version})`
        );
      }
    }

    console.info('[ZtelierMigrate] applied:', applied.join(', '));
    return next;
  }

  /**
   * マイグレーションが必要か判定。
   * @param {Object} ctx
   * @param {string} [targetVersion]
   * @returns {boolean}
   */
  function isMigrationNeeded(ctx, targetVersion) {
    if (!ctx || !ctx.meta || !ctx.meta.schema_version) return false;
    const target = targetVersion || LATEST_VERSION;
    return _compareVersion(ctx.meta.schema_version, target) < 0;
  }

  /**
   * 利用可能なマイグレーション一覧を返す（デバッグ用）
   */
  function listMigrations() {
    return Object.keys(migrations).map(from => ({ from, to: migrations[from].to }));
  }

  return {
    migrate,
    isMigrationNeeded,
    listMigrations,
    LATEST_VERSION,
    version: '1.0.0'
  };
}));
