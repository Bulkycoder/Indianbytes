// Initialize Firebase references
const database = firebase.database();

// DOM Elements
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const notificationBell = document.querySelector('.notification-bell');
const notificationCount = document.querySelector('.notification-count');
const addFoodForm = document.getElementById('add-food-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const notificationModal = document.getElementById('notification-modal');
const closeModal = document.querySelector('.close');
const notificationList = document.getElementById('notification-list');
const categorySelect = document.getElementById('food-category');
const categoriesList = document.getElementById('categories-list');
const addCategoryForm = document.getElementById('add-category-form');
const categoryNameInput = document.getElementById('category-name');
const usersContainer = document.getElementById('users-container');
const ordersContainer = document.getElementById('orders-container');
const foodItemsContainer = document.getElementById('food-items-management');
const loginForm = document.getElementById('loginForm');
const loginOverlay = document.getElementById('loginOverlay');
const loginError = document.getElementById('loginError');
const adminContainer = document.getElementById('adminContainer');
const notificationSound = document.getElementById('notificationSound');

// Admin credentials
const ADMIN_USERNAME = 'indianbytes@2006';
const ADMIN_PASSWORD = 'parwinder@2006';

// Check admin authentication status
function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        loginOverlay.style.display = 'flex';
        adminContainer.classList.remove('visible');
    } else {
        loginOverlay.style.display = 'none';
        adminContainer.classList.add('visible');
        initializeAdminPanel();
    }
}

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        loginOverlay.style.display = 'none';
        adminContainer.classList.add('visible');
        loginError.style.display = 'none';
        initializeAdminPanel();
    } else {
        loginError.style.display = 'block';
        sessionStorage.removeItem('adminLoggedIn');
        adminContainer.classList.remove('visible');
    }
});

// Navigation
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const sectionId = btn.dataset.section;
        
        // Update active states
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

// Listen for new orders
let pendingOrdersCount = 0;
database.ref('orders').on('value', snapshot => {
    let newCount = 0;
    snapshot.forEach(child => {
        const order = child.val();
        if (order.status === 'pending') {
            newCount++;
        }
    });
    
    // Play notification sound if there's a new order
    if (newCount > pendingOrdersCount) {
        notificationSound.play().catch(error => console.log('Error playing sound:', error));
    }
    
    pendingOrdersCount = newCount;
    if (pendingOrdersCount > 0) {
        notificationCount.style.display = 'block';
        notificationCount.textContent = pendingOrdersCount;
    } else {
        notificationCount.style.display = 'none';
    }
    displayOrders();
});

// Display Orders
function displayOrders() {
    const ordersContainer = document.getElementById('orders-container');
    ordersContainer.innerHTML = '<div id="orders-list"></div>';
    
    database.ref('orders').on('value', snapshot => {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';
        
        const orders = [];
        snapshot.forEach(childSnapshot => {
            orders.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        // Display orders in reverse chronological order
        orders.reverse().forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.innerHTML = `
                <div class="order-header">
                    <h3>Order #${order.id.slice(-6)}</h3>
                    <span class="status-badge ${order.status}">${order.status}</span>
                </div>
                <div class="order-details">
                    <p><strong>Customer:</strong> ${order.customerName}</p>
                    <p><strong>Item:</strong> ${order.foodName} x ${order.quantity}</p>
                    <p><strong>Total:</strong> ₹${order.totalPrice}</p>
                    <p><strong>Address:</strong> ${order.address}</p>
                    <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
                </div>
                <div class="order-actions">
                    <button class="status-btn pending" onclick="updateOrderStatus('${order.id}', 'pending')">Pending</button>
                    <button class="status-btn completed" onclick="updateOrderStatus('${order.id}', 'completed')">Completed</button>
                </div>
            `;
            ordersList.appendChild(orderCard);
        });
    });
}

// Update Order Status
function updateOrderStatus(orderId, status) {
    database.ref(`orders/${orderId}`).update({
        status: status
    });
}

// Display Users
function displayUsers() {
    const usersContainer = document.getElementById('users-container');
    usersContainer.innerHTML = '<div id="users-list"></div>';
    
    database.ref('users').on('value', snapshot => {
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';
        
        snapshot.forEach(childSnapshot => {
            const user = childSnapshot.val();
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            userCard.innerHTML = `
                <div class="user-header">
                    <i class="fas fa-user-circle"></i>
                    <h3>${user.name || 'User'}</h3>
                </div>
                <div class="user-details">
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    <p><i class="fas fa-phone"></i> ${user.mobile || 'Not provided'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${user.address || 'Not provided'}</p>
                </div>
            `;
            usersList.appendChild(userCard);
        });
    });
}

