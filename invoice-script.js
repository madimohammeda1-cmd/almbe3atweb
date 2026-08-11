// متغيرات عامة
let products = [];
let invoiceNumber = 1;
let savedInvoices = [];

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadSavedInvoices();
    updateInvoiceNumber();
    updateDateTime();
    setupEventListeners();
    
    // تحديث الوقت والتاريخ كل دقيقة
    setInterval(updateDateTime, 60000);
});

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.getElementById('productForm').addEventListener('submit', addProduct);
    document.getElementById('discountPercent').addEventListener('change', calculateTotal);
    document.getElementById('taxPercent').addEventListener('change', calculateTotal);
    
    // إغلاق Modal
    const modal = document.getElementById('invoiceModal');
    const closeBtn = document.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

// إضافة منتج
function addProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);
    
    if (!name || !price || !quantity) {
        alert('الرجاء ملء جميع الحقول!');
        return;
    }
    
    const product = {
        id: Date.now(),
        name: name,
        price: price,
        quantity: quantity,
        total: price * quantity
    };
    
    products.push(product);
    
    // مسح النموذج
    document.getElementById('productForm').reset();
    document.getElementById('productQuantity').value = '1';
    
    // تحديث العرض
    updateProductsList();
    updateInvoiceTable();
    calculateTotal();
}

// حذف منتج
function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    updateProductsList();
    updateInvoiceTable();
    calculateTotal();
}

// تحديث قائمة المنتجات
function updateProductsList() {
    const list = document.getElementById('productsList');
    
    if (products.length === 0) {
        list.innerHTML = '<p class="empty-message">لا توجد منتجات بعد</p>';
        return;
    }
    
    list.innerHTML = products.map(product => `
        <div class="product-item">
            <div class="product-item-info">
                <div class="product-item-name">${product.name}</div>
                <div class="product-item-details">
                    ${product.quantity} × ${product.price.toFixed(2)} د.ع
                </div>
            </div>
            <div class="product-item-total">${product.total.toFixed(2)} د.ع</div>
            <button class="btn-delete" onclick="deleteProduct(${product.id})">حذف</button>
        </div>
    `).join('');
}

