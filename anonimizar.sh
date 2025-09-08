#!/bin/bash

IMAGE="nouchka/sqlite3"


DB="/var/lib/sqlite/mydb.sqlite"

SQL_CMD="
UPDATE usuarios
SET cpf = '******' || substr(cpf, 7, 3),
    sobrenome = substr(sobrenome, 1, 1) || '*****',
    email = substr(email,1,1) || '*****' || substr(email, instr(email,'@'), length(email));
    celular = '*******' || substr(celular, -4);
"

# Roda o container, monta o volume, executa o SQL e remove o container após execução
docker run --rm -v $(dirname $DB_PATH):/db $IMAGE sqlite3 /db/$(basename $DB_PATH) "$SQL_CMD"