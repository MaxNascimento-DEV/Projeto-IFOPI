@echo off
echo === ONG IFOPI DB Setup ===
echo 1. Creating DB...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ong_ifopi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

echo 2. Import schema...
mysql -u root -p ong_ifopi < config\complete_database.sql

echo 3. Test...
php config\test_db.php

echo.
echo Test logins:
echo ALUNO123 / aluno123 (numero)
echo prof@ong.com / prof123 (email)
echo admin@ong.com / admin123 (admin)
echo.
echo Next: npm run start
pause
