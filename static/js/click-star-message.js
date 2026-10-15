
/* PureAutumn — Multicolor Star Burst + Floating Message */
(() => {
    if (window.__paClickStarMessageLoaded) return;
    window.__paClickStarMessageLoaded = true;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // =================================================
    // 自定义文字：每次点击随机选择一句
    // =================================================
    const messages = [
"不开 long long 见祖宗",
"多测不清空，爆零两行泪",
"本地过样例，提交见祖宗",
"样例全过，评测全 WA",
"骗分过样例，暴力出奇迹",
"打表进省队",
"十年 OI 一场空",
"愿天堂没有 WA",
"评测机保佑",
"AC 是暂时的，WA 是永恒的",
"只要不评测，代码就是对的",
"这评测机是 1930 年的吗",
"你代码跑得比我心跳还快",
"代码五分钟，调试两小时",
"写题十分钟，调题一整天",
"这题我会，就是写不出来",
"这题我不会，但我能骗分",
"莫慌，先打个暴力",
"小数据手玩，大数据信仰",
"卡常：关同步，换 \\n",
"吸氧 O2 之后，代码起飞",
"O(能过) 就是最好的复杂度",
"这代码，O(玄学)",
"数组开小，快乐不少",
"数组开大，MLE 到家",
"递归不写边界，栈溢出教你做人",
"SPFA 死了，但没完全死",
"线段树合并，码量惊人",
"网络流建图，全靠想象力",
"DP 想不出，先写个爆搜",
"爆搜剪枝，骗到省一",
"模拟退火，参数调好，AC 不少",
"分块大法好，暴力出奇迹",
"莫队算法，优雅的暴力",
"后缀自动机，自动 WA",
"AC 自动机，自动 WA",
"KMP 的 next 是前后缀，不是子串",
"Dijkstra 不能有负权边，因为走了就回不来了",
"SPFA 的复杂度是 O(KE)，K 是玄学",
"线段树懒标记：先乘后加，别搞反",
"树状数组 lowbit，写错就 TLE",
"并查集路径压缩，按秩合并不能少",
"主席树可持久化，空间 O(n log n)",
"树套树空间 O(n log^2 n)，开小就 RE",
"LCT 的 splay 要维护翻转标记",
"莫队排序：左端点分块，右端点奇偶优化",
"分块块长取 sqrt(n)",
"根号分治：大于 sqrt 暴力，小于 sqrt 预处理",
"CDQ 分治：先递归左边，再处理贡献，再递归右边",
"点分治：每次找重心，深度 O(log n)",
"整体二分：询问和修改一起二分",
"模拟退火：温度高接受劣解，温度低趋于局部最优",
"爬山算法：容易陷入局部最优",
"线性基：插入从高位到低位，异或消元",
"高斯消元：列主元，避免精度误差",
"矩阵快速幂：矩阵乘法不满足交换律",
"FFT 补零到 2 的幂",
"NTT 模数要满足 2^k * c + 1",
"生成函数：普通型组合，指数型排列",
"莫比乌斯反演：mu 是积性函数",
"杜教筛：构造 g 和 h",
"min_25 筛：O(n^{3/4}/log n)",
"卢卡斯定理：C(n,m) mod p",
"卡特兰数：C(2n,n)/(n+1)",
"斯特林数：第一类带符号，第二类不带",
"拉格朗日插值：n+1 个点确定 n 次多项式",
"计算几何：叉积判断方向，点积判断角度",
"凸包：Andrew 算法，上下凸壳",
"旋转卡壳：对踵点求直径",
"半平面交：S&I 算法，双端队列",
"最小圆覆盖：随机增量，期望 O(n)",
"扫描线：按 x 排序，线段树维护 y",
"离散化：排序去重，二分查找",
"前缀和：O(1) 查询，修改 O(n)",
"差分：O(1) 修改，查询 O(n)",
"双指针：窗口左右单调移动",
"单调队列：滑动窗口最值",
"单调栈：下一个更大元素",
"ST 表：倍增预处理，O(1) 查询 RMQ",
"笛卡尔树：单调栈建树，中序是原序列",
"拓扑排序：入度为 0 入队",
"Tarjan：dfn 和 low，强连通",
"割点：low[v] >= dfn[u]",
"桥：low[v] > dfn[u]",
"2-SAT：拆点跑 Tarjan",
"欧拉回路：所有点度数为偶数",
"哈密顿路径：NP 难，状压 DP",
"TSP：状压 DP，O(n^2 2^n)",
"最小生成树：Kruskal 按边权排序",
"Prim：每次选最近的点",
"次小生成树：枚举非树边替换",
"最小树形图：朱刘算法",
"斯坦纳树：状压 DP + 最短路",
"虚树：按 dfn 排序，栈建树",
"圆方树：点双缩方点",
"仙人掌：每边最多一个环",
"基环树：找环，断环，树上处理",
"树上差分：DFS 求和",
"LCA：倍增法，O(log n)",
"Kruskal 重构树：LCA 是瓶颈边",
"最小瓶颈路：MST 上最大边最小",
"线性规划：单纯形法",
"博弈论：SG 函数，Nim 异或",
"Nim：异或和为 0 先手必败",
"威佐夫：黄金分割",
"概率期望：期望线性性",
"随机化：多跑几次",
"模拟退火：降温系数 0.99",
"遗传算法：交叉变异",
"骗分：输出样例，随机数，-1",
"暴力：枚举所有情况，剪枝",
"打表：本地跑出答案，提交输出",
"模拟：按题意一步步来",
"贪心：局部最优，交换论证",
"二分：答案单调，check 函数",
"三分：单峰函数，取两点比较",
"分治：分而治之，合并答案",
"倍增：二进制拆分",
"构造：找规律，猜结论",
"交互：二分询问，注意次数",
"提交答案：本地跑，提交文件",
"喵喵喵，qwq",
"咕咕咕，明天再调",
"开摆，但是 rp++",
"卷王，别卷了",
"内卷，卷不动了",
"摸鱼，摸出 WA",
"划水，划出 TLE",
"爆零，但是 rp++",
"自闭，但是 AC",
"退役，但是 OI",
"AFO，文化课加油",
"文化课加油，OI 永远的家",
"高考加油，强基计划",
"保送，但是 OI",
"省一稳了，省选炸了",
"省队，但是 Au",
"Au 在远方，AC 在路上",
"打铁，但是 rp++",
"AK 全场，但是 WA",
"AC 了，但是没完全 AC",
"WA 了，但是没完全 WA",
"TLE 了，但是没完全 TLE",
"MLE 了，但是没完全 MLE",
"RE 了，但是没完全 RE",
"CE 了，但是没完全 CE",
"UKE 了，但是没完全 UKE",
"评测机保佑，不要 UKE",
"数据太水，暴力过了",
"数据太强，正解挂了",
"样例太弱，提交 WA",
"题面太长，不想看",
"题解太短，看不懂",
"博客太乱，不想写",
"洛谷评测机，保佑我 AC",
"Codeforces，上分如喝水",
"AtCoder，ABC 全过",
"牛客，多校集训",
"VJudge，同步赛",
"OIer，萌新，大佬，巨佬，神犇，蒟蒻",
"弱省，强省，省选",
"NOIP，NOI，WC，APIO，IOI",
"蓝桥杯，天梯赛，ICPC，CCPC，PAT，LeetCode",
"刷题，千题斩，对拍，造数据，调试",
"printf，cout，cin，scanf",
"long long，int，unsigned，register，inline",
"O2，O3，卡常，吸氧",
"开摆，咕咕咕，喵喵，qwq"
    ];

    // 星星独立随机颜色：高饱和、清透、明亮
    const starColors = [
        "#ff367f",
        "#ff9f1c",
        "#ffd12f",
        "#a855f7",
        "#238bff",
        "#00bfa5",
        "#ff49c8",
        "#35b8ff",
        "#ff5b55",
        "#7c5cff"
    ];

    // 文字有自己独立的颜色
    const textColors = [
        "#ec4899",
        "#8b5cf6",
        "#287fe8",
        "#089b87",
        "#e58a18",
        "#da3e9b",
        "#526de0"
    ];

    const starShapes = ["★", "✦", "✧", "✶", "✷"];

    const rand = (min, max) =>
        min + Math.random() * (max - min);

    const pick = list =>
        list[Math.floor(Math.random() * list.length)];

    // 注入动画样式
    if (!document.getElementById("pa-click-star-message-style")) {
        const style = document.createElement("style");
        style.id = "pa-click-star-message-style";

        style.textContent = `
            .pa-star-particle,
            .pa-star-floating-text {
                position: fixed;
                left: var(--pa-x);
                top: var(--pa-y);
                pointer-events: none;
                user-select: none;
                white-space: nowrap;
                z-index: 100001;
                transform: translate(-50%, -50%);
                will-change: transform, opacity;

                /* 位移和透明度分别连续变化，没有中途跳变 */
                animation-name: pa-star-move, pa-star-fade;
                animation-duration:
                    var(--pa-duration),
                    var(--pa-duration);
                animation-timing-function:
                    cubic-bezier(.18, .55, .30, 1),
                    linear;
                animation-fill-mode: forwards;
            }

            .pa-star-particle {
                color: var(--pa-color);
                font-size: var(--pa-size);
                line-height: 1;
                font-weight: 700;
                text-shadow:
                    0 0 3px rgba(255, 255, 255, .95),
                    0 0 7px var(--pa-glow),
                    0 0 13px var(--pa-glow);
            }

            .pa-star-floating-text {
                color: var(--pa-color);
                font-family: inherit;
                font-weight: 600;
                font-size: 11px;
                line-height: 1.5;
                letter-spacing: .3px;

                text-shadow:
                    0 1px 2px rgba(255, 255, 255, .85),
                    0 0 6px var(--pa-glow);

                animation-delay: 0ms, 0ms;
            }

            @keyframes pa-star-move {
                from {
                    transform:
                        translate(-50%, -50%)
                        translate3d(0, 0, 0)
                        rotate(0deg)
                        scale(.68);
                }

                to {
                    transform:
                        translate(-50%, -50%)
                        translate3d(var(--pa-dx), var(--pa-dy), 0)
                        rotate(var(--pa-rotation))
                        scale(var(--pa-end-scale));
                }
            }

            @keyframes pa-star-fade {
                from { opacity: .96; }
                to   { opacity: 0; }
            }

            @media (prefers-reduced-motion: reduce) {
                .pa-star-particle,
                .pa-star-floating-text {
                    display: none !important;
                    animation: none !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    let lastTime = 0;
    const MAX_PARTICLES = 100;
    const MAX_TEXTS = 8;

    function addEffectElement(element, maxCount, selector) {
        document.body.appendChild(element);

        const elements = document.querySelectorAll(selector);

        if (elements.length > maxCount) {
            for (let i = 0; i < elements.length - maxCount; i++) {
                elements[i].remove();
            }
        }

        element.addEventListener("animationend", event => {
            // 两个动画都结束才删除元素
            if (event.animationName === "pa-star-fade") {
                element.remove();
            }
        });

        // 防止切换标签或动画事件丢失导致元素残留
        const duration = parseFloat(
            element.style.getPropertyValue("--pa-duration")
        ) || 1400;

        setTimeout(() => element.remove(), duration + 200);
    }

    function createStar(x, y) {
        const element = document.createElement("span");
        element.className = "pa-star-particle";
        element.setAttribute("aria-hidden", "true");

        const color = pick(starColors);

        element.textContent = pick(starShapes);

        element.style.setProperty("--pa-x", `${x + rand(-4, 4)}px`);
        element.style.setProperty("--pa-y", `${y + rand(-4, 4)}px`);
        element.style.setProperty("--pa-color", color);

        // 发光颜色独立于形状，增强不同颜色星星的辨识度
        element.style.setProperty("--pa-glow", color);

        // 所有星星都朝左上，只在角度与距离上有所区别
        element.style.setProperty("--pa-dx", `${rand(32, 100)}px`);
        element.style.setProperty("--pa-dy", `${-rand(38, 108)}px`);

        element.style.setProperty("--pa-size", `${rand(7, 12)}px`);
        element.style.setProperty("--pa-duration", `${rand(1200, 1850)}ms`);
        element.style.setProperty("--pa-rotation", `${rand(-100, 100)}deg`);
        element.style.setProperty("--pa-end-scale", `${rand(.5, .9)}`);

        addEffectElement(
            element,
            MAX_PARTICLES,
            ".pa-star-particle"
        );
    }

    function createMessage(x, y) {
        const element = document.createElement("span");
        element.className = "pa-star-floating-text";
        element.setAttribute("aria-hidden", "true");

        // 文字独立选择内容和颜色，不与星星绑定
        element.textContent = pick(messages);

        const color = pick(textColors);

        element.style.setProperty("--pa-x", `${x + rand(-12, 5)}px`);
        element.style.setProperty("--pa-y", `${y + rand(-8, 8)}px`);
        element.style.setProperty("--pa-color", color);
        element.style.setProperty("--pa-glow", color);

        // 文字与星星的运动方向相同，但轨迹独立
        element.style.setProperty("--pa-dx", `${rand(75, 125)}px`);
        element.style.setProperty("--pa-dy", `${-rand(62, 100)}px`);
        element.style.setProperty("--pa-duration", `${rand(1500, 1900)}ms`);
        element.style.setProperty("--pa-rotation", `${rand(-4, 2)}deg`);
        element.style.setProperty("--pa-end-scale", ".92");

        addEffectElement(
            element,
            MAX_TEXTS,
            ".pa-star-floating-text"
        );
    }

    function onPointerDown(event) {
        if (event.button !== 0 || event.isPrimary === false) return;

        // 避免点击输入框时触发装饰
        if (
            event.target instanceof Element &&
            event.target.closest(
                "input, textarea, select, [contenteditable='true']"
            )
        ) {
            return;
        }

        const now = performance.now();
        if (now - lastTime < 100) return;
        lastTime = now;

        const x = event.clientX;
        const y = event.clientY;

        // 一次点击同时发射多颗独立星星
        const count = Math.floor(rand(11, 17));

        for (let i = 0; i < count; i++) {
            createStar(x, y);
        }

        // 文字是单独元素，颜色、位置、速度均独立
        createMessage(x, y);
    }

    document.addEventListener("pointerdown", onPointerDown, {
        passive: true
    });
})();
