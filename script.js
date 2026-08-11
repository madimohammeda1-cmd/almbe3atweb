// متغيرات عامة
let invoices = [];
let products = [];
let settings = {
    companyName: 'شركتي',
    companyEmail: '',
    companyPhone: ''
};

// التهيئة
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    loadDarkMode();
    updateDashboard();
    loadSettings();
});

// تحميل البيانات من LocalStorage
function loadData() {
    const savedInvoices = localStorage.getItem('invoices');
    const savedProducts = localStorage.getItem('products');
    
    if (savedInvoices) invoices = JSON.parse(savedInvoices);
    if (savedProducts) products = JSON.parse(savedProducts);
}

// حفظ البيانات
function saveData() {
    localStorage.setItem('invoices', JSON.stringify(invoices));
    localStorage.setItem('products', JSON.stringify(products));
    updateDashboard();
}

// إعداد المستمعات
function setupEventListeners() {
    // التنقل بين الصفحات
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.dataset.page;
            navigateToPage(pageName);
            document.getElementById('pageTitle').textContent = this.textContent;
        });
    });

    // إغلاق الـ Sidebar على الموبايل
    document.querySelector('.btn-toggle-sidebar').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    // الوضع المظلم
    document.getElementById('themeToggle').addEventListener('click', toggleDarkMode);
}

// التنقل بين الصفحات
function navigateToPage(pageName) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // إظهار الصفحة المطلوبة
    document.getElementById(pageName).classList.add('active');

    // تحديث النشاط في القائمة الجانبية
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

    // تحديث المحتوى حسب الصفحة
    if (pageName === 'invoices') {
        renderInvoicesList();
    } else if (pageName === 'products') {
        renderProductsGrid();
    } else if (pageName === 'reports') {
        updateReports();
    }
}

// تحديث لوحة المعلومات
function updateDashboard() {
    let totalSales = 0;
    let totalDiscounts = 0;

    invoices.forEach(invoice => {
        totalSales += invoice.total;
        totalDiscounts += invoice.discountAmount || 0;
    });

    document.getElementById('totalSales').textContent = totalSales.toFixed(2);
    document.getElementById('invoiceCount').textContent = invoices.length;
    document.getElementById('productCount').textContent = products.length;
    document.getElementById('totalDiscounts').textContent = totalDiscounts.toFixed(2);

    // رسم الرسوم البيانية
    drawSalesChart();
    drawTopProducts();
}

// رسم رسم بياني للمبيعات
function drawSalesChart() {
    const container = document.getElementById('salesChart');
    const days = 7;
    let maxValue = 0;
    const dailySales = {};

    // تهيئة الأيام
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('ar-EG');
        dailySales[dateStr] = 0;
    }

    // حساب المبيعات اليومية
    invoices.forEach(invoice => {
        const dateStr = new Date(invoice.date).toLocaleDateString('ar-EG');
        if (dateStr in dailySales) {
            dailySales[dateStr] += invoice.total;
            maxValue = Math.max(maxValue, dailySales[dateStr]);
        }
    });

    // رسم الأعمدة
    let html = '';
    Object.values(dailySales).reverse().forEach(value => {
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        html += `<div class="chart-bar" style="height: ${height}%" title="${value.toFixed(2)} د.ع"></div>`;
    });

    container.innerHTML = html || '<p style="text-align: center; color: #ccc;">لا توجد بيانات</p>';
}

