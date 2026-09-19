# Odyssey Journal — Mağaza Metinleri (12 dil)

**Güncelleme:** 2026-09-19 — 12 dile genişletildi, özellik iddiaları koda karşı doğrulandı.
**Nasıl kullanılır:** Her dil bölümündeki alanları App Store Connect / Play Console'da aynı
adlı kutulara kopyalayın. Hangi dil kodunun seçileceği aşağıdaki tabloda. Adım adım mağaza işleri → `store_control.md`.

> **Eski metinden düzeltilenler:** "İnternet olmadan yazın ve kaydedin" çıkarıldı — uygulama
> çevrimdışıyken yalnızca daha önce yüklenmiş içeriği gösteriyor, yazma internet istiyor
> (Apple 2.3.1: gerçek olmayan özellik iddiası ret sebebi). Yaş derecelendirmesi "4+" değil:
> kullanıcı içeriği + mesajlaşma var → anketi dürüst doldurun (App Store muhtemelen 13+, Play "Teen").

---

## Ortak bilgiler (tüm diller)

| Alan | Değer |
|---|---|
| Uygulama adı (App Store Name / Play Title) | **Odyssey Journal** (tüm dillerde aynı, 15 karakter) |
| Kategori | App Store: Travel (ikincil: Social Networking) · Play: Travel & Local |
| Fiyat | Ücretsiz, reklamsız, uygulama içi satın alma yok |
| Support URL | `https://odysseyjournal.app/support` |
| Marketing URL | `https://odysseyjournal.app` |
| Privacy Policy | `https://odysseyjournal.app/privacy-policy` |
| Hesap silme (Play) | `https://odysseyjournal.app/delete-account` |
| E-posta | support@ · privacy@ · hello@ `odysseyjournal.app` |

### Alan sınırları
| Alan | Mağaza | Sınır |
|---|---|---|
| Subtitle | App Store | 30 karakter |
| Promotional Text | App Store | 170 karakter (inceleme gerektirmeden değiştirilebilir) |
| Keywords | App Store | 100 (virgülle, boşluksuz; ad ve alt başlıktaki kelimeleri tekrar etmeyin) |
| Description | App Store + Play (Full description) | 4000 karakter |
| Short description | Play | 80 karakter |
| What's New | App Store (Play: "Release notes", 500) | 4000 |

Hepsi bu sınırların içinde (script ile sayıldı; anahtar kelimeler UTF-8 bayt olarak da ≤ 100).

### Dil kodları
| Bölüm | App Store Connect dili | Play Console dili |
|---|---|---|
| EN | English (U.S.) — **birincil** | English (United States) – en-US — **varsayılan** |
| TR | Turkish | Turkish – tr-TR |
| ES | Spanish (Spain) + Spanish (Mexico) | Spanish (Spain) – es-ES + Spanish (Latin America) – es-419 |
| FR | French | French (France) – fr-FR |
| DE | German | German – de-DE |
| PT | Portuguese (Brazil) + Portuguese (Portugal) | Portuguese (Brazil) – pt-BR + Portuguese (Portugal) – pt-PT |
| IT | Italian | Italian – it-IT |
| RU | Russian | Russian – ru-RU |
| JA | Japanese | Japanese – ja-JP |
| KO | Korean | Korean (South Korea) – ko-KR |
| ZH | Chinese (Simplified) | Chinese (Simplified) – zh-CN |
| AR | Arabic | Arabic – ar |

PT metni Brezilya Portekizcesi (uygulamanın kendisi de öyle); Portekiz için de kullanılabilir.
ES metni tarafsız İspanyolca; iki bölgeye de aynen girilebilir.

### Ekran görüntüleri
Yalnız EN ve TR görsel seti var (`mockup_feature/`). Diğer dillerde mağazalar varsayılan dilin
(EN) görsellerini gösterir — ayrıca bir şey yüklemeniz gerekmez. İleride dile özel görsel
istenirse `scripts/store-assets/compose.js` başlıkları yerelde yeniden basabilir (fal maliyeti yok).

---

## EN — English

**Subtitle** (App Store)
```
Travel diary & photo stories
```

**Short description** (Play)
```
Turn your trips into photo stories, pin every place and follow fellow travelers.
```

**Promotional Text** (App Store)
```
Your travel journal with a passport-style profile, a map of every place you've been and stories from travelers around the world. Now in 12 languages.
```

**Keywords** (App Store)
```
travel,trip,diary,photo,memories,vacation,map,passport,explore,wanderlust,backpacking,itinerary
```