// Display Food Items for Management
function displayFoodItems() {
    const foodItemsContainer = document.getElementById('food-items-management');
    
    database.ref('foods').on('value', snapshot => {
        foodItemsContainer.innerHTML = '';
        
        snapshot.forEach(child => {
            const food = {
                id: child.key,
                ...child.val()
            };
            
            const foodCard = document.createElement('div');
            foodCard.className = 'food-item-card';
            foodCard.innerHTML = `
                <img src="${food.imageUrl}" alt="${food.name}" onerror="this.src='https://via.placeholder.com/100?text=Food'">
                <div class="food-item-info">
                    <h3>${food.name}</h3>
                    <p>Price: ₹${food.price}</p>
                    <p>Category: ${food.category}</p>
                </div>
                <button onclick="deleteFood('${food.id}')" class="delete-food-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
            `;
            foodItemsContainer.appendChild(foodCard);
        });
    });
}

// Delete Food Item
function deleteFood(foodId) {
    if (confirm('Are you sure you want to delete this food item?')) {
        // Delete from database first
        database.ref(`foods/${foodId}`).remove()
            .then(() => {
                alert('Food item deleted successfully');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete food item');
            });
    }
}

// Initialize Admin Panel
function initializeAdminPanel() {
    loadCategories();
    displayOrders();
    displayUsers();
    displayFoodItems();
    displayNotifications();
}

// Call initialize function when page loads
window.onload = checkAdminAuth;

// Add Food Item
addFoodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const foodData = {
        name: document.getElementById('food-name').value,
        price: parseFloat(document.getElementById('food-price').value),
        category: categorySelect.value,
        imageUrl: document.getElementById('food-image').value,
        timestamp: Date.now()
    };

    database.ref('foods').push(foodData)
        .then(() => {
            alert('Food item added successfully!');
            addFoodForm.reset();
            displayFoodItems();
        })
        .catch(error => {
            console.error('Error adding food item:', error);
            alert('Failed to add food item. Please try again.');
        });
});

// Load Categories
function loadCategories() {
    const categorySelect = document.getElementById('food-category');
    const categoriesList = document.getElementById('categories-list');
    
    database.ref('categories').on('value', snapshot => {
        // Clear existing options except the first one (Select Category)
        while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
        }
        
        // Clear categories list
        categoriesList.innerHTML = '';
        
        snapshot.forEach(child => {
            const category = child.val();
            const categoryId = child.key;
            
            // Add to select dropdown
            const option = new Option(category.name, category.name);
            categorySelect.add(option);
            
            // Add to categories list with delete button
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <span>${category.name}</span>
                <button onclick="deleteCategory('${categoryId}')" class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            categoriesList.appendChild(categoryItem);
        });
    });
}

// Delete Category
function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        database.ref(`categories/${categoryId}`).remove()
            .then(() => {
                alert('Category deleted successfully');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete category');
            });
    }
}

// Add Category
addCategoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const categoryName = document.getElementById('category-name').value;
    
    if (categoryName.trim() === '') {
        alert('Please enter a category name');
        return;
    }
    
    const newCategoryRef = database.ref('categories').push();
    newCategoryRef.set({
        name: categoryName
    })
    .then(() => {
        alert('Category added successfully');
        addCategoryForm.reset();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add category');
    });
});

// Notifications
notificationBell.addEventListener('click', () => {
    notificationModal.style.display = 'block';
    notificationCount.textContent = '0';
    displayNotifications();
});

closeModal.addEventListener('click', () => {
    notificationModal.style.display = 'none';
});

function displayNotifications() {
    database.ref('orders').orderByChild('timestamp').on('value', snapshot => {
        notificationList.innerHTML = '';
        snapshot.forEach(child => {
            const order = child.val();
            if (order.status === 'pending') {
                const notification = document.createElement('div');
                notification.className = 'notification-item';
                notification.innerHTML = `
                    <p><strong>${order.customerName}</strong> ordered ${order.foodName}</p>
                    <p>Total: ₹${order.foodPrice}</p>
                    <small>${new Date(order.timestamp).toLocaleString()}</small>
                `;
                notificationList.appendChild(notification);
            }
        });
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === notificationModal) {
        notificationModal.style.display = 'none';
    }
});
