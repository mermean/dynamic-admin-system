Bu projede dinamik yetkilendirme ve yapay zeka destekli dosya yönetimi odaklı bir admin panel sistemi geliştirdim. Projenin amacı; farklı kullanıcı gruplarının tek bir merkezi yapı üzerinden yönetilmesi, yetkilerinin dinamik olarak atanabilmesi ve yüklenen dosyaların yapay zeka ile analiz edilmesidir.

Sistemde üç ana kullanıcı grubu bulunmaktadır: Admin, Teacher ve Student. Her rolün kendine özel paneli vardır ve kullanıcılar yalnızca kendilerine tanımlanan ekranlara erişebilmektedir. Admin tüm sistem üzerinde tam yetkiye sahiptir. Teacher kendi dosyaları ve öğrencilerin dosyaları üzerinde işlem yapabilirken, Student yalnızca kendi dosyalarını yönetebilmektedir.

Supervisor paneli üzerinden her role özel Create, Read, Update ve Delete yani CRUD yetkileri dinamik olarak atanabilmektedir. Örneğin öğretmenin öğrenci silme yetkisi kapatıldığında bu işlemi gerçekleştiremez. Aynı şekilde dosya görüntüleme, düzenleme ve yükleme işlemleri de yetki kontrolüne bağlıdır. Böylece sistem tamamen dinamik bir yetkilendirme yapısına sahip olmuştur.

Dosya yönetimi kısmında kullanıcılar txt, docx ve izin verilen diğer formatlarda dosya yükleyebilmektedir. Bu yüklemeler role göre kısıtlanabilmektedir. TXT dosyaları Ollama üzerinde çalışan Mistral modeli ile analiz edilmekte ve yapay zeka sonucu kullanıcıya gösterilmektedir. Word yani DOCX dosyaları ise backend tarafında HTML formatına dönüştürülmekte ve GrapesJS editörü ile browser üzerinde görsel olarak düzenlenebilmektedir. Bu özellik, verilen ödev maddelerindeki yapay zeka analizi ve Word dosyasının HTML’e dönüştürülmesi şartını doğrudan karşılamaktadır.

Frontend tarafında Next.js ve TailwindCSS, backend tarafında ise FastAPI kullanılmıştır. JWT tabanlı authentication sistemi ile giriş kontrolü sağlanmış, route protection sayesinde kullanıcıların URL üzerinden yetkisiz sayfalara erişmesi engellenmiştir.

Veritabanı olarak PostgreSQL, önbellekleme için Redis ve mesajlaşma yapısı için RabbitMQ kullanılmıştır. Tüm işlemler Docker üzerinde container yapısında çalışmaktadır.

Ayrıca kullanıcı oluşturma, silme, güncelleme, dosya işlemleri ve yetki değişiklikleri Activity Log sistemi ile kayıt altına alınmaktadır. PostgreSQL üzerinde Trigger, Procedure ve Function yapıları kullanılarak veritabanı seviyesinde otomatik loglama ve işlem kontrolü sağlanmıştır. JSONB kullanılarak activity log tablosunda dinamik veri saklama sistemi kurulmuştur.

Sonuç olarak bu proje; role dayalı erişim kontrolü, dinamik CRUD yetkilendirme, yapay zeka destekli dosya analizi, dosya dönüşüm sistemleri, veritabanı trigger-procedure-function yapıları ve Docker tabanlı microservice yaklaşımını bir araya getiren kapsamlı ve profesyonel bir yönetim sistemi haline gelmiştir.
