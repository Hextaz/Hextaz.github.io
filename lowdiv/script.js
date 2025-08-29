/* ==========================================================
   Générateur d'affiches de classement
   - Chargement des équipes depuis teams.json
   - Génération dynamique des blocs de division
   - Gestion des classements (ajout / suppression / drag & drop)
   - Export en image PNG via html2canvas
   (Commentaires en français pour compréhension.)
   ========================================================== */

// ----------- CONSTANTES / ETAT GLOBAL -----------
const divisionsContainer = document.getElementById('divisionsContainer');
const appliquerTitresBtn = document.getElementById('appliquerTitres');
const titreAfficheInput = document.getElementById('titreAffiche');
const sousTitreAfficheInput = document.getElementById('sousTitreAffiche');

// Objet: divisionName -> liste d'équipes (objets)
let divisionsMap = new Map();

// Stocke pour chaque division le bloc DOM (facilite mises à jour)
const divisionBlocks = new Map();

// ----------- UTILITAIRES -----------
function slugify(txt) {
  return txt.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

function createEl(tag, opts = {}) {
  const el = document.createElement(tag);
  if (opts.className) el.className = opts.className;
  if (opts.textContent !== undefined) el.textContent = opts.textContent;
  if (opts.html !== undefined) el.innerHTML = opts.html;
  if (opts.attrs) Object.entries(opts.attrs).forEach(([k,v]) => el.setAttribute(k,v));
  return el;
}

function option(text, value) { const o = document.createElement('option'); o.value = value; o.textContent = text; return o; }

// Désactive dans une division les options déjà sélectionnées pour éviter doublons.
function rafraichirOptionsDivision(divName) {
  const block = divisionBlocks.get(divName);
  if (!block) return;
  const selects = block.querySelectorAll('select.team-select');
  const dejaPris = new Set();
  selects.forEach(sel => { if (sel.value) dejaPris.add(sel.value); });
  selects.forEach(sel => {
    [...sel.options].forEach(opt => {
      if (!opt.value) return; // placeholder
      if (sel.value === opt.value) { opt.disabled = false; return; }
      opt.disabled = dejaPris.has(opt.value);
    });
  });
}

// Met à jour la colonne des positions (1..n)
function majPositions(tbody) {
  [...tbody.querySelectorAll('tr')].forEach((tr,i) => {
    const cell = tr.querySelector('.position-col');
    if (cell) cell.textContent = i+1;
  });
}

// Logo de secours si fichier introuvable
const FALLBACK_LOGO = 'assets/logos/fallback.png';

// Crée une ligne vide du tableau pour la division donnée
function creerLigne(division, equipes) {
  const tr = createEl('tr', { attrs: { draggable: 'true' }});
  tr.innerHTML = `
    <td class="position-col">?</td>
    <td class="logo-col"><img alt="logo" src="" /></td>
    <td class="team-col"></td>
    <td><input class="stat-input mj" type="number" min="0" placeholder="0" /></td>
    <td><input class="stat-input pts" type="number" min="0" placeholder="0" /></td>
    <td class="row-actions"></td>
  `;
  const teamCell = tr.querySelector('.team-col');
  const select = createEl('select', { className: 'team-select' });
  select.appendChild(option('-- équipe --',''));
  equipes.forEach(eq => select.appendChild(option(eq.name, eq.name)));
  teamCell.appendChild(select);

  // Actions (supprimer / haut / bas)
  const actions = tr.querySelector('.row-actions');
  actions.append(
    boutonIcone('⬆', 'Monter', () => { const prev = tr.previousElementSibling; if (prev) { tr.parentElement.insertBefore(tr, prev); majPositions(tr.parentElement); }}),
    boutonIcone('⬇', 'Descendre', () => { const next = tr.nextElementSibling?.nextElementSibling; tr.parentElement.insertBefore(tr, next); majPositions(tr.parentElement); }),
    boutonIcone('✖', 'Supprimer la ligne', () => { tr.remove(); majPositions(tr.parentElement); rafraichirOptionsDivision(division); })
  );

  // Logo dynamique quand on choisit une équipe
  const img = tr.querySelector('img');
  // Applique une image de secours si chargement échoue
  img.onerror = () => {
    // Empêche boucle infinie si fallback lui-même échoue
    if (!img.src.endsWith('fallback.png')) img.src = FALLBACK_LOGO;
  };

  select.addEventListener('change', () => {
    const eq = equipes.find(e => e.name === select.value);
    if (eq) {
      img.src = `assets/logos/${eq.logo}`;
      img.alt = 'Logo ' + eq.name;
    } else {
      img.src = '';
      img.alt = '';
    }
    rafraichirOptionsDivision(division);
  });

  // Drag & Drop
  tr.addEventListener('dragstart', e => {
    tr.classList.add('dragging');
    e.dataTransfer.setData('text/plain', 'row');
  });
  tr.addEventListener('dragend', () => {
    tr.classList.remove('dragging');
    [...tr.parentElement.querySelectorAll('tr')].forEach(r => r.classList.remove('over-drop'));
    majPositions(tr.parentElement);
  });
  tr.addEventListener('dragover', e => {
    e.preventDefault();
    const dragging = tr.parentElement.querySelector('tr.dragging');
    if (!dragging || dragging === tr) return;
    tr.classList.add('over-drop');
  });
  tr.addEventListener('dragleave', () => tr.classList.remove('over-drop'));
  tr.addEventListener('drop', e => {
    e.preventDefault();
    const dragging = tr.parentElement.querySelector('tr.dragging');
    if (!dragging || dragging === tr) return;
    tr.classList.remove('over-drop');
    const rows = [...tr.parentElement.querySelectorAll('tr')];
    const dropIndex = rows.indexOf(tr);
    const dragIndex = rows.indexOf(dragging);
    if (dragIndex < dropIndex) {
      tr.parentElement.insertBefore(dragging, tr.nextElementSibling);
    } else {
      tr.parentElement.insertBefore(dragging, tr);
    }
    majPositions(tr.parentElement);
  });

  return tr;
}

function boutonIcone(txt, title, action) {
  const b = createEl('button', { className: 'icon-btn', textContent: txt, attrs: { type: 'button', title } });
  b.addEventListener('click', action);
  return b;
}

// Capture et génération PNG avec prévisualisation
async function genererAffiche(division, block) {
  const original = block.querySelector('.poster-wrapper');
  if (!original) return;
  const tbodyOrig = original.querySelector('tbody');
  if (tbodyOrig) majPositions(tbodyOrig);

  // Capturer les noms d'équipes sélectionnés avant clonage
  const teamNames = new Map();
  original.querySelectorAll('tbody tr').forEach((tr, index) => {
    const select = tr.querySelector('select.team-select');
    if (select && select.value) {
      const option = [...select.options].find(opt => opt.value === select.value);
      teamNames.set(index, option ? option.textContent : select.value);
    }
  });

  // Clone pour export propre (sans selects / actions)
  const clone = original.cloneNode(true);
  clone.classList.add('export-mode');
  clone.style.position = 'fixed';
  clone.style.left = '-3000px'; // hors écran
  clone.style.top = '0';
  clone.style.zIndex = '-1';

  // Nettoyage: remplacer selects par span texte,
  // supprimer colonne actions, retirer inputs style -> valeurs en texte.
  const table = clone.querySelector('table');
  if (table) {
    // Retirer entête actions
    const lastTh = table.querySelector('thead th:last-child');
    if (lastTh) lastTh.remove();
    // Pour chaque ligne
    table.querySelectorAll('tbody tr').forEach((tr, index) => {
      // Team select -> span (utiliser le nom capturé)
      const teamSelect = tr.querySelector('select.team-select');
      if (teamSelect) {
        const span = document.createElement('span');
        span.className = 'team-static-name';
        span.textContent = teamNames.get(index) || '';
        teamSelect.parentElement.replaceChild(span, teamSelect);
      }
      // MJ / PTS -> valeurs
      const mj = tr.querySelector('input.mj');
      if (mj) {
        const spanMj = document.createElement('span');
        spanMj.textContent = mj.value || '0';
        mj.parentElement.replaceChild(spanMj, mj);
      }
      const pts = tr.querySelector('input.pts');
      if (pts) {
        const spanPts = document.createElement('span');
        spanPts.textContent = pts.value || '0';
        pts.parentElement.replaceChild(spanPts, pts);
      }
      // Remove actions cell
      const actionsCell = tr.querySelector('td.row-actions');
      if (actionsCell) actionsCell.remove();
    });
  }

  document.body.appendChild(clone);
  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      width: 1920,
      height: 1080
    });
    const dataURL = canvas.toDataURL('image/png');
    
    // Afficher la prévisualisation au lieu de télécharger
    afficherPrevisualisation(dataURL, division);
    
  } catch (err) {
    console.error('Erreur génération image', err);
    alert('Échec de la génération de l\'image. Voir console.');
  } finally {
    clone.remove();
  }
}

