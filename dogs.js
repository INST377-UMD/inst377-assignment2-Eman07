// DOM Elements
const dogCarousel = document.getElementById('dog-carousel');
const breedButtonsContainer = document.getElementById('breed-buttons');
const breedInfoContainer = document.getElementById('breed-info-container');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');

// API URLs
const RANDOM_DOG_API_URL = 'https://dog.ceo/api/breeds/image/random/10';
const DOG_BREEDS_API_URL = 'https://dog.ceo/api/breeds/list/all';

// Global variables
let sliderInstance = null;
let currentImageIndex = 0;
let dogImages = [];
let autoSlideInterval = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load random dog images for carousel
    fetchRandomDogImages();
    
    // Load dog breeds for buttons
    fetchDogBreeds();
    
    // Initialize audio commands
    if (annyang) {
        initializeAudio();
    } else {
        console.error('Speech recognition is not supported in this browser.');
    }
    
    // Add event listeners for carousel navigation buttons
    prevButton.addEventListener('click', showPreviousImage);
    nextButton.addEventListener('click', showNextImage);
});

// Fetch random dog images from the API
async function fetchRandomDogImages() {
    try {
        // Show loading message
        dogCarousel.innerHTML = '<p>Loading dog images...</p>';
        
        // Fetch data from the API
        const response = await fetch(RANDOM_DOG_API_URL);
        const data = await response.json();
        
        console.log("Dog API response:", data);
        
        if (data.status === 'success' && Array.isArray(data.message) && data.message.length > 0) {
            // Store dog image URLs
            dogImages = data.message;
            
            // Clear the carousel
            dogCarousel.innerHTML = '';
            
            // Create image elements
            dogImages.forEach((imageUrl, index) => {
                const imgElement = document.createElement('img');
                imgElement.src = imageUrl;
                imgElement.alt = 'Random Dog';
                imgElement.className = index === 0 ? 'active' : '';
                dogCarousel.appendChild(imgElement);
            });
            
            // Start auto slideshow
            startAutoSlide();
            
            console.log("Loaded", dogImages.length, "dog images");
        } else {
            console.error("Failed to load dog images:", data);
            dogCarousel.innerHTML = '<p>Failed to load dog images. Please refresh the page.</p>';
        }
    } catch (error) {
        console.error("Error fetching dog images:", error);
        dogCarousel.innerHTML = '<p>Failed to load dog images. Please refresh the page.</p>';
    }
}

// Show the previous image
function showPreviousImage() {
    // Reset auto slide
    resetAutoSlide();
    
    // Get all images
    const images = dogCarousel.querySelectorAll('img');
    if (images.length === 0) return;
    
    // Hide current image
    images[currentImageIndex].classList.remove('active');
    
    // Update index (with wrapping)
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    
    // Show new image
    images[currentImageIndex].classList.add('active');
    
    // Restart auto slide
    startAutoSlide();
}

// Show the next image
function showNextImage() {
    // Reset auto slide
    resetAutoSlide();
    
    // Get all images
    const images = dogCarousel.querySelectorAll('img');
    if (images.length === 0) return;
    
    // Hide current image
    images[currentImageIndex].classList.remove('active');
    
    // Update index (with wrapping)
    currentImageIndex = (currentImageIndex + 1) % images.length;
    
    // Show new image
    images[currentImageIndex].classList.add('active');
    
    // Restart auto slide
    startAutoSlide();
}

// Start automatic slideshow
function startAutoSlide() {
    // Clear any existing interval
    resetAutoSlide();
    
    // Set new interval
    autoSlideInterval = setInterval(showNextImage, 3000);
}

// Reset auto slide interval
function resetAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
    }
}

// Fetch dog breeds from the API
async function fetchDogBreeds() {
    try {
        const response = await fetch(DOG_BREEDS_API_URL);
        const data = await response.json();
        
        if (data.status === 'success' && data.message) {
            // Get breeds from the response
            const breeds = Object.keys(data.message);
            
            // Clear any existing content
            breedButtonsContainer.innerHTML = '';
            
            // Create buttons for each breed
            breeds.forEach((breedName, index) => {
                // Create a breed object with basic information
                const breed = {
                    id: index.toString(),
                    name: breedName.charAt(0).toUpperCase() + breedName.slice(1),
                    description: `The ${breedName} is a wonderful dog breed with unique characteristics.`,
                    minLife: 10,
                    maxLife: 15
                };
                
                createBreedButton(breed);
            });
            
            console.log("Created buttons for", breeds.length, "dog breeds");
        } else {
            console.error('Failed to fetch dog breeds:', data);
            breedButtonsContainer.innerHTML = '<p>Failed to load dog breeds. Please refresh the page.</p>';
        }
    } catch (error) {
        console.error('Error fetching dog breeds:', error);
        breedButtonsContainer.innerHTML = '<p>Failed to load dog breeds. Please refresh the page.</p>';
    }
}

