// Конфигурация Telegram бота
const TELEGRAM_BOT_TOKEN = '7990777742:AAGfKV8pNZOZ7pa6X0behbsYcuvFFI6aypw';
const TELEGRAM_CHAT_ID = '-1002504242503';

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Закрываем мобильное меню, если оно открыто
            const navbar = document.getElementById('navbar');
            const hamburger = document.getElementById('hamburger');
            const navList = document.querySelector('#navbar ul');
            
            if (navList.classList.contains('active')) {
                navList.classList.remove('active');
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
                navbar.style.background = 'white';
            }
            
            // Прокрутка к элементу
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Изменение навбара при скролле
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Мобильное меню
document.getElementById('hamburger').addEventListener('click', function() {
    const navList = document.querySelector('#navbar ul');
    const navbar = document.getElementById('navbar');
    
    navList.classList.toggle('active');
    
    if (navList.classList.contains('active')) {
        this.innerHTML = '<i class="fas fa-times"></i>';
        navbar.style.background = 'white';
    } else {
        this.innerHTML = '<i class="fas fa-bars"></i>';
        if (window.scrollY < 50) {
            navbar.style.background = 'transparent';
        }
    }
});

// Закрытие меню при клике вне его
document.addEventListener('click', function(e) {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navList = document.querySelector('#navbar ul');
    
    if (!e.target.closest('#navbar') && navList.classList.contains('active')) {
        navList.classList.remove('active');
        hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        if (window.scrollY < 50) {
            navbar.style.background = 'transparent';
        }
    }
});

// Маска для телефона
document.getElementById('phoneInput').addEventListener('input', function(e) {
    let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    e.target.value = !x[2] ? x[1] : '+7 (' + x[2] + (x[3] ? ') ' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
});

// Обработка формы обратной связи через Telegram бота
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const formMessage = document.getElementById('formMessage');
    const submitButton = form.querySelector('button[type="submit"]');
    const phoneInput = document.getElementById('phoneInput');
    
    // Очищаем предыдущие сообщения
    formMessage.className = 'form-message';
    formMessage.textContent = '';
    
    // Проверяем заполнение полей
    const name = formData.get('name').trim();
    const phone = formData.get('phone').trim();
    const phoneNumber = phone.replace(/\D/g, '');
    
    if (!name) {
        formMessage.textContent = 'Пожалуйста, введите ваше имя';
        formMessage.className = 'form-message error';
        return;
    }
    
    if (!phone || phoneNumber.length !== 11) {
        formMessage.textContent = 'Пожалуйста, введите корректный номер телефона';
        formMessage.className = 'form-message error';
        phoneInput.focus();
        return;
    }
    
    // Добавляем индикатор загрузки
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    submitButton.innerHTML = 'Отправка...';
    
    try {
        // Формируем текст сообщения
        const messageText = `📌 <b>Новая заявка с сайта</b>\n\n` +
                           `👤 <b>Имя:</b> ${name}\n` +
                           `📱 <b>Телефон:</b> ${phone}\n` +
                           `✉️ <b>Сообщение:</b> ${formData.get('message') || 'Не указано'}\n\n` +
                           `🕒 <i>${new Date().toLocaleString()}</i>`;
        
        // Отправляем в Telegram
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: messageText,
                parse_mode: 'HTML'
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.ok) {
            formMessage.textContent = '✅ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.';
            formMessage.className = 'form-message success';
            form.reset();
        } else {
            throw new Error(result.description || 'Ошибка при отправке');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        formMessage.textContent = '❌ Произошла ошибка при отправке. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.';
        formMessage.className = 'form-message error';
    } finally {
        // Убираем индикатор загрузки
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Отправить';
        
        // Скрываем сообщение через 5 секунд
        setTimeout(() => {
            formMessage.className = 'form-message';
        }, 5000);
    }
});
// Функция для показа модального окна
function showPhoneModal() {
    const modal = document.getElementById('phoneModal');
    modal.style.display = 'block';
    
    // Закрытие при клике вне окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePhoneModal();
        }
    });
}

// Функция для закрытия модального окна
function closePhoneModal() {
    document.getElementById('phoneModal').style.display = 'none';
}

// Функция для копирования номера
function copyPhoneNumber() {
    const phoneNumber = '+79205621808';
    navigator.clipboard.writeText(phoneNumber).then(() => {
        alert('Номер скопирован в буфер обмена!');
    }).catch(err => {
        console.error('Ошибка копирования: ', err);
    });
}

// Обработчики для кнопок WhatsApp
document.querySelectorAll('.fa-whatsapp').forEach(icon => {
    icon.addEventListener('click', function(e) {
        e.preventDefault();
        showPhoneModal();
    });
});

// Обработчик для кнопки закрытия
document.querySelector('.close-modal').addEventListener('click', closePhoneModal);