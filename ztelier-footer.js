/**
 * Ztelier Common Kit — Footer Component
 * v1.0.0 (2026-04-17)
 *
 * 設計書 Phase 1 の責任分界点担保のための必須コンポーネント。
 *   - 常時 "Ztelier – Independent assessment utility" を表示
 *   - 準拠フレームワーク（MITRE ATT&CK/ATLAS, CISA ZTMM v2, NIST CSF 2.0）を出典明記
 *
 * 使い方（Web Component）:
 *   <ztelier-footer frameworks="MITRE ATT&CK/ATLAS, CISA ZTMM v2, NIST CSF 2.0"></ztelier-footer>
 *
 * 使い方（プレーン関数）:
 *   ZtelierFooter.render(document.getElementById('footer-slot'), {
 *     frameworks: ['MITRE ATT&CK', 'MITRE ATLAS', 'CISA ZTMM v2', 'NIST CSF 2.0'],
 *     philosophy: true  // 「セキュリティ対策は手段です」脚注を表示
 *   });
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    global.ZtelierFooter = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DEFAULT_DISCLAIMER = 'Ztelier – Independent assessment utility';
  const DEFAULT_PHILOSOPHY = 'セキュリティ対策は手段です。守るべき事業価値が先に定義されている必要があります。';
  const DEFAULT_FRAMEWORKS = ['MITRE ATT&CK', 'MITRE ATLAS', 'CISA ZTMM v2', 'NIST CSF 2.0'];

  /**
   * オプション正規化
   */
  function normalizeOptions(source) {
    const getter = source instanceof HTMLElement
      ? (name) => source.getAttribute(name)
      : (name) => {
          const key = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          return source[key] != null ? source[key] : null;
        };

    let frameworks = getter('frameworks');
    if (typeof frameworks === 'string') {
      frameworks = frameworks.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!Array.isArray(frameworks)) {
      frameworks = DEFAULT_FRAMEWORKS;
    }

    const philosophyAttr = getter('philosophy');
    const philosophy = philosophyAttr === null
      ? true
      : (philosophyAttr === 'false' || philosophyAttr === false ? false : true);

    return {
      disclaimer: getter('disclaimer') || DEFAULT_DISCLAIMER,
      philosophy,
      frameworks,
      aboutText: getter('about-text') || null  // Zscaler Japan立て付けの説明
    };
  }

  /**
   * フッターレンダリング
   */
  function render(mount, opts) {
    if (!mount) throw new Error('[ZtelierFooter] mount element is required');
    const o = normalizeOptions(opts || {});

    mount.classList.add('ztelier-footer');
    mount.replaceChildren();

    // 思想脚注（上段）— 設計書「プロジェクトを貫く5つの思想」①
    if (o.philosophy) {
      const philo = document.createElement('div');
      philo.textContent = DEFAULT_PHILOSOPHY;
      philo.style.cssText = [
        'font-style:italic',
        'color:var(--ztelier-ink)',
        'margin-bottom:var(--ztelier-space-2)',
        'font-size:var(--ztelier-font-xs)'
      ].join(';');
      mount.appendChild(philo);
    }

    // 責任分界ディスクレーマー（最重要）
    const disc = document.createElement('div');
    disc.className = 'ztelier-footer__disclaimer';
    disc.textContent = o.disclaimer;
    mount.appendChild(disc);

    // 任意の立て付け説明
    if (o.aboutText) {
      const about = document.createElement('div');
      about.textContent = o.aboutText;
      about.style.cssText = 'font-size:var(--ztelier-font-xs);color:var(--ztelier-muted);margin-top:2px';
      mount.appendChild(about);
    }

    // 準拠フレームワーク
    if (o.frameworks && o.frameworks.length > 0) {
      const fw = document.createElement('div');
      fw.className = 'ztelier-footer__frameworks';
      fw.textContent = 'Based on ' + o.frameworks.join(', ');
      mount.appendChild(fw);
    }

    // ARIA
    mount.setAttribute('role', 'contentinfo');
    mount.setAttribute('aria-label', 'Ztelier フッター（責任分界・出典）');
  }

  /**
   * Web Component
   */
  class ZtelierFooterElement extends HTMLElement {
    static get observedAttributes() {
      return ['frameworks', 'disclaimer', 'philosophy', 'about-text'];
    }

    connectedCallback() {
      this._render();
    }

    attributeChangedCallback() {
      if (this.isConnected) this._render();
    }

    _render() {
      render(this, {
        frameworks: this.getAttribute('frameworks'),
        disclaimer: this.getAttribute('disclaimer'),
        philosophy: this.getAttribute('philosophy'),
        aboutText:  this.getAttribute('about-text')
      });
    }
  }

  if (typeof customElements !== 'undefined' && !customElements.get('ztelier-footer')) {
    customElements.define('ztelier-footer', ZtelierFooterElement);
  }

  return {
    render,
    Element: ZtelierFooterElement,
    DEFAULT_DISCLAIMER,
    DEFAULT_PHILOSOPHY,
    DEFAULT_FRAMEWORKS,
    version: '1.0.0'
  };
}));