// Create a button for a dog breed
function createBreedButton(breed) {
    const button = document.createElement('button');
    button.classList.add('breed-button');
    button.textContent = breed.name;
    
    // Set data attributes for the breed information
    button.setAttribute('data-breed-id', breed.id);
    button.setAttribute('data-breed-name', breed.name);
    button.setAttribute('data-breed-description', breed.description);
    button.setAttribute('data-breed-min-life', breed.minLife);
    button.setAttribute('data-breed-max-life', breed.maxLife);
    
    // Add click event listener
    button.addEventListener('click', function() {
        displayBreedInfo(this);
    });
    
    // Add button to container
    breedButtonsContainer.appendChild(button);
}

// Display breed information when a button is clicked
function displayBreedInfo(buttonElement) {
    // Get breed information from data attributes
    const breedName = buttonElement.getAttribute('data-breed-name');
    const breedDescription = buttonElement.getAttribute('data-breed-description');
    const breedMinLife = buttonElement.getAttribute('data-breed-min-life');
    const breedMaxLife = buttonElement.getAttribute('data-breed-max-life');
    
    // Create HTML content for breed information
    const breedInfoHTML = `
        <div class="breed-info">
            <h3>${breedName}</h3>
            <p><span class="breed-info-label">Description:</span> ${breedDescription}</p>
            <p><span class="breed-info-label">Minimum Life Expectancy:</span> ${breedMinLife} years</p>
            <p><span class="breed-info-label">Maximum Life Expectancy:</span> ${breedMaxLife} years</p>
        </div>
    `;
    
    // Update the breed info container and show it
    breedInfoContainer.innerHTML = breedInfoHTML;
    breedInfoContainer.style.display = 'block';
    
    // Scroll to the breed info container
    breedInfoContainer.scrollIntoView({ behavior: 'smooth' });
}

// Initialize audio commands with annyang
function initializeAudio() {
    // Define the voice commands
    const commands = {
        'hello': function() {
            alert('Hello World');
        },
        'change the color to *color': function(color) {
            document.body.style.backgroundColor = color;
        },
        'navigate to *page': function(page) {
            // Convert to lowercase for comparison
            const pageLower = page.toLowerCase();
            
            if (pageLower === 'home') {
                window.location.href = 'index.html';
            } else if (pageLower === 'stocks') {
                window.location.href = 'stocks.html';
            } else if (pageLower === 'dogs') {
                window.location.href = 'dogs.html';
            } else {
                alert(`Sorry, the page "${page}" is not available.`);
            }
        },
        'load dog breed *breed': function(breed) {
            // Find button with matching breed name
            const buttons = document.querySelectorAll('.breed-button');
            let matchFound = false;
            
            buttons.forEach(button => {
                const buttonBreed = button.getAttribute('data-breed-name').toLowerCase();
                if (buttonBreed.includes(breed.toLowerCase())) {
                    // Trigger a click on the matching button
                    button.click();
                    matchFound = true;
                }
            });
            
            if (!matchFound) {
                alert(`Sorry, couldn't find a dog breed matching "${breed}". Please try another breed.`);
            }
        }
    };

    // Add commands to annyang
    annyang.addCommands(commands);
    
    // Tell KITT to use annyang
    SpeechKITT.annyang();
    
    // Define a stylesheet for KITT to use
    SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');
    
    // Render KITT's interface
    SpeechKITT.vroom();
    
    // Set initial state
    SpeechKITT.hide();
}

// Turn on audio recognition
document.getElementById('turnOnAudio').addEventListener('click', function() {
    if (annyang) {
        annyang.start();
        SpeechKITT.show();
        alert('Audio commands are now active.');
    } else {
        alert('Speech recognition is not supported in this browser.');
    }
});

// Turn off audio recognition
document.getElementById('turnOffAudio').addEventListener('click', function() {
    if (annyang) {
        annyang.abort();
        SpeechKITT.hide();
        alert('Audio commands are now turned off.');
    }
});