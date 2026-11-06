# 易象录

易象录是一个微信原生 TypeScript 小程序，用于《易经》原文阅读、卦象学习和课堂查询。资料随包离线提供，无账号、后端或网络接口依赖。

## 功能

| 功能 | 内容 |
| --- | --- |
| 卦象生成 | 手动选择上下卦，或输入三组数字生成本卦与固定变爻 |
| 变爻分析 | 对照本卦、所选爻辞及变卦；手动模式支持0～6爻 |
| 六十四卦 | 按简繁卦名、拼音、卦序和上下卦筛选，独立阅读与连续翻阅 |
| 原文阅读 | 卦辞、彖传、大象、六爻及小象，附来源和阅读目录，支持整段长按选取 |
| 字词释义 | 随文底部注解与分类词表；40组词条、97项语境用法，支持登记的简繁写法搜索 |
| 八卦速查 | 课堂取象、五行、颜色及生克关系 |

本项目辅助识卦、读辞和观察变化，不生成个人运势、主爻判断或吉凶决策。

## 本地运行

需要 Node.js 22 或更高版本、npm 和微信开发者工具。

```sh
git clone https://github.com/Er1c0v0/YIXIANGLU.git
cd YIXIANGLU
npm ci
npm run build:content
npm run check
```

在微信开发者工具中导入仓库根目录，使用自己的小程序 AppID 或工具提供的测试模式。项目配置已指定 `miniprogram/` 为运行目录并启用 TypeScript 编译，无需“构建 npm”。页面仅使用随包资料，无需配置服务器。

`project.private.config.json` 是本机配置，不提交。若提示找不到 `app.json`，检查导入的是仓库根目录，且 `miniprogramRoot` 为 `miniprogram/`。

## 仓库结构与审阅入口

| 路径 | 职责 |
| --- | --- |
| [miniprogram/domain/](miniprogram/domain/) | 卦序与卦形映射、数字取余、变爻及检索；纯计算，不访问 `wx` |
| [miniprogram/state/](miniprogram/state/) | 观变会话与查阅结果快照，只在内存保存 |
| [miniprogram/pages/](miniprogram/pages/) | 10个原生页面及共用注解浮层 |
| [miniprogram/components/](miniprogram/components/) | 卦形、原文阅读与来源组件 |
| [miniprogram/data/](miniprogram/data/) | 随包资料与读取入口，资料模块由构建器生成 |
| [content/](content/README.md) | 可复现的正文、词条、来源、课堂原表与审核记录 |
| [scripts/](scripts/) | 内容构建、引用检查、审核哈希与发布内容校验 |
| [tests/](tests/fixtures/README.md) | 独立算法基准、关键交互与无效资料拒绝检查 |

审阅算法可从 [casting.ts](miniprogram/domain/casting.ts) 和[独立基准](tests/fixtures/hexagrams.ts)开始；阅读流程从 [detail](miniprogram/pages/detail/index.ts) 和 [reading](miniprogram/components/reading/index.ts)开始；字词关联与审核规则见 [glossary-lib.mjs](scripts/glossary-lib.mjs)。协作约定见 [AGENTS.md](AGENTS.md)。

主要页面流程：

- 生成：`home` → `compose`／`numbers` → `hexagram` → `changes` → `analysis`。
- 查阅：`atlas` → `detail`，目录与连续翻阅在详情页内完成。
- 字词：`atlas` → `glossary`；各阅读页可打开当前段落的字词注解。
- 速查：底部导航进入 `trigrams`。

## 构建与验证

| 命令 | 用途 |
| --- | --- |
| `npm run build:content` | 从内容源生成随包数据及资料清单 |
| `npm run check` | 内容一致性、TypeScript 类型和全部测试 |
| `npm run check:content:release` | 检查资料完整性、电子初核及已确认待修问题 |
| `npm run typecheck`／`npm test` | 单独运行类型或测试检查 |

自动检查覆盖64组合、384爻名、4096变化、长数字取余、检索、会话归属、阅读目录、注解交互，以及悬空引用和过期审核拒绝。独立基准不从生产映射生成。

当前22项测试通过。字词功能已在微信开发者工具 Stable 2.02.2608080、基础库3.17.5中编译并检查主要阅读流程、搜索、浮层关闭、连续换卦、小屏与大字号。Page/Component 桩和模拟器不代替真机验收；新增字词功能尚未完成真机验收。

运行包仅包含 `miniprogram/`；构建工具、测试、内容源和审核档案留在包外。依赖目录、自动编译的 JavaScript、本地缓存、临时脚本、过程截图及旧测试日志不纳入版本控制。Git 提交／推送与小程序上传、提审、发布是独立操作。

## 资料与许可

现有64卦共964块原文。注解按已登记的段落语境取义，以读音加一句简释为主；有争议或尚未完成的审核保持待审状态。当前40组字词的释义审查与独立复审仍待完成，电子初核通过不等于影印或独立人工复审通过。

资料版本、完整性与待审计数见 [manifest.json](content/manifest.json)，维护方法见[内容说明](content/README.md)，采用版本、异文和审核边界见[资料核对记录](content/review-notes.md)。原文、白话留档、来源与审核证据不因界面精简而删除。

文献录文、辞典和课堂转录分别按 [sources.json](content/sources.json) 的署名及权利说明处理。代码尚未指定开源许可证；不将某一资料来源的许可套用于整个仓库。
