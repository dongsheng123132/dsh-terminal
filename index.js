import { randomUUID } from 'node:crypto'
import { createInterface } from 'node:readline'
import { HELP_TEXT, renderCommandResult, summarizeTurn } from './lib/terminal-core.mjs'

export const name = 'dsh-terminal-runner'
export const inject = ['agentDefaultModel', 'agents', 'sessions', 'commands', 'cmdlineArgs']

export const internals = {
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
}

// Keep the runtime entry self-contained. DSH profiles supply the service APIs,
// while these two tiny value/listener helpers avoid pulling a second copy of
// Cordis or version-skewed public packages into an out-of-tree bundle.
function userMessage(text) {
  return Object.freeze({
    id: randomUUID(),
    role: 'user',
    content: Object.freeze([Object.freeze({ type: 'text', text })]),
    source: Object.freeze({ kind: 'user' }),
  })
}

function installSelection(agentCtx, selection) {
  const selected = { current: selection, assembled: undefined }
  agentCtx.on('system-prompt/assemble', async (_assembly, _context, next) => {
    const current = selected.current
    const assembled = await next()
    selected.assembled = current
    if (current === undefined) return assembled
    return {
      ...assembled,
      variables: { ...assembled.variables, provider: current.provider, model: current.model },
    }
  })
  agentCtx.on('agent/request', async (_payload, next) => {
    const resolved = await next()
    const current = selected.assembled
    if (current === undefined) return resolved
    const { reasoningEffort: _inheritedEffort, ...rest } = resolved
    return {
      ...rest,
      provider: current.provider,
      model: current.model,
      ...(current.reasoningEffort === undefined ? {} : { reasoningEffort: current.reasoningEffort }),
    }
  })
}

async function createAgent(ctx) {
  const selection = ctx.agentDefaultModel.currentSelection()
  return ctx.agents.create({
    sessionId: `session-${randomUUID()}`,
    meta: { cwd: process.cwd() },
    agentOptions: { provider: selection.provider, model: selection.model },
    setup: (agentCtx) => {
      installSelection(agentCtx, selection)
    },
  })
}

function print(io, text = '') {
  io.stdout.write(`${text}\n`)
}

async function runTurn(ctx, handle, line, io) {
  const firstSeq = handle.agent.session.seq
  handle.agent.followup(userMessage(line))
  await handle.agent.whenIdle()
  await ctx.sessions.flush(handle.agent.session)
  const outcome = summarizeTurn(handle.agent.session.events, firstSeq)
  if (outcome.text !== '') print(io, outcome.text)
  if (outcome.reason?.kind === 'error') {
    io.stderr.write(`dsh: ${outcome.reason.error.code}: ${outcome.reason.error.message}\n`)
  }
}

async function run(ctx, io, exit) {
  await ctx.get('loader')?.await()
  const args = ctx.cmdlineArgs.get()
  if (args.includes('-h') || args.includes('--help')) {
    print(io, HELP_TEXT)
    exit(0)
    return
  }
  if (args.length > 0) {
    io.stderr.write(`dsh-terminal: unexpected argument(s): ${args.join(' ')}\n`)
    io.stderr.write('Run dsh --profile terminal --help for usage.\n')
    exit(2)
    return
  }

  let handle = await createAgent(ctx)
  await handle.agent.whenIdle()
  const terminal = Boolean(io.stdin.isTTY && io.stdout.isTTY)
  const rl = createInterface({ input: io.stdin, output: io.stdout, terminal })
  let closing = false

  print(io, 'DeepSeek Harness terminal mode')
  print(io, `Model: ${handle.agent.options.provider}/${handle.agent.options.model}`)
  print(io, 'Type /help for commands. Ctrl+C or /exit to quit.')
  if (terminal) rl.setPrompt('dsh> ')
  if (terminal) rl.prompt()

  rl.on('SIGINT', () => {
    closing = true
    rl.close()
  })

  try {
    for await (const raw of rl) {
      const line = raw.trim()
      if (line === '') {
        if (terminal) rl.prompt()
        continue
      }
      if (line === '/exit' || line === '/quit') {
        closing = true
        rl.close()
        break
      }
      if (line === '/help') {
        print(io, HELP_TEXT)
        const commands = ctx.commands.list(handle.agent)
        if (commands.length > 0) {
          print(io, '\nDSH commands:')
          for (const command of commands) print(io, `  /${command.name}${command.input ? ` ${command.input.hint}` : ''}  ${command.description}`)
        }
      } else if (line === '/new') {
        await handle.dispose()
        handle = await createAgent(ctx)
        await handle.agent.whenIdle()
        print(io, 'Started a new session.')
      } else if (line.startsWith('/')) {
        const execution = await ctx.commands.execute(handle.agent, line, new AbortController().signal)
        print(io, renderCommandResult(execution, line))
      } else {
        await runTurn(ctx, handle, line, io)
      }
      if (!closing && terminal) rl.prompt()
    }
  } finally {
    await handle.dispose()
  }
  exit(0)
}

export function apply(ctx) {
  const exit = ctx.get('appExit')
  if (exit === undefined) throw new Error('dsh-terminal: launcher must provide ctx.appExit')
  void run(ctx, internals, exit).catch((error) => {
    internals.stderr.write(`dsh-terminal: ${error instanceof Error ? error.message : String(error)}\n`)
    exit(1)
  })
}
