---
alwaysApply: true
scene: git_message
---

在此处编写规则，自定义 AI 生成提交信息的风格。
1. 必须使用中文提交信息，遵循中外混排规则，中文和字母或数字之间必须保留一个空格。
2. 遵循以下 types：
```
{ value: 'feat', name: 'feat: 新增功能' },
{ value: 'fix', name: 'fix: 修复缺陷' },
{ value: 'docs', name: 'docs: 文档变更' },
{ value: 'style', name: 'style: 代码格式（不影响功能，例如空格、分号等格式修正）' },
{ value: 'refactor', name: 'refactor: 代码重构（不包括 bug 修复、功能新增）' },
{ value: 'perf', name: 'perf: 性能优化' },
{ value: 'test', name: 'test: 添加疏漏测试或已有测试改动' },
{ value: 'build', name: 'build: 构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）' },
{ value: 'ci', name: 'ci: 修改 CI 配置、脚本' },
{ value: 'revert', name: 'revert: 回滚 commit' },
{ value: 'chore', name: 'chore: 对构建过程或辅助工具和库的更改（不影响源文件、测试用例）' },
{ value: 'deps', name: 'deps: 依赖更新' },
{ value: 'init', name: 'init: 创世提交' },
```
3. 在提交标签之后以及 commit 信息之前基于如下规则生成 emoji:
```
{ value: 'feat', name: 'feat: ✨ 新增功能', emoji: ':sparkles:' },
{ value: 'fix', name: 'fix: 🐛 修复缺陷', emoji: ':bug:' },
{ value: 'docs', name: 'docs: 📝 文档更新', emoji: ':memo:' },
{ value: 'style', name: 'style: 💄 代码格式', emoji: ':lipstick:' },
{ value: 'refactor', name: ' refactor: ♻️ 代码重构', emoji: ':recycle:' },
{ value: 'perf', name: 'perf: ⚡️ 性能提升', emoji: ':zap:' },
{ value: 'test', name: 'test: ✅ 测试相关', emoji: ':white_check_mark:' },
{ value: 'build', name: 'build: 💚 构建相关', emoji: ':green_heart:' },
{ value: 'ci', name: 'ci: 🚀 持续集成', emoji: ':rocket:' },
{ value: 'revert', name: 'revert: ⏪️ 回退代码', emoji: ':rewind:' },
{ value: 'chore', name: 'chore: 🔥 其他修改', emoji: ':fire:' },
{ value: 'deps', name: 'deps: 📦️ 依赖更新', emoji: ':package:' },
{ value: 'init', name: 'init: 🎉 创世提交', emoji: ':tada:' },
```