**Description** (App Store + Play full description)
```
Capture your journey. Share your story.

Odyssey Journal turns your travel photos into beautiful stories, in a design inspired by old notebooks, passports and boarding passes.

WRITE YOUR TRAVEL STORIES
• Add several photos to a post, each with its own caption
• Tag the place, pick the travel date and categories
• The weather of that day is saved with your memory

YOUR PASSPORT AND TRAVEL MAP
• A passport-style profile with a boarding pass of your stats: countries, kilometers, days
• A travel map that pins every place you have shared
• City and country names appear in your own language

DISCOVER NEW DESTINATIONS
• Popular and trending destinations
• Search for places and travelers
• Browse every post from a city, told by the people who went there

SAVE AND ORGANIZE
• Bookmark posts and sort them into collections

TRAVEL TOGETHER
• Follow travelers, like and comment on their posts
• Send direct messages to plan your next trip together
• Get notified about new likes, comments and followers

MADE FOR EVERYONE
• 12 languages: English, Turkish, Spanish, French, German, Portuguese, Italian, Russian, Japanese, Korean, Chinese and Arabic
• Light and dark theme
• No ads
• Report and block tools and clear community guidelines keep the community safe

Whether you are crossing continents or exploring your own city on a weekend, Odyssey Journal keeps your memories in one beautiful place.

Start your odyssey today.
```

**What's New**
```
Welcome to Odyssey Journal! In this first version:
• Travel posts with photos, captions, location and weather
• Passport-style profile and travel map
• Explore popular destinations
• Collections, follows, comments and direct messages
• 12 languages, light and dark theme
```

---

## TR — Türkçe

**Subtitle**
```
Seyahat günlüğü ve foto hikâye
```

**Short description**
```
Gezilerini foto hikâyelere dönüştür, her yeri işaretle, gezginleri takip et.
```

**Promotional Text**
```
Pasaport tarzı profilin, gittiğin her yeri gösteren haritan ve dünyanın dört bir yanından gezginlerin hikâyeleriyle seyahat günlüğün. Artık 12 dilde.
```

**Keywords**
```
seyahat,gezi,tatil,günlük,fotoğraf,anı,harita,pasaport,keşfet,rota,macera,gezgin,yolculuk
```

**Description**
```
Yolculuğunu kaydet. Hikâyeni paylaş.

Odyssey Journal, seyahat fotoğraflarını eski defterlerden, pasaportlardan ve uçuş kartlarından ilham alan bir tasarımla güzel hikâyelere dönüştürür.

SEYAHAT HİKÂYELERİNİ YAZ
• Bir gönderiye birden çok fotoğraf ekle, her birine ayrı açıklama yaz
• Yeri etiketle, seyahat tarihini ve kategorileri seç
• O günün hava durumu anınla birlikte kaydedilir

PASAPORTUN VE SEYAHAT HARİTAN
• Pasaport tarzı profil ve istatistiklerinin yer aldığı uçuş kartı: ülkeler, kilometreler, günler
• Paylaştığın her yeri işaretleyen seyahat haritası
• Şehir ve ülke adları kendi dilinde görünür

YENİ ROTALAR KEŞFET
• Popüler ve yükselen destinasyonlar
• Yerleri ve gezginleri ara
• Bir şehre ait tüm gönderileri, oraya gidenlerin gözünden oku

KAYDET VE DÜZENLE
• Gönderileri kaydet, koleksiyonlara ayır

BİRLİKTE GEZ
• Gezginleri takip et, gönderilerini beğen ve yorum yap
• Sonraki yolculuğu birlikte planlamak için mesaj gönder
• Yeni beğeni, yorum ve takipçilerden haberdar ol

HERKES İÇİN
• 12 dil: Türkçe, İngilizce, İspanyolca, Fransızca, Almanca, Portekizce, İtalyanca, Rusça, Japonca, Korece, Çince ve Arapça
• Açık ve koyu tema
• Reklam yok
• Şikâyet ve engelleme araçları ile açık topluluk kuralları topluluğu güvende tutar

İster kıtalar aş, ister hafta sonu kendi şehrini keşfet; Odyssey Journal anılarını tek ve güzel bir yerde saklar.

Yolculuğun bugün başlasın.
```

**What's New**
```
Odyssey Journal'a hoş geldin! İlk sürümde:
• Fotoğraf, açıklama, konum ve hava durumuyla seyahat gönderileri
• Pasaport tarzı profil ve seyahat haritası
• Popüler destinasyonları keşfet
• Koleksiyonlar, takip, yorum ve mesajlar
• 12 dil, açık ve koyu tema
```

---

## ES — Español

