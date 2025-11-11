import numpy as np
from sklearn.ensemble import IsolationForest
from joblib import dump, load
import os
from data.store import transactions

MODEL_PATH = 'backend/models/iso_model.joblib'

def extract_features_for_tx(tx):
    amount = tx.get('amount', 0)
    count_last_hour = sum(1 for t in transactions if t['ts'] > tx['ts'] - 3600 and t['user_id'] == tx['user_id'])
    avg_amount = np.mean([t['command'].get('amount',0) for t in transactions if t['user_id'] == tx['user_id']]) if transactions else 0
    return [amount, count_last_hour, avg_amount]

def train_initial_model():
    if not transactions:
        dummy = np.array([[100,1,100],[200,2,150],[50,0,50]])
        m = IsolationForest(contamination=0.1)
        m.fit(dummy)
        dump(m, MODEL_PATH)
        return m
    X = []
    for t in transactions:
        X.append(extract_features_for_tx(t))
    X = np.array(X)
    m = IsolationForest(contamination=0.05)
    m.fit(X)
    dump(m, MODEL_PATH)
    return m

def load_model():
    if os.path.exists(MODEL_PATH):
        return load(MODEL_PATH)
    return train_initial_model()

def assess_risk_for_command(user_id, command):
    model = load_model()
    tx = {'user_id': user_id, 'command': command, 'ts': __import__('time').time(), 'amount': command.get('amount',0)}
    feat = np.array(extract_features_for_tx(tx)).reshape(1,-1)
    score = model.decision_function(feat)[0]
    pred = model.predict(feat)[0]
    level = 0 if pred == 1 else 1
    reason = '偏离历史行为' if level == 1 else '正常'
    return {'level': level, 'score': float(score), 'reason': reason}

from data.store import transactions
def execute_payment(user_id, command):
    entry = { 'id': len(transactions)+1, 'user_id': user_id, 'command': command, 'status': 'executed', 'ts': __import__('time').time() }
    transactions.append(entry)
    return {'status':'ok', 'tx_id': entry['id']}