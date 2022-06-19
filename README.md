# Nest.js × Puppeteer × Prisma

## 処理概要

1. Cronにより定期処理実行
1. 処理対象の選定（Prismaによりデータ取得：R）
1. Web情報スクレイピング（PuppeteerによりSPAページの取得）
1. 差分状況によるデータの更新（Prismaによりデータ：CUD）

## その他やっていることやってないこと

### やっていること

#### 開発DB：Dockerにてpostgresql環境を作成

* Docker環境を構築してある前提
* `docker-compose up -d`にて環境立ち上げ
  * docker配下のファイルを参照
* Prismaでマイグレーション実行
* .envファイルに下記、開発用環境変数追記
  * `DATABASE_URL="postgresql://admin:admin@localhost:5433/develop"`
* あとはPrismaのお作法でCRUD可能
* npm run する前にDocker立ち上げるのを忘れないこと

#### 開発DB：DBeaverにてpostgresql環境の参照更新

* DBeaverは色々なDBに対応したDB参照ツール
* .envに定義した情報で新しい接続を作成すればOK

#### 本番DB：Supabaseに移行（envの設定にて切り替え）

* Supabaseはpostgresql互換でFirebaseのRDBバージョンみたいなもの
* アクセスして新規プロジェクト作成
* `DATABASE_URL="xxxx"`を切り替えて上げればアクセス可能

#### Herokuにホスティング

* アクセスして新規プロジェクト作成
* GitHubと連携してプロジェクト連携
* 初回ビルドは成功するけどそのままだとだめ
* buildpackに`https://github.com/jontewks/puppeteer-heroku-buildpack`を追加
* 環境変数はGitHub Actionsで渡すのでそっちで定義
* 30分でスリープするので、Heroku SchedulerというHerokuアプリがスリープしてても指定時間にコマンドを実行してくれるツールでcurlしてあげる必要あり

#### GitHub ActionsによるCI/CD

* HerokuのAccountSettingsのメニューから「API　Key」でAPI　Keyを生成
* GitHub の project の setting > secrets から登録する（ダブルクォーテーションは不要）
  * HEROKU_API_KEY
  * HEROKU_APP（デプロイ先のHEROKUアプリ名を指定します）
  * HEROKU_EMAIL（Herokuアカウントのメールアドレス）
  * ほか環境変数定義
* Procfileは実行コマンド
* .github/workflows配下がAction定義
* mainブランチにpushするとデプロイまで完了する

### やっていないこととその理由

#### データの表示

フロントは別で作成：[nextjs-bun3tou4](https://github.com/soratsm/nextjs-bun3tou4)
  
#### 外部APIの提供

可用性と保守性を検討した結果、フロントと疎結合にする
（また、 Herokuはサーバーダウンの可能性がある）

* ✕：フロント↔バック↔Supabase
* ○：フロント↔Supabase↔バック

#### Supabaseのcliによる操作

prismaによる代替で行っているため。
理由としては、フロントも同じPrismaの型定義を使用することで、共通の型定義による恩恵を受けられるため
