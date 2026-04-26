from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from .ai_service import ask_ai
from .database import engine, Base, SessionLocal
from .models import User, Permission, ActivityLog, FilePermission, UploadedFile
from .schemas import UserCreate, UserLogin, PermissionCreate, FilePermissionCreate
from .auth import create_access_token
from .file_upload import router as file_router
from .rabbitmq import send_to_queue
from .redis_client import redis_client


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(file_router)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "JWT sistemi başlıyor kral 🚀"
    }


# -----------------------------
# REGISTER
# -----------------------------
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        User.username == user.username
    ).first()

    if existing_user:
        return {
            "message": "Bu email zaten kayıtlı"
        }

    new_user = User(
        full_name=user.full_name,
        username=user.username,
        email=user.email,
        password=user.password,
        role=user.role,
        created_by="admin"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_log = ActivityLog(
        user_name=new_user.full_name,
        user_role=new_user.role,
        action="User Created",
        target=f"{new_user.full_name} registered"
    )

    db.add(new_log)
    db.commit()

    return {
        "message": "Kullanıcı başarıyla oluşturuldu 🚀",
        "user_id": new_user.id,
        "full_name": new_user.full_name,
        "role": new_user.role
    }


# -----------------------------
# LOGIN
# -----------------------------
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # Sabit Admin Login
    if user.username == "mermean" and user.password == "6464":
        token = create_access_token(
            data={
                "sub": "mermean",
                "role": "admin"
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "admin"
        }

    # Teacher / Student Login
    db_user = db.query(User).filter(
        User.username == user.username
    ).first()

    if not db_user:
        return {
            "error": "Kullanıcı bulunamadı ❌"
        }

    if db_user.password != user.password:
        return {
            "error": "Şifre yanlış ❌"
        }

    token = create_access_token(
        data={
            "sub": db_user.username,
            "role": db_user.role
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role
    }

# -----------------------------
# CREATE PERMISSION
# -----------------------------
@app.post("/create-permission")
def create_permission(
    permission: PermissionCreate,
    db: Session = Depends(get_db)
):
    new_permission = Permission(
        role=permission.role,
        page_name=permission.page_name,
        can_create=permission.can_create,
        can_read=permission.can_read,
        can_update=permission.can_update,
        can_delete=permission.can_delete
    )

    db.add(new_permission)
    db.commit()
    db.refresh(new_permission)

    new_log = ActivityLog(
        user_name="Supervisor",
        user_role="admin",
        action="Permission Created",
        target=f"{permission.role} -> {permission.page_name}"
    )

    db.add(new_log)
    db.commit()

    send_to_queue({
        "role": permission.role,
        "page_name": permission.page_name
    })

    return {
        "message": "Permission oluşturuldu 🚀",
        "permission_id": new_permission.id
    }


# -----------------------------
# GET PERMISSIONS
# -----------------------------
@app.get("/permissions")
def get_permissions(db: Session = Depends(get_db)):
    permissions = db.query(Permission).all()

    result = []

    for p in permissions:
        result.append({
            "id": p.id,
            "role": p.role,
            "page_name": p.page_name,
            "can_create": p.can_create,
            "can_read": p.can_read,
            "can_update": p.can_update,
            "can_delete": p.can_delete
        })

    return result


# -----------------------------
# UPDATE PERMISSION
# -----------------------------
@app.put("/update-permission/{permission_id}")
def update_permission(
    permission_id: int,
    permission: PermissionCreate,
    db: Session = Depends(get_db)
):
    existing_permission = db.query(Permission).filter(
        Permission.id == permission_id
    ).first()

    if not existing_permission:
        return {
            "message": "Permission bulunamadı"
        }

    existing_permission.role = permission.role
    existing_permission.page_name = permission.page_name
    existing_permission.can_create = permission.can_create
    existing_permission.can_read = permission.can_read
    existing_permission.can_update = permission.can_update
    existing_permission.can_delete = permission.can_delete

    db.commit()

    new_log = ActivityLog(
        user_name="Supervisor",
        user_role="admin",
        action="Permission Updated",
        target=f"{permission.role} -> {permission.page_name}"
    )

    db.add(new_log)
    db.commit()

    return {
        "message": "Permission güncellendi 🚀"
    }


# -----------------------------
# DELETE PERMISSION
# -----------------------------
@app.delete("/delete-permission/{permission_id}")
def delete_permission(permission_id: int, db: Session = Depends(get_db)):
    permission = db.query(Permission).filter(
        Permission.id == permission_id
    ).first()

    if not permission:
        return {
            "message": "Permission bulunamadı"
        }

    old_role = permission.role
    old_page = permission.page_name

    db.delete(permission)
    db.commit()

    new_log = ActivityLog(
        user_name="Supervisor",
        user_role="admin",
        action="Permission Deleted",
        target=f"{old_role} -> {old_page}"
    )

    db.add(new_log)
    db.commit()

    return {
        "message": "Permission silindi 🚀"
    }


# -----------------------------
# ACTIVITY LOGS
# -----------------------------
@app.get("/activity-logs")
def get_activity_logs(db: Session = Depends(get_db)):
    logs = db.query(ActivityLog).order_by(
        ActivityLog.created_at.desc()
    ).all()

    result = []

    for log in logs:
        result.append({
            "id": log.id,
            "user_name": log.user_name,
            "user_role": log.user_role,
            "action": log.action,
            "target": log.target,
            "created_at": str(log.created_at)
        })

    return result


# -----------------------------
# REDIS TEST
# -----------------------------
@app.get("/redis-test")
def redis_test():
    redis_client.set(
        "test_key",
        "Redis çalışıyor kral 🚀"
    )

    value = redis_client.get("test_key")

    return {
        "message": value
    }


# -----------------------------
# WORD HTML TEST
# -----------------------------
@app.get("/get-html")
def get_html():
    return {
        "html": """
        <div>
            <h1>Word Dosyasından Gelen HTML 🚀</h1>
            <p>Bu içerik backend tarafından gönderildi kral.</p>
        </div>
        """
    }


# -----------------------------
# GET ALL USERS
# -----------------------------
@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    result = []

    for user in users:
        result.append({
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_by": user.created_by,
            "created_at": str(user.created_at)
        })

    return result
# -----------------------------
# GET STUDENTS
# -----------------------------
@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    students = db.query(User).filter(
        User.role == "student"
    ).all()

    result = []

    for student in students:
        result.append({
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "role": student.role
        })

    return result


# -----------------------------
# GET TEACHERS
# -----------------------------
@app.get("/teachers")
def get_teachers(db: Session = Depends(get_db)):
    teachers = db.query(User).filter(
        User.role == "teacher"
    ).all()

    result = []

    for teacher in teachers:
        result.append({
            "id": teacher.id,
            "full_name": teacher.full_name,
            "email": teacher.email,
            "role": teacher.role
        })

    return result

@app.post("/create-file-permission")
def create_file_permission(
    file_permission: FilePermissionCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(FilePermission).filter(
        FilePermission.role == file_permission.role
    ).first()

    if existing:
        existing.allowed_extensions = file_permission.allowed_extensions
        db.commit()

        return {
            "message": "Dosya yetkisi güncellendi 🚀"
        }

    new_permission = FilePermission(
        role=file_permission.role,
        allowed_extensions=file_permission.allowed_extensions
    )

    db.add(new_permission)
    db.commit()

    return {
        "message": "Dosya yetkisi oluşturuldu 🚀"
    }


@app.get("/file-permissions")
def get_file_permissions(db: Session = Depends(get_db)):
    permissions = db.query(FilePermission).all()

    result = []

    for p in permissions:
        result.append({
            "id": p.id,
            "role": p.role,
            "allowed_extensions": p.allowed_extensions
        })

    return result

@app.delete("/delete-user/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "message": "Kullanıcı bulunamadı ❌"
        }

    deleted_name = user.full_name

    db.delete(user)
    db.commit()

    new_log = ActivityLog(
        user_name="Admin",
        user_role="admin",
        action="User Deleted",
        target=f"{deleted_name} deleted"
    )

    db.add(new_log)
    db.commit()

    return {
        "message": "Kullanıcı başarıyla silindi 🚀"
    }

@app.put("/update-user/{user_id}")
def update_user(
    user_id: int,
    full_name: str,
    role: str,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        return {
            "message": "Kullanıcı bulunamadı ❌"
        }

    old_name = user.full_name

    user.full_name = full_name
    user.role = role

    db.commit()

    new_log = ActivityLog(
        user_name="Admin",
        user_role="admin",
        action="User Updated",
        target=f"{old_name} → {full_name} ({role})"
    )

    db.add(new_log)
    db.commit()

    return {
        "message": "Kullanıcı başarıyla güncellendi 🚀"
    }

@app.delete("/delete-student/{student_id}")
def delete_student(
    student_id: int,
    role: str,
    db: Session = Depends(get_db)
):

    allowed = check_permission(
    db,
    role,
    "students",
    "delete"
    )

    if not allowed:
        return {
            "message": "Bu işlem için yetkin yok."
    }

    student = db.query(User).filter(

        User.id == student_id,
        User.role == "student"
    ).first()

    if not student:
        return {
            "message": "Öğrenci bulunamadı ❌"
        }

    deleted_name = student.full_name

    db.delete(student)
    db.commit()

    new_log = ActivityLog(
        user_name="Teacher",
        user_role="teacher",
        action="Student Deleted",
        target=f"{deleted_name} deleted"
    )

    db.add(new_log)
    db.commit()

    return {
        "message": "Öğrenci başarıyla silindi 🚀"
    }

@app.put("/update-student/{student_id}")
def update_student(
    student_id: int,
    full_name: str,
    role: str,
    db: Session = Depends(get_db)
):
    allowed = check_permission(
        db,
        role,
        "students",
        "update"
    )

    if not allowed:
        return {
            "message": "Bu işlem için yetkin yok ❌"
        }

    student = db.query(User).filter(
        User.id == student_id,
        User.role == "student"
    ).first()

    if not student:
        return {
            "message": "Öğrenci bulunamadı ❌"
        }

    old_name = student.full_name

    student.full_name = full_name
    db.commit()

    new_log = ActivityLog(
        user_name="Teacher",
        user_role="teacher",
        action="Student Updated",
        target=f"{old_name} → {full_name}",
        details={
            "old_name": old_name,
            "new_name": full_name,
            "updated_by": "teacher",
            "module": "students",
            "operation": "update"
        }
    )

    db.add(new_log)
    db.commit()

    return {
        "message": "Öğrenci başarıyla güncellendi 🚀"
    }

@app.get("/files")
def get_files(db: Session = Depends(get_db)):
    files = db.query(UploadedFile).all()

    result = []

    for file in files:
        result.append({
            "id": file.id,
            "file_name": file.file_name,
            "file_path": file.file_path,
            "uploaded_by": file.uploaded_by,
            "uploader_role": file.uploader_role,
            "created_at": file.created_at
        })

    return result


@app.delete("/delete-file/{file_id}")
def delete_file(
    file_id: int,
    username: str,
    role: str,
    db: Session = Depends(get_db)
):
    file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id
    ).first()

    if not file:
        return {
            "message": "Dosya bulunamadı ❌"
        }

    # ROLE CHECK
    if role == "student":
        if file.uploaded_by != username:
            return {
                "message": "Bu dosyayı silme yetkin yok ❌"
            }

    elif role == "teacher":
        if (
            file.uploaded_by != username and
            file.uploader_role != "student"
        ):
            return {
                "message": "Bu dosyayı silme yetkin yok ❌"
            }

    # admin = full access

    deleted_name = file.file_name

    db.delete(file)
    db.commit()

    new_log = ActivityLog(
        user_name=username,
        user_role=role,
        action="File Deleted",
        target=f"{deleted_name} deleted"
    )

    db.add(new_log)
    db.commit()

    return {
        "message": "Dosya başarıyla silindi 🚀"
    }

@app.get("/file-content/{file_id}")
def get_file_content(
    file_id: int,
    username: str,
    role: str,
    db: Session = Depends(get_db)
):
    file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id
    ).first()

    if not file:
        return {
            "message": "Dosya bulunamadı ❌"
        }

    # ROLE CHECK
    if role == "student":
        if file.uploaded_by != username:
            return {
                "message": "Bu dosyayı görüntüleme yetkin yok ❌"
            }

    elif role == "teacher":
        if (
            file.uploaded_by != username and
            file.uploader_role != "student"
        ):
            return {
                "message": "Bu dosyayı görüntüleme yetkin yok ❌"
            }

    try:
        with open(file.file_path, "rb") as f:
            raw_content = f.read()

        content = raw_content.decode("utf-8", errors="ignore")

        lines = content.split("\n")
        html_content = ""

        for line in lines:
            html_content += f"<p>{line}</p>"

        content = html_content

        return {
            "file_name": file.file_name,
            "content": content
        }

    except Exception as e:
        return {
            "message": f"Hata oluştu: {str(e)}"
        }

@app.put("/update-file/{file_id}")
def update_file(
    file_id: int,
    content: str,
    username: str,
    role: str,
    db: Session = Depends(get_db)
):
    file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id
    ).first()

    if not file:
        return {
            "message": "Dosya bulunamadı ❌"
        }

    # ROLE CHECK
    if role == "student":
        if file.uploaded_by != username:
            return {
                "message": "Bu dosyayı düzenleme yetkin yok ❌"
            }

    elif role == "teacher":
        if (
            file.uploaded_by != username and
            file.uploader_role != "student"
        ):
            return {
                "message": "Bu dosyayı düzenleme yetkin yok ❌"
            }

    try:
        with open(file.file_path, "w", encoding="utf-8") as f:
            f.write(content)

        new_log = ActivityLog(
            user_name=username,
            user_role=role,
            action="File Updated",
            target=f"{file.file_name} updated"
        )

        db.add(new_log)
        db.commit()

        return {
            "message": "Dosya başarıyla güncellendi 🚀"
        }

    except Exception:
        return {
            "message": "Dosya güncellenemedi ❌"
        }

@app.get("/analyze-file/{file_id}")
def analyze_file(
    file_id: int,
    username: str,
    role: str,
    db: Session = Depends(get_db)
):
    file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id
    ).first()

    if not file:
        return {
            "message": "Dosya bulunamadı ❌"
        }

    # ROLE CHECK
    if role == "student":
        if file.uploaded_by != username:
            return {
                "message": "Bu dosyayı analiz etme yetkin yok ❌"
            }

    elif role == "teacher":
        if (
            file.uploaded_by != username and
            file.uploader_role != "student"
        ):
            return {
                "message": "Bu dosyayı analiz etme yetkin yok ❌"
            }

    try:
        with open(file.file_path, "rb") as f:
            raw_content = f.read()

        content = raw_content.decode("utf-8", errors="ignore")

        ai_result = ask_ai(content)

        new_log = ActivityLog(
            user_name=username,
            user_role=role,
            action="AI File Analysis",
            target=f"{file.file_name} analyzed"
        )

        db.add(new_log)
        db.commit()

        return {
            "file_name": file.file_name,
            "content": content,
            "ai_result": ai_result
        }

    except Exception:
        return {
            "message": "Bu dosya AI analizi için uygun değil ❌"
        }

def check_permission(
    db: Session,
    role: str,
    page_name: str,
    action: str
):
    permission = db.query(Permission).filter(
        Permission.role == role,
        Permission.page_name == page_name
    ).first()

    if not permission:
        return False

    if action == "create":
        return permission.can_create

    if action == "read":
        return permission.can_read

    if action == "update":
        return permission.can_update

    if action == "delete":
        return permission.can_delete

    return False