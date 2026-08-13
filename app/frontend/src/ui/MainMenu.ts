export class MainMenu {
  private container: HTMLElement;
  private onStartCallback: () => void;

  constructor(onStart: () => void) {
    this.onStartCallback = onStart;
    this.container = document.createElement('div');
    this.setupLayout();
  }

  private setupLayout(): void {
    this.container.id = 'main-menu';
    this.container.style.position = 'absolute';
    this.container.style.top = '0';
    this.container.style.left = '0';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'center';
    this.container.style.justifyContent = 'center';
    this.container.style.background = 'rgba(10, 10, 12, 0.85)';
    this.container.style.color = '#ffffff';
    this.container.style.fontFamily = 'sans-serif';

    this.container.innerHTML = `
      <h1 style="font-size: 3rem; margin-bottom: 2rem; letter-spacing: 2px;">LUNAR COLONY</h1>
      <div id="user-info" style="margin-bottom: 1.5rem; color: #8a8a93;">Загрузка профиля...</div>
      <button id="btn-start" style="
        padding: 12px 32px;
        font-size: 1.2rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
      ">Войти в мир</button>
    `;

    const btn = this.container.querySelector('#btn-start');
    btn?.addEventListener('click', () => this.onStartCallback());
  }

  public setUserInfo(username: string): void {
    const el = this.container.querySelector('#user-info');
    if (el) el.textContent = `Пилот: ${username}`;
  }

  public mount(parent: HTMLElement): void {
    parent.appendChild(this.container);
  }

  public hide(): void {
    this.container.style.display = 'none';
  }

  public show(): void {
    this.container.style.display = 'flex';
  }
}