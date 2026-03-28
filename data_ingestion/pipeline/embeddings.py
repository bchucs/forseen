"""
FORESEEN — Embedding pipeline
Generates vector embeddings for all signals using a free local model.
Enables semantic search and RAG-style retrieval for K2.
"""

from sentence_transformers import SentenceTransformer
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

db = MongoClient(os.getenv("MONGODB_URI"))["foreseen"]
signals = db["signals"]

# all-MiniLM-L6-v2 — fast, free, 384 dimensions, great for semantic similarity
MODEL_NAME = "all-MiniLM-L6-v2"

def get_signal_text(signal):
    """Combine title and summary into one string for embedding."""
    title = signal.get("title", "") or ""
    summary = signal.get("summary", "") or ""
    agency = signal.get("agency", "") or ""
    jurisdiction = signal.get("jurisdiction", "") or ""
    topics = " ".join(signal.get("topics", []))
    return f"{title}. {summary} {agency} {jurisdiction} {topics}".strip()

def embed_signals(batch_size=256):
    """Generate embeddings for all signals that don't have one yet."""
    print(f"Loading model: {MODEL_NAME}")
    model = SentenceTransformer(MODEL_NAME)
    print("Model loaded")

    # only process signals without embeddings
    cursor = signals.find(
        {"$or": [{"embedding": {"$exists": False}}, {"embedding": None}]},
        {"_id": 1, "title": 1, "summary": 1, "agency": 1, "jurisdiction": 1, "topics": 1}
    )

    batch_ids = []
    batch_texts = []
    total_embedded = 0

    for signal in cursor:
        text = get_signal_text(signal)
        batch_ids.append(signal["_id"])
        batch_texts.append(text)

        if len(batch_texts) >= batch_size:
            embeddings = model.encode(batch_texts, show_progress_bar=False)
            for _id, embedding in zip(batch_ids, embeddings):
                signals.update_one(
                    {"_id": _id},
                    {"$set": {"embedding": embedding.tolist()}}
                )
            total_embedded += len(batch_texts)
            print(f"  Embedded {total_embedded} signals so far...")
            batch_ids = []
            batch_texts = []

    # process remaining batch
    if batch_texts:
        embeddings = model.encode(batch_texts, show_progress_bar=False)
        for _id, embedding in zip(batch_ids, embeddings):
            signals.update_one(
                {"_id": _id},
                {"$set": {"embedding": embedding.tolist()}}
            )
        total_embedded += len(batch_texts)

    print(f"\nEmbedding complete: {total_embedded} signals embedded")
    return total_embedded

def semantic_search(query_text, top_k=20, jurisdictions=None):
    """
    Find the most semantically similar signals using Atlas $vectorSearch.
    Fetches extra candidates and post-filters by jurisdiction.
    """
    model = SentenceTransformer(MODEL_NAME)
    query_vector = model.encode([query_text], normalize_embeddings=True)[0].tolist()

    num_candidates = top_k * 10

    pipeline = [
        {
            "$vectorSearch": {
                "index": "signal_embedding_index",
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": num_candidates,
                "limit": num_candidates,
            }
        },
        {
            "$project": {
                "embedding": 0,
                "score": {"$meta": "vectorSearchScore"},
            }
        },
    ]

    results = []
    for doc in signals.aggregate(pipeline):
        if jurisdictions and doc.get("jurisdiction") not in jurisdictions:
            continue
        doc["similarity_score"] = round(doc.pop("score", 0), 4)
        results.append(doc)
        if len(results) >= top_k:
            break

    return results

if __name__ == "__main__":
    import sys

    if "--search" in sys.argv:
        print("\nTesting vector search...")
        results = semantic_search(
            "healthcare SaaS AI clinical decision support PHI privacy",
            top_k=10,
            jurisdictions=["federal", "CA", "NY", "TX", "FL"],
        )
        print(f"\nTop {len(results)} signals:")
        for r in results:
            print(f"  [{r['similarity_score']}] [{r['jurisdiction']}] {r['title'][:70]}")
    else:
        embed_signals(batch_size=256)
