// data_human.js - V12.1 修复版
// 修复了 'requires' 和 'hideIf' 为 V12.1 的函数
// 修复了 'adjustment_bridge' 的创建方式

(function() {
    const G = window.Game;

    // --- 大正3年: 训练 ---
    G.addScene('year3_human_training', {
        type: 'event',
        title: "大正3年: 天生的拳师",
        image: "training_water.jpg",
        text: (s) => "你被主公送往培育师·鳞泷的门下。你在这里遇到了他的两个弟子：沉默寡言的义勇，和戴着狐狸面具、活力四射的锖兔。",
        choices: [
            {
                text: "（学习水之呼吸）",
                action: (s, G) => {
                    G.setResult("你失败了。你的身体无法与水的流动同步。鳞泷：'你的身体太刚猛了！'");
                    G.renderScene(); // 停留在当前场景
                }
            },
            {
                text: "（学习剑术）",
                action: (s, G) => {
                    G.setResult("锖兔在教你，但他很头痛。'你为什么总是用刀戳？！' 你的身体只会出拳。");
                    G.renderScene(); // 停留在当前场景
                }
            },
            {
                text: "（将呼吸法与体术结合）",
                // V12.1 BUG修复: 从 'requires: { str: 10 }' 变为 'check' 函数
                check: (s, G) => ({ 
                    passed: G.checkSTR(10), 
                    reqText: "需 STR >= 10" 
                }),
                // V12.1 BUG修复: 从 'hideIf: { trait: 'void' }' 变为 'hideIf' 函数
                hideIf: (s) => s.trait === 'void',
                action: (s, G) => {
                    G.setResult("你将全集中呼吸融入了素流体术！");
                    G.gotoScene('year3_training_end');
                }
            },
            {
                text: "（从零开始学习体术呼吸）",
                // V12.1 BUG修复: 从 'requires: { trait: 'void' }' 变为 'check' 函数
                check: (s, G) => ({ 
                    passed: s.trait === 'void', 
                    reqText: "需【虚无之拳】"
                }),
                hideIf: (s) => s.trait !== 'void', // 仅虚无开局可见
                action: (s, G) => {
                    G.updateStats({ str: 10 });
                    G.setResult("你重新点燃了斗志！你领悟了【壹之型·乱式】！", "good");
                    G.gotoScene('year3_training_end');
                }
            }
        ]
    });

    G.addScene('year3_training_end', {
        type: 'event',
        title: "大正3年: 训练结束",
        image: "training_water.jpg",
        text: (s) => "鳞泷叹了口气：'你的天赋不在刀。但没有日轮刀，你无法斩杀鬼。' 他给了你一把日轮短刀。'至少，在最终选拔时，用这个来斩首吧。'",
        choices: [
            {
                text: "（收下短刀）",
                action: (s, G) => {
                    G.updateStats({ weapon: 'short_sword' });
                    G.gotoScene('adjustment_bridge_0'); // V12.1: 进入桥接, 年份在 G.gotoScene 中自动处理
                }
            }
        ]
    });

    // --- 趣事：岩柱 (V12.1: 改为独立场景) ---
    G.addScene('event_gyomei_training', {
        type: 'event',
        title: "趣事：岩柱的“呼吸”",
        image: "gag_gyomei.jpg",
        text: (s) => "你找到了悲鸣屿行冥...他告诉你：'呼吸法...？哦，那个啊。就是...**吸气！然后...嘿！**' 他猛地举起铁球，砸碎了旁边的巨石。",
        choices: [
            {
                text: "（震惊）'...您是说，就是单纯的吸气和...发力？'",
                action: (s, G) => {
                    G.updateStats({ str: 10 });
                    // G.setResult 在 updateStats 中自动调用
                    G.gotoScene('adjustment_bridge_0'); // 返回桥接
                }
            },
            {
                text: "（模仿）'吸气...嘿！' (你学着他的样子猛击巨石)",
                action: (s, G) => {
                    G.updateStats({ str: 15, hp: -10, gy_h: 10 });
                    G.setResult("你把手骨震裂了(HP-10)，岩柱好感+10。");
                    G.gotoScene('adjustment_bridge_0'); // 返回桥接
                }
            }
        ]
    });

    // --- 大正3-4年: 桥接阶段 (V12.1: 使用 createBridgePhase 修复) ---
    G.addScene('adjustment_bridge_0', 
        G.createBridgePhase(
            "大正3-4年: 选拔前夜",
            "最终选拔即将开始。鳞泷给了你最后的准备时间。",
            'year4_final_selection', // AP耗尽后跳转到此
            [
                {
                    text: "（极限训练）'在瀑布下练习【壹之型】！'",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -15 })
                },
                {
                    text: "（养伤/冥想）'回忆恋雪的教导。'",
                    cost: 1,
                    action: () => {
                        let recovered = 10 + Math.floor(G.state.hum / 2);
                        G.updateStats({ hp: recovered });
                        G.setResult(`你的伤势恢复了 ${recovered} HP。`, "good");
                    }
                },
                {
                    text: "（趣事·岩柱）'拜访岩柱悲鸣屿！'",
                    cost: 1,
                    oneTime: true, // 只能做一次
                    oneTimeFlag: 'visited_gyomei_1', // 用来标记
                    prereq: (s, G) => G.checkHUM(10), // V12.1: 使用 prereq 函数
                    action: () => G.gotoScene('event_gyomei_training') // 跳转到趣事
                },
                {
                    text: "（趣事·锖兔）'和锖兔对练。'",
                    cost: 1,
                    action: () => G.updateStats({ str: 5, sa_h: 10 })
                }
            ]
        )
    );

    // --- 大正4年: 最终选拔 ---
    G.addScene('year4_final_selection', {
        type: 'event',
        title: "大正4年: 最终选拔·命运",
        image: "final_selection.jpg",
        text: (s) => "藤袭山。你、义勇和锖兔一同参加选拔。突然，一只巨大的、畸形的'手鬼'出现了，它狂笑着：'又是鳞泷的弟子...戴狐狸面具的...！'",
        choices: [
            {
                text: "（独自迎战）'这家伙交给我！'",
                check: (s, G) => ({ 
                    passed: G.checkSTR(20), 
                    reqText: "需 STR >= 20" 
                }),
                action: (s, G) => {
                    G.updateStats({ str: 10, hp: -10 });
                    G.gotoScene('event_hand_demon_kill');
                }
            },
            {
                text: "（号召其他人）'大家一起上！它在害怕！'",
                check: (s, G) => ({ 
                    passed: G.checkHUM(20), 
                    reqText: "需 HUM >= 20" 
                }),
                action: (s, G) => {
                    G.updateStats({ hum: 15 });
                    G.gotoScene('event_hand_demon_kill');
                }
            },
            {
                text: "（保护锖兔和义勇）",
                action: (s, G) => {
                    G.updateStats({ gi_h: 10, sa_h: 10, hp: -15 });
                    G.setResult("你挡在了他们面前！(HP-15)");
                    G.gotoScene('event_hand_demon_kill');
                }
            }
        ]
    });

    // --- 锖兔IF线 ---
    G.addScene('event_hand_demon_kill', {
        type: 'event',
        title: "【IF剧情】斩杀手鬼",
        image: "final_selection.jpg",
        text: (s) => "你们成功压制了手鬼！但在它被阳光照射前，它冲向了锖兔！你必须立刻斩首它！",
        choices: [
            {
                text: "（用鳞泷的短刀斩首）",
                check: (s, G) => ({ 
                    passed: s.weapon === 'short_sword', 
                    reqText: "需[日轮短刀]" 
                }),
                action: (s, G) => {
                    G.updateStats({ str: 10 });
                    G.gotoScene('event_selection_end_sabito_saved');
                }
            },
            {
                text: "（用拳头攻击）",
                check: (s, G) => ({ 
                    passed: G.checkSTR(20), 
                    reqText: "需 STR >= 20" 
                }),
                action: (s, G) => {
                    G.updateStats({ str: 10 });
                    G.gotoScene('event_selection_end_sabito_saved');
                }
            }
        ]
    });

    G.addScene('event_selection_end_sabito_saved', {
        type: 'event',
        title: "【命运改变】锖兔幸存",
        image: "sabito_saved.jpg",
        text: (s) => "你活了下来。义勇...和锖兔也活了下来。锖兔拍了拍你的肩膀：'你的拳头，救了我们。' ...一些人的命运，似乎发生了改变。",
        choices: [
            {
                text: "（精疲力竭地倒下）",
                action: (s, G) => {
                    G.updateStats({ sabito_saved: true, gi_h: 15, sa_h: 15 });
                    G.gotoScene('adjustment_bridge_1', 1); // V12.1: 桥接, +1年
                }
            }
        ]
    });

    // --- 大正5年: 桥接阶段 ---
    G.addScene('adjustment_bridge_1', 
        G.createBridgePhase(
            "大正5年: 新手期",
            "你成为了最低阶的'癸'级队员。你的日轮短刀在选拔中坏了。你有 2 个行动点(AP)来安排你的时间。",
            'year6_gauntlet_quest',
            [
                {
                    text: "（极限训练）'完善破坏杀！'",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -15 })
                },
                {
                    text: "（养伤/冥想）'回忆恋雪的教导。'",
                    cost: 1,
                    action: () => {
                        let recovered = 10 + Math.floor(G.state.hum / 2);
                        G.updateStats({ hp: recovered });
                        G.setResult(`你的伤势恢复了 ${recovered} HP。`, "good");
                    }
                },
                {
                    text: "（趣事·锖兔）'和锖兔对练。'",
                    cost: 1,
                    prereq: (s, G) => s.sabito_saved === true,
                    action: () => G.updateStats({ str: 5, sa_h: 10 })
                },
                {
                    text: "（趣事·汇报）'向主公汇报手鬼的情报。'",
                    cost: 1,
                    action: () => G.updateStats({ hum: 10 })
                }
            ]
        )
    );
    
    // --- 大正6年: 日轮手甲 ---
    G.addScene('year6_gauntlet_quest', {
        type: 'event',
        title: "大正6年: 日轮手甲",
        image: "gauntlet_quest.jpg",
        text: (s) => "你没有武器，任务效率很低。主公特批你前往锻刀村。钢铁塚萤大发雷霆：'哈？！手套？！你是来侮辱刀匠的吗？！'",
        choices: [
            {
                text: "（制服他）'听我说完！我的拳头就是我的刀！'",
                action: (s, G) => {
                    G.updateStats({ str: 5, hp: -5 });
                    G.gotoScene('event_gauntlet_received');
                }
            },
            {
                text: "（躲避）'冷静点！'",
                action: (s, G) => {
                    G.updateStats({ hp: -10 });
                    G.gotoScene('event_gauntlet_received');
                }
            }
        ]
    });

    G.addScene('event_gauntlet_received', {
        type: 'event',
        title: "【装备】获得手甲",
        image: "gauntlet.jpg",
        text: (s) => "村长在你的坚持下，让全村最好的工匠为你打造了【日轮手甲】。它能传导你的呼吸，拳面刻着'恶鬼灭杀'。从此你不再需要短刀。",
        choices: [
            {
                text: "（装备手甲）",
                action: (s, G) => {
                    G.updateStats({ weapon: 'gauntlets', str: 10 });
                    G.gotoScene('adjustment_bridge_2', 1); // V12.1: 桥接, +1年
                }
            }
        ]
    });

    // --- 趣事：义勇 (V12.1: 改为独立场景) ---
    G.addScene('event_giyuu_talk', {
        type: 'event',
        title: "趣事：水柱的饭局",
        image: "gag_giyuu.jpg",
        text: (s) => "你找到了正在独自吃萝卜鲑鱼的富岡义勇。",
        choices: [
            {
                text: "（搭话）'富冈先生，你...是不是被大家讨厌了？'",
                check: (s, G) => ({ passed: G.checkHUM(20), reqText: "需 HUM >= 20" }),
                action: (s, G) => {
                    G.updateStats({ gi_h: 20, hum: 10 });
                    G.setResult("义勇的筷子停住了：'我没有被讨厌。' (义勇好感+20)");
                    G.gotoScene('adjustment_bridge_2'); // 返回桥接
                }
            },
            {
                text: "（沉默地一起吃）",
                action: (s, G) => {
                    G.updateStats({ gi_h: 10, hum: 5 });
                    G.setResult("（义勇好感+10）");
                    G.gotoScene('adjustment_bridge_2'); // 返回桥接
                }
            }
        ]
    });

    // --- 大正6-7年: 桥接阶段 ---
    G.addScene('adjustment_bridge_2', 
        G.createBridgePhase(
            "大正6-7年: 成长",
            "你拿到了新手甲，在晋升'甲'级前进行最后的修行。你有 2 个行动点(AP)。",
            'year7_lower_moon_hunt',
            [
                {
                    text: "（极限训练）'测试新手甲！'",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -15 })
                },
                {
                    text: "（养伤/冥想）",
                    cost: 1,
                    action: () => {
                        let recovered = 10 + Math.floor(G.state.hum / 2);
                        G.updateStats({ hp: recovered });
                        G.setResult(`你的伤势恢复了 ${recovered} HP。`, "good");
                    }
                },
                {
                    text: "（趣事·义勇）'去找富冈义勇。'",
                    cost: 1,
                    oneTime: true,
                    oneTimeFlag: 'visited_giyuu_1',
                    action: () => G.gotoScene('event_giyuu_talk')
                }
            ]
        )
    );

    // --- 大正7年: 讨伐下弦 ---
    G.addScene('year7_lower_moon_hunt', {
        type: 'event',
        title: "大正7年: 晋升任务·讨伐下弦",
        image: "lower_moon.jpg",
        text: (s) => "主公看中了你的潜力。你接到了一个甲级任务：讨伐 **下弦之肆·零余子**。这是你晋升柱的试炼。",
        choices: [
            {
                text: "（速攻！【叁之型·碎式】！）",
                check: (s, G) => ({ passed: G.checkSTR(30), reqText: "需 STR >= 30" }),
                action: (s, G) => {
                    G.updateStats({ str: 10, hp: -20 });
                    G.gotoScene('year8_pillar_promotion', 1);
                }
            },
            {
                text: "（迂回，寻找她的血鬼术核心）",
                check: (s, G) => ({ passed: G.checkHUM(30), reqText: "需 HUM >= 30" }),
                action: (s, G) => {
                    G.updateStats({ str: 10, hp: -10 });
                    G.gotoScene('year8_pillar_promotion', 1);
                }
            }
        ]
    });

    // --- 大正8年: 晋升柱 ---
    G.addScene('year8_pillar_promotion', {
        type: 'event',
        title: "大正8年: 极地柱诞生",
        image: "pillar_promo.jpg",
        text: (s) => "你成功讨伐了下弦，这是柱级的功绩。你被正式任命为'极地柱'。你那独特的【破坏杀·呼吸法】也得到了认可。",
        choices: [
            {
                text: "（接受任命）",
                action: (s, G) => {
                    G.updateStats({ str: 10 }); // 成为柱，STR+10
                    G.gotoScene('year9_pillar_meeting', 1);
                }
            }
        ]
    });

    // --- 大正9年: 柱合会议 ---
    G.addScene('year9_pillar_meeting', {
        type: 'event',
        title: "大正9年: 柱合会议",
        image: "pillar_meeting.jpg",
        text: (s) => "你第一次参加柱合会议。风柱不死川实弥立刻对你发难：'用拳头的也算柱吗？' 他的稀血引来了箱子里的鬼。",
        choices: [
            {
                text: "（与实弥对峙）'试试看！'",
                check: (s, G) => ({ passed: G.checkSTR(60) || G.checkGoodwill('sa_h', 20), reqText: "需 STR >= 60 或 锖兔好感 >= 20" }),
                action: (s, G) => {
                    // V12.1: 区分是和锖兔的好感还是实弥的好感
                    if(s.sabito_saved) {
                         G.updateStats({ str: 10, sn_h: -5, sa_h: 10, hp: -10 });
                         G.setResult("你和实弥打了一架。锖兔帮你拦住了他。");
                    } else {
                         G.updateStats({ str: 10, sn_h: 20, hp: -10 });
                         G.setResult("你和实弥打了一架(HP-10)，不分胜负。(实弥好感+20)");
                    }
                    G.gotoScene('adjustment_bridge_3');
                }
            },
            {
                text: "（挡在箱子前）'主公大人尚未同意！'",
                check: (s, G) => ({ passed: G.checkHUM(40), reqText: "需 HUM >= 40" }),
                action: (s, G) => {
                    G.updateStats({ hum: 10, sn_h: -5 });
                    G.setResult("你阻止了实弥。(实弥好感-5)");
                    G.gotoScene('adjustment_bridge_3');
                }
            },
            {
                text: "（被实弥挑衅，但不敢还手）",
                hideIf: (s) => s.str >= 50, // 如果STR>=50，这个选项隐藏
                action: (s, G) => {
                    G.updateStats({ hum: -10, sn_h: -10 });
                    G.setResult("你忍气吞声，实弥更加鄙视你了。");
                    G.gotoScene('adjustment_bridge_3');
                }
            }
        ]
    });

    // --- 大正9-10年: 桥接阶段 ---
    G.addScene('adjustment_bridge_3', 
        G.createBridgePhase(
            "大正9-10年: 柱",
            "你成为了柱，训练和任务变得更加繁重。你有 2 个行动点(AP)。",
            'year11_mugen_train',
            [
                {
                    text: "（极限训练）'完善破坏杀！'",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -20 })
                },
                {
                    text: "（养伤/冥想）",
                    cost: 1,
                    action: () => {
                        let recovered = 10 + Math.floor(G.state.hum / 2);
                        G.updateStats({ hp: recovered });
                        G.setResult(`你的伤势恢复了 ${recovered} HP。`, "good");
                    }
                },
                {
                    text: "（趣事·蝴蝶忍）'找忍小姐讨教毒理学。'",
                    cost: 1,
                    oneTime: true,
                    oneTimeFlag: 'visited_shinobu_1',
                    action: () => {
                        G.updateStats({ str: 5, k_h: 10 });
                        G.setResult("忍对你的【日轮手甲】很感兴趣，她帮你涂上了紫藤花毒。(STR+5, 忍好感+10)");
                    }
                },
                {
                    text: "（趣事·炎柱）'拜访炼狱宅邸，与杏寿郎切磋。'",
                    cost: 1,
                    oneTime: true,
                    oneTimeFlag: 'visited_rengoku_1',
                    action: () => {
                        G.updateStats({ str: 5, re_h: 15 });
                        G.setResult("杏寿郎：'唔姆！真是酣畅淋漓的战斗！' (STR+5, 炼狱好感+15)");
                    }
                }
            ]
        )
    );

    // --- 大正11年: 无限列车 ---
    G.addScene('year11_mugen_train', {
        type: 'event',
        title: "大正11年: 命运的无限列车",
        image: "mugen_train.jpg",
        text: (s) => "炎柱炼狱杏寿郎即将出发执行无限列车任务，他邀请你同行。",
        choices: [
            {
                text: "（与他同行）'乐意之至，炼狱先生！'",
                action: (s, G) => {
                    G.updateStats({ re_h: 20 });
                    if (s.sabito_saved && G.checkGoodwill('sa_h', 30)) {
                        G.setResult("锖兔也赶来了：'我也去！不能让你们两个专美于前！'");
                    }
                    G.gotoScene('year11_mugen_train_fight', 1); // V12.1: +1年
                }
            },
            {
                text: "（独自执行其他任务）'抱歉，我另有任务。'",
                action: (s, G) => {
                    G.updateStats({ str: 5 });
                    G.gotoScene('event_rengoku_dead', 1); // V12.1: +1年
                }
            }
        ]
    });

    G.addScene('year11_mugen_train_fight', {
        type: 'event',
        title: "【特殊剧情】狛治 VS 猗窝座",
        image: "akaza_fight.jpg",
        text: (s) => "列车倾覆！...一个粉色短发的鬼出现了...他是...**上弦之三，猗窝座**！你的灵魂在颤抖。",
        choices: [
            {
                text: "（主攻）'炎柱/锖兔！掩护平民！这家伙交给我！'",
                check: (s, G) => ({ passed: G.checkSTR(80), reqText: "需 STR >= 80" }),
                action: (s, G) => {
                    G.updateStats({ str: 10, hp: -30, rengoku_saved: true });
                    G.setResult("你发动了【捌之型·灭式】！猗窝座被迫断臂逃走。炼狱幸存！(HP-30)");
                    G.gotoScene('year12_yoshiwara_intro');
                }
            },
            {
                text: "（守护）'炼狱先生！和我并肩作战！'",
                check: (s, G) => ({ passed: G.checkHUM(50), reqText: "需 HUM >= 50" }),
                action: (s, G) => {
                    G.updateStats({ hum: 15, hp: -40, rengoku_saved: true });
                    G.setResult("你为炼狱挡下了致命伤！猗窝座遗憾地逃走了。炼狱幸存！(HP-40)");
                    G.gotoScene('year12_yoshiwara_intro');
                }
            }
        ]
    });

    G.addScene('event_rengoku_dead', {
        type: 'event',
        title: "【剧情分支】炎柱陨落",
        image: "rengoku_dead.jpg",
        text: (s) => "你任务归来，听到了噩耗：炎柱炼狱杏寿郎在无限列车战死。你晚了一步。",
        choices: [
            {
                text: "（...）",
                action: (s, G) => {
                    G.updateStats({ hum: -20, rengoku_saved: false });
                    G.setResult("你感到无比的悔恨。");
                    G.gotoScene('year12_yoshiwara_intro');
                }
            }
        ]
    });
    
    // --- 大正12年: 游郭篇 ---
    G.addScene('year12_yoshiwara_intro', {
        type: 'event',
        title: "大正12年: 游郭篇·潜入",
        image: "yoshiwara.jpg",
        text: (s) => "音柱宇髓天元正在蝶屋抓人...你决定？",
        choices: [
            {
                text: "（与他同行）'我不需要化妆，我直接从正面打进去。'",
                action: (s, G) => {
                    G.updateStats({ str: 5, uz_h: 10 });
                    G.gotoScene('year12_yoshiwara_fight');
                }
            },
            {
                text: "（协助他）'我帮你掩护，你带炭治郎他们去。'",
                action: (s, G) => {
                    G.updateStats({ hum: 10, uz_h: 5 });
                    G.gotoScene('year12_yoshiwara_fight');
                }
            }
        ]
    });

    G.addScene('year12_yoshiwara_fight', {
        type: 'event',
        title: "决战上弦之陆",
        image: "yoshiwara_fight.jpg",
        text: (s) => "你遭遇了堕姬和妓夫太郎。宇髓已经中毒！",
        choices: [
            {
                text: "（主攻妓夫太郎）'音柱！去砍那女孩的脖子！'",
                check: (s, G) => ({ passed: G.checkSTR(90), reqText: "需 STR >= 90" }),
                action: (s, G) => {
                    G.updateStats({ str: 10, hp: -20 });
                    G.gotoScene('adjustment_bridge_4');
                }
            },
            {
                text: "（主攻堕姬）'你太弱了！'",
                action: (s, G) => {
                    G.updateStats({ hp: -40 });
                    G.setResult("你被妓夫太郎的血镰重伤(HP-40)！但最终还是赢了。");
                    G.gotoScene('adjustment_bridge_4');
                }
            }
        ]
    });

    // --- 大正12年: 最终桥接 ---
    G.addScene('adjustment_bridge_4', 
        G.createBridgePhase(
            "大正12年: 决战前夕",
            "斑纹开始在柱之间流传。你必须为最终决战做准备。你有 2 个行动点(AP)。",
            'year12_final_battle_intro',
            [
                {
                    text: "（极限训练）'和岩柱一起推动巨石！'",
                    cost: 1,
                    action: () => G.updateStats({ str: 15, hp: -20 })
                },
                {
                    text: "（养伤/冥想）",
                    cost: 1,
                    action: () => {
                        let recovered = 10 + Math.floor(G.state.hum / 2);
                        G.updateStats({ hp: recovered });
                        G.setResult(`你的伤势恢复了 ${recovered} HP。`, "good");
                    }
                },
                {
                    text: "（趣事·实弥）'和实弥/锖兔进行无休止的对打！'",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -15, sa_h: (s) => s.sabito_saved ? 10 : 0, sn_h: (s) => !s.sabito_saved ? 10 : 0 })
                },
                {
                    text: "（趣事·探望宇髓）",
                    cost: 1,
                    action: () => G.updateStats({ hum: 10, uz_h: 10 })
                },
                {
                    text: "（极限突破）'回忆恋雪。'",
                    cost: 1,
                    prereq: (s, G) => G.checkHUM(80),
                    action: () => G.updateStats({ str: 10, hum: 10 })
                }
            ]
        )
    );

    // --- 大正12年: 最终决战 ---

    G.addScene('year12_final_battle_intro', {
        type: 'event',
        title: "大正12年: 最终决战·无限城",
        image: "final_battle.jpg",
        text: (s) => {
            // 决战前自动回血
            let recovered = Math.floor(s.hum * 0.5); // 人性越高，回血越多
            G.updateStats({ hp: recovered }); // 使用 updateStats 来防止溢出
            
            return `无限城崩塌！最终决战开始了。你（和幸存的柱们）在产屋敷辉利哉的指挥下，准备迎击上弦。(你恢复了 ${recovered} HP，当前 HP: ${s.hp})`;
        },
        choices: [
            {
                text: "（进入排兵布阵）",
                action: (s, G) => {
                    G.gotoScene('year12_deployment_phase');
                }
            }
        ]
    });

    // V12.1: 最终战·排兵布阵 (使用动态 'choices' 函数)
    G.addScene('year12_deployment_phase', {
        type: 'event',
        title: "【迷你游戏】排兵布阵",
        image: "deployment.jpg",
        text: (s) => {
            let txt = "辉利哉：'敌人分开了！你必须做出选择！'<br>你必须亲自选一条路，并为你信任的战友指派另外两条。";
            if (s.deployment.um1) txt += `<br>・上弦之壹: ${s.deployment.um1.join(' & ')}`;
            if (s.deployment.um2) txt += `<br>・上弦之贰: ${s.deployment.um2.join(' & ')}`;
            if (s.deployment.um3) txt += `<br>・上弦之叁: ${s.deployment.um3.join(' & ')}`;
            return txt;
        },
        choices: function(s) {
            let options = [];
            
            // 阶段一: 鼓舞士气 (如果还没做过)
            if (!s.morale_boost) {
                options.push({
                    text: "（鼓舞士气）'我们必将胜利！'",
                    check: (s, G) => ({ passed: G.checkHUM(80), reqText: "需 HUM >= 80" }),
                    action: (s, G) => {
                        G.updateStats({ morale_boost: true });
                        G.setResult("所有柱的战力临时提升！", "good");
                        G.renderScene(); // 刷新场景
                    }
                });
            }

            // 阶段二: 选择你的战场
            if (!s.player_target) {
                options.push({
                    text: "（挑战黑死牟）'最强的人交给我！'",
                    check: (s, G) => ({ passed: G.checkSTR(120), reqText: "需 STR >= 120" }),
                    action: (s, G) => {
                        G.updateStats({ player_target: 'UM1', 'deployment.um1': ['你'] });
                        G.renderScene();
                    }
                });
                options.push({
                    text: "（挑战童磨）'这个家伙...我绝不饶恕！'",
                    check: (s, G) => ({ passed: G.checkGoodwill('k_h', 10), reqText: "需 忍好感 >= 10" }),
                    action: (s, G) => {
                        G.updateStats({ player_target: 'UM2', 'deployment.um2': ['你'] });
                        G.renderScene();
                    }
                });
                options.push({
                    text: "（挑战猗窝座）'这是...我的宿命！'",
                    action: (s, G) => {
                        G.updateStats({ player_target: 'UM3', 'deployment.um3': ['你'] });
                        G.renderScene();
                    }
                });
            }
            
            // 阶段三: 指派盟友 (仅当玩家选定了目标后)
            if (s.player_target) {
                // ... 可以在此添加更复杂的指派逻辑 ...
                // 为了简化, 我们直接进入战斗
                options.push({
                    text: "（确认部署，进入战斗！）",
                    action: (s, G) => {
                         // 自动分配剩余盟友 (简化逻辑)
                        if (!s.deployment.um1) s.deployment.um1 = ['岩柱', '风柱'];
                        if (!s.deployment.um2) s.deployment.um2 = ['蝴蝶', '锖兔'];
                        if (!s.deployment.um3) s.deployment.um3 = ['义勇', '炎柱'];
                        G.gotoScene('event_your_chosen_battle');
                    }
                });
            }

            return options;
        }
    });

    // ... (V11 的后续战斗场景 event_your_chosen_battle, event_battle_results, year12_final_battle_muzan, checkHumanEnding 保持不变) ...
    // (为了完整性，我将它们从 V11 复制过来)

    G.addScene('event_your_chosen_battle', {
        type: 'event',
        title: "【特殊战斗】你的决战",
        image: (s) => `battle_${s.player_target}.jpg`, // e.g., battle_UM1.jpg
        text: (s) => {
            if (s.player_target === 'UM1') return "你面对的是上弦之壹·黑死牟！";
            if (s.player_target === 'UM2') return "你面对的是上弦之贰·童磨！";
            if (s.player_target === 'UM3') return "你面对的是上弦之叁·猗窝座！这是宿命的对决！";
            return "你冲向了战场！";
        },
        choices: [
            {
                text: "（战斗胜利）",
                action: (s, G) => {
                    G.setResult("你艰难地取得了胜利...");
                    G.gotoScene('event_battle_results');
                }
            },
            {
                text: "（战斗失败）",
                hideIf: (s) => G.checkSTR(100), // 如果STR>100，不会失败
                action: (s, G) => {
                    G.updateStats({ hp: -50 }); // 失败则重伤
                    G.setResult("你失败了...身负重伤... (HP-50)", "bad");
                    G.gotoScene('event_battle_results');
                }
            }
        ]
    });

    // V11: 最终战·结算
    G.addScene('event_battle_results', {
        type: 'event',
        title: "战果结算",
        image: "final_battle.jpg",
        text: (s) => "你结束了战斗，辉利哉的乌鸦带来了其他战场的报告...",
        choices: [
            {
                text: "（查看战果，迎战无惨）",
                action: (s, G) => {
                    let difficulty = 500; // 基础难度
                    let results = [];
                    
                    const allies = {
                        um1: { name: "黑死牟", str: 150, allies: ['gy_h', 'sn_h'] },
                        um2: { name: "童磨", str: 100, allies: ['k_h', 'sa_h'] }, // 锖兔
                        um3: { name: "猗窝座", str: 100, allies: ['gi_h', 're_h'] }
                    };

                    // 1. 结算玩家战斗
                    if (G.checkSTR(allies[s.player_target].str)) {
                        difficulty -= allies[s.player_target].str;
                        results.push(`【捷报】你成功击败了 ${allies[s.player_target].name}！`);
                    } else {
                        results.push(`【噩耗】你没能阻止 ${allies[s.player_target].name}！`);
                    }
                    
                    // 2. 结算盟友战斗 (V12.1 简化逻辑)
                    for (let key in allies) {
                        if (key !== s.player_target) {
                            let allySet = allies[key];
                            // 检查好感度是否达标
                            let allyCheck = allySet.allies.every(ally => G.checkGoodwill(ally, 10)); // 简单判定
                            
                            if (allyCheck) {
                                difficulty -= allySet.str;
                                results.push(`【捷报】你的盟友成功击败了 ${allySet.name}！`);
                            } else {
                                results.push(`【噩耗】你的盟友（好感度不足/配置错误）没能阻止 ${allySet.name}！`);
                            }
                        }
                    }
                    
                    G.setResult(results.join("<br>"), "normal");
                    G.updateStats({ final_difficulty_mod: difficulty, hp: 100 }); // 最终战回满
                    
                    G.gotoScene('year12_final_battle_muzan');
                }
            }
        ]
    });

    // V11: 最终战·无惨
    G.addScene('year12_final_battle_muzan', {
        type: 'event',
        title: "决战无惨",
        image: "muzan_fight.jpg",
        text: (s) => `你（和幸存的盟友）终于汇合，站在了无惨面前。你的HP已恢复。
        <br>【当前决战难度: ${s.final_difficulty_mod}】
        <br>【你的总战力: ${s.str}】`,
        choices: [
            {
                text: "💥 '【破坏杀·奥义】！' (燃烧生命，最终一击！)",
                action: (s, G) => {
                    G.checkHumanEnding(); // 调用结局判定
                }
            }
        ]
    });

    // V11: 结局判定函数
    window.Game.checkHumanEnding = function() {
        const s = G.state;
        const difficulty = s.final_difficulty_mod;
        
        let allyScore = s.gi_h + s.sa_h + s.re_h + s.gy_h + s.k_h + s.uz_h + s.sn_h;
        if (s.sabito_saved) allyScore += 20;
        if (s.rengoku_saved) allyScore += 20;
        if (s.morale_boost) allyScore += 50;

        if (G.checkSTR(140)) {
            G.showEnding('h_true_god'); // 武神结局
        } else if (G.checkSTR(100) && (s.str + allyScore) > difficulty) {
            G.showEnding('h_true_bonds'); // 羁绊结局
        } else if (G.checkSTR(80) && s.str > difficulty) {
            G.showEnding('h_hero'); // 英雄结局
        } else {
            G.showEnding('h_bad'); // 败北
        }
    };

})();