function kitchenAlertsPage() {
  const orders = getStore('orders', appData.orders).filter(o => ['new', 'cooking', 'ready'].includes(o.status));
  const threshold = +(document.querySelector('#alert-threshold')?.value || 15);
  const title = document.querySelector('#alert-summary-title');
  const list = document.querySelector('#alert-list');
  if (title) title.textContent = `${orders.filter(o => o.wait >= threshold).length} đơn vượt ngưỡng`;
  if (list) list.innerHTML = renderAlerts(orders, threshold);
}

function renderAlerts(orders, threshold) {
  const list = orders.filter(o => o.wait >= threshold);
  return list.length ? list.map(o => `<article class="alert-row"><div class="alert-time"><strong>${o.wait}</strong><span>phút</span></div><div><h3>Bàn ${o.table} · ${o.id}</h3><p>${o.items.length} nhóm món · ${o.note || 'Không có ghi chú'}</p></div>${badge(o.status)}<button class="button small quiet" data-priority-order="${o.id}">${o.priority ? 'Đã ưu tiên' : 'Ưu tiên'}</button></article>`).join('') : emptyState('Không có đơn trễ', 'Tất cả đơn đang nằm trong ngưỡng chờ đã chọn.');
}

function runLoadAI(form) {
  const fd = new FormData(form);
  const n = +fd.get('orders');
  const s = +fd.get('staff');
  const el = document.querySelector('#load-result');
  if (n / s > 8) {
    el.innerHTML = `<div class="ai-warning"><strong>AI chưa thể đưa ra kế hoạch an toàn</strong><p>Tỷ lệ trên 8 đơn/người. Hãy tăng nhân sự hoặc giảm số đơn nhận.</p></div>`;
    return;
  }
  el.innerHTML = `<div class="ai-loading"><span></span><p>Đang ước tính nhịp bếp...</p></div>`;
  setTimeout(() => {
    const mins = Math.round(8 + n / s * 3);
    const confidence = Math.max(68, 96 - n);
    el.innerHTML = `<article class="ai-answer"><p class="confidence">Độ tin cậy <strong>${confidence}%</strong></p><h3>Thời gian chờ dự kiến: ${mins}–${mins + 5} phút</h3><p id="ai-load-copy">Mở thêm quầy nguội trong 20 phút đầu và gom các món có thời gian dưới 10 phút.</p><details><summary>Vì sao có dự báo này?</summary><ul><li>${n} đơn trên ${s} nhân sự</li><li>Tải hiện tại 74%</li><li>3 đơn có món nướng</li></ul></details><div class="ai-actions"><button class="button small primary" data-action="apply-load-plan">Áp dụng</button><button class="button small quiet" data-action="edit-ai">Sửa</button><button class="link-button" data-action="rerun-load">Tạo lại</button><button class="link-button danger-text" data-action="reject-ai">Từ chối</button></div></article>`;
  }, 950);
}

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;

  if (b.dataset.priorityOrder) {
    const orders = getStore('orders', appData.orders);
    const o = orders.find(x => x.id === b.dataset.priorityOrder);
    if (!o) return;
    o.priority = !o.priority;
    if (typeof updateOrderRemote === 'function') updateOrderRemote(o).catch(console.warn);
    setStore('orders', orders);
    toast(o.priority ? 'Đã ưu tiên đơn' : 'Đã bỏ ưu tiên');
    kitchenAlertsPage();
  }

  const action = b.dataset.action;
  if (action === 'apply-load-plan') {
    setStore('aiDecision', { type: action, content: b.closest('.ai-answer')?.innerText || '', savedAt: new Date().toISOString() });
    toast('Đã lưu kết quả AI vào hệ thống');
  }
  if (action === 'edit-ai') {
    const p = b.closest('.ai-answer')?.querySelector('p[id], textarea');
    if (p) {
      p.contentEditable = 'true';
      p.focus();
      toast('Bạn có thể sửa nội dung trước khi lưu', 'info');
    }
  }
  if (action === 'rerun-load') {
    document.querySelector('#load-form')?.requestSubmit();
  }
  if (action === 'reject-ai') {
    const res = b.closest('.ai-result');
    if (res) res.innerHTML = emptyState('Đã từ chối gợi ý', 'Bạn có thể điều chỉnh đầu vào và thử lại.');
  }
});

document.addEventListener('change', e => {
  if (e.target.id === 'alert-threshold') {
    const orders = getStore('orders', appData.orders).filter(o => ['new', 'cooking', 'ready'].includes(o.status));
    const listEl = document.querySelector('#alert-list');
    if (listEl) listEl.innerHTML = renderAlerts(orders, +e.target.value);
  }
});

document.addEventListener('submit', e => {
  if (e.target.id === 'load-form') {
    e.preventDefault();
    runLoadAI(e.target);
  }
});

bootPage(kitchenAlertsPage);
