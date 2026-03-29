from pymongo import MongoClient
from dotenv import load_dotenv
import os, csv

load_dotenv()
db = MongoClient(os.getenv('MONGODB_URI'))['foreseen']

# 1. signal velocity
scores = list(db['signal_scores'].find({}, {'_id': 0}))
with open('signal_velocity.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['topic','velocity_7d','count_7d','count_30d','avg_signal_score','computed_at'])
    writer.writeheader()
    writer.writerows(scores)
print('signal_velocity.csv done')

# 2. signals by source
rows = list(db['signals'].aggregate([
    {"$group": {"_id": "$signal_type", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]))
with open('signals_by_source.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['_id','count'])
    writer.writeheader()
    writer.writerows(rows)
print('signals_by_source.csv done')

# 3. signals by topic
rows2 = list(db['signals'].aggregate([
    {"$unwind": "$topics"},
    {"$group": {"_id": "$topics", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]))
with open('signals_by_topic.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['_id','count'])
    writer.writeheader()
    writer.writerows(rows2)
print('signals_by_topic.csv done')

# 4. signals by state
rows3 = list(db['signals'].aggregate([
    {"$match": {"jurisdiction": {"$ne": "federal"}}},
    {"$group": {"_id": "$jurisdiction", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]))
with open('signals_by_state.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['_id','count'])
    writer.writeheader()
    writer.writerows(rows3)
print('signals_by_state.csv done')

print('All done')
