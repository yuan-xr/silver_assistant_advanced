import os
import openai

openai.api_key = os.getenv('OPENAI_API_KEY')

def transcribe_audio_file(file_path):
    with open(file_path, 'rb') as f:
        resp = openai.Audio.transcriptions.create(model='whisper-1', file=f)
    return resp['text']

def parse_intent(text):
    prompt = f"""
用户语句: {text}
请将用户意图解析成以下结构化格式
action 为 transfer 或 query 或 cancel
amount 为整数 单位元
recipient 为字符串
extra 为字符串
输出为严格的 json
"""
    resp = openai.ChatCompletion.create(model='gpt-4o-mini', messages=[{"role":"user","content":prompt}], max_tokens=200)
    content = resp['choices'][0]['message']['content']
    import json
    try:
        parsed = json.loads(content)
    except:
        parsed = {"action":"unknown","amount":0,"recipient":None,"extra":text}
    return parsed


from data.store import transactions
def build_confirmation_prompt(command):
    action = command.get('action')
    if action == 'transfer':
        return f"检测到转账 指令 收款人 {command.get('recipient')} 金额 {command.get('amount')}元 请确认"
    return "请确认操作"
def record_transaction(user_id, command, status):
    entry = { 'id': len(transactions)+1, 'user_id': user_id, 'command': command, 'status': status, 'ts': __import__('time').time() }
    transactions.append(entry)
    return entry