// JS: progress bar, nav indicator, populate & animate tools/expertise tracks, copy-to-clipboard
document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('progress-bar');
  const navList = document.getElementById('nav-list');
  const navLinks = Array.from(navList.querySelectorAll('a'));
  const navIndicator = document.getElementById('nav-indicator');
  const sections = Array.from(document.querySelectorAll('main section'));
  const cards = Array.from(document.querySelectorAll('.card'));
  const toolsTrack = document.getElementById('tools-track');
  const expertiseTrack = document.getElementById('expertise-track');
  const copyTooltip = document.getElementById('copy-tooltip');

  // ===== Progress bar =====
  function updateProgress() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const pct = Math.max(0, Math.min(100, (scrolled / docH) * 100));
    if (progressBar) progressBar.style.width = pct + '%';
  }

  // ===== Move yellow nav indicator =====
  function moveIndicatorTo(anchor) {
    if (!anchor) return;
    const aRect = anchor.getBoundingClientRect();
    const parentRect = navList.getBoundingClientRect();
    navIndicator.style.left = (aRect.left - parentRect.left) + 'px';
    navIndicator.style.width = aRect.width + 'px';
  }

  // ===== Highlight section robustly: choose section whose top is closest to a topOffset =====
  function highlightSectionOnScroll() {
    if (!sections || sections.length === 0) return;

    // Choose topOffset dynamically based on viewport height for better responsiveness
    const topOffset = Math.round(window.innerHeight * 0.15); // ~15% down from top

    let closest = sections[0];
    let minDistance = Infinity;

    for (let sec of sections) {
      const rect = sec.getBoundingClientRect();
      const distance = Math.abs(rect.top - topOffset);
      if (distance < minDistance) {
        minDistance = distance;
        closest = sec;
      }
    }

    // If for some reason closest is undefined, fallback to first section
    const id = (closest && closest.id) ? closest.id : sections[0].id;
    const active = navLinks.find(a => a.getAttribute('href') === `#${id}`);
    navLinks.forEach(a => a.classList.remove('active'));
    if (active) {
      active.classList.add('active');
      moveIndicatorTo(active);
    }
  }

  // ===== Throttle scroll updates with requestAnimationFrame =====
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        highlightSectionOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll);

  // also run once to set initial progress & highlight
  updateProgress();
  highlightSectionOnScroll();

  // ===== Nav click: immediate indicator move + smooth scroll =====
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').replace('#', '');
      const targetEl = document.getElementById(targetId);
      // immediate visual feedback: move indicator to clicked link
      moveIndicatorTo(link);
      // then smooth scroll
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ===== Initialize indicator after layout =====
  function initIndicator() {
    const active = navLinks.find(a => a.classList.contains('active')) || navLinks[0];
    moveIndicatorTo(active);
  }
  window.addEventListener('load', () => {
    initIndicator();
    highlightSectionOnScroll();
    updateProgress();
  });
  window.addEventListener('resize', () => {
    initIndicator();
    highlightSectionOnScroll();
    updateProgress();
  });
  // small delay for fonts/layout
  setTimeout(() => {
    initIndicator();
    highlightSectionOnScroll();
    updateProgress();
  }, 240);

  // ===== Tools & Expertise lists =====
  const toolsList = [
    "Zoho CRM", "Salesforce CRM", "Power BI", "Apollo.io", "LinkedIn Sales Navigator",
    "MS Excel", "Freshdesk", "Notion", "Mailchimp", "Outreach.io",
    "Freshsales", "Canva", "MS Office", "Zoho Campaign", "Google Spreadsheet"
  ];

  const expertiseList = [
    "Sales Data Analysis", "Sales Prospecting", "Pipeline Management", "Account Management",
    "Cross selling", "Strategy Development", "Negotiation", "Partnership Development",
    "Consultative Sales", "Customer Needs Mapping", "SaaS Solution Selling", "Relationship Building",
    "CRM Management", "Territory Planning", "Up-sell", "Prospect Research", "Lead Generation", "BANT", "MEDDIC",
    "Cold Calling", "Sales Channel Development", "Discovery Calls", "Product Mappping", "B2B SaaS Sales"
  ];

  // Populate track with two copies for seamless scroll
  function populateTrack(trackEl, items, isExpertise = false) {
    if (!trackEl) return;
    const frag = document.createDocumentFragment();
    items.forEach(text => {
      const sp = document.createElement('span');
      sp.textContent = text;
      // add class for styling if needed
      if (isExpertise) sp.classList.add('expertise-pill');
      frag.appendChild(sp);
    });
    trackEl.innerHTML = '';
    trackEl.appendChild(frag.cloneNode(true));
    trackEl.appendChild(frag.cloneNode(true));
    setTrackDuration(trackEl);
    // pause on hover
    trackEl.addEventListener('pointerenter', () => { trackEl.style.animationPlayState = 'paused'; });
    trackEl.addEventListener('pointerleave', () => { trackEl.style.animationPlayState = 'running'; });
  }

  function setTrackDuration(trackEl) {
    if (!trackEl) return;
    requestAnimationFrame(() => {
      const halfWidth = trackEl.scrollWidth / 2 || 800;
      const speed = 80; // px per second
      const duration = Math.max(8, Math.round(halfWidth / speed));
      trackEl.style.animation = `slide-left ${duration}s linear infinite`;
    });
  }

  populateTrack(toolsTrack, toolsList, false);
  populateTrack(expertiseTrack, expertiseList, true);

  // ===== Recompute durations on resize =====
  let resizeTO;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTO);
    resizeTO = setTimeout(() => {
      setTrackDuration(toolsTrack);
      setTrackDuration(expertiseTrack);
      initIndicator();
      highlightSectionOnScroll();
      updateProgress();
    }, 220);
  });

  // ===== Click-to-copy for contact info with tooltip =====
  document.querySelectorAll('.copy-text').forEach(el => {
    el.addEventListener('click', (e) => {
      const text = el.dataset.copy;
      if (!text) return;
      // use Clipboard API
      navigator.clipboard.writeText(text).then(() => {
        if (!copyTooltip) return;
        // position tooltip near click
        const pageX = e.pageX;
        const pageY = e.pageY;
        copyTooltip.style.left = pageX + 'px';
        copyTooltip.style.top = (pageY - 24) + 'px';
        copyTooltip.style.opacity = '1';
        copyTooltip.style.transform = 'translate(-50%,-140%) scale(1)';
        // hide after short delay
        setTimeout(() => {
          copyTooltip.style.opacity = '0';
          copyTooltip.style.transform = 'translate(-50%,-140%) scale(0.98)';
        }, 900);
      }).catch(() => {
        // fallback: briefly show tooltip anyway
        if (!copyTooltip) return;
        copyTooltip.style.left = (e.pageX) + 'px';
        copyTooltip.style.top = (e.pageY - 24) + 'px';
        copyTooltip.style.opacity = '1';
        setTimeout(() => { copyTooltip.style.opacity = '0'; }, 900);
      });
    });
  });
// ===== Project Card Modal (Outbound for LambdaTest) =====
  const modal = document.getElementById('project-modal');
  const iframe = document.getElementById('modal-iframe');

  const outboundCard = Array.from(document.querySelectorAll('.project-card'))
    .find(card => card.textContent.trim() === "Outbound for LambdaTest");

  if (outboundCard) {
    outboundCard.addEventListener('click', () => {
      iframe.src = "Outbound for LambdaTeast 1cb30015a4b3802a8ad1eecc5618d1d1.html";
      modal.style.display = 'flex';
    });
  }

  // Close modal when clicking outside the card
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      iframe.src = ""; // Clear iframe for performance
    }
  });
  
});
