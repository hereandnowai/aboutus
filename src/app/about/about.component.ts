import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// Simple in-component FAQ model
interface FaqItem { q: string; a: string; open: boolean; }
interface Testimonial { name: string; quote: string; role?: string; }
interface Achievement { year: string; title: string; desc: string; }
interface TeamMember { name: string; role: string; img: string; alt: string; }

@Component({
    selector: 'app-about',
    imports: [NgOptimizedImage, ReactiveFormsModule],
    templateUrl: './about.component.html',
    styleUrl: './about.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'about-page',
        '[style.--color-primary]': 'colorPrimary()',
        '[style.--color-secondary]': 'colorSecondary()'
    }
})
export class AboutComponent {
    readonly Math = Math;
    // Branding / constants as signals for easy future dynamic updates
    readonly companyName = signal('HERE AND NOW AI');
    readonly slogan = signal('Designed with Passion for Innovation');
    readonly founded = signal('2011');
    readonly headquarters = signal('Chennai, India');
    readonly services = signal(['AI-driven solutions']);
    readonly colorPrimary = signal('#004040');
    readonly colorSecondary = signal('#ffb300');

    // Media / audio
    private audioEl = new Audio('assets/intro.mp3');
    readonly isPlaying = signal(false);
    readonly audioTime = signal(0);
    readonly audioDuration = signal(0);

    readonly playLabel = computed(() => this.isPlaying() ? 'Pause Intro' : 'Play Intro');
    readonly progressPct = computed(() => this.audioDuration() ? (this.audioTime() / this.audioDuration()) * 100 : 0);

    // Team
    readonly team = signal<TeamMember[]>([
        { name: 'Deepti BALAGOPAL', role: 'Chief Operating Officer', img: 'assets/images/deepti.png', alt: 'Deepti BALAGOPAL' },
        { name: 'Balaji KAMALAKKANNAN', role: 'Chief Technology Officer', img: 'assets/images/balaji.png', alt: 'Balaji KAMALAKKANNAN' },
        { name: 'Ruthran RAGHAVAN', role: 'Chief Executive Officer', img: 'assets/images/ruthran.png', alt: 'Ruthran RAGHAVAN' },
        { name: 'Gopalakrishnan KANNAN', role: 'Chief Business Development Officer', img: 'assets/images/gopal.png', alt: 'Gopalakrishnan KANNAN' },
    ]);

    // Achievements
    readonly achievements = signal<Achievement[]>([
        { year: '2015', title: 'Platform Launch', desc: 'Released first AI analytics platform.' },
        { year: '2019', title: 'Global Expansion', desc: 'Opened offices across 3 continents.' },
        { year: '2023', title: 'Innovation Award', desc: 'Recognized for ethical AI implementation.' },
    ]);

    // Testimonials
    readonly testimonials = signal<Testimonial[]>([
        { name: 'Acme Corp', quote: 'HERE AND NOW AI transformed our data strategy.', role: 'CTO' },
        { name: 'Insight Labs', quote: 'Exceptional partnership and measurable ROI.', role: 'Product Lead' },
        { name: 'ZenRetail', quote: 'AI personalization boosted conversions 35%.', role: 'Growth Manager' },
    ]);

    // FAQs
    readonly faqs = signal<FaqItem[]>([
        { q: 'What industries do you serve?', a: 'Finance, Retail, Healthcare, and more via adaptable AI modules.', open: false },
        { q: 'Do you offer custom solutions?', a: 'Yes, we tailor AI workflows to your domain & data maturity.', open: false },
        { q: 'How do you ensure data privacy?', a: 'We implement strict governance, anonymization, and compliance audits.', open: false },
    ]);

    toggleFaq(i: number) {
        this.faqs.update(list => list.map((f, idx) => idx === i ? { ...f, open: !f.open } : f));
    }

    // Newsletter form (Reactive Forms)
    private fb = inject(FormBuilder);
    readonly newsletterForm = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]]
    });
    // Reactive validity signal (computed() would not re-evaluate because form validity isn't a signal)
    readonly formValid = signal(false);

    submitNewsletter() {
        if (this.newsletterForm.invalid) return;
        const email = this.newsletterForm.value.email;
        // Placeholder action: would call a service
        console.log('Newsletter signup:', email);
        this.newsletterForm.reset({ email: '' });
    }

    // Contact info
    readonly email = signal('info@hereandnowai.com');
    readonly phone = signal('+91 996 296 1000');
    readonly website = signal('https://hereandnowai.com');

    // Brochure (dummy file path - ensure placed in assets later if added)
    readonly brochureUrl = signal('assets/brochure.pdf');

    // Derived
    readonly serviceList = computed(() => this.services().join(', '));

    constructor() {
        // Initialize form validity tracking
        this.formValid.set(this.newsletterForm.valid);
        this.newsletterForm.statusChanges.subscribe(() => this.formValid.set(this.newsletterForm.valid));

        // Audio events
        this.audioEl.addEventListener('timeupdate', () => {
            this.audioTime.set(this.audioEl.currentTime);
        });
        this.audioEl.addEventListener('loadedmetadata', () => {
            this.audioDuration.set(this.audioEl.duration);
        });
        this.audioEl.addEventListener('ended', () => this.isPlaying.set(false));
        this.audioEl.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.isPlaying.set(false);
        });

        // Preload audio
        this.audioEl.preload = 'metadata';
    }

    async toggleAudio() {
        if (this.isPlaying()) {
            this.audioEl.pause();
            this.isPlaying.set(false);
        } else {
            try {
                await this.audioEl.play();
                this.isPlaying.set(true);
            } catch (error) {
                console.error('Audio play failed:', error);
                this.isPlaying.set(false);
            }
        }
    }
}
