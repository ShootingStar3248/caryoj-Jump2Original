# HydroOJ 跳转工具

一个 Tampermonkey 用户脚本，为 caryoj 题目页面添加便捷的跳转和搜索功能。

## 主要功能

- **查看原题**：一键跳转到题目来源网站（洛谷、Codeforces、AtCoder、SPOJ、BZOJ）
- **洛谷搜索**：在洛谷搜索题目，支持两种模式：
  - **搜索并跳转**：自动跳转到第一个搜索结果
  - **显示列表**：打开洛谷搜索列表页面
- **智能识别**：自动解析题目 URL，提取来源和 ID
- **悬浮球菜单**：从洛谷搜索跳转后，提供快速操作菜单
- **自动清理**：在错误页面自动隐藏按钮

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 新建用户脚本并粘贴代码
3. 保存并启用脚本

## 支持平台

### 主要功能页面
- `https://www.caryoj.cn/p/*` - caryoj 题目页面

### 原题跳转支持
| 来源 | 示例 ID | 跳转链接 |
|------|---------|----------|
| 洛谷 | `luogu-P1000` | `https://www.luogu.com.cn/problem/P1000` |
| Codeforces | `codeforces-1000A` | `https://codeforces.com/problemset/problem/1000/A` |
| AtCoder | `atcoder-ABC123A` | `https://atcoder.jp/contests/abc123/tasks/abc123_a` |
| SPOJ | `spoj-ABCDE` | `https://www.spoj.com/problems/ABCDE/` |
| BZOJ | `bzoj-1001` | `https://darkbzoj.cc/problem/1001` |

### 悬浮球支持
- `https://www.luogu.com.cn/problem/*` - 从 caryoj 搜索跳转后显示

## 使用方法

### 在 caryoj 题目页面
1. 打开题目页面（如 `https://www.caryoj.cn/p/luogu-P1000`）
2. 页面标题旁会出现操作按钮：
   - **查看原题**：蓝色按钮，跳转到题目来源网站
   - **在洛谷搜索**：绿色按钮，弹窗输入关键词搜索

### 搜索功能
1. 点击 **在洛谷搜索** 按钮
2. 在弹出的对话框中输入关键词（默认将自动填充）
3. 选择操作：
   - **搜索并跳转**：自动跳转到第一个搜索结果
   - **显示列表**：打开洛谷搜索列表页面
   - **取消**：关闭对话框

### 悬浮球菜单
从 HydroOJ 跳转到洛谷后，页面右下角会出现 `?` 悬浮球：

- **关闭此标签页**：关闭当前洛谷页面
- **显示搜索列表**：在新标签页打开搜索列表
- **关闭并显示搜索列表**：关闭当前页并打开搜索列表

悬浮球会在闲置 10 秒后淡出，淡出前鼠标悬停可重置倒计时。

## 技术细节

### 匹配规则
- 严格匹配 `/p/xxxxx` 格式（一层路径），不会匹配 `/p/xxx/yyy` 等二级路径
- 自动检测错误页面（`.error__twd2` 元素）并移除按钮

### URL 解析
- 支持 `prefix-id` 格式（如 `luogu-P1000`）
- 自动提取前缀和 ID
- 无前缀的题目也会显示搜索按钮

### 搜索流程
1. 使用 GM_xmlhttpRequest 请求洛谷搜索页面
2. 解析 HTML 提取第一个结果链接
3. 自动添加 `from_hydro_search=1` 参数标记跳转来源
4. 传递搜索列表 URL 供悬浮球使用

## 更新日志

### v6.6
- 第一个可用版本

## 贡献

欢迎提交 Issue 和 PR！

## 许可证

MIT License

## 作者

- DeepSeek-v4-flash & ShootingStar

---

**注意**：本脚本仅供学习交流使用，请遵守各平台的使用条款。