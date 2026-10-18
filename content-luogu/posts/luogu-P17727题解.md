---
title: "P17727 [SCP-J 2026] 打印 / print 题解"
date: 2026-10-18T19:32:28+08:00
draft: false
math: true
---




## 题目概述

有一只喜欢玩明日方舟的猫，肝舟熬穿了，第二天打印时不小心把第 $k$ 张 $A4$ 纸和倒数第 $k$ 张 $A4$ 纸印到了第 $k$ 张 $A3$ 纸上（第 $i$ 张 $A4$ 纸上有书上的第 $2i-1$ 与 $2i$ 面），她想知道书的第 $m$ 页被印到了哪一张 $A3$ 纸上，但是因为这个猫猫没有上过小学二年级，所以这个问题只能交给上各位上过小学二年级的虫且了（QwQ）。

## 思路

先算出一共需要多少张 $A4$ 纸：

$$
\text{tot}=\left\lceil\frac n2\right\rceil=\frac{n+1}{2}
$$

第 $m$ 页所在的 $A4$ 纸编号为：

$$
\text{tmp}=\left\lceil\frac m2\right\rceil=\frac{m+1}{2}
$$

每次将两端的 $A4$ 纸合并到同一张 $A3$ 纸上，所以对应的编号是 $\min(\text{tmp},\text{tot}-\text{tmp}+1)$。

如果 $\text{tot}$ 是奇数，且 $\text{tmp}$ 正好是中间那张 $A4$ 纸，那么它无法与其他纸配对，输出 $0$；否则输出上述编号即可。

## 代码

```cpp
#include <bits/stdc++.h>
using namespace std;
#define ll long long
int main() {
    cin.tie(0);cout.tie(0);
    ios::sync_with_stdio(0);
    
    auto solve = [&]() {
        ll n, m;
        cin >> n >> m;
        ll tmp = 1ll * (m + 1) / 2;
        ll tot = 1ll * (n + 1) / 2;
        if (1ll * tot % 2 && tmp == 1ll * (1ll + tot) / 2) {
            cout << 0 << '\n';
            return;
        }
        cout << min<ll>(tot - tmp + 1, tmp) << '\n';
    };
    
    
    int oT_To = 1;
//    cin >> oT_To;
    while (oT_To--){
        solve();
    }
    return 0;
} 
```

## 复杂度分析

时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。