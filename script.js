// Gestion du stockage local
const Storage = {
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },
    set: (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    }
};

// Clés de stockage
const STORAGE_KEYS = {
    appareils: 'helicoptere_appareils',
    vols: 'helicoptere_vols',
    reserves: 'helicoptere_reserves',
    maintenanceTypes: 'helicoptere_maintenance_types',
    manuels: 'helicoptere_manuels',
    taches: 'helicoptere_taches',
    techniciens: 'helicoptere_techniciens',
    emargements: 'helicoptere_emargements'
};

// Gestion des onglets
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    // Désactiver tous les onglets
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Activer l'onglet sélectionné
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Recharger les données
    loadData();
}

// Gestion des modals
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    if (modalId === 'modal-appareil') {
        document.getElementById('form-appareil').reset();
        document.getElementById('appareil-id').value = '';
    } else if (modalId === 'modal-vol') {
        document.getElementById('form-vol').reset();
        document.getElementById('vol-id').value = '';
        populateAppareilsSelect('vol-appareil', true); // Seulement les appareils disponibles
        document.getElementById('vol-date').valueAsDate = new Date();
    } else if (modalId === 'modal-maintenance-type') {
        document.getElementById('form-maintenance-type').reset();
        document.getElementById('maintenance-type-id').value = '';
    } else if (modalId === 'modal-manuel') {
        document.getElementById('form-manuel').reset();
        document.getElementById('manuel-id').value = '';
        populateAppareilsSelect('manuel-appareils', false);
        document.getElementById('manuel-date-publication').valueAsDate = new Date();
    } else if (modalId === 'modal-tache') {
        document.getElementById('form-tache').reset();
        document.getElementById('tache-id').value = '';
        populateAppareilsSelect('tache-appareil');
        populateMaintenanceTypesSelect('tache-maintenance-type');
        populateManuelsSelect('tache-manuel');
        populateTechniciensSelect('tache-techniciens', true);
        document.getElementById('tache-date').valueAsDate = new Date();
        
        // Ajouter un listener pour filtrer les manuels selon l'appareil sélectionné
        const appareilSelect = document.getElementById('tache-appareil');
        appareilSelect.removeEventListener('change', filterManuelsByAppareil);
        appareilSelect.addEventListener('change', filterManuelsByAppareil);
    } else if (modalId === 'modal-technicien') {
        document.getElementById('form-technicien').reset();
        document.getElementById('technicien-id').value = '';
    } else if (modalId === 'modal-emargement') {
        document.getElementById('form-emargement').reset();
        document.getElementById('emargement-id').value = '';
        populateTachesSelect('emargement-tache');
        populateTechniciensSelect('emargement-technicien');
        document.getElementById('emargement-date').valueAsDate = new Date();
    } else if (modalId === 'modal-reserve') {
        document.getElementById('form-reserve').reset();
        document.getElementById('reserve-id').value = '';
        populateAppareilsSelect('reserve-appareil', true); // Seulement les appareils disponibles
        document.getElementById('reserve-date').valueAsDate = new Date();
        document.getElementById('btn-convertir-vol').style.display = 'none';
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Fonctions utilitaires
function populateAppareilsSelect(selectId, onlyAvailable = false) {
    const select = document.getElementById(selectId);
    let appareils = Storage.get(STORAGE_KEYS.appareils);
    
    // Filtrer uniquement les appareils disponibles pour les vols
    if (onlyAvailable) {
        appareils = appareils.filter(app => app.statut === 'disponible');
    }
    
    select.innerHTML = '<option value="">Sélectionner un appareil</option>';
    appareils.forEach(app => {
        const option = document.createElement('option');
        const statutLabel = app.statut === 'disponible' ? '✓' : '✗';
        option.value = app.id;
        option.textContent = `${app.type} - ${app.immatriculation} (${app.heuresTotal}h) [${statutLabel}]`;
        select.appendChild(option);
    });
}

function populateMaintenanceTypesSelect(selectId) {
    const select = document.getElementById(selectId);
    const types = Storage.get(STORAGE_KEYS.maintenanceTypes);
    select.innerHTML = '<option value="">Sélectionner un type</option>';
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = `${type.nom} (${type.periodicite}h)`;
        select.appendChild(option);
    });
}

function populateManuelsSelect(selectId, appareilId = null) {
    const select = document.getElementById(selectId);
    const manuels = Storage.get(STORAGE_KEYS.manuels);
    const currentValue = select.value; // Sauvegarder la valeur actuelle
    select.innerHTML = '<option value="">Sélectionner un manuel</option>';
    
    // Filtrer les manuels par appareil si un appareil est spécifié
    let manuelsFiltres = manuels;
    if (appareilId) {
        manuelsFiltres = manuels.filter(m => m.appareilsIds && m.appareilsIds.includes(appareilId));
    }
    
    manuelsFiltres.forEach(manuel => {
        const option = document.createElement('option');
        option.value = manuel.id;
        option.textContent = `${manuel.reference} - ${manuel.titre} (${manuel.version})`;
        select.appendChild(option);
    });
    
    // Restaurer la valeur si elle existe toujours
    if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
        select.value = currentValue;
    }
}

function filterManuelsByAppareil() {
    const appareilId = document.getElementById('tache-appareil').value;
    populateManuelsSelect('tache-manuel', appareilId);
}

