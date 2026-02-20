# 🚀 Guia de Deploy - IluminaCity (Prefeitura de Palmital)

Este guia descreve como realizar a instalação e atualização do sistema **IluminaCity** no servidor de produção (Proxmox / Linux).

O sistema utiliza **Docker** para garantir que tudo funcione de forma isolada e segura.

## 📋 Pré-requisitos

O servidor Linux deve ter instalado:
1.  **Docker** e **Docker Compose**
    - [Como instalar no Ubuntu/Debian](https://docs.docker.com/engine/install/ubuntu/)
    - não sei qual é o linux que você está usando, ent coloquei um aleatório
    
2.  **Git**
    - `sudo apt update && sudo apt install git`

## 🛠️ Instalação (Primeira Vez)

1.  **Clone o repositório** na pasta desejada (ex: `/opt/iluminacity`):
    ```bash
    cd /opt
    git clone https://github.com/CAFFD/ilumina-bd.git iluminacity
    cd iluminacity
    ```

2.  **Configure o arquivo de ambiente**:
    ```bash
    cp .env.example .env
    nano .env
    ```
    > **⚠️ Importante:** Altere as senhas no arquivo `.env` para garantir a segurança.

3.  **Dê permissão de execução ao script de deploy**:
    ```bash
    chmod +x deploy.sh
    ```

4.  **Execute o Deploy**:
    ```bash
    ./deploy.sh
    ```

Este comando irá:
- Baixar as imagens necessárias.
- Subir o Banco de Dados, API e Frontend.
- Criar as tabelas no banco de dados.

## 🔄 Atualização (Rotina)

Sempre que houver uma nova versão do sistema, basta rodar o script novamente:

```bash
cd /opt/iluminacity
./deploy.sh
```

O script cuidará de tudo: baixar o código novo, reconstruir o sistema e aplicar atualizações no banco de dados.

## 🔍 Verificando o Status

Para ver se tudo está rodando:
```bash
docker compose ps
```

Se precisar ver os logs (erros):
```bash
docker compose logs -f
```

## 🌐 Acesso ao Sistema

- **Sistema Web (Cidadão/Gestão):** `http://IP-DO-SERVIDOR:8080`
- **API (Backend):** `http://IP-DO-SERVIDOR:3333`
- **Admin do Banco:** `http://IP-DO-SERVIDOR:8081`

---
