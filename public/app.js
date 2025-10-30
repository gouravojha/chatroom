// API Configuration
const API_URL = window.location.origin;
const WS_URL = `ws://${window.location.host}/ws`;

// State
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let ws = null;
let currentRoomId = null;
let rooms = [];

// DOM Elements
const authSection = document.getElementById('auth-section');
const chatSection = document.getElementById('chat-section');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authError = document.getElementById('auth-error');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const loginFormContainer = document.getElementById('login-form');
const signupFormContainer = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const userNameSpan = document.getElementById('user-name');
const createRoomBtn = document.getElementById('create-room-btn');
const roomNameInput = document.getElementById('room-name-input');
const roomsList = document.getElementById('rooms-list');
const noRoomSelected = document.getElementById('no-room-selected');
const chatRoom = document.getElementById('chat-room');
const currentRoomName = document.getElementById('current-room-name');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const leaveRoomBtn = document.getElementById('leave-room-btn');

// Initialize
if (token && currentUser) {
    showChatSection();
} else {
    showAuthSection();
}

// Auth Event Listeners
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'none';
    signupFormContainer.style.display = 'block';
    authError.textContent = '';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupFormContainer.style.display = 'none';
    loginFormContainer.style.display = 'block';
    authError.textContent = '';
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            token = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showChatSection();
        } else {
            authError.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        authError.textContent = 'Network error. Please try again.';
        console.error('Login error:', error);
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        const data = await response.json();

        if (data.success) {
            token = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showChatSection();
        } else {
            authError.textContent = data.error || 'Signup failed';
        }
    } catch (error) {
        authError.textContent = 'Network error. Please try again.';
        console.error('Signup error:', error);
    }
});

logoutBtn.addEventListener('click', () => {
    if (ws) {
        ws.close();
    }
    token = null;
    currentUser = null;
    currentRoomId = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuthSection();
});

// Chat Event Listeners
createRoomBtn.addEventListener('click', async () => {
    const roomName = roomNameInput.value.trim();
    if (!roomName) return;

    try {
        const response = await fetch(`${API_URL}/api/chatrooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ roomName })
        });

        const data = await response.json();

        if (data.success) {
            roomNameInput.value = '';
            await loadRooms();
            joinRoom(data.data.roomId);
        } else {
            alert(data.error || 'Failed to create room');
        }
    } catch (error) {
        alert('Network error. Please try again.');
        console.error('Create room error:', error);
    }
});

sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

leaveRoomBtn.addEventListener('click', () => {
    if (currentRoomId && ws) {
        ws.send(JSON.stringify({
            type: 'leave',
            payload: { roomId: currentRoomId }
        }));
        currentRoomId = null;
        showNoRoom();
    }
});

// Functions
function showAuthSection() {
    authSection.style.display = 'block';
    chatSection.style.display = 'none';
}

function showChatSection() {
    authSection.style.display = 'none';
    chatSection.style.display = 'block';
    userNameSpan.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    initializeWebSocket();
    loadRooms();
}

function initializeWebSocket() {
    ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
        console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds if still logged in
        if (token) {
            setTimeout(() => {
                if (token) initializeWebSocket();
            }, 3000);
        }
    };
}

function handleWebSocketMessage(message) {
    switch (message.type) {
        case 'history':
            displayMessageHistory(message.payload.messages);
            break;
        case 'message':
            displayMessage(message.payload);
            break;
        case 'user_joined':
            displaySystemMessage(`${message.payload.userName} joined the room`);
            break;
        case 'user_left':
            displaySystemMessage(`${message.payload.userName} left the room`);
            break;
        case 'error':
            alert(message.payload.message);
            break;
    }
}

async function loadRooms() {
    try {
        const response = await fetch(`${API_URL}/api/chatrooms`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            rooms = data.data;
            displayRooms();
        }
    } catch (error) {
        console.error('Load rooms error:', error);
    }
}

function displayRooms() {
    roomsList.innerHTML = '';
    rooms.forEach(room => {
        const roomItem = document.createElement('div');
        roomItem.className = 'room-item';
        if (room.roomId === currentRoomId) {
            roomItem.classList.add('active');
        }
        roomItem.innerHTML = `
            <h3>${room.roomName}</h3>
            <p>${room.participants.length} participant(s)</p>
        `;
        roomItem.addEventListener('click', () => joinRoom(room.roomId));
        roomsList.appendChild(roomItem);
    });
}

async function joinRoom(roomId) {
    // Leave current room if any
    if (currentRoomId && ws) {
        ws.send(JSON.stringify({
            type: 'leave',
            payload: { roomId: currentRoomId }
        }));
    }

    try {
        // Join room via REST API
        const response = await fetch(`${API_URL}/api/chatrooms/${roomId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            currentRoomId = roomId;
            const room = rooms.find(r => r.roomId === roomId);
            currentRoomName.textContent = room ? room.roomName : 'Chat Room';
            
            // Clear messages
            messagesContainer.innerHTML = '';
            
            // Show chat room
            noRoomSelected.style.display = 'none';
            chatRoom.style.display = 'flex';
            chatRoom.style.flexDirection = 'column';
            
            // Join via WebSocket
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'join',
                    payload: { roomId }
                }));
            }
            
            // Update room list
            displayRooms();
        } else {
            alert(data.error || 'Failed to join room');
        }
    } catch (error) {
        alert('Network error. Please try again.');
        console.error('Join room error:', error);
    }
}

function showNoRoom() {
    chatRoom.style.display = 'none';
    noRoomSelected.style.display = 'flex';
    displayRooms();
}

function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentRoomId || !ws) return;

    ws.send(JSON.stringify({
        type: 'message',
        payload: { content }
    }));

    messageInput.value = '';
}

function displayMessageHistory(messages) {
    messagesContainer.innerHTML = '';
    messages.forEach(msg => displayMessage(msg));
    scrollToBottom();
}

function displayMessage(msg) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    if (msg.senderId === currentUser.userId) {
        messageDiv.classList.add('own');
    }

    const time = new Date(msg.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${msg.senderName || 'Unknown'}</span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-content">${escapeHtml(msg.content)}</div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function displaySystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'system-message';
    messageDiv.textContent = text;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}