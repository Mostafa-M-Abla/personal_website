# Personal Portfolio Website

A professional portfolio website for Mostafa Abla, a Machine Learning Engineer.

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styling (`css/styles.css`)
- **Bootstrap 5** - Responsive framework (loaded via CDN)
- **Bootstrap Icons** - Icon library (loaded via CDN)
- **JavaScript** - Minimal, Bootstrap bundle only
- **Web3Forms** - Contact form submission API

## Project Structure

```
├── index.html                          # Home/landing page
├── resume.html                         # CV/resume page
├── projects.html                       # Portfolio projects gallery
├── contact.html                        # Contact form
├── thank-you.html                      # Form submission confirmation
├── project-job-market-analysis.html    # Detailed project page
├── css/
│   └── styles.css                      # Main stylesheet
├── js/
│   └── scripts.js                      # JavaScript (minimal)
├── assets/                             # Images and static files
├── Resume_Mostafa_Abla.pdf             # Downloadable resume
└── CNAME                               # GitHub Pages domain config
```

## Development

This is a static site with no build process:

- No package.json or npm dependencies
- All external libraries loaded via CDN (jsDelivr)
- Deploy directly to GitHub Pages

## Hosting

- **Domain:** mostafaabla.com
- **Platform:** GitHub Pages
- **Form Backend:** Web3Forms API

## Design System

**Colors:**
- Primary: `#4e73df` (blue)
- Secondary: `#1cc88a` (green)
- Text: `#243041` (dark), `#6c757d` (muted)

**Font:** Plus Jakarta Sans (Google Fonts)

## Pages Overview

- **Home** - Hero section with intro and CTA
- **Resume** - Work experience, education, skills (categorized)
- **Projects** - Portfolio cards linking to live demos on Hugging Face
- **Contact** - Form with Web3Forms integration

## Common Tasks

- **Edit styles:** Modify `css/styles.css`
- **Add a project:** Add card markup to `projects.html`
- **Update resume:** Edit `resume.html` and replace PDF in root
- **Change domain:** Update `CNAME` file