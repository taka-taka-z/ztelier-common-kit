/**
 * Ztelier Common Kit — Header Component
 * v1.0.0 (2026-04-17)
 *
 * 顧客画面に常時表示される小型ヘッダー。
 * 設計書 Phase 1 準拠：「Ztelier | ToolName vX.Y.Z」を左上に小さく表示。
 *
 * 使い方（Web Component）:
 *   <ztelier-header tool-name="MAAZ" tool-version="v4.2.0"></ztelier-header>
 *
 * 使い方（プレーン関数）:
 *   ZtelierHeader.render(document.getElementById('header-slot'), {
 *     toolName: 'MAAZ',
 *     toolVersion: 'v4.2.0',
 *     toolColor: '#001744'   // 省略可：ツールアイコン色
 *   });
 *
 * 注意：
 *   - Shadow DOM は使わず Light DOM で実装。ztelier-tokens.css の変数を継承する。
 *   - ツール名に "Zscaler" を冠さない（責任分界点の担保）。
 *   - ロゴは使わない。テキストと色のみで構成。
 */

(function (global, factory) {
  // UMD: ESM / CommonJS / グローバルの3形態対応
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    global.ZtelierHeader = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * 属性の正規化。タグ属性（kebab-case）とオプション（camelCase）を統一。
   * @param {HTMLElement|Object} source
   * @returns {{toolName: string, toolVersion: string, toolColor: string|null, aboutUrl: string|null}}
   */
  function normalizeOptions(source) {
    const getter = source instanceof HTMLElement
      ? (name) => source.getAttribute(name)
      : (name) => {
          // camelCase 変換：tool-name → toolName
          const key = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          return source[key] != null ? String(source[key]) : null;
        };

    return {
      toolName:    getter('tool-name')    || 'Ztelier',
      toolVersion: getter('tool-version') || '',
      toolColor:   getter('tool-color')   || null,     // 指定あればドットを描画
      aboutUrl:    getter('about-url')    || null      // 指定あれば About リンク表示
    };
  }

  /**
   * ヘッダー HTML を生成。XSS 対策のため textContent 経由で値を挿入する。
   * @param {HTMLElement} mount - 挿入先 DOM 要素
   * @param {Object} opts
   */
  function render(mount, opts) {
    if (!mount) throw new Error('[ZtelierHeader] mount element is required');
    const o = normalizeOptions(opts || {});

    // クラス付与（既存クラスを壊さずに追加）
    mount.classList.add('ztelier-header');

    // 子要素をクリア
    mount.replaceChildren();

    // Ztelier ブランド部
    const brand = document.createElement('span');
    brand.className = 'ztelier-header__brand';
    brand.textContent = 'Ztelier';
    mount.appendChild(brand);

    // ツール名がある場合のみ区切りとツール名を表示
    if (o.toolName && o.toolName !== 'Ztelier') {
      // ツール色ドット（指定あれば）
      if (o.toolColor) {
        const dot = document.createElement('span');
        dot.setAttribute('aria-hidden', 'true');
        dot.style.cssText = [
          'display:inline-block',
          'width:8px',
          'height:8px',
          'border-radius:50%',
          'margin-left:8px',
          'background:' + o.toolColor
        ].join(';');
        mount.appendChild(dot);
      }

      const sep = document.createElement('span');
      sep.className = 'ztelier-header__separator';
      sep.textContent = '|';
      sep.setAttribute('aria-hidden', 'true');
      mount.appendChild(sep);

      const tool = document.createElement('span');
      tool.className = 'ztelier-header__tool';
      tool.textContent = o.toolName;
      mount.appendChild(tool);

      if (o.toolVersion) {
        const ver = document.createElement('span');
        ver.className = 'ztelier-header__version';
        ver.textContent = o.toolVersion;
        mount.appendChild(ver);
      }
    }

    // 右側のスロット（About リンク等）
    if (o.aboutUrl) {
      const spacer = document.createElement('span');
      spacer.style.cssText = 'flex:1';
      mount.appendChild(spacer);

      const about = document.createElement('a');
      about.href = o.aboutUrl;
      about.textContent = 'About';
      about.style.cssText = [
        'color:inherit',
        'opacity:0.8',
        'text-decoration:none',
        'font-size:var(--ztelier-font-xs)',
        'border-bottom:1px dotted currentColor',
        'padding-bottom:1px'
      ].join(';');
      about.setAttribute('aria-label', 'About Ztelier');
      mount.appendChild(about);
    }

    // ARIA
    mount.setAttribute('role', 'banner');
    mount.setAttribute('aria-label', 'Ztelier ヘッダー');
  }

  /**
   * Web Component 定義
   * - Light DOM（ztelier-tokens.css の変数を継承）
   * - 属性変更に追従
   */
  class ZtelierHeaderElement extends HTMLElement {
    static get observedAttributes() {
      return ['tool-name', 'tool-version', 'tool-color', 'about-url'];
    }

    connectedCallback() {
      this._render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this._render();
    }

    _render() {
      render(this, {
        toolName:    this.getAttribute('tool-name'),
        toolVersion: this.getAttribute('tool-version'),
        toolColor:   this.getAttribute('tool-color'),
        aboutUrl:    this.getAttribute('about-url')
      });
    }
  }

  // 重複登録回避（複数ツールで同一スクリプトを読んでも安全）
  if (typeof customElements !== 'undefined' && !customElements.get('ztelier-header')) {
    customElements.define('ztelier-header', ZtelierHeaderElement);
  }

  return {
    render,
    Element: ZtelierHeaderElement,
    version: '1.0.0'
  };
}));
