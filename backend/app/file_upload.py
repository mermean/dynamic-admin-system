from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from docx import Document
import tempfile
import os

from .ai_service import ask_ai
from .database import SessionLocal
from .models import FilePermission, UploadedFile, Permission

router = APIRouter()


UPLOAD_FOLDER = "uploaded_files"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/upload")
async def upload_file(
    role: str,
    username: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_extension = file.filename.split(".")[-1].lower()
    permission_check = db.query(Permission).filter(
        Permission.role == role,
        Permission.page_name == "files"
    ).first()

    if not permission_check:
        return {
            "message": "Dosya yükleme yetkisi tanımlanmamış ❌"
        }

    if not permission_check.can_create:
        return {
            "message": "Dosya yükleme yetkin yok ❌"
        }

    # Role bazlı permission kontrolü
    permission = db.query(FilePermission).filter(
        FilePermission.role == role
    ).first()

    if not permission:
        return {
            "error": f"{role} için dosya yetkisi tanımlanmamış "
        }

    allowed_extensions = [
        ext.strip().lower()
        for ext in permission.allowed_extensions.split(",")
    ]

    if file_extension not in allowed_extensions:
        return {
            "error": f"{role} sadece şu dosyaları yükleyebilir: {permission.allowed_extensions}"
        }

    # Dosyayı fiziksel olarak kaydet
    file_path = os.path.join(
        UPLOAD_FOLDER,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # DB'ye kayıt at
    new_file = UploadedFile(
        file_name=file.filename,
        file_path=file_path,
        uploaded_by=username,
        uploader_role=role
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    # TXT → AI Analizi
    if file_extension == "txt":
        decoded_content = content.decode("utf-8")

        ai_response = ask_ai(decoded_content)

        return {
            "message": "TXT dosyası Ollama AI ile analiz edildi ",
            "content": decoded_content,
            "ai_response": ai_response
        }

    # DOCX → HTML dönüşüm
    if file_extension == "docx":
        temp = tempfile.NamedTemporaryFile(delete=False)
        temp.write(content)
        temp.close()

        doc = Document(temp.name)

        html_content = ""

        for para in doc.paragraphs:
            html_content += f"<p>{para.text}</p>"

        return {
            "message": "Word dosyası HTML'e dönüştürüldü ",
            "html": html_content,
            "file_id": new_file.id
        }

    return {
        "message": f"{file.filename} başarıyla yüklendi ",
        "file_id": new_file.id
    }