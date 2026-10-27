/**
 * ============================================================================
 * MENUMIND - MODULE TRUNG TÂM PHẢN HỒI & AI-3 FEEDBACK THEME EXTRACTOR (S14)
 * Nguyễn Hoàng Hải (SV3 - Leader)
 * 
 * 🗺️ CẤU TRÚC PHÂN ĐOẠN LOGIC (JS ARCHITECTURE):
 * ----------------------------------------------------------------------------
 * 1. BỘ DỮ LIỆU ĐÁNH GIÁ MẪU: DEFAULT_FEEDBACK & getFeedbackList()
 * 2. RENDER DANH SÁCH & TÍNH TOÁN ĐIỂM SAO: feedbackPage()
 * 3. LOGIC XỬ LÝ AI-3 (FEEDBACK THEME EXTRACTOR): runThemeAI()
 *    - Xử lý trường hợp độ tin cậy thấp / dữ liệu không đủ (AI Uncertainty UX)
 *    - Hiển thị tiến trình phân tích (Processing State)
 *    - Xuất kết quả kèm chỉ số tin cậy và giải trình mô hình (Explainability)
 * 4. TƯƠNG TÁC NGƯỜI DÙNG & LƯU TRỮ (USER CONTROL & STORAGE):
 *    - Chỉnh sửa trực tiếp nội dung đề xuất (Inline Edit)
 *    - Tạo lại phương án khác (Regenerate)
 *    - Lưu kết quả phân tích vào LocalStorage hệ thống
 * ============================================================================
 */

/* ==========================================================================
   PHẦN 1: MÔ HÌNH DỮ LIỆU ĐÁNH GIÁ MẪU & TRUY XUẤT TỪ BỘ NHỚ CỤC BỘ
   ========================================================================== */
const DEFAULT_FEEDBACK = [
  { id: 'f01', table: 'A02', rating: 5, text: 'Cá hồi áp chảo rất tươi và ngon, nhân viên phục vụ tận tình chu đáo.', theme: 'Hương vị món', status: 'new' },
  { id: 'f02', table: 'C01', rating: 3, text: 'Món ăn ngon vừa miệng nhưng khung giờ tối chờ món chính hơi lâu (khoảng 25 phút).', theme: 'Thời gian chờ', status: 'new' },
  { id: 'f03', table: 'B02', rating: 5, text: 'Không gian sân vườn thoáng đãng, các món chay phong phú và thanh đạm.', theme: 'Không gian', status: 'replied', reply: 'MenuMind xin chân thành cảm ơn quý khách! Rất vui vì quý khách đã có trải nghiệm thư thái tại sân vườn nhà hàng.', repliedAt: '2026-10-26T20:15:00Z' },
  { id: 'f04', table: 'A06', rating: 4, text: 'Mì xào hải sản đậm đà, tôm tươi nhưng hơi cay so với khẩu vị trẻ nhỏ.', theme: 'Khẩu vị', status: 'new' },
  { id: 'f05', table: 'B04', rating: 2, text: 'Bàn ngoài vườn phải nhắc nhân viên 2 lần mới có thêm nước lọc và khăn lạnh.', theme: 'Thái độ phục vụ', status: 'new' },
  { id: 'f06', table: 'A01', rating: 5, text: 'Salad vườn rất giòn và sốt chanh mật ong đặc biệt, chắc chắn sẽ quay lại!', theme: 'Hương vị món', status: 'replied', reply: 'MenuMind cảm ơn quý khách rất nhiều! Hẹn gặp lại quý khách trong những bữa ăn sắp tới nhé!', repliedAt: '2026-10-26T21:00:00Z' },
  { id: 'f07', table: 'B03', rating: 3, text: 'Giờ cao điểm phục vụ lên món hơi chậm, mong quán cải thiện tốc độ ra món.', theme: 'Thời gian chờ', status: 'new' }
];

function getFeedbackList() {
  let feedback = getStore('feedback', null);
  if (!Array.isArray(feedback) || feedback.length === 0) {
    feedback = (Array.isArray(appData.feedback) && appData.feedback.length > 0) ? appData.feedback : DEFAULT_FEEDBACK;
    setStore('feedback', feedback);
    if (appData) appData.feedback = feedback;
  }
  return feedback;
}