**Subtitle**
```
Diario de viaje e historias
```

**Short description**
```
Convierte viajes en historias con fotos, marca cada lugar y sigue a viajeros.
```

**Promotional Text**
```
Tu diario de viaje con un perfil tipo pasaporte, un mapa de todos los lugares que has visitado e historias de viajeros de todo el mundo. Ahora en 12 idiomas.
```

**Keywords**
```
viaje,viajes,diario,fotos,recuerdos,vacaciones,mapa,pasaporte,explorar,mochilero,ruta,aventura
```

**Description**
```
Registra tu viaje. Comparte tu historia.

Odyssey Journal convierte tus fotos de viaje en historias preciosas, con un diseño inspirado en cuadernos antiguos, pasaportes y tarjetas de embarque.

ESCRIBE TUS HISTORIAS DE VIAJE
• Añade varias fotos a una publicación, cada una con su propia descripción
• Etiqueta el lugar, elige la fecha del viaje y las categorías
• El tiempo que hizo ese día se guarda con tu recuerdo

TU PASAPORTE Y TU MAPA DE VIAJES
• Un perfil tipo pasaporte con una tarjeta de embarque de tus estadísticas: países, kilómetros, días
• Un mapa de viajes que marca cada lugar que has compartido
• Los nombres de ciudades y países aparecen en tu idioma

DESCUBRE NUEVOS DESTINOS
• Destinos populares y en tendencia
• Busca lugares y viajeros
• Explora todas las publicaciones de una ciudad, contadas por quienes estuvieron allí

GUARDA Y ORGANIZA
• Guarda publicaciones y ordénalas en colecciones

VIAJA EN COMPAÑÍA
• Sigue a viajeros, da me gusta y comenta sus publicaciones
• Envía mensajes directos para planear juntos el próximo viaje
• Recibe avisos de nuevos me gusta, comentarios y seguidores

PARA TODOS
• 12 idiomas: español, inglés, turco, francés, alemán, portugués, italiano, ruso, japonés, coreano, chino y árabe
• Tema claro y oscuro
• Sin anuncios
• Herramientas para denunciar y bloquear, y normas de la comunidad claras, mantienen la comunidad segura

Tanto si cruzas continentes como si exploras tu propia ciudad un fin de semana, Odyssey Journal guarda tus recuerdos en un solo lugar precioso.

Empieza hoy tu odisea.
```

**What's New**
```
¡Te damos la bienvenida a Odyssey Journal! En esta primera versión:
• Publicaciones de viaje con fotos, descripciones, ubicación y tiempo
• Perfil tipo pasaporte y mapa de viajes
• Explora destinos populares
• Colecciones, seguidores, comentarios y mensajes directos
• 12 idiomas, tema claro y oscuro
```

---

## FR — Français

**Subtitle**
```
Carnet de voyage et récits
```

**Short description**
```
Vos voyages en récits photo : épinglez chaque lieu, suivez d'autres voyageurs.
```

**Promotional Text**
```
Votre carnet de voyage, avec un profil façon passeport, une carte de tous les lieux visités et des récits de voyageurs du monde entier. Désormais en 12 langues.
```

**Keywords**
```
voyage,carnet,journal,photo,souvenirs,vacances,carte,passeport,explorer,routard,itinéraire
```

**Description**
```
Racontez votre voyage. Partagez votre histoire.

Odyssey Journal transforme vos photos de voyage en beaux récits, avec un design inspiré des vieux carnets, des passeports et des cartes d'embarquement.

ÉCRIVEZ VOS RÉCITS DE VOYAGE
• Ajoutez plusieurs photos à une publication, chacune avec sa légende
• Indiquez le lieu, choisissez la date du voyage et les catégories
• La météo du jour est enregistrée avec votre souvenir

VOTRE PASSEPORT ET VOTRE CARTE DE VOYAGE
• Un profil façon passeport, avec une carte d'embarquement de vos statistiques : pays, kilomètres, jours
• Une carte de voyage qui épingle chaque lieu partagé
• Les noms des villes et des pays s'affichent dans votre langue

DÉCOUVREZ DE NOUVELLES DESTINATIONS
• Destinations populaires et tendances
• Recherchez des lieux et des voyageurs
• Parcourez toutes les publications d'une ville, racontées par ceux qui y sont allés

ENREGISTREZ ET ORGANISEZ
• Enregistrez des publications et classez-les en collections

VOYAGEZ ENSEMBLE
• Suivez des voyageurs, aimez et commentez leurs publications
• Envoyez des messages privés pour préparer ensemble le prochain voyage
• Soyez averti des nouveaux j'aime, commentaires et abonnés

POUR TOUT LE MONDE
• 12 langues : français, anglais, turc, espagnol, allemand, portugais, italien, russe, japonais, coréen, chinois et arabe
• Thème clair et sombre
• Sans publicité
• Des outils de signalement et de blocage, et des règles de communauté claires, protègent la communauté

Que vous traversiez les continents ou exploriez votre ville le temps d'un week-end, Odyssey Journal réunit vos souvenirs en un seul et bel endroit.

Commencez votre odyssée dès aujourd'hui.
```

