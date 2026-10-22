# 易象录

微信原生 TypeScript 学习小程序。阶段一、二基础原型已验收；阶段三已完成前五批资料录入，随包资料为50卦、754原文块，支持生成、阅读与变爻。完整64卦资料库、搜索筛选、八卦速查和体验版仍待后续实施。

界面遵循简洁原则，减少说明性文字。阅读顺序为卦辞、意象与整体含义、彖传、大象传；前两区默认展开且可折叠。经传及爻辞只显示原文，来源精简，既有白话与审核记录留档。数字输入不显示计算过程。

## 安装与运行

使用 Node.js 22 或更高版本，在仓库根目录运行 `npm ci`。依赖仅用于开发，不需要在微信开发者工具“构建 npm”。

微信开发者工具导入仓库根目录（project.config.json 所在位置），运行目录为 miniprogram/，启用 TypeScript 编译。AppID 使用项目负责人配置的值；私人设置 project.private.config.json 不纳入 Git。先在根目录运行 `npm run build:content` 再在开发者工具编译。

## 命令

```sh
npm ci
npm run build:content   # 从 content/ 构建随包资料与版本清单
npm run typecheck      # 正式代码 TypeScript 检查
npm test               # 6组领域测试＋3组资料测试，自动覆盖已录入卦
npm run check:content  # 增量结构、引用、审核哈希和缺项统计
npm run check          # 当前范围全部本地检查
npm run check:content:release # 64卦/964块及必需审核门槛；当前预期失败
```

算法与页面不依赖网络、登录或后端。内容来源链接用于说明，不会联网读取正文。测试、夹具和脚本均位于 miniprogram/ 外。

## 开发文档

- [产品需求](PRD.md)
- [开发约定与当前状态](AGENTS.md)
- [本轮计划](docs/development-plan.md)

[验证记录](docs/validation.md) 保留实际检查、历史验收摘要及最新一批截图；[资料核对](docs/content-review.md) 保存具体版本、异文与真实审核待办。原型已于2026-10-21由用户确认收尾，当前继续资料扩充，剩余14卦将在最后一批录入，卦目见开发计划。

首次导入或修改运行目录后，如工具仍报告根目录找不到app.json，使用“项目 → 重新打开此项目”刷新工程配置。

## 目录

- miniprogram/domain/：纯模型、64 卦元数据、计算。
- miniprogram/state/：内存会话和路由关联。
- miniprogram/pages/、components/：原生页面和实际复用的三个组件。
- content/hexagrams/：每卦独立JSON；sources.json、reviews.json保留来源与审核，manifest.json为自动生成的清单。随包产物为 miniprogram/data/content.ts。
- tests/、scripts/、docs/：核心测试、内容构建与核对、当前计划及验证摘要，均不进入运行目录。

开发检查允许未收齐正文，并报告缺卦、原文块及待审数量。内容发布检查独立要求64卦、964原文块、影印/独立原文复核及展示说明审核完成；当前会被正确拒绝。该命令不替代后续索引、八卦速查、设备适配及体验版发布验收。
