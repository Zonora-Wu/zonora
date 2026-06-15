export default function ContactPage() {
  return (
    <section className="page-section page-section--center">
      <h1 className="page-title page-title--roomy">联系</h1>

      <div className="contact-grid">
        <div className="contact-card" style={{ animationDelay: "0ms" }}>
          <span className="contact-card__icon">&#9990;</span>
          <span className="contact-card__label">电话</span>
          <span className="contact-card__value">+44 07784 071819</span>
        </div>

        <div className="contact-card" style={{ animationDelay: "120ms" }}>
          <span className="contact-card__icon">&#9993;</span>
          <span className="contact-card__label">邮箱</span>
          <div className="contact-card__values">
            <span className="contact-card__value">zonora@qq.com</span>
                </div>
        </div>

        <div className="contact-card" style={{ animationDelay: "240ms" }}>
          <span className="contact-card__icon">&#9654;</span>
          <span className="contact-card__label">Bilibili</span>
          <span className="contact-card__value">@吃小灰的糍粑</span>
        </div>
      </div>
    </section>
  );
}