// تحديث جدول الفاتورة
function updateInvoiceTable() {
    const tbody = document.getElementById('invoiceBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5" class="text-center">لم تضف منتجات بعد</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.name}</td>
            <td>${product.price.toFixed(2)} د.ع</td>
            <td>${product.quantity}</td>
            <td>${product.total.toFixed(2)} د.ع</td>
            <td>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// حساب الإجمالي
function calculateTotal() {
    if (products.length === 0) {
        document.getElementById('subtotal').textContent = '0.00';
        document.getElementById('discountAmount').textContent = '0.00';
        document.getElementById('taxAmount').textContent = '0.00';
        document.getElementById('totalAmount').textContent = '0.00';
        return;
    }
    
    // المجموع الجزئي
    const subtotal = products.reduce((sum, p) => sum + p.total, 0);
    
    // الخصم
    const discountPercent = parseFloat(document.getElementById('discountPercent').value) || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    
    // المبلغ بعد الخصم
    const afterDiscount = subtotal - discountAmount;
    
    // الضريبة
    const taxPercent = parseFloat(document.getElementById('taxPercent').value) || 0;
    const taxAmount = (afterDiscount * taxPercent) / 100;
    
    // الإجمالي النهائي
    const total = afterDiscount + taxAmount;
    
    // تحديث الحقول
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('discountAmount').textContent = discountAmount.toFixed(2);
    document.getElementById('taxAmount').textContent = taxAmount.toFixed(2);
    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

// تحديث رقم الفاتورة
function updateInvoiceNumber() {
    const storedNumber = localStorage.getItem('invoiceNumber');
    if (storedNumber) {
        invoiceNumber = parseInt(storedNumber);
    }
    document.getElementById('invoiceNumber').textContent = '#' + String(invoiceNumber).padStart(6, '0');
}

// تحديث التاريخ والوقت
function updateDateTime() {
    const now = new Date();
    
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = now.toLocaleDateString('ar-EG', dateOptions);
    
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const time = now.toLocaleTimeString('ar-EG', timeOptions);
    
    document.getElementById('invoiceDate').textContent = date;
    document.getElementById('invoiceTime').textContent = time;
}

// حفظ الفاتورة
function saveInvoice() {
    if (products.length === 0) {
        alert('الرجاء إضافة منتجات قبل حفظ الفاتورة!');
        return;
    }
    
    const invoice = {
        number: invoiceNumber,
        date: document.getElementById('invoiceDate').textContent,
        time: document.getElementById('invoiceTime').textContent,
        products: JSON.parse(JSON.stringify(products)),
        subtotal: parseFloat(document.getElementById('subtotal').textContent),
        discount: parseFloat(document.getElementById('discountAmount').textContent),
        tax: parseFloat(document.getElementById('taxAmount').textContent),
        total: parseFloat(document.getElementById('totalAmount').textContent),
        discountPercent: parseFloat(document.getElementById('discountPercent').value) || 0,
        taxPercent: parseFloat(document.getElementById('taxPercent').value) || 0
    };
    
    savedInvoices.push(invoice);
    localStorage.setItem('savedInvoices', JSON.stringify(savedInvoices));
    
    invoiceNumber++;
    localStorage.setItem('invoiceNumber', invoiceNumber);
    
    updateSavedInvoicesList();
    alert('✅ تم حفظ الفاتورة بنجاح!');
    
    resetInvoice();
}

// إعادة تعيين الفاتورة
function resetInvoice() {
    products = [];
    document.getElementById('discountPercent').value = '0';
    document.getElementById('taxPercent').value = '0';
    document.getElementById('productForm').reset();
    document.getElementById('productQuantity').value = '1';
    
    updateProductsList();
    updateInvoiceTable();
    calculateTotal();
    updateInvoiceNumber();
    updateDateTime();
}

// تحديث قائمة الفواتير المحفوظة
function updateSavedInvoicesList() {
    const list = document.getElementById('savedInvoicesList');
    
    if (savedInvoices.length === 0) {
        list.innerHTML = '<p class="empty-message">لا توجد فواتير محفوظة</p>';
        return;
    }
    
    list.innerHTML = savedInvoices.map((invoice, index) => `
        <div class="saved-invoice-item" onclick="viewSavedInvoice(${index})">
            <div class="invoice-number">الفاتورة: #${String(invoice.number).padStart(6, '0')}</div>
            <div class="invoice-details">
                📅 ${invoice.date} | ⏰ ${invoice.time}
            </div>
            <div class="invoice-details">
                💰 ${invoice.total.toFixed(2)} د.ع | 📦 ${invoice.products.length} منتج
            </div>
            <button class="btn-delete" onclick="deleteSavedInvoice(event, ${index})" style="margin-top: 0.5rem;">
                حذف
            </button>
        </div>
    `).join('');
}

// عرض فاتورة محفوظة
function viewSavedInvoice(index) {
    const invoice = savedInvoices[index];
    const modal = document.getElementById('invoiceModal');
    
    let productsHTML = invoice.products.map(p => `
        <tr>
            <td>${p.name}</td>
            <td>${p.price.toFixed(2)} د.ع</td>
            <td>${p.quantity}</td>
            <td>${p.total.toFixed(2)} د.ع</td>
        </tr>
    `).join('');
    
    const content = `
        <div style="direction: rtl; text-align: right;">
            <h2 style="text-align: center; margin-bottom: 1rem;">فاتورة المبيعات</h2>
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                <p><strong>رقم الفاتورة:</strong> #${String(invoice.number).padStart(6, '0')}</p>
                <p><strong>التاريخ:</strong> ${invoice.date}</p>
                <p><strong>الوقت:</strong> ${invoice.time}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
                <thead>
                    <tr style="background: #2c3e50; color: white;">
                        <th style="padding: 0.75rem; text-align: right; border: 1px solid #bdc3c7;">المنتج</th>
                        <th style="padding: 0.75rem; text-align: right; border: 1px solid #bdc3c7;">السعر</th>
                        <th style="padding: 0.75rem; text-align: right; border: 1px solid #bdc3c7;">الكمية</th>
                        <th style="padding: 0.75rem; text-align: right; border: 1px solid #bdc3c7;">الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHTML}
                </tbody>
            </table>
            
            <div style="background: #ecf0f1; padding: 1rem; border-radius: 5px; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                    <span><strong>المجموع الجزئي:</strong></span>
                    <span>${invoice.subtotal.toFixed(2)} د.ع</span>
                </div>
                ${invoice.discount > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #bdc3c7;">
                    <span><strong>الخصم (${invoice.discountPercent}%):</strong></span>
                    <span>-${invoice.discount.toFixed(2)} د.ع</span>
                </div>
                ` : ''}
                ${invoice.tax > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #bdc3c7;">
                    <span><strong>الضريبة (${invoice.taxPercent}%):</strong></span>
                    <span>+${invoice.tax.toFixed(2)} د.ع</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; font-size: 1.2rem; color: #3498db;">
                    <strong>الإجمالي النهائي:</strong>
                    <strong>${invoice.total.toFixed(2)} د.ع</strong>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modalInvoiceContent').innerHTML = content;
    modal.style.display = 'block';
}

// حذف فاتورة محفوظة
function deleteSavedInvoice(event, index) {
    event.stopPropagation();
    
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
        savedInvoices.splice(index, 1);
        localStorage.setItem('savedInvoices', JSON.stringify(savedInvoices));
        updateSavedInvoicesList();
        alert('✅ تم حذف الفاتورة');
    }
}

// طباعة الفاتورة الحالية
function printInvoice() {
    if (products.length === 0) {
        alert('الرجاء إضافة منتجات قبل الطباعة!');
        return;
    }
    
    const printWindow = window.open('', '', 'height=600,width=800');
    
    let productsHTML = products.map(p => `
        <tr>
            <td style="border: 1px solid #000; padding: 0.5rem;">${p.name}</td>
            <td style="border: 1px solid #000; padding: 0.5rem; text-align: center;">${p.price.toFixed(2)}</td>
            <td style="border: 1px solid #000; padding: 0.5rem; text-align: center;">${p.quantity}</td>
            <td style="border: 1px solid #000; padding: 0.5rem; text-align: center;">${p.total.toFixed(2)}</td>
        </tr>
    `).join('');
    
    const html = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>طباعة الفاتورة</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                th { background: #333; color: white; padding: 0.5rem; text-align: right; border: 1px solid #000; }
                td { padding: 0.5rem; }
                .calc-section { margin: 1rem 0; text-align: left; }
                .calc-row { display: flex; justify-content: space-between; padding: 0.5rem; }
                .total { font-size: 1.2rem; font-weight: bold; background: #f0f0f0; padding: 1rem; }
            </style>
        </head>
        <body>
            <h1>فاتورة المبيعات</h1>
            <p><strong>رقم الفاتورة:</strong> ${document.getElementById('invoiceNumber').textContent}</p>
            <p><strong>التاريخ:</strong> ${document.getElementById('invoiceDate').textContent}</p>
            <p><strong>الوقت:</strong> ${document.getElementById('invoiceTime').textContent}</p>
            
            <table>
                <thead>
                    <tr>
                        <th>المنتج</th>
                        <th>السعر</th>
                        <th>الكمية</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHTML}
                </tbody>
            </table>
            
            <div class="calc-section">
                <div class="calc-row">
                    <span>المجموع الجزئي:</span>
                    <span>${document.getElementById('subtotal').textContent}</span>
                </div>
                <div class="calc-row">
                    <span>الخصم:</span>
                    <span>-${document.getElementById('discountAmount').textContent}</span>
                </div>
                <div class="calc-row">
                    <span>الضريبة:</span>
                    <span>+${document.getElementById('taxAmount').textContent}</span>
                </div>
                <div class="calc-row total">
                    <span>الإجمالي النهائي:</span>
                    <span>${document.getElementById('totalAmount').textContent}</span>
                </div>
            </div>
            
            <p style="text-align: center; margin-top: 2rem; color: #666;">شكراً لك على تعاملك معنا</p>
        </body>
        </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
}

// طباعة من الـ Modal
function printModalInvoice() {
    const content = document.getElementById('modalInvoiceContent').innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>طباعة الفاتورة</title>
            <style>
                body { font-family: Arial, sans-serif; direction: rtl; margin: 20px; }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// تحميل الفواتير المحفوظة من LocalStorage
function loadSavedInvoices() {
    const stored = localStorage.getItem('savedInvoices');
    if (stored) {
        savedInvoices = JSON.parse(stored);
    }
    updateSavedInvoicesList();
}

// رسالة ترحيب في Console
console.log('%c🎉 مرحباً بك في نظام الفواتير والمبيعات! 🎉', 'font-size: 20px; color: #3498db; font-weight: bold;');
console.log('%cسهّل عملية إدارة مبيعاتك وفواتيرك', 'font-size: 14px; color: #27ae60;');
