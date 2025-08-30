let teamsData = [];
let matchsData = {};

// Charger les données des équipes
async function chargerDonnees() {
  try {
    const response = await fetch('./teams.json');
    teamsData = await response.json();
    console.log('Équipes chargées:', teamsData);
    initialiserDivisions();
  } catch (error) {
    console.error('Erreur chargement teams.json:', error);
    alert('Impossible de charger les équipes. Vérifiez que teams.json existe.');
  }
}

// Initialiser les divisions et générer les matchs
function initialiserDivisions() {
  const divisions = [...new Set(teamsData.map(team => team.division))];
  const container = document.getElementById('divisions-container');
  container.innerHTML = '';

  divisions.forEach(division => {
    const equipesDiv = teamsData.filter(team => team.division === division);
    const divisionBlock = creerBlocDivision(division, equipesDiv);
    container.appendChild(divisionBlock);
  });

  // Ajouter les boutons d'action
  const buttonsBar = document.createElement('div');
  buttonsBar.className = 'buttons-bar';
  buttonsBar.innerHTML = `
    <button class="btn primary" onclick="genererAffiche()">Générer l'affiche</button>
    <button class="btn" onclick="reinitialiserMatchs()">Réinitialiser</button>
  `;
  container.appendChild(buttonsBar);
}

// Créer un bloc division avec ses matchs
function creerBlocDivision(division, equipes) {
  const block = document.createElement('div');
  block.className = 'division-block';
  block.dataset.division = division;

  const nbEquipes = equipes.length;
  const nbMatchs = Math.floor(nbEquipes / 2);
  const hasBye = nbEquipes % 2 === 1;

  // Header de la division
  const header = document.createElement('div');
  header.className = 'division-header';
  header.innerHTML = `
    <h3>${division}</h3>
    <span class="match-count">${nbMatchs} match${nbMatchs > 1 ? 's' : ''}</span>
  `;
  block.appendChild(header);

  // Container des matchs
  const matchsContainer = document.createElement('div');
  matchsContainer.className = 'matchs-container';
  
  // Générer les matchs
  for (let i = 0; i < nbMatchs; i++) {
    const matchItem = creerMatch(division, i, equipes);
    matchsContainer.appendChild(matchItem);
  }
  
  block.appendChild(matchsContainer);

  // Section BYE si nombre impair
  if (hasBye) {
    const byeSection = creerSectionBye(division, equipes);
    block.appendChild(byeSection);
  }

  // Initialiser les données de matchs pour cette division
  if (!matchsData[division]) {
    matchsData[division] = {
      matchs: Array(nbMatchs).fill(null).map(() => ({
        team1: '',
        team2: '',
        score1: '',
        score2: '',
        reported: false
      })),
      bye: hasBye ? '' : null
    };
  }

  return block;
}

// Créer un match individuel
function creerMatch(division, index, equipes) {
  const matchItem = document.createElement('div');
  matchItem.className = 'match-item';
  matchItem.innerHTML = `
    <div class="team-section">
      <img class="team-logo" src="./assets/logos/fallback.png" alt="Logo" id="logo1-${division}-${index}">
      <select class="team-select" id="team1-${division}-${index}" onchange="changerEquipe('${division}', ${index}, 1)">
        <option value="">Sélectionner équipe 1</option>
        ${equipes.map(team => `<option value="${team.name}">${team.name}</option>`).join('')}
      </select>
    </div>
    
    <div class="score-section">
      <input type="number" class="score-input" id="score1-${division}-${index}" 
             placeholder="0" min="0" onchange="changerScore('${division}', ${index}, 1)">
      <span class="score-separator">-</span>
      <input type="number" class="score-input" id="score2-${division}-${index}" 
             placeholder="0" min="0" onchange="changerScore('${division}', ${index}, 2)">
    </div>
    
    <div class="team-section">
      <select class="team-select" id="team2-${division}-${index}" onchange="changerEquipe('${division}', ${index}, 2)">
        <option value="">Sélectionner équipe 2</option>
        ${equipes.map(team => `<option value="${team.name}">${team.name}</option>`).join('')}
      </select>
      <img class="team-logo" src="./assets/logos/fallback.png" alt="Logo" id="logo2-${division}-${index}">
    </div>
    
    <div class="report-section">
      <input type="checkbox" class="report-checkbox" id="report-${division}-${index}" 
             onchange="changerReport('${division}', ${index})">
      <label class="report-label" for="report-${division}-${index}">Reporté</label>
    </div>
  `;
  return matchItem;
}

// Créer la section BYE
function creerSectionBye(division, equipes) {
  const byeSection = document.createElement('div');
  byeSection.className = 'bye-section';
  byeSection.innerHTML = `
    <div class="bye-header">Équipe BYE</div>
    <div class="bye-team">
      <select id="bye-${division}" onchange="changerBye('${division}')">
        <option value="">Sélectionner l'équipe BYE</option>
        ${equipes.map(team => `<option value="${team.name}">${team.name}</option>`).join('')}
      </select>
    </div>
  `;
  return byeSection;
}

