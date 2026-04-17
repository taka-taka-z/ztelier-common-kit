# Ztelier Common Kit v1.0.0

**Ztelier スイート全ツール共通の基盤アセット**

設計書 `Ztelier_Project_Summary_v1_0.md` 準拠。Amplify / MAAZ / Showtoku / Forg / Endeavor の5ツール（+ PUPY Uplift）が共有するデザイントークン・UI部品・JSON コンテキストスキーマを提供する。

---

## 構成

```
ztelier-common-kit/
├── ztelier-tokens.css            # カラー / タイポ / 状態色 / ユーティリティクラス
├── ztelier-header.js             # 共通ヘッダー（Web Component + プレーン関数）
├── ztelier-footer.js             # 共通フッター（責任分界点の担保）
├── ztelier-context-schema.json   # JSON Schema Draft 2020-12
├── ztelier-context-loader.js     # Context 読込 / empty / validate
├── ztelier-context-writer.js     # Context 保存 / 部分更新 / export
├── ztelier-context-migrate.js    # スキーマバージョン間マイグレーション
├── demo.html                     # 動作確認用デモ
└── README.md                     # このファイル
```

**Ztelierルール変更時に全ツール一括アップデート可能** な構造（設計書 Phase 1 準拠）。

---

## クイックスタート

各ツール（単一HTMLファイル）への組み込み最小例：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>MAAZ v4.2.0</title>
  <link rel="stylesheet" href="./common-kit/ztelier-tokens.css">
</head>
<body class="ztelier-scope">

  <ztelier-header
    tool-name="MAAZ"
    tool-version="v4.2.0"
    tool-color="#001744">
  </ztelier-header>

  <main>
    <!-- ツール本体 -->
  </main>

  <ztelier-footer
    frameworks="MITRE ATT&CK, MITRE ATLAS, CISA ZTMM v2">
  </ztelier-footer>

  <script src="./common-kit/ztelier-header.js"></script>
  <script src="./common-kit/ztelier-footer.js"></script>
  <script src="./common-kit/ztelier-context-loader.js"></script>
  <script src="./common-kit/ztelier-context-writer.js"></script>
  <script src="./common-kit/ztelier-context-migrate.js"></script>
  <script>
    // ツール本体のロジック
    const ctx = ZtelierContext.load('aw-20260417-company-a')
             || ZtelierContext.empty({ company_name: '...' });
    // ... MAAZ 評価処理 ...
    ZtelierContext.updateTool(ctx, 'maaz', { completed: true, /* ... */ });
    ZtelierContext.save(ctx);
  </script>
</body>
</html>
```

---

## ブランドトークン（設計書 Phase 1 準拠）

### カラー

| Token                     | HEX        | 用途                                   |
|---------------------------|------------|----------------------------------------|
| `--ztelier-primary`       | `#246CF7`  | Zscaler Blue / CTA / 主要アクセント    |
| `--ztelier-deep`          | `#001744`  | Zscaler Navy / ヘッダー / 見出し       |
| `--ztelier-accent`        | `#7BA05B`  | Sage / Ztelier固有の差別化（唯一の有機色・組織の生命感）|
| `--ztelier-surface`       | `#F7F9FB`  | Paper / 背景（Navy微染めの極薄グレー） |
| `--ztelier-ink`           | `#2A2D34`  | Charcoal / 本文（純黒回避）            |
| `--ztelier-muted`         | `#8A8F98`  | Stone / 補助テキスト / 罫線            |
| `--ztelier-success`       | `#4A7C59`  | 深緑（サルビア系）                     |
| `--ztelier-warning`       | `#C77F3A`  | 琥珀                                   |
| `--ztelier-danger`        | `#A84A4A`  | バーガンディ系                         |

### 成熟度レベル色

| Token                | 用途                                   |
|----------------------|----------------------------------------|
| `--ztelier-level-1`  | Traditional / Tier 1（危険・未着手）   |
| `--ztelier-level-2`  | Initial / Tier 2（初期段階）            |
| `--ztelier-level-3`  | Advanced / Tier 3（進行中）             |
| `--ztelier-level-4`  | Optimal / Tier 4（最適）                |

### ツール別アクセント色

| ツール       | Token                       | 意図                                 |
|--------------|-----------------------------|--------------------------------------|
| Amplify      | `--ztelier-tool-amplify`    | Zscaler Blue（標準）                 |
| MAAZ         | `--ztelier-tool-maaz`       | Zscaler Navy（重厚）                 |
| Showtoku     | `--ztelier-tool-showtoku`   | Light Blue（柔らか）                 |
| **Forg**     | `--ztelier-tool-forg`       | **Sage（唯一の有機色＝組織診断の生命感）** |
| Endeavor     | `--ztelier-tool-endeavor`   | Zscaler Navy（経営層向けの重厚）     |
| **PUPY Uplift** | `--ztelier-tool-pupy`    | **Stone（無彩色＝内部限定マーカー）** |

### タイポグラフィ

- 欧文: **Inter**（見出し・本文統一）
- 和文: **メイリオ**
- **Arial は意図的に回避**（Zscalerテンプレ差別化のため）

---

## API リファレンス

### `ZtelierHeader`

#### Web Component

```html
<ztelier-header
  tool-name="MAAZ"           <!-- 省略可。省略時は "Ztelier" のみ表示 -->
  tool-version="v4.2.0"      <!-- 省略可 -->
  tool-color="#001744"       <!-- 省略可。指定時はドット表示 -->
  about-url="#about">        <!-- 省略可。指定時はAboutリンク表示 -->
</ztelier-header>
```

