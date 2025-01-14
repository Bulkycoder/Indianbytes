// Initialize Firebase references
const database = firebase.database();

// DOM Elements
const foodContainer = document.getElementById('food-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const orderModal = document.getElementById('order-modal');
const orderForm = document.getElementById('order-form');
const closeModal = document.querySelector('.close');
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const categoryBtns = document.querySelectorAll('.category-btn');
const profileForm = document.getElementById('profile-form');
const quantityInput = document.getElementById('quantity');
const totalPriceSpan = document.getElementById('total-price');
const searchFoodContainer = document.getElementById('search-food-container');

let currentFoodItem = null;
let allFoodItems = [];

// Load user profile from Firebase
function loadUserProfile() {
    const email = document.getElementById('profile-email').value;
    if (email) {
        // Use email as a key (replace . with , because Firebase doesn't allow dots in keys)
        const safeEmail = email.replace(/\./g, ',');
        database.ref(`users/${safeEmail}`).once('value')
            .then(snapshot => {
                const profile = snapshot.val();
                if (profile) {
                    document.getElementById('profile-name').value = profile.name || '';
                    document.getElementById('profile-email').value = profile.email || '';
                    document.getElementById('profile-mobile').value = profile.mobile || '';
                    document.getElementById('profile-address').value = profile.address || '';
                }
            });
    }
}

// Save user profile to Firebase
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('profile-email').value;
    const safeEmail = email.replace(/\./g, ',');
    
    const profile = {
        name: document.getElementById('profile-name').value,
        email: email,
        mobile: document.getElementById('profile-mobile').value,
        address: document.getElementById('profile-address').value,
        timestamp: Date.now()
    };

    database.ref(`users/${safeEmail}`).set(profile)
        .then(() => {
            alert('Profile saved successfully!');
            // Store just the email in localStorage to auto-load profile next time
            localStorage.setItem('userEmail', email);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to save profile. Please try again.');
        });
});

// Auto-load profile when email is entered
document.getElementById('profile-email').addEventListener('change', loadUserProfile);

