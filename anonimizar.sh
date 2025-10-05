#!/bin/bash

#Caminhos
LOG_FILE="/var/log/my-app/xp_anonymization.log"
DB="/var/lib/sqlite/mydb.sqlite"
IMAGE="sqlite" 

# --- Funcao para o logging ---
# Adicione timestamp a cada mensagem de log
log_message() {
    echo "$(date '+%Y-%m-%dT%H:%M:%S%z') - $1" >> "$LOG_FILE"
}

log_message "Anonymization process started."

# Execute the Docker command
docker run --rm -v $(dirname $DB):/db $IMAGE sqlite3 /db/$(basename $DB) -cmd "
UPDATE USERS
SET cpf = '******' || substr(cpf, 7, 3),
    ultimo_nome = substr(ultimo_nome, 1, 1) || '*****',
    email = substr(email,1,1) || '*****' || substr(email, instr(email,'@'), length(email)),
    celular = '*******' || substr(celular, -4);
"

# Check the exit code of the last command ($?)
# If the command was successful (exit code 0), log success. Otherwise, log an error.
if [ $? -eq 0 ]; then
    log_message "Anonymization process finished successfully."
else
    log_message "ERROR: Anonymization process failed. Check Docker command."
fi