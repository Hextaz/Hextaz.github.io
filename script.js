// Données des projets (Simulées)
const projectsData = [
    {
        id: 1,
        title: "Plateforme E-commerce Eco-responsable",
        description: "Développement complet d'une marketplace dédiée aux produits reconditionnés. Ce projet visait à offrir une expérience d'achat fluide tout en gérant un catalogue complexe de produits uniques. J'ai conçu l'architecture technique pour qu'elle soit évolutive et maintenable. \n\nPreuve de compétences : Pour la partie 'Réaliser', j'ai développé l'intégralité du front-end en HTML/CSS/JS modulaire. Concernant la compétence 'Gérer', j'ai modélisé et implémenté la base de données SQL pour assurer une gestion des stocks en temps réel sans conflit de commandes.",
        skills: ["realiser", "gerer"],
        images: [
            "https://via.placeholder.com/800x400?text=Homepage+E-commerce",
            "https://via.placeholder.com/800x400?text=Catalogue+Produits",
            "https://via.placeholder.com/800x400?text=Schema+Base+de+Donnees"
        ]
    },
    {
        id: 2,
        title: "Déploiement d'Infrastructure Sécurisée",
        description: "Mise en place d'une infrastructure réseau complète pour une PME fictive. L'objectif était de sécuriser les échanges de données et d'assurer la haute disponibilité des services internes. \n\nPreuve de compétences : En lien avec 'Administrer', j'ai configuré les serveurs Linux et les pare-feux. Pour 'Optimiser', j'ai analysé les flux réseaux pour réduire la latence de 30% lors des pics de charge.",
        skills: ["administrer", "optimiser"],
        images: [
            "https://via.placeholder.com/800x400?text=Architecture+Reseau",
            "https://via.placeholder.com/800x400?text=Monitoring+Serveur"
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
        modalDesc.textContent = project.description;
        
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

    // Recalculer la position au redimensionnement
    window.addEventListener('resize', () => {
        if (modal.classList.contains('show')) {
            updateCarouselPosition();
        }
    });
});