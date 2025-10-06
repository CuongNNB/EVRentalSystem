// Style Switcher for Login/Register Pages
// Allows switching between different background styles

export const STYLES = {
  SOFT_GRADIENT: 'soft-gradient',      // 🌈 Gradient mềm (hiện đại, startup style)
  FOCUS_GRADIENT: 'focus-style',       // 🪞 Gradient với ánh sáng trung tâm
  ILLUSTRATION: 'illustration-style',  // 🏙️ Hình minh họa nhẹ
  PATTERN: 'pattern-style'              // 🧊 Pattern tinh tế
};

export function applyStyle(styleName) {
  // Remove all style classes
  const loginPage = document.querySelector('.login-page');
  const registerPage = document.querySelector('.register-page-layout');
  
  if (loginPage) {
    Object.values(STYLES).forEach(style => {
      loginPage.classList.remove(style);
    });
    
    if (styleName !== STYLES.SOFT_GRADIENT) {
      loginPage.classList.add(styleName);
    }
  }
  
  if (registerPage) {
    Object.values(STYLES).forEach(style => {
      registerPage.classList.remove(style);
    });
    
    if (styleName !== STYLES.SOFT_GRADIENT) {
      registerPage.classList.add(styleName);
    }
  }
  
  // Save preference
  localStorage.setItem('loginStyle', styleName);
}

export function getCurrentStyle() {
  return localStorage.getItem('loginStyle') || STYLES.SOFT_GRADIENT;
}

export function initializeStyle() {
  const currentStyle = getCurrentStyle();
  applyStyle(currentStyle);
}

// Style descriptions for UI
export const STYLE_DESCRIPTIONS = {
  [STYLES.SOFT_GRADIENT]: {
    name: 'Gradient Mềm',
    description: 'Màu xanh ngọc – tím nhạt – trắng mờ, phối như năng lượng sạch',
    emoji: '🌈',
    advantages: 'Tinh tế, chuyên nghiệp, nhẹ nhàng'
  },
  [STYLES.FOCUS_GRADIENT]: {
    name: 'Ánh Sáng Trung Tâm',
    description: 'Tạo điểm sáng quanh form đăng ký',
    emoji: '🪞',
    advantages: 'Giúp form "nổi lên", dễ tập trung'
  },
  [STYLES.ILLUSTRATION]: {
    name: 'Hình Minh Họa',
    description: 'Dùng ảnh EV với opacity thấp',
    emoji: '🏙️',
    advantages: 'Giữ thương hiệu EV, tạo chiều sâu'
  },
  [STYLES.PATTERN]: {
    name: 'Pattern Tinh Tế',
    description: 'Dùng texture hoặc SVG pattern mờ ở góc',
    emoji: '🧊',
    advantages: 'Giúp giao diện có chiều sâu mà không rối'
  }
};
