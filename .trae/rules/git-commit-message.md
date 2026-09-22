---
alwaysApply: false
description: 仅在生成 git 提交信息时生效
scene: git_message
---
1. **格式与 Emoji 映射:**
根据提交信息使用如下提交类型，同时根据提交类型，在提交标签（含 scope）后、具体信息前插入对应的 emoji。
```json
[
  { "value": "feat", "emoji": "✨" },
  { "value": "fix", "emoji": "🐛" },
  { "value": "docs", "emoji": "📝" },
  { "value": "style", "emoji": "💄" },
  { "value": "refactor", "emoji": "♻️" },
  { "value": "perf", "emoji": "⚡️" },
  { "value": "test", "emoji": "✅" },
  { "value": "build", "emoji": "💚" },
  { "value": "ci", "emoji": "🚀" },
  { "value": "revert", "emoji": "⏪️" },
  { "value": "chore", "emoji": "🔥" },
  { "value": "deps", "emoji": "📦️" },
  { "value": "init", "emoji": "🎉" }
]
```

example:
```
refactor(auth): ♻️ 替换原有登录接口为访客登录接口
```

2. **语言要求:**
除专有名词外，提交信息必须使用中文。

3. **排版规范:**
严格执行中英、中数混排规则，中文与英文、阿拉伯数字之间必须保留一个半角空格。