**What's New**
```
Bienvenue sur Odyssey Journal ! Dans cette première version :
• Publications de voyage avec photos, légendes, lieu et météo
• Profil façon passeport et carte de voyage
• Découverte des destinations populaires
• Collections, abonnements, commentaires et messages privés
• 12 langues, thème clair et sombre
```

---

## DE — Deutsch

**Subtitle**
```
Reisetagebuch & Fotostorys
```

**Short description**
```
Mach Reisen zu Fotogeschichten, markiere jeden Ort und folge anderen Reisenden.
```

**Promotional Text**
```
Dein Reisetagebuch mit einem Profil im Reisepass-Stil, einer Karte aller Orte, an denen du warst, und Geschichten von Reisenden aus aller Welt. Jetzt in 12 Sprachen.
```

**Keywords**
```
reise,reisen,tagebuch,fotos,erinnerungen,urlaub,karte,reisepass,entdecken,backpacking,route
```

**Description**
```
Halte deine Reise fest. Teile deine Geschichte.

Odyssey Journal macht aus deinen Reisefotos schöne Geschichten – im Design alter Notizbücher, Reisepässe und Bordkarten.

SCHREIBE DEINE REISEGESCHICHTEN
• Füge einem Beitrag mehrere Fotos hinzu, jedes mit eigener Bildunterschrift
• Markiere den Ort, wähle Reisedatum und Kategorien
• Das Wetter des Tages wird mit deiner Erinnerung gespeichert

DEIN REISEPASS UND DEINE REISEKARTE
• Ein Profil im Reisepass-Stil mit einer Bordkarte deiner Statistiken: Länder, Kilometer, Tage
• Eine Reisekarte, die jeden geteilten Ort markiert
• Städte- und Ländernamen erscheinen in deiner Sprache

ENTDECKE NEUE REISEZIELE
• Beliebte und angesagte Reiseziele
• Suche nach Orten und Reisenden
• Lies alle Beiträge zu einer Stadt, erzählt von denen, die dort waren

SPEICHERN UND ORDNEN
• Speichere Beiträge und sortiere sie in Sammlungen

GEMEINSAM REISEN
• Folge Reisenden, like und kommentiere ihre Beiträge
• Schreib Direktnachrichten und plant zusammen die nächste Reise
• Werde über neue Likes, Kommentare und Abonnenten benachrichtigt

FÜR ALLE
• 12 Sprachen: Deutsch, Englisch, Türkisch, Spanisch, Französisch, Portugiesisch, Italienisch, Russisch, Japanisch, Koreanisch, Chinesisch und Arabisch
• Helles und dunkles Design
• Keine Werbung
• Melde- und Blockierfunktionen sowie klare Community-Richtlinien halten die Community sicher

Ob du Kontinente durchquerst oder am Wochenende deine eigene Stadt erkundest – Odyssey Journal bewahrt deine Erinnerungen an einem schönen Ort.

Starte noch heute deine Odyssee.
```

**What's New**
```
Willkommen bei Odyssey Journal! In dieser ersten Version:
• Reisebeiträge mit Fotos, Bildunterschriften, Ort und Wetter
• Profil im Reisepass-Stil und Reisekarte
• Beliebte Reiseziele entdecken
• Sammlungen, Abonnenten, Kommentare und Direktnachrichten
• 12 Sprachen, helles und dunkles Design
```

---

## PT — Português (Brasil)

**Subtitle**
```
Diário de viagem e histórias
```

**Short description**
```
Transforme viagens em histórias com fotos, marque cada lugar e siga viajantes.
```

**Promotional Text**
```
Seu diário de viagem com um perfil estilo passaporte, um mapa de todos os lugares que você visitou e histórias de viajantes do mundo todo. Agora em 12 idiomas.
```

**Keywords**
```
viagem,viagens,diário,fotos,memórias,férias,mapa,passaporte,explorar,mochilão,roteiro
```

