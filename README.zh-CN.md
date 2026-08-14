# dsh-terminal

[![CI](https://github.com/dongsheng123132/dsh-terminal/actions/workflows/ci.yml/badge.svg)](https://github.com/dongsheng123132/dsh-terminal/actions/workflows/ci.yml)
[![MIT 许可证](https://img.shields.io/github/license/dongsheng123132/dsh-terminal)](LICENSE)
[![Node.js 22+](https://img.shields.io/badge/Node.js-%E2%89%A522-339933?logo=nodedotjs&logoColor=white)](package.json)
[![Awesome DSH Plugins](https://img.shields.io/badge/Awesome_DSH-%E5%B7%B2%E9%AA%8C%E8%AF%81%E5%AE%9E%E9%AA%8C-0969da)](https://github.com/dongsheng123132/awesome-dsh-plugins/blob/main/README.zh-CN.md#2origin-%E6%8F%92%E4%BB%B6%E5%AE%9E%E9%AA%8C%E5%AE%A4)

DeepSeek Harness 的 MIT 开源持续对话终端模式。它会在多轮输入之间保留同一个真实 DSH `Agent` 和 `Session`，让客户除了 Web 工作台和一次性 headless 任务外，也能像 Claude Code / Hermes 一样在终端里连续使用。

它复用 DSH 自己的模型选择、工具、权限、会话日志、命令与退出生命周期，没有另写第二套智能体。

## 安装

```sh
dsh plugin --profile terminal add github:dongsheng123132/dsh-terminal
dsh --profile terminal
```

包直接提交可运行 JavaScript，从 GitHub 安装不需要授权执行构建脚本。

## 命令

- 普通文字：在同一会话中继续一轮
- `/new`：新会话
- `/help`：查看终端命令与 DSH 已注册命令
- `/exit`、`/quit`：退出
- 其他斜杠命令直接交给 DSH，例如 `/compact`、`/plan`，安装缓存插件后还有 `/cache`

## 开发

```sh
npm test
npm run check
```
