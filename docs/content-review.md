# 资料核对与审核进度

2026-10-22首版范围调整：用户取消文献人工复审要求，影印/独立复审和释义人工审查不再作为首版阻断；以下待审状态与原核对证据原样保留。首版技术发布检查仍验证完整性、引用、哈希、电子初核与已确认待修问题，不能把其通过称为全量文献审查通过。

## 当前累计进度（2026-10-22）

64卦、964原文块已录入；正文相关1060条审核、原81条来源保持不变。本轮查询资料另增64条检索、109条八卦对应、10条生克、183条审核和18条来源，全库共1243条审核、99条来源。原五卦保留各自采用版本，统一四库底本仍需逐条核对与迁移。

| 口径 | 累计录入 | 已完成核对 | 尚未完成 |
| --- | --- | --- | --- |
| 必需原文块 | 964 | 964已对照各自采用的电子录文 | 无缺块；不代表影印与独立复审通过 |
| 影印逐字复核 | 964 | 0 | 964块待影印核对 |
| 原文独立人工复审 | 964 | 0 | 964块待独立复审 |
| 展示说明（卦级与特殊知识） | 66条 | 7条原型辅助自审记录 | 59条待审；全部66条未有独立复审 |
| 经传白话留档 | 79 | 78条辅助自审记录 | 夬九五1条pending；累计新增885块无白话，白话审核不适用 |
| 爻位说明留档 | 30 | 30条原型辅助自审记录 | 全部为原型留档，当前不展示 |
| 检索资料 | 64 | 64条编辑初核，重点读音核对词典 | 64条独立复审 |
| 八卦对应 | 109 | 64条与PRD逐格一致，45条电子文献初核 | 109条独立复审；其中8条留档卦性说明待审 |
| 五行生克 | 10 | 相生、相克各5条电子段落初核 | 10条独立复审 |

原1060条审核对应964原文、64卦级说明、30爻位留档和2特殊说明，均有关联对象。当前计数见 [manifest.json](../content/manifest.json)，存储和维护方式见 [内容说明](../content/README.md)。审核按卦及查询类别分文件，共用流程单独登记；迁移保护与构建结果见[验证记录](validation.md)。电子核对passed不代表影印或独立复审通过，界面抽查也不提高审核状态。

## 查询资料版本与核对范围（2026-10-22）

