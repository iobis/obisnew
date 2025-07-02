from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
import os

router = APIRouter()

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"}
)
oauth.register(
    name="github",
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
    access_token_url="https://github.com/login/oauth/access_token",
    access_token_params=None,
    authorize_url="https://github.com/login/oauth/authorize",
    authorize_params=None,
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "user:email"}
)
oauth.register(
    name="linkedin",
    client_id=os.getenv("LINKEDIN_CLIENT_ID"),
    client_secret=os.getenv("LINKEDIN_CLIENT_SECRET"),
    access_token_url="https://www.linkedin.com/oauth/v2/accessToken",
    authorize_url="https://www.linkedin.com/oauth/v2/authorization",
    api_base_url="https://api.linkedin.com/v2/",
    client_kwargs={"scope": "r_liteprofile r_emailaddress"}
)
oauth.register(
    name="orcid",
    client_id=os.getenv("ORCID_CLIENT_ID"),
    client_secret=os.getenv("ORCID_CLIENT_SECRET"),
    access_token_url="https://orcid.org/oauth/token",
    authorize_url="https://orcid.org/oauth/authorize",
    api_base_url="https://pub.orcid.org/v3.0/",
    client_kwargs={"scope": "openid"}
)

@router.get("/login/{provider}")
async def login(request: Request, provider: str):
    host = os.getenv("PUBLIC_HOST")
    redirect_uri = f"{host}/auth/{provider}"
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)

@router.get("/auth/{provider}")
async def auth(request: Request, provider: str):
    token = await oauth.create_client(provider).authorize_access_token(request)
    if provider == "google":
        user = token.get("userinfo")
    elif provider == "github":
        resp = await oauth.github.get("user", token=token)
        user = resp.json()
    elif provider == "linkedin":
        resp = await oauth.linkedin.get("me", token=token)
        user = resp.json()
        email_resp = await oauth.linkedin.get("emailAddress?q=members&projection=(elements*(handle~))", token=token)
        email = email_resp.json()["elements"][0]["handle~"]["emailAddress"]
        user["email"] = email
    elif provider == "orcid":
        user = {}
        id_token = token.get("id_token")
        if id_token:
            from authlib.jose import jwt
            claims = jwt.decode(id_token, key=None, claims_options={"iss": {"essential": False}})
            user["orcid"] = claims.get("sub")
            user["name"] = claims.get("name")
            user["email"] = claims.get("email")
        else:
            resp = await oauth.orcid.get("userinfo", token=token)
            userinfo = resp.json()
            user["orcid"] = userinfo.get("sub")
            user["name"] = userinfo.get("name")
            user["email"] = userinfo.get("email")
    else:
        raise HTTPException(status_code=400, detail="Unknown provider")
    request.session["user"] = user
    return RedirectResponse(url="/doi")

@router.get("/logout/")
async def logout(request: Request):
    request.session.pop("user", None)
    return RedirectResponse(url="/") 