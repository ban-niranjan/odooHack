// App state
        const state = {
            currentUser: null,
            isAdmin: false,
            users: [],
            skills: [],
            swapRequests: [],
            reportedSkills: []
        };

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            // Load sample data
            loadInitialData();
            
            // Set up event listeners
            setupEventListeners();
            
            // Check if user is logged in (simulated)
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                state.currentUser = JSON.parse(storedUser);
                state.isAdmin = localStorage.getItem('isAdmin') === 'true';
                updateAuthState();
                showScreen('home-screen');
            }
        });

        function loadInitialData() {
            // Sample users
            state.users = [
                {
                    id: 1,
                    name: 'Alex Johnson',
                    location: 'San Francisco',
                    photo: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b659ecaf-0be4-4fcb-b374-76a01cae2dce.png',
                    offeredSkills: ['Graphic Design', 'Photography', 'Adobe Photoshop'],
                    wantedSkills: ['Spanish', 'Baking'],
                    availability: ['weekends', 'evenings'],
                    isPublic: true
                },
                {
                    id: 2,
                    name: 'Maria Garcia',
                    location: 'New York',
                    photo: 'https://placehold.co/200x200',
                    offeredSkills: ['Spanish', 'French'],
                    wantedSkills: ['Web Development', 'Graphic Design'],
                    availability: ['weekdays', 'flexible'],
                    isPublic: true
                },
                {
                    id: 3,
                    name: 'Sam Wilson',
                    location: 'Chicago',
                    photo: 'https://placehold.co/200x200',
                    offeredSkills: ['Excel', 'Data Analysis', 'Business Strategy'],
                    wantedSkills: ['Public Speaking', 'Piano'],
                    availability: ['weekends', 'virtual'],
                    isPublic: true
                },
                {
                    id: 4,
                    name: 'Admin User',
                    location: 'Adminland',
                    photo: 'https://placehold.co/200x200',
                    offeredSkills: ['Platform Management'],
                    wantedSkills: [],
                    availability: [],
                    isPublic: false,
                    isAdmin: true
                }
            ];

            // Sample skills for search
            state.skills = Array.from(new Set(
                state.users.flatMap(user => [...user.offeredSkills, ...user.wantedSkills])
            )).sort();

            // Sample swap requests
            state.swapRequests = [
                {
                    id: 1,
                    fromUserId: 1,
                    toUserId: 2,
                    offeredSkill: 'Graphic Design',
                    requestedSkill: 'Spanish',
                    status: 'pending',
                    message: 'Would love to learn some basic Spanish for an upcoming trip!',
                    createdAt: new Date(Date.now() - 86400000) // yesterday
                },
                {
                    id: 2,
                    fromUserId: 3,
                    toUserId: 1,
                    offeredSkill: 'Excel',
                    requestedSkill: 'Photography',
                    status: 'completed',
                    message: 'Need help with product photography for my small business',
                    createdAt: new Date(Date.now() - 172800000), // 2 days ago
                    completedAt: new Date(Date.now() - 86400000), // yesterday
                    rating: 5,
                    feedback: 'Alex was fantastic! Learned so much about photography in just one session.'
                }
            ];

            // Sample reported skills
            state.reportedSkills = [
                {
                    id: 1,
                    userId: 1,
                    skill: 'Graphic Design',
                    type: 'offered',
                    reason: 'Inappropriate description',
                    status: 'pending'
                }
            ];

            // Save to localStorage
            localStorage.setItem('users', JSON.stringify(state.users));
            localStorage.setItem('swapRequests', JSON.stringify(state.swapRequests));
            localStorage.setItem('reportedSkills', JSON.stringify(state.reportedSkills));
        }

        function setupEventListeners() {
            // Navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const screenId = this.id.replace('-link', '-screen');
                    showScreen(screenId);
                    
                    // Update active nav link
                    document.querySelectorAll('.nav-link').forEach(navLink => {
                        navLink.classList.remove('bg-indigo-700');
                    });
                    this.classList.add('bg-indigo-700');
                });
            });

            // Auth button
            document.getElementById('auth-btn').addEventListener('click', function() {
                if (state.currentUser) {
                    // Logout
                    state.currentUser = null;
                    state.isAdmin = false;
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('isAdmin');
                    updateAuthState();
                    showScreen('home-screen');
                } else {
                    // Show login modal
                    document.getElementById('login-modal').classList.remove('hidden');
                }
            });

            // Get started button
            document.getElementById('get-started').addEventListener('click', function() {
                if (state.currentUser) {
                    showScreen('profile-screen');
                } else {
                    document.getElementById('login-modal').classList.remove('hidden');
                }
            });

            // Search button
            document.getElementById('search-btn').addEventListener('click', function() {
                const searchTerm = document.getElementById('search-input').value.trim();
                if (searchTerm) {
                    searchSkills(searchTerm);
                }
            });

            // Search input enter key
            document.getElementById('search-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const searchTerm = this.value.trim();
                    if (searchTerm) {
                        searchSkills(searchTerm);
                    }
                }
            });

            // Apply filters
            document.getElementById('apply-filters').addEventListener('click', applyFilters);

            // Profile modal close
            document.getElementById('close-modal').addEventListener('click', function() {
                document.getElementById('profile-modal').classList.add('hidden');
            });

            // Swap modal close
            document.getElementById('close-swap-modal').addEventListener('click', function() {
                document.getElementById('swap-modal').classList.add('hidden');
            });

            // Login modal close
            document.getElementById('close-login-modal').addEventListener('click', function() {
                document.getElementById('login-modal').classList.add('hidden');
            });

            // Register toggle
            document.getElementById('register-toggle').addEventListener('click', function() {
                document.getElementById('login-form').classList.add('hidden');
                document.getElementById('register-form').classList.remove('hidden');
            });

            // Back to login
            document.getElementById('back-to-login').addEventListener('click', function() {
                document.getElementById('register-form').classList.add('hidden');
                document.getElementById('login-form').classList.remove('hidden');
            });

            // Login button
            document.getElementById('login-btn').addEventListener('click', function() {
                const email = document.getElementById('login-email').value.trim();
                const password = document.getElementById('login-password').value.trim();
                
                if (!email || !password) {
                    alert('Please enter both email and password');
                    return;
                }
                
                // Simulate login
                const user = state.users.find(u => u.email === email); // email check would be in real app
                if (user) {
                    state.currentUser = user;
                    state.isAdmin = user.isAdmin || false;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('isAdmin', state.isAdmin);
                    updateAuthState();
                    document.getElementById('login-modal').classList.add('hidden');
                    showScreen('home-screen');
                } else {
                    alert('Invalid credentials. Try registering first.');
                }
            });

            // Register button
            document.getElementById('register-btn').addEventListener('click', function() {
                const name = document.getElementById('register-name').value.trim();
                const email = document.getElementById('register-email').value.trim();
                const password = document.getElementById('register-password').value.trim();
                const confirmPassword = document.getElementById('register-confirm-password').value.trim();
                const isAdmin = document.getElementById('admin-checkbox').checked;
                
                if (!name || !email || !password || !confirmPassword) {
                    alert('Please fill in all fields');
                    return;
                }
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match');
                    return;
                }
                
                // Simulate registration
                const newUser = {
                    id: state.users.length + 1,
                    name,
                    email,
                    photo: 'https://placehold.co/200x200',
                    offeredSkills: [],
                    wantedSkills: [],
                    availability: [],
                    isPublic: true,
                    isAdmin
                };
                
                state.users.push(newUser);
                state.currentUser = newUser;
                state.isAdmin = isAdmin;
                localStorage.setItem('users', JSON.stringify(state.users));
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                localStorage.setItem('isAdmin', isAdmin);
                
                updateAuthState();
                document.getElementById('login-modal').classList.add('hidden');
                document.getElementById('register-form').classList.add('hidden');
                document.getElementById('login-form').classList.remove('hidden');
                
                showScreen('profile-screen');
            });

            // Save profile
            document.getElementById('save-profile').addEventListener('click', saveProfile);

            // Add offered skill
            document.getElementById('add-offered-skill').addEventListener('click', function() {
                const skillInput = document.getElementById('new-offered-skill');
                const skill = skillInput.value.trim();
                
                if (skill && state.currentUser) {
                    if (!state.currentUser.offeredSkills.includes(skill)) {
                        state.currentUser.offeredSkills.push(skill);
                        renderOfferedSkills();
                        
                        // Update in users array
                        const userIdx = state.users.findIndex(u => u.id === state.currentUser.id);
                        if (userIdx !== -1) {
                            state.users[userIdx] = state.currentUser;
                            localStorage.setItem('users', JSON.stringify(state.users));
                        }
                    }
                    skillInput.value = '';
                }
            });

            // Add wanted skill
            document.getElementById('add-wanted-skill').addEventListener('click', function() {
                const skillInput = document.getElementById('new-wanted-skill');
                const skill = skillInput.value.trim();
                
                if (skill && state.currentUser) {
                    if (!state.currentUser.wantedSkills.includes(skill)) {
                        state.currentUser.wantedSkills.push(skill);
                        renderWantedSkills();
                        
                        // Update in users array
                        const userIdx = state.users.findIndex(u => u.id === state.currentUser.id);
                        if (userIdx !== -1) {
                            state.users[userIdx] = state.currentUser;
                            localStorage.setItem('users', JSON.stringify(state.users));
                        }
                    }
                    skillInput.value = '';
                }
            });

            // Save availability
            document.getElementById('save-availability').addEventListener('click', function() {
                if (!state.currentUser) return;
                
                const checkboxes = document.querySelectorAll('input[name="availability"]:checked');
                const availability = Array.from(checkboxes).map(cb => cb.value);
                
                state.currentUser.availability = availability;
                
                // Update in users array
                const userIdx = state.users.findIndex(u => u.id === state.currentUser.id);
                if (userIdx !== -1) {
                    state.users[userIdx] = state.currentUser;
                    localStorage.setItem('users', JSON.stringify(state.users));
                }
                
                alert('Availability saved successfully');
            });

            // Confirm swap
            document.getElementById('confirm-swap').addEventListener('click', function() {
                if (!state.currentUser) return;
                
                const fromUserId = state.currentUser.id;
                const toUserId = parseInt(document.getElementById('swap-modal').dataset.userId);
                const offeredSkill = document.getElementById('swapping-skill').textContent;
                const requestedSkill = document.getElementById('requested-skill').textContent;
                const message = document.getElementById('swap-message').value.trim();
                
                const newRequest = {
                    id: state.swapRequests.length + 1,
                    fromUserId,
                    toUserId,
                    offeredSkill,
                    requestedSkill,
                    status: 'pending',
                    message,
                    createdAt: new Date()
                };
                
                state.swapRequests.push(newRequest);
                localStorage.setItem('swapRequests', JSON.stringify(state.swapRequests));
                
                document.getElementById('swap-modal').classList.add('hidden');
                document.getElementById('swap-message').value = '';
                
                alert('Swap request sent successfully!');
                
                // If on requests screen, refresh
                if (document.getElementById('requests-screen').classList.contains('active')) {
                    renderSwapRequests();
                }
            });
        }

        function showScreen(screenId) {
            // Hide all screens
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
                screen.classList.remove('active');
            });
            
            // Show requested screen
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.remove('hidden');
                screen.classList.add('active');
                
                // Load screen-specific content
                switch(screenId) {
                    case 'home-screen':
                        // No special initialization needed
                        break;
                    case 'browse-screen':
                        renderBrowseScreen();
                        break;
                    case 'profile-screen':
                        if (state.currentUser) {
                            renderProfileScreen();
                        } else {
                            document.getElementById('login-modal').classList.remove('hidden');
                            showScreen('home-screen');
                        }
                        break;
                    case 'requests-screen':
                        if (state.currentUser) {
                            renderSwapRequests();
                        } else {
                            document.getElementById('login-modal').classList.remove('hidden');
                            showScreen('home-screen');
                        }
                        break;
                    case 'admin-screen':
                        if (state.isAdmin) {
                            renderAdminScreen();
                            document.getElementById('admin-link').classList.remove('hidden');
                        } else {
                            showScreen('home-screen');
                        }
                        break;
                }
            } else {
                // Default to home screen if not found
                showScreen('home-screen');
            }
        }

        function updateAuthState() {
            const authBtn = document.getElementById('auth-btn');
            if (state.currentUser) {
                authBtn.textContent = 'Logout';
                
                // Show admin link if admin
                if (state.isAdmin) {
                    document.getElementById('admin-link').classList.remove('hidden');
                } else {
                    document.getElementById('admin-link').classList.add('hidden');
                }
            } else {
                authBtn.textContent = 'Login';
                document.getElementById('admin-link').classList.add('hidden');
            }
        }

        function renderBrowseScreen() {
            const profilesGrid = document.getElementById('profiles-grid');
            profilesGrid.innerHTML = '';
            
            // Get public profiles only
            const publicProfiles = state.users.filter(user => 
                user.isPublic && (!state.currentUser || user.id !== state.currentUser.id)
            );
            
            if (publicProfiles.length === 0) {
                profilesGrid.innerHTML = '<p class="text-gray-500 col-span-3 text-center py-8">No public profiles found</p>';
                return;
            }
            
            publicProfiles.forEach(user => {
                const profileCard = document.createElement('div');
                profileCard.className = 'profile-card bg-white rounded-lg shadow-sm p-6 hover:shadow-md';
                
                profileCard.innerHTML = `
                    <div class="flex items-center mb-4">
                        <img src="${user.photo}" alt="Profile photo of ${user.name}" class="w-16 h-16 rounded-full object-cover">
                        <div class="ml-4">
                            <h3 class="font-bold text-gray-800">${user.name}</h3>
                            <p class="text-sm text-gray-600">${user.location || 'Location not specified'}</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Offers:</h4>
                        <div class="flex flex-wrap gap-1">
                            ${user.offeredSkills.map(skill => `
                                <span class="skill-tag inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Wants:</h4>
                        <div class="flex flex-wrap gap-1">
                            ${user.wantedSkills.map(skill => `
                                <span class="skill-tag inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mb-3">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Available:</h4>
                        <p class="text-xs text-gray-600">${user.availability.length > 0 ? 
                            user.availability.join(', ') : 'No availability specified'}</p>
                    </div>
                    <button class="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 view-profile-btn" data-user-id="${user.id}">
                        View Profile
                    </button>
                `;
                
                profilesGrid.appendChild(profileCard);
            });
            
            // Add event listeners to view profile buttons
            document.querySelectorAll('.view-profile-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const userId = parseInt(this.dataset.userId);
                    viewProfile(userId);
                });
            });
        }

        function viewProfile(userId) {
            const user = state.users.find(u => u.id === userId);
            if (!user) return;
            
            document.getElementById('modal-profile-name').textContent = user.name;
            const modalContent = document.getElementById('modal-profile-content');
            
            modalContent.innerHTML = `
                <div class="flex items-center mb-4">
                    <img src="${user.photo}" alt="Profile photo of ${user.name}" class="w-20 h-20 rounded-full object-cover">
                    <div class="ml-4">
                        <p class="text-gray-600">${user.location || 'Location not specified'}</p>
                        ${user.availability.length > 0 ? 
                            `<p class="text-sm text-gray-600 mt-1"><span class="font-medium">Available:</span> ${user.availability.join(', ')}</p>` : 
                            ''}
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-medium text-gray-800 mb-2">Skills Offered</h4>
                    <div class="flex flex-wrap gap-2">
                        ${user.offeredSkills.map(skill => `
                            <span class="skill-tag inline-block bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">${skill}</span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="mb-6">
                    <h4 class="font-medium text-gray-800 mb-2">Skills Wanted</h4>
                    <div class="flex flex-wrap gap-2">
                        ${user.wantedSkills.map(skill => `
                            <span class="skill-tag inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">${skill}</span>
                        `).join('')}
                    </div>
                </div>
                
                ${state.currentUser && state.currentUser.id !== user.id ? `
                    <div class="space-y-2">
                        <h4 class="font-medium text-gray-800">Request a Skill Swap</h4>
                        <p class="text-sm text-gray-600">Select a skill you can offer in exchange for one of their skills</p>
                        
                        <div class="space-y-3 mt-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">I can offer:</label>
                                <select class="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" id="modal-offered-skill">
                                    ${state.currentUser.offeredSkills.map(skill => `
                                        <option value="${skill}">${skill}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">In exchange for:</label>
                                <select class="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" id="modal-requested-skill">
                                    ${user.wantedSkills.map(skill => `
                                        <option value="${skill}">${skill}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <button class="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" id="initiate-swap-btn">
                                Request Swap
                            </button>
                        </div>
                    </div>
                ` : ''}
            `;
            
            // Add listener for initiate swap button
            if (state.currentUser && state.currentUser.id !== user.id) {
                document.getElementById('initiate-swap-btn').addEventListener('click', function() {
                    const offeredSkill = document.getElementById('modal-offered-skill').value;
                    const requestedSkill = document.getElementById('modal-requested-skill').value;
                    
                    document.getElementById('swap-modal').dataset.userId = user.id;
                    document.getElementById('swapping-skill').textContent = offeredSkill;
                    document.getElementById('requested-skill').textContent = requestedSkill;
                    document.getElementById('swap-partner').textContent = user.name;
                    
                    document.getElementById('profile-modal').classList.add('hidden');
                    document.getElementById('swap-modal').classList.remove('hidden');
                });
            }
            
            document.getElementById('profile-modal').classList.remove('hidden');
        }

        function searchSkills(term) {
            const results = state.users.filter(user => 
                (user.isPublic && (!state.currentUser || user.id !== state.currentUser.id)) &&
                (user.name.toLowerCase().includes(term.toLowerCase()) ||
                user.offeredSkills.some(skill => skill.toLowerCase().includes(term.toLowerCase())) ||
                user.wantedSkills.some(skill => skill.toLowerCase().includes(term.toLowerCase())))
            );
            
            const profilesGrid = document.getElementById('profiles-grid');
            profilesGrid.innerHTML = '';
            
            if (results.length === 0) {
                profilesGrid.innerHTML = '<p class="text-gray-500 col-span-3 text-center py-8">No matching profiles found</p>';
                return;
            }
            
            results.forEach(user => {
                const profileCard = document.createElement('div');
                profileCard.className = 'profile-card bg-white rounded-lg shadow-sm p-6 hover:shadow-md';
                
                profileCard.innerHTML = `
                    <div class="flex items-center mb-4">
                        <img src="${user.photo}" alt="Profile photo of ${user.name}" class="w-16 h-16 rounded-full object-cover">
                        <div class="ml-4">
                            <h3 class="font-bold text-gray-800">${user.name}</h3>
                            <p class="text-sm text-gray-600">${user.location || 'Location not specified'}</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Offers:</h4>
                        <div class="flex flex-wrap gap-1">
                            ${user.offeredSkills.map(skill => `
                                <span class="skill-tag inline-block ${skill.toLowerCase().includes(term.toLowerCase()) ? 
                                    'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                                    'bg-indigo-100 text-indigo-800'} text-xs px-2 py-1 rounded-full">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Wants:</h4>
                        <div class="flex flex-wrap gap-1">
                            ${user.wantedSkills.map(skill => `
                                <span class="skill-tag inline-block ${skill.toLowerCase().includes(term.toLowerCase()) ? 
                                    'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                                    'bg-green-100 text-green-800'} text-xs px-2 py-1 rounded-full">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                    <button class="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 view-profile-btn" data-user-id="${user.id}">
                        View Profile
                    </button>
                `;
                
                profilesGrid.appendChild(profileCard);
            });
            
            // Add event listeners to view profile buttons
            document.querySelectorAll('.view-profile-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const userId = parseInt(this.dataset.userId);
                    viewProfile(userId);
                });
            });
            
            // Show browse screen if not already visible
            showScreen('browse-screen');
        }

        function applyFilters() {
            const skillFilter = document.getElementById('skill-filter').value;
            const availabilityFilter = document.getElementById('availability-filter').value;
            
            let filteredUsers = state.users.filter(user => 
                user.isPublic && (!state.currentUser || user.id !== state.currentUser.id)
            );
            
            if (skillFilter) {
                filteredUsers = filteredUsers.filter(user => 
                    user.offeredSkills.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase())) ||
                    user.wantedSkills.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()))
                );
            }
            
            if (availabilityFilter) {
                filteredUsers = filteredUsers.filter(user => 
                    user.availability.includes(availabilityFilter)
                );
            }
            
            const profilesGrid = document.getElementById('profiles-grid');
            profilesGrid.innerHTML = '';
            
            if (filteredUsers.length === 0) {
                profilesGrid.innerHTML = '<p class="text-gray-500 col-span-3 text-center py-8">No matching profiles found</p>';
                return;
            }
            
            filteredUsers.forEach(user => {
                const profileCard = document.createElement('div');
                profileCard.className = 'profile-card bg-white rounded-lg shadow-sm p-6 hover:shadow-md';
                
                profileCard.innerHTML = `
                    <div class="flex items-center mb-4">
                        <img src="${user.photo}" alt="Profile photo of ${user.name}" class="w-16 h-16 rounded-full object-cover">
                        <div class="ml-4">
                            <h3 class="font-bold text-gray-800">${user.name}</h3>
                            <p class="text-sm text-gray-600">${user.location || 'Location not specified'}</p>
                        </div>
                    </div>
                    <div class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Offers:</h4>
                        <div class="flex flex-wrap gap-1">
                            ${user.offeredSkills.map(skill => `
                                <span class="skill-tag inline-block ${skillFilter && skill.toLowerCase().includes(skillFilter.toLowerCase()) ? 
                                    'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                                    'bg-indigo-100 text-indigo-800'} text-xs px-2 py-1 rounded-full">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mb-4">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Wants:</h4>
                        <div class="flex flex-wrap gap-1">
                            ${user.wantedSkills.map(skill => `
                                <span class="skill-tag inline-block ${skillFilter && skill.toLowerCase().includes(skillFilter.toLowerCase()) ? 
                                    'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                                    'bg-green-100 text-green-800'} text-xs px-2 py-1 rounded-full">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mb-3">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Available:</h4>
                        <p class="text-xs text-gray-600">
                            ${user.availability.map(avail => 
                                availabilityFilter && avail === availabilityFilter ? 
                                `<span class="font-medium">${avail}</span>` : avail
                            ).join(', ') || 'No availability specified'}
                        </p>
                    </div>
                    <button class="w-full mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 view-profile-btn" data-user-id="${user.id}">
                        View Profile
                    </button>
                `;
                
                profilesGrid.appendChild(profileCard);
            });
            
            // Add event listeners to view profile buttons
            document.querySelectorAll('.view-profile-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const userId = parseInt(this.dataset.userId);
                    viewProfile(userId);
                });
            });
        }

        function renderProfileScreen() {
            if (!state.currentUser) return;
            
            const user = state.currentUser;
            
            // Basic info
            document.getElementById('name').value = user.name || '';
            document.getElementById('location').value = user.location || '';
            
            // Profile visibility
            document.getElementById(user.isPublic ? 'public-profile' : 'private-profile').checked = true;
            
            // Profile photo
            document.getElementById('profile-photo').src = user.photo;
            
            // Offered skills
            renderOfferedSkills();
            
            // Wanted skills
            renderWantedSkills();
            
            // Availability
            document.querySelectorAll('input[name="availability"]').forEach(checkbox => {
                checkbox.checked = user.availability.includes(checkbox.value);
            });
        }

        function renderOfferedSkills() {
            if (!state.currentUser) return;
            
            const list = document.getElementById('offered-skills-list');
            list.innerHTML = '';
            
            if (state.currentUser.offeredSkills.length === 0) {
                list.innerHTML = '<p class="text-gray-500 italic">No skills added yet</p>';
                return;
            }
            
            state.currentUser.offeredSkills.forEach((skill, index) => {
                const skillItem = document.createElement('div');
                skillItem.className = 'flex justify-between items-center py-2 border-b border-gray-100';
                skillItem.innerHTML = `
                    <span>${skill}</span>
                    <button class="text-red-500 hover:text-red-700 remove-offered-skill" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                `;
                list.appendChild(skillItem);
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-offered-skill').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    state.currentUser.offeredSkills.splice(index, 1);
                    renderOfferedSkills();
                    
                    // Update in users array
                    const userIdx = state.users.findIndex(u => u.id === state.currentUser.id);
                    if (userIdx !== -1) {
                        state.users[userIdx] = state.currentUser;
                        localStorage.setItem('users', JSON.stringify(state.users));
                    }
                });
            });
        }

        function renderWantedSkills() {
            if (!state.currentUser) return;
            
            const list = document.getElementById('wanted-skills-list');
            list.innerHTML = '';
            
            if (state.currentUser.wantedSkills.length === 0) {
                list.innerHTML = '<p class="text-gray-500 italic">No skills added yet</p>';
                return;
            }
            
            state.currentUser.wantedSkills.forEach((skill, index) => {
                const skillItem = document.createElement('div');
                skillItem.className = 'flex justify-between items-center py-2 border-b border-gray-100';
                skillItem.innerHTML = `
                    <span>${skill}</span>
                    <button class="text-red-500 hover:text-red-700 remove-wanted-skill" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                `;
                list.appendChild(skillItem);
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-wanted-skill').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.dataset.index);
                    state.currentUser.wantedSkills.splice(index, 1);
                    renderWantedSkills();
                    
                    // Update in users array
                    const userIdx = state.users.findIndex(u => u.id === state.currentUser.id);
                    if (userIdx !== -1) {
                        state.users[userIdx] = state.currentUser;
                        localStorage.setItem('users', JSON.stringify(state.users));
                    }
                });
            });
        }

        function saveProfile() {
            if (!state.currentUser) return;
            
            const name = document.getElementById('name').value.trim();
            const location = document.getElementById('location').value.trim();
            const isPublic = document.getElementById('public-profile').checked;
            
            if (!name) {
                alert('Please enter your name');
                return;
            }
            
            // Update current user
            state.currentUser.name = name;
            state.currentUser.location = location;
            state.currentUser.isPublic = isPublic;
            
            // Update in users array
            const userIdx = state.users.findIndex(u => u.id === state.currentUser.id);
            if (userIdx !== -1) {
                state.users[userIdx] = state.currentUser;
                localStorage.setItem('users', JSON.stringify(state.users));
            }
            
            // Update storage
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
            
            alert('Profile saved successfully!');
        }

        function renderSwapRequests() {
            if (!state.currentUser) return;
            
            const pendingContainer = document.getElementById('pending-requests');
            const historyContainer = document.getElementById('requests-history');
            
            // Get requests related to current user
            const receivedRequests = state.swapRequests.filter(
                req => req.toUserId === state.currentUser.id && req.status === 'pending'
            );
            
            const sentRequests = state.swapRequests.filter(
                req => req.fromUserId === state.currentUser.id && req.status === 'pending'
            );
            
            const historyRequests = state.swapRequests.filter(
                req => (req.fromUserId === state.currentUser.id || req.toUserId === state.currentUser.id) &&
                       req.status !== 'pending'
            ).sort((a, b) => new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt));
            
            // Render pending (received) requests
            if (receivedRequests.length === 0 && sentRequests.length === 0) {
                pendingContainer.innerHTML = '<p class="text-gray-500 italic">No pending requests at the moment</p>';
            } else {
                pendingContainer.innerHTML = '';
                
                if (receivedRequests.length > 0) {
                    receivedRequests.forEach(request => {
                        const fromUser = state.users.find(u => u.id === request.fromUserId);
                        if (!fromUser) return;
                        
                        const requestEl = document.createElement('div');
                        requestEl.className = 'border-b border-gray-200 pb-4 mb-4';
                        requestEl.innerHTML = `
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-medium">${fromUser.name} wants to swap:</p>
                                    <p class="text-indigo-600">${request.requestedSkill} (your skill)</p>
                                    <p>for their:</p>
                                    <p class="text-green-600">${request.offeredSkill}</p>
                                    ${request.message ? `<p class="text-sm text-gray-600 mt-2">"${request.message}"</p>` : ''}
                                    <p class="text-xs text-gray-500 mt-2">Requested ${formatDate(request.createdAt)}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <button class="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium accept-request" data-request-id="${request.id}">
                                        Accept
                                    </button>
                                    <button class="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium reject-request" data-request-id="${request.id}">
                                        Reject
                                    </button>
                                </div>
                            </div>
                        `;
                        pendingContainer.appendChild(requestEl);
                    });
                }
                
                if (sentRequests.length > 0) {
                    const sentHeader = document.createElement('h4');
                    sentHeader.className = 'text-sm font-medium text-gray-700 mt-6 mb-2';
                    sentHeader.textContent = 'Your Pending Requests';
                    pendingContainer.appendChild(sentHeader);
                    
                    sentRequests.forEach(request => {
                        const toUser = state.users.find(u => u.id === request.toUserId);
                        if (!toUser) return;
                        
                        const requestEl = document.createElement('div');
                        requestEl.className = 'border-b border-gray-200 pb-4 mb-4';
                        requestEl.innerHTML = `
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-medium">You requested ${toUser.name} to swap:</p>
                                    <p class="text-indigo-600">${request.offeredSkill} (your skill)</p>
                                    <p>for their:</p>
                                    <p class="text-green-600">${request.requestedSkill}</p>
                                    ${request.message ? `<p class="text-sm text-gray-600 mt-2">"${request.message}"</p>` : ''}
                                    <p class="text-xs text-gray-500 mt-2">Requested ${formatDate(request.createdAt)}</p>
                                </div>
                                <button class="px-3 py-1 bg-gray-100 text-gray-800 rounded-md text-sm font-medium cancel-request" data-request-id="${request.id}">
                                    Cancel
                                </button>
                            </div>
                        `;
                        pendingContainer.appendChild(requestEl);
                    });
                }
            }
            
            // Render history
            if (historyRequests.length === 0) {
                historyContainer.innerHTML = '<p class="text-gray-500 italic">No swap history yet</p>';
            } else {
                historyContainer.innerHTML = '';
                
                historyRequests.forEach(request => {
                    const isFromMe = request.fromUserId === state.currentUser.id;
                    const otherUserId = isFromMe ? request.toUserId : request.fromUserId;
                    const otherUser = state.users.find(u => u.id === otherUserId);
                    if (!otherUser) return;
                    
                    const requestEl = document.createElement('div');
                    requestEl.className = 'border-b border-gray-200 pb-4 mb-4';
                    
                    let statusBadge = '';
                    if (request.status === 'completed') {
                        statusBadge = '<span class="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-md">Completed</span>';
                    } else if (request.status === 'rejected') {
                        statusBadge = '<span class="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-md">Rejected</span>';
                    } else if (request.status === 'cancelled') {
                        statusBadge = '<span class="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">Cancelled</span>';
                    }
                    
                    requestEl.innerHTML = `
                        <div>
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-medium">${isFromMe ? 'You' : otherUser.name} offered ${isFromMe ? otherUser.name : 'you'} a swap:</p>
                                    <p class="text-indigo-600">${isFromMe ? request.offeredSkill : request.requestedSkill} (${isFromMe ? 'your skill' : 'their skill'})</p>
                                    <p>for ${isFromMe ? 'their' : 'your'}:</p>
                                    <p class="text-green-600">${isFromMe ? request.requestedSkill : request.offeredSkill}</p>
                                </div>
                                ${statusBadge}
                            </div>
                            
                            ${request.message ? `<p class="text-sm text-gray-600 mt-2">"${request.message}"</p>` : ''}
                            
                            <div class="flex justify-between items-center mt-2">
                                <p class="text-xs text-gray-500">
                                    ${isFromMe ? 'You requested' : 'Received'} ${formatDate(request.createdAt)}
                                    ${request.completedAt ? `• Completed ${formatDate(request.completedAt)}` : ''}
                                </p>
                                
                                ${request.status === 'completed' && isFromMe && !request.rating ? 
                                    `<button class="text-xs text-indigo-600 hover:text-indigo-800 rate-swap" data-request-id="${request.id}">
                                        Rate this swap
                                    </button>` : ''}
                            </div>
                            
                            ${request.rating ? `
                                <div class="mt-2 text-sm">
                                    <p>Rating: ${'★'.repeat(request.rating)}${'☆'.repeat(5 - request.rating)}</p>
                                    ${request.feedback ? `<p class="text-gray-600">Feedback: "${request.feedback}"</p>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `;
                    historyContainer.appendChild(requestEl);
                });
            }
            
            // Add event listeners to action buttons
            document.querySelectorAll('.accept-request').forEach(btn => {
                btn.addEventListener('click', function() {
                    const requestId = parseInt(this.dataset.requestId);
                    updateRequestStatus(requestId, 'completed');
                });
            });
            
            document.querySelectorAll('.reject-request').forEach(btn => {
                btn.addEventListener('click', function() {
                    const requestId = parseInt(this.dataset.requestId);
                    updateRequestStatus(requestId, 'rejected');
                });
            });
            
            document.querySelectorAll('.cancel-request').forEach(btn => {
                btn.addEventListener('click', function() {
                    const requestId = parseInt(this.dataset.requestId);
                    updateRequestStatus(requestId, 'cancelled');
                });
            });
            
            document.querySelectorAll('.rate-swap').forEach(btn => {
                btn.addEventListener('click', function() {
                    const requestId = parseInt(this.dataset.requestId);
                    rateSwap(requestId);
                });
            });
        }

        function updateRequestStatus(requestId, newStatus) {
            const requestIdx = state.swapRequests.findIndex(req => req.id === requestId);
            if (requestIdx === -1) return;
            
            if (newStatus === 'completed') {
                const rating = prompt('Rate this swap (1-5 stars):');
                if (rating && rating >= 1 && rating <= 5) {
                    const feedback = prompt('Optional feedback:');
                    
                    state.swapRequests[requestIdx].status = 'completed';
                    state.swapRequests[requestIdx].completedAt = new Date();
                    state.swapRequests[requestIdx].rating = parseInt(rating);
                    state.swapRequests[requestIdx].feedback = feedback || '';
                } else {
                    alert('Please enter a valid rating between 1 and 5');
                    return;
                }
            } else {
                state.swapRequests[requestIdx].status = newStatus;
            }
            
            localStorage.setItem('swapRequests', JSON.stringify(state.swapRequests));
            renderSwapRequests();
        }

        function rateSwap(requestId) {
            const requestIdx = state.swapRequests.findIndex(req => req.id === requestId);
            if (requestIdx === -1) return;
            
            const rating = prompt('Rate this swap (1-5 stars):');
            if (rating && rating >= 1 && rating <= 5) {
                const feedback = prompt('Optional feedback:');
                
                state.swapRequests[requestIdx].rating = parseInt(rating);
                state.swapRequests[requestIdx].feedback = feedback || '';
                
                localStorage.setItem('swapRequests', JSON.stringify(state.swapRequests));
                renderSwapRequests();
            } else {
                alert('Please enter a valid rating between 1 and 5');
            }
        }

        function renderAdminScreen() {
            // User search section will be empty initially
            document.getElementById('admin-user-results').innerHTML = '<p class="text-gray-500 italic">Search for users to manage</p>';
            
            // Set up search user button
            document.getElementById('search-user-btn').addEventListener('click', function() {
                const searchTerm = document.getElementById('search-user').value.trim();
                if (!searchTerm) return;
                
                const results = state.users.filter(user => 
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                
                const resultsContainer = document.getElementById('admin-user-results');
                resultsContainer.innerHTML = '';
                
                if (results.length === 0) {
                    resultsContainer.innerHTML = '<p class="text-gray-500 italic">No matching users found</p>';
                    return;
                }
                
                results.forEach(user => {
                    const userEl = document.createElement('div');
                    userEl.className = 'border-b border-gray-200 pb-3 mb-3';
                    userEl.innerHTML = `
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="font-medium">${user.name}</p>
                                ${user.email ? `<p class="text-sm text-gray-600">${user.email}</p>` : ''}
                                <p class="text-xs text-gray-500">${user.isPublic ? 'Public profile' : 'Private profile'}${user.isAdmin ? ' • Admin' : ''}</p>
                            </div>
                            <button class="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium ban-user-btn" data-user-id="${user.id}" ${user.isAdmin ? 'disabled' : ''}>
                                Ban
                            </button>
                        </div>
                    `;
                    resultsContainer.appendChild(userEl);
                });
                
                // Add event listeners to ban buttons
                document.querySelectorAll('.ban-user-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const userId = parseInt(this.dataset.userId);
                        if (confirm(`Are you sure you want to ban this user?`)) {
                            banUser(userId);
                        }
                    });
                });
            });
            
            // Set up download reports buttons
            document.getElementById('download-user-reports').addEventListener('click', function() {
                alert('User activity report downloaded (simulated)');
            });
            
            document.getElementById('download-feedback-reports').addEventListener('click', function() {
                alert('Feedback logs report downloaded (simulated)');
            });
            
            document.getElementById('download-swap-reports').addEventListener('click', function() {
                alert('Swap statistics report downloaded (simulated)');
            });
            
            // Set up send platform message button
            document.getElementById('send-platform-message').addEventListener('click', function() {
                const message = document.getElementById('platform-message').value.trim();
                if (!message) {
                    alert('Please enter a message');
                    return;
                }
                
                alert('Platform message sent to all users (simulated)');
                document.getElementById('platform-message').value = '';
            });
            
            // Render reported skills
            const reportedSkillsContainer = document.getElementById('reported-skills');
            reportedSkillsContainer.innerHTML = '';
            
            if (state.reportedSkills.length === 0) {
                reportedSkillsContainer.innerHTML = '<p class="text-gray-500 italic p-3">No reported skills at the moment</p>';
            } else {
                state.reportedSkills.forEach(report => {
                    const user = state.users.find(u => u.id === report.userId);
                    if (!user) return;
                    
                    const reportEl = document.createElement('div');
                    reportEl.className = 'flex items-center justify-between p-3 border-b border-gray-200';
                    reportEl.innerHTML = `
                        <div>
                            <p class="font-medium">User: ${user.name}</p>
                            <p>Skill: ${report.skill} (${report.type})</p>
                            <p class="text-sm text-gray-500">Report reason: ${report.reason}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button class="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium approve-report-btn" data-report-id="${report.id}">
                                Approve
                            </button>
                            <button class="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium reject-report-btn" data-report-id="${report.id}">
                                Reject
                            </button>
                        </div>
                    `;
                    reportedSkillsContainer.appendChild(reportEl);
                });
            }
            
            // Add event listeners to report action buttons
            document.querySelectorAll('.approve-report-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const reportId = parseInt(this.dataset.reportId);
                    handleReport(reportId, 'approved');
                });
            });
            
            document.querySelectorAll('.reject-report-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const reportId = parseInt(this.dataset.reportId);
                    handleReport(reportId, 'rejected');
                });
            });
        }

        function banUser(userId) {
            // In a real app, this would mark the user as banned in the database
            // Here we'll just filter them out from public view
            const userIdx = state.users.findIndex(u => u.id === userId);
            if (userIdx === -1) return;
            
            state.users[userIdx].isPublic = false;
            localStorage.setItem('users', JSON.stringify(state.users));
            
            // Reload admin screen
            renderAdminScreen();
            alert('User has been banned (profile set to private)');
        }

        function handleReport(reportId, action) {
            const reportIdx = state.reportedSkills.findIndex(r => r.id === reportId);
            if (reportIdx === -1) return;
            
            // In a real app, we'd actually take action:
            // - If approved, remove the reported skill from the user's profile
            // - If rejected, keep the skill as is
            // Here we'll just remove the report
            state.reportedSkills.splice(reportIdx, 1);
            localStorage.setItem('reportedSkills', JSON.stringify(state.reportedSkills));
            
            renderAdminScreen();
            alert(`Report ${action}`);
        }

        function formatDate(date) {
            const d = new Date(date);
            return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        }