**Description**
```
Registre sua jornada. Compartilhe sua história.

O Odyssey Journal transforma suas fotos de viagem em belas histórias, com um design inspirado em cadernos antigos, passaportes e cartões de embarque.

ESCREVA SUAS HISTÓRIAS DE VIAGEM
• Adicione várias fotos a uma publicação, cada uma com sua própria legenda
• Marque o lugar, escolha a data da viagem e as categorias
• O clima daquele dia fica salvo junto com a sua memória

SEU PASSAPORTE E SEU MAPA DE VIAGEM
• Um perfil estilo passaporte com um cartão de embarque das suas estatísticas: países, quilômetros, dias
• Um mapa de viagem que marca cada lugar que você compartilhou
• Nomes de cidades e países aparecem no seu idioma

DESCUBRA NOVOS DESTINOS
• Destinos populares e em alta
• Pesquise lugares e viajantes
• Veja todas as publicações de uma cidade, contadas por quem esteve lá

SALVE E ORGANIZE
• Salve publicações e organize-as em coleções

VIAJE JUNTO
• Siga viajantes, curta e comente as publicações deles
• Envie mensagens diretas para planejar juntos a próxima viagem
• Receba avisos de novas curtidas, comentários e seguidores

PARA TODOS
• 12 idiomas: português, inglês, turco, espanhol, francês, alemão, italiano, russo, japonês, coreano, chinês e árabe
• Tema claro e escuro
• Sem anúncios
• Ferramentas de denúncia e bloqueio e diretrizes claras da comunidade mantêm a comunidade segura

Seja atravessando continentes ou explorando sua própria cidade no fim de semana, o Odyssey Journal guarda suas memórias em um só lugar, bonito.

Comece sua odisseia hoje.
```

**What's New**
```
Boas-vindas ao Odyssey Journal! Nesta primeira versão:
• Publicações de viagem com fotos, legendas, local e clima
• Perfil estilo passaporte e mapa de viagem
• Explore destinos populares
• Coleções, seguidores, comentários e mensagens diretas
• 12 idiomas, tema claro e escuro
```

---

## IT — Italiano

**Subtitle**
```
Diario di viaggio e foto
```

**Short description**
```
I tuoi viaggi in storie con foto: segna ogni luogo e segui altri viaggiatori.
```

**Promotional Text**
```
Il tuo diario di viaggio con un profilo in stile passaporto, una mappa di tutti i luoghi che hai visitato e storie di viaggiatori da tutto il mondo. Ora in 12 lingue.
```

**Keywords**
```
viaggio,viaggi,diario,foto,ricordi,vacanze,mappa,passaporto,esplorare,zaino,itinerario
```

**Description**
```
Racconta il tuo viaggio. Condividi la tua storia.

Odyssey Journal trasforma le tue foto di viaggio in storie bellissime, con un design ispirato ai vecchi taccuini, ai passaporti e alle carte d'imbarco.

SCRIVI LE TUE STORIE DI VIAGGIO
• Aggiungi più foto a un post, ognuna con la sua didascalia
• Indica il luogo, scegli la data del viaggio e le categorie
• Il meteo di quel giorno viene salvato insieme al tuo ricordo

IL TUO PASSAPORTO E LA TUA MAPPA DI VIAGGIO
• Un profilo in stile passaporto con una carta d'imbarco delle tue statistiche: paesi, chilometri, giorni
• Una mappa di viaggio che segna ogni luogo che hai condiviso
• I nomi di città e paesi compaiono nella tua lingua

SCOPRI NUOVE DESTINAZIONI
• Destinazioni popolari e di tendenza
• Cerca luoghi e viaggiatori
• Sfoglia tutti i post di una città, raccontati da chi ci è stato

SALVA E ORGANIZZA
• Salva i post e ordinali in collezioni

VIAGGIA INSIEME
• Segui altri viaggiatori, metti mi piace e commenta i loro post
• Invia messaggi diretti per organizzare insieme il prossimo viaggio
• Ricevi notifiche per nuovi mi piace, commenti e seguaci

PER TUTTI
• 12 lingue: italiano, inglese, turco, spagnolo, francese, tedesco, portoghese, russo, giapponese, coreano, cinese e arabo
• Tema chiaro e scuro
• Nessuna pubblicità
• Strumenti per segnalare e bloccare e linee guida chiare mantengono la community sicura

Che tu stia attraversando continenti o esplorando la tua città nel fine settimana, Odyssey Journal custodisce i tuoi ricordi in un unico, bellissimo posto.

Inizia oggi la tua odissea.
```