#### プレーン関数

```javascript
ZtelierHeader.render(mountElement, {
  toolName: 'MAAZ',
  toolVersion: 'v4.2.0',
  toolColor: '#001744',
  aboutUrl: '#about'
});
```

### `ZtelierFooter`

#### Web Component

```html
<ztelier-footer
  frameworks="MITRE ATT&CK, CISA ZTMM v2, NIST CSF 2.0"  <!-- カンマ区切り -->
  disclaimer="Ztelier – Independent assessment utility" <!-- 省略可 -->
  philosophy="true"                                      <!-- 省略可、デフォルトtrue -->
  about-text="Zscaler Japanのアーキテクトが...">           <!-- 省略可 -->
</ztelier-footer>
```

フッターは **責任分界点の担保**（設計書 Phase 1）として以下を常時表示する：

1. 思想脚注「セキュリティ対策は手段です…」
2. ディスクレーマー「Ztelier – Independent assessment utility」
3. 準拠フレームワーク「Based on MITRE ATT&CK, ...」

### `ZtelierContext`（Loader + Writer）

#### セッション生成・読込

```javascript
// 空テンプレート（セッションIDは自動生成、aw-YYYYMMDD-slug 形式）
const ctx = ZtelierContext.empty({
  company_name: '株式会社サンプル',
  created_by: 'se-name'
});

// localStorage から既存セッション読込
const ctx = ZtelierContext.load('aw-20260417-company-a');

// ファイルから読込
const ctx = await ZtelierContext.loadFromFile(fileInput.files[0]);

// 保存済みセッション一覧
const sessions = ZtelierContext.listSessions();
```

#### 更新・保存

```javascript
// ツール単位の書き込み（設計書「読み書き責任」準拠）
ZtelierContext.updateTool(ctx, 'forg', {
  completed: true,
  version: '4.3.0',
  variables: { S: 0.45, L: 0.25, C: 0.70, L_prime: 0.60 },
  F_value: 0.54,
  // ...
});

// パス指定での細粒度更新
ZtelierContext.update(ctx, 'forg.variables.S', 0.50);

// localStorage 保存（updated_at は自動更新）
ZtelierContext.save(ctx);

// ファイルとしてダウンロード
ZtelierContext.exportToFile(ctx);  // 自動ファイル名
ZtelierContext.exportToFile(ctx, 'custom-name.json');

// クリップボードコピー
await ZtelierContext.copyToClipboard(ctx);

// 削除
ZtelierContext.remove('aw-20260417-company-a');
```

#### バリデーション

```javascript
const errors = ZtelierContext.validate(ctx);
if (errors.length === 0) {
  console.log('OK');
} else {
  errors.forEach(e => console.warn(`${e.path}: ${e.message}`));
}

// 特定ツールが「使える状態」か判定
if (ZtelierContext.isToolReady(ctx, 'maaz')) {
  // MAAZ結果を参照して Endeavor 計算を実行
}
```

### `ZtelierMigrate`

スキーマのバージョンアップが必要になったタイミングで使用。v1.0.0 時点ではマイグレーション対象なし。

```javascript
if (ZtelierMigrate.isMigrationNeeded(ctx)) {
  const migrated = ZtelierMigrate.migrate(ctx);  // 最新版へ
}
```

---

## 各ツールの読み書き責任（設計書 Phase 4）

| ツール     | 読み取り                                    | 書き込み             |
|------------|---------------------------------------------|----------------------|
| Amplify    | customer                                    | customer, amplify    |
| MAAZ       | customer, amplify                           | maaz                 |
| Showtoku   | customer, amplify                           | showtoku             |
| Forg       | customer                                    | forg                 |
| Endeavor   | customer, amplify, maaz, showtoku, forg     | endeavor             |

**Endeavorのみ全ツール結果を読み取る**。他は前段ツールまでを読む一方向フロー。ただし逆流対応のため、各ツールは他ツール結果の `completed: false` に耐える設計（`isToolReady()` で判定）。

---

## 責任分界点の担保

- ❌ Zscaler ロゴを絶対に入れない（カラーは借りるがロゴは別物）
- ❌ ツール名に "Zscaler" を冠さない
- ✅ `<ztelier-footer>` を常時表示（`Ztelier – Independent assessment utility`）
- ✅ About画面に立て付け説明：「Zscaler Japanのアーキテクトが業務効率化のために個人的に立て付けた内部ツール」

---

## 動作確認

`demo.html` をブラウザで開く：

```bash
# ローカルサーバで開く（CORS 無し推奨）
python3 -m http.server 8000
# → http://localhost:8000/demo.html
```

確認項目：
- カラーパレット全色表示
- ヘッダー・フッターの描画
- ボタン・バッジ・アラート
- データテーブル（sticky header、ホバー）
- Context I/O（新規 → Forg書込 → 保存 → 読込 → JSON出力）
- バリデーション（Forg F値の整合性チェック）

---

## バージョニング（3層）

```
schema_version  : JSONスキーマ自体のバージョン（現在 1.0.0）
ztelier_version : Ztelier プロジェクト全体（現在 1.0.0）
各ツール version : 各ツール個別（例: MAAZ v4.2.0, Forg v4.3.0）
```

---

## 参照

- 設計書: `Ztelier_Project_Summary_v1_0.md`
- フレームワーク: MITRE ATT&CK, MITRE ATLAS, CISA ZTMM v2, NIST CSF 2.0, NIST AI RMF 1.0

---

*Ztelier – Independent assessment utility*