function populateTechniciensSelect(selectId, multiple = false) {
    const select = document.getElementById(selectId);
    if (multiple) {
        select.setAttribute('multiple', 'multiple');
    }
    const techniciens = Storage.get(STORAGE_KEYS.techniciens);
    select.innerHTML = '<option value="">Sélectionner un technicien</option>';
    techniciens.forEach(tech => {
        const option = document.createElement('option');
        option.value = tech.id;
        option.textContent = `${tech.prenom} ${tech.nom} (${tech.matricule})`;
        select.appendChild(option);
    });
}

function populateTachesSelect(selectId) {
    const select = document.getElementById(selectId);
    const taches = Storage.get(STORAGE_KEYS.taches);
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    select.innerHTML = '<option value="">Sélectionner une tâche</option>';
    taches.forEach(tache => {
        const appareil = appareils.find(a => a.id === tache.appareilId);
        const option = document.createElement('option');
        option.value = tache.id;
        option.textContent = `${tache.date} - ${appareil ? appareil.immatriculation : 'N/A'} - ${tache.description.substring(0, 30)}...`;
        select.appendChild(option);
    });
}

function getTechnicienName(technicienId) {
    const techniciens = Storage.get(STORAGE_KEYS.techniciens);
    const tech = techniciens.find(t => t.id === technicienId);
    return tech ? `${tech.prenom} ${tech.nom}` : 'Inconnu';
}

function getAppareilInfo(appareilId) {
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    return appareils.find(a => a.id === appareilId);
}

// Gestion des Appareils
document.getElementById('form-appareil').addEventListener('submit', (e) => {
    e.preventDefault();
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const id = document.getElementById('appareil-id').value;
    const appareil = {
        id: id || Date.now().toString(),
        type: document.getElementById('appareil-type').value,
        modele: document.getElementById('appareil-modele').value,
        immatriculation: document.getElementById('appareil-immatriculation').value,
        heuresTotal: parseFloat(document.getElementById('appareil-heures').value),
        statut: document.getElementById('appareil-statut').value
    };
    
    if (id) {
        const index = appareils.findIndex(a => a.id === id);
        appareils[index] = appareil;
    } else {
        appareils.push(appareil);
    }
    
    Storage.set(STORAGE_KEYS.appareils, appareils);
    closeModal('modal-appareil');
    loadData();
});

function deleteAppareil(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet appareil ?')) {
        const appareils = Storage.get(STORAGE_KEYS.appareils);
        Storage.set(STORAGE_KEYS.appareils, appareils.filter(a => a.id !== id));
        loadData();
    }
}

function editAppareil(id) {
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const appareil = appareils.find(a => a.id === id);
    if (appareil) {
        document.getElementById('appareil-id').value = appareil.id;
        document.getElementById('appareil-type').value = appareil.type;
        document.getElementById('appareil-modele').value = appareil.modele;
        document.getElementById('appareil-immatriculation').value = appareil.immatriculation;
        document.getElementById('appareil-heures').value = appareil.heuresTotal;
        document.getElementById('appareil-statut').value = appareil.statut || 'disponible';
        openModal('modal-appareil');
    }
}

// Gestion des Vols
document.getElementById('form-vol').addEventListener('submit', (e) => {
    e.preventDefault();
    const vols = Storage.get(STORAGE_KEYS.vols);
    const id = document.getElementById('vol-id').value;
    const heuresDebut = parseFloat(document.getElementById('vol-heures-debut').value);
    const heuresFin = parseFloat(document.getElementById('vol-heures-fin').value);
    const duree = heuresFin - heuresDebut;
    
    if (duree <= 0) {
        alert('Les heures de fin doivent être supérieures aux heures de début !');
        return;
    }
    
    const vol = {
        id: id || Date.now().toString(),
        date: document.getElementById('vol-date').value,
        appareilId: document.getElementById('vol-appareil').value,
        heuresDebut: heuresDebut,
        heuresFin: heuresFin,
        duree: duree,
        pilote: document.getElementById('vol-pilote').value
    };
    
    if (id) {
        const index = vols.findIndex(v => v.id === id);
        vols[index] = vol;
    } else {
        vols.push(vol);
        // Mettre à jour les heures totales de l'appareil
        const appareils = Storage.get(STORAGE_KEYS.appareils);
        const appareil = appareils.find(a => a.id === vol.appareilId);
        if (appareil) {
            appareil.heuresTotal = heuresFin;
            Storage.set(STORAGE_KEYS.appareils, appareils);
        }
    }
    
    Storage.set(STORAGE_KEYS.vols, vols);
    closeModal('modal-vol');
    loadData();
});

function deleteVol(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce vol ?')) {
        const vols = Storage.get(STORAGE_KEYS.vols);
        Storage.set(STORAGE_KEYS.vols, vols.filter(v => v.id !== id));
        loadData();
    }
}

