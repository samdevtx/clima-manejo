# Guia de Contribuição

Obrigado por contribuir com o Clima para Manejo! Para manter nosso padrão ouro, siga este guia.

## 1. Padrões de Código

### Git Commits
Adotamos **Conventional Commits**. Seus commits devem seguir o formato:
- `feat: nova funcionalidade`
- `fix: correção de bug`
- `docs: documentação`
- `chore: tarefas de build/config`

*Exemplo:* `feat(backend): add redis cache support`

> **Nota:** O Husky validará sua mensagem automaticamente. Commits fora do padrão serão rejeitados.

### Linting & Formatting
- **Frontend:** ESLint + Prettier (rodado via `npm run lint`).
- **Backend:** PEP8 (rodado via `flake8` no CI).

## 2. Ambiente de Desenvolvimento

### Pré-requisitos
- Docker & Docker Compose
- Node.js 20+ (para rodar scripts de qualidade)

### Como rodar
```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env

# 2. Instale dependências locais (para hooks do git)
cd frontend && npm install && cd ..

# 3. Suba o ambiente
docker compose up --build
```

## 3. Testes
Antes de abrir um PR, garanta que os testes passam:

### Backend
```bash
# Rodar via Docker (recomendado)
docker compose exec backend pytest
```

### Frontend
```bash
cd frontend
npm test
```

## 4. Fluxo de Pull Request
1. Crie uma branch a partir da `main`: `git checkout -b feat/minha-feature`.
2. Implemente suas mudanças.
3. Commit seguindo o padrão.
4. Push e abra o PR.
5. O CI (GitHub Actions) rodará automaticamente:
   - Testes Backend/Frontend
   - Lint
   - Security Scan (Trivy)
   - Build Docker

Se o CI falhar, corrija antes de pedir review.
