---
alwaysApply: true
scene: git_message
---

<rules>
  <rule>
    <desc>必须使用中文提交信息，遵循中外混排规则，中文和字母或数字之间必须保留一个空格。</desc>
  </rule>
  <rule>
    <desc>遵循以下 types：</desc>
    <types>
      <type name="feat">feat: 新增功能</type>
      <type name="fix">fix: 修复缺陷</type>
      <type name="docs">docs: 文档变更</type>
      <type name="style">style: 代码格式（不影响功能，例如空格、分号等格式修正）</type>
      <type name="refactor">refactor: 代码重构（不包括 bug 修复、功能新增）</type>
      <type name="perf">perf: 性能优化</type>
      <type name="test">test: 添加疏漏测试或已有测试改动</type>
      <type name="build">build: 构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）</type>
      <type name="ci">ci: 修改 CI 配置、脚本</type>
      <type name="revert">revert: 回滚 commit</type>
      <type name="chore">chore: 对构建过程或辅助工具和库的更改（不影响源文件、测试用例）</type>
      <type name="deps">deps: 依赖更新</type>
      <type name="init">init: 创世提交</type>
    </types>
  </rule>
  <rule>
    <desc>在提交标签之后以及 commit 信息之前基于如下规则生成 emoji：</desc>
    <emojis>
      <emoji type="feat" desc="feat: ✨ 新增功能" emoji=":sparkles:'"></emoji>
      <emoji type="fix" desc="fix: 🐛 修复缺陷" emoji=":bug:"></emoji>
      <emoji type="docs" desc="docs: 📝 文档更新" emoji=":memo:"></emoji>
      <emoji type="style" desc="style: 💄 代码格式" emoji=":lipstick:"></emoji>
      <emoji type="refactor" desc="refactor: ♻️ 代码重构" emoji=":recycle:"></emoji>
      <emoji type="perf" desc="perf: ⚡️ 性能提升" emoji=":zap:"></emoji>
      <emoji type="test" desc="test: ✅ 测试相关" emoji=":white_check_mark:"></emoji>
      <emoji type="build" desc="build: 💚 构建相关" emoji=":green_heart:"></emoji>
      <emoji type="ci" desc="ci: 🚀 持续集成" emoji=":rocket:"></emoji>
      <emoji type="revert" desc="revert: ⏪️ 回退代码" emoji=":rewind:"></emoji>
      <emoji type="chore" desc="chore: 🔥 其他修改" emoji=":fire:"></emoji>
      <emoji type="deps" desc="deps: 📦️ 依赖更新" emoji=":package:"></emoji>
      <emoji type="init" desc="init: 🎉 创世提交" emoji=":tada:"></emoji>
    </emojis>
  </rule>
</rule>