**What's New**
```
Benvenuto su Odyssey Journal! In questa prima versione:
• Post di viaggio con foto, didascalie, luogo e meteo
• Profilo in stile passaporto e mappa di viaggio
• Scopri le destinazioni popolari
• Collezioni, seguaci, commenti e messaggi diretti
• 12 lingue, tema chiaro e scuro
```

---

## RU — Русский

**Subtitle**
```
Дневник путешествий и фото
```

**Short description**
```
Фотоистории о поездках, карта ваших мест и подписки на путешественников.
```

**Promotional Text**
```
Ваш дневник путешествий: профиль в стиле паспорта, карта всех мест, где вы побывали, и истории путешественников со всего мира. Теперь на 12 языках.
```

**Keywords**
```
путешествия,отпуск,фото,карта,паспорт,туризм
```

**Description**
```
Сохраните своё путешествие. Поделитесь своей историей.

Odyssey Journal превращает ваши фотографии из поездок в красивые истории — в дизайне, вдохновлённом старыми блокнотами, паспортами и посадочными талонами.

ПИШИТЕ ИСТОРИИ О ПУТЕШЕСТВИЯХ
• Добавляйте в публикацию несколько фотографий, каждую со своей подписью
• Отмечайте место, выбирайте дату поездки и категории
• Погода того дня сохраняется вместе с воспоминанием

ВАШ ПАСПОРТ И КАРТА ПУТЕШЕСТВИЙ
• Профиль в стиле паспорта и посадочный талон с вашей статистикой: страны, километры, дни
• Карта путешествий, на которой отмечено каждое место, которым вы поделились
• Названия городов и стран отображаются на вашем языке

ОТКРЫВАЙТЕ НОВЫЕ НАПРАВЛЕНИЯ
• Популярные и набирающие популярность направления
• Поиск мест и путешественников
• Все публикации о городе — рассказы тех, кто там побывал

СОХРАНЯЙТЕ И УПОРЯДОЧИВАЙТЕ
• Сохраняйте публикации и распределяйте их по коллекциям

ПУТЕШЕСТВУЙТЕ ВМЕСТЕ
• Подписывайтесь на путешественников, ставьте лайки и комментируйте их публикации
• Пишите личные сообщения, чтобы вместе спланировать следующую поездку
• Получайте уведомления о новых лайках, комментариях и подписчиках

ДЛЯ ВСЕХ
• 12 языков: русский, английский, турецкий, испанский, французский, немецкий, португальский, итальянский, японский, корейский, китайский и арабский
• Светлая и тёмная тема
• Без рекламы
• Инструменты для жалоб и блокировки и понятные правила сообщества защищают сообщество

Пересекаете ли вы континенты или исследуете свой город на выходных — Odyssey Journal хранит ваши воспоминания в одном красивом месте.

Начните свою одиссею сегодня.
```

**What's New**
```
Добро пожаловать в Odyssey Journal! В первой версии:
• Публикации о путешествиях с фото, подписями, местом и погодой
• Профиль в стиле паспорта и карта путешествий
• Популярные направления
• Коллекции, подписки, комментарии и личные сообщения
• 12 языков, светлая и тёмная тема
```

---

## JA — 日本語

**Subtitle**
```
旅の日記と写真ストーリー
```

**Short description**
```
旅を写真ストーリーに。訪れた場所をマップに記録し、旅人をフォローしよう。
```

**Promotional Text**
```
パスポート風のプロフィール、訪れたすべての場所を示す旅行マップ、世界中の旅人のストーリー。あなたの旅の日記が12言語に対応しました。
```

**Keywords**
```
旅行,旅,日記,写真,思い出,地図,パスポート,観光,海外旅行
```

**Description**
```
旅を記録しよう。ストーリーをシェアしよう。

Odyssey Journal は、古いノートやパスポート、搭乗券から着想を得たデザインで、旅の写真を美しいストーリーに変えるアプリです。

旅のストーリーを書く
• 1つの投稿に複数の写真を追加し、それぞれにキャプションを付けられます
• 場所をタグ付けし、旅行日とカテゴリーを選べます
• その日の天気も思い出と一緒に保存されます

あなたのパスポートと旅行マップ
• パスポート風のプロフィールと、国・キロ数・日数をまとめた搭乗券
• シェアしたすべての場所をピンで示す旅行マップ
• 都市名や国名はあなたの言語で表示されます

新しい旅先を見つける
• 人気の旅先、話題の旅先
• 場所や旅人を検索
• 実際に訪れた人たちが綴った、ひとつの都市のすべての投稿

保存して整理する
• 投稿を保存して、コレクションに分けて整理

一緒に旅する
• 旅人をフォローして、投稿にいいねやコメント
• ダイレクトメッセージで次の旅を一緒に計画
• 新しいいいね、コメント、フォロワーを通知でお知らせ

すべての人のために
• 12言語対応：日本語、英語、トルコ語、スペイン語、フランス語、ドイツ語、ポルトガル語、イタリア語、ロシア語、韓国語、中国語、アラビア語
• ライトテーマとダークテーマ
• 広告なし
• 通報・ブロック機能と明確なコミュニティガイドラインで、安心して使えるコミュニティを守ります

大陸を越える旅でも、週末の街歩きでも、Odyssey Journal があなたの思い出をひとつの美しい場所にまとめます。

さあ、あなたのオデッセイを始めましょう。
```

