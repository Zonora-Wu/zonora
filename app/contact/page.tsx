export default function ContactPage() {
  return (
    <section className="page-section page-section--center contact-page">
      <div className="contact-page__intro">
        <h1 className="page-title contact-page__title">联系</h1>
        <p className="contact-page__lead">项目合作、技术交流或日常沟通，可以通过下面的方式找到我。</p>
      </div>

      <div className="contact-grid">
        <div className="contact-card" style={{ animationDelay: "0ms" }}>
          <span className="contact-card__icon">&#9990;</span>
          <span className="contact-card__label">电话</span>
          <a className="contact-card__value" href="tel:+4407784071819">
            +44 07784 071819
          </a>
        </div>

        <div className="contact-card" style={{ animationDelay: "120ms" }}>
          <span className="contact-card__icon">&#9993;</span>
          <span className="contact-card__label">邮箱</span>
          <div className="contact-card__values">
            <a className="contact-card__value" href="mailto:zonora@qq.com">
              zonora@qq.com
            </a>
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
