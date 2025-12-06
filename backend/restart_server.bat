@echo off
echo Backend serverni qayta ishga tushirish...
echo.
echo 1. Eski processni to'xtatish...
taskkill /F /IM python.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo 2. Virtual environment ni aktivlashtirish...
call dev\Scripts\activate.bat

echo 3. Server ni ishga tushirish...
echo.
echo Backend http://localhost:8000 da ishga tushdi!
echo CORS sozlamalari yangilandi - barcha originlarga ruxsat berildi
echo Admin kredensiallar: Bek / bek_1255
echo.
echo Server ishga tushmoqda...
echo.
python run.py