/* ==========================================================================
   PHẦN 2: TÍNH TOÁN THỐNG KÊ ĐIỂM SAO & RENDER DANH SÁCH PHẢN HỒI
   Logic:
   - Tính điểm đánh giá trung bình (1-5 sao)
   - Tính tỷ lệ phần trăm tích cực (≥ 4 sao) và cần cải thiện (≤ 3 sao)
   - Sinh danh sách thẻ nhận xét có gắn tag chủ đề và nút phản hồi
   ========================================================================== */
function feedbackPage() {
  const feedback = getFeedbackList();
  const ratings = feedback.map(item => Number(item.rating)).filter(value => value >= 1 && value <= 5);
  const average = ratings.length ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1).replace('.', ',') : '—';
  const positive = ratings.length ? Math.round(ratings.filter(value => value >= 4).length * 100 / ratings.length) : 0;
  const needsImprovement = ratings.length ? 100 - positive : 0;

  const items = feedback.length
    ? feedback.map(item => {
      const rating = Math.max(1, Math.min(5, Number(item.rating) || 1));
      const hasReplied = item.status === 'replied' || Boolean(item.reply);
      const replyContent = item.reply || (hasReplied ? 'MenuMind xin chân thành cảm ơn quý khách đã gửi nhận xét đánh giá cho nhà hàng!' : '');

      const replyHtml = hasReplied ? `
        <div class="feedback-reply">
          <div class="reply-header">
            <strong>💬 Phản hồi của Quản lý:</strong>
            <span class="reply-time">${item.repliedAt ? new Date(item.repliedAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : 'Đã gửi'}</span>
          </div>
          <p class="reply-body">${escapeHtml(replyContent)}</p>
        </div>
      ` : '';

      return `
        <article class="feedback-item">
          <header>
            <div>
              <strong>Bàn ${escapeHtml(item.table || '—')}</strong>
              <span aria-label="${rating} trên 5 sao">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>
            </div>
            ${badge(item.status || 'new')}
          </header>
          <blockquote>“${escapeHtml(item.text || '')}”</blockquote>
          ${replyHtml}
          <footer>
            <span class="tag">${escapeHtml(item.theme || 'Chưa phân loại')}</span>
            <button type="button" class="button small ${hasReplied ? 'quiet' : 'primary'}" data-reply-feedback="${escapeHtml(item.id)}">
              ${hasReplied ? '✏️ Xem & Sửa phản hồi' : '💬 Phản hồi khách'}
            </button>
          </footer>
        </article>
      `;
    }).join('')
    : emptyState('Chưa có phản hồi', 'Đánh giá của khách sau khi dùng bữa sẽ xuất hiện tại đây.');

  const avgRating = document.querySelector('#avg-rating');
  const avgStars = document.querySelector('#avg-stars');
  const countEl = document.querySelector('#feedback-count');
  const posPct = document.querySelector('#positive-percent');
  const posBar = document.querySelector('#positive-bar');
  const negPct = document.querySelector('#negative-percent');
  const negBar = document.querySelector('#negative-bar');
  const listEl = document.querySelector('#feedback-list');

  if (avgRating) avgRating.textContent = average;
  if (avgStars) avgStars.textContent = ratings.length ? '★'.repeat(Math.round(Number(average.replace(',', '.')))) : '☆☆☆☆☆';
  if (countEl) countEl.textContent = `${feedback.length} phản hồi`;
  if (posPct) posPct.textContent = `${positive}%`;
  if (posBar) posBar.style.width = `${positive}%`;
  if (negPct) negPct.textContent = `${needsImprovement}%`;
  if (negBar) negBar.style.width = `${needsImprovement}%`;
  if (listEl) listEl.innerHTML = items;
}


/* ==========================================================================
   PHẦN 3: THUẬT TOÁN AI-3 KHAI PHÁ CHỦ ĐỀ (FEEDBACK THEME EXTRACTOR)
   Logic:
   - Kiểm tra dữ liệu đầu vào: nếu chưa đủ dữ liệu hoặc chuỗi tìm kiếm quá ngắn (< 10 ký tự),
     kích hoạt trạng thái cảnh báo không chắc chắn (Uncertainty) và cung cấp gợi ý mẫu (Prompt Chips)
   - Mô phỏng quá trình xử lý NLP qua độ trễ 800ms
   - Sinh kết quả với chỉ số độ tin cậy (Confidence Score 88%), 3 chủ đề trọng yếu,
     đoạn kiến nghị hành động và khối giải trình lý do (Explainability)
   ========================================================================== */
