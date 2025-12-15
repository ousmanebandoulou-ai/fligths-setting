# Instructions pour mettre à jour sur GitHub

## Commandes Git à exécuter

### 1. Vérifier l'état du dépôt
```bash
git status
```

### 2. Ajouter tous les fichiers modifiés
```bash
git add .
```

Ou ajouter spécifiquement les fichiers modifiés :
```bash
git add script.js README.md CHANGELOG.md
```

### 3. Créer un commit avec un message descriptif
```bash
git commit -m "Mise à jour des immatriculations des appareils

- Appareils disponibles : 6W-HTB, 6W-HTC, 6W-SHT, 6W-HCA, 6W-SHY
- Appareils indisponibles : 6W-HCD, 6W-SHZ, 6W-SHU
- Documentation mise à jour dans README.md
- Ajout du CHANGELOG.md"
```

### 4. Pousser les changements sur GitHub
```bash
git push origin main
```

Ou si votre branche s'appelle `master` :
```bash
git push origin master
```

## Si le dépôt n'existe pas encore sur GitHub

### 1. Créer un nouveau dépôt sur GitHub
- Allez sur https://github.com/new
- Créez un nouveau dépôt (par exemple : `flights-setting` ou `helicoptere-suivi`)

### 2. Initialiser Git localement (si pas déjà fait)
```bash
git init
```

### 3. Ajouter tous les fichiers
```bash
git add .
```

### 4. Créer le premier commit
```bash
git commit -m "Initial commit - Application de suivi des appareils d'hélicoptère"
```

### 5. Ajouter le remote GitHub
```bash
git remote add origin https://github.com/VOTRE_USERNAME/NOM_DU_DEPOT.git
```

### 6. Pousser sur GitHub
```bash
git branch -M main
git push -u origin main
```

## Fichiers modifiés dans cette mise à jour

- `script.js` : Mise à jour des immatriculations dans `initializeDefaultData()`
- `README.md` : Ajout de la liste des immatriculations par statut
- `CHANGELOG.md` : Nouveau fichier pour suivre les versions
- `GITHUB_UPDATE.md` : Ce fichier d'instructions

## Notes importantes

- Assurez-vous d'avoir configuré Git avec votre nom et email :
  ```bash
  git config --global user.name "Votre Nom"
  git config --global user.email "votre.email@example.com"
  ```

- Si vous avez des données de test dans localStorage, elles ne seront pas affectées par cette mise à jour
- Les nouveaux utilisateurs verront automatiquement les nouvelles immatriculations lors de la première utilisation
