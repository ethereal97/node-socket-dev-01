const socket = io();

let cookies = {
    update(key, value) {
        document.cookie = `${key}=${value}; expires=${(new Date(0)).toLocaleTimeString()}; path=/`;
    }
};

document.cookie
    .split(';')
    .filter(c => c.trim() != '')
    .forEach(cookie => {
        var key, value;
        [key, value] = cookie.split('=').map(c => c.trim());
        cookies[key] = value || null;
    });

const el = {
    beginner: document.querySelector('#beginner'),
    intermediate: document.querySelector('#intermediate'),
    advanced: document.querySelector('#advanced'),
};

el.beginner.addEventListener('click', function() { 
    socket.emit('joinRoom', {
        room: 'beginner',
        username: cookies.username
    });
});

el.intermediate.addEventListener('click', function() { 
    socket.emit('joinRoom', {
        room: 'intermediate',
        username: cookies.username
    });
});

el.advanced.addEventListener('click', function() { 
    socket.emit('joinRoom', {
        room: 'advanced',
        username: cookies.username
    });
});
