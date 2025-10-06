const processSections = [
  {
    badge: "NHẬN XE",
    title: "Check-in, ký hợp đồng, bàn giao minh bạch",
    subtitle: "4 bước nhanh chóng giúp bạn tự tin bắt đầu hành trình.",
    items: [
      { step: 1, text: "Check-in tại quầy hướng dẫn cùng chuyên viên hỗ trợ." },
      { step: 2, text: "Đối chiếu giấy tờ và ký hợp đồng điện tử minh bạch." },
      { step: 3, text: "Nhận xe đã sạc đầy cùng biên bản bàn giao chi tiết." },
      { step: 4, text: "Được hướng dẫn thao tác lái và ứng dụng quản lý chuyến đi." },
    ],
  },
  {
    badge: "TRẢ XE",
    title: "Trả xe đúng điểm và hoàn tất thanh toán",
    subtitle: "Hoàn tất hành trình nhẹ nhàng, không lo phát sinh.",
    items: [
      { step: 1, text: "Trả xe tại trạm EV Station bất kỳ thuộc hệ thống." },
      { step: 2, text: "Chuyên viên kiểm tra nhanh tình trạng xe và xác nhận." },
      { step: 3, text: "Thanh toán chi phí thực tế qua ứng dụng trong 1 phút." },
      { step: 4, text: "Nhận hóa đơn điện tử và ưu đãi cho chuyến đi tiếp theo." },
    ],
  },
];

export default function Steps() {
  return (
    <section className="process-section">
      {processSections.map((section) => (
        <div key={section.title} className="process-card">
          <div className="process-card__header">
            <span className="badge">{section.badge}</span>
            <h2>{section.title}</h2>
            <p>{section.subtitle}</p>
          </div>
          <ul className="process-timeline">
            {section.items.map((item, index) => (
              <li key={index} className="process-step">
                <div className="step-number">{item.step}</div>
                <div className="step-content">
                  <span className="step-text">{item.text}</span>
                </div>
                {index < section.items.length - 1 && <div className="step-connector"></div>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
