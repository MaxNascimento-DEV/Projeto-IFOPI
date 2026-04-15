@echo off
echo [1/3] Criando database ong_ifopi...
mysql -u root -punibrainter4 -e "CREATE DATABASE IF NOT EXISTS ong_ifopi;"

echo [2/3] Importando complete_database.sql...
mysql -u root -punibrainter4 ong_ifopi < config/complete_database.sql

echo [3/3] Importando update_admin_schema.sql...
mysql -u root -punibrainter4 ong_ifopi < config/update_admin_schema.sql

echo [TEST] Testando conexao...
php test_db.php

echo ✅ DB pronto! Users: ALUNO123/aluno123, prof@ong.com/prof123
pause
