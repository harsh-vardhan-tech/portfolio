// ====================
// Smooth Background Color Change on Scroll
// ====================

function updateBackgroundColor() {
  const scrollPercentage = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

  // Define color stops for smooth transitions
  const colors = [
    { r: 10, g: 14, b: 39 },    // Dark blue (top)
    { r: 15, g: 10, b: 45 },    // Purple
    { r: 20, g: 15, b: 50 },    // Deeper purple
    { r: 10, g: 20, b: 40 },    // Blue-green
    { r: 10, g: 14, b: 39 }     // Back to dark blue (bottom)
  ];

  const colorIndex = Math.min(Math.floor(scrollPercentage * (colors.length - 1)), colors.length - 2);
  const colorPercent = (scrollPercentage * (colors.length - 1)) - colorIndex;

  const startColor = colors[colorIndex];
  const endColor = colors[colorIndex + 1];

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * colorPercent);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * colorPercent);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * colorPercent);

  document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
}

// ====================
// Three.js WebGL Background with Particles & Shapes
// ====================

let scene, camera, renderer, particles, shapes = [];
let mouseX = 0, mouseY = 0;

function initThreeJS() {
  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded! Check CDN connection.');
    return;
  }

  console.log('✅ Three.js loaded successfully!');

  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0e27, 1, 15);

  // Camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particles
  createParticles();

  // Geometric Shapes
  createGeometricShapes();

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x4a9eff, 0.3);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x6b7cf6, 1, 100);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  // Start animation
  animateThreeJS();

  console.log('✅ Three.js scene initialized!');
}

function createParticles() {
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = window.innerWidth < 768 ? 300 : 800;

  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i += 3) {
    // Position
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;

    // Color - blue to purple gradient
    const color = new THREE.Color();
    color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6);
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  particles = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particles);
}

function createGeometricShapes() {
  const geometries = [
    new THREE.TorusGeometry(0.7, 0.3, 16, 100),
    new THREE.OctahedronGeometry(0.6),
    new THREE.TetrahedronGeometry(0.8),
    new THREE.IcosahedronGeometry(0.5),
    new THREE.TorusKnotGeometry(0.4, 0.15, 100, 16)
  ];

  const material = new THREE.MeshPhongMaterial({
    color: 0x4a9eff,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
    emissive: 0x6b7cf6,
    emissiveIntensity: 0.2
  });

  for (let i = 0; i < 5; i++) {
    const shape = new THREE.Mesh(geometries[i], material.clone());

    shape.position.set(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 10
    );

    shape.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    shapes.push(shape);
    scene.add(shape);
  }
}

function animateThreeJS() {
  requestAnimationFrame(animateThreeJS);

  if (!renderer || !scene || !camera) return;

  const scrollY = window.scrollY * 0.001;

  // Rotate particles
  if (particles) {
    particles.rotation.y += 0.0005;
    particles.rotation.x = scrollY * 0.1;
    particles.position.y = -scrollY * 2;
  }

  // Animate shapes
  shapes.forEach((shape, index) => {
    shape.rotation.x += 0.003 * (index + 1);
    shape.rotation.y += 0.005 * (index + 1);
    shape.rotation.z += 0.002 * (index + 1);

    // Float up and down
    shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.002;

    // Respond to scroll
    shape.position.z = Math.sin(scrollY + index) * 2;
  });

  // Mouse parallax effect (subtle)
  if (window.innerWidth > 768) {
    camera.position.x += (mouseX * 0.05 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.05 - camera.position.y) * 0.05;
  }

  renderer.render(scene, camera);
}

// ====================
// Mouse Movement for Parallax
// ====================

document.addEventListener('mousemove', (e) => {
  if (window.innerWidth > 768) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }
});

// ====================
// Cursor Glow Effect
// ====================

const cursorGlow = document.querySelector('.cursor-glow');

document.addEventListener('mousemove', (e) => {
  if (cursorGlow && window.innerWidth > 768) {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  }
});

if (window.innerWidth <= 768 && cursorGlow) {
  cursorGlow.style.display = 'none';
}

// ====================
// Scroll Progress Bar
// ====================