// Afficher modal de prévisualisation
function afficherPrevisualisation(dataURL, division) {
  // Créer ou réutiliser la modal
  let modal = document.getElementById('previewModal');
  if (!modal) {
    modal = createEl('div', { 
      className: 'preview-modal',
      attrs: { id: 'previewModal' }
    });
    
    const content = createEl('div', { className: 'preview-content' });
    
    const img = createEl('img', { 
      className: 'preview-image',
      attrs: { alt: 'Prévisualisation affiche', id: 'previewImage' }
    });
    
    const actions = createEl('div', { className: 'preview-actions' });
    
    const btnCopy = createEl('button', { 
      className: 'btn', 
      textContent: '📋 Copier l\'image',
      attrs: { type: 'button', id: 'copyBtn' }
    });
    
    const btnDownload = createEl('button', { 
      className: 'btn primary', 
      textContent: '💾 Télécharger',
      attrs: { type: 'button', id: 'downloadBtn' }
    });
    
    const btnClose = createEl('button', { 
      className: 'btn danger', 
      textContent: '✖ Fermer',
      attrs: { type: 'button', id: 'closeBtn' }
    });
    
    actions.append(btnCopy, btnDownload, btnClose);
    content.append(img, actions);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Event listeners
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
    
    btnDownload.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `${slugify(division)}_${Date.now()}.png`;
      a.click();
    });
    
    btnCopy.addEventListener('click', async () => {
      try {
        const response = await fetch(dataURL);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        btnCopy.textContent = '✅ Copié !';
        setTimeout(() => btnCopy.textContent = '📋 Copier l\'image', 2000);
      } catch (err) {
        console.error('Erreur copie:', err);
        alert('Copie non supportée par le navigateur');
      }
    });
  }
  
  // Mettre à jour contenu et afficher
  const img = modal.querySelector('#previewImage');
  const downloadBtn = modal.querySelector('#downloadBtn');
  img.src = dataURL;
  downloadBtn.onclick = () => {
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `${slugify(division)}_${Date.now()}.png`;
    a.click();
  };
  
  modal.classList.add('active');
}