检索沿用既有ID、卦名、全称及上下卦，繁体名对照[教育部《重编国语辞典修订本》六十四卦条目](https://dict.revised.moe.edu.tw/dictView.jsp?ID=63849&la=0&powerMode=0)整理。普通拼音为本项目逐卦编辑，不称为逐字词典转录；重点读音逐项关联词条：乾qián、屯zhūn、否pǐ、小畜/大畜xù、噬嗑shì hé、贲bì、夬guài、姤gòu、艮gèn、渐jiàn。解按[教育部《国语辞典简编本》解jiě词条第9义](https://dict.concised.moe.edu.tw/dictView.jsp?ID=22186&la=0&powerMode=0)的卦名义项登记，不根据未核网页自动加xiè。具体URL、版本与定位存于sources及逐卦refs。遁登记有名单和正文依据的“遯／天山遯”；其余无可靠别名依据则留空。声调、大小写、空格和ü输入变体由搜索规范化处理，不另造别名。

| 资料 | 实际采用版本与段落 | 核对边界 |
| --- | --- | --- |
| 课堂8类 | “PRD所载课堂资料转录”，docs/PRD.md §5.8，8类×8卦共64格 | 与现有PRD逐格核对；未取得原照片、教材页码或课堂原件，不另造古籍出处。季节原词保留，八门标注奇门相关课堂体系 |
| 经典卦性、颜色 | [《易传·说卦》电子修订2614055](https://zh.wikisource.org/w/index.php?title=易傳/說卦&oldid=2614055)，第七章卦性、第十一章乾坤震巽坎各段 | 8条卦性、5条颜色；原词保留“順、動、麗、說”等，8条短说明为本项目整理且待审；纸本版本和影印未核准 |
| 五行、先天数、生克、颜色 | [《梅花易数》卷一电子修订2690596](https://zh.wikisource.org/w/index.php?title=梅花易數/卷一&oldid=2690596)，象数易理篇之一的周易卦数、五行生剋、八宫所属五行；篇之三八卦万物属类各卦五色 | 逐段提取五行、数、各5条生克及8条颜色；纸本版本和影印未核准 |
| 先天方位 | [识典古籍《周会魁校正易经大全》电子摘录](https://www.shidianguji.com/zh/mid-page/7476580232355495973)，所载伏羲八卦方位相关段落 | 平台标注[明]胡广编、林罗山训点，书籍NA00535；实际可读摘录明列乾南、坤北、离东、坎西等8方，未核纸本刊年、叶码及影印；不冒称已读完整卷页 |

先天与后天方位分别建类；颜色不合并为唯一答案，例如坎在《说卦》为赤、在《梅花易数》为黑。109条对应由64条课堂、32条五行/先天数/先天方位/颜色扩展、8条经典卦性及5条经典颜色构成。全部新增对象保留独立复审pending，8条新说明explanationStatus为pending。按用户要求，速查页面不显示来源、体系、解释小字或先天数/方位；完整资料和上述待审状态继续留档。阅读来源组件读取各来源登记信息，无网址不显示复制链接。

## 显示通写（2026-10-22）

显示抽查修正：模拟器截图确认“𩔖、𤼵、𫉬、𢘆”被显示为卦形，影响11卦15块。逐项复核留存的普通《周易》固定电子页相应段落后，分别通写为“類、發、獲、恆”；仅改这四种字形，其余文字、标点与来源定位不变。原字和初次录入说明保留于notes，15条受影响审核重新记录实际电子核对及新哈希，旧哈希与修正前原文可由issues及提交d6678cb追溯。影印及独立复审仍pending，未批量批准其他审核。

| 通写 | 涉及原文块 |
| --- | --- |
| 𩔖 → 類 | 同人大象、颐六二小象、睽彖、中孚六四小象 |
| 𤼵 → 發 | 大有六五小象、丰六二及小象 |
| 𫉬 → 獲 | 随九四及小象、明夷六四及小象、解九二与上六、艮彖 |
| 𢘆 → 恆 | 恒六五 |

下文各批“保留”字形的描述是初次录入事实；上述15块的当前正文以本次明确通写为准，不将通写说成四库影印核字结论。实际显示复验见[验证记录](validation.md)。

蒙卦显示修正：用户反馈蒙卦卦辞左侧出现类似坤卦的图形。正文首字原为生僻字“𫎇”，阅读模板未插入额外卦形；现将该首字明确通写为“蒙”，与普通《周易》固定电子页一致，原字留在正文notes中，不称为四库影印核字结论。其余正文不改，仅重新核对并更新review-h4-statement；前版原文及审核可追溯至提交0a2ead8，旧哈希另留在审核issues。影印和独立复审仍pending。下文第二批摘录说明保留原始录入事实。

## 正文版本与摘录边界

六批新增正文采用《景印文淵閣四庫全書》0007册《周易注疏》所嵌电子录文，并与普通《周易》电子页对校；经传与王注、音义、孔疏分开，标点按阅读需要整理。下列页序均为DjVu文件页序，不是已核准影印叶码；每块另记卦、爻、经传类别和跨页范围。

卷页oldid只固定编排，不冻结所嵌Page录文；访问日、摘录、notes与主体哈希共同记录实际采用范围，电子对校不等于影印或独立复审。各批字形描述保留初次录入事实，当前通写以上节明确修正为准。

## 第六批版本、定位与异文

实际读取[卷八 oldid=9685965](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷08&oldid=9685965)、[卷九 oldid=9685966](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷09&oldid=9685966)、[卷十 oldid=9685967](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷10&oldid=9685967)所嵌电子录文，与下列14个普通电子页对校。

| 卦 | 卷次 | 对应文件页序 | 普通电子对校版本 |
| --- | --- | --- | --- |
| 鼎 | 卷8 | [478](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/478)～481 | [10647086](https://zh.wikisource.org/w/index.php?title=周易/鼎&oldid=10647086) |
| 震 | 卷9 | [485](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/485)～488 | [10644930](https://zh.wikisource.org/w/index.php?title=周易/震&oldid=10644930) |
| 艮 | 卷9 | [488](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/488)～490 | [10647135](https://zh.wikisource.org/w/index.php?title=周易/艮&oldid=10647135) |
| 漸 | 卷9 | [490](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/490)～493 | [2560535](https://zh.wikisource.org/w/index.php?title=周易/漸&oldid=2560535) |
| 歸妹 | 卷9 | [493](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/493)～495 | [10647182](https://zh.wikisource.org/w/index.php?title=周易/歸妹&oldid=10647182) |
| 豐 | 卷9 | [495](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/495)～498 | [10645290](https://zh.wikisource.org/w/index.php?title=周易/豐&oldid=10645290) |
| 旅 | 卷9 | [499](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/499)～501 | [10647234](https://zh.wikisource.org/w/index.php?title=周易/旅&oldid=10647234) |
| 巽 | 卷9 | [501](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/501)～503 | [10644966](https://zh.wikisource.org/w/index.php?title=周易/巽&oldid=10644966) |
| 涣 | 卷10 | [509](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/509)～511 | [10647580](https://zh.wikisource.org/w/index.php?title=周易/渙&oldid=10647580) |
| 节 | 卷10 | [511](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/511)～512 | [2405027](https://zh.wikisource.org/w/index.php?title=周易/節&oldid=2405027) |
| 中孚 | 卷10 | [513](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/513)～515 | [10647425](https://zh.wikisource.org/w/index.php?title=周易/中孚&oldid=10647425) |
| 小过 | 卷10 | [515](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/515)～518 | [10643238](https://zh.wikisource.org/w/index.php?title=周易/小過&oldid=10643238) |
| 既济 | 卷10 | [518](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/518)～520 | [2572417](https://zh.wikisource.org/w/index.php?title=周易/既濟&oldid=2572417) |
| 未济 | 卷10 | [520](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/520)～522 | [10647450](https://zh.wikisource.org/w/index.php?title=周易/未濟&oldid=10647450) |

- 鼎九四采用“其形渥”，普通页作“其刑渥”；“顚”“聰眀”“愼”“黄”等字形分别保留。震彖“出可以守宗廟社稷”前的王注未混入正文；“脩”“乗”“徃”“㛰”按录文留档。
- 艮卦辞以“艮其背”起首，未据普通页重复添加卦名；彖中的“𫉬”与卦辞“獲”分别保留。九三采用“列其夤，厲薰心”，普通页为“裂其夤，厲閽心”；六五“言有序”与普通页“言有孚”并列留档，未暗换主文。
- 渐保留“徃”“羣醜”“嵗”“願”，上九仍取主文“鴻漸于陸”；归妹保留“説”“乗”“恒”“虚”。丰保留“虚”“况於”“𤼵”“闚戸”“嵗”“覿”，九三、上六小象中间注文已分离。旅采用“懐其資”“童僕”，普通页为“懷其資”“僮僕”；巽保留“徃”，初六小象分离中间王注。
- 涣、中孚、既济的四库电子页将释卦辞段标题写作“象曰”，普通页归入“彖曰”；本档依据段落内容归入彖传，不将栏目标题收入正文。该标题差异已分别留notes，仍待影印核定。
- 涣初六采用“用拯馬壯，吉”，未从普通页补入“悔亡”；“渉”“乗”“羣”“逺”等字形保留。节九二小象保留“不出門庭凶”中的“凶”，普通页无此字；初九“户”保留。
- 中孚六三小象采用“或鼔或罷”，普通页作“可鼓或罷”；六四采用“月㡬望”，普通页作“月既望”；“内”“隂”“絶𩔖”等字形留档。小过彖后句采用“飛鳥遺之音”，未按普通页添加“有”；六五小象采用“雲”，普通页作“云”。
- 既济六四采用主文“繻有衣袽”，未据王注“繻宜曰濡”改字；九五小象分离中间注文后接“實受其福，吉大來也”。既济的“曵”“髙”、未济的“曵”“渉”依录文保留。

## 第五批版本、定位与异文

实际读取[卷六 oldid=9685963](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷06&oldid=9685963)、[卷七 oldid=9685964](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷07&oldid=9685964)、[卷八 oldid=9685965](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷08&oldid=9685965)所嵌电子录文，与下列15个普通电子页对校。

| 卦 | 卷次 | 对应文件页序 | 普通电子对校版本 |
| --- | --- | --- | --- |
| 遯 | 卷6 | [431](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/431)～433 | [10645108](https://zh.wikisource.org/w/index.php?title=周易/遯&oldid=10645108) |
| 大壯 | 卷6 | [433](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/433)～435 | [10646529](https://zh.wikisource.org/w/index.php?title=周易/大壯&oldid=10646529) |
| 晉 | 卷6 | [435](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/435)～437 | [10646579](https://zh.wikisource.org/w/index.php?title=周易/晉&oldid=10646579) |
| 明夷 | 卷6 | [437](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/437)～439 | [10644507](https://zh.wikisource.org/w/index.php?title=周易/明夷&oldid=10644507) |
| 家人 | 卷6 | [440](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/440)～441 | [2405005](https://zh.wikisource.org/w/index.php?title=周易/家人&oldid=2405005) |
| 睽 | 卷7 | [444](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/444)～446 | [10646622](https://zh.wikisource.org/w/index.php?title=周易/睽&oldid=10646622) |
| 蹇 | 卷7 | [446](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/446)～448 | [2405036](https://zh.wikisource.org/w/index.php?title=周易/蹇&oldid=2405036) |
| 解 | 卷7 | [448](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/448)～451 | [10646666](https://zh.wikisource.org/w/index.php?title=周易/解&oldid=10646666) |
| 損 | 卷7 | [451](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/451)～454 | [10646704](https://zh.wikisource.org/w/index.php?title=周易/損&oldid=10646704) |
| 益 | 卷7 | [454](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/454)～457 | [10646726](https://zh.wikisource.org/w/index.php?title=周易/益&oldid=10646726) |
| 萃 | 卷8 | [466](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/466)～468 | [10647546](https://zh.wikisource.org/w/index.php?title=周易/萃&oldid=10647546) |
| 升 | 卷8 | [468](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/468)～470 | [10646879](https://zh.wikisource.org/w/index.php?title=周易/升&oldid=10646879) |
| 困 | 卷8 | [470](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/470)～473 | [10647032](https://zh.wikisource.org/w/index.php?title=周易/困&oldid=10647032) |
| 井 | 卷8 | [473](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/473)～476 | [10645240](https://zh.wikisource.org/w/index.php?title=周易/井&oldid=10645240) |
| 革 | 卷8 | [476](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/476)～478 | [10643173](https://zh.wikisource.org/w/index.php?title=周易/革&oldid=10643173) |

- 遁正文采用“遯”，卦目仍用元数据中的“遁”；大象“逺”依电子录文保留。大壮九四为“大輿之輹”，普通页为“大轝之腹”。
- 晋彖“蕃庻”与卦辞“蕃庶”分别保留；六五采用“失得勿恤”，普通页爻辞作“矢得勿恤”。明夷保留“莅衆”“𫉬”，家人保留“内”“恒”。
- 睽六三采用“見輿曵，其牛掣”，普通页为“見輿曳，其牛𧤊”；上九“塗”“宼㛰”和彖“𩔖”保留。蹇大象采用“反身脩德”，上六小象分离中间注文后接“利見大人，以從貴也”。
- 解彖末为“解之時大矣哉”，未从普通页补入“義”；六五“維”、上六“髙”“𫉬”等另留notes。损初九为“已事遄往”，普通页爻辞作“祀事遄往”；六五小象采用“祐”。益保留“渉”“爲”“恒”。
- 萃卦辞开头为“萃亨”，普通页无此“亨”字；“聚乃通也”为王注，已分离。上六采用“齎咨”而普通页爻辞作“齎資”。升六四采用“王用亨于岐山”，普通页爻辞作“享”、小象仍作“亨”。
- 困九二采用“利用享祀”，普通页作“利用亨祀”；九四采用“來徐徐，困于金車”，普通页爻辞作“來荼荼，困于金轝”。九四、上六小象中间注文已分离；“揜”“惟”“歳”“眀”“蒺蔾”等依电子录文保留。
- 井卦辞作“甁”、彖作“瓶”；九三“王眀，竝受其福”、九五“井洌”与普通页“王明，並受其福”“井冽”分别留档。革彖采用“革而信之”“革之時大矣哉”，普通页作“革而信也”“革之時義大矣哉”；保留“文眀以説”“治厯眀時”等字形，上六爻辞分离中间注文。

## 第四批版本与定位

实际读取[卷四 oldid=9685961](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷04&oldid=9685961)、[卷五 oldid=9685962](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷05&oldid=9685962)、[卷六 oldid=9685963](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷06&oldid=9685963)所嵌电子录文，并与下表普通电子版本对校。

| 卦 | 卷次 | 对应文件页序 | 普通电子对校版本 |
| --- | --- | --- | --- |
| 贲 | 卷四 | [395](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/395)～397 | [2405035](https://zh.wikisource.org/w/index.php?title=周易/賁&oldid=2405035) |
| 复 | 卷五 | [403](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/403)～406 | [10643037](https://zh.wikisource.org/w/index.php?title=周易/復&oldid=10643037) |
| 无妄 | 卷五 | [406](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/406)～408 | [10645038](https://zh.wikisource.org/w/index.php?title=周易/无妄&oldid=10645038) |
| 颐 | 卷五 | [411](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/411)～413 | [10643091](https://zh.wikisource.org/w/index.php?title=周易/頤&oldid=10643091) |
| 大过 | 卷五 | [413](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/413)～416 | [10645184](https://zh.wikisource.org/w/index.php?title=周易/大過&oldid=10645184) |
| 坎 | 卷五 | [416](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/416)～419 | [10646381](https://zh.wikisource.org/w/index.php?title=周易/坎&oldid=10646381) |
| 咸 | 卷六 | [426](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/426)～429 | [10646450](https://zh.wikisource.org/w/index.php?title=周易/咸&oldid=10646450) |
| 恒 | 卷六 | [429](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/429)～431 | [10646486](https://zh.wikisource.org/w/index.php?title=周易/恒&oldid=10646486) |

### 第四批摘录边界与异文

- 贲彖采用电子主文“天文也”，未把注文“剛柔交錯而成文焉”补为普通页中的“剛柔交錯”。初九“舎”按图形字替代文字转写，小象仍为“舍”；爻辞“宼”和小象“寇”、六五“于丘園”等按采用录文保留。
- 复初九采用“无祗悔”“以脩身也”，普通页作“无祇悔”“以修身也”。无妄保留“于内”“祐”“繋”，普通页相应为“於內”“佑”“繫”。
- 颐保留“朶”、六二“顚”与六四“顛”的区别；六二小象“行失𩔖也”不改成普通页的“行失類也”。“拂經于丘，頤征凶”的标点按本篇注疏区分整理，未改主文字序。
- 大过卦辞“音相過之過”等随文音注不混入正文，摘录为“大過：棟橈，利有攸往，亨。”；保留上六“渉”。
- 坎卦辞分离中间注文，摘录为“習坎：有孚，維心亨。行有尚。”；彖采用“險之時用”，普通页为“坎之時用”。六四“樽酒簋貳，用缶，納約自牖”与普通页“尊酒簋，貳用缶。内約自牖”不同，小象为“剛柔際也”，普通页为“剛柔济也”；九五“祗既平”、上六“三嵗”按采用版本保留。
- 咸上六小象为“滕口說也”。恒六五采用字形“𢘆”，普通页为“恆”；彖“不巳”“久於”及上六“振恒”按采用录文保留，普通页分别为“不已”“久于”及爻辞“震恆”。这些字形与异文均留待影印核定，不视为已通过影印或独立复审。

## 第三批版本、定位与异文

实际读取[卷三 oldid=9685960](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷03&oldid=9685960)、[卷四 oldid=9685961](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷04&oldid=9685961)所嵌电子录文，并逐卦与下列普通电子版本对校。

| 卦 | 卷次 | 对应文件页序 | 普通电子对校版本 |
| --- | --- | --- | --- |
| 大有 | 卷三 | [372](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/372)～374 | [10645712](https://zh.wikisource.org/w/index.php?title=周易/大有&oldid=10645712) |
| 谦 | 卷四 | [378](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/378)～380 | [2106142](https://zh.wikisource.org/w/index.php?title=周易/謙&oldid=2106142) |
| 豫 | 卷四 | [381](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/381)～383 | [10645735](https://zh.wikisource.org/w/index.php?title=周易/豫&oldid=10645735) |
| 随 | 卷四 | [383](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/383)～386 | [10645020](https://zh.wikisource.org/w/index.php?title=周易/隨&oldid=10645020) |
| 蛊 | 卷四 | [386](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/386)～388 | [2106145](https://zh.wikisource.org/w/index.php?title=周易/蠱&oldid=2106145) |
| 临 | 卷四 | [388](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/388)～390 | [2106146](https://zh.wikisource.org/w/index.php?title=周易/臨&oldid=2106146) |
| 观 | 卷四 | [390](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/390)～392 | [10645159](https://zh.wikisource.org/w/index.php?title=周易/觀&oldid=10645159) |
| 噬嗑 | 卷四 | [392](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/392)～395 | [10645753](https://zh.wikisource.org/w/index.php?title=周易/噬嗑&oldid=10645753) |

### 第三批异文与图形字

- 大有九二采用“大車”，普通页作“大轝”；九四采用“彭”，普通页爻辞作“尫”、小象仍作“彭”。九四小象为“明辯晢也”，普通页为“明辨晰也”；上九“祐”与普通页“佑”不同，依采用电子录文保留。
- 谦彖传的“鬼”是电子页图形字，按其替代文字转写为“鬼神害盈而福謙”，未因纯文本缺字而遗漏。采用“踰”，普通页作“逾”；此为电子摘录处理，不是影印逐字核准。
- 豫九四采用“朋盍簪”，普通页作“朋盍戠”；上六保留爻辞“㝠”、小象“冥”的差别。大象“徳”、六五“恒”等字形依采用录文保留。
- 随采用“係”“舎”“𫉬”，普通页有“系”“舍”“獲”。六三标点按采用版本注疏中“隨有求得也”“故利居貞也”分句，未更改经文字序。
- 蛊保留“徃”“徳”“髙”；初六按本篇注文中父子责任的区分，标为“有子，考无咎”，仅整理标点。卦形与上下卦由独立领域元数据提供，不从电子卷页的装饰符提取。
- 临保留“敎”“内”；观六二用“闚”，普通页为“窺”，小象“闚觀女貞”无“利”字。噬嗑大象用“勑”而普通页用“敕”，六三用“腊肉”而普通页用“昔肉”。
- 大有小象“𤼵”、随爻辞与小象“𫉬”等原录文字形留待影印核定；当前显示通写见上节。

## 第二批版本、定位与异文

本次实际读取[卷二 oldid=9685959](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷02&oldid=9685959)、[卷三 oldid=9685960](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷03&oldid=9685960)所嵌的电子录文，分开经传与王注、音义、孔疏，整理标点；另逐卦读取普通《周易》电子页作对校。

| 卦 | 四库卷次 | 经传对应文件页序 | 普通电子对校版本 |
| --- | --- | --- | --- |
| 蒙 | 卷二 | [342](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/342)～345 | [10645379](https://zh.wikisource.org/w/index.php?title=周易/蒙&oldid=10645379) |
| 需 | 卷二 | [345](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/345)～347 | [10643261](https://zh.wikisource.org/w/index.php?title=周易/需&oldid=10643261) |
| 讼 | 卷二 | [347](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/347)～350 | [10645409](https://zh.wikisource.org/w/index.php?title=周易/訟&oldid=10645409) |
| 师 | 卷三 | [354](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/354)～356 | [2405011](https://zh.wikisource.org/w/index.php?title=周易/師&oldid=2405011) |
| 比 | 卷三 | [356](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/356)～359 | [10645543](https://zh.wikisource.org/w/index.php?title=周易/比&oldid=10645543) |
| 小畜 | 卷三 | [359](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/359)～362 | [10645530](https://zh.wikisource.org/w/index.php?title=周易/小畜&oldid=10645530) |
| 履 | 卷三 | [363](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/363)～365 | [10647513](https://zh.wikisource.org/w/index.php?title=周易/履&oldid=10647513) |
| 同人 | 卷三 | [370](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/370)～372 | [10645635](https://zh.wikisource.org/w/index.php?title=周易/同人&oldid=10645635) |

### 第二批异文与摘录边界

- 蒙卦辞首字依电子录文作“𫎇”，其余多作“蒙”；上九小象为“利用禦宼”，普通页为“利禦寇”，多出的“用”字如实保留待核。
- 需保留“䧟”“恒”“宼”“愼”；讼保留“户”“卽”，上九采用“禠”，普通页作“褫”。师采用“衆”“懐”；比采用“内”“舎”“三驅”，普通页有“內”“舍”“三敺”。这些电子字形差异不擅自统一成影印核准结论。
- 小畜九三为“輿說輻”，普通页为“車說輹”；上九为“旣雨旣處，尚德載”，普通页为“既雨既處，尚得載”。依四库电子主文暂存。
- 履彖传“不咥人亨”之后，四库电子主文无“利貞”，普通页多这两个字；大象作“辯上下”，普通页作“辨上下”；上九作“考祥”，普通页作“考詳”。
- 同人保留“渉”“𩔖”等字形及爻辞“歲”与小象“嵗”的差别；九四采用“墉”而普通页作“庸”，九五采用“號咷”而普通页作“號啕”。
- 师卦辞止于“无咎”，紧随的“丈人嚴莊之稱也”属注文；蒙、小畜等主文之间的注文也已分离，不因断行把注疏拼入正文。
- 八条意象、整体含义为项目辅助整理，展示释义及独立复审仍pending。

## 第一批版本、定位与异文

逐段读取卷二、三、五、八电子录文，与下表普通《周易》电子页对校；仅核见电子录文及影印链接，未完成影印图像逐字复核。

| 卦（15块/卦） | 四库本电子卷页版本 | 对应影印文件页 | 普通电子对校版本 |
| --- | --- | --- | --- |
| 屯 | [卷二 9685959](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷02&oldid=9685959) | [339](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/339)～342 | [10643482](https://zh.wikisource.org/w/index.php?title=周易/屯&oldid=10643482) |
| 泰 | [卷三 9685960](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷03&oldid=9685960) | [365](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/365)～368 | [2106138](https://zh.wikisource.org/w/index.php?title=周易/泰&oldid=2106138) |
| 否 | 同卷三 | [368](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/368)～369 | [10645603](https://zh.wikisource.org/w/index.php?title=周易/否&oldid=10645603) |
| 姤 | [卷八 9685965](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷08&oldid=9685965) | [463](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/463)～465 | [10646826](https://zh.wikisource.org/w/index.php?title=周易/姤&oldid=10646826) |
| 剥 | [卷五 9685962](https://zh.wikisource.org/w/index.php?title=周易注疏_(四庫全書本)/卷05&oldid=9685962) | [401](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/401)～403 | [10645800](https://zh.wikisource.org/w/index.php?title=周易/剝&oldid=10645800) |
| 大畜 | 同卷五 | [408](https://zh.wikisource.org/wiki/Page:文淵閣四庫全書_0007冊.djvu/408)～411 | [10646304](https://zh.wikisource.org/w/index.php?title=周易/大畜&oldid=10646304) |

### 异文与待办

- 屯六三图形字“舎”按电子页图像的替代文字转写，保留“卽”“徃”等录文字形，待影印核字。
- 泰、否初爻采用“彚”；否九五采用“繋于苞桑”。普通电子页有不同字形或主文，留待影印定位复核。
- 剥大象采用“山附于地”，上九采用“君子得輿”；普通电子对校页分别作“山附地上”“君子德車”并列异文。
- 大畜九三采用“曰閑輿衛”，四库电子音义有“曰音越”；普通电子页作“日”且多一“吉”字。大畜初九小象电子录文作“利巳”，爻辞作“利已”，依所见暂存；两处均待影印字形核定。
- 六条新增意象/整体含义为项目辅助整理，审核仍pending。

## 阶段二历史：已采用的原型电子版本

| 卦 | 固定版本（维基文库贡献者录文） | 定位与数量 |
| --- | --- | --- |
| 乾 | [oldid=2404991](https://zh.wikisource.org/w/index.php?title=周易/乾&oldid=2404991) | 易經卦辞、初九至上九、用九；彖曰；象曰整卦、六小象与用九象，共 17 块 |
| 坤 | [oldid=2404999](https://zh.wikisource.org/w/index.php?title=周易/坤&oldid=2404999) | 易經卦辞、初六至上六、用六；彖曰；象曰整卦、六小象与用六象，共 17 块 |
| 离 | [oldid=10646424](https://zh.wikisource.org/w/index.php?title=周易/離&oldid=10646424) | 易經卦辞、六爻；彖曰；象曰整卦与六小象，共 15 块 |
| 夬 | [oldid=2405003](https://zh.wikisource.org/w/index.php?title=周易/夬&oldid=2405003) | 易經卦辞、六爻；彖曰；象曰整卦与六小象，共 15 块 |
| 兑 | [oldid=2404993](https://zh.wikisource.org/w/index.php?title=周易/兌&oldid=2404993) | 易經卦辞、六爻；彖曰；象曰整卦与六小象，共 15 块 |

保留繁体和“无”“羣”等原字，分句标点有阅读整理。原文不含注疏正文和《文言》。乾彖传取“大和”，网页另列“太和”异文；离九三保留“差”，网页另注一作“嗟”，注释说明而不暗换原字。“原文通过”在本原型记录中仅表示与以上固定电子录文逐段核对通过，不代表与影印本逐字核对通过。

白话为项目自行辅助整理，没有复制现代译注。每条记录标明实际核对流程为 Codex，不能据此称为人工独立审查。夬九五“莧陸”的植物指称及取象解释有分歧，其释义状态保持 pending，原文状态为电子核对 passed。经传、爻辞和特殊条文的白话现仅保留在资料档案中，界面只展示原文；意象与整体含义仍按原有记录展示。

## 阶段二历史：影印底本登记（S1-06）

《周易注疏》，王弼、韩康伯注，陆德明音义，孔颖达疏；版本为《景印文淵閣四庫全書》第 0007 册，经部易类。电子入口：[四库本作品页](https://zh.wikisource.org/wiki/周易注疏_(四庫全書本))，其“底本”栏链接到[该册影印索引](https://zh.wikisource.org/wiki/Index:文淵閣四庫全書_0007冊.djvu)，可按卷、卦、爻与影印叶码定位。

本轮已登记并核见上述版本与影印入口，另读取《周易正义》乾、坤、离、夬、兑的电子注疏段落辅助理解；尚未完成五卦逐页影印核对。当前原型不将普通《周易》电子录文冒称为四库本录入，正式全库应统一迁移到选定底本、登记叶码并重新审核。S1-06 的版本登记已完成，正式底本逐字核对仍未完成。

## 许可与署名

维基文库录文保留“维基文库贡献者”署名、版本及段落定位，按所登记的 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 及附加条款处理。课堂转录、辞典及其他平台各按sources.json的rightsNote登记，不把维基文库许可套用于全库，不宣称取得原照片或教材许可。阅读来源面板只读取登记信息；速查页面不展示来源。代码许可尚未指定。