// Gestion des Réserves de Vols
document.getElementById('form-reserve').addEventListener('submit', (e) => {
    e.preventDefault();
    const reserves = Storage.get(STORAGE_KEYS.reserves);
    const id = document.getElementById('reserve-id').value;
    
    const heureDebut = document.getElementById('reserve-heure-debut').value;
    const heureFin = document.getElementById('reserve-heure-fin').value;
    
    if (heureFin <= heureDebut) {
        alert('L\'heure de fin doit être supérieure à l\'heure de début !');
        return;
    }
    
    const reserve = {
        id: id || Date.now().toString(),
        date: document.getElementById('reserve-date').value,
        heureDebut: heureDebut,
        heureFin: heureFin,
        appareilId: document.getElementById('reserve-appareil').value,
        pilote: document.getElementById('reserve-pilote').value,
        typeVol: document.getElementById('reserve-type-vol').value,
        destination: document.getElementById('reserve-destination').value,
        statut: document.getElementById('reserve-statut').value,
        remarques: document.getElementById('reserve-remarques').value
    };
    
    if (id) {
        const index = reserves.findIndex(r => r.id === id);
        reserves[index] = reserve;
    } else {
        reserves.push(reserve);
    }
    
    Storage.set(STORAGE_KEYS.reserves, reserves);
    closeModal('modal-reserve');
    loadData();
});

function deleteReserve(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
        const reserves = Storage.get(STORAGE_KEYS.reserves);
        Storage.set(STORAGE_KEYS.reserves, reserves.filter(r => r.id !== id));
        loadData();
    }
}

function editReserve(id) {
    const reserves = Storage.get(STORAGE_KEYS.reserves);
    const reserve = reserves.find(r => r.id === id);
    if (reserve) {
        document.getElementById('reserve-id').value = reserve.id;
        document.getElementById('reserve-date').value = reserve.date;
        document.getElementById('reserve-heure-debut').value = reserve.heureDebut;
        document.getElementById('reserve-heure-fin').value = reserve.heureFin;
        document.getElementById('reserve-pilote').value = reserve.pilote;
        document.getElementById('reserve-type-vol').value = reserve.typeVol;
        document.getElementById('reserve-destination').value = reserve.destination || '';
        document.getElementById('reserve-statut').value = reserve.statut;
        document.getElementById('reserve-remarques').value = reserve.remarques || '';
        
        populateAppareilsSelect('reserve-appareil', true);
        setTimeout(() => {
            document.getElementById('reserve-appareil').value = reserve.appareilId;
            // Afficher le bouton convertir si la réservation est terminée
            if (reserve.statut === 'terminee') {
                document.getElementById('btn-convertir-vol').style.display = 'inline-block';
            } else {
                document.getElementById('btn-convertir-vol').style.display = 'none';
            }
        }, 100);
        
        openModal('modal-reserve');
    }
}

function convertirReserveEnVol() {
    const reserveId = document.getElementById('reserve-id').value;
    if (!reserveId) {
        alert('Aucune réservation sélectionnée');
        return;
    }
    
    const reserves = Storage.get(STORAGE_KEYS.reserves);
    const reserve = reserves.find(r => r.id === reserveId);
    if (!reserve) {
        alert('Réservation introuvable');
        return;
    }
    
    // Demander les heures de vol réelles
    const heuresDebut = prompt('Heures de vol au début (ex: 1250.5):', '');
    const heuresFin = prompt('Heures de vol à la fin (ex: 1252.3):', '');
    
    if (!heuresDebut || !heuresFin) {
        return;
    }
    
    const heuresDebutNum = parseFloat(heuresDebut);
    const heuresFinNum = parseFloat(heuresFin);
    
    if (isNaN(heuresDebutNum) || isNaN(heuresFinNum) || heuresFinNum <= heuresDebutNum) {
        alert('Les heures de vol doivent être valides et la fin supérieure au début !');
        return;
    }
    
    // Créer le vol réel
    const vols = Storage.get(STORAGE_KEYS.vols);
    const vol = {
        id: Date.now().toString(),
        date: reserve.date,
        appareilId: reserve.appareilId,
        heuresDebut: heuresDebutNum,
        heuresFin: heuresFinNum,
        duree: heuresFinNum - heuresDebutNum,
        pilote: reserve.pilote
    };
    
    vols.push(vol);
    Storage.set(STORAGE_KEYS.vols, vols);
    
    // Mettre à jour les heures totales de l'appareil
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const appareil = appareils.find(a => a.id === reserve.appareilId);
    if (appareil) {
        appareil.heuresTotal = heuresFinNum;
        Storage.set(STORAGE_KEYS.appareils, appareils);
    }
    
    // Marquer la réservation comme convertie
    reserve.statut = 'terminee';
    reserve.convertieEnVol = true;
    Storage.set(STORAGE_KEYS.reserves, reserves);
    
    alert('Réservation convertie en vol avec succès !');
    closeModal('modal-reserve');
    loadData();
    switchTab('vols');
}

// Gestion des Types de Maintenance
document.getElementById('form-maintenance-type').addEventListener('submit', (e) => {
    e.preventDefault();
    const types = Storage.get(STORAGE_KEYS.maintenanceTypes);
    const id = document.getElementById('maintenance-type-id').value;
    const type = {
        id: id || Date.now().toString(),
        nom: document.getElementById('maintenance-type-nom').value,
        description: document.getElementById('maintenance-type-description').value,
        periodicite: parseFloat(document.getElementById('maintenance-type-periodicite').value)
    };
    
    if (id) {
        const index = types.findIndex(t => t.id === id);
        types[index] = type;
    } else {
        types.push(type);
    }
    
    Storage.set(STORAGE_KEYS.maintenanceTypes, types);
    closeModal('modal-maintenance-type');
    loadData();
});

