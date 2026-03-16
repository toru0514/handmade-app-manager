# 領収書整理アプリ 詳細仕様書

## 概要

ハンドメイド作家向けの経費記録・領収書管理アプリ。確定申告の準備を効率化し、インボイス制度にも対応する。

## コア機能

### 1. レシート登録（手動入力）

- 日付、金額、店舗名、品目を手動入力
- 画像アップロード（レシート写真の記録保存用）
- 税率（8% / 10%）の選択
- メモ欄

> **将来追加予定**: OCR自動読み取り（Tesseract.js or Google Cloud Vision API）

### 2. 経費カテゴリ分類

確定申告の勘定科目に対応したカテゴリ管理：

| 勘定科目 | 具体例（ハンドメイド作家） |
|---------|----------------------|
| 材料費（仕入高） | ビーズ、布、金具、革 |
| 荷造運賃 | 送料、梱包材 |
| 通信費 | インターネット、電話 |
| 消耗品費 | 工具、文房具、撮影用品 |
| 広告宣伝費 | SNS広告、イベント出展料 |
| 旅費交通費 | 材料買い付け、イベント移動 |
| 水道光熱費 | 電気代（按分） |
| 地代家賃 | 作業場家賃（按分） |
| 雑費 | その他 |

- カスタムカテゴリの追加が可能
- 店舗名ベースのルールによる自動分類（例: "ユザワヤ" → 材料費）

### 3. インボイス制度対応

- 適格請求書発行事業者の登録番号（T + 13桁）の記録
- インボイス有無のフラグ管理
- 仕入税額控除の可否を自動判定
  - 適格請求書あり → 全額控除可
  - なし → 経過措置（2026年9月まで80%、2029年9月まで50%）

### 4. 月次・年次レポート

- 経費カテゴリ別の月次集計表
- 月次推移グラフ（棒グラフ / 折れ線）
- 年間合計サマリー
- 確定申告用のCSVエクスポート
- PDFレポート出力

### 5. cost-appとの連携（将来）

- 材料費カテゴリのレシートデータをcost-appに連携
- 仕入れ金額の自動同期
- 原価計算の精度向上

## 技術スタック

| 要素 | 技術 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| UI | React 19 + TailwindCSS 4 + shadcn/ui |
| 認証 | Supabase Auth（cost-app, shipping-managerと統一） |
| DB | Supabase (PostgreSQL) |
| 画像保存 | Supabase Storage |
| アーキテクチャ | ヘキサゴナルアーキテクチャ |
| テスト | Vitest |
| デプロイ | Vercel |

## データモデル

### receipts テーブル

```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT,
  date DATE NOT NULL,
  vendor_name TEXT NOT NULL,
  total_amount INTEGER NOT NULL,       -- 税込金額（円）
  tax_amount INTEGER,                  -- 税額（円）
  tax_rate SMALLINT DEFAULT 10,        -- 税率（8 or 10）
  invoice_number TEXT,                 -- T+13桁（適格請求書番号）
  is_qualified_invoice BOOLEAN DEFAULT FALSE,
  category_id UUID REFERENCES expense_categories(id),
  memo TEXT,
  ocr_raw_text TEXT,                   -- 将来のOCR用
  ocr_confidence REAL,                 -- 将来のOCR用
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### expense_categories テーブル

```sql
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,                  -- 例: "材料費"
  code TEXT,                           -- 勘定科目コード
  tax_deductible BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### auto_categorize_rules テーブル

```sql
CREATE TABLE auto_categorize_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vendor_pattern TEXT NOT NULL,        -- 店舗名パターン（例: "ユザワヤ"）
  category_id UUID REFERENCES expense_categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### monthly_summaries ビュー

```sql
CREATE VIEW monthly_summaries AS
SELECT
  user_id,
  TO_CHAR(date, 'YYYY-MM') AS year_month,
  category_id,
  SUM(total_amount) AS total_amount,
  COUNT(*) AS receipt_count
FROM receipts
GROUP BY user_id, TO_CHAR(date, 'YYYY-MM'), category_id;
```

## ページ構成

| パス | 機能 |
|------|------|
| `/login` | ログイン画面 |
| `/dashboard` | 月次サマリー、最近のレシート、カテゴリ別円グラフ |
| `/receipts` | レシート一覧（日付・カテゴリ・金額でフィルタ/ソート） |
| `/receipts/new` | レシート新規登録（フォーム + 画像アップロード） |
| `/receipts/[id]` | レシート詳細・編集・削除 |
| `/categories` | 勘定科目の管理（追加・編集・並び替え） |
| `/reports` | 年次レポート・確定申告用エクスポート |
| `/settings` | アプリ設定（自動分類ルール、インボイス設定） |

## アーキテクチャ

ヘキサゴナルアーキテクチャ（既存アプリと統一）：

```
app/                          # Next.js App Router（UI層）
├── login/
├── dashboard/
├── receipts/
├── categories/
├── reports/
└── settings/

application/                  # アプリケーション層
├── ports/
│   ├── receipt-repository-port.ts
│   ├── category-repository-port.ts
│   └── storage-service-port.ts
├── usecases/
│   ├── create-receipt.ts
│   ├── list-receipts.ts
│   ├── update-receipt.ts
│   ├── delete-receipt.ts
│   ├── generate-monthly-report.ts
│   └── export-tax-report.ts
└── types/
    ├── receipt.ts
    └── category.ts

adapters/                     # インフラ層
├── supabase/
│   ├── receipt-repository.ts
│   ├── category-repository.ts
│   └── storage-service.ts
└── ocr/                      # 将来追加
    └── (tesseract-or-vision-service.ts)

components/                   # 共通UIコンポーネント
├── receipt-form.tsx
├── receipt-card.tsx
├── category-badge.tsx
├── monthly-chart.tsx
└── export-button.tsx
```

## 確定申告対応の要件

### 白色申告の場合
- 収支内訳書に対応した経費カテゴリ別集計
- CSV出力で会計ソフトへのインポート対応

### 青色申告の場合
- 青色申告決算書に対応したより詳細な科目分類
- 複式簿記対応は将来検討（まずは簡易簿記で十分）

### インボイス制度の経過措置
- 2023年10月〜2026年9月: 免税事業者からの仕入れは80%控除可
- 2026年10月〜2029年9月: 50%控除可
- 2029年10月〜: 控除不可

アプリ内で経過措置の期間に応じた控除額を自動計算する。

## 開発フェーズ

| フェーズ | 機能 |
|---------|------|
| v0.1 | レシート手動登録・一覧・編集・削除、勘定科目管理 |
| v0.2 | 月次サマリーダッシュボード、フィルタ・検索 |
| v0.3 | インボイス対応、自動分類ルール |
| v0.4 | 年次レポート・CSVエクスポート |
| v0.5 | OCR自動読み取り |
| v1.0 | cost-app連携、PDFエクスポート |
