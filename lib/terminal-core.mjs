export const HELP_TEXT = `Usage: dsh --profile terminal

Persistent terminal conversation over one DSH Agent and Session.

Terminal commands:
  /help       show terminal and registered DSH commands
  /new        start a fresh session
  /exit       close the terminal
  /quit       close the terminal

Other registered slash commands (for example /cache, /compact, /plan) are
executed directly by DSH and are never sent to the model.`

export function summarizeTurn(events, firstSeq) {
  let started = false
  let text = ''
  let reason
  for (const event of events) {
    if (event.seq < firstSeq) continue
    if (event.type === 'turn/start') {
      started = true
      continue
    }
    if (!started) continue
    if (event.type === 'assistant/message') {
      const joined = event.data.message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('')
      if (joined !== '') text = joined
    }
    if (event.type === 'turn/end') reason = event.data.reason
  }
  return { text, reason }
}

export function renderCommandResult(execution, line) {
  if (execution === undefined) return `Unknown command: ${line}. Type /help to list commands.`
  const result = execution.result
  if (result.kind === 'error') return `Command failed: ${result.text}`
  return result.text ?? 'Done.'
}