// Appliquer titre / sous-titre dans chaque division
function appliquerTitres() {
  const titre = titreAfficheInput.value.trim();
  const sousTitre = sousTitreAfficheInput.value.trim();
  divisionBlocks.forEach(block => {
    block.querySelector('.poster-header h3').textContent = titre || 'Titre';
    block.querySelector('.poster-header .sous-titre').textContent = sousTitre || 'Sous-titre';
  });
}

appliquerTitresBtn.addEventListener('click', appliquerTitres);

// ----------- GENERATION DES BLOCS DE DIVISION -----------
function construireBlocs() {
  divisionsContainer.innerHTML = '';
  divisionBlocks.clear();

  [...divisionsMap.entries()].forEach(([division, equipes]) => {
    const block = createEl('section', { className: 'division-block card' });
    block.dataset.division = division;

    // Conteneur de l'affiche (capturable)
    const posterWrapper = createEl('div', { className: 'poster-wrapper' });
    posterWrapper.appendChild(createEl('div', { className: 'poster-overlay' }));
    const posterContent = createEl('div', { className: 'poster-content' });

    // Titre / sous-titre dynamiques
    const header = createEl('div', { className: 'poster-header' });
    header.appendChild(createEl('h3', { textContent: 'Titre' }));
    header.appendChild(createEl('div', { className: 'sous-titre', textContent: 'Sous-titre' }));
    posterContent.appendChild(header);

    // Sous-titre division
    posterContent.appendChild(createEl('h4', { textContent: division, className: 'division-titre' }));

    // Tableau
    const tableWrapper = createEl('div', { className: 'table-wrapper' });
    const table = createEl('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>#</th>
          <th>Logo</th>
          <th>Équipe</th>
          <th>MJ</th>
          <th>PTS</th>
          <th class="actions-col">Act.</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    tableWrapper.appendChild(table);
    posterContent.appendChild(tableWrapper);
    posterWrapper.appendChild(posterContent);
    block.appendChild(posterWrapper);

    // Barre de boutons
    const buttonsBar = createEl('div', { className: 'buttons-bar' });
    const btnAdd = createEl('button', { className: 'btn', textContent: 'Ajouter une ligne', attrs: { type:'button' } });
    btnAdd.addEventListener('click', () => {
      const tr = creerLigne(division, equipes);
      table.querySelector('tbody').appendChild(tr);
      majPositions(table.querySelector('tbody'));
      rafraichirOptionsDivision(division);
    });

    const btnExport = createEl('button', { className: 'btn primary', textContent: 'Prévisualiser l\'affiche', attrs: { type:'button' } });
    btnExport.addEventListener('click', () => genererAffiche(division, block));

    buttonsBar.append(btnAdd, btnExport);
    block.appendChild(buttonsBar);

    const note = createEl('div', { className: 'small-note', textContent: 'Astuce: glissez-déposez les lignes pour réordonner.' });
    block.appendChild(note);

    divisionsContainer.appendChild(block);
    divisionBlocks.set(division, block);

    // Pré-créer des lignes vides = nombre d'équipes de la division (optionnel)
    equipes.forEach(() => {
      const tr = creerLigne(division, equipes);
      table.querySelector('tbody').appendChild(tr);
    });
    majPositions(table.querySelector('tbody'));
  });

  appliquerTitres(); // Appliquer titres initiaux
}

// ----------- CHARGEMENT DES DONNÉES -----------
async function chargerEquipes() {
  try {
    const resp = await fetch('teams.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    if (!Array.isArray(data)) throw new Error('Format JSON invalide (tableau attendu).');

    divisionsMap = data.reduce((map, eq) => {
      const div = eq.division || 'Division inconnue';
      if (!map.has(div)) map.set(div, []);
      map.get(div).push(eq);
      return map;
    }, new Map());

    // Tri alphabétique des divisions & équipes
    divisionsMap = new Map([...divisionsMap.entries()].sort((a,b) => a[0].localeCompare(b[0], 'fr')));
    divisionsMap.forEach(list => list.sort((a,b) => a.name.localeCompare(b.name,'fr')));

    construireBlocs();
  } catch (err) {
    console.error(err);
    divisionsContainer.textContent = 'Erreur de chargement des équipes. Consultez la console.';
  }
}

chargerEquipes();

// Expose (debug éventuel)
window._lowdiv = { divisionsMap, divisionBlocks };
