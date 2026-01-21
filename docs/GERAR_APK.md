# 📱 Como Gerar o APK do CheckShip Mobile

O projeto foi configurado com **Capacitor**, o que permite transformar a aplicação web em um app Android nativo.

## Pré-requisitos

Para gerar o APK final, você precisa do **Android Studio** instalado no seu computador.
[Baixar Android Studio](https://developer.android.com/studio)

## Passo a Passo Simplificado

### 1. Preparar o projeto

Sempre que você fizer alterações no código, execute este comando **na pasta raiz do projeto**:

```bash
npm run mobile:build
```

### 2. Abrir o Android Studio

Execute o comando abaixo (na raiz) para abrir o projeto nativo no Android Studio automaticamente:

```bash
npm run mobile:open
```

> **Dica:** Se o comando falhar, abra o Android Studio manualmente e selecione a pasta `c:\Projetinhos\CheckShip\mobile-client\android`.

### 3. Dentro do Android Studio (Passo a Passo Visual)

1. **Aguarde o Carregamento:**
   Assim que abrir, olhe para a barra inferior direita. Você verá uma barra de progresso (Gradle Sync). **Espere terminar completamente** antes de fazer qualquer coisa. Isso pode demorar alguns minutos na primeira vez.

   > Se aparecer um aviso pedindo para atualizar o plugin do Android Gradle, você pode clicar em "Update" ou "Ignorar".

2. **Gerar o APK (Debug):**
   - No menu superior, clique em **Build**.
   - Selecione **Build Bundle(s) / APK(s)**.
   - Clique em **Build APK(s)**.

3. **Locate APK:**
   - Quando terminar, aparecerá uma notificação no canto inferior direito dizendo "Build APK(s): APK(s) generated successfully".
   - Clique na palavra azul **locate** nessa notificação.
   - Uma pasta abrirá contendo o arquivo `app-debug.apk`. 
   - Transfira esse arquivo para seu celular e instale!

### 4. Como testar no Emulador (Sem celular)

Se você não tem um Android físico, pode criar um virtual:

1.  No Android Studio, olhe no canto superior direito e procure um ícone de celular com o robozinho (Device Manager). Ou vá em **Tools > Device Manager**.
2.  Clique no botão **+** (Create Virtual Device).
3.  Escolha um modelo (ex: **Pixel 5**) e clique em Next.
4.  Escolha uma versão do Android (Sistem Image). Talvez precise clicar no botão de download ao lado do nome (ex: **R** ou **API 30**). Clique em Next.
5.  Clique em **Finish**.
6.  Agora, para rodar seu App:
    - Na barra superior do Android Studio, selecione o emulador que criou no dropdown de dispositivos.
    - Clique no botão **Play (Run 'app')** (ícone de triângulo verde).
    - O emulador vai abrir e seu app será instalado e aberto automaticamente.

---

## 🚀 Resolvendo Problemas Comuns

- **"npm error Missing script"**: Certifique-se de estar rodando os comandos na pasta raiz `c:\Projetinhos\CheckShip`.
- **Botão Build desabilitado**: É sinal de que o Gradle Sync ainda não terminou. Aguarde a barra de progresso inferior sumir.

---

## 🔄 Resumo do Fluxo de Trabalho

| Comando | Para que serve? | Quando usar? |
| :--- | :--- | :--- |
| `npm run mobile` | Roda o site no navegador. | **No dia a dia**. Use para programar e testar lógica/visual rapidamente no PC. |
| `npm run mobile:build` | Prepara os arquivos para o Android. | **Quando quiser testar no celular/emulador**. Rode isso após finalizar suas alterações. |
| `npm run mobile:open` | Abre o Android Studio. | Apenas se o programa estiver fechado. |

**Exemplo de Rotina:**
1. Programe usando `npm run mobile` e testando no Chrome.
2. Terminou uma funcionalidade? Pare o terminal (`Ctrl+C`).
3. Rode `npm run mobile:build`.
4. Vá no Android Studio e clique no **Play** (▶) ou **Build APK** para ver no emulador/celular.
