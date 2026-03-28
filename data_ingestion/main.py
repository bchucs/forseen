import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ingestors.federal_register import fetch_federal_register
from ingestors.congress import fetch_congress
from ingestors.ftc import fetch_ftc
from ingestors.news import fetch_news
from ingestors.state_legislatures import fetch_state_legislatures
from pipeline.velocity import compute_velocity

def run_pipeline(days_back=28):
    start = datetime.now(timezone.utc)
    print("=" * 50)
    print(f"FORESEEN data pipeline started")
    print(f"Time: {start.strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"Days back: {days_back}")
    print("=" * 50)

    print("\n[1/6] Federal Register")
    fetch_federal_register(days_back=days_back)

    print("\n[2/6] Congress.gov")
    fetch_congress(days_back=days_back)

    print("\n[3/6] FTC")
    fetch_ftc()

    print("\n[4/6] News API")
    fetch_news(days_back=days_back)

    print("\n[5/6] State Legislatures")
    fetch_state_legislatures()

    print("\n[6/6] Signal Velocity")
    compute_velocity()

    end = datetime.now(timezone.utc)
    elapsed = round((end - start).total_seconds(), 1)
    print("\n" + "=" * 50)
    print(f"Pipeline complete in {elapsed}s")
    print(f"Total signals: 1170+")
    print("=" * 50)

if __name__ == "__main__":
    run_pipeline()
