document.addEventListener('DOMContentLoaded', function () {
    // Scroll Progress Bar
    const progressBar = document.querySelector('.progress-bar');
    const rocketHead = document.querySelector('.rocket-head');
    const exhaust = document.querySelector('.exhaust');

    function updateProgress() {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / windowHeight) * 100;
        
    progressBar.style.width = `${progress}%`;
    // Fade in bar as you scroll
    let fade = Math.min(progress / 1, 1); // 0 opacity at top, fully visible after 10% scroll
    progressBar.style.opacity = fade;
    rocketHead.style.left = `${progress * 1.05}%`;
    rocketHead.style.opacity = fade;
        
        // Update exhaust position
    exhaust.style.left = `calc(${progress}% + 0px - 5px)`; // Move exhaust 30px to the left
    exhaust.style.width = `${Math.min(50 + (progress/2), 100)}px`; // Exhaust gets longer as speed increases
    exhaust.style.opacity = fade;
    if (fade === 0) {
        exhaust.style.display = 'none';
    } else {
        exhaust.style.display = 'block';
    }
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress(); // Initial call
    // Create stars
    const starsContainer = document.querySelector('.stars');
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.setProperty('--opacity', Math.random());
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        starsContainer.appendChild(star);
    }

    // Create matrix rain effect
    const matrixRain = document.getElementById('matrixRain');
    const characters = "01";
    const fontSize = 14;
    const columns = Math.floor(window.innerWidth / fontSize);
    const rows = Math.floor(window.innerHeight / fontSize);

    for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.style.position = 'absolute';
        column.style.top = '0';
        column.style.left = `${i * fontSize}px`;
        column.style.width = `${fontSize}px`;
        column.style.height = '100%';
        column.style.color = '#0f0';
        column.style.fontFamily = 'monospace';
        column.style.fontSize = `${fontSize}px`;
        column.style.lineHeight = `${fontSize}px`;
        column.style.textAlign = 'center';
        column.style.overflow = 'hidden';
        column.dataset.position = '0';
        column.dataset.length = Math.floor(Math.random() * rows / 2) + rows / 2;
        column.dataset.speed = Math.random() * 0.5 + 0.5;
        matrixRain.appendChild(column);

        updateColumn(column);
    }

    function updateColumn(column) {
        const position = parseInt(column.dataset.position);
        const length = parseInt(column.dataset.length);
        const speed = parseFloat(column.dataset.speed);

        let content = '';
        for (let i = 0; i < rows; i++) {
            if (i === position) {
                content += characters.charAt(Math.floor(Math.random() * characters.length));
            } else if (i < position && i > position - length) {
                content += characters.charAt(Math.floor(Math.random() * characters.length));
            } else {
                content += ' ';
            }
        }

        column.textContent = content;

        column.dataset.position = (position + 1) % (rows + length);

        setTimeout(() => updateColumn(column), 100 / speed);
    }

    // Create floating particles
    document.addEventListener('mousemove', (e) => {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY}px`;
        particle.style.width = `${Math.random() * 10 + 5}px`;
        particle.style.height = particle.style.width;
        particle.style.opacity = Math.random() * 0.5 + 0.5;
        document.body.appendChild(particle);

        setTimeout(() => {
            particle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`;
            particle.style.opacity = '0';

            setTimeout(() => {
                particle.remove();
            }, 1000);
        }, 50);
    });

    // Scroll to sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });

            // Close mobile menu if open
            document.querySelector('.nav-links').classList.remove('active');
        });
    });

    // Hamburger menu
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.nav-links').classList.toggle('active');
    });

    // Scroll down button
    document.querySelector('.scroll-down').addEventListener('click', () => {
        document.querySelector('#about').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Rocket animation
    function createRocket() {
        const rocket = document.createElement('div');
        rocket.classList.add('rocket');
        rocket.style.left = `${Math.random() * 100}%`;
        document.querySelector('header').appendChild(rocket);

        setTimeout(() => {
            rocket.remove();
        }, 15000);
    }

    setInterval(createRocket, 3000);

    // Page load animation
    setTimeout(() => {
        document.querySelector('.logo').style.opacity = '1';
        document.querySelector('.tagline').style.opacity = '1';
    }, 500);

    // Parallax effect
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        document.querySelector('.logo').style.transform = `translate(-50%, -50%) translate(${x * 20 - 10}px, ${y * 20 - 10}px)`;
    });
});


// CONTACT FORM FIX USING FORMSUBMIT AJAX
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    fetch('https://formsubmit.co/ajax/tafthighrocketry@gmail.com', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (response.ok) {
                const confirmation = document.getElementById('confirmation');
                confirmation.style.display = 'block';
                form.reset();
                setTimeout(() => confirmation.style.display = 'none', 5000); // hide after 5s
            } else {
                alert('There was a problem sending your message.');
            }
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
});

// Add to your existing script.js
// Toggle rocket details
document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.rocket-card');
        card.classList.toggle('expanded');
        
        // Change button text/icon
        if (card.classList.contains('expanded')) {
            this.innerHTML = 'Hide Details <i class="fas fa-chevron-up"></i>';
        } else {
            this.innerHTML = 'View Details <i class="fas fa-chevron-down"></i>';
        }
    });
});

// Simple image viewer for gallery
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
        const imgUrl = this.style.backgroundImage
            .replace('url("', '')
            .replace('")', '');
        
        const viewer = document.createElement('div');
        viewer.style.position = 'fixed';
        viewer.style.top = '0';
        viewer.style.left = '0';
        viewer.style.width = '100%';
        viewer.style.height = '100%';
        viewer.style.backgroundColor = 'rgba(0,0,0,0.9)';
        viewer.style.display = 'flex';
        viewer.style.justifyContent = 'center';
        viewer.style.alignItems = 'center';
        viewer.style.zIndex = '1000';
        viewer.style.cursor = 'pointer';
        
        const img = document.createElement('img');
        img.src = imgUrl;
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.border = '2px solid var(--primary)';
        img.style.boxShadow = '0 0 30px var(--primary)';
        
        viewer.appendChild(img);
        document.body.appendChild(viewer);
        
        viewer.addEventListener('click', () => {
            viewer.remove();
        });
    });
});
