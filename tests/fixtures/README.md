# 独立六爻基准

hexagrams.ts 按通行《周易》卦序保存 64 组六爻字串，均为下至上。它是单独录入的测试基准，不导入生产映射，也不由生产 8×8 表生成。

符号参照入口：[Unicode Yijing Hexagram Symbols U+4DC0–U+4DFF](https://www.unicode.org/charts/PDF/U4DC0.pdf)。该图表仅供对照，仓库未复制图表、字体或图片。PRD 8.5 中乾/坤、泰/否、屯、姤/夬、离、兑、剥和大畜等关键案例另有显式预期值。测试以每位数组翻转为参照验证位运算，并以开发环境 BigInt 独立验证取余。

这些算法基准不代表 64 卦正文已经逐条完成影印本或人工审查；资料审核范围另见 docs/content-review.md。
