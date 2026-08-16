// استدعاء العناصر من الصفحة
const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('list');
const formEl = document.getElementById('transaction-form');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const clearHistoryBtn = document.getElementById('clear-history');

// جلب البيانات المخزنة مسبقاً أو إنشاء مصفوفة فارغة
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// متغير للرسم البياني
let expenseChart = null;

// دالة لتحديث واجهة المستخدم والرسم البياني
function init() {
    listEl.innerHTML = '';
    
    if (transactions.length === 0) {
        listEl.innerHTML = `<p class="text-center text-gray-500 text-sm py-4">لا توجد معاملات مسجلة حتى الآن</p>`;
    } else {
        transactions.forEach((transaction, index) => {
            addTransactionDOM(transaction, index);
        });
    }

    updateValues();
    updateChart();
}

// إضافة معاملة جديدة للقائمة في الواجهة
function addTransactionDOM(transaction, index) {
    const isIncome = transaction.type === 'income';
    const sign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'text-emerald-400' : 'text-rose-400';
    const icon = getCategoryIcon(transaction.category, isIncome);

    const li = document.createElement('li');
    li.className = "bg-gray-900 border border-gray-700 p-3 rounded-xl flex justify-between items-center shadow-sm";
    
    li.innerHTML = `
        <div class="flex items-center space-x-3 space-x-reverse">
            <div class="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                <i class="${icon}"></i>
            </div>
            <div>
                <p class="text-sm font-semibold text-white">${transaction.text}</p>
                <span class="text-xs text-gray-400">${transaction.category} • ${transaction.date || 'اليوم'}</span>
            </div>
        </div>
        <div class="flex items-center space-x-3 space-x-reverse">
            <span class="text-sm font-bold ${amountClass}">${sign}${Math.abs(Number(transaction.amount)).toFixed(2)} EGP</span>
            <button onclick="removeTransaction(${index})" class="text-gray-500 hover:text-rose-400 text-xs p-1">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;

    listEl.appendChild(li);
}

// تحديد أيقونة مناسبة حسب التصنيف
function getCategoryIcon(category, isIncome) {
    if (isIncome) return 'fa-solid fa-arrow-down-long text-emerald-400';
    switch (category) {
        case 'طعام': return 'fa-solid fa-utensils text-amber-400';
        case 'مواصلات': return 'fa-solid fa-car text-blue-400';
        case 'فواتير': return 'fa-solid fa-file-invoice-dollar text-purple-400';
        case 'ترفيه': return 'fa-solid fa-gamepad text-pink-400';
        default: return 'fa-solid fa-bag-shopping text-gray-400';
    }
}

// حساب إجمالي الرصيد، الدخل، والمصروفات (بعد التصحيح)
function updateValues() {
    const income = transactions
        .filter(t => t.type && t.type.toLowerCase() === 'income')
        .reduce((acc, t) => acc + Number(t.amount), 0);
        
    const expense = transactions
        .filter(t => t.type && t.type.toLowerCase() === 'expense')
        .reduce((acc, t) => acc + Number(t.amount), 0);

    const total = income - expense;

    balanceEl.innerText = `${total.toFixed(2)} EGP`;
    incomeEl.innerText = `${income.toFixed(2)}`;
    expenseEl.innerText = `${expense.toFixed(2)}`;
}

// إضافة معاملة جديدة عند إرسال النموذج
formEl.addEventListener('submit', function(e) {
    e.preventDefault();

    if (textInput.value.trim() === '' || amountInput.value.trim() === '') {
        alert('الرجاء إدخال اسم المعاملة والمبلغ');
        return;
    }

    const currentDate = new Date().toLocaleDateString('ar-EG');

    const newTransaction = {
        text: textInput.value,
        amount: Number(amountInput.value),
        type: typeInput.value, // ستكون إما 'income' أو 'expense'
        category: categoryInput.value,
        date: currentDate
    };

    transactions.unshift(newTransaction);
    updateLocalStorage();
    init();

    textInput.value = '';
    amountInput.value = '';
});

// حذف معاملة فردية
function removeTransaction(index) {
    transactions.splice(index, 1);
    updateLocalStorage();
    init();
}

// حذف جميع المعاملات
clearHistoryBtn.addEventListener('click', function() {
    if (confirm('هل أنت متأكد من حذف كافة السجلات؟')) {
        transactions = [];
        updateLocalStorage();
        init();
    }
});

// تحديث التخزين المحلي
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// تحديث الرسم البياني
function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');

    const expenseCategories = ['طعام', 'مواصلات', 'فواتير', 'ترفيه', 'أخرى'];
    const expenseTotals = expenseCategories.map(cat => {
        return transactions
            .filter(t => t.type === 'expense' && t.category === cat)
            .reduce((acc, t) => acc + Number(t.amount), 0);
    });

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: expenseCategories,
            datasets: [{
                data: expenseTotals,
                backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'left',
                    labels: { color: '#9ca3af', font: { family: 'Cairo', size: 11 } }
                }
            }
        }
    });
}

// تشغيل التطبيق
init();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