function deleteMaintenanceType(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de maintenance ?')) {
        const types = Storage.get(STORAGE_KEYS.maintenanceTypes);
        Storage.set(STORAGE_KEYS.maintenanceTypes, types.filter(t => t.id !== id));
        loadData();
    }
}

// Gestion des Manuels de Maintenance
document.getElementById('form-manuel').addEventListener('submit', (e) => {
    e.preventDefault();
    const manuels = Storage.get(STORAGE_KEYS.manuels);
    const id = document.getElementById('manuel-id').value;
    const appareilsIds = Array.from(document.getElementById('manuel-appareils').selectedOptions).map(o => o.value);
    
    const manuel = {
        id: id || Date.now().toString(),
        reference: document.getElementById('manuel-reference').value,
        titre: document.getElementById('manuel-titre').value,
        version: document.getElementById('manuel-version').value,
        datePublication: document.getElementById('manuel-date-publication').value,
        appareilsIds: appareilsIds,
        description: document.getElementById('manuel-description').value || ''
    };
    
    if (id) {
        const index = manuels.findIndex(m => m.id === id);
        manuels[index] = manuel;
    } else {
        manuels.push(manuel);
    }
    
    Storage.set(STORAGE_KEYS.manuels, manuels);
    closeModal('modal-manuel');
    loadData();
});

function deleteManuel(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce manuel ?')) {
        const manuels = Storage.get(STORAGE_KEYS.manuels);
        Storage.set(STORAGE_KEYS.manuels, manuels.filter(m => m.id !== id));
        loadData();
    }
}

function editManuel(id) {
    const manuels = Storage.get(STORAGE_KEYS.manuels);
    const manuel = manuels.find(m => m.id === id);
    if (manuel) {
        document.getElementById('manuel-id').value = manuel.id;
        document.getElementById('manuel-reference').value = manuel.reference;
        document.getElementById('manuel-titre').value = manuel.titre;
        document.getElementById('manuel-version').value = manuel.version;
        document.getElementById('manuel-date-publication').value = manuel.datePublication;
        document.getElementById('manuel-description').value = manuel.description || '';
        
        populateAppareilsSelect('manuel-appareils', false);
        setTimeout(() => {
            const select = document.getElementById('manuel-appareils');
            Array.from(select.options).forEach(option => {
                if (manuel.appareilsIds && manuel.appareilsIds.includes(option.value)) {
                    option.selected = true;
                }
            });
        }, 100);
        
        openModal('modal-manuel');
    }
}

// Gestion des Tâches
document.getElementById('form-tache').addEventListener('submit', (e) => {
    e.preventDefault();
    const taches = Storage.get(STORAGE_KEYS.taches);
    const id = document.getElementById('tache-id').value;
    const techniciensIds = Array.from(document.getElementById('tache-techniciens').selectedOptions).map(o => o.value);
    const documents = document.getElementById('tache-documents').value
        .split(',')
        .map(d => d.trim())
        .filter(d => d);
    
    const tache = {
        id: id || Date.now().toString(),
        date: document.getElementById('tache-date').value,
        appareilId: document.getElementById('tache-appareil').value,
        maintenanceTypeId: document.getElementById('tache-maintenance-type').value,
        manuelId: document.getElementById('tache-manuel').value,
        description: document.getElementById('tache-description').value,
        statut: document.getElementById('tache-statut').value,
        techniciensIds: techniciensIds,
        documents: documents
    };
    
    if (id) {
        const index = taches.findIndex(t => t.id === id);
        taches[index] = tache;
    } else {
        taches.push(tache);
    }
    
    Storage.set(STORAGE_KEYS.taches, taches);
    closeModal('modal-tache');
    loadData();
});

function deleteTache(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        const taches = Storage.get(STORAGE_KEYS.taches);
        Storage.set(STORAGE_KEYS.taches, taches.filter(t => t.id !== id));
        loadData();
    }
}

function editTache(id) {
    const taches = Storage.get(STORAGE_KEYS.taches);
    const tache = taches.find(t => t.id === id);
    if (tache) {
        document.getElementById('tache-id').value = tache.id;
        document.getElementById('tache-date').value = tache.date;
        document.getElementById('tache-appareil').value = tache.appareilId;
        document.getElementById('tache-maintenance-type').value = tache.maintenanceTypeId;
        document.getElementById('tache-description').value = tache.description;
        document.getElementById('tache-statut').value = tache.statut;
        document.getElementById('tache-documents').value = tache.documents ? tache.documents.join(', ') : '';
        
        populateAppareilsSelect('tache-appareil');
        populateMaintenanceTypesSelect('tache-maintenance-type');
        populateTechniciensSelect('tache-techniciens', true);
        
        // Filtrer et charger les manuels selon l'appareil
        populateManuelsSelect('tache-manuel', tache.appareilId);
        
        // Ajouter le listener pour le changement d'appareil
        const appareilSelect = document.getElementById('tache-appareil');
        appareilSelect.removeEventListener('change', filterManuelsByAppareil);
        appareilSelect.addEventListener('change', filterManuelsByAppareil);
        
        // Sélectionner les techniciens et le manuel
        setTimeout(() => {
            const selectTech = document.getElementById('tache-techniciens');
            Array.from(selectTech.options).forEach(option => {
                if (tache.techniciensIds && tache.techniciensIds.includes(option.value)) {
                    option.selected = true;
                }
            });
            if (tache.manuelId) {
                document.getElementById('tache-manuel').value = tache.manuelId;
            }
        }, 100);
        
        openModal('modal-tache');
    }
}

