
export default function Footer() {
  return (
    <footer className="homepage-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="brand-icon" aria-hidden>🚗</div>
          <div>
            <div className="brand-name">EV Car Rental</div>
            <p>Đồng hành cùng bạn trên mọi hành trình xanh.</p>
          </div>
        </div>
        <div className="footer-columns">
          <div>
            <h4>Trụ sở</h4>
            <p>100 Nguyễn Huệ, Quận 1, TP.HCM</p>
            <p>Hotline: 1800 6868</p>
            <p>Email: support@ev-rental.com</p>
          </div>
          <div>
            <h4>Liên kết</h4>
            <a href="#">Lịch sử đặt xe</a>
            <p></p>
            <a href="#">Các gói ưu đãi</a>
            <p></p>
            <a href="#">Đối tác doanh nghiệp</a>
          </div>
          <div>
            <h4>Hỗ trợ</h4>
            <a href="#">Câu hỏi thường gặp</a>
            <p></p>
            <a href="#">Chính sách bảo mật</a>
            <p></p>
            <a href="#">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} EV Car Rental. All rights reserved.</span>
        
      </div>
    </footer>
  );
}
