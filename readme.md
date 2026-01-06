# Rocky Top Business Directory

A modern, community-focused local business directory for East Tennessee. Built to help residents discover and support local businesses, with special emphasis on women-owned, veteran-owned, and new businesses in the community.

## Project Intent

The Rocky Top Business Directory was created with a "people over profit" philosophy, serving small businesses, nonprofits, artists, and entrepreneurs in East Tennessee who need an accessible platform to connect with their community. The directory aims to:

- **Support Local Economy** — Make it easy for residents to find and choose local businesses over national chains
- **Highlight Underrepresented Owners** — Feature women-owned and veteran-owned businesses with visible badges
- **Welcome New Businesses** — Give newly established businesses visibility with "New This Month" highlights
- **Build Community Connections** — Facilitate direct contact between customers and business owners

## Features

### Search & Discovery
- Live search with debounced input
- Category filtering (Automotive, Construction, Food & Dining, Health & Wellness, Home Services, Professional Services, Retail, Technology)
- Ownership filters (Women-Owned, Veteran-Owned, New This Month)
- Tag-based filtering (24 Hour, Free Estimates, Family Owned, etc.)
- Active filter management with individual removal

### Business Listings
- Responsive card grid (1-3 columns based on viewport)
- Business cards with image placeholder, badges, description, tags, and contact info
- Favorite/save functionality
- Quick contact and detail view actions

### Lead Routing
- Contact modal with form validation
- Captures name, email, phone, subject, and message
- Routes inquiries directly to business owners

### Claim Your Business
- 3-step verification wizard
- Search for existing listings
- Multiple verification options (phone, email, document upload)
- Ownership verification flow

### Accessibility
- Semantic HTML5 structure
- ARIA labels and roles throughout
- Keyboard navigation support
- Screen reader announcements for dynamic content
- Focus management for modals
- Skip link to main content

## Tech Stack

- **HTML5** — Semantic markup with accessibility features
- **CSS3** — Custom properties, fluid typography with `clamp()`, CSS Grid, Flexbox, mobile-first responsive design
- **JavaScript ES6+** — Vanilla JS with no frameworks, debounced search, event delegation, state management
- **Font Awesome 6.5** — Icon system
- **Google Fonts** — Archivo (UI) + Source Serif 4 (display headings)

## Design System

### Color Palette (Warm Industrial)
| Color | Hex | Usage |
|-------|-----|-------|
| Cream | `#EFECE4` | Body background |
| Warm White | `#FFFFFF` | Cards, surfaces |
| Charcoal | `#2D2926` | Primary text, dark UI |
| Slate | `#4A4543` | Secondary text |
| Rust | `#B85C38` | Primary accent, CTAs |
| Forest | `#3D5A47` | Secondary accent, success states |
| Gold | `#C4A035` | Featured badges |

### Badge Colors
- **Women-Owned** — Purple `#9D4EDD`
- **Veteran-Owned** — Blue `#1D4ED8`
- **New This Month** — Rust `#B85C38`
- **Featured** — Gold `#C4A035`

### Typography
- **Headings** — Source Serif 4, line-height 1.1
- **Body** — Archivo, line-height 1.5
- **Scale** — Fluid sizing with `clamp()` for responsive scaling

## File Structure

```
directory/
├── index.html      # Main HTML structure
├── styles.css      # All styles with CSS custom properties
├── app.js          # JavaScript functionality
└── README.md       # Project documentation
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## Future Enhancements

- [ ] Backend integration for real business data
- [ ] User authentication for business owners
- [ ] Individual business detail pages
- [ ] Review and rating system
- [ ] Map integration with business locations
- [ ] Advanced search with location radius
- [ ] Business analytics dashboard
- [ ] Email notification system for leads
- [ ] Image upload for business photos
- [ ] SEO optimization for individual listings

## Local Development

Simply open `index.html` in a web browser. No build process or server required.

For development with live reload, you can use any simple HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server installed)
npx http-server
```

## Credits

Designed and developed by **HC Web Labs** — Hand-coded websites for small businesses, nonprofits, and entrepreneurs in East Tennessee.

---

*Made with ♥ in East Tennessee*
