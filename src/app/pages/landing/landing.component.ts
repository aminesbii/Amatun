import { Component, HostListener, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, OnDestroy {
  contactForm: FormGroup;
  isMenuOpen = false;
  isMobileMenuOpen = false;
  isMobileSearchOpen = false;
  isDesktopSearchOpen = false;
  searchQuery = '';
  isScrolled = false;
  lastScrollY = 0;
  hideNav = false;
  hideScrollIndicator = false;
  activeSection = 'home';
  imagesLoaded = 0;
  totalImages = 0;
  showContactModal = false;

  // Navigation items
  navItems = [
    { label: 'Accueil', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'Fonctionnalités', href: '#features' },
  ];

  // Social links
  socialLinks = [
    { name: 'Facebook', icon: 'fab fa-facebook', url: 'https://facebook.com/amatun' },
    { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com/amatun' },
    { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com/amatun' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin', url: 'https://linkedin.com/company/amatun' }
  ];

  // Enhanced Floating particles
  particles = [
    { top: '15%', left: '8%', delay: '0s', size: '8px', color: 'rgba(251, 191, 36, 0.6)' },
    { top: '65%', left: '85%', delay: '1.5s', size: '6px', color: 'rgba(139, 92, 246, 0.6)' },
    { top: '35%', left: '45%', delay: '3s', size: '10px', color: 'rgba(236, 72, 153, 0.6)' },
    { top: '75%', left: '25%', delay: '4.5s', size: '7px', color: 'rgba(59, 130, 246, 0.6)' },
    { top: '25%', left: '75%', delay: '0.8s', size: '9px', color: 'rgba(16, 185, 129, 0.6)' },
    { top: '85%', left: '15%', delay: '2.3s', size: '5px', color: 'rgba(245, 158, 11, 0.6)' },
    { top: '45%', left: '90%', delay: '3.8s', size: '8px', color: 'rgba(168, 85, 247, 0.6)' },
    { top: '55%', left: '5%', delay: '5.2s', size: '6px', color: 'rgba(14, 165, 233, 0.6)' }
  ];

  allServices: any[] = [];
  filteredServices: any[] = [];

  serviceFeatures = [
    {
      title: 'AMATUN SHOP',
      description: 'Plateforme e‑commerce pour acheter et vendre produits et services localement, avec paiement sécurisé et gestion d\'annonces.',
      icon: 'Shop.png',
      iconGradient: 'from-yellow-400 to-orange-400 shadow-yellow-400/20'
    },
    {
      title: 'AMATUN CARS',
      description: 'Service dédié aux véhicules et mobilités : annonces, comparateurs, options de financement et prise de contact directe avec les vendeurs.',
      icon: 'Cars.png',
      iconGradient: 'from-blue-500 to-indigo-500 shadow-blue-500/20'
    },
    {
      title: 'AMATUN LEARN',
      description: 'Espace de formation avec cours, tutoriels et parcours certifiants pour monter en compétences à votre rythme.',
      icon: 'Learn.png',
      iconGradient: 'from-indigo-500 to-purple-500 shadow-indigo-500/20'
    },
    {
      title: 'AMATUN MAG',
      description: 'Magazine et actualités : articles, dossiers et analyses pour rester informé des tendances et nouveautés.',
      icon: 'Mag.png',
      iconGradient: 'from-teal-400 to-green-400 shadow-teal-400/20'
    }
  ];

  services = [
    {
      title: 'AMATUN SHOP',
      description: 'Découvrez notre collection de produits sélectionnés',
      image: 'Shop.png',
      link: '/home',
      linkText: 'En savoir plus',
      gradient: 'from-orange-500/20 via-red-500/20 to-yellow-400/20'
    },
    {
      title: 'AMATUN CARS',
      description: 'Services de livraison rapides et fiables',
      image: 'Cars.png',
      link: 'http://192.168.1.155:4200/home',
      linkText: 'Discover more',
      gradient: 'from-blue-500/20 via-blue-600/20 to-blue-700/20'
    },
    {
      title: 'AMATUN LEARN',
      description: 'Améliorez vos compétences avec notre contenu éducatif',
      image: 'Learn.png',
      link: 'https://learn.amatun.com/',
      linkText: 'En savoir plus',
      gradient: 'from-purple-500/20 via-pink-400/20 to-blue-400/20'
    },
    {
      title: 'AMATUN MAG',
      description: 'Découvrez les derniers articles, actualités et tendances',
      image: 'Mag.png',
      link: 'https://mag.amatun.com/',
      linkText: 'En savoir plus',
      gradient: 'from-teal-600/20 via-green-500/20 to-lime-400/20',
      comingSoon: true,
      isGray: true,
    }
  ];

  private intersectionObserver!: IntersectionObserver;
  private scrollObserver!: IntersectionObserver;
  private resizeObserver!: ResizeObserver;
  private animationFrameId!: number;
  private scrollTimeout: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private titleService: Title,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.allServices = [...this.services];
    this.filteredServices = [...this.services];
  }

  ngOnInit(): void {
    this.filteredServices = [...this.services];
    
    if (isPlatformBrowser(this.platformId)) {
      this.preloadImagesWithProgress();
      setTimeout(() => {
        this.setupScrollAnimations();
        this.setupSectionObserver();
        this.setupPerformanceOptimizations();
      }, 100);
    }
  }


getGradient(service: any): string {
  // Find the matching service feature
  const serviceFeature = this.serviceFeatures.find(feature => 
    feature.title === service.title
  );
  
  if (serviceFeature) {
    // Return the premium gradient classes for the card background
    const gradientMap: { [key: string]: string } = {
      'AMATUN SHOP': 'from-amber-500/20 via-orange-500/25 to-yellow-400/20 shadow-amber-500/25',
      'AMATUN CARS': 'from-blue-500/20 via-indigo-500/25 to-purple-500/20 shadow-blue-500/25',
      'AMATUN LEARN': 'from-indigo-500/20 via-purple-500/25 to-pink-500/20 shadow-indigo-500/25',
      'AMATUN MAG': 'from-teal-500/20 via-emerald-500/25 to-green-400/20 shadow-teal-500/25'
    };
    
    return `bg-gradient-to-br ${gradientMap[service.title] || 'from-gray-700/20 to-gray-900/20'}`;
  }
  
  // Premium default gradient
  return 'bg-gradient-to-br from-slate-700/20 via-gray-800/25 to-zinc-900/20 shadow-gray-500/20';
}

  // Contact Modal Methods
  openContactModal(): void {
    this.showContactModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeContactModal(): void {
    this.showContactModal = false;
    document.body.style.overflow = '';
  }

  // Mobile Menu Methods
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Enhanced image loading with progress tracking
  private preloadImagesWithProgress(): void {
    const allImages = [
      ...this.services.map(s => s.image),
      ...this.serviceFeatures.map(f => f.icon),
      'Amatun.png' // Logo
    ];
    
    this.totalImages = allImages.length;
    this.imagesLoaded = 0;
    
    allImages.forEach(imageSrc => {
      const img = new Image();
      img.onload = () => {
        this.imagesLoaded++;
        console.log(`✅ Image préchargée: ${imageSrc} (${this.imagesLoaded}/${this.totalImages})`);
        
        // All images loaded, trigger animations
        if (this.imagesLoaded === this.totalImages) {
          this.onAllImagesLoaded();
        }
      };
      img.onerror = () => {
        this.imagesLoaded++;
        console.error(`❌ Erreur de préchargement: ${imageSrc}`);
        
        // Set default image for failed loads
        this.setDefaultImage(imageSrc);
      };
      img.src = imageSrc;
    });
  }

  private onAllImagesLoaded(): void {
    console.log('🎉 Toutes les images sont chargées !');
    // Trigger any post-load animations or states
    document.body.classList.add('images-loaded');
  }

  private setDefaultImage(failedImage: string): void {
    // Set a default image for failed loads
    const defaultImage = 'assets/images/default-service.png';
    this.services.forEach(service => {
      if (service.image === failedImage) {
        service.image = defaultImage;
      }
    });
    this.serviceFeatures.forEach(feature => {
      if (feature.icon === failedImage) {
        feature.icon = defaultImage;
      }
    });
  }

  // Image load handlers for individual images
  onImageLoad(): void {
    // Individual image loaded - could add specific handling
  }

  onImageError(service: any): void {
    console.error(`❌ Erreur de chargement d'image pour: ${service.title}`);
    service.image = 'assets/images/default-service.png';
  }


    setupScrollAnimations(): void {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target as HTMLElement;
        
        if (entry.isIntersecting) {
          // Element entering viewport
          element.classList.add('visible');
          element.classList.remove('exiting');
          
          // Staggered animations for child elements based on data-index
          const index = parseInt(element.getAttribute('data-index') || '0');
          const delay = index * 150;
          
          const children = element.querySelectorAll('.service-title, .service-description, .feature-title, .feature-description');
          children.forEach((child, childIndex) => {
            (child as HTMLElement).style.transitionDelay = `${delay + (childIndex * 100)}ms`;
          });
        } else {
          // Element exiting viewport - only animate if scrolled significantly
          if (element.classList.contains('visible') && entry.boundingClientRect.top < -100) {
            element.classList.add('exiting');
            setTimeout(() => {
              if (!entry.isIntersecting) {
                element.classList.remove('visible');
              }
            }, 600);
          }
        }
      });
    }, observerOptions);

    // Observe all scroll-animated elements including hero section
    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach(el => this.intersectionObserver.observe(el));
  }


  // Particle interaction
  onParticleHover(event: MouseEvent): void {
    const particle = event.target as HTMLElement;
    particle.style.transform = 'scale(3)';
    particle.style.opacity = '1';
    particle.style.filter = 'blur(0px)';
    
    setTimeout(() => {
      particle.style.transform = '';
      particle.style.opacity = '';
      particle.style.filter = '';
    }, 300);
  }



  updateActiveSection(): void {
    const sections = ['home', 'services', 'features'];
    const scrollPosition = window.scrollY + 100;

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const offsetTop = element.offsetTop;
        const offsetBottom = offsetTop + element.offsetHeight;

        if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
          this.activeSection = section;
          break;
        }
      }
    }
  }

  // Enhanced scroll handling with smart behavior
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const scrollY = window.scrollY;
    const scrollDirection = scrollY > this.lastScrollY ? 'down' : 'up';
    const scrollDelta = Math.abs(scrollY - this.lastScrollY);
    
    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Smart navbar behavior - only hide on fast scroll down
    if (scrollY > 100 && scrollDirection === 'down' && scrollDelta > 10) {
      this.hideNav = true;
    } else if (scrollDirection === 'up' || scrollY < 50) {
      this.hideNav = false;
    }

    // Prevent navbar hiding when at top or slowly scrolling
    if (scrollY < 100 || scrollDelta < 5) {
      this.hideNav = false;
    }

    // Set timeout for smooth behavior
    this.scrollTimeout = setTimeout(() => {
      this.isScrolled = scrollY > 20;
      this.lastScrollY = scrollY;
      this.updateActiveSection();
    }, 10);
  }



  // Section observer for header animations
  setupSectionObserver(): void {
    const sectionObserverOptions = {
      threshold: 0.2,
      rootMargin: '-100px 0px -100px 0px'
    };

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const headerElements = entry.target.querySelectorAll('.title-reveal, .subtitle-reveal-delay, .section-badge-reveal');
          
          headerElements.forEach((element, index) => {
            setTimeout(() => {
              element.classList.add('visible');
            }, index * 200);
          });
        }
      });
    }, sectionObserverOptions);

    // Observe section headers
    const sections = document.querySelectorAll('section');
    sections.forEach(section => this.scrollObserver.observe(section));
  }

  // Performance optimizations
  setupPerformanceOptimizations(): void {
    // Use ResizeObserver for layout shifts
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver((entries) => {
        // Handle layout shifts if needed
      });
      
      // Observe main content container
      const mainContent = document.querySelector('main');
      if (mainContent) {
        this.resizeObserver.observe(mainContent);
      }
    }

    // Optimize animations with requestAnimationFrame
    this.optimizeAnimations();
  }

  getCharacterDelay(index: number): string {
    return (index * 0.04) + 's';
  }

  private optimizeAnimations(): void {
    // Use requestAnimationFrame for smooth animations
    const animate = () => {
      // Any continuous animations can go here
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start animation loop only if needed
    // this.animationFrameId = requestAnimationFrame(animate);
  }

  // Cleanup observers and timers
  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  // Existing methods...

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      this.isMenuOpen = false;
      this.activeSection = sectionId;
    }
  }

  // Rest of existing methods...
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.isMobileSearchOpen = false;
    }
  }

  toggleDesktopSearch(): void {
    this.isDesktopSearchOpen = !this.isDesktopSearchOpen;
    if (!this.isDesktopSearchOpen) {
      this.searchQuery = '';
      this.filterServices();
    }
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    if (this.isMobileSearchOpen) {
      this.isMenuOpen = false;
    }
    if (!this.isMobileSearchOpen) {
      this.searchQuery = '';
      this.filterServices();
    }
  }

  filterServices(): void {
    if (!this.searchQuery.trim()) {
      this.filteredServices = [...this.allServices];
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredServices = this.allServices.filter(service => 
      service.title.toLowerCase().includes(query) || 
      service.description.toLowerCase().includes(query)
    );
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      this.contactForm.reset();
    }
  }

  onServiceCardClick(service: any): void {
    if (service.comingSoon) return;
    
    if (service.title === 'AMATUN SHOP') {
      this.titleService.setTitle('AMATUN SHOP');
      this.router.navigate([service.link]);
    } else if (service.title === 'AMATUN MAG' || service.title === 'AMATUN LEARN' || service.title === 'AMATUN CARS') {
      window.location.href = service.link;
    } else if (service.link.startsWith('http')) {
      window.open(service.link, '_blank', 'noopener');
    } else {
      this.router.navigate([service.link]);
    }
  }
}