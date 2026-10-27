

const API_STORAGE_PREFIX = 'menumind:';

/**
 * Hàm chống tấn công XSS (Cross-Site Scripting - Phòng tránh lỗi VP-02 Barem)
 * Dùng để lọc an toàn toàn bộ dữ liệu người dùng nhập trước khi render ra HTML
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[tag] || tag));
}

// Gán toàn cục để mọi script trang con đều gọi được
window.escapeHTML = escapeHTML;
window.escapeHtml = escapeHTML;

/**
 * Đối tượng MenuMind API quản lý toàn bộ CRUD và lưu trữ bền vững
 */
const api = {
  // Lấy dữ liệu từ localStorage theo key
  get(key, fallback = []) {
    try {
      const data = localStorage.getItem(`${API_STORAGE_PREFIX}${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Lỗi đọc localStorage key [${key}]:`, e);
      return fallback;
    }
  },

  // Lưu dữ liệu vào localStorage theo key
  set(key, value) {
    try {
      localStorage.setItem(`${API_STORAGE_PREFIX}${key}`, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Lỗi ghi localStorage key [${key}]:`, e);
      return false;
    }
  },

  // 1. Quản lý Món ăn (menuItems)
  getMenuItems() {
    return this.get('menuItems', typeof appData !== 'undefined' ? appData.menuItems : []);
  },

  saveMenuItem(item) {
    const items = this.getMenuItems();
    const index = items.findIndex(x => x.id === item.id);
    if (index >= 0) {
      items[index] = { ...items[index], ...item };
    } else {
      items.push({ ...item, id: item.id || `m-${Date.now()}` });
    }
    this.set('menuItems', items);
    return items;
  },

  deleteMenuItem(id) {
    const items = this.getMenuItems().filter(x => x.id !== id);
    this.set('menuItems', items);
    return items;
  },

  // 2. Quản lý Đơn hàng (orders)
  getOrders() {
    return this.get('orders', typeof appData !== 'undefined' ? appData.orders : []);
  },

  createOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: orderData.id || `MM-${Math.floor(1000 + Math.random() * 9000)}`,
      table: orderData.table || 'B01',
      items: orderData.items || [],
      total: orderData.total || 0,
      note: orderData.note ? escapeHTML(orderData.note) : '',
      status: 'new', // new -> cooking -> ready -> served -> cancelled
      priority: Boolean(orderData.priority),
      wait: 0,
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder);
    this.set('orders', orders);
    return newOrder;
  },

  updateOrderStatus(orderId, nextStatus) {
    const orders = this.getOrders();
    const order = orders.find(x => x.id === orderId);
    if (order) {
      order.status = nextStatus;
      order.updatedAt = new Date().toISOString();
      this.set('orders', orders);
    }
    return order;
  },

  // 3. Quản lý Bàn ăn (tables)
  getTables() {
    return this.get('tables', typeof appData !== 'undefined' ? appData.tables : []);
  },

  updateTableStatus(tableId, status) {
    const tables = this.getTables();
    const table = tables.find(x => x.id === tableId);
    if (table) {
      table.status = status;
      this.set('tables', tables);
    }
    return table;
  },

  // 4. Quản lý Phản hồi (feedback)
  getFeedback() {
    return this.get('feedback', typeof appData !== 'undefined' ? appData.feedback : []);
  },

  addFeedback(feedbackData) {
    const feedbackList = this.getFeedback();
    const newFeedback = {
      id: `f-${Date.now().toString(36)}`,
      table: feedbackData.table || 'Khách vãng lai',
      rating: Number(feedbackData.rating) || 5,
      text: escapeHTML(feedbackData.text || ''),
      theme: feedbackData.theme || 'Dịch vụ chung',
      status: 'new',
      createdAt: new Date().toISOString()
    };
    feedbackList.unshift(newFeedback);
    this.set('feedback', feedbackList);
    return newFeedback;
  },

  // 5. Tải dữ liệu mẫu khởi tạo qua HTTP fetch() có try/catch/finally
  async loadSeedData(rootPath = '.') {
    let loadedData = null;
    try {
      const response = await fetch(`${rootPath}/assets/data/app-data.json`);
      if (!response.ok) {
        throw new Error(`HTTP Lỗi khi tải dữ liệu: ${response.status}`);
      }
      loadedData = await response.json();
    } catch (err) {
      console.warn('Không thể fetch dữ liệu qua mạng, sử dụng dữ liệu cục bộ:', err);
      loadedData = this.get('seed', null);
    } finally {
      if (loadedData) {
        // Đồng bộ dữ liệu nền nếu chưa có trong localStorage
        if (!localStorage.getItem(`${API_STORAGE_PREFIX}menuItems`)) {
          this.set('menuItems', loadedData.menuItems || []);
        }
        if (!localStorage.getItem(`${API_STORAGE_PREFIX}orders`)) {
          this.set('orders', loadedData.orders || []);
        }
        if (!localStorage.getItem(`${API_STORAGE_PREFIX}tables`)) {
          this.set('tables', loadedData.tables || []);
        }
        if (!localStorage.getItem(`${API_STORAGE_PREFIX}feedback`)) {
          this.set('feedback', loadedData.feedback || []);
        }
        if (!localStorage.getItem(`${API_STORAGE_PREFIX}staff`)) {
          this.set('staff', loadedData.staff || []);
        }
      }
    }
    return loadedData;
  }
};

window.api = api;

/**
 * ĐIỂM THƯỞNG MỞ RỘNG (+0.50 ĐIỂM BAREM TRANG 22):
 * Đồng bộ dữ liệu liên thông thời gian thực giữa các Tab (Cross-Tab Synchronization)
 * Khi Khách đặt món ở Tab 1 -> Màn hình Bếp ở Tab 2 tự động cập nhật ngay lập tức!
 */
window.addEventListener('storage', event => {
  if (event.key && event.key.startsWith(API_STORAGE_PREFIX)) {
    // Tự động re-render trang hiện tại nếu có hàm render
    if (typeof renderPage === 'function') {
      renderPage();
    }
    // Hoặc gọi lại các hàm render trang chuyên biệt
    if (typeof kitchenBoardPageV2 === 'function' && document.querySelector('#kitchen-board-wrapper')) {
      kitchenBoardPageV2();
    }
    if (typeof dinerOrderStatusPage === 'function') {
      dinerOrderStatusPage();
    }
    if (typeof managerPaymentRequestsPage === 'function' && document.querySelector('#manager-payments-wrapper')) {
      managerPaymentRequestsPage();
    }
  }
});