// أفضل المنتجات
function drawTopProducts() {
    const container = document.getElementById('topProducts');
    const productSales = {};

    // حساب مبيعات كل منتج
    invoices.forEach(invoice => {
        invoice.products.forEach(product => {
            if (!productSales[product.name]) {
                productSales[product.name] = 0;
            }
            productSales[product.name] += product.quantity;
        });
    });

    // ترتيب المنتجات
    const sorted = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #ccc;">لا توجد منتجات مباعة</p>';
        return;
    }

    let html = '';
    sorted.forEach((item, index) => {
        html += `
            <div class="product-item-rank">
                <div class="rank-number">${index + 1}</div>
                <div style="flex: 1;">
                    <strong>${item[0]}</strong>
                    <div style="font-size: 0.85rem; color: #718096;">${item[1]} وحدة</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// فتح Modal الفاتورة الجديدة
function openNewInvoiceModal() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('invoiceNotes').value = '';
    document.getElementById('modalDiscount').value = '0';
    document.getElementById('modalTax').value = '0';
    document.getElementById('productsFormContainer').innerHTML = '';
    addProductRow();
    updateModalTotal();
    openModal('invoiceModal');
}

// إضافة صف منتج
function addProductRow() {
    const container = document.getElementById('productsFormContainer');
    const rowId = Date.now();
    
    let html = '<div class="product-row" id="row-' + rowId + '">';
    html += '<select class="form-input" onchange="updateModalTotal()">';
    html += '<option value="">اختر منتج</option>';
    
    products.forEach(product => {
        html += `<option value="${product.name}|${product.price}">${product.name}</option>`;
    });
    
    html += '</select>';
    html += '<input type="number" value="1" min="1" class="small-input" onchange="updateModalTotal()" placeholder="الكمية">';
    html += '<input type="number" class="small-input" placeholder="السعر" readonly>';
    html += '<button type="button" class="btn btn-danger" onclick="removeProductRow(' + rowId + ')" style="flex: 1; padding: 5px;">حذف</button>';
    html += '</div>';
    
    container.innerHTML += html;
}

// حذف صف منتج
function removeProductRow(rowId) {
    document.getElementById('row-' + rowId).remove();
    updateModalTotal();
}

// تحديث إجمالي Modal
function updateModalTotal() {
    let subtotal = 0;
    
    document.querySelectorAll('.product-row').forEach(row => {
        const select = row.querySelector('select').value;
        const quantity = parseInt(row.querySelector('input[placeholder="الكمية"]').value) || 0;
        
        if (select) {
            const [name, price] = select.split('|');
            const total = parseFloat(price) * quantity;
            subtotal += total;
            row.querySelector('input[placeholder="السعر"]').value = total.toFixed(2);
        }
    });
    
    const discount = parseFloat(document.getElementById('modalDiscount').value) || 0;
    const tax = parseFloat(document.getElementById('modalTax').value) || 0;
    
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * tax) / 100;
    const total = afterDiscount + taxAmount;
    
    document.getElementById('modalSubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('modalTotal').textContent = total.toFixed(2);
}

// حفظ الفاتورة
function saveInvoice() {
    const customerName = document.getElementById('customerName').value;
    
    if (!customerName) {
        showToast('الرجاء إدخال اسم العميل', 'error');
        return;
    }
    
    const invoiceProducts = [];
    let subtotal = 0;
    
    document.querySelectorAll('.product-row').forEach(row => {
        const select = row.querySelector('select').value;
        const quantity = parseInt(row.querySelector('input[placeholder="الكمية"]').value) || 0;
        
        if (select) {
            const [name, price] = select.split('|');
            const productTotal = parseFloat(price) * quantity;
            invoiceProducts.push({
                name: name,
                price: parseFloat(price),
                quantity: quantity,
                total: productTotal
            });
            subtotal += productTotal;
        }
    });
    
    if (invoiceProducts.length === 0) {
        showToast('الرجاء إضافة منتجات', 'error');
        return;
    }
    
    const discount = parseFloat(document.getElementById('modalDiscount').value) || 0;
    const tax = parseFloat(document.getElementById('modalTax').value) || 0;
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * tax) / 100;
    const total = subtotal - discountAmount + taxAmount;
    
    const invoice = {
        id: Date.now(),
        date: new Date(),
        customerName: customerName,
        customerPhone: document.getElementById('customerPhone').value,
        notes: document.getElementById('invoiceNotes').value,
        products: invoiceProducts,
        subtotal: subtotal,
        discountPercent: discount,
        discountAmount: discountAmount,
        taxPercent: tax,
        taxAmount: taxAmount,
        total: total,
        status: 'pending'
    };
    
    invoices.unshift(invoice);
    saveData();
    closeModal('invoiceModal');
    showToast('✅ تم حفظ الفاتورة بنجاح', 'success');
    renderInvoicesList();
}

// عرض قائمة الفواتير
function renderInvoicesList() {
    const container = document.getElementById('invoicesList');
    
    if (invoices.length === 0) {
        container.innerHTML = '<p class="empty-state">لا توجد فواتير بعد</p>';
        return;
    }
    
    let html = '<table><thead><tr><th>رقم الفاتورة</th><th>العميل</th><th>التاريخ</th><th>المجموع</th><th>الحالة</th><th>الإجراءات</th></tr></thead><tbody>';
    
    invoices.forEach((invoice, index) => {
        const date = new Date(invoice.date).toLocaleDateString('ar-EG');
        const statusText = invoice.status === 'paid' ? 'مدفوعة ✓' : 'قيد الانتظار';
        const statusClass = invoice.status === 'paid' ? 'success' : 'warning';
        
        html += `
            <tr>
                <td>#${String(index + 1).padStart(4, '0')}</td>
                <td>${invoice.customerName}</td>
                <td>${date}</td>
                <td>${invoice.total.toFixed(2)} د.ع</td>
                <td><span style="padding: 5px 10px; border-radius: 20px; background: var(--${statusClass === 'success' ? 'success' : 'warning'}); color: white; font-size: 0.85rem;">${statusText}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="printInvoice(${index})" title="طباعة">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="viewInvoice(${index})" title="عرض">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteInvoice(${index})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// حذف فاتورة
function deleteInvoice(index) {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
        invoices.splice(index, 1);
        saveData();
        showToast('تم حذف الفاتورة', 'success');
        renderInvoicesList();
    }
}

// طباعة فاتورة
function printInvoice(index) {
    const invoice = invoices[index];
    const printWindow = window.open('', '', 'width=800,height=600');
    
    let productsHTML = '';
    invoice.products.forEach(product => {
        productsHTML += `
            <tr>
                <td>${product.name}</td>
                <td style="text-align: center;">${product.price.toFixed(2)}</td>
                <td style="text-align: center;">${product.quantity}</td>
                <td style="text-align: center;">${product.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    const html = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>طباعة الفاتورة</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .company-name { font-size: 1.5rem; font-weight: bold; }
                .details { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { padding: 10px; text-align: right; border: 1px solid #ddd; }
                th { background: #333; color: white; }
                .summary { text-align: left; margin-top: 20px; }
                .summary-row { display: flex; justify-content: space-between; padding: 5px 0; }
                .total { font-weight: bold; font-size: 1.2rem; background: #f0f0f0; padding: 10px; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="company-name">${settings.companyName}</div>
            </div>
            
            <div class="details">
                <div><strong>رقم الفاتورة:</strong> #${String(index + 1).padStart(4, '0')}</div>
                <div><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleDateString('ar-EG')}</div>
                <div><strong>العميل:</strong> ${invoice.customerName}</div>
            </div>
            
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
            
            <div class="summary">
                <div class="summary-row">
                    <span>المجموع الجزئي:</span>
                    <span>${invoice.subtotal.toFixed(2)} د.ع</span>
                </div>
                ${invoice.discountAmount > 0 ? `
                <div class="summary-row">
                    <span>الخصم (${invoice.discountPercent}%):</span>
                    <span>-${invoice.discountAmount.toFixed(2)} د.ع</span>
                </div>
                ` : ''}
                ${invoice.taxAmount > 0 ? `
                <div class="summary-row">
                    <span>الضريبة (${invoice.taxPercent}%):</span>
                    <span>+${invoice.taxAmount.toFixed(2)} د.ع</span>
                </div>
                ` : ''}
                <div class="summary-row total">
                    <span>الإجمالي النهائي:</span>
                    <span>${invoice.total.toFixed(2)} د.ع</span>
                </div>
            </div>
            
            ${invoice.notes ? `<p><strong>ملاحظات:</strong> ${invoice.notes}</p>` : ''}
            
            <p style="text-align: center; margin-top: 30px; color: #666;">شكراً لك على تعاملك معنا</p>
        </body>
        </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// عرض الفاتورة
function viewInvoice(index) {
    const invoice = invoices[index];
    alert(`الفاتورة رقم: #${index + 1}\nالعميل: ${invoice.customerName}\nالمجموع: ${invoice.total.toFixed(2)} د.ع`);
}

// فتح Modal المنتج الجديد
function openProductModal() {
    document.getElementById('productModalName').value = '';
    document.getElementById('productModalPrice').value = '';
    document.getElementById('productModalCategory').value = '';
    openModal('productModal');
}

// حفظ المنتج
function saveProduct() {
    const name = document.getElementById('productModalName').value;
    const price = parseFloat(document.getElementById('productModalPrice').value);
    const category = document.getElementById('productModalCategory').value;
    
    if (!name || !price) {
        showToast('الرجاء ملء جميع الحقول', 'error');
        return;
    }
    
    products.push({
        id: Date.now(),
        name: name,
        price: price,
        category: category
    });
    
    saveData();
    closeModal('productModal');
    showToast('✅ تم إضافة المنتج بنجاح', 'success');
    renderProductsGrid();
}

// عرض المنتجات
function renderProductsGrid() {
    const container = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="empty-state">لا توجد منتجات بعد</p>';
        return;
    }
    
    let html = '';
    products.forEach((product, index) => {
        html += `
            <div class="product-card">
                <div class="product-card-title">${product.name}</div>
                <div class="product-card-category">${product.category || 'بدون تصنيف'}</div>
                <div class="product-card-price">${product.price.toFixed(2)} د.ع</div>
                <div class="product-card-actions">
                    <button class="btn-edit" onclick="editProduct(${index})">تعديل</button>
                    <button class="btn-delete" onclick="deleteProduct(${index})">حذف</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// حذف منتج
function deleteProduct(index) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        products.splice(index, 1);
        saveData();
        showToast('تم حذف المنتج', 'success');
        renderProductsGrid();
    }
}

// تعديل منتج
function editProduct(index) {
    const product = products[index];
    document.getElementById('productModalName').value = product.name;
    document.getElementById('productModalPrice').value = product.price;
    document.getElementById('productModalCategory').value = product.category;
    
    // حفظ التعديل
    const oldProducts = [...products];
    closeModal('productModal');
    
    setTimeout(() => {
        openModal('productModal');
    }, 100);
}

// تحديث التقارير
function updateReports() {
    let totalSales = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    
    invoices.forEach(invoice => {
        totalSales += invoice.total;
        totalTax += invoice.taxAmount || 0;
        totalDiscount += invoice.discountAmount || 0;
    });
    
    document.getElementById('reportTotalSales').textContent = totalSales.toFixed(2) + ' د.ع';
    document.getElementById('reportTaxes').textContent = totalTax.toFixed(2) + ' د.ع';
    document.getElementById('reportDiscounts').textContent = totalDiscount.toFixed(2) + ' د.ع';
}

// الإعدادات
function loadSettings() {
    const saved = localStorage.getItem('settings');
    if (saved) {
        settings = JSON.parse(saved);
    }
    
    document.getElementById('companyName').value = settings.companyName;
    document.getElementById('companyEmail').value = settings.companyEmail;
    document.getElementById('companyPhone').value = settings.companyPhone;
}

function saveSettings() {
    settings.companyName = document.getElementById('companyName').value;
    settings.companyEmail = document.getElementById('companyEmail').value;
    settings.companyPhone = document.getElementById('companyPhone').value;
    
    localStorage.setItem('settings', JSON.stringify(settings));
    showToast('✅ تم حفظ الإعدادات', 'success');
}

// النسخ الاحتياطي
function backupData() {
    const backup = {
        invoices: invoices,
        products: products,
        settings: settings,
        date: new Date().toLocaleDateString('ar-EG')
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${Date.now()}.json`;
    link.click();
    
    showToast('✅ تم تحميل النسخة الاحتياطية', 'success');
}

// استرجاع البيانات
function restoreData() {
    const file = document.getElementById('restoreFile').files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            invoices = backup.invoices || [];
            products = backup.products || [];
            settings = backup.settings || {};
            
            localStorage.setItem('invoices', JSON.stringify(invoices));
            localStorage.setItem('products', JSON.stringify(products));
            localStorage.setItem('settings', JSON.stringify(settings));
            
            loadSettings();
            updateDashboard();
            renderInvoicesList();
            renderProductsGrid();
            
            showToast('✅ تم استرجاع البيانات بنجاح', 'success');
        } catch(error) {
            showToast('❌ خطأ في استرجاع البيانات', 'error');
        }
    };
    reader.readAsText(file);
}

// حذف جميع البيانات
function clearAllData() {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!')) {
        invoices = [];
        products = [];
        settings = { companyName: 'شركتي', companyEmail: '', companyPhone: '' };
        
        localStorage.clear();
        
        updateDashboard();
        renderInvoicesList();
        renderProductsGrid();
        loadSettings();
        
        showToast('✅ تم حذف جميع البيانات', 'success');
    }
}

// تصدير إلى Excel
function exportToExcel() {
    let csv = 'رقم الفاتورة,العميل,التاريخ,المجموع,الحالة\n';
    
    invoices.forEach((invoice, index) => {
        const date = new Date(invoice.date).toLocaleDateString('ar-EG');
        const status = invoice.status === 'paid' ? 'مدفوعة' : 'قيد الانتظار';
        csv += `#${index + 1},${invoice.customerName},${date},${invoice.total.toFixed(2)},${status}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `invoices-${Date.now()}.csv`;
    link.click();
    
    showToast('✅ تم تحميل البيانات', 'success');
}

// الوضع المظلم
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    
    const icon = document.getElementById('themeToggle').querySelector('i');
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

function loadDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').querySelector('i').classList.add('fa-sun');
    }
}

// Modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Toast
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// رسالة ترحيب
console.log('%c🎉 مرحباً بك في نظام الفواتير والمبيعات الاحترافي! 🎉', 'font-size: 20px; color: #667eea; font-weight: bold;');
