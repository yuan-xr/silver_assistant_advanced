from flask import Flask, request, jsonify
from flask_cors import CORS
from models.asr_nlu import transcribe_audio_file, parse_intent
from models.risk_model import assess_risk_for_command, train_initial_model
from models.dialog_manager import build_confirmation_prompt, record_transaction
from services.payment_gateway import execute_payment
from services.guardian_service import push_guardian_alert, guardian_approve, guardian_reject
from data import store
import os

app = Flask(__name__)
CORS(app)
train_initial_model()

@app.route('/upload_voice', methods=['POST'])
def upload_voice():
    if 'file' not in request.files:
        return jsonify({'error':'no file'}), 400
    f = request.files['file']
    path = os.path.join('/tmp', f.filename)
    f.save(path)
    text = transcribe_audio_file(path)
    parsed = parse_intent(text)
    user_id = 'user_1'
    if parsed.get('action') == 'transfer':
        command = {'action':'transfer','amount':parsed.get('amount',0),'recipient':parsed.get('recipient')}
        risk = assess_risk_for_command(user_id, command)
        if risk['level'] == 1:
            alert = push_guardian_alert(user_id, command, risk)
            prompt = build_confirmation_prompt(command)
            return jsonify({'require_confirmation': True, 'prompt': prompt, 'command': command})
        record_transaction(user_id, command, 'executed')
        res = execute_payment(user_id, command)
        return jsonify({'require_confirmation': False, 'message':'支付已执行', 'tx': res})
    return jsonify({'require_confirmation': False, 'message':'未识别到可执行指令'})

@app.route('/confirm', methods=['POST'])
def confirm():
    data = request.get_json()
    command = data.get('command')
    user_id = 'user_1'
    record_transaction(user_id, command, 'confirmed')
    res = execute_payment(user_id, command)
    return jsonify({'message':'已确认并执行', 'tx': res})

@app.route('/notifications', methods=['GET'])
def notifications():
    return jsonify(store.notifications)

@app.route('/guardian_alerts', methods=['GET'])
def guardian_alerts():
    return jsonify(store.guardian_alerts)

@app.route('/guardian_action', methods=['POST'])
def guardian_action():
    data = request.get_json()
    alert_id = data.get('alert_id')
    action = data.get('action')
    if action == 'approve':
        a = guardian_approve(alert_id)
        if a:
            res = execute_payment(a['user_id'], a['command'])
            return jsonify({'status':'approved', 'tx': res})
    if action == 'reject':
        a = guardian_reject(alert_id)
        return jsonify({'status':'rejected'})
    return jsonify({'status':'unknown'})

if __name__ == '__main__':
    os.environ.setdefault('OPENAI_API_KEY', '')
    app.run(host='0.0.0.0', port=5000)