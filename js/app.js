// ====== Configure WhatsApp ======
const WHATSAPP_PHONE_E164 = "233552845069";
const WHATSAPP_CATALOGUE_URL = "https://wa.me/c/233552845069";

// Currency symbol and format
const CURRENCY = "GHS";
const fmtMoney = (n) => `${CURRENCY} ${Number(n).toFixed(2)}`;

// ====== Product data (edit as needed) ======
const PRODUCTS = [
  {
    id: "necklace-01",
    name: "Kente Inspired Beaded Necklace",
    description: "Bold statement necklace with traditional pattern inspiration. Lightweight and comfortable.",
    price: 180,
    images: ["assets/images/necklace-1.svg"],
    colours: [
      { name: "Emerald", hex: "#046A38" },
      { name: "Nude", hex: "#E3C4A8" },
      { name: "Gold", hex: "#C9A227" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Red", hex: "#B3261E" }
    ]
  },
  {
    id: "bracelet-01",
    name: "Classic Beaded Bracelet",
    description: "Everyday bracelet with a clean finish. Perfect for stacking.",
    price: 65,
    images: ["assets/images/bracelet-1.svg"],
    colours: [
      { name: "Nude", hex: "#E3C4A8" },
      { name: "Emerald", hex: "#046A38" },
      { name: "Teal", hex: "#0E7C7B" },
      { name: "Brown", hex: "#6B4F3B" }
    ]
  },
  {
    id: "earrings-01",
    name: "Beaded Drop Earrings",
    description: "Elegant drop earrings with vibrant beadwork. Ideal for events and gifting.",
    price: 90,
    images: ["assets/images/earrings-1.svg"],
    colours: [
      { name: "Gold", hex: "#C9A227" },
      { name: "White", hex: "#F6F6F6" },
      { name: "Black", hex: "#1A1A1A" },
      { name: "Orange", hex: "#D97706" }
    ]
  },
  {
    id: "anklet-01",
    name: "Minimal Beaded Anklet",
    description: "Delicate anklet for everyday wear. Adjustable fit.",
    price: 55,
    images: ["assets/images/anklet-1.svg"],
    colours: [
      { name: "Emerald", hex: "#046A38" },
      { name: "Nude", hex: "#E3C4A8" },
      { name: "Pink", hex: "#D946EF" },
      { name: "Blue", hex: "#2563EB" }
    ]
  },
  {
    id: "set-01",
    name: "Matching Set: Necklace + Bracelet",
    description: "Coordinated set with custom bead colour options. Great for gifting.",
    price: 230,
    images: ["assets/images/set-1.svg"],
    colours: [
      { name: "Emerald", hex: "#046A38" },
      { name: "Nude", hex: "#E3C4A8" },
      { name: "Gold", hex: "#C9A227" },
      { name: "Maroon", hex: "#7F1D1D" }
    ]
  }
];

// ====== State ======
const STORAGE_KEY = "afroBeadsCartV1";
let cart = loadCart();

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartUI();
}
function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}
function cartTotal() {
  return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
}

