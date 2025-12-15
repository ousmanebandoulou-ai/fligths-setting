# Application de Suivi des Appareils d'Hélicoptère

Application web complète pour la gestion et le suivi des appareils d'hélicoptère, développée avec HTML, CSS et JavaScript.

## 🚁 Fonctionnalités

### Gestion des Appareils
- Suivi de 8 appareils (5 disponibles, 3 indisponibles)
- **Appareils disponibles** : 6W-HTB, 6W-HTC, 6W-SHT, 6W-HCA, 6W-SHY
- **Appareils indisponibles** : 6W-HCD, 6W-SHZ, 6W-SHU
- Enregistrement des heures de vol totales
- Suivi du carburant restant
- Statut disponible/indisponible
- Gestion des prochaines maintenances (date et heures)

### Réserves de Vols
- Planification des vols à l'avance
- Gestion des réservations avec statuts
- Conversion automatique en vols réels

### Temps de Vol
- Enregistrement des vols effectués
- Calcul automatique de la durée
- Mise à jour automatique des heures totales

### Maintenance
- Types de maintenance avec périodicité
- Manuels de maintenance par appareil
- Suivi des versions et dates de publication

### Tâches de Maintenance
- Création et suivi des tâches
- Association avec manuels de maintenance
- Attribution de techniciens multiples
- Documents associés

### Techniciens
- Gestion complète des techniciens
- Qualifications et matricules
- Vue par appareil

### Émargements
- Signature des techniciens après chaque tâche
- Enregistrement des heures de travail
- Traçabilité complète

## 🛠️ Technologies

- **HTML5** - Structure de l'application
- **CSS3** - Design moderne et responsive
- **JavaScript** - Logique métier et interactions
- **LocalStorage** - Persistance des données

## 📦 Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/VOTRE_USERNAME/helicoptere-suivi.git
```

2. Ouvrez `index.html` dans votre navigateur web

Aucune installation supplémentaire n'est requise !

## 🚀 Utilisation

1. **Ajouter les techniciens** - Section Techniciens
2. **Vérifier les appareils** - Section Appareils (8 appareils pré-configurés)
3. **Définir les types de maintenance** - Section Maintenance (5 types pré-configurés)
4. **Ajouter les manuels** - Section Maintenance > Manuels (5 manuels pré-configurés)
5. **Mettre les tâches** - Section Tâches
6. **Enregistrer les vols** - Section Temps de Vol
7. **Planifier les réservations** - Section Réserves de Vols
8. **Émarger les techniciens** - Section Émargements

## 📋 Structure du Projet

```
helicoptere-suivi/
├── index.html      # Structure HTML principale
├── styles.css      # Styles et design
├── script.js       # Logique JavaScript
├── .gitignore     # Fichiers ignorés par Git
└── README.md       # Documentation
```

## 💾 Stockage des Données

Toutes les données sont stockées localement dans le navigateur via `localStorage`. Les données persistent entre les sessions.

## 📝 Notes

- L'application fonctionne entièrement côté client
- Aucune connexion Internet requise après le chargement initial
- Compatible avec tous les navigateurs modernes
- Design responsive pour mobile et tablette

## 👨‍💻 Développement

Application développée pour le suivi complet des opérations de maintenance et de vol des hélicoptères.

## 📄 Licence

Ce projet est libre d'utilisation.