// Navigation
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.dataset.section;
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${sectionId}-section`) {
                section.classList.add('active');
            }
        });
    });
});

// Load categories from Firebase
function loadCategories() {
    database.ref('categories').on('value', snapshot => {
        const categoryContainer = document.querySelector('#home-section .categories');
        if (categoryContainer) {
            categoryContainer.innerHTML = '<button class="category-btn active" data-category="all">All</button>';
            
            snapshot.forEach(child => {
                const category = child.val();
                const btn = document.createElement('button');
                btn.className = 'category-btn';
                btn.dataset.category = category.name;
                btn.textContent = category.name;
                categoryContainer.appendChild(btn);
            });

            // Add click event listeners to category buttons
            const categoryBtns = document.querySelectorAll('.category-btn');
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all buttons
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    // Add active class to clicked button
                    btn.classList.add('active');
                    // Filter food items
                    filterFoodByCategory(btn.dataset.category);
                });
            });
        }
    });
}

// Display Food Items
function displayFoodItems(foods) {
    foodContainer.innerHTML = '';
    
    foods.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML = `
            <img src="${food.imageUrl}" alt="${food.name}" onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found'">
            <div class="food-info">
                <h3 class="food-name">${food.name}</h3>
                <p class="food-price">₹${food.price}</p>
                <button class="order-btn" style="background-color: #ff0000; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Order Now</button>
            </div>
        `;
        foodContainer.appendChild(foodCard);

        const orderBtn = foodCard.querySelector('.order-btn');
        orderBtn.addEventListener('click', () => {
            currentFoodItem = food;
            openOrderModal(food);
        });
    });
}

// Display Food Items in Search Section
function displaySearchFoodItems(foods) {
    searchFoodContainer.innerHTML = '';
    
    foods.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML = `
            <img src="${food.imageUrl}" alt="${food.name}" onerror="this.src='https://via.placeholder.com/150?text=Image+Not+Found'">
            <div class="food-info">
                <h3 class="food-name">${food.name}</h3>
                <p class="food-price">₹${food.price}</p>
                <button class="order-btn" style="background-color: #ff0000; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Order Now</button>
            </div>
        `;
        searchFoodContainer.appendChild(foodCard);

        const orderBtn = foodCard.querySelector('.order-btn');
        orderBtn.addEventListener('click', () => {
            currentFoodItem = food;
            openOrderModal(food);
        });
    });
}

// Filter Food by Category
function filterFoodByCategory(category) {
    const filteredFoods = category === 'all' 
        ? allFoodItems 
        : allFoodItems.filter(food => food.category === category);
    displayFoodItems(filteredFoods);
}

// Open Order Modal
function openOrderModal(food) {
    const orderDetails = document.getElementById('order-details');
    orderDetails.innerHTML = `
        <div class="food-preview">
            <img src="${food.imageUrl}" alt="${food.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
            <h3>${food.name}</h3>
            <p>Price: ₹${food.price}</p>
        </div>
    `;
    
    // Remove existing delivery notice if any
    const existingNotice = orderForm.querySelector('.delivery-notice');
    if (existingNotice) {
        existingNotice.remove();
    }
    
    // Add delivery notice
    const deliveryNotice = document.createElement('p');
    deliveryNotice.className = 'delivery-notice';
    deliveryNotice.textContent = '* Delivery charges will be added extra';
    orderForm.appendChild(deliveryNotice);
    
    // Load user profile into order form
    const email = document.getElementById('profile-email').value;
    if (email) {
        const safeEmail = email.replace(/\./g, ',');
        database.ref(`users/${safeEmail}`).once('value')
            .then(snapshot => {
                const profile = snapshot.val();
                if (profile) {
                    document.getElementById('full-name').value = profile.name || '';
                    document.getElementById('email').value = profile.email || '';
                    document.getElementById('mobile').value = profile.mobile || '';
                    document.getElementById('address').value = profile.address || '';
                }
            });
    }
    
    updateTotalPrice();
    orderModal.style.display = 'block';
}

// Update total price when quantity changes
quantityInput.addEventListener('input', updateTotalPrice);

function updateTotalPrice() {
    const quantity = parseInt(quantityInput.value) || 1;
    const price = currentFoodItem ? currentFoodItem.price : 0;
    totalPriceSpan.textContent = (quantity * price).toFixed(2);
}

closeModal.addEventListener('click', () => {
    orderModal.style.display = 'none';
});

// Place Order
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const quantity = parseInt(quantityInput.value) || 1;
    const orderData = {
        foodId: currentFoodItem.id,
        foodName: currentFoodItem.name,
        foodPrice: currentFoodItem.price,
        foodImageUrl: currentFoodItem.imageUrl,
        quantity: quantity,
        totalPrice: currentFoodItem.price * quantity,
        customerName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        mobile: document.getElementById('mobile').value,
        address: document.getElementById('address').value,
        status: 'pending',
        timestamp: Date.now()
    };

    database.ref('orders').push(orderData)
        .then(() => {
            alert('Order placed successfully!');
            orderModal.style.display = 'none';
            orderForm.reset();
            quantityInput.value = 1;
            const deliveryNotice = orderForm.querySelector('.delivery-notice');
            if (deliveryNotice) {
                deliveryNotice.remove();
            }
            updateOrders();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to place order. Please try again.');
        });
});

// Update Orders Section
function updateOrders() {
    const ordersContainer = document.getElementById('orders-container');
    const userEmail = document.getElementById('profile-email').value;
    
    if (!userEmail) return;
    
    database.ref('orders').orderByChild('email').equalTo(userEmail).on('value', snapshot => {
        ordersContainer.innerHTML = '';
        const orders = [];
        
        snapshot.forEach(child => {
            orders.unshift({ id: child.key, ...child.val() });
        });
        
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-card';
            orderElement.innerHTML = `
                <div class="order-info">
                    <div class="order-header">
                        <h3>Order #${order.id.slice(-6)}</h3>
                        <span class="status-badge ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p><strong>${order.foodName}</strong> x ${order.quantity}</p>
                        <p>Total: ₹${order.totalPrice}</p>
                        <p>Ordered on: ${new Date(order.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            `;
            ordersContainer.appendChild(orderElement);
        });
    });
}

// Search Section
function initializeSearchSection() {
    let allFoodItems = [];

    // Load all food items initially
    database.ref('foods').on('value', snapshot => {
        allFoodItems = [];
        snapshot.forEach(child => {
            allFoodItems.push({
                id: child.key,
                ...child.val()
            });
        });
        displaySearchFoodItems(allFoodItems);
    });

    // Real-time search filter
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredFoods = allFoodItems.filter(food => 
            food.name.toLowerCase().includes(searchTerm)
        );
        displaySearchFoodItems(filteredFoods);
    });
}

// Load all food items initially
database.ref('foods').on('value', snapshot => {
    allFoodItems = [];
    snapshot.forEach(child => {
        allFoodItems.push({ id: child.key, ...child.val() });
    });
    displayFoodItems(allFoodItems);
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        document.getElementById('profile-email').value = savedEmail;
        loadUserProfile();
    }
    loadCategories();
    displayFoodItems(allFoodItems);
    initializeSearchSection();
    updateOrders();
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.style.display = 'none';
    }
});
