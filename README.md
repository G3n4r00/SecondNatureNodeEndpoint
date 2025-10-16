# SecondNature — Projeto de Servidor Linux com Docker, SQLite e Node.js

## 🧱 Visão Geral do Projeto

O ambiente foi implementado em **Debian 13** dentro de uma **máquina virtual local**, contendo:

- Servidor **NGINX** como proxy reverso.  
- **Docker** para isolamento do banco de dados SQLite.  
- **Node.js** como API para inserção e registro de dados.  
- **Cronjob** em Shell Script para anonimização de informações sensíveis (PII).  
- Diretórios de logs estruturados em `/var/log/SecondNatureLogs`.

---

## ⚙️ Estrutura do Sistema

### 📁 Estrutura de Diretórios

```bash
/srv/betware-api/
├── SecondNatureNodeEndpoint/
│   ├── index.js                # API principal em Node.js
│   ├── package.json
│   ├── anonimizar.sh           # Script de anonimização (cronjob)
│
/var/lib/sqlite/
│   └── mydb.sqlite             # Banco de dados persistido via volume Docker
│
/var/log/SecondNatureLogs/
    ├── xp_access.log
    ├── xp_operations.log
    ├── xp_anonymization.log
    └── api_process.log
```

O NGINX atua como proxy reverso, escutando na porta 80 e direcionando as requisições HTTP para o backend Node.js, hospedado localmente na porta 3000

Arquivo de configuração /etc/nginx/sites-available/default:

```bash
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm;

    server_name _;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## Banco de Dados via Docker e Volume Externo

O banco de dados SQLite é executado dentro de um container Docker baseado na imagem nouchka/sqlite3.
O arquivo físico do banco é montado via volume persistente para garantir acesso direto pelo host:

## API Node.js

A API foi desenvolvida com Node.js (Express) e é gerenciada via PM2, garantindo persistência e reinicialização automática.
O arquivo principal é index.js.

Endpoints Implementados
POST /api/users

Recebe dados de usuários e os insere no banco SQLite.
Além da inserção, um log operacional é gerado em xp_operations.log.

GET /api/users

Retorna todos os registros existentes na tabela USERS.

POST /api/logs

Recebe logs de acesso e operação enviados pela aplicação e os grava nos diretórios de log configurados:

/var/log/SecondNatureLogs/xp_access.log

/var/log/SecondNatureLogs/xp_operations.log

Logs do Servidor

O próprio backend registra eventos internos e erros em:

/var/log/SecondNatureLogs/api_process.log

## Automação via Cronjob e Script de Anonimização

O script anonimizar.sh é responsável por anonimizar dados sensíveis no banco SQLite, substituindo parcialmente campos como CPF, sobrenome, e-mail e telefone.

Script localizado em:

/srv/betware-api/SecondNatureNodeEndpoint/anonimizar.sh

Agendamento via Crontab:

Executado diariamente às 20h

### Função do Script:

Executa um container Docker SQLite temporário.

Atualiza dados PII diretamente no volume persistente.

Registra logs de execução em /var/log/SecondNatureLogs/xp_anonymization.log.

Indica sucesso ou falha do processo.

## Usuário e Permissões

Foi criado o usuário de serviço:

```bash
betwareservices
```

Esse usuário possui:

Permissão de escrita em /var/log/SecondNatureLogs.

Permissão de execução do script anonimizar.sh.

Controle da API Node.js via PM2.

As permissões garantem que apenas esse usuário possa manipular logs e scripts de automação, reforçando a segurança e integridade do sistema.

## Integrantes
<table>
  <tr>
    <th>Nome</th>
    <th>RM</th>
    <th>Turma</th>
  </tr>
  <tr>
    <td>Arthur Baldissera Claumann Marcos</td>
    <td>550219</td>
    <td>3ESPF</td>
  </tr>
  <tr>
    <td>Gabriel Genaro Dalaqua</td>
    <td>551986</td>
    <td>3ESPF</td>
  </tr>
  <tr>
    <td>Paloma Mirela dos Santos Rodrigues</td>
    <td>551321</td>
    <td>3ESPF</td>
  </tr>
  <tr>
    <td>Ricardo Ramos Vergani</td>
    <td>550166</td>
    <td>3ESPF</td>
  </tr>
  <tr>
    <td>Victor Kenzo Toma</td>
    <td>551649</td>
    <td>3ESPF</td>
  </tr>
</table>
