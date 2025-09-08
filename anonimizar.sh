#!/bin/bash
DB="/var/lib/sqlite/mydb.sqlite"

sqlite3 $DB "
UPDATE usuarios
SET cpf = '******' || substr(cpf, 7, 3),
    sobrenome = substr(sobrenome, 1, 1) || '*****',
    email = substr(email,1,1) || '*****' || substr(email, instr(email,'@'), length(email));
    celular = '*******' || substr(celular, -4);
"
