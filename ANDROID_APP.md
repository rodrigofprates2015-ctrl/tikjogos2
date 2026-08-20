# TikJogos para Android

O aplicativo usa Capacitor 8 e mantém o servidor, as salas e o banco de dados em `https://tikjogos.com.br`.

## Configuração

- Nome: TikJogos
- Application ID: `com.tikjogos.app`
- Android mínimo: Android 7 (API 24)
- Target/compile SDK: API 36
- Versão inicial: `1.0` (`versionCode 1`)

## Requisitos para gerar o APK

1. Instalar o Android Studio com o Android SDK 36.
2. Usar o JDK incluído no Android Studio.
3. Na raiz do projeto, instalar as dependências com `npm ci`.
4. Executar `npm run android:sync`.
5. Executar `npm run android:open`.
6. No Android Studio, usar **Build > Build APK(s)** para um APK de teste.

O APK de depuração será criado em `android/app/build/outputs/apk/debug/app-debug.apk`.

## Antes da Play Store

- Criar ícone e splash screen definitivos.
- Configurar login Google para o application ID Android.
- Substituir anúncios AdSense por AdMob.
- Criar e guardar com segurança a chave de assinatura do aplicativo.
- Testar retorno do segundo plano, teclado, áudio e reconexão das salas.
