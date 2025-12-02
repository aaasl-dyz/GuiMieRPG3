// data_demon.js - V12.1 修复版

(function() {
    const G = window.Game;

    // --- 大正3年: 适应期 ---
    G.addScene('year3_demon_adaptation', {
        type: 'event',
        title: "大正3年: 适应期",
        image: "demon_adapt.jpg",
        text: (s) => "你成为了鬼。饥饿感在吞噬你。你遇到了一个迷路的村民。",
        choices: [
            {
                text: "（吃掉他）",
                action: (s, G) => {
                    G.updateStats({ str: 10, dem: 10, hum: -10 });
                    G.gotoScene('adjustment_bridge_0_demon');
                }
            },
            {
                text: "（强忍饥饿，放他走）",
                action: (s, G) => {
                    G.updateStats({ hum: 10, hp: -20 });
                    G.setResult("你感到了强烈的虚弱。(HP-20)", "bad");
                    G.gotoScene('adjustment_bridge_0_demon');
                }
            }
        ]
    });

    G.addScene('year3_demon_forced_adaptation', {
        type: 'event',
        title: "大正3年: 屈辱的适应期",
        image: "demon_adapt.jpg",
        text: (s) => "你被无惨强行变成了鬼，力量微弱。你必须进食。",
        choices: [
            {
                text: "（为了活下去，吃掉他）",
                action: (s, G) => {
                    G.updateStats({ str: 10, dem: 10, hum: -10 });
                    G.gotoScene('adjustment_bridge_0_demon');
                }
            }
        ]
    });

    // --- 大正3-4年: 桥接阶段 ---
    G.addScene('adjustment_bridge_0_demon', 
        G.createBridgePhase(
            "大正3-4年: 新生",
            "你适应了鬼的身体。你有 2 个行动点(AP)。",
            'year4_demon_promotion',
            [
                {
                    text: "（极限猎杀）",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -10, dem: 5 })
                },
                {
                    text: "（再生/冥想）'回忆...烟火？'",
                    cost: 1,
                    action: () => {
                        let recovered = 10 + Math.floor(G.state.dem / 2); // DEM 越高, 回血越多
                        G.updateStats({ hp: recovered, hum: 5 });
                        G.setResult(`你的伤势恢复了 ${recovered} HP。你想起了一些模糊的画面。`, "good");
                    }
                },
                {
                    text: "（执行任务）'寻找青色彼岸花。'",
                    cost: 1,
                    action: () => G.updateStats({ dem: 10 })
                }
            ]
        )
    );

    // --- 大正4年: 晋升下弦 ---
    G.addScene('year4_demon_promotion', {
        type: 'event',
        title: "大正4年: 晋升下弦",
        image: "lower_moon.jpg",
        text: (s) => "你通过猎杀证明了自己。无惨命令你去讨伐现任的下弦之陆，取代他。",
        choices: [
            {
                text: "（轻松取胜）",
                check: (s, G) => ({ passed: G.checkSTR(20), reqText: "需 STR >= 20" }),
                action: (s, G) => {
                    G.updateStats({ str: 10, dem: 10 });
                    G.gotoScene('year5_lower_moon_meeting', 1);
                }
            }
        ]
    });

    // --- 大正5年: 下弦解体 ---
    G.addScene('year5_lower_moon_meeting', {
        type: 'event',
        title: "大正5年: 下弦解体",
        image: "muzan_meeting.jpg",
        text: (s) => "无惨召集了所有下弦。他很愤怒。'你们太弱了。' 他开始屠杀其他下弦。你该怎么办？",
        choices: [
            {
                text: "（保持绝对的沉默和服从）",
                action: (s, G) => {
                    G.setResult("无惨注意到了你，但你的杀意让他很满意。");
                    G.gotoScene('adjustment_bridge_1_demon');
                }
            },
            {
                text: "（试图为下弦求情）",
                action: (s, G) => {
                    G.updateStats({ hp: -50 });
                    G.setResult("无惨重创了你。'你没资格说话。' (HP-50)", "bad");
                    G.gotoScene('adjustment_bridge_1_demon');
                }
            },
            {
                text: "（试图逃跑）",
                action: (s, G) => G.showEnding('e_early_death')
            }
        ]
    });

    // --- 大正5-6年: 桥接阶段 ---
    G.addScene('adjustment_bridge_1_demon',
        G.createBridgePhase(
            "大正5-6年: 下弦",
            "作为唯一的下弦幸存者（或新任下弦），你手握10点体力。你有 2 个行动点(AP)。",
            'year7_upper_moon_challenge',
            [
                {
                    text: "（极限猎杀）'猎杀强大的剑士！'",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -15, dem: 5 })
                },
                {
                    text: "（再生/冥想）",
                    cost: 1,
                    action: () => {
                        let recovered = 10 + Math.floor(G.state.dem / 2);
                        G.updateStats({ hp: recovered, hum: 5 });
                        G.setResult(`再生完毕 (HP+${recovered})。`, "good");
                    }
                },
                {
                    text: "（记忆碎片）'那晚的...烟火...'",
                    cost: 1,
                    action: () => G.updateStats({ hum: 15 })
                }
            ]
        )
    );

    // --- 大正7年: 挑战上弦 ---
    G.addScene('year7_upper_moon_challenge', {
        type: 'event',
        title: "大正7年: 挑战上弦",
        image: "yoshiwara_fight.jpg",
        text: (s) => "你变得足够强了。无惨允许你发起'换位血战'，挑战 **上弦之陆·堕姬与妓夫太郎**。",
        choices: [
            {
                text: "（强攻妓夫太郎）",
                check: (s, G) => ({ passed: G.checkSTR(40), reqText: "需 STR >= 40" }),
                action: (s, G) => {
                    G.updateStats({ str: 10, hp: -20 });
                    G.gotoScene('year8_upper_moon_promotion', 1);
                }
            },
            {
                text: "（先杀堕姬，分析战术）",
                check: (s, G) => ({ passed: G.checkSTR(30), reqText: "需 STR >= 30" }),
                action: (s, G) => {
                    G.updateStats({ str: 10, hp: -10 });
                    G.gotoScene('year8_upper_moon_promotion', 1);
                }
            }
        ]
    });

    // --- 大正8年: 成为上弦·叁 ---
    G.addScene('year8_upper_moon_promotion', {
        type: 'event',
        title: "大正8年: 新任上弦·叁",
        image: "akaza_promo.jpg",
        text: (s) => "你赢了。无惨将你提拔为 **上弦之叁**。你舍弃了狛治之名，成为了'猗窝座'。你关于恋雪和师傅的记忆被彻底封印了。",
        choices: [
            {
                text: "（接受力量）",
                action: (s, G) => {
                    G.updateStats({ str: 30, dem: 30, hum: -s.hum, memory_lost: true }); // 人性清零
                    G.setResult("你的人性清零，记忆被封印。");
                    G.gotoScene('year9_douma', 1);
                }
            }
        ]
    });

    // --- 大正9年: 极乐教主 ---
    G.addScene('year9_douma', {
        type: 'event',
        title: "大正9年: 极乐教主",
        image: "gag_douma.jpg",
        text: (s) => "你第一次参加上弦会议。上弦之贰·童磨搂着你的肩膀，'猗窝座阁下，要不要尝尝这个？'",
        choices: [
            {
                text: "👊 '拿开你的脏手！' (轰爆他的头)",
                action: (s, G) => {
                    G.updateStats({ str: 10, dem: 10, hp: -5 });
                    G.gotoScene('adjustment_bridge_2_demon');
                }
            },
            {
                text: "冷漠地推开他。'我只吃强者，不吃弱者。'",
                action: (s, G) => {
                    G.updateStats({ dem: 5, hum: 10 }); // 触发了“不吃女人”的隐藏人性
                    G.gotoScene('adjustment_bridge_2_demon');
                }
            }
        ]
    });
    
    // --- 大正9-10年: 桥接阶段 ---
    G.addScene('adjustment_bridge_2_demon',
        G.createBridgePhase(
            "大正9-10年: 上弦",
            "作为上弦之三，你拥有大量时间。你有 2 个行动点(AP)。",
            'year11_mugen_train_demon',
            [
                {
                    text: "（极限猎杀）'猎杀柱。'",
                    cost: 1,
                    action: () => G.updateStats({ str: 15, hp: -20, dem: 5 })
                },
                {
                    text: "（再生）",
                    cost: 1,
                    action: () => {
                        let recovered = 10 + Math.floor(G.state.dem / 2);
                        G.updateStats({ hp: recovered });
                        G.setResult(`再生完毕 (HP+${recovered})。`, "good");
                    }
                },
                {
                    text: "（挑战黑死牟）",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -30 })
                },
                {
                    text: "（挑战童磨）",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -10 })
                }
            ]
        )
    );

    // --- 大正11年: 无限列车 ---
    G.addScene('year11_mugen_train_demon', {
        type: 'event',
        title: "大正11年: 无限列车",
        image: "mugen_train.jpg",
        text: (s) => "无惨命令你去处理一辆列车。你遭遇了鬼杀队的炎柱。",
        choices: [
            {
                text: "（全力以赴，杀死炎柱）",
                hideIf: (s) => s.hum >= 20, // 人性高了此选项消失
                action: (s, G) => {
                    G.updateStats({ str: 10, dem: 10 });
                    G.gotoScene('year12_douma_fight', 1);
                }
            },
            {
                text: "（因回忆分神，放跑了他）",
                check: (s, G) => ({ passed: G.checkHUM(20), reqText: "需 HUM >= 20" }),
                hideIf: (s) => s.hum < 20, // 只有人性高了才触发
                action: (s, G) => {
                    G.updateStats({ hum: 20, dem: -10 });
                    G.setResult("无惨对你很失望。'恋雪'的记忆变得清晰了...");
                    G.gotoScene('year12_douma_fight', 1);
                }
            }
        ]
    });

    // --- 大正12年: 肃清门户 ---
    G.addScene('year12_douma_fight', {
        type: 'event',
        title: "大正12年: 肃清门户",
        image: "douma_fight.jpg",
        text: (s) => "你对童磨的厌恶达到了顶点。决战前夕，你决定先解决他。",
        choices: [
            {
                text: "💥 '你必须死！' (展开术式，死斗!)",
                check: (s, G) => ({ passed: G.checkSTR(100), reqText: "需 STR >= 100" }),
                action: (s, G) => {
                    G.updateStats({ str: 20, dem: 20, hp: -10, tongue_killed: true });
                    G.setResult("你吸收了童磨！", "good");
                    G.gotoScene('adjustment_bridge_3_demon');
                }
            },
            {
                text: "💢 '现在没空理你。' (忍气吞声)",
                action: (s, G) => {
                    G.updateStats({ hum: -10 });
                    G.gotoScene('adjustment_bridge_3_demon');
                }
            }
        ]
    });

    // --- 大正12年: 最终桥接 ---
    G.addScene('adjustment_bridge_3_demon',
        G.createBridgePhase(
            "大正12年: 决战前夕",
            "无限城即将启动。你手握 2 个行动点(AP)。",
            'year12_final_battle_demon',
            [
                {
                    text: "（极限猎杀）'猎杀最后的剑士！'",
                    cost: 1,
                    action: () => G.updateStats({ str: 10, hp: -10 })
                },
                {
                    text: "（再生/冥想）'回忆...恋雪...'",
                    cost: 1,
                    action: () => {
                        let recovered = 10 + Math.floor(G.state.dem / 2);
                        G.updateStats({ hp: recovered, hum: 20 });
                        G.setResult(`再生完毕 (HP+${recovered})。你...想起来了...`, "good");
                    }
                }
            ]
        )
    );

    // --- 大正12年: 最终决战 ---
    G.addScene('year12_final_battle_demon', {
        type: 'event',
        title: "最终决战",
        image: "final_battle.jpg",
        text: (s) => "鬼杀队杀入无限城。你遭遇了炭治郎和富冈义勇。你体内的狛治记忆正在苏醒...",
        choices: [
            {
                text: "（执行命令）'我是上弦之三！' (杀死他们)",
                hideIf: (s) => s.hum >= 40,
                action: (s, G) => {
                    G.updateStats({ str: 10, hum: -s.hum });
                    G.setResult("你压制了人性，击败了他们。");
                    G.gotoScene('event_demon_muzan_fight');
                }
            },
            {
                text: "（回忆起恋雪）'...够了。' (自我了断)",
                check: (s, G) => ({ passed: G.checkHUM(40), reqText: "需 HUM >= 40" }),
                hideIf: (s) => s.hum < 40,
                action: (s, G) => G.showEnding('d_redemption')
            }
        ]
    });

    // --- 鬼线结局分支 ---
    G.addScene('event_demon_muzan_fight', {
        type: 'event',
        title: "决战无惨",
        image: "muzan_fight.jpg",
        text: (s) => "你击败了最后的柱，来到无惨面前。他正在被重创！'猗窝座！过来！成为我的一部分！'",
        choices: [
            {
                text: "（服从命令）",
                action: (s, G) => G.showEnding('d_slave')
            },
            {
                text: "（反抗）'我只服从强者！而你马上就要死了！'",
                check: (s, G) => ({ passed: G.checkSTR(120), reqText: "需 STR >= 120" }),
                action: (s, G) => {
                    G.setResult("你重创了无惨，但也暴露在了阳光下！", "bad");
                    G.gotoScene('event_demon_sunrise');
                }
            }
        ]
    });

    G.addScene('event_demon_sunrise', {
        type: 'event',
        title: "黎明",
        image: "sunrise.jpg",
        text: (s) => "无惨死了。但太阳也升起来了。你正在燃烧！",
        choices: [
            {
                text: "（接受毁灭）",
                action: (s, G) => {
                    // 检查极密结局
                    if (G.checkSTR(140) && s.tongue_killed) {
                        G.showEnding('d_king_true');
                    } else {
                        G.showEnding('d_bad_sun');
                    }
                }
            }
        ]
    });

})();