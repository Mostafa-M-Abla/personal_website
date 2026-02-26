# Personal Portfolio Website

A professional portfolio website for Mostafa Abla, a Machine Learning Engineer.

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styling (`css/styles.css`)
- **Bootstrap 5** - Responsive framework (loaded via CDN)
- **Bootstrap Icons** - Icon library (loaded via CDN)
- **JavaScript** - Minimal, Bootstrap bundle only + chat widget
- **Web3Forms** - Contact form submission API

## Project Structure

```
├── index.html                          # Home/landing page
├── resume.html                         # CV/resume page
├── projects.html                       # Portfolio projects gallery
├── contact.html                        # Contact form (chat widget embedded here)
├── thank-you.html                      # Form submission confirmation
├── project-job-market-analysis.html    # Detailed project page
├── job_market_report.html              # Job market report page
├── css/
│   └── styles.css                      # Main stylesheet
├── js/
│   └── scripts.js                      # JavaScript (minimal)
├── chat_widget/
│   ├── chat-widget.js                  # Chat widget logic (self-contained IIFE)
│   └── chat-widget.css                 # Chat widget styles (auto-injected if missing)
├── assets/                             # Images and static files (incl. assistant.png)
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
- **Chatbot Backend:** Fly.io (`https://chatbot-personal-website.fly.dev`) — separate service

## Design System

**Colors:**
- Primary: `#4e73df` (blue)
- Secondary: `#1cc88a` (green)
- Text: `#243041` (dark), `#6c757d` (muted)

**Chat Widget Colors:**
- Primary: `#2563eb` / `#1d4ed8` (blue gradient)
- Bot bubble: `#f3f4f6` (light gray)
- User bubble: blue gradient with white text

**Font:** Plus Jakarta Sans (Google Fonts)

## Pages Overview

- **Home** - Hero section with intro and CTA
- **Resume** - Work experience, education, skills (categorized)
- **Projects** - Portfolio cards linking to live demos on Hugging Face
- **Contact** - Form with Web3Forms integration + chat widget

## Chat Widget (`chat_widget/`)

An embedded floating chat assistant that lets visitors ask questions about Mostafa.

### Architecture
- **Frontend:** Self-contained IIFE in `chat-widget.js` — no framework dependencies
- **Backend:** Separate Python service hosted on Fly.io
- **API endpoint:** `POST https://chatbot-personal-website.fly.dev/chat/stream`
- **Protocol:** Server-Sent Events (SSE) — streaming `data: {...}` JSON lines

### How It Works
1. Widget injects itself as a floating launcher button (bottom-right corner)
2. On open, builds a chat panel (header + messages body + input footer)
3. On send, POSTs `{ message, session_id }` to the backend
4. Reads the SSE stream: `{ token }` chunks are appended to the bot bubble; `{ done, session_id }` finalizes the session; `{ error }` shows error text
5. `session_id` is maintained in a JS variable for conversation continuity across messages (lost on page reload)

### UX Features
- **Nudge:** Pulse animation + hint bubble shown 1.2s after page load; dismissed for the session via `sessionStorage` key `cw_nudge_dismissed_session_v1`
- **Typing indicator:** Three-dot bouncing animation while waiting for response
- **Auto-scroll:** Scrolls to bottom on new messages
- **Minimize/Close:** Both buttons collapse the panel (same behavior); panel DOM is removed but `session_id` persists in the JS closure

### Key Constants (top of `chat-widget.js`)
| Constant | Value |
|---|---|
| `API_URL` | `https://chatbot-personal-website.fly.dev/chat/stream` |
| `ASSISTANT_NAME` | `"Assistant"` |
| `ASSISTANT_STATUS` | `"Ask me about Mostafa Abla 👋"` |
| `AVATAR_URL` | `https://mostafaabla.com/assets/assistant.png` |

### CSS Classes (all prefixed `cw-`)
- `.cw-launcher` — floating button
- `.cw-panel` — chat window
- `.cw-header`, `.cw-body`, `.cw-footer` — panel sections
- `.cw-msg`, `.cw-bubble` — message rows and text bubbles
- `.cw-user` — modifier on `.cw-msg` for user messages (right-aligned, blue)
- `.cw-typing`, `.cw-dot` — typing indicator
- `.cw-hint` — nudge bubble
- `.cw-pulse` — pulsing ring animation on launcher

### Embedding
Currently only embedded in `contact.html` (script tag at bottom of body):
```html
<script src="chat_widget/chat-widget.js"></script>
```
The widget auto-injects its CSS if the `<link>` tag is not present.

## Common Tasks

- **Edit styles:** Modify `css/styles.css`
- **Add a project:** Add card markup to `projects.html`
- **Update resume:** Edit `resume.html` and replace PDF in root
- **Change domain:** Update `CNAME` file
- **Update chatbot backend URL:** Change `API_URL` constant at top of `chat_widget/chat-widget.js`
- **Change assistant greeting/name:** Edit constants at top of `chat_widget/chat-widget.js`
- **Embed chat widget on another page:** Add `<script src="chat_widget/chat-widget.js"></script>` before `</body>`