**What's New**
```
Odyssey Journal へようこそ！最初のバージョンの内容：
• 写真・キャプション・場所・天気付きの旅の投稿
• パスポート風プロフィールと旅行マップ
• 人気の旅先を探索
• コレクション、フォロー、コメント、ダイレクトメッセージ
• 12言語対応、ライト／ダークテーマ
```

---

## KO — 한국어

**Subtitle**
```
여행 일기와 사진 스토리
```

**Short description**
```
여행을 사진 스토리로 남기고, 다녀온 곳을 지도에 표시하고, 여행자를 팔로우하세요.
```

**Promotional Text**
```
여권 스타일 프로필, 다녀온 모든 곳을 보여 주는 여행 지도, 전 세계 여행자들의 이야기. 나만의 여행 일기가 이제 12개 언어를 지원합니다.
```

**Keywords**
```
여행,일기,사진,추억,지도,여권,해외여행,여행기록
```

**Description**
```
여행을 기록하세요. 이야기를 나누세요.

Odyssey Journal은 오래된 노트, 여권, 탑승권에서 영감을 받은 디자인으로 여행 사진을 아름다운 이야기로 바꿔 줍니다.

여행 이야기를 쓰세요
• 게시물 하나에 여러 장의 사진을 올리고 사진마다 설명을 달 수 있습니다
• 장소를 태그하고 여행 날짜와 카테고리를 선택하세요
• 그날의 날씨도 추억과 함께 저장됩니다

나의 여권과 여행 지도
• 여권 스타일 프로필과 국가·킬로미터·일수를 담은 탑승권
• 공유한 모든 장소를 표시하는 여행 지도
• 도시와 국가 이름이 내 언어로 표시됩니다

새로운 여행지를 발견하세요
• 인기 여행지와 급상승 여행지
• 장소와 여행자 검색
• 직접 다녀온 사람들이 들려주는 한 도시의 모든 게시물

저장하고 정리하세요
• 게시물을 저장하고 컬렉션으로 정리하세요

함께 여행하세요
• 여행자를 팔로우하고 게시물에 좋아요와 댓글을 남기세요
• 다이렉트 메시지로 다음 여행을 함께 계획하세요
• 새로운 좋아요, 댓글, 팔로워 소식을 알림으로 받아 보세요

모두를 위해
• 12개 언어: 한국어, 영어, 터키어, 스페인어, 프랑스어, 독일어, 포르투갈어, 이탈리아어, 러시아어, 일본어, 중국어, 아랍어
• 라이트 테마와 다크 테마
• 광고 없음
• 신고·차단 기능과 명확한 커뮤니티 가이드라인으로 안전한 커뮤니티를 지킵니다

대륙을 건너는 여행이든 주말의 동네 탐방이든, Odyssey Journal이 당신의 추억을 아름다운 한 곳에 담아 둡니다.

오늘 당신의 오디세이를 시작하세요.
```

**What's New**
```
Odyssey Journal에 오신 것을 환영합니다! 첫 버전의 기능:
• 사진, 설명, 위치, 날씨가 담긴 여행 게시물
• 여권 스타일 프로필과 여행 지도
• 인기 여행지 탐색
• 컬렉션, 팔로우, 댓글, 다이렉트 메시지
• 12개 언어, 라이트·다크 테마
```

---

## ZH — 简体中文

**Subtitle**
```
旅行日记与照片故事
```

**Short description**
```
把旅行变成图文故事，在地图上标记去过的地方，关注其他旅行者。
```

**Promotional Text**
```
护照风格的个人主页、标记你去过每个地方的旅行地图，还有来自世界各地旅行者的故事。你的旅行日记现已支持 12 种语言。
```

**Keywords**
```
旅行,旅游,日记,照片,回忆,地图,护照,游记,攻略
```

