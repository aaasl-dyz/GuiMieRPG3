// data_demon.js - 上弦之参的修罗道 (Year 4-10)

(function() {
    const G = window.Game;

    // --- Year 4: 堕落 ---
    G.addScene('year4_demon_start', {
        title: "大正 4 年：记忆的丧失",
        text: "你接受了无惨的血，成为了<span class='key-plot-point'>猗窝座</span>。你忘记了恋雪，只记得要“变强”。",
        choices: [
            { text: "疯狂捕食，提升力量 (战力+, 鬼性+)", action: () => { G.updateStats({str:15, dem:15}); G.gotoScene('year5_lower_moons'); } },
            { text: "拒绝吃女性，引起无惨不满 (人性残留)", action: () => { G.updateStats({hum:5, dem:-5}); G.gotoScene('year5_lower_moons'); } }
        ]
    });

    // --- Year 5: 肃清下弦 ---
    G.addScene('year5_lower_moons', {
        title: "大正 5 年：换位血战",
        text: "无惨对下弦失望，命令你进行肃清或测试。你遇到了当时还是下弦的累。",
        choices: [
            { text: "一拳轰碎，毫不留情 (鬼性+)", action: () => { G.updateStats({dem:10}); G.gotoScene('year6_meet_douma'); } },
            { text: "指点他的武艺 (人性微存)", action: () => { G.updateStats({hum:2}); G.gotoScene('year6_meet_douma'); } }
        ]
    });

    // --- Year 6: 宿敌童磨 ---
    G.addScene('year6_meet_douma', {
        title: "大正 6 年：极乐教主",
        text: "上弦之贰<span class='key-plot-point'>童磨</span>搭着你的肩膀：“猗窝座阁下，要不要一起去极乐教玩玩？”",
        choices: [
            { text: "一拳打爆他的头 (战力+, 鬼性+)", action: () => { G.updateStats({str:10, dem:5}); G.setResult("童磨再生后笑着说：'好热情啊！'"); G.gotoScene('year7_mission'); } },
            { text: "冷冷地走开 (无视)", action: () => { G.gotoScene('year7_mission'); } }
        ]
    });

    // --- Year 7: 寻找彼岸花 (调整年) ---
    G.addScene('year7_mission', G.createAdjustment(
        "大正 7 年：无惨的命令",
        "无惨命令你寻找青色彼岸花。这让你感到烦躁。",
        'year8_kill_pillar', 1,
        [
            { label: "挑战黑死牟 (战力大增，鬼性+)", cost: 5, effect: () => G.updateStats({str:20, dem:10}) },
            { label: "潜入人类城镇寻找线索 (人性微复)", cost: 3, effect: () => G.updateStats({hum:5}) },
            { label: "闭关修炼术式展开 (战力+10)", cost: 3, effect: () => G.updateStats({str:10}) }
        ]
    ));

    // --- Year 8: 猎杀柱 (无限列车前) ---
    G.addScene('year8_kill_pillar', {
        title: "大正 8 年：猎杀任务",
        text: "你遭遇了一位前代水柱。他的水之呼吸流转不息。",
        choices: [
            { text: "欣赏强者的技艺，劝他变成鬼", action: () => { G.updateStats({dem:5}); G.gotoScene('year9_train_prep'); } },
            { text: "厌恶弱者，速战速决", action: () => { G.updateStats({str:10, dem:10}); G.gotoScene('year9_train_prep'); } }
        ]
    });

    // --- Year 9: 无限列车篇 (关键事件，非结局) ---
    G.addScene('year9_train_prep', G.createAdjustment(
        "大正 9 年：梦魇前奏",
        "下弦一魇梦正在筹备计划。你预感到将会遇到真正的强者（炼狱）。你拥有 ${G.state.tp} 点体力。",
        'year9_mugen_train', 0, // 关键：这一步不增加年份，先进入列车事件
        [
            { label: "在此处等待炼狱杏寿郎 (战力+)", cost: 5, effect: () => G.updateStats({str:15}) },
            { label: "回忆过去的记忆碎片 (找回人性关键)", cost: 5, effect: () => G.updateStats({hum:20}) }
        ]
    ));

    // 核心修改点：无限列车事件，结束后跳到 Year 10 决战准备
    G.addScene('year9_mugen_train', {
        title: "大正 9 年：无限列车",
        text: "你与<span class='key-plot-point'>炎柱·炼狱杏寿郎</span>激战正酣。太阳即将升起。你被他的精神力震撼了。",
        choices: [
            { 
                text: "竭尽全力杀死炼狱，逃离现场 (鬼性++, 战力+)", 
                action: () => { 
                    G.updateStats({dem:20, str:15});
                    G.setResult("你获得了短暂的满足，但空虚感更甚。");
                    G.gotoScene('year10_final_prep', 1); 
                } 
            },
            { 
                text: "被他的斗气折服，主动逃跑 (人性++, 记忆碎片)", 
                action: () => { 
                    G.updateStats({hum:25}); 
                    G.setResult("你记起了一个关于道场的可怕碎片，让你感到极度愤怒和悲伤。");
                    G.gotoScene('year10_final_prep', 1);
                } 
            }
        ]
    });

    // --- Year 10: 最终决战前调整 ---
    G.addScene('year10_final_prep', G.createAdjustment(
        "大正 10 年：无限城入口",
        "无惨召集了所有上弦进入无限城。这是你最后的调整机会。你拥有 ${G.state.tp} 点体力。",
        'year10_demon_final_battle', 0, // 最终决战不加年份
        [
            { label: "挑战黑死牟 (战力+30, 鬼性+)", cost: 5, effect: () => G.updateStats({str:30, dem:10}) },
            { label: "与童磨发生最终冲突 (人性/鬼性大抉择)", cost: 5, effect: () => {
                const choice = confirm("是否选择：A. 杀了童磨 (人性+，鬼性-)? B. 无视他 (鬼性+)?");
                if (choice) G.updateStats({hum:30, dem:-20});
                else G.updateStats({dem:20});
            }},
        ]
    ));

    // --- Year 10: 最终决战 (结局判定) ---
    G.addScene('year10_demon_final_battle', {
        title: "大正 10 年：无限城决战",
        text: "你面前是鬼杀队的最强战力。这是你决定自己宿命的最后机会。",
        image: "Placeholder: 无限城最终决战",
        choices: [
            { text: "【结局判定】全力释放术式，屠杀所有剑士", action: () => checkDemonEnding(true) },
            { text: "【结局判定】回忆起恋雪和师傅，寻求自我毁灭", action: () => checkDemonEnding(false) }
        ]
    });

    // 结局判定函数不变
    function checkDemonEnding(killIntent) {
        const s = G.state;
        // 救赎：必须选择自我毁灭（即不是killIntent）且有人性
        if (!killIntent && s.hum > 50) G.showEnding('d_redemption'); 
        // 鬼王：如果选择屠杀，或人性不足以支撑救赎，则检查鬼性
        else if (s.dem > 150) G.showEnding('d_king'); 
        // 奴隶：其他情况
        else G.showEnding('d_slave'); 
    }
})();