type AppLoadingMarkProps = {
  id?: string;
  initial?: boolean;
  leaving?: boolean;
  hidden?: boolean;
};

export default function AppLoadingMark({
  id,
  initial = false,
  leaving = false,
  hidden = false,
}: AppLoadingMarkProps) {
  return (
    <div
      id={id}
      className={`app-loader${initial ? " app-loader--initial" : ""}${leaving ? " app-loader--leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="页面加载中"
      aria-hidden={hidden ? "true" : undefined}
    >
      <div className="app-loader__panel">
        <img
          className="app-loader__mark"
          src="/brand/zonora-mark.png"
          width="18"
          height="32"
          alt=""
          aria-hidden="true"
        />
        <div className="app-loader__copy">
          <p className="app-loader__brand">Zonora</p>
          <p className="app-loader__title">正在加载</p>
          <div className="app-loader__meter" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
