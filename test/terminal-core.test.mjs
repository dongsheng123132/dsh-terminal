import test from 'node:test'
import assert from 'node:assert/strict'
import { renderCommandResult, summarizeTurn } from '../lib/terminal-core.mjs'

test('summarizes the final assistant message in one turn interval', () => {
  const events = [
    { seq: 1, type: 'assistant/message', data: { message: { content: [{ type: 'text', text: 'old' }] } } },
    { seq: 2, type: 'turn/start', data: {} },
    { seq: 3, type: 'assistant/message', data: { message: { content: [{ type: 'text', text: 'working' }] } } },
    { seq: 4, type: 'assistant/message', data: { message: { content: [{ type: 'text', text: 'final' }] } } },
    { seq: 5, type: 'turn/end', data: { reason: { kind: 'completed' } } },
  ]
  assert.deepEqual(summarizeTurn(events, 2), { text: 'final', reason: { kind: 'completed' } })
})

test('renders command success, failure, and unknown cases', () => {
  assert.equal(renderCommandResult(undefined, '/missing'), 'Unknown command: /missing. Type /help to list commands.')
  assert.equal(renderCommandResult({ result: { kind: 'success', text: '42' } }, '/x'), '42')
  assert.equal(renderCommandResult({ result: { kind: 'success' } }, '/x'), 'Done.')
  assert.equal(renderCommandResult({ result: { kind: 'error', text: 'nope' } }, '/x'), 'Command failed: nope')
})
