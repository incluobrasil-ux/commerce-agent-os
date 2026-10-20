from anthropic import Anthropic
from pathlib import Path
env = dict(l.strip().split('=', 1) for l in Path(r'c:\projetos-incluo\commerce-agent-os\.env.local').read_text(encoding='utf-8').splitlines() if l.strip() and not l.startswith('#') and '=' in l)
try:
    c = Anthropic(api_key=env['ANTHROPIC_API_KEY'])
    r = c.messages.create(model='claude-haiku-4-5-20251001', max_tokens=10, messages=[{'role': 'user', 'content': 'hi'}])
    print('OK:', r.content[0].text)
except Exception as e:
    print('ERR:', str(e)[:200])
