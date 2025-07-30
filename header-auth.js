async function getUserInfo() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    try {
        const response = await fetch('https://gateway.scan-interfax.ru/api/v1/account/info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            return await response.json();
        } else if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('expire');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
    return null;
}

async function updateAuthenticatedHeader() {
    const token = localStorage.getItem('accessToken');
    const expire = localStorage.getItem('expire');
    
    if (!token || !expire || new Date(expire) <= new Date()) {
        return;
    }
    
    let userInfo = document.querySelector('.user-info');
    
    if (!userInfo) {
        const authButtons = document.querySelector('.auth-buttons') || document.querySelector('.reg');
        if (!authButtons) return;
        const userInfoDiv = document.createElement('div');
        userInfoDiv.className = 'user-info';
        userInfoDiv.innerHTML = `
            <div class="limits">
                <div class="limit-item">
                    <span class="limit-label">Использовано компаний</span>
                    <span class="limit-value loading">
                        <img src="loading.png" alt="Loading" class="loading-spinner">
                    </span>
                </div>
                <div class="limit-item">
                    <span class="limit-label">Лимит по компаниям</span>
                    <span class="limit-value green loading">
                        <img src="loading.png" alt="Loading" class="loading-spinner">
                    </span>
                </div>
            </div>
            <div class="user-profile">
                <span class="user-name">Загрузка...</span>
                <button class="logout-btn" onclick="window.logout()">Выйти</button>
                <div class="user-avatar">
                    <img src="defolt img.jpg" alt="Аватар">
                </div>
            </div>
        `;

        authButtons.parentNode.replaceChild(userInfoDiv, authButtons);
        userInfo = userInfoDiv;
    }

    const userData = await getUserInfo();
    if (userData) {
        const limitItems = document.querySelectorAll('.limit-item');
        if (limitItems[0]) {
            const usedValue = limitItems[0].querySelector('.limit-value');
            usedValue.textContent = userData.eventFiltersInfo.usedCompanyCount || '0';
            usedValue.classList.remove('loading');
        }
        if (limitItems[1]) {
            const limitValue = limitItems[1].querySelector('.limit-value');
            limitValue.textContent = userData.eventFiltersInfo.companyLimit || '0';
            limitValue.classList.remove('loading');
        }
        const userName = document.querySelector('.user-name');
        if (userName) {
            if (userData.name) {
                const nameParts = userData.name.split(' ');
                const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('') + '.';
                userName.textContent = initials;
            } else {
                userName.textContent = 'Пользователь';
            }
        }
    }
}
window.logout = function() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expire');
    window.location.href = 'index.html';
};
document.addEventListener('DOMContentLoaded', function() {
    updateAuthenticatedHeader();
});