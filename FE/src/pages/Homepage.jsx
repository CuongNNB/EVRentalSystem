import Header from "../components/Header";
import Hero from "../components/Hero";
import Steps from "../components/Steps";
import Reviews from "../components/Review";
import Footer from "../components/Footer";
import "./Homepage.css";
import heroBg from '../picture/nen.png';


export default function Homepage() {

  return (
    <div className="homepage">
      <Header />
      <Hero backgroundImage={heroBg} />
      <main>

        <Steps />
        
        {/* Why Choose Us Section */}
        <section className="why-choose-section" aria-label="Tại sao chọn chúng tôi">
          <div className="choose-container">
            <div className="choose-header">
              <span className="choose-badge">TẠI SAO CHỌN CHÚNG TÔI</span>
              <h2>Lý do hàng nghìn khách hàng tin tưởng</h2>
              <p>Trải nghiệm thuê xe điện thông minh, tiện lợi và an toàn nhất Việt Nam</p>
            </div>
            
            <div className="choose-grid">
              <div className="choose-card">
                <div className="choose-icon">⚡</div>
                <h3>Tiết kiệm chi phí</h3>
                <p>Giá thuê cạnh tranh, không phí ẩn. Tiết kiệm 60% chi phí so với taxi truyền thống.</p>
                <div className="choose-highlight">
                  <span>Chỉ từ 15.000đ/giờ</span>
                </div>
              </div>
              
              <div className="choose-card">
                <div className="choose-icon">🌱</div>
                <h3>Thân thiện môi trường</h3>
                <p>100% xe điện, không khí thải. Góp phần bảo vệ môi trường cho thế hệ tương lai.</p>
                <div className="choose-highlight">
                  <span>0% khí thải CO2</span>
                </div>
              </div>
              
              <div className="choose-card">
                <div className="choose-icon">🔒</div>
                <h3>An toàn tuyệt đối</h3>
                <p>Xe mới 100%, bảo hiểm toàn diện. Nhân viên kiểm tra kỹ lưỡng trước mỗi chuyến đi.</p>
                <div className="choose-highlight">
                  <span>Bảo hiểm 500 triệu VNĐ</span>
                </div>
              </div>
              
              <div className="choose-card">
                <div className="choose-icon">📱</div>
                <h3>Ứng dụng thông minh</h3>
                <p>Đặt xe, theo dõi lộ trình, thanh toán tự động. Trải nghiệm công nghệ 4.0.</p>
                <div className="choose-highlight">
                  <span>App 4.8★ trên Store</span>
                </div>
              </div>
              
              <div className="choose-card">
                <div className="choose-icon">🚀</div>
                <h3>Khởi hành nhanh chóng</h3>
                <p>Xác thực 5 phút, nhận xe ngay. Không cần chờ đợi, tiết kiệm thời gian quý báu.</p>
                <div className="choose-highlight">
                  <span>Chỉ 5 phút xác thực</span>
                </div>
              </div>
              
              <div className="choose-card">
                <div className="choose-icon">🎯</div>
                <h3>Phủ sóng toàn quốc</h3>
                <p>50+ trạm thuê xe tại các thành phố lớn. Luôn có xe sẵn sàng phục vụ bạn.</p>
                <div className="choose-highlight">
                  <span>10+ trạm toàn miền nam</span>
                </div>
              </div>
            </div>
            
            <div className="choose-stats">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Khách hàng hài lòng</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Chuyến đi thành công</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Tỷ lệ hài lòng</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Hỗ trợ khách hàng</div>
              </div>
            </div>
            
            <div className="choose-cta">
              <button className="btn primary-btn">Bắt đầu trải nghiệm ngay</button>
            </div>
          </div>
        </section>

        {/* Process Flow Section */}
        <section className="process-flow-section" aria-label="Quy trình thuê xe">
          <div className="process-container">
            <div className="process-header">
              <span className="process-badge">QUY TRÌNH</span>
              <h2>Thuê xe điện chỉ trong 3 bước</h2>
              <p>Đơn giản, nhanh chóng và an toàn</p>
            </div>
            
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Đăng ký & Xác thực</h3>
                  <p>Upload giấy phép lái xe và CMND/CCCD. Xác thực nhanh tại điểm thuê.</p>
                  <div className="step-features">
                    <span>✓ Xác thực 5 phút</span>
                    <span>✓ Bảo mật cao</span>
                  </div>
                </div>
              </div>
              
              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Đặt xe & Nhận xe</h3>
                  <p>Tìm trạm gần nhất, chọn xe phù hợp. Check-in và ký hợp đồng điện tử.</p>
                  <div className="step-features">
                    <span>✓ Đặt xe trước</span>
                    <span>✓ Hợp đồng điện tử</span>
                  </div>
                </div>
              </div>
              
              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Trả xe & Thanh toán</h3>
                  <p>Trả xe đúng điểm, nhân viên kiểm tra. Thanh toán tự động qua ứng dụng.</p>
                  <div className="step-features">
                    <span>✓ Trả xe linh hoạt</span>
                    <span>✓ Thanh toán tự động</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Reviews />
        
        {/* Final CTA Section */}
        <section className="final-cta-section">
          <div className="cta-content">
            <h2>Trải nghiệm xe điện ngay hôm nay</h2>
            <p>Tham gia hàng nghìn khách hàng đã chọn EV Car Rental cho hành trình xanh</p>
            <div className="cta-buttons">
              <button className="btn primary-btn cta-main">Đặt xe ngay</button>
              <button className="btn secondary-btn cta-secondary">Tìm hiểu thêm</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
