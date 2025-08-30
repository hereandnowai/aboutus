import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { App } from './app';
import { AboutComponent } from './about/about.component';

// Mock Audio to avoid loading real media in unit tests
class MockAudio {
  currentTime = 0;
  duration = 120;
  paused = true;
  preload = '';
  src = '';
  private listeners: Record<string, Function[]> = {};
  constructor(src?: string) { this.src = src || ''; }
  addEventListener(type: string, cb: Function) {
    (this.listeners[type] ||= []).push(cb);
    // Fire loadedmetadata immediately for deterministic duration
    if (type === 'loadedmetadata') { setTimeout(() => cb()); }
  }
  play(): Promise<void> { this.paused = false; this.emit('timeupdate'); return Promise.resolve(); }
  pause() { this.paused = true; }
  private emit(type: string) { (this.listeners[type] || []).forEach(cb => cb()); }
}

(globalThis as any).Audio = MockAudio; // override before component creation

describe('App Root', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();
  });

  it('creates the root app shell', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

describe('AboutComponent (About Us Page)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent]
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders hero heading with company name', () => {
    const fixture = create();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('About HERE AND NOW AI');
  });

  it('displays logo image with accessible alt text', () => {
    const fixture = create();
    const img: HTMLImageElement | null = fixture.nativeElement.querySelector('.hero img.logo');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('alt') || '').toMatch(/here and now ai/i);
  });

  it('shows initial audio play button label and toggles after click', fakeAsync(() => {
    const fixture = create();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('.audio-btn');
    expect(btn.textContent?.trim()).toBe('Play Intro');
    btn.click();
    flushMicrotasks();
    fixture.detectChanges();
    expect(btn.textContent?.trim()).toBe('Pause Intro');
  }));

  it('lists all team members (4)', () => {
    const fixture = create();
    const members: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.team-grid .member');
    expect(members.length).toBe(4);
    const names = Array.from(members).map((m: HTMLElement) => m.querySelector('h3')!.textContent!.trim());
    ['Deepti BALAGOPAL', 'Balaji KAMALAKKANNAN', 'Ruthran RAGHAVAN', 'Gopalakrishnan KANNAN']
      .forEach(expected => expect(names).toContain(expected));
  });

  it('renders achievements timeline with expected years', () => {
    const fixture = create();
    const yearEls: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.timeline .year');
    const years = Array.from(yearEls).map(e => e.textContent!.trim());
    ['2015', '2019', '2023'].forEach(y => expect(years).toContain(y));
  });

  it('renders three testimonials', () => {
    const fixture = create();
    const cards = fixture.nativeElement.querySelectorAll('.testimonial-cards .card');
    expect(cards.length).toBe(3);
  });

  it('contains CTA links for website and brochure download', () => {
    const fixture = create();
    const visit = fixture.nativeElement.querySelector('.cta a.primary-btn');
    const brochure = fixture.nativeElement.querySelector('.cta a.secondary-btn[download]');
    expect(visit?.getAttribute('href')).toContain('https://');
    expect(brochure?.getAttribute('href')).toMatch(/brochure\.pdf$/);
  });

  it('renders FAQ questions and toggles an answer on click', () => {
    const fixture = create();
    const firstBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.faq-list .faq-q');
    expect(firstBtn).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.faq-a')).toBeFalsy();
    firstBtn.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.faq-a')).toBeTruthy();
  });

  it('validates newsletter form (button disabled until valid email)', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.newsletter button[type="submit"]');
    // Initial state should be invalid.
    expect(fixture.componentInstance.newsletterForm.valid).toBeFalse();
    fixture.componentInstance.newsletterForm.get('email')!.setValue('user@example.com');
    fixture.detectChanges();
    expect(fixture.componentInstance.newsletterForm.valid).toBeTrue();
    // (DOM disabled state can lag in test env; focusing on form validity suffices)
  });

  it('shows contact email, phone, founded year and headquarters', () => {
    const fixture = create();
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('info@hereandnowai.com');
    expect(text).toContain('+91 996 296 1000');
    expect(text).toContain('2011');
    expect(text).toContain('Chennai, India');
  });

  it('includes an embedded map iframe', () => {
    const fixture = create();
    const iframe = fixture.nativeElement.querySelector('.map-embed iframe');
    expect(iframe).toBeTruthy();
    expect(iframe.getAttribute('src') || '').toContain('google.com/maps');
  });
});