function runThemeAI(form) {
  const feedback = getFeedbackList();
  const goal = (new FormData(form).get('goal') || '').trim();
  const el = document.querySelector('#theme-result');
  if (!el) return;

  if (!feedback.length) {
    el.innerHTML = `
      <div class="ai-warning">
        <strong>Chưa có dữ liệu phản hồi</strong>
        <p>Hệ thống cần ít nhất 3 nhận xét từ khách để tiến hành khai phá chủ đề.</p>
      </div>
    `;
    return;
  }

  // Xử lý trường hợp đầu vào quá ngắn hoặc mập mờ (AI Uncertainty / Failure UX)
  if (goal.length < 10) {
    el.innerHTML = `
      <div class="ai-warning" role="alert">
        <span class="confidence low">Độ tin cậy thấp: <strong>32%</strong></span>
        <strong>Yêu cầu quá ngắn để AI phân tích chính xác</strong>
        <p>Mục tiêu phân tích cần ít nhất 10 ký tự. Bạn có thể chọn một trong các gợi ý dưới đây:</p>
        <div class="prompt-chips">
          <button type="button" data-prompt="Tìm vấn đề phục vụ giờ cao điểm">Vấn đề phục vụ</button>
          <button type="button" data-prompt="Tìm món ăn cần cải thiện hương vị">Món cần cải thiện</button>
          <button type="button" data-prompt="Đánh giá thái độ nhân viên sảnh">Thái độ nhân viên</button>
        </div>
      </div>
    `;
    return;
  }

  // Trạng thái đang xử lý (Processing State)
  el.innerHTML = `
    <div class="ai-loading">
      <span></span>
      <p>AI đang khai phá và phân nhóm ${feedback.length} phản hồi của khách...</p>
    </div>
  `;

  // Mô phỏng độ trễ xử lý mô hình trong 800ms
  setTimeout(() => {
    // Trạng thái kết quả đầu ra: Chỉ số tin cậy + 3 chủ đề + Giải trình + Quyền kiểm soát
    el.innerHTML = `
      <article class="ai-answer">
        <span class="confidence">Độ tin cậy: <strong>88%</strong> (Rất cao)</span>
        <h3>3 Chủ đề nổi bật được phân nhóm:</h3>
        <ol class="theme-list">
          <li><span>1. Thời gian chờ lên món</span><b>38%</b></li>
          <li><span>2. Hương vị món ăn</span><b>34%</b></li>
          <li><span>3. Thái độ phục vụ tại bàn</span><b>28%</b></li>
        </ol>

        <!-- Cho phép người dùng chỉnh sửa trực tiếp nội dung kiến nghị trước khi áp dụng -->
        <label for="ai-theme-copy" class="sr-only">Đề xuất hành động của AI</label>
        <textarea id="ai-theme-copy" rows="3" aria-label="Đề xuất hành động từ AI">Ưu tiên tăng cường 1 nhân sự phụ bếp khung giờ cao điểm 18:30–19:30 để giảm độ trễ món chính.</textarea>

        <!-- Tính minh bạch: Giải thích cơ sở phân tích của AI (Explainability) -->
        <details>
          <summary>Vì sao AI đề xuất kết quả này?</summary>
          <p>Thuật toán trích xuất các từ khóa xuất hiện lặp lại nhiều lần: "chờ lâu", "chậm", "nhắc nước", tập trung 80% vào các bàn khu vực vườn và sảnh ngoài.</p>
        </details>

        <!-- Các thao tác can thiệp của người dùng (User Control) -->
        <div class="ai-actions">
          <button type="button" class="button small primary" data-action="save-theme">Lưu insight</button>
          <button type="button" class="button small quiet" data-action="edit-ai">Chỉnh sửa</button>
          <button type="button" class="link-button" data-action="rerun-theme">Tạo lại</button>
          <button type="button" class="link-button danger-text" data-action="reject-ai">Từ chối</button>
        </div>
      </article>
    `;
  }, 800);
}


