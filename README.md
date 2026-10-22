# 易象录

微信原生 TypeScript 学习小程序，本地资料随包使用，无登录或后端。已支持手动组合、数字生成、阅读、变爻分析、64卦搜索筛选与八卦速查。功能和两台用户设备实测已完成，首版交付进度见[验证记录](docs/validation.md)。

## 使用与开发

使用 Node.js 22 或更高版本，在仓库根目录运行：

```sh
npm ci
npm run build:content   # 构建随包资料与版本清单
npm run check          # 内容、类型及8组核心检查
```

微信开发者工具导入仓库根目录（`project.config.json`所在位置），运行目录为`miniprogram/`，启用TypeScript编译；无需“构建npm”。AppID由项目负责人配置，私人设置`project.private.config.json`不纳入Git。若仍报告根目录找不到app.json，使用“项目 → 重新打开此项目”。

单项命令：`npm run typecheck`、`npm test`、`npm run check:content`。`npm run check:content:release`检查首版完整性、电子初核及已确认待修问题。用户已取消文献人工复审和真机性能计时要求；待审记录继续留档，不伪报通过。

## 首版交付

版本号使用`package.json`中的`0.1.0`。提交前运行上述检查及`npm run check:content:release`，再用微信开发者工具编译、核对代码依赖分析中的实际文件清单并上传，备案通过后由用户在微信公众平台“版本管理”设置体验版、提审及发布。上传开发版本不等于已设置体验版，体验版不等于已正式上架；实际状态只在[验证记录](docs/validation.md)维护。

`miniprogramRoot`固定为`miniprogram/`。只打包页面、组件、领域计算、内存会话、展示数据和必要来源；JS/WXML/WXSS压缩已开启，不上传SourceMap。仓库中的`tests/`、`docs/`、`scripts/`、`content/`、开发依赖及`.validation/`均位于运行根目录外，不随程序发布。完整设计和内容审核档案继续随Git维护。

## 功能约定

- 阅读：卦辞、意象与整体含义默认展开，彖传、大象传默认折叠；经传和爻辞只显示原文，白话留档。阅读来源含爻辞及对应小象的定位。
- 图鉴：支持简繁名称、全称、登记别名、拼音、首字母和精确卦序；上下卦与关键词取交集。清除保留筛选，重置恢复全部；仅条件生效时显示数量，条件与滚动位置只在本次内存保留。
- 八卦速查：卦性置顶，展示课堂8类、五行、颜色及两栏生克；不显示来源、说明小字或先天数/方位，完整资料继续留档。

## 目录与文档

| 路径 | 职责 / 入口 |
| --- | --- |
| `miniprogram/domain/`、`state/` | 纯模型、计算、检索与内存会话 |
| `miniprogram/pages/`、`components/` | 原生页面及卦形、阅读折叠、来源组件 |
| `content/`、`miniprogram/data/` | 内容源与构建产物；维护见[内容说明](content/README.md) |
| `scripts/`、`tests/` | 构建校验、测试与[独立基准](tests/fixtures/README.md)，不进入运行目录 |
| [PRD](docs/PRD.md) | 产品规则、课堂原表、算法与验收标准 |
| [开发约定](AGENTS.md)、[开发计划](docs/development-plan.md) | 工程规则、当前交付与下一阶段 |
| [验证记录](docs/validation.md) | 实际检查、限制、历史验收与截图 |
| [资料核对](docs/content-review.md) | 采用版本、异文、审核进度；计数由[清单](content/manifest.json)生成 |