const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (window.scrollY / windowHeight) * 100;
  progressBar.style.width = scrolled + '%';

  // Update background color on scroll
  updateBackgroundColor();
});

// ====================
// Navbar Scroll Effect
// ====================

function viewCertificate(imagePath) {
  const modal = document.getElementById('cert-modal');
  const image = document.getElementById('cert-image');
  image.src = imagePath;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCertModal() {
  const modal = document.getElementById('cert-modal');
  const image = document.getElementById('cert-image');
  modal.classList.remove('active');
  image.src = '';
  document.body.style.overflow = 'auto';
}

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCertModal();
  }
});

const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile Menu Toggle
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    const spans = menuToggle.querySelectorAll('span');
    if (spans.length >= 3) {
      spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translateY(8px)' : 'none';
      spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
      spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translateY(-8px)' : 'none';
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      const spans = menuToggle.querySelectorAll('span');
      if (spans.length >= 3) {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  });
}

// ====================
// Smooth Scroll
// ====================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});

// ====================
// Active Nav Link Highlighting
// ====================

const sections = document.querySelectorAll('.section, .hero');
const navLinksArray = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 100) {
      current = section.getAttribute('id');
    }
  });

  navLinksArray.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') && link.getAttribute('href').slice(1) === current) {
      link.style.color = '#4a9eff';
    }
  });
});

// ====================
// Scroll to Top Button
// ====================

const scrollTopBtn = document.getElementById('scroll-top');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ====================
// Window Resize Handler
// ====================

window.addEventListener('resize', () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Update cursor glow visibility on resize
  if (cursorGlow) {
    cursorGlow.style.display = window.innerWidth <= 768 ? 'none' : 'block';
  }
});

// ====================
// Initialize Everything on Page Load
// ====================

window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Portfolio...');

  // Initialize Three.js
  initThreeJS();

  // Set initial background color
  updateBackgroundColor();

  console.log('%c✨ Portfolio Loaded Successfully!', 'color: #4a9eff; font-size: 16px; font-weight: bold;');
  console.log('%c👋 Welcome! Check out the WebGL background!', 'color: #6b7cf6; font-size: 14px;');
});

// ====================
// Page Visibility for Performance
// ====================

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animation when tab is hidden
    if (renderer) {
      renderer.setAnimationLoop(null);
    }
  } else {
    // Resume animation when tab is visible
    if (renderer) {
      animateThreeJS();
    }
  }
});
// ====================
// Certificate Card 3D Tilt Effect
// ====================

document.addEventListener('DOMContentLoaded', () => {
  const certificateCards = document.querySelectorAll('.certificate-card');

  certificateCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `translateY(-10px) rotateX({rotateX}deg) rotateY({rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    });
  });
});

// ====================
// Contact Card 3D Tilt Effect
// ====================

document.addEventListener('DOMContentLoaded', () => {
  const contactCards = document.querySelectorAll('.contact-card');

  contactCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      card.style.transform = `translateY(-10px) rotateX({rotateX}deg) rotateY({rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
    });
  });
});

// ====================
// Glowing Cursor Effect on Cards
// ====================

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.certificate-card, .contact-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set CSS custom properties for mouse position
      card.style.setProperty('--mouse-x', `{x}px`);
      card.style.setProperty('--mouse-y', `{y}px`);

      // 3D tilt effect
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;

      card.style.transform = `translateY(-10px) rotateX({rotateX}deg) rotateY({rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
      // Reset glow position
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  });
});

// ====================
// Enhanced Three.js Background - More Interactive
// ====================

// Make background react to scroll
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.pageYOffset;
  if (window.scene && window.particles) {
    window.particles.rotation.y = scrollY * 0.0003;
    window.particles.rotation.x = scrollY * 0.0002;
  }
});

// Enhance existing Three.js animation
if (typeof animateThreeJS === 'function') {
  const originalAnimate = animateThreeJS;
  animateThreeJS = function() {
    if (window.particles) {
      // Add scroll-based movement
      window.particles.position.y = Math.sin(scrollY * 0.001) * 10;
    }
    originalAnimate();
  }
}