// ====== WhatsApp helpers ======
function waLinkWithText(text) {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${WHATSAPP_PHONE_E164}?text=${encoded}`;
}

function productInquiryText(product, selectedColours, note) {
  const colourText = selectedColours?.length ? selectedColours.join(", ") : "No preference selected";
  const noteText = note?.trim() ? `\nCustom note: ${note.trim()}` : "";
  return `Hello, I would like to enquire about:\n\n${product.name}\nPrice: ${fmtMoney(product.price)}\nPreferred bead colours: ${colourText}${noteText}\n\nPlease share availability and delivery options.`;
}

function cartCheckoutText() {
  if (!cart.length) return "Hello, I would like to place an order. My cart is empty at the moment.";
  const lines = cart.map((item, idx) => {
    const colours = item.selectedColours?.length ? item.selectedColours.join(", ") : "No preference selected";
    const note = item.note?.trim() ? ` | Note: ${item.note.trim()}` : "";
    return `${idx + 1}. ${item.name} | Qty: ${item.qty} | ${fmtMoney(item.price)} each | Colours: ${colours}${note}`;
  });

  return `Hello, I would like to place an order for the following items:\n\n${lines.join("\n")}\n\nOrder total: ${fmtMoney(cartTotal())}\n\nPlease confirm availability, delivery options, and payment details. Thank you!`;
}

// ====== DOM ======
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const checkoutWhatsAppBtn = document.getElementById("checkoutWhatsAppBtn");
const clearCartBtn = document.getElementById("clearCartBtn");

// WhatsApp links
const waCatalogueTop = document.getElementById("waCatalogueTop");
const waCatalogueHero = document.getElementById("waCatalogueHero");
const waCatalogueContact = document.getElementById("waCatalogueContact");
const waChatContact = document.getElementById("waChatContact");
const waFloating = document.getElementById("waFloating");

// Nav mobile toggle
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("navLinks");

const backToTop = document.getElementById("backToTop");
const siteHeader = document.querySelector(".site-header");
const announcementBar = document.querySelector(".announcement-bar");

let headerHeight = 0;
let announcementHeight = 0;

init();

function init() {
  syncHeaderMetrics();

  // Set year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Wire WhatsApp catalogue links
  [waCatalogueTop, waCatalogueHero, waCatalogueContact, waFloating].forEach((el) => {
    if (!el) return;
    el.href = WHATSAPP_CATALOGUE_URL;
  });

  // General WhatsApp chat link
  if (waChatContact) {
    waChatContact.href = waLinkWithText("Hello, I would like to enquire about beaded jewellery from TheBeadsBox.");
  }

  // Render products
  renderProducts(PRODUCTS);

  // Search and sort
  searchInput?.addEventListener("input", () => applyFilters());
  sortSelect?.addEventListener("change", () => applyFilters());

  // Cart drawer open close
  cartBtn?.addEventListener("click", () => openDrawer());
  cartDrawer?.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.hasAttribute("data-close-drawer")) closeDrawer();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !cartDrawer.hasAttribute("hidden")) closeDrawer();
  });

  clearCartBtn?.addEventListener("click", () => {
    cart = [];
    saveCart();
  });

  checkoutWhatsAppBtn?.addEventListener("click", () => {
    checkoutWhatsAppBtn.href = waLinkWithText(cartCheckoutText());
  });

  // Contact form sends via WhatsApp
  const contactForm = document.getElementById("contactForm");
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(contactForm);
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();
    const message = (fd.get("message") || "").toString().trim();

    // Clear any previous error
    const prevErr = contactForm.querySelector(".form-error");
    if (prevErr) prevErr.remove();

    if (!name || !message) {
      const err = document.createElement("p");
      err.className = "form-error";
      err.textContent = "Please fill in your name and message before sending.";
      contactForm.insertBefore(err, contactForm.querySelector("[type=submit]"));
      return;
    }

    const text = `Hello, my name is ${name}.${email ? ` Email: ${email}.` : ""}\n\n${message}`;
    window.open(waLinkWithText(text), "_blank", "noopener,noreferrer");
    contactForm.reset();
    const submitBtn = contactForm.querySelector("[type=submit]");
    submitBtn.textContent = "✓ Sent — we'll reply on WhatsApp";
    submitBtn.disabled = true;
    setTimeout(() => {
      submitBtn.textContent = "Send via WhatsApp";
      submitBtn.disabled = false;
    }, 3000);
  });

  // Mobile nav toggle
  navToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close mobile nav when clicking a link
  navLinks?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  updateCartUI();

  // Scroll spy — highlight active nav link as user scrolls
  const spySections = Array.from(document.querySelectorAll("main section[id]"));
  const spyLinks = document.querySelectorAll(".nav-link");

  function updateActiveNav() {
    if (!spySections.length) return;

    const header = document.querySelector(".site-header");
    const offset = (header?.getBoundingClientRect().height || 0) + 12;
    const viewportTop = offset;
    const viewportBottom = window.innerHeight;

    let bestSection = spySections[0];
    let bestScore = -1;

    for (const section of spySections) {
      const rect = section.getBoundingClientRect();
      const top = Math.max(rect.top, viewportTop);
      const bottom = Math.min(rect.bottom, viewportBottom);
      const visible = Math.max(0, bottom - top);
      const score = visible / Math.max(1, rect.height);
      if (score > bestScore) {
        bestScore = score;
        bestSection = section;
      }
    }

    // Ensure the last section becomes active when the user hits the bottom.
    const doc = document.documentElement;
    const atBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
    if (atBottom) bestSection = spySections[spySections.length - 1];

    const current = bestSection?.id || "";
    spyLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  }

  // Set active immediately on click — smooth scroll may end just before
  // the section crosses the threshold, so click is the reliable trigger.
  spyLinks.forEach((link) => {
    link.addEventListener("click", () => {
      spyLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // rAF throttle for scroll handler (scroll spy + back-to-top)
  let scrollTicking = false;
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateActiveNav();
      if (backToTop) backToTop.hidden = window.scrollY < 400;
      if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 10);
      updateHeaderShift();
      scrollTicking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  // Re-run once scroll fully settles (catches smooth-scroll end edge case)
  window.addEventListener("scrollend", updateActiveNav, { passive: true });
  updateActiveNav(); // set correct state on initial load

  // Back-to-top button
  if (backToTop) backToTop.hidden = window.scrollY < 400;
  if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 10);
  updateHeaderShift();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  window.addEventListener("resize", () => {
    syncHeaderMetrics();
    updateHeaderShift();
    updateActiveNav();
  }, { passive: true });
}

function syncHeaderMetrics() {
  if (!siteHeader) return;
  headerHeight = Math.round(siteHeader.getBoundingClientRect().height);
  announcementHeight = Math.round(announcementBar?.getBoundingClientRect().height || 0);
  document.documentElement.style.setProperty("--header-h", `${headerHeight}px`);
  document.documentElement.style.setProperty("--announce-h", `${announcementHeight}px`);
}

function updateHeaderShift() {
  if (!siteHeader) return;
  const shift = Math.max(0, announcementHeight - window.scrollY);
  document.documentElement.style.setProperty("--header-shift", `${shift}px`);
}

function applyFilters() {
  const q = (searchInput?.value || "").toLowerCase().trim();
  let list = PRODUCTS.filter((p) => {
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  const sort = sortSelect?.value || "featured";
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  renderProducts(list);
}

function renderProducts(products) {
  if (!productGrid) return;
  productGrid.innerHTML = "";

  if (!products.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <p>No products match your search.</p>
      <button class="btn btn-secondary" type="button">Clear search</button>
    `;
    empty.querySelector("button").addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      applyFilters();
    });
    productGrid.appendChild(empty);
    return;
  }

  products.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imgSrc = p.images?.[0] || "";
    const defaultSelected = [p.colours?.[0]?.name].filter(Boolean);

    card.innerHTML = `
      <div class="product-media">
        <img
          src="${imgSrc}"
          alt="${escapeHtml(p.name)}"
          width="900"
          height="675"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div class="product-body">
        <h3 class="product-title">${escapeHtml(p.name)}</h3>
        <p class="product-desc">${escapeHtml(p.description)}</p>

        <div class="product-row">
          <div class="price">${fmtMoney(p.price)}</div>
          <a class="btn btn-secondary" data-inquire="${p.id}" href="#" target="_blank" rel="noopener">
            Enquire
          </a>
        </div>

        <div>
          <p class="swatch-label">Choose bead colour preference</p>
          <div class="swatches" data-swatches="${p.id}"></div>
        </div>

        <div class="option-note">
          <input data-note="${p.id}" type="text" placeholder="Optional note, for example add white accents" />
        </div>

        <button class="btn btn-primary" type="button" data-add="${p.id}">
          Add to cart
        </button>
      </div>
    `;

    productGrid.appendChild(card);

    // Build swatches
    const swatchesEl = card.querySelector(`[data-swatches="${p.id}"]`);
    const selected = new Set(defaultSelected);

    p.colours.forEach((c) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.style.background = c.hex;
      btn.setAttribute("aria-label", c.name);
      btn.setAttribute("title", c.name);
      btn.setAttribute("aria-pressed", selected.has(c.name) ? "true" : "false");

      btn.addEventListener("click", () => {
        // Multi select: toggle
        if (selected.has(c.name)) selected.delete(c.name);
        else selected.add(c.name);
        btn.setAttribute("aria-pressed", selected.has(c.name) ? "true" : "false");
      });

      swatchesEl.appendChild(btn);
    });

    // Enquire link opens WhatsApp with selected colours and note
    const enquireLink = card.querySelector(`[data-inquire="${p.id}"]`);
    enquireLink.addEventListener("click", (e) => {
      e.preventDefault();
      const note = card.querySelector(`[data-note="${p.id}"]`)?.value || "";
      const text = productInquiryText(p, Array.from(selected), note);
      enquireLink.href = waLinkWithText(text);
      window.open(enquireLink.href, "_blank", "noopener,noreferrer");
    });

    // Add to cart button
    const addBtn = card.querySelector(`[data-add="${p.id}"]`);
    addBtn.addEventListener("click", () => {
      const note = card.querySelector(`[data-note="${p.id}"]`)?.value || "";
      addToCart(p, Array.from(selected), note);
      addBtn.textContent = "✓ Added";
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = "Add to cart";
        addBtn.disabled = false;
      }, 1400);
    });
  });

  // Re-observe cards for staggered animation
  if (typeof observeProductCards === "function") observeProductCards();
}

