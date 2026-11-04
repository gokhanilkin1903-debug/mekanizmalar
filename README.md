# Mekanizmalar

Makine mekanizmalarını 30 saniyede anlatan dikey (1080×1920) 3B animasyon serisi. 31 bölüm var; her bölümün Türkçe ve İngilizce sürümü, ElevenLabs "George" sesiyle seslendirilmiş olarak hazır.

## Klasörler

| Klasör | İçerik |
|---|---|
| `videolar/` | 31 bölümün seslendirmeli videoları: `mekanizma_XX_tr.mp4`, `mekanizma_XX_en.mp4` |
| `motor/` | Animasyon motoru (`engine.js`), bölüm kodları (`eps/epXX.js`), render betikleri |
| `seslendirme/` | Seslendirme metinleri (TR/EN) ve ses üretme/karıştırma betikleri |
| `paylasim/` | Her bölüm için hazır sosyal medya açıklamaları ve etiketler |
| `sayfalar/` | İzleme ve indirme sayfalarının HTML'i |

## Bölümler

| # | Mekanizma | # | Mekanizma |
|---|---|---|---|
| 01 | Çift taraflı taç dişli | 17 | Hızlı geri dönüş |
| 02 | Planet dişli sistemi | 18 | Tusi çifti |
| 03 | Krank-biyel (motor) | 19 | Oldham kavraması |
| 04 | Cenevre mekanizması | 20 | Pantograf |
| 05 | İskoç boyunduruğu | 21 | Eğik plakalı pompa |
| 06 | Sonsuz vida | 22 | Stirling motoru |
| 07 | Kremayer ve pinyon | 23 | Çapa eşapmanı (saat) |
| 08 | Kam ve izleyici | 24 | CVT şanzıman |
| 09 | Kardan mafsalı | 25 | Peaucellier–Lipkin bağlantısı |
| 10 | Cırcır mekanizması | 26 | Sikloid redüktör |
| 11 | Dört çubuk mekanizması | 27 | Harmonik redüktör |
| 12 | Diferansiyel | 28 | Jansen bacağı |
| 13 | Zincir ve dişli | 29 | Diz mafsalı (pres) |
| 14 | Wankel motor | 30 | Ackermann direksiyon |
| 15 | Vidalı mil | 31 | Rulman |
| 16 | Dişli dizisi (27:1) | | |

## Yeni bölüm üretmek

Gerekenler: Node.js, Playwright + Chromium, ffmpeg, Python 3.

1. Kurulum:

   ```bash
   cd motor && npm install
   ```

2. Sayfaları sunmak için `motor/` klasöründe yerel bir sunucu başlatın (betikler 8765 portunu bekler):

   ```bash
   python3 -m http.server 8765 --bind 127.0.0.1
   ```

3. Yeni bir mekanizma için `motor/eps/epXX.js` dosyası yazın. Mevcut bölümler örnek olarak kullanılabilir. Her bölüm şunları tanımlar: `text` (TR/EN yazılar), `kin(t)` (kinematik), `build` (3B model), `update`, `labels`, `counters`.

4. Önizleme (6 kare, `prev/XX/strip.png`):

   ```bash
   ./preview.sh XX tr "2,7,12,19.6,25,30"
   ```

5. Tam render ve MP4 (yarıda kesilirse kaldığı yerden devam eder; çıktı `cikti/` klasörüne yazılır):

   ```bash
   ./uret.sh "XX"
   ```

Bölüm 01 eski formatta yazıldı (`motor/bolum01.html`, 36 saniye); diğerleri ortak motoru kullanır (31 saniye).

## Seslendirme

- `seslendirme/scripts*.py`: sahnelere hizalanmış metinler. Çalıştırınca her bölüm için `epXX_tr.json` / `epXX_en.json` oluşturur.
- `gen.py`: ElevenLabs ile satır satır ses üretir. API anahtarı `ELEVENLABS_API_KEY` ortam değişkeninden okunur; koda yazılmaz.

  ```bash
  python3 gen.py <voice_id> epXX_tr epXX_tr.json tr
  ```

- `mix.py`: sesleri sahnelere yerleştirip videoya ekler.
- `synth_coqui.py`: ücretsiz alternatif (Coqui TTS, Türkçe model). Sesi daha robotiktir.

Not: Ücretsiz ElevenLabs planında ticari kullanım hakkı yoktur. Para kazanan bir kanal için ücretli plan gerekir.
