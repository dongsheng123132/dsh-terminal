# dsh-terminal

[![CI](https://github.com/dongsheng123132/dsh-terminal/actions/workflows/ci.yml/badge.svg)](https://github.com/dongsheng123132/dsh-terminal/actions/workflows/ci.yml)
[![MIT license](https://img.shields.io/github/license/dongsheng123132/dsh-terminal)](LICENSE)
[![Node.js 22+](https://img.shields.io/badge/Node.js-%E2%89%A522-339933?logo=nodedotjs&logoColor=white)](package.json)
[![Awesome DSH Plugins](https://img.shields.io/badge/Awesome_DSH-verified_lab-0969da)](https://github.com/dongsheng123132/awesome-dsh-plugins#2origin-plugin-lab)

An MIT-licensed persistent terminal mode for DeepSeek Harness. It keeps one real DSH `Agent` and `Session` alive across prompts, so customers can use Harness like a conversational coding CLI instead of only through the Web app or one-shot `headless` mode.

It reuses DSH's own model selection, tools, permissions, session log, commands, and shutdown lifecycle. There is no second agent implementation.

## Install

```sh
dsh plugin --profile terminal add github:dongsheng123132/dsh-terminal
dsh --profile terminal
```

Plain JavaScript is committed as the package entry point, so Git installs require no build-script permission.

## Commands

- ordinary text starts another turn in the same session
- `/new` starts a fresh session
- `/help` lists terminal commands and DSH's registered slash commands
- `/exit` or `/quit` closes the terminal
- other slash commands are dispatched directly to DSH (for example `/compact`, `/plan`, or `/cache` when provided by `dsh-cache-stabilizer`)

To add cache-prefix stabilization and measured cache statistics:

```sh
dsh plugin --profile terminal add github:dongsheng123132/dsh-cache-stabilizer
```

## Development

```sh
npm test
npm run check
```