// Handlers de changement
function changerEquipe(division, matchIndex, teamIndex) {
  const selectId = `team${teamIndex}-${division}-${matchIndex}`;
  const logoId = `logo${teamIndex}-${division}-${matchIndex}`;
  const teamName = document.getElementById(selectId).value;
  
  // Mettre à jour les données
  matchsData[division].matchs[matchIndex][`team${teamIndex}`] = teamName;
  
  // Mettre à jour le logo
  if (teamName) {
    const team = teamsData.find(t => t.name === teamName);
    if (team) {
      document.getElementById(logoId).src = `./assets/logos/${team.logo}`;
      document.getElementById(logoId).onerror = function() {
        this.src = './assets/logos/fallback.png';
      };
    }
  } else {
    document.getElementById(logoId).src = './assets/logos/fallback.png';
  }
}

function changerScore(division, matchIndex, scoreIndex) {
  const scoreId = `score${scoreIndex}-${division}-${matchIndex}`;
  const score = document.getElementById(scoreId).value;
  matchsData[division].matchs[matchIndex][`score${scoreIndex}`] = score;
}

function changerReport(division, matchIndex) {
  const reportId = `report-${division}-${matchIndex}`;
  const isReported = document.getElementById(reportId).checked;
  matchsData[division].matchs[matchIndex].reported = isReported;
  
  // Désactiver/activer les scores selon le statut reporté
  const score1Input = document.getElementById(`score1-${division}-${matchIndex}`);
  const score2Input = document.getElementById(`score2-${division}-${matchIndex}`);
  
  if (isReported) {
    score1Input.disabled = true;
    score2Input.disabled = true;
    score1Input.value = '';
    score2Input.value = '';
    matchsData[division].matchs[matchIndex].score1 = '';
    matchsData[division].matchs[matchIndex].score2 = '';
  } else {
    score1Input.disabled = false;
    score2Input.disabled = false;
  }
}

function changerBye(division) {
  const byeSelect = document.getElementById(`bye-${division}`);
  matchsData[division].bye = byeSelect.value;
}

// Générer l'affiche
async function genererAffiche() {
  const titre = document.getElementById('titre-affiche').value || 'Matchs de la semaine';
  const sousTitre = document.getElementById('sous-titre').value || '';

  // Créer l'affiche
  const posterWrapper = document.createElement('div');
  posterWrapper.className = 'poster-wrapper';
  
  const posterOverlay = document.createElement('div');
  posterOverlay.className = 'poster-overlay';
  posterWrapper.appendChild(posterOverlay);

  const posterContent = document.createElement('div');
  posterContent.className = 'poster-content';

  // Header
  const header = document.createElement('div');
  header.className = 'poster-header';
  header.innerHTML = `
    <h3>${titre}</h3>
    ${sousTitre ? `<div class="sous-titre">${sousTitre}</div>` : ''}
  `;
  posterContent.appendChild(header);

  // Divisions et matchs
  const divisions = Object.keys(matchsData);
  divisions.forEach(division => {
    const divisionData = matchsData[division];
    
    const posterDivision = document.createElement('div');
    posterDivision.className = 'poster-division';
    
    const divisionTitle = document.createElement('h4');
    divisionTitle.className = 'poster-division-title';
    divisionTitle.textContent = division;
    posterDivision.appendChild(divisionTitle);
    
    const posterMatchs = document.createElement('div');
    posterMatchs.className = 'poster-matchs';
    
    // Ajouter les matchs
    divisionData.matchs.forEach(match => {
      if (match.team1 && match.team2) {
        const matchElement = creerMatchPoster(match);
        posterMatchs.appendChild(matchElement);
      }
    });
    
    posterDivision.appendChild(posterMatchs);
    
    // Ajouter BYE pour cette division si elle en a un
    if (divisionData.bye) {
      const byeElement = document.createElement('div');
      byeElement.className = 'poster-division-bye';
      byeElement.textContent = `BYE : ${divisionData.bye}`;
      posterDivision.appendChild(byeElement);
    }
    
    posterContent.appendChild(posterDivision);
  });

  posterWrapper.appendChild(posterContent);
  document.body.appendChild(posterWrapper);

  // Générer l'image
  try {
    const canvas = await html2canvas(posterWrapper, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      width: 800,
      height: 1150
    });
    const dataURL = canvas.toDataURL('image/png');
    
    // Afficher la prévisualisation
    afficherPrevisualisation(dataURL);
    
  } catch (err) {
    console.error('Erreur génération image', err);
    alert('Échec de la génération de l\'image. Voir console.');
  } finally {
    posterWrapper.remove();
  }
}

