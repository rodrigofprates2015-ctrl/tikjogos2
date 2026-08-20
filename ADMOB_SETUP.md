# AdMob no aplicativo Android

O aplicativo está preparado para mostrar um anúncio intersticial nativo nos
intervalos entre partidas. A versão web continua usando AdSense e nunca carrega
o SDK do AdMob.

## Estado de desenvolvimento

- App ID Android de teste: `ca-app-pub-3940256099942544~3347511713`
- Intersticial Android de teste: `ca-app-pub-3940256099942544/1033173712`
- Pacote do aplicativo: `com.tikjogos.app`

Esses IDs são amostras oficiais do Google e devem permanecer enquanto a conta
AdMob estiver em verificação e durante testes locais.

## Troca para produção

Depois que o AdMob aprovar a conta:

1. Cadastre o aplicativo Android com o pacote `com.tikjogos.app`.
2. Crie uma unidade de anúncio do tipo **Intersticial**.
3. Troque `admob_app_id` em
   `android/app/src/main/res/values/strings.xml` pelo App ID fornecido pelo
   AdMob.
4. Configure `VITE_ADMOB_INTERSTITIAL_ID` no ambiente de build com o ID da
   unidade intersticial.
5. Gere uma nova versão do app e valide primeiro com o dispositivo marcado
   como dispositivo de teste no AdMob.

Nunca teste clicando em anúncios reais.
