import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from protego import Protego
from typing import Optional

app = FastAPI()

class RobotsRequest(BaseModel):
    url: str
    robots_txt_url: str
    user_agent: str = "AMI-Bot"

class RobotsResponse(BaseModel):
    allowed: bool
    reason: str
    matched_rule: Optional[str] = None
    user_agent: str
    crawl_delay: Optional[float] = None

@app.post("/check", response_model=RobotsResponse)
async def check_robots(request: RobotsRequest):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(request.robots_txt_url, timeout=10.0)
            if resp.status_code == 404:
                # If robots.txt doesn't exist, it's allowed
                return RobotsResponse(
                    allowed=True,
                    reason="robots.txt not found (404)",
                    user_agent=request.user_agent
                )
            if resp.status_code >= 400:
                # Other errors might imply blocking, but usually 5xx means "disallow all" or "allow all" 
                # depending on guidelines. Let's be conservative.
                return RobotsResponse(
                    allowed=True,
                    reason=f"Status code {resp.status_code}",
                    user_agent=request.user_agent
                )
            
            rp = Protego.parse(resp.text)
            is_allowed = rp.can_fetch(request.url, request.user_agent)
            crawl_delay = rp.crawl_delay(request.user_agent)
            
            # Protego doesn't easily expose the matched rule string in a single call, 
            # but we can provide the general state.
            return RobotsResponse(
                allowed=is_allowed,
                reason="Parsed robots.txt",
                matched_rule=None, # Simplified
                user_agent=request.user_agent,
                crawl_delay=crawl_delay
            )
            
    except Exception as e:
        return RobotsResponse(
            allowed=True, # Default to allowed on error to avoid halting pipeline
            reason=f"Error: {str(e)}",
            user_agent=request.user_agent
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
