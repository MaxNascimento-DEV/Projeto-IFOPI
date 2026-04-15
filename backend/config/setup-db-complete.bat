@echo off
echo === ONG IFOPI DB Setup ===
echo 1. Creating DB...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ong_ifopi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

echo 2. Import schema...
mysql -u root -p ong_ifopi < complete_database.sql

echo 3. Test...
php test_db.php

echo.
echo Test logins:
echo ALUNO123 / aluno123
echo prof@ong.com / prof123
echo admin@ong.com / admin123
pause