/* ==========================================================================
   PHẦN 4: LẮNG NGHE SỰ KIỆN TƯƠNG TÁC NGƯỜI DÙNG & LƯU DỮ LIỆU
   Logic:
   - Xử lý click chọn Prompt Chips gợi ý
   - Chỉnh sửa trực tiếp nội dung gợi ý (focus và select văn bản)
   - Tạo lại phân tích (Regenerate / Rerun)
   - Lưu insight phân tích vào LocalStorage
   - Cập nhật trạng thái phản hồi khách hàng (status: replied)
   ========================================================================== */
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;

  // Chọn gợi ý nhanh từ Prompt Chips cho AI
  if (b.dataset.prompt) {
    const input = document.querySelector('#theme-form input[name="goal"]');
    if (input) {
      input.value = b.dataset.prompt;
      input.focus();
    }
  }

  // Chọn mẫu phản hồi nhanh cho Quản lý
  if (b.dataset.replyTemplate) {
    const messageInput = document.querySelector('#reply-message');
    if (messageInput) {
      messageInput.value = b.dataset.replyTemplate;
      messageInput.focus();
    }
  }

  const action = b.dataset.action;

  // Lưu đề xuất AI vào LocalStorage
  if (action === 'save-theme') {
    const textProposal = document.querySelector('#ai-theme-copy')?.value || '';
    const decision = {
      type: 'feedback-theme-extraction',
      proposal: textProposal,
      confidence: '88%',
      savedAt: new Date().toISOString()
    };
    setStore('aiDecision', decision);
    toast('Đã lưu kết quả phân tích AI vào hệ thống');
  }

  // Cho phép người dùng chỉnh sửa nội dung văn bản trực tiếp
  if (action === 'edit-ai') {
    const textarea = document.querySelector('#ai-theme-copy');
    if (textarea) {
      textarea.focus();
      textarea.select();
      toast('Bạn có thể chỉnh sửa trực tiếp nội dung đề xuất', 'info');
    }
  }

  // Chạy lại phân tích để lấy phương án khác (Regenerate)
  if (action === 'rerun-theme') {
    document.querySelector('#theme-form')?.requestSubmit();
  }

  // Từ chối và hủy bỏ đề xuất
  if (action === 'reject-ai') {
    const res = document.querySelector('#theme-result');
    if (res) {
      res.innerHTML = emptyState('Đã hủy bỏ đề xuất', 'Bạn có thể thay đổi mục tiêu phân tích để AI gợi ý lại.');
    }
    toast('Đã từ chối gợi ý của AI', 'info');
  }

  // Mở popup phản hồi hoặc xem & sửa phản hồi gửi thực khách
  if (b.dataset.replyFeedback) {
    const feedback = getFeedbackList();
    const item = feedback.find(f => f.id === b.dataset.replyFeedback);
    if (!item) return;

    const dialog = document.querySelector('#reply-dialog');
    const idInput = document.querySelector('#reply-feedback-id');
    const tableEl = document.querySelector('#reply-customer-table');
    const starsEl = document.querySelector('#reply-customer-stars');
    const textEl = document.querySelector('#reply-customer-text');
    const messageInput = document.querySelector('#reply-message');

    if (dialog && idInput && messageInput) {
      idInput.value = item.id;
      if (tableEl) tableEl.textContent = `Bàn ${item.table || '—'}`;
      const rating = Math.max(1, Math.min(5, Number(item.rating) || 5));
      if (starsEl) starsEl.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      if (textEl) textEl.textContent = `“${item.text || ''}”`;
      messageInput.value = item.reply || '';
      dialog.showModal();
    }
  }
});

// Bắt sự kiện gửi form phân tích AI & gửi form phản hồi khách hàng
document.addEventListener('submit', e => {
  if (e.target.id === 'theme-form') {
    e.preventDefault();
    runThemeAI(e.target);
  }

  if (e.target.id === 'reply-feedback-form') {
    e.preventDefault();
    const form = e.target;
    const id = form.querySelector('#reply-feedback-id')?.value;
    const replyText = form.querySelector('#reply-message')?.value?.trim();

    if (!id || !replyText) {
      toast('Vui lòng nhập nội dung phản hồi', 'danger');
      return;
    }

    const feedback = getFeedbackList();
    const item = feedback.find(f => f.id === id);
    if (item) {
      item.status = 'replied';
      item.reply = replyText;
      item.repliedAt = new Date().toISOString();
      setStore('feedback', feedback);
      if (appData) appData.feedback = feedback;

      feedbackPage();
      const dialog = document.querySelector('#reply-dialog');
      if (dialog) dialog.close();
      toast(`Đã gửi phản hồi thành công tới Bàn ${item.table}!`);
    }
  }
});

// Khởi chạy nạp dữ liệu ban đầu
bootPage(feedbackPage);