// Gestion des Techniciens
document.getElementById('form-technicien').addEventListener('submit', (e) => {
    e.preventDefault();
    const techniciens = Storage.get(STORAGE_KEYS.techniciens);
    const id = document.getElementById('technicien-id').value;
    const technicien = {
        id: id || Date.now().toString(),
        nom: document.getElementById('technicien-nom').value,
        prenom: document.getElementById('technicien-prenom').value,
        matricule: document.getElementById('technicien-matricule').value,
        qualification: document.getElementById('technicien-qualification').value,
        email: document.getElementById('technicien-email').value
    };
    
    if (id) {
        const index = techniciens.findIndex(t => t.id === id);
        techniciens[index] = technicien;
    } else {
        techniciens.push(technicien);
    }
    
    Storage.set(STORAGE_KEYS.techniciens, techniciens);
    closeModal('modal-technicien');
    loadData();
});

function deleteTechnicien(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce technicien ?')) {
        const techniciens = Storage.get(STORAGE_KEYS.techniciens);
        Storage.set(STORAGE_KEYS.techniciens, techniciens.filter(t => t.id !== id));
        loadData();
    }
}

function editTechnicien(id) {
    const techniciens = Storage.get(STORAGE_KEYS.techniciens);
    const technicien = techniciens.find(t => t.id === id);
    if (technicien) {
        document.getElementById('technicien-id').value = technicien.id;
        document.getElementById('technicien-nom').value = technicien.nom;
        document.getElementById('technicien-prenom').value = technicien.prenom;
        document.getElementById('technicien-matricule').value = technicien.matricule;
        document.getElementById('technicien-qualification').value = technicien.qualification;
        document.getElementById('technicien-email').value = technicien.email;
        openModal('modal-technicien');
    }
}

// Gestion des Émargements
document.getElementById('form-emargement').addEventListener('submit', (e) => {
    e.preventDefault();
    const emargements = Storage.get(STORAGE_KEYS.emargements);
    const id = document.getElementById('emargement-id').value;
    const emargement = {
        id: id || Date.now().toString(),
        tacheId: document.getElementById('emargement-tache').value,
        technicienId: document.getElementById('emargement-technicien').value,
        date: document.getElementById('emargement-date').value,
        heureDebut: document.getElementById('emargement-heure-debut').value,
        heureFin: document.getElementById('emargement-heure-fin').value,
        signature: document.getElementById('emargement-signature').value
    };
    
    if (id) {
        const index = emargements.findIndex(e => e.id === id);
        emargements[index] = emargement;
    } else {
        emargements.push(emargement);
    }
    
    Storage.set(STORAGE_KEYS.emargements, emargements);
    closeModal('modal-emargement');
    loadData();
});

function deleteEmargement(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet émargement ?')) {
        const emargements = Storage.get(STORAGE_KEYS.emargements);
        Storage.set(STORAGE_KEYS.emargements, emargements.filter(e => e.id !== id));
        loadData();
    }
}

function signerTache(tacheId) {
    const taches = Storage.get(STORAGE_KEYS.taches);
    const tache = taches.find(t => t.id === tacheId);
    if (!tache) return;
    
    populateTachesSelect('emargement-tache');
    populateTechniciensSelect('emargement-technicien');
    
    setTimeout(() => {
        document.getElementById('emargement-tache').value = tacheId;
        openModal('modal-emargement');
    }, 100);
}

// Chargement et affichage des données
function loadData() {
    loadAppareils();
    loadReserves();
    loadVols();
    loadMaintenanceTypes();
    loadManuels();
    loadTaches();
    loadTechniciens();
    loadEmargements();
    
    // Recharger les techniciens par appareil si on est sur l'onglet techniciens
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'techniciens') {
        loadTechniciensParAppareil();
    }
}

