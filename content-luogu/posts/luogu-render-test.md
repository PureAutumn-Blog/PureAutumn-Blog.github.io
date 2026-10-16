

---

title: "洛谷 Markdown 兼容性测试"

date: 2026-10-15T23:30:00+08:00

draft: false

math: true

---



# 洛谷 Markdown 测试



这是一段普通文字，支持 **加粗**、~~删除线~~、`行内代码` 和行内公式 \(a^2+b^2=c^2\)。



## 1. 信息框



{{% callout type="info" title="信息测试" open="true" %}}



这是一段信息提示文字。



{{% callout type="success" title="嵌套成功框" open="true" %}}



嵌套内容也应该正常显示。



{{% /callout %}}



{{% /callout %}}



## 2. 警告与错误框



{{% callout type="warning" title="警告测试" %}}



请注意，这里应该出现警告样式。



{{% /callout %}}



{{% callout type="error" title="错误测试" %}}



这里应该出现错误提示样式。



{{% /callout %}}



## 3. 引言



{{% epigraph author="——测试作者" %}}



十年 OI 一场空，不开 long long 见祖宗。



{{% /epigraph %}}


行内公式：\(a^2+b^2=c^2\)

独立公式：

\[
a^2+b^2=c^2
\]

另一种独立公式：

$$
\sum_{i=1}^{n} i=\frac{n(n+1)}{2}
$$



## 5. 带行号的代码

```cpp {linenos=table}
#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Hello, world!" << '\n';
    return 0;
}
```



## 6. 表格



| 项目 | 结果 |
| --- | --- |
| 表格 | 正常 |
| 公式 | 正常 |