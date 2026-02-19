const pathName = window.location.pathname.replace(/\/+$/, "") || "/";

const routes = {
  "/": {
    title: "Varta AI | WhatsApp Business CRM",
    canonical: "https://pictoolz.com/",
    content: `
      <section class="hero container">
        <h1>WhatsApp CRM built for speed, scale, and support</h1>
        <p>Varta AI helps businesses manage leads, campaigns, and support on WhatsApp with one simple platform.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/contact">Book a Demo</a>
          <a class="btn" href="/pricing">See Pricing</a>
        </div>
      </section>

      <section class="section container">
        <h2>Why teams choose Varta AI</h2>
        <p>Launch faster, reply quicker, and keep every conversation organized.</p>
        <div class="grid">
          <article class="card">
            <h3>Shared Inbox</h3>
            <p>Sales and support teams work from one WhatsApp inbox.</p>
          </article>
          <article class="card">
            <h3>Campaign Broadcasts</h3>
            <p>Run targeted messaging campaigns with audience filters.</p>
          </article>
          <article class="card">
            <h3>Automation</h3>
            <p>Auto replies, lead routing, reminders, and follow-up flows.</p>
          </article>
          <article class="card">
            <h3>Analytics</h3>
            <p>Track replies, conversion, and team response performance.</p>
          </article>
        </div>
      </section>
    `,
  },
  "/platform": {
    title: "Platform | Varta AI",
    canonical: "https://pictoolz.com/platform",
    content: `
      <section class="page-block container">
        <h1>Platform</h1>
        <p>Varta AI gives your team everything needed to run WhatsApp communication from one place.</p>
        <ul>
          <li>Team inbox with role based access</li>
          <li>Campaign manager and message templates</li>
          <li>Automation builder and webhook integrations</li>
          <li>Performance and conversation analytics</li>
        </ul>
        <a class="btn btn-primary" href="/contact">Talk to our team</a>
      </section>
    `,
  },
  "/pricing": {
    title: "Pricing | Varta AI",
    canonical: "https://pictoolz.com/pricing",
    content: `
      <section class="page-block container">
        <h1>Pricing</h1>
        <p>Flexible plans for startups, growing teams, and enterprises.</p>
        <div class="grid">
          <article class="card">
            <h3>Starter</h3>
            <p>For early teams launching WhatsApp support.</p>
          </article>
          <article class="card">
            <h3>Growth</h3>
            <p>For companies running campaigns and automation.</p>
          </article>
          <article class="card">
            <h3>Enterprise</h3>
            <p>For high volume businesses needing custom workflows.</p>
          </article>
        </div>
        <div class="hero-actions">
          <a class="btn btn-primary" href="/contact">Get exact quote</a>
        </div>
      </section>
    `,
  },
  "/privacy": {
    title: "Privacy Policy | Varta AI",
    canonical: "https://pictoolz.com/privacy",
    content: `
      <section class="page-block container">
        <h1>Privacy Policy</h1>
        <p>We collect only data required to deliver service features and support customer communication workflows.</p>
        <p>Varta AI uses WhatsApp Cloud API for business messaging and customer management. We are requesting and maintaining WhatsApp Cloud API approval strictly for legitimate business communication use cases.</p>
        <ul>
          <li>API usage purpose: customer support, notifications, lead follow-up, and business operations management</li>
          <li>We process only business-authorized and consented customer data</li>
          <li>Message templates and campaigns are reviewed for policy compliance before sending</li>
          <li>Account details for onboarding and support</li>
          <li>Conversation metadata for product performance</li>
          <li>No sale of customer data to third parties</li>
        </ul>
        <p>If required during review, we can provide additional compliance details about consent collection, retention, and security controls.</p>
      </section>
    `,
  },
  "/terms": {
    title: "Terms of Service | Varta AI",
    canonical: "https://pictoolz.com/terms",
    content: `
      <section class="page-block container">
        <h1>Terms of Service</h1>
        <p>By using Varta AI, you agree to our usage and compliance terms.</p>
        <ul>
          <li>Users must comply with WhatsApp policy and local laws</li>
          <li>Accounts can be restricted for misuse or spam behavior</li>
          <li>Service access depends on subscription and fair usage</li>
        </ul>
        <h2>WhatsApp Cloud API Compliance Statement</h2>
        <p>Varta AI uses the WhatsApp Cloud API only for approved business messaging and customer relationship management workflows.</p>
        <ul>
          <li>We require lawful business use and valid customer consent before messaging</li>
          <li>We prohibit spam, unsolicited campaigns, and misleading message content</li>
          <li>We provide controls for opt-out handling, usage monitoring, and policy enforcement</li>
        </ul>
      </section>
    `,
  },
  "/contact": {
    title: "Contact | Varta AI",
    canonical: "https://pictoolz.com/contact",
    content: `
      <section class="page-block container">
        <h1>Contact Varta AI</h1>
        <p>Tell us your use case and team size. We will share the best setup for your business.</p>
        <ul>
          <li>Email: suresh30399@gmail.com</li>
          <li>Response: within 1 business day</li>
          <li>Support for setup, migration, and campaign strategy</li>
        </ul>
        <a class="btn btn-primary" href="/">Back to Home</a>
      </section>
    `,
  },
};

const current = routes[pathName] || {
  title: "Page Not Found | Varta AI",
  canonical: "https://pictoolz.com/",
  content: `
    <section class="page-block container">
      <h1>Page not found</h1>
      <p>The page you are trying to open does not exist.</p>
      <a class="btn btn-primary" href="/">Go to Home</a>
    </section>
  `,
};

document.title = current.title;

const canonical = document.querySelector("link[rel='canonical']");
if (canonical) canonical.href = current.canonical;

const nav = `
  <header class="site-header">
    <div class="container nav">
      <a class="logo" href="/">Varta AI</a>
      <nav class="links">
        <a class="${pathName === "/" ? "active" : ""}" href="/">Home</a>
        <a class="${pathName === "/platform" ? "active" : ""}" href="/platform">Platform</a>
        <a class="${pathName === "/pricing" ? "active" : ""}" href="/pricing">Pricing</a>
        <a class="${pathName === "/privacy" ? "active" : ""}" href="/privacy">Privacy</a>
        <a class="${pathName === "/terms" ? "active" : ""}" href="/terms">Terms</a>
        <a class="${pathName === "/contact" ? "active" : ""}" href="/contact">Contact</a>
      </nav>
      <a class="btn btn-primary" href="/contact">Request Demo</a>
    </div>
  </header>
`;

const footer = `
  <footer class="site-footer">
    <div class="container">
      <p>© 2026 Varta AI. All rights reserved.</p>
    </div>
  </footer>
`;

document.getElementById("app").innerHTML = nav + current.content + footer;
