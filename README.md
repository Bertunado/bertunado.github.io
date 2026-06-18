# Currículo Online — Bernardo Viana

Site de currículo em página única, bilíngue (PT/EN), feito em HTML puro — sem dependências, sem build. Substitui o portfólio antigo do PythonAnywhere, com todo o conteúdo migrado para cá.

## Estrutura

- `index.html` — o site inteiro (conteúdo, estilos e scripts)
- `img/` — foto de perfil e prints dos projetos

## Como ver localmente

Basta abrir o arquivo `index.html` no navegador (clique duplo).

## Como publicar de graça no GitHub Pages

1. Crie um repositório novo chamado **`bertunado.github.io`** (esse nome especial faz o site ficar na raiz do endereço).
2. Envie o `index.html` **e a pasta `img/`** para o repositório (dá para arrastar e soltar pela própria página do GitHub).
3. Em 1–2 minutos o site estará no ar em `https://bertunado.github.io`.

## Recursos do site

- **Botão PT/EN** — alterna o idioma do site inteiro; a escolha fica salva no navegador do visitante.
- **Botão "Baixar PDF"** — usa a impressão do navegador (Ctrl+P) com estilo limpo de fundo branco, para gerar um PDF do currículo.
- **Chatbot com IA** — o widget flutuante chama o backend Flask + Gemini que continua rodando no PythonAnywhere (`/chat`).
- **Formulário de contato** — envia pelo Formspree (funciona em site estático, sem backend).

## ⚠️ Atenção: chatbot e CORS

O chatbot chama `https://bernardoviana.pythonanywhere.com/chat`. Quando o site novo estiver em outro domínio (ex.: `bertunado.github.io`), o navegador só permite essa chamada se o backend Flask liberar o novo domínio via CORS. No app Flask do PythonAnywhere:

```python
from flask_cors import CORS
CORS(app, origins=["https://bertunado.github.io"])
```

(`pip install flask-cors` se ainda não tiver.) Sem isso, o chatbot mostra a mensagem de erro de conexão.

## Como editar o conteúdo

Todo texto aparece **duas vezes** no `index.html`: uma com `class="pt"` (português) e outra com `class="en"` (inglês). Edite os dois.

## Domínio próprio (opcional, depois)

Se um dia quiser um endereço tipo `seunome.com.br`:
1. Registre no [registro.br](https://registro.br) (~R$40/ano).
2. No repositório do GitHub: Settings → Pages → Custom domain.
3. Aponte o DNS do domínio para o GitHub Pages (instruções aparecem na própria tela).
4. Lembre de incluir o novo domínio no CORS do chatbot também.
