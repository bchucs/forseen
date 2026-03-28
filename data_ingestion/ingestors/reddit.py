import requests
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

db = MongoClient(os.getenv("MONGODB_URI"))["foreseen"]
signals = db["signals"]

HEADERS = {"User-Agent": "FORESEEN/1.0 regulatory intelligence bot"}

# subreddits relevant to healthcare regulation and privacy
SUBREDDITS = [
    "healthcare",
    "privacy",
    "healthIT",
    "medicine",
    "legaladvice",
    "smallbusiness",
    "compliance",
    "cybersecurity",
    "digitalnomad",
    "entrepeneur",
]

SEARCH_QUERIES = [
    "HIPAA regulation",
    "health data privacy law",
    "AI healthcare regulation",
    "FTC health enforcement",
    "patient data protection",
    "medical records privacy",
    "health app regulation",
]

TOPIC_KEYWORDS = {
    "privacy":         ["privacy", "personal data", "consumer data", "data protection", "CCPA"],
    "health_data":     ["health data", "health app", "patient", "medical", "health information", "PHI"],
    "ai_ml":           ["artificial intelligence", "machine learning", "algorithm", "automated", "AI"],
    "ftc_enforcement": ["FTC", "enforcement", "settlement", "consent decree", "penalty"],
    "hipaa":           ["HIPAA", "health insurance", "protected health information"],
}

def classify_topics(title, summary):
    text = f"{title} {summary}".lower()
    matched = []
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(kw.lower() in text for kw in keywords):
            matched.append(topic)
    return matched if matched else ["general"]

def is_relevant(title, summary):
    text = f"{title} {summary}".lower()
    keywords = [
        "health", "privacy", "data", "hipaa", "patient", "medical",
        "artificial intelligence", "ai", "enforcement", "regulation",
        "law", "compliance", "breach", "ftc", "digital", "telehealth"
    ]
    return any(kw in text for kw in keywords)

def fetch_subreddit(subreddit, limit=25):
    inserted = 0
    try:
        url = f"https://www.reddit.com/r/{subreddit}/hot.json"
        r = requests.get(url, headers=HEADERS, params={"limit": limit}, timeout=15)
        if r.status_code != 200:
            return 0

        posts = r.json().get("data", {}).get("children", [])
        for post in posts:
            data = post.get("data", {})
            title = data.get("title", "")
            summary = data.get("selftext", "")[:500]
            url = f"https://reddit.com{data.get('permalink', '')}"

            if not is_relevant(title, summary):
                continue

            created_utc = data.get("created_utc", 0)
            pub_date = datetime.fromtimestamp(created_utc, tz=timezone.utc)
            days_old = (datetime.now(timezone.utc) - pub_date).days
            recency_score = max(0, 1 - (days_old / 90))
            signal_score = round((0.4 * 0.6) + (recency_score * 0.4), 3)

            signal = {
                "signal_type": "reddit",
                "title": title,
                "summary": summary,
                "source_url": url,
                "jurisdiction": "federal",
                "agency": f"Reddit r/{subreddit}",
                "topics": classify_topics(title, summary),
                "signal_score": signal_score,
                "document_type": "Social Discussion",
                "document_number": data.get("id", ""),
                "published_date": pub_date,
                "created_at": datetime.now(timezone.utc),
                "processed_at": None,
                "metadata": {
                    "subreddit": subreddit,
                    "score": data.get("score", 0),
                    "num_comments": data.get("num_comments", 0),
                    "upvote_ratio": data.get("upvote_ratio", 0),
                }
            }

            try:
                signals.update_one(
                    {"source_url": url},
                    {"$set": signal},
                    upsert=True
                )
                inserted += 1
            except Exception:
                pass

    except Exception as e:
        print(f"    Exception for r/{subreddit}: {e}")

    return inserted

def fetch_reddit_search(query, limit=10):
    inserted = 0
    try:
        url = "https://www.reddit.com/search.json"
        params = {
            "q": query,
            "sort": "new",
            "limit": limit,
            "t": "month",
        }
        r = requests.get(url, headers=HEADERS, params=params, timeout=15)
        if r.status_code != 200:
            return 0

        posts = r.json().get("data", {}).get("children", [])
        for post in posts:
            data = post.get("data", {})
            title = data.get("title", "")
            summary = data.get("selftext", "")[:500]
            post_url = f"https://reddit.com{data.get('permalink', '')}"
            subreddit = data.get("subreddit", "")

            if not is_relevant(title, summary):
                continue

            created_utc = data.get("created_utc", 0)
            pub_date = datetime.fromtimestamp(created_utc, tz=timezone.utc)
            days_old = (datetime.now(timezone.utc) - pub_date).days
            recency_score = max(0, 1 - (days_old / 90))
            signal_score = round((0.4 * 0.6) + (recency_score * 0.4), 3)

            signal = {
                "signal_type": "reddit",
                "title": title,
                "summary": summary,
                "source_url": post_url,
                "jurisdiction": "federal",
                "agency": f"Reddit r/{subreddit}",
                "topics": classify_topics(title, summary),
                "signal_score": signal_score,
                "document_type": "Social Discussion",
                "document_number": data.get("id", ""),
                "published_date": pub_date,
                "created_at": datetime.now(timezone.utc),
                "processed_at": None,
                "metadata": {
                    "subreddit": subreddit,
                    "score": data.get("score", 0),
                    "num_comments": data.get("num_comments", 0),
                    "upvote_ratio": data.get("upvote_ratio", 0),
                }
            }

            try:
                signals.update_one(
                    {"source_url": post_url},
                    {"$set": signal},
                    upsert=True
                )
                inserted += 1
            except Exception:
                pass

    except Exception as e:
        print(f"    Exception for search '{query}': {e}")

    return inserted

def fetch_reddit():
    total = 0

    print("  Fetching subreddits...")
    for sub in SUBREDDITS:
        count = fetch_subreddit(sub)
        if count > 0:
            print(f"    r/{sub}: {count} signals")
        total += count

    print("  Searching Reddit...")
    for query in SEARCH_QUERIES:
        count = fetch_reddit_search(query)
        if count > 0:
            print(f"    '{query}': {count} signals")
        total += count

    print(f"\nReddit done: {total} upserted")
    print(f"Total signals in DB: {signals.count_documents({})}")

if __name__ == "__main__":
    fetch_reddit()
