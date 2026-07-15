import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    title: 'Buy & Sell With Fellow Students',
    subtitle: 'Textbooks, electronics, furniture, and more, all within KsTU.',
    image: '/hero/slide-1.jpg',
    ctaLabel: 'Start Browsing',
    ctaTo: '/',
    ctaState: { scrollTo: 'listings' }
  },
  {
    title: "Got Textbooks You Don't Need?",
    subtitle: 'Turn last semester\'s books into cash in minutes.',
    image: '/hero/slide-2.jpg',
    ctaLabel: 'Post a Listing',
    ctaTo: '/post'
  },
  {
    title: 'Chat Instantly With Sellers',
    subtitle: 'Real-time messaging built right into CampusCart.',
    image: '/hero/slide-3.jpg',
    ctaLabel: 'Browse Electronics',
    ctaTo: '/?category=electronics',
    ctaState: { scrollTo: 'listings' }
  }
];

const AUTO_ADVANCE_MS = 6000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Preload every slide image as soon as the carousel mounts, so advancing
  // to the next slide never has to wait on a network fetch/decode. That
  // wait was showing up as a blank flash between slides.
  useEffect(() => {
    SLIDES.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="hero-carousel">
      <div className="hero-slide-stack">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.image}
            className={`hero-slide ${i === index ? 'hero-slide-active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
            aria-hidden={i !== index}
          >
            <div className="hero-overlay" />
            <div className="hero-content">
              <h2 className="hero-title">{slide.title}</h2>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <Link to={slide.ctaTo} state={slide.ctaState} className="hero-cta">{slide.ctaLabel} →</Link>
            </div>
          </div>
        ))}

        <button className="hero-arrow hero-arrow-left" onClick={prev} aria-label="Previous slide">
          <ChevronLeft size={22} />
        </button>
        <button className="hero-arrow hero-arrow-right" onClick={next} aria-label="Next slide">
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="hero-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
