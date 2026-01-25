// Données des projets (Simulées)
const projectsData = [
    {
        id: 1,
        title: "Site E-commerce (Agile)",
        description: "Développement d'un site e-commerce complet en équipe de 5 étudiants, simulant une relation client/fournisseur réelle. Nous avons utilisé la méthode Agile (Sprints, Retours clients) pour livrer le produit.<br><br>Preuve de compétences :<br>- <strong>Réaliser</strong> : Développement backend en PHP natif et frontend sans framework.<br>- <strong>Administrer</strong> : Configuration de l'environnement serveur et déploiement.<br>- <strong>Gérer</strong> : Conception et implémentation de la base de données MySQL.<br>- <strong>Conduire</strong> : Gestion de projet agile, planification des sprints.<br>- <strong>Collaborer</strong> : Travail d'équipe, réunions client et répartition des tâches.",
        skills: ["realiser", "administrer", "gerer", "conduire", "collaborer"],
        images: [
            "assets/siteEcommerce/index.png",
            "assets/siteEcommerce/dashboard.png",
            "assets/siteEcommerce/login.png",
            "assets/siteEcommerce/vsCode.png"
        ]
    },
    {
        id: 2,
        title: "Alternance - Backend Laravel",
        description: "Développement backend d'une application web sous Laravel en respectant une architecture hexagonale afin d'optimiser le code et d'assurer sa maintenabilité sur le long terme.<br><br>Preuve de compétences :<br>- <strong>Réaliser</strong> : Création des modules d'inscription, d'abonnement, système d'OTP (Mail/SMS) et Social Login (Google).<br>- <strong>Optimiser</strong> : Mise en oeuvre de l'architecture hexagonale pour un code découplé et performant.<br>- <strong>Gérer</strong> : Manipulation avancée de la base de données via l'ORM Eloquent.<br>- <strong>Conduire</strong> : Développement rigoureux en conformité avec le cahier des charges.<br>- <strong>Collaborer</strong> : Intégration efficace dans l'équipe de développement.",
        skills: ["realiser", "optimiser", "gerer", "conduire", "collaborer"],
        images: [
            "assets/alternance/architectureHexagonale.webp",
            "assets/alternance/registration.png",
            "assets/alternance/subscription.png"
        ]
    },
    {
        id: 3,
        title: "Stage - Site Vitrine & Dashboard Admin",
        description: "Réalisation complète d'un site vitrine avec espace d'administration pour un café/restaurant, en totale autonomie. Le projet inclut des outils sur-mesure pour faciliter la gestion quotidienne de l'établissement.<br><br>Preuve de compétences :<br>- <strong>Réaliser</strong> : Développement full-stack (Laravel/Filament), générateur d'affiches PDF/Image, planificateur de posts réseaux sociaux.<br>- <strong>Optimiser</strong> : Intégration de plugins de sécurité et optimisation structurelle (interface admin performante).<br>- <strong>Administrer</strong> : Sécurisation de l'application (authentification, rôles, protection contre les failles).<br>- <strong>Gérer</strong> : Conception de la base de données pour les événements, menus et publications programmées (CRUD complets).",
        skills: ["realiser", "optimiser", "administrer", "gerer"],
        images: [
            "assets/stage/index.png",
            "assets/stage/dashboard.png",
            "assets/stage/createMenu.png",
            "assets/stage/scheduledPosts.png",
            "assets/stage/updateEvent.png"
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // --- Gestion des Filtres ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    let activeFilter = null;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');

            // Si on clique sur le filtre déjà actif, on le désactive (toggle)
            if (activeFilter === filterValue) {
                activeFilter = null;
                btn.classList.remove('active');
                showAllProjects();
            } else {
                // Sinon, on active le nouveau filtre
                activeFilter = filterValue;
                
                // Gestion de la classe active sur les boutons
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filtrage des cartes
                filterProjects(filterValue);
            }
        });
    });

    function showAllProjects() {
        projectCards.forEach(card => {
            card.style.display = 'flex'; // Rétablir l'affichage (flex car c'est le display par défaut défini en CSS)
            // Animation d'apparition optionnelle
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        });
    }

    function filterProjects(filter) {
        projectCards.forEach(card => {
            const cardSkills = card.getAttribute('data-skills').split(' ');
            
            if (cardSkills.includes(filter)) {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300); // Attendre la fin de la transition CSS si on en mettait une
            }
        });
    }


    // --- Gestion du Modal (Lightbox) ---
    const modal = document.getElementById('project-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalSkillsContainer = document.getElementById('modal-skills-link');
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselNav = document.querySelector('.carousel-nav');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentSlideIndex = 0;
    let slides = [];
    let dots = [];

    // Ouvrir le modal au clic sur une carte
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = parseInt(card.getAttribute('data-id'));
            const project = projectsData.find(p => p.id === projectId);

            if (project) {
                openModal(project);
            }
        });
    });

    // Fermer le modal
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    function openModal(project) {
        // Remplir les infos
        modalTitle.textContent = project.title;
        modalDesc.innerHTML = project.description;
        
        // Remplir les liens compétences (Transitivité)
        modalSkillsContainer.innerHTML = '';
        project.skills.forEach(skillKey => {
            const link = document.createElement('a');
            link.href = '#competences'; // Lien vers la section compétences
            link.className = `skill-link ${skillKey}`;
            link.textContent = `Compétence mobilisée : ${capitalizeFirstLetter(skillKey)}`;
            link.addEventListener('click', closeModal); // Fermer le modal si on clique sur le lien
            modalSkillsContainer.appendChild(link);
        });

        // Initialiser le carrousel
        setupCarousel(project.images);

        // Afficher le modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Empêcher le scroll du body
    }

    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Réactiver le scroll
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    // --- Gestion du Carrousel ---
    function setupCarousel(images) {
        carouselTrack.innerHTML = '';
        carouselNav.innerHTML = '';
        currentSlideIndex = 0;
        slides = [];
        dots = [];

        images.forEach((imgUrl, index) => {
            // Créer la slide
            const li = document.createElement('li');
            li.className = 'carousel-slide';
            if (index === 0) li.classList.add('current-slide');
            
            const img = document.createElement('img');
            img.src = imgUrl;
            li.appendChild(img);
            carouselTrack.appendChild(li);
            slides.push(li);

            // Créer le point indicateur
            const dot = document.createElement('button');
            dot.className = 'carousel-indicator';
            if (index === 0) dot.classList.add('current-slide');
            dot.addEventListener('click', () => moveToSlide(index));
            carouselNav.appendChild(dot);
            dots.push(dot);
        });

        updateCarouselPosition();
    }

    function moveToSlide(targetIndex) {
        if (targetIndex < 0) targetIndex = slides.length - 1;
        if (targetIndex >= slides.length) targetIndex = 0;

        currentSlideIndex = targetIndex;
        updateCarouselPosition();
        updateDots();
    }

    function updateCarouselPosition() {
        const slideWidth = slides[0].getBoundingClientRect().width;
        carouselTrack.style.transform = 'translateX(-' + (slideWidth * currentSlideIndex) + 'px)';
    }

    function updateDots() {
        dots.forEach(dot => dot.classList.remove('current-slide'));
        dots[currentSlideIndex].classList.add('current-slide');
    }

    // Event Listeners Carrousel
    prevBtn.addEventListener('click', () => moveToSlide(currentSlideIndex - 1));
    nextBtn.addEventListener('click', () => moveToSlide(currentSlideIndex + 1));

    // --- Transitivité : Interactivité des Skill Cards ---
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('click', () => {
            const skillFilter = card.getAttribute('data-skill');
            
            // Scroll fluide vers la section projets
            const projectsSection = document.getElementById('projets');
            if (projectsSection) {
                projectsSection.scrollIntoView({ behavior: 'smooth' });
            }

            // Activer le filtre correspondant
            const targetBtn = Array.from(filterBtns).find(btn => btn.getAttribute('data-filter') === skillFilter);
            
            if (targetBtn) {
                // On ne clique que si le filtre n'est pas déjà actif
                if (activeFilter !== skillFilter) {
                    targetBtn.click();
                }
            }
        });
    });

    // Recalculer la position au redimensionnement
    window.addEventListener('resize', () => {
        if (modal.classList.contains('show')) {
            updateCarouselPosition();
        }
    });
});