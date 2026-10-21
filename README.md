# 易象录

微信原生 TypeScript 学习小程序。当前已实现 PRD 阶段一、二的可运行原型：完整 64 卦结构与计算，五卦样例的生成、阅读及变爻流程。完整资料库与体验版尚未交付。

## 安装与运行

使用 Node.js 22 或更高版本，在仓库根目录运行 `npm ci`。依赖仅用于开发，不需要在微信开发者工具“构建 npm”。

微信开发者工具导入仓库根目录（project.config.json 所在位置），运行目录为 miniprogram/，启用 TypeScript 编译。AppID 使用项目负责人配置的值；私人设置 project.private.config.json 不纳入 Git。先在根目录运行 `npm run build:content` 再在开发者工具编译。

## 命令

本轮实际通过类型、算法与内容结构检查；完整离线和真机验收仍有待办。

```sh
npm ci
npm run build:content   # 从 content/ 构建随包样例数据
npm run typecheck      # 正式代码 TypeScript 检查
npm test               # 精简领域参数化测试
npm run check:content  # 样例结构、引用、审核哈希检查
npm run check          # 当前范围全部本地检查
```

算法与页面不依赖网络、登录或后端。内容来源链接用于说明，不会联网读取正文。测试、夹具和脚本均位于 miniprogram/ 外。

## 开发文档

- [产品需求](PRD.md)
- [开发约定与当前状态](AGENTS.md)
- [本轮计划](docs/development-plan.md)

[实际验证记录与截图](docs/validation.md) 列明两条主流程、长输入、返回状态和异常提示结果；[资料核对](docs/content-review.md) 登记具体电子版本、影印底本计划与未决问题。

模拟器通过不能代替 iOS/Android 真机或体验版交付。Network Offline 预设拦截了工具本地 SDK 通道，完整离线流程未通过；工具已恢复在线。样例为电子核对与辅助释义自审，影印本及人工独立复审待完成，夬九五释义仍待复核。

## 演示

1. 首页 → 手动组合 → 上下皆乾 → 本卦阅读 → 选择九二、九五 → 离卦分析。
2. 首页 → 数字起卦 → 下卦数 17、上卦数 26、变爻数 9 → 夬卦阅读 → 固定九三 → 兑卦分析。

首次导入或修改运行目录后，如工具仍报告根目录找不到 app.json，使用“项目 → 重新打开此项目”刷新工程配置。所有检查均在仓库根目录运行；无需搭建后端。

## 目录

- miniprogram/domain/：纯模型、64 卦元数据、计算。
- miniprogram/state/：内存会话和路由关联。
- miniprogram/pages/、components/：原生页面和实际复用的三个组件。
- content/：样例正文、来源、审核源文件；随包产物为 miniprogram/data/content.ts。
- tests/、scripts/、docs/：开发测试、内容构建与核对、交付证据，均不进入运行目录。

当前没有全库发布检查器。后续须补齐内容与来源审核，完成两端真机和离线重进、目标 AppID 权限及体验成员验收后，才进入体验版上传；本轮未上传。
