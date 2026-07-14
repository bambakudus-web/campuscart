import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    title: 'Buy & Sell With Fellow Students',
    subtitle: 'Textbooks, electronics, furniture, and more, all within KsTU.',
    image: '/hero/slide-1.jpg',
    ctaLabel: 'Start Browsing',
    ctaTo: '/'
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
    ctaTo: '/?category=electronics'
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

  useEffect(() => {
    const timer = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[index];

  return (
    <div className="hero-carousel">
      <div className="hero-slide" style={{ backgroundImage: `url(${slide.image})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h2 className="hero-title">{slide.title}</h2>
          <p className="hero-subtitle">{slide.subtitle}</p>
          <Link to={slide.ctaTo} className="hero-cta">{slide.ctaLabel} →</Link>
        </div>

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
