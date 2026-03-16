# Handmade App Manager - ハンドメイド作家向けアプリエコシステム

ハンドメイド作家の業務を効率化するアプリ群の統括リポジトリです。

## アプリ一覧

| アプリ | 概要 | リポジトリ | ステータス |
|-------|------|-----------|-----------|
| **cost-app** | 原価計算・在庫管理・コストシミュレーション | [toru0514/cost-app](https://github.com/toru0514/cost-app) | 運用中 |
| **handmade-shipping-manager** | 注文取得・伝票作成 | [toru0514/handmade-shipping-manager](https://github.com/toru0514/handmade-shipping-manager) | 運用中 |
| **pfauto-app** | PF自動出品 | [toru0514/pfauto-app](https://github.com/toru0514/pfauto-app) | 運用中 |
| **領収書整理アプリ** | 経費記録・確定申告準備 | 未作成 | 計画中 |
| **作業時間トラッカー** | 制作時間記録・時給計算 | 未作成 | 構想中 |
| **手順書・マニュアル作成** | 作業手順の文書化 | 未作成 | 構想中 |

## 技術スタック共通方針

全アプリで以下の技術スタックとアーキテクチャを統一しています：

- **フレームワーク**: Next.js 16 (App Router) + React 19 + TypeScript
- **UI**: TailwindCSS 4 + shadcn/ui
- **アーキテクチャ**: ヘキサゴナルアーキテクチャ（Ports & Adapters）
- **テスト**: Vitest
- **デプロイ**: Vercel

### データストア

| アプリ | データストア |
|-------|------------|
| cost-app | Supabase (PostgreSQL) + localStorage (ゲスト) + Google Sheets |
| shipping-manager | Supabase (PostgreSQL) + Google Sheets |
| pfauto-app | Google Sheets |
| 領収書アプリ（予定） | Supabase (PostgreSQL) |

## ビジネスライフサイクル カバー範囲

```
材料仕入れ ──→ 制作 ──→ 原価計算 ──→ 在庫管理 ──→ 出品 ──→ 受注・発送 ──→ 経理・税務
    △            ×         ◎           ◎          ◎         ◎            ×
 cost-app       未対応    cost-app    cost-app   pfauto-app  shipping-     計画中
                                                             manager
```

- ◎ = 対応済み / △ = 部分対応 / × = 未対応

## ロードマップ

| フェーズ | 内容 | 理由 |
|---------|------|------|
| Phase 1 | 領収書整理アプリ | 確定申告に直結。実務上の緊急度が高い |
| Phase 2 | 売上分析（shipping-manager拡張） | 既存データ活用。新規アプリ不要 |
| Phase 3 | 作業時間トラッカー | 原価計算の精度向上（cost-app連携） |
| Phase 4 | 統括ダッシュボード（本リポジトリ） | 全アプリ連携の基盤 |
| Phase 5 | 手順書・マニュアル作成アプリ | パッケージ化の前段階 |
| Phase 6 | パッケージ化・マルチテナント対応 | 他の作家への提供開始 |

詳細は [docs/ecosystem-roadmap.md](docs/ecosystem-roadmap.md) を参照してください。

## ドキュメント

- [領収書アプリ 詳細仕様書](docs/receipt-app-spec.md)
- [エコシステム ロードマップ](docs/ecosystem-roadmap.md)