// Créer un match pour l'affiche
function creerMatchPoster(match) {
  const matchElement = document.createElement('div');
  matchElement.className = 'poster-match';
  
  if (match.reported) {
    // Match reporté
    const team1 = teamsData.find(t => t.name === match.team1);
    const team2 = teamsData.find(t => t.name === match.team2);
    
    matchElement.innerHTML = `
      <div class="poster-match-team1">
        <img class="poster-team-logo" src="./assets/logos/${team1?.logo || 'fallback.png'}" 
             onerror="this.src='./assets/logos/fallback.png'" alt="${team1?.name}">
        <span class="poster-team-name">${match.team1}</span>
      </div>
      <div class="poster-score reported">REPORTÉ</div>
      <div class="poster-match-team2">
        <span class="poster-team-name">${match.team2}</span>
        <img class="poster-team-logo" src="./assets/logos/${team2?.logo || 'fallback.png'}" 
             onerror="this.src='./assets/logos/fallback.png'" alt="${team2?.name}">
      </div>
    `;
  } else {
    // Match avec scores
    const team1 = teamsData.find(t => t.name === match.team1);
    const team2 = teamsData.find(t => t.name === match.team2);
    const score1 = parseInt(match.score1) || 0;
    const score2 = parseInt(match.score2) || 0;
    
    const score1Class = score1 > score2 ? 'winner' : (score1 < score2 ? 'loser' : '');
    const score2Class = score2 > score1 ? 'winner' : (score2 < score1 ? 'loser' : '');
    
    matchElement.innerHTML = `
      <div class="poster-match-team1">
        <img class="poster-team-logo" src="./assets/logos/${team1?.logo || 'fallback.png'}" 
             onerror="this.src='./assets/logos/fallback.png'" alt="${team1?.name}">
        <span class="poster-team-name">${match.team1}</span>
      </div>
      <div class="poster-score">
        <span class="poster-score-value ${score1Class}">${score1}</span>
        <span class="poster-score-separator">-</span>
        <span class="poster-score-value ${score2Class}">${score2}</span>
      </div>
      <div class="poster-match-team2">
        <span class="poster-team-name">${match.team2}</span>
        <img class="poster-team-logo" src="./assets/logos/${team2?.logo || 'fallback.png'}" 
             onerror="this.src='./assets/logos/fallback.png'" alt="${team2?.name}">
      </div>
    `;
  }
  
  return matchElement;
}

// Fonctions de prévisualisation (reprises de script.js)
function afficherPrevisualisation(dataURL) {
  const modal = document.getElementById('preview-modal');
  const image = document.getElementById('preview-image');
  
  image.src = dataURL;
  modal.classList.add('active');
  
  // Stocker l'image pour les actions
  window.currentImageData = dataURL;
}

function fermerPrevisualisation() {
  document.getElementById('preview-modal').classList.remove('active');
}

async function copierImage() {
  try {
    const response = await fetch(window.currentImageData);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    alert('Image copiée dans le presse-papiers !');
  } catch (err) {
    console.error('Erreur copie:', err);
    alert('Impossible de copier l\'image.');
  }
}

function telechargerImage() {
  const a = document.createElement('a');
  a.href = window.currentImageData;
  a.download = 'matchs-semaine.png';
  a.click();
}

// Réinitialiser tous les matchs
function reinitialiserMatchs() {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les matchs ?')) {
    const divisions = Object.keys(matchsData);
    divisions.forEach(division => {
      const divisionData = matchsData[division];
      
      // Réinitialiser les matchs
      divisionData.matchs.forEach((match, index) => {
        // Réinitialiser les selects d'équipes
        document.getElementById(`team1-${division}-${index}`).value = '';
        document.getElementById(`team2-${division}-${index}`).value = '';
        
        // Réinitialiser les logos
        document.getElementById(`logo1-${division}-${index}`).src = './assets/logos/fallback.png';
        document.getElementById(`logo2-${division}-${index}`).src = './assets/logos/fallback.png';
        
        // Réinitialiser les scores
        document.getElementById(`score1-${division}-${index}`).value = '';
        document.getElementById(`score2-${division}-${index}`).value = '';
        document.getElementById(`score1-${division}-${index}`).disabled = false;
        document.getElementById(`score2-${division}-${index}`).disabled = false;
        
        // Réinitialiser le checkbox reporté
        document.getElementById(`report-${division}-${index}`).checked = false;
        
        // Réinitialiser les données
        match.team1 = '';
        match.team2 = '';
        match.score1 = '';
        match.score2 = '';
        match.reported = false;
      });
      
      // Réinitialiser BYE
      if (divisionData.bye !== null) {
        document.getElementById(`bye-${division}`).value = '';
        divisionData.bye = '';
      }
    });
  }
}

// Fermer modal avec Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fermerPrevisualisation();
  }
});

// Fermer modal en cliquant à côté
document.getElementById('preview-modal').addEventListener('click', (e) => {
  if (e.target.id === 'preview-modal') {
    fermerPrevisualisation();
  }
});

// Initialisation
document.addEventListener('DOMContentLoaded', chargerDonnees);
