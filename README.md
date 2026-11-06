# 易象录

微信原生 TypeScript 学习小程序，资料随包离线使用，无登录或后端。已支持手动／数字生成、变爻分析、64卦检索筛选、独立六爻阅读、目录与连续翻阅、八卦速查。程序版本 `0.2.1`；资料版本由 [manifest.json](content/manifest.json) 记录。

## 开发入口

使用 Node.js 22 或更高版本：

```sh
npm ci
npm run build:content          # 从 content/ 生成随包资料
npm run check                  # 内容、类型与关键行为检查
npm run check:content:release  # 完整性、电子初核及已确认待修问题
```

微信开发者工具导入仓库根目录，运行目录为 `miniprogram/`，启用 TypeScript 编译，无需“构建 npm”。AppID 由项目负责人配置，私人设置 `project.private.config.json` 不入库。若提示根目录找不到 app.json，重新打开项目。

单项检查：`npm run typecheck`、`npm test`、`npm run check:content`。页面或样式有变化时，按影响范围在开发者工具及设备上验证；Page/Component 桩测试不等于原生渲染验收。

## 代码结构

| 路径 | 职责与修改入口 |
| --- | --- |
| `miniprogram/domain/` | 阴阳／爻位类型、八卦与64卦映射、数字取余、变爻、检索；纯计算，不访问 wx |
| `miniprogram/state/` | `session.ts` 管理当前观变会话；`reading.ts` 管理查阅结果快照，均只在内存保存 |
| `miniprogram/pages/` | 9 个原生页面，入口与流程见下文 |
| `miniprogram/components/` | `hexagram-shape` 绘制卦形，`reading` 展示原文与折叠，`source-panel` 展示来源 |
| `miniprogram/data/` | 生成的正文、检索、速查和必要来源；`repository.ts` 按卦编号读取正文，不手改生成文件 |
| `content/` | 完整内容源、来源、异文与真实审核记录；按 [内容维护](content/README.md) 修改 |
| `scripts/` | `content-lib.mjs` 读取及验证全库，`content.mjs` 构建／核对运行产物 |
| `tests/` | 独立算法、检索／课堂表、无效资料拒绝与关键页面／组件行为；[基准说明](tests/fixtures/README.md) |

页面路径：

- 生成：`home` → `compose` 或 `numbers` → `hexagram` → `changes` → `analysis`。
- 查阅：`atlas` → `detail`；目录和上一／下一项在详情页内完成，点击“观察变化”后进入 `changes`。
- 速查：底部 `trigrams`，按八卦与类别查看对应关系及五行生克。

现行行为与算法见 [产品基线](docs/PRD.md)，课堂表单独维护于 [课堂资料](content/classroom.md)，工程约定见 [AGENTS.md](AGENTS.md)。包范围仅 `miniprogram/`；测试、文档、构建工具、内容审核档案与开发依赖均在包外。JS/WXML/WXSS 压缩开启，不上传 SourceMap。

## 当前检查与交付边界

2026-11-06 整理：移除未使用的运行字段、精简重复测试断言；随包来源由99条缩为实际引用的22条，完整来源留档。`miniprogram/data/` 静态源码减少82,145字节（约80.2 KiB，18%），不代表微信压缩后包体实测。旧阶段计划、验证流水和4张旧截图已移除。

八卦速查的全部属性统一显示简体，卦性“順／動／麗／說”显示为“顺／动／丽／悦”，合并与课堂表重复的词。课堂表已移至 `content/classroom.md`，内容引用、独立测试与64条审核关联同步迁移；64格和原典原词保留，审核状态未提高。来源元数据迁移后，资料版本为 `3.722d7d1a4d12`。

`npm run build:content`、`npm run check`（17/17）、`npm run check:content:release`、本地文档链接及 `git diff --check` 均通过。保留独立64组合、384爻名、4096变化、数字、检索与关键交互检查，新增八卦速查实际页面简体与去重回归。964个正文块、全部109条意象的原始值与说明、审核状态计数均保持；本次未重新进行微信工具编译、模拟器、真机或上传验证。

历史交付事实：

- 第一版 P0～P4 已由用户确认完成；`0.1.0` 对应 `bd6ac71`，2026-10-22 上传成功。此前 iPhone 16 Pro Max 与华为平板实测通过，具体系统／微信版本未完整记录，不推定全平台覆盖。
- 第二版独立查阅、六爻、目录与连续翻阅已完成。2026-10-23 用户确认“整段复制已经正常，剩余真机验证也通过了”，关闭该版设备清单；这是总体反馈，无新增逐项录像或设备版本记录。
- 最近上传：2026-11-06，`0.2.1`、程序提交 `c9f4c24`、资料 `3.d1de37bdf728`。正文与出处统一简体；微信开发者工具 CLI 返回上传成功，包体 298,365 字节（约291.4 KiB）。内容、类型、17项测试及发布内容检查通过；本次未重新进行真机验证，未提交审核或正式发布。[此前0.2.0上传凭据](docs/screenshots/66-v2-refresh-upload-success.jpg)留档。
- 2026-10-22 用户已取消首版文献人工复审和真机性能计时要求；[待审档案](docs/content-review.md) 继续保留真实状态，不重开为首版阻断，也不改为通过。

历史详细验收、失败尝试与旧截图可从 `e09abdb` 及更早提交追溯，例如 `git show e09abdb:docs/validation.md`。正文对校与审核材料继续留存，界面记录清理不扩大为内容资料删除。

## 下一步

下一阶段尚未立项，候选方向集中在 [体验探索](docs/ux-exploration.md)：先评审变化位标识与分析后完整查阅，再评审原文片段检索。它们尚未实施，不计入已完成的第二版目标。

交付时执行上述检查，按改动验证开发者工具／设备，提交后上传对应版本并记录提交与资料版本。预览、上传、体验版、提审和正式发布分别记录；正式发布由用户在公众平台处理。
