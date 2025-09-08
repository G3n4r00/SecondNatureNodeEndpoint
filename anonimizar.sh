#!/bin/bash

IMAGE="mysql-image"
DB="/var/lib/sqlite/mydb.sqlite"

docker run --rm -v $(dirname $DB):/db $IMAGE sqlite3 /db/$(basename $DB) -cmd "
UPDATE USERS
SET cpf = '******' || substr(cpf, 7, 3),
    sobrenome = substr(sobrenome, 1, 1) || '*****',
    email = substr(email,1,1) || '*****' || substr(email, instr(email,'@'), length(email)),
    celular = '*******' || substr(celular, -4);
"