from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from .database import Base
from sqlalchemy.dialects.postgresql import JSONB

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    username = Column(String, unique=True, index=True, nullable=False)

    email = Column(String, unique=True, index=True)

    password = Column(String, nullable=False)

    role = Column(String, default="student")
    # student / teacher / admin

    created_by = Column(String, default="system")
    # kim oluşturdu (admin / teacher vs)

    created_at = Column(DateTime, default=datetime.utcnow)


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)

    role = Column(String)
    page_name = Column(String)

    can_create = Column(Boolean, default=False)
    can_read = Column(Boolean, default=False)
    can_update = Column(Boolean, default=False)
    can_delete = Column(Boolean, default=False)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String)
    user_role = Column(String)
    action = Column(String)
    target = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    details = Column(JSONB, nullable=True)
class FilePermission(Base):
    __tablename__ = "file_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String, nullable=False)
    allowed_extensions = Column(String, nullable=False)

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)

    file_name = Column(String, nullable=False)

    file_path = Column(String, nullable=False)

    uploaded_by = Column(String, nullable=False)

    uploader_role = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)