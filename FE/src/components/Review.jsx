const reviews = [
  {
    name: "Hoàng Minh",
    role: "Doanh nhân",
    text: "Xe mới, sạch sẽ và được sạc đầy. Nhân viên hỗ trợ tận tâm ở mọi bước.",
    rating: 5,
  },
  {
    name: "Lan Anh",
    role: "Nhân viên văn phòng",
    text: "Thủ tục rất nhanh, đặt xe trên ứng dụng và nhận xe trong 5 phút.",
    rating: 5,
  },
  {
    name: "Quốc Huy",
    role: "Khách du lịch",
    text: "Giá cả rõ ràng, không phát sinh thêm khi trả xe. Rất hài lòng!",
    rating: 5,
  },
  {
    name: "Thu Ngân",
    role: "Content creator",
    text: "Hệ thống trạm sạc phủ khắp. Ứng dụng thông báo rất trực quan.",
    rating: 4,
  },
  {
    name: "Trọng Tín",
    role: "Kỹ sư phần mềm",
    text: "Được hướng dẫn lái xe điện chi tiết, cảm giác an toàn và hiện đại.",
    rating: 5,
  },
  {
    name: "Diễm My",
    role: "Chủ doanh nghiệp",
    text: "Ưu đãi cho khách hàng thân thiết rất tốt. Tôi sẽ quay lại. ",
    rating: 5,
  },
];

export default function Reviews() {
  return (
    <section className="reviews-section">
      <div className="section-heading">
        <span className="badge">CẢM NHẬN</span>
        <h2>Đánh giá khách hàng</h2>
        <p>Trải nghiệm được xác nhận bởi cộng đồng người dùng EV Car Rental.</p>
      </div>

      <div className="reviews-grid">
        {reviews.map((review) => (
          <article key={review.name} className="review-card">
            <p className="review-rating" aria-label={`${review.rating} trên 5 sao`}>
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </p>
            <p className="review-text">“{review.text}”</p>
            <div className="review-author">
              <div className="avatar" aria-hidden>
                {review.name
                  .split(" ")
                  .map((seg) => seg[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div className="author-name">{review.name}</div>
                <div className="author-role">{review.role}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
