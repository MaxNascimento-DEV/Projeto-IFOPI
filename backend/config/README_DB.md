# Setup Banco de Dados

## 1. Criar DB
```
mysql -u root -pongifopiinter42026 -e "CREATE DATABASE ong_ifopi;"
```

## 2. Importar Schema
```
mysql -u root -pongifopiinter42026 ong_ifopi < complete_database.sql
mysql -u root -pongifopiinter42026 ong_ifopi < update_admin_schema.sql
```

## 3. Testar
```
cd backend
php test_db.php
```

**Senha:** ongifopiinter42026 (adicione manualmente ao backend/.env se vazio)

**Test Users:**
- Aluno: ALUNO123/aluno123
- Prof: prof@ong.com/prof123
- Admin: ongifopiadm@admin.com.br/unibrainter4adm