function addToCart(product, selectedColours, note) {
  const existing = cart.find((x) => x.id === product.id && sameSelection(x.selectedColours, selectedColours) && (x.note || "") === (note || ""));
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || "",
      selectedColours: selectedColours || [],
      note: (note || "").trim(),
      qty: 1
    });
  }
  saveCart();
  openDrawer();
}

function sameSelection(a = [], b = []) {
  if (a.length !== b.length) return false;
  const A = [...a].sort().join("|");
  const B = [...b].sort().join("|");
  return A === B;
}

function updateCartUI() {
  if (cartCountEl) {
    const prevCount = Number(cartCountEl.textContent) || 0;
    const newCount = cartCount();
    cartCountEl.textContent = String(newCount);
    cartCountEl.style.display = newCount === 0 ? "none" : "";
    if (newCount > prevCount && newCount > 0) {
      cartCountEl.classList.remove("pop");
      void cartCountEl.offsetWidth; // force reflow so animation restarts
      cartCountEl.classList.add("pop");
      cartCountEl.addEventListener("animationend", () => cartCountEl.classList.remove("pop"), { once: true });
    }
  }
  if (cartTotalEl) cartTotalEl.textContent = fmtMoney(cartTotal());

  if (!cartItemsEl) return;

  if (!cart.length) {
    cartItemsEl.innerHTML = `<p class="muted">Your cart is empty. Add items from the products section.</p>`;
    return;
  }

  cartItemsEl.innerHTML = "";
  cart.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = "cart-item";
    const colours = item.selectedColours?.length ? item.selectedColours.join(", ") : "No preference selected";
    const note = item.note ? item.note : "";

    el.innerHTML = `
      <img src="${item.image}" alt="${escapeHtml(item.name)}" width="140" height="140" loading="lazy" decoding="async" />
      <div>
        <h4>${escapeHtml(item.name)}</h4>
        <div class="meta">Colours: ${escapeHtml(colours)}${note ? ` | Note: ${escapeHtml(note)}` : ""}</div>
        <div class="row">
          <strong>${fmtMoney(item.price)}</strong>
          <div class="qty" aria-label="Quantity controls">
            <button type="button" aria-label="Decrease quantity" data-dec="${idx}">-</button>
            <span aria-label="Quantity">${item.qty}</span>
            <button type="button" aria-label="Increase quantity" data-inc="${idx}">+</button>
            <button type="button" aria-label="Remove item" data-rm="${idx}">Remove</button>
          </div>
        </div>
      </div>
    `;

    cartItemsEl.appendChild(el);
  });

  // Wire quantity buttons
  cartItemsEl.querySelectorAll("[data-inc]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-inc"));
      cart[i].qty += 1;
      saveCart();
    });
  });
  cartItemsEl.querySelectorAll("[data-dec]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-dec"));
      cart[i].qty -= 1;
      if (cart[i].qty <= 0) cart.splice(i, 1);
      saveCart();
    });
  });
  cartItemsEl.querySelectorAll("[data-rm]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-rm"));
      cart.splice(i, 1);
      saveCart();
    });
  });

  // Update checkout link each time cart changes
  if (checkoutWhatsAppBtn) checkoutWhatsAppBtn.href = waLinkWithText(cartCheckoutText());
}

