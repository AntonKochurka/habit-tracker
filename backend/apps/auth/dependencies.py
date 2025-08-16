from fastapi.security import HTTPBearer, APIKeyCookie

access_token = HTTPBearer(scheme_name="access_token")
refresh_token = APIKeyCookie(name="refresh", scheme_name="refresh_token")
