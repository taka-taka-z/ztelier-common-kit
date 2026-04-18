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

  const LATEST_VERSION = '1.1.0';

  /**
   * マイグレーション定義。
   * key = fromVersion, value = { to, fn(ctx) }
   *
   * 新バージョン追加手順:
   *   1. 下の migrations に entry 追加
   *   2. fn は副作用なしの純粋関数で書く
   *   3. LATEST_VERSION を更新
   */
  const migrations = {
    '1.0.0': {
      to: '1.1.0',
      fn: (ctx) => {
        // v1.0.0 → v1.1.0: Forg の変数定義を実装準拠に変更
        // - 値域 0-1 → 1-5 (既存値は線形変換)
        // - L_prime → LP (実装では Leadership)
        // - v1.0.0 の L(Leadership) と L_prime(Legacy) を、v1.1.0 の LP(Leadership) と L(Legacy) に入れ替え
        // - pattern_id: strategy_gap → structure_silo, complexity_burden → crisis_gap
        const next = JSON.parse(JSON.stringify(ctx));

        if (next.forg && next.forg.variables) {
          const old = next.forg.variables;
          const scale = (v) => (typeof v === 'number') ? (v * 4 + 1) : v;  // 0-1 → 1-5
          next.forg.variables = {
            S:  scale(old.S),        // Strategy → Structure/Silo（概念差あり、要注意）
            L:  scale(old.L_prime),  // Legacy（旧 L_prime から移行）
            C:  scale(old.C),        // Complexity → Crisis/Cost（概念差あり、要注意）
            LP: scale(old.L)         // Leadership（旧 L から移行）
          };
          // F値は再計算推奨のため削除（null化）
          next.forg.F_value = null;
          next.forg._migration_note = 'v1.0.0 → v1.1.0: variable mapping applied, F_value cleared for recalc';
        }

        // pattern_id マッピング（v1.0.0 は設計書準拠の命名だったが、v1.1.0 で実装準拠＋直感的命名に）
        if (next.forg && next.forg.dominant_pattern && next.forg.dominant_pattern.pattern_id) {
          const patternMap = {
            // v1.0.0 (設計書)           → v1.1.0 (実装準拠・直感的命名)
            'strategy_gap':       'silo_strong',       // v1.0.0 の Strategy Gap は v1.1.0 の「縦割りが強い」相当
            'leadership_gap':     'leadership_weak',   // 意味保持、語尾変更
            'complexity_burden':  'crisis_weak',       // v1.0.0 の Complexity Burden は v1.1.0 の「危機感が弱い」相当
            'legacy_drag':        'legacy_heavy'       // 意味保持、語尾変更
          };
          const oldId = next.forg.dominant_pattern.pattern_id;
          if (patternMap[oldId]) {
            next.forg.dominant_pattern.pattern_id = patternMap[oldId];
          }
        }

        next.meta.schema_version = '1.1.0';
        return next;
      }
    }
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
    version: '1.1.0'
  };
}));
