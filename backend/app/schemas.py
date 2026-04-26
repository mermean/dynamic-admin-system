from pydantic import BaseModel


class UserCreate(BaseModel):
    full_name: str
    username: str
    email: str
    password: str
    role: str


class UserLogin(BaseModel):
    username: str
    password: str


class PermissionCreate(BaseModel):
    role: str
    page_name: str
    can_create: bool
    can_read: bool
    can_update: bool
    can_delete: bool


class FilePermissionCreate(BaseModel):
    role: str
    allowed_extensions: str