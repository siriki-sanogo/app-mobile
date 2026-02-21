# Modèle Whisper pour le mode Hors-ligne

Pour que la reconnaissance vocale fonctionne sans internet, vous devez télécharger le modèle Whisper "Tiny" (quantized).

1. **Télécharger le fichier** :
   Allez sur HuggingFace (ggerganov/whisper.cpp) et téléchargez le fichier `ggml-tiny.bin`.
   Lien direct suggéré : [https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin](https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin)

2. **Placer le fichier** :
   Mettez le fichier téléchargé `ggml-tiny.bin` directement dans ce dossier :
   `d:\Pycharm\app-mobile\assets\`

3. **Re-builder l'application** :
   Une fois le fichier ajouté, vous devrez refaire un build natif (`eas build` ou `npx expo run:android`) pour qu'il soit embarqué.
