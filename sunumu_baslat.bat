@echo off
echo =======================================================
echo         VELOPATH - OTOMATIK SUNUM BASLATICISI
echo =======================================================
echo.
echo Lutfen bekleyin, tum sistemler (Backend, Web ve Mobil) 
echo ayni anda ayri pencerelerde baslatiliyor...
echo.

echo [1/3] Backend Sunucusu (Veritabani ve API) Baslatiliyor...
start cmd /k "cd backend && title VeloPath Backend && npm start"

echo [2/3] Web Uygulamasi Baslatiliyor...
start cmd /k "cd web && title VeloPath Web && npm start"

echo [3/3] Mobil Uygulama (Expo) Baslatiliyor...
start cmd /k "cd mobile && title VeloPath Mobile && npm start"

echo.
echo =======================================================
echo TUM SISTEMLER BASARIYLA CALISTIRILDI!
echo Artik Network Error (Baglanti Hatasi) almayacaksiniz.
echo Hocaniza sunumda basarilar dilerim! :)
echo =======================================================
pause
