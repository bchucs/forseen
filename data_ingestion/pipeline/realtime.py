
def poll_google_news():
    """Poll Google News RSS for latest articles."""
    from ingestors.google_alerts import fetch_google_news
    return fetch_google_news()
