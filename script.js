// وظيفة عند الضغط على الزر
function showMessage() {
    alert('مرحباً! 👋 موقعك يعمل بنجاح على Infinityfree 🎉');
}

// وظيفة معالجة نموذج الاتصال
function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const message = form.querySelector('textarea').value;
    
    // عرض رسالة النجاح
    alert(`شكراً ${name}! تم استقبال رسالتك على البريد: ${email}\n\nسأرد عليك قريباً إن شاء الله! 📧`);
    
    // مسح النموذج
    form.reset();
}

// تأثير التمرير السلس
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// تأثير ظهور العناصر عند التمرير
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// راقب جميع بطاقات الخدمات
document.querySelectorAll('.card, .service-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-in-out, transform 0.6s ease-in-out';
    observer.observe(el);
});

// رسالة في وحدة التحكم (Console)
console.log('%cمرحباً بك في موقعي! 👋', 'font-size: 20px; color: #667eea; font-weight: bold;');
console.log('%cهذا الموقع تم إنشاؤه باستخدام HTML و CSS و JavaScript', 'font-size: 14px; color: #764ba2;');
console.log('%cشكراً لزيارتك! 🚀', 'font-size: 14px; color: #667eea;');