function loadReserves() {
    const reserves = Storage.get(STORAGE_KEYS.reserves);
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const tbody = document.getElementById('tbody-reserves');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Trier par date et heure
    reserves.sort((a, b) => {
        const dateCompare = new Date(a.date + 'T' + a.heureDebut) - new Date(b.date + 'T' + b.heureDebut);
        return dateCompare;
    });
    
    reserves.forEach(reserve => {
        const appareil = appareils.find(a => a.id === reserve.appareilId);
        const statutClass = {
            'planifiee': 'badge-planifiee',
            'confirmee': 'badge-en-cours',
            'en-cours': 'badge-en-cours',
            'terminee': 'badge-terminee',
            'annulee': 'badge-indisponible'
        }[reserve.statut] || 'badge-planifiee';
        
        const statutLabel = {
            'planifiee': 'Planifiée',
            'confirmee': 'Confirmée',
            'en-cours': 'En Cours',
            'terminee': 'Terminée',
            'annulee': 'Annulée'
        }[reserve.statut] || reserve.statut;
        
        const typeVolLabel = {
            'entrainement': 'Entraînement',
            'transport': 'Transport',
            'secours': 'Secours',
            'surveillance': 'Surveillance',
            'touristique': 'Touristique',
            'autre': 'Autre'
        }[reserve.typeVol] || reserve.typeVol;
        
        const convertieBadge = reserve.convertieEnVol ? '<span class="badge badge-terminee" style="margin-left: 5px;">✓ Convertie</span>' : '';
        const convertirBtn = reserve.statut === 'terminee' && !reserve.convertieEnVol ? 
            '<button class="btn btn-sign" onclick="convertirReserveDirecte(\'' + reserve.id + '\')">Convertir en Vol</button>' : '';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${reserve.date}</td>
            <td>${reserve.heureDebut}</td>
            <td>${reserve.heureFin}</td>
            <td>${appareil ? appareil.immatriculation : 'N/A'}</td>
            <td>${reserve.pilote}</td>
            <td>${typeVolLabel}</td>
            <td>${reserve.destination || '-'}</td>
            <td><span class="badge ${statutClass}">${statutLabel}</span>${convertieBadge}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editReserve('${reserve.id}')">Modifier</button>
                ${convertirBtn}
                <button class="btn btn-danger" onclick="deleteReserve('${reserve.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function convertirReserveDirecte(reserveId) {
    const reserves = Storage.get(STORAGE_KEYS.reserves);
    const reserve = reserves.find(r => r.id === reserveId);
    if (!reserve) {
        alert('Réservation introuvable');
        return;
    }
    
    // Demander les heures de vol réelles
    const heuresDebut = prompt('Heures de vol au début (ex: 1250.5):', '');
    const heuresFin = prompt('Heures de vol à la fin (ex: 1252.3):', '');
    
    if (!heuresDebut || !heuresFin) {
        return;
    }
    
    const heuresDebutNum = parseFloat(heuresDebut);
    const heuresFinNum = parseFloat(heuresFin);
    
    if (isNaN(heuresDebutNum) || isNaN(heuresFinNum) || heuresFinNum <= heuresDebutNum) {
        alert('Les heures de vol doivent être valides et la fin supérieure au début !');
        return;
    }
    
    // Créer le vol réel
    const vols = Storage.get(STORAGE_KEYS.vols);
    const vol = {
        id: Date.now().toString(),
        date: reserve.date,
        appareilId: reserve.appareilId,
        heuresDebut: heuresDebutNum,
        heuresFin: heuresFinNum,
        duree: heuresFinNum - heuresDebutNum,
        pilote: reserve.pilote
    };
    
    vols.push(vol);
    Storage.set(STORAGE_KEYS.vols, vols);
    
    // Mettre à jour les heures totales de l'appareil
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const appareil = appareils.find(a => a.id === reserve.appareilId);
    if (appareil) {
        appareil.heuresTotal = heuresFinNum;
        Storage.set(STORAGE_KEYS.appareils, appareils);
    }
    
    // Marquer la réservation comme convertie
    reserve.convertieEnVol = true;
    Storage.set(STORAGE_KEYS.reserves, reserves);
    
    alert('Réservation convertie en vol avec succès !');
    loadData();
    switchTab('vols');
}

function loadAppareils() {
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const tbody = document.getElementById('tbody-appareils');
    tbody.innerHTML = '';
    
    appareils.forEach(appareil => {
        const statut = appareil.statut || 'disponible';
        const statutClass = statut === 'disponible' ? 'badge-terminee' : 'badge-planifiee';
        const statutLabel = statut === 'disponible' ? 'Disponible' : 'Indisponible';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${appareil.id.substring(0, 8)}</td>
            <td>${appareil.type}</td>
            <td>${appareil.modele}</td>
            <td>${appareil.immatriculation}</td>
            <td>${appareil.heuresTotal.toFixed(1)}h</td>
            <td><span class="badge ${statutClass}">${statutLabel}</span></td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editAppareil('${appareil.id}')">Modifier</button>
                <button class="btn btn-danger" onclick="deleteAppareil('${appareil.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadVols() {
    const vols = Storage.get(STORAGE_KEYS.vols);
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const tbody = document.getElementById('tbody-vols');
    tbody.innerHTML = '';
    
    vols.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    vols.forEach(vol => {
        const appareil = appareils.find(a => a.id === vol.appareilId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vol.date}</td>
            <td>${appareil ? appareil.immatriculation : 'N/A'}</td>
            <td>${vol.heuresDebut.toFixed(1)}h</td>
            <td>${vol.heuresFin.toFixed(1)}h</td>
            <td>${vol.duree.toFixed(1)}h</td>
            <td>${vol.pilote}</td>
            <td class="actions">
                <button class="btn btn-danger" onclick="deleteVol('${vol.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadMaintenanceTypes() {
    const types = Storage.get(STORAGE_KEYS.maintenanceTypes);
    const tbody = document.getElementById('tbody-maintenance-types');
    tbody.innerHTML = '';
    
    types.forEach(type => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${type.nom}</td>
            <td>${type.description}</td>
            <td>${type.periodicite.toFixed(1)}h</td>
            <td class="actions">
                <button class="btn btn-danger" onclick="deleteMaintenanceType('${type.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadManuels() {
    const manuels = Storage.get(STORAGE_KEYS.manuels);
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const tbody = document.getElementById('tbody-manuels');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    manuels.forEach(manuel => {
        const appareilsList = (manuel.appareilsIds || []).map(id => {
            const app = appareils.find(a => a.id === id);
            return app ? app.immatriculation : 'N/A';
        }).join(', ');
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${manuel.reference}</strong></td>
            <td>${manuel.titre}</td>
            <td>${manuel.version}</td>
            <td>${manuel.datePublication}</td>
            <td>${appareilsList || 'Aucun'}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editManuel('${manuel.id}')">Modifier</button>
                <button class="btn btn-danger" onclick="deleteManuel('${manuel.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadTaches() {
    const taches = Storage.get(STORAGE_KEYS.taches);
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const maintenanceTypes = Storage.get(STORAGE_KEYS.maintenanceTypes);
    const manuels = Storage.get(STORAGE_KEYS.manuels);
    const techniciens = Storage.get(STORAGE_KEYS.techniciens);
    const tbody = document.getElementById('tbody-taches');
    tbody.innerHTML = '';
    
    taches.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    taches.forEach(tache => {
        const appareil = appareils.find(a => a.id === tache.appareilId);
        const maintenanceType = maintenanceTypes.find(m => m.id === tache.maintenanceTypeId);
        const manuel = manuels.find(m => m.id === tache.manuelId);
        const techniciensList = (tache.techniciensIds || []).map(id => {
            const tech = techniciens.find(t => t.id === id);
            return tech ? `${tech.prenom} ${tech.nom}` : 'Inconnu';
        });
        
        const statutClass = {
            'planifiee': 'badge-planifiee',
            'en-cours': 'badge-en-cours',
            'terminee': 'badge-terminee'
        }[tache.statut] || 'badge-planifiee';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tache.date}</td>
            <td>${appareil ? appareil.immatriculation : 'N/A'}</td>
            <td>${maintenanceType ? maintenanceType.nom : 'N/A'}</td>
            <td>${manuel ? `<strong>${manuel.reference}</strong><br><small>${manuel.titre} (${manuel.version})</small>` : 'Non spécifié'}</td>
            <td>${tache.description.substring(0, 50)}${tache.description.length > 50 ? '...' : ''}</td>
            <td><span class="badge ${statutClass}">${tache.statut.replace('-', ' ')}</span></td>
            <td>
                <div class="techniciens-list">
                    ${techniciensList.map(t => `<span class="technicien-tag">${t}</span>`).join('')}
                </div>
            </td>
            <td>
                ${(tache.documents || []).map((doc, i) => 
                    `<a href="${doc}" target="_blank" class="document-link">Doc${i+1}</a>`
                ).join('')}
            </td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editTache('${tache.id}')">Modifier</button>
                <button class="btn btn-sign" onclick="signerTache('${tache.id}')">Émarger</button>
                <button class="btn btn-danger" onclick="deleteTache('${tache.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function loadTechniciens() {
    const techniciens = Storage.get(STORAGE_KEYS.techniciens);
    const taches = Storage.get(STORAGE_KEYS.taches);
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const tbody = document.getElementById('tbody-techniciens');
    tbody.innerHTML = '';
    
    techniciens.forEach(technicien => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${technicien.nom}</td>
            <td>${technicien.prenom}</td>
            <td>${technicien.matricule}</td>
            <td>${technicien.qualification}</td>
            <td>${technicien.email}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editTechnicien('${technicien.id}')">Modifier</button>
                <button class="btn btn-danger" onclick="deleteTechnicien('${technicien.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Afficher les techniciens par appareil
    loadTechniciensParAppareil();
}

function loadTechniciensParAppareil() {
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const taches = Storage.get(STORAGE_KEYS.taches);
    const techniciens = Storage.get(STORAGE_KEYS.techniciens);
    const container = document.getElementById('techniciens-par-appareil');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    appareils.forEach(appareil => {
        // Trouver toutes les tâches pour cet appareil
        const tachesAppareil = taches.filter(t => t.appareilId === appareil.id);
        const techniciensAppareil = new Set();
        
        tachesAppareil.forEach(tache => {
            tache.techniciensIds.forEach(techId => techniciensAppareil.add(techId));
        });
        
        if (techniciensAppareil.size > 0) {
            const card = document.createElement('div');
            card.className = 'appareil-techniciens-card';
            
            const statutBadge = appareil.statut === 'disponible' 
                ? '<span class="badge badge-disponible">Disponible</span>' 
                : '<span class="badge badge-indisponible">Indisponible</span>';
            
            let techniciensHtml = '';
            techniciensAppareil.forEach(techId => {
                const tech = techniciens.find(t => t.id === techId);
                if (tech) {
                    techniciensHtml += `
                        <div class="technicien-item">
                            <span>${tech.prenom} ${tech.nom} (${tech.matricule})</span>
                            <span class="technicien-tag">${tech.qualification}</span>
                        </div>
                    `;
                }
            });
            
            card.innerHTML = `
                <h4>${appareil.type} ${appareil.immatriculation} ${statutBadge}</h4>
                <div>${techniciensHtml}</div>
            `;
            
            container.appendChild(card);
        }
    });
    
    if (container.innerHTML === '') {
        container.innerHTML = '<p style="color: #666; padding: 20px; text-align: center;">Aucun technicien assigné aux appareils pour le moment.</p>';
    }
}

function loadEmargements() {
    const emargements = Storage.get(STORAGE_KEYS.emargements);
    const taches = Storage.get(STORAGE_KEYS.taches);
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    const techniciens = Storage.get(STORAGE_KEYS.techniciens);
    const tbody = document.getElementById('tbody-emargements');
    tbody.innerHTML = '';
    
    emargements.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.heureDebut.localeCompare(a.heureDebut);
    });
    
    emargements.forEach(emargement => {
        const tache = taches.find(t => t.id === emargement.tacheId);
        const appareil = tache ? appareils.find(a => a.id === tache.appareilId) : null;
        const technicien = techniciens.find(t => t.id === emargement.technicienId);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${emargement.date}</td>
            <td>${tache ? tache.description.substring(0, 30) + '...' : 'N/A'}</td>
            <td>${appareil ? appareil.immatriculation : 'N/A'}</td>
            <td>${technicien ? `${technicien.prenom} ${technicien.nom}` : 'N/A'}</td>
            <td>${emargement.heureDebut}</td>
            <td>${emargement.heureFin}</td>
            <td>${emargement.signature}</td>
            <td class="actions">
                <button class="btn btn-danger" onclick="deleteEmargement('${emargement.id}')">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialisation des données par défaut
function initializeDefaultData() {
    // Vérifier si des appareils existent déjà
    const appareils = Storage.get(STORAGE_KEYS.appareils);
    if (appareils.length === 0) {
        // Créer 8 appareils : 5 disponibles et 3 indisponibles
        const defaultAppareils = [
            { id: 'APP001', type: 'Hélicoptère', modele: 'AS350 B3', immatriculation: 'F-ABCD', heuresTotal: 1250.5, statut: 'disponible' },
            { id: 'APP002', type: 'Hélicoptère', modele: 'EC135', immatriculation: 'F-EFGH', heuresTotal: 980.2, statut: 'disponible' },
            { id: 'APP003', type: 'Hélicoptère', modele: 'H125', immatriculation: 'F-IJKL', heuresTotal: 2100.8, statut: 'disponible' },
            { id: 'APP004', type: 'Hélicoptère', modele: 'AS365 N3', immatriculation: 'F-MNOP', heuresTotal: 1750.3, statut: 'disponible' },
            { id: 'APP005', type: 'Hélicoptère', modele: 'EC145', immatriculation: 'F-QRST', heuresTotal: 890.6, statut: 'disponible' },
            { id: 'APP006', type: 'Hélicoptère', modele: 'AS350 B2', immatriculation: 'F-UVWX', heuresTotal: 3200.1, statut: 'indisponible' },
            { id: 'APP007', type: 'Hélicoptère', modele: 'H130', immatriculation: 'F-YZAB', heuresTotal: 1450.9, statut: 'indisponible' },
            { id: 'APP008', type: 'Hélicoptère', modele: 'EC135', immatriculation: 'F-CDEF', heuresTotal: 2650.4, statut: 'indisponible' }
        ];
        Storage.set(STORAGE_KEYS.appareils, defaultAppareils);
    }
    
    // Initialiser quelques types de maintenance par défaut
    const maintenanceTypes = Storage.get(STORAGE_KEYS.maintenanceTypes);
    if (maintenanceTypes.length === 0) {
        const defaultMaintenanceTypes = [
            { id: 'MT001', nom: 'Inspection 50h', description: 'Inspection périodique toutes les 50 heures de vol', periodicite: 50 },
            { id: 'MT002', nom: 'Inspection 100h', description: 'Inspection périodique toutes les 100 heures de vol', periodicite: 100 },
            { id: 'MT003', nom: 'Inspection 300h', description: 'Inspection périodique toutes les 300 heures de vol', periodicite: 300 },
            { id: 'MT004', nom: 'Maintenance corrective', description: 'Réparation suite à une panne ou anomalie', periodicite: 0 },
            { id: 'MT005', nom: 'Révision annuelle', description: 'Révision complète annuelle de l\'appareil', periodicite: 0 }
        ];
        Storage.set(STORAGE_KEYS.maintenanceTypes, defaultMaintenanceTypes);
    }
    
    // Initialiser quelques manuels de maintenance par défaut
    const manuels = Storage.get(STORAGE_KEYS.manuels);
    if (manuels.length === 0) {
        const defaultManuels = [
            { id: 'MAN001', reference: 'AMM-AS350-B3', titre: 'Aircraft Maintenance Manual AS350 B3', version: 'Rev. 15', datePublication: '2023-01-15', appareilsIds: ['APP001'], description: 'Manuel de maintenance pour AS350 B3' },
            { id: 'MAN002', reference: 'AMM-EC135', titre: 'Aircraft Maintenance Manual EC135', version: 'Rev. 12', datePublication: '2023-03-20', appareilsIds: ['APP002', 'APP008'], description: 'Manuel de maintenance pour EC135' },
            { id: 'MAN003', reference: 'AMM-H125', titre: 'Aircraft Maintenance Manual H125', version: 'Rev. 8', datePublication: '2023-02-10', appareilsIds: ['APP003'], description: 'Manuel de maintenance pour H125' },
            { id: 'MAN004', reference: 'AMM-AS365-N3', titre: 'Aircraft Maintenance Manual AS365 N3', version: 'Rev. 10', datePublication: '2023-04-05', appareilsIds: ['APP004'], description: 'Manuel de maintenance pour AS365 N3' },
            { id: 'MAN005', reference: 'AMM-EC145', titre: 'Aircraft Maintenance Manual EC145', version: 'Rev. 9', datePublication: '2023-01-30', appareilsIds: ['APP005'], description: 'Manuel de maintenance pour EC145' }
        ];
        Storage.set(STORAGE_KEYS.manuels, defaultManuels);
    }
}

// Initialisation
initializeDefaultData();
loadData();

