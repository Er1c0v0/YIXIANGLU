# 易象录

微信原生 TypeScript 学习小程序。截至2026-10-22，阶段一、二基础原型已验收；64卦、964原文块已录入，支持生成、阅读、变爻、图鉴搜索筛选与八卦分类速查。影印与独立复审、完整版本适配和体验版发布继续单独推进。

界面遵循简洁原则，减少说明性文字。阅读顺序为卦辞、意象与整体含义、彖传、大象传；前两区默认展开且可折叠。经传及爻辞只显示原文，来源面板包含爻辞及对应小象的定位，既有白话与审核记录留档。数字输入不显示计算过程，图鉴不显示收录数量提示。

## 安装与运行

使用 Node.js 22 或更高版本，在仓库根目录运行 `npm ci`。依赖仅用于开发，不需要在微信开发者工具“构建 npm”。

微信开发者工具导入仓库根目录（project.config.json 所在位置），运行目录为 miniprogram/，启用 TypeScript 编译。AppID 使用项目负责人配置的值；私人设置 project.private.config.json 不纳入 Git。先在根目录运行 `npm run build:content` 再在开发者工具编译。

## 命令

```sh
npm ci
npm run build:content   # 从 content/ 构建随包资料与版本清单
npm run typecheck      # 正式代码 TypeScript 检查
npm test               # 6组领域＋3组正文资料＋3组检索速查测试
npm run check:content  # 增量结构、引用、审核哈希和缺项统计
npm run check          # 当前范围全部本地检查
npm run check:content:release # 64卦/964块及必需审核门槛；当前预期失败
```

算法与页面不依赖网络、登录或后端。内容来源链接用于说明，不会联网读取正文。测试、夹具和脚本均位于 miniprogram/ 外。

## 开发文档

- [产品需求](docs/PRD.md)
- [开发约定与当前状态](AGENTS.md)
- [开发计划](docs/development-plan.md)
- [内容维护与审核格式](content/README.md)
- [独立算法基准](tests/fixtures/README.md)

[验证记录](docs/validation.md) 保留提交前本地检查、显示抽查范围、近期修正截图及历史验收摘要；[资料核对](docs/content-review.md) 保存具体版本、通写记录、异文与真实审核待办。原型已于2026-10-21由用户确认收尾，当前正文与查询资料已齐，继续文献审核与完整版本适配，安排见开发计划。

图鉴支持简繁卦名、全称、已登记别名、带调或无调拼音、首字母和精确卦序；上下卦与关键词取交集，清除只移除关键词，重置恢复全部。八卦速查展示课堂8类、五行、颜色与生克，卦性置顶，相生与相克分两栏；页面只显示类别和对应内容，来源与说明留档。本次条件只保留于内存。

首次导入或修改运行目录后，如工具仍报告根目录找不到app.json，使用“项目 → 重新打开此项目”刷新工程配置。

## 目录

- miniprogram/domain/：纯模型、64卦元数据、计算与检索。
- miniprogram/state/：内存会话和路由关联。
- miniprogram/pages/、components/：原生页面和实际复用的三个组件。
- content/：hexagrams/保存正文，search.json、imagery.json、elements.json保存查询资料；reviews/按卦及新资料类别保存审核，共享methods.json；sources.json登记来源，manifest.json由构建生成。详见[内容说明](content/README.md)。
- scripts/：内容构建与校验；tests/：领域与资料测试，fixtures/保留独立基准。
- docs/：PRD、开发计划、资料核对与验证记录；screenshots/仅保留近期必要截图。

开发检查报告资料计数与真实待审数量。内容发布检查要求完整正文、检索、速查资料及必要审核完成；当前仍因原文审核未完成而被拒绝。该命令不替代设备适配及体验版发布验收。