**Description**
```
记录你的旅程，分享你的故事。

Odyssey Journal 以旧笔记本、护照和登机牌为设计灵感，把你的旅行照片变成精美的故事。

写下你的旅行故事
• 一篇帖子可以添加多张照片，每张都能配上说明
• 标记地点，选择旅行日期和分类
• 当天的天气会和回忆一起保存

你的护照和旅行地图
• 护照风格的个人主页，登机牌上展示你的统计：国家、公里数、天数
• 旅行地图标记出你分享过的每一个地方
• 城市和国家名称以你的语言显示

发现新的目的地
• 热门目的地和上升趋势目的地
• 搜索地点和旅行者
• 浏览某座城市的全部帖子，听去过的人讲述

保存与整理
• 收藏帖子，并整理到合集中

结伴同行
• 关注旅行者，为他们的帖子点赞和评论
• 发送私信，一起规划下一次旅行
• 收到新的点赞、评论和粉丝通知

为每个人而设计
• 支持 12 种语言：中文、英语、土耳其语、西班牙语、法语、德语、葡萄牙语、意大利语、俄语、日语、韩语和阿拉伯语
• 浅色和深色主题
• 无广告
• 举报和屏蔽工具以及清晰的社区准则，守护社区安全

无论是跨越大洲，还是周末漫游自己的城市，Odyssey Journal 都会把你的回忆珍藏在一个美好的地方。

今天就开启你的奥德赛吧。
```

**What's New**
```
欢迎来到 Odyssey Journal！首个版本包括：
• 带照片、说明、地点和天气的旅行帖子
• 护照风格个人主页和旅行地图
• 探索热门目的地
• 合集、关注、评论和私信
• 12 种语言，浅色和深色主题
```

---

## AR — العربية

**Subtitle**
```
مذكرات سفر وقصص مصورة
```

**Short description**
```
حوّل رحلاتك إلى قصص مصورة، وثبّت كل مكان على الخريطة، وتابع المسافرين.
```

**Promotional Text**
```
مذكرات سفرك مع ملف شخصي على طراز جواز السفر، وخريطة لكل مكان زرته، وقصص من مسافرين حول العالم. متوفر الآن بـ 12 لغة.
```

**Keywords**
```
سفر,رحلات,مذكرات,صور,ذكريات,خريطة,جواز,سياحة
```

**Description**
```
وثّق رحلتك. شارك قصتك.

يحوّل Odyssey Journal صور رحلاتك إلى قصص جميلة، بتصميم مستوحى من الدفاتر القديمة وجوازات السفر وبطاقات الصعود.

اكتب قصص رحلاتك
• أضف عدة صور إلى المنشور الواحد، ولكل صورة وصفها الخاص
• حدّد المكان، واختر تاريخ الرحلة والفئات
• يُحفظ طقس ذلك اليوم مع ذكرياتك

جواز سفرك وخريطة رحلاتك
• ملف شخصي على طراز جواز السفر، مع بطاقة صعود تعرض إحصاءاتك: الدول والكيلومترات والأيام
• خريطة سفر تثبّت كل مكان شاركته
• تظهر أسماء المدن والدول بلغتك

اكتشف وجهات جديدة
• الوجهات الشائعة والرائجة
• ابحث عن الأماكن والمسافرين
• تصفّح كل منشورات مدينة ما، كما يرويها من زاروها

احفظ ونظّم
• احفظ المنشورات ورتّبها في مجموعات

سافروا معًا
• تابع المسافرين، وأعجب بمنشوراتهم وعلّق عليها
• أرسل رسائل مباشرة لتخطيط رحلتكم القادمة معًا
• تلقَّ إشعارات بالإعجابات والتعليقات والمتابعين الجدد

للجميع
• 12 لغة: العربية والإنجليزية والتركية والإسبانية والفرنسية والألمانية والبرتغالية والإيطالية والروسية واليابانية والكورية والصينية
• مظهر فاتح وداكن
• بلا إعلانات
• أدوات الإبلاغ والحظر وإرشادات المجتمع الواضحة تحافظ على أمان المجتمع

سواء كنت تعبر القارات أو تستكشف مدينتك في عطلة نهاية الأسبوع، يحفظ Odyssey Journal ذكرياتك في مكان واحد جميل.

ابدأ رحلتك الملحمية اليوم.
```

**What's New**
```
مرحبًا بك في Odyssey Journal! في هذا الإصدار الأول:
• منشورات سفر مع الصور والأوصاف والموقع والطقس
• ملف شخصي على طراز جواز السفر وخريطة سفر
• استكشف الوجهات الشائعة
• المجموعات والمتابعة والتعليقات والرسائل المباشرة
• 12 لغة، ومظهر فاتح وداكن
```
