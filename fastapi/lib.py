import requests
import urllib


def get_quality_statistics(filters: dict):
    params = urllib.parse.urlencode(filters)
    api_url = f"https://api.obis.org/statistics/qc?{params}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        result = response.json()
        return result
    except Exception as e:
        print(e)


def get_statistics(filters: dict):
    params = urllib.parse.urlencode(filters)
    api_url = f"https://api.obis.org/statistics?{params}"
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        result = response.json()
        return result
    except Exception as e:
        print(e)
