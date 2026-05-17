# Código do projeto

[Código do front-end](../src/front) -- repositório do código do front-end

[Código do back-end](../src/back)  -- repositório do código do back-end

## Como rodar localmente

Use o comando abaixo na raiz do projeto:

```powershell
.\src\dev.ps1
```
```
terminal linux 
sudo pwsh -File ./src/dev.ps1 
```

O script sobe o MySQL com Docker Compose, inicia o frontend em `http://localhost:5173` e inicia o backend em `http://localhost:8080`.