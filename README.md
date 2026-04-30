# Dynamic Admin System

Dynamic Admin System, role-based access control mantığıyla çalışan, yapay zeka destekli dosya yönetimi ve analiz özelliklerine sahip bir yönetim paneli uygulamasıdır. Sistem; Admin, Teacher ve Student kullanıcı rollerine sahiptir ve Supervisor paneli üzerinden dinamik yetkilendirme yapılabilmektedir.

## Özellikler

* Role-based access control (RBAC)
* Dinamik CRUD yetkilendirme (Supervisor paneli üzerinden)
* JWT Authentication ve route protection
* Dosya yükleme ve rol bazlı dosya kısıtlama
* TXT dosyaları için yapay zeka analizi (Ollama + Mistral)
* DOCX dosyalarının HTML formatına dönüştürülmesi
* GrapesJS ile görsel içerik düzenleme
* Activity log sistemi
* PostgreSQL, Redis ve RabbitMQ entegrasyonu
* Docker ile container tabanlı çalışma

## Kullanılan Teknolojiler

### Frontend

* Next.js
* React
* TailwindCSS
* GrapesJS

### Backend

* FastAPI
* SQLAlchemy

### Veritabanı ve Servisler

* PostgreSQL
* Redis
* RabbitMQ

### Diğer

* Docker / Docker Compose
* JWT Authentication
* Ollama (Mistral modeli)

## Kurulum

Aşağıdaki adımları takip ederek projeyi sıfırdan çalıştırabilirsiniz.

### 1. Repoyu klonlayın

```bash
git clone https://github.com/mermean/dynamic-admin-system.git
cd dynamic-admin-system
```

### 2. Ortam değişkenlerini ayarlayın

Backend klasörü içinde `.env` dosyası oluşturun ve aşağıdaki örneğe göre düzenleyin:

```env
DATABASE_URL=postgresql://USER:PASSWORD@postgres:5432/dynamic_admin_db
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
SECRET_KEY=your_secret_key
```

### 3. Docker ile sistemi başlatın

Proje root klasöründe aşağıdaki komutu çalıştırın:

```bash
docker compose up --build
```

Bu komut aşağıdaki servisleri başlatacaktır:

* frontend (Next.js)
* backend (FastAPI)
* PostgreSQL
* Redis
* RabbitMQ

### 4. Uygulamaya erişim

Uygulama başlatıldıktan sonra:

* Frontend: http://localhost:3000
* Backend API: http://localhost:8000

## Kullanım

### Giriş

Sisteme giriş yaptıktan sonra kullanıcı rolüne göre yönlendirme yapılır:

* Admin → Admin Panel
* Teacher → Teacher Panel
* Student → Student Panel

### Supervisor Panel

Supervisor paneli üzerinden:

* Rol bazlı yetkiler (Create, Read, Update, Delete) atanabilir
* Sayfa ve işlem bazlı erişim kontrolü yapılabilir
* Dosya yükleme izinleri kısıtlanabilir

### Dosya Yönetimi

* Kullanıcılar rolüne uygun dosyaları yükleyebilir
* TXT dosyaları yapay zeka ile analiz edilir
* DOCX dosyaları HTML'e dönüştürülerek düzenlenebilir
* GrapesJS editörü ile içerik görsel olarak düzenlenebilir

### Log Sistemi

Tüm işlemler Activity Log tablosunda kayıt altına alınır. Ayrıca PostgreSQL Trigger yapısı ile veritabanı seviyesinde de otomatik loglama yapılmaktadır.

## Veritabanı Özellikleri

* PostgreSQL kullanılmıştır
* Activity log tablosunda JSONB alanı ile dinamik veri saklanmaktadır
* Trigger, Procedure ve Function yapıları entegre edilmiştir

## Notlar

* `uploaded_files` klasörü versiyon kontrolüne dahil edilmemelidir
* `.env` dosyası GitHub’a yüklenmemelidir
* Ollama servisinin sistemde çalışıyor olması gerekmektedir (AI analiz için)