function focusTrapHandler(e) {
  if (e.key !== "Tab") return;
  const panel = cartDrawer.querySelector(".drawer-panel");
  const focusable = Array.from(
    panel.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((el) => el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

function openDrawer() {
  if (!cartDrawer) return;
  cartDrawer.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
  if (checkoutWhatsAppBtn) checkoutWhatsAppBtn.href = waLinkWithText(cartCheckoutText());
  // Move focus to close button and trap Tab inside drawer
  const closeBtn = cartDrawer.querySelector("[data-close-drawer]");
  if (closeBtn) closeBtn.focus();
  cartDrawer.addEventListener("keydown", focusTrapHandler);
}

function closeDrawer() {
  if (!cartDrawer || cartDrawer.classList.contains("closing")) return;
  cartDrawer.removeEventListener("keydown", focusTrapHandler);
  cartDrawer.classList.add("closing");
  const panel = cartDrawer.querySelector(".drawer-panel");
  panel.addEventListener("animationend", () => {
    cartDrawer.classList.remove("closing");
    cartDrawer.setAttribute("hidden", "");
    document.body.style.overflow = "";
    cartBtn?.focus();
  }, { once: true });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ====== Scroll-triggered reveal animations ======
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Staggered product card reveals
function observeProductCards() {
  const cards = document.querySelectorAll(".product-card:not(.visible)");
  const cardObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting);
      visible.forEach((entry, i) => {
        setTimeout(() => {
          entry.target.classList.add("visible");
          cardObserver.unobserve(entry.target);
        }, i * 80);
      });
    },
    { threshold: 0.1 }
  );
  cards.forEach((card) => cardObserver.observe(card));
}
observeProductCards();
