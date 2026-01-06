import httpx
import time
import subprocess
import os

def test_robots_local():
    """
    Test the robots service. 
    Assumes the service is running at http://localhost:8000
    """
    url = "http://localhost:8000/check"
    payload = {
        "url": "https://ariumclinic.com/private",
        "robots_txt_url": "https://ariumclinic.com/robots.txt",
        "user_agent": "AMI-Bot"
    }
    
    try:
        resp = httpx.post(url, json=payload, timeout=15.0)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
    except Exception as e:
        print(f"Failed to connect to service: {e}")

if __name__ == "__main__":
    test_robots_local()
