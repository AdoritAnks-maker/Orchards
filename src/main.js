const products = [
  { id: 'royal', name: 'Royal Delicious', note: 'Sweet, fragrant & deep red', price: 220, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=900&q=85' },
  { id: 'golden', name: 'Golden Delicious', note: 'Crisp with gentle honey notes', price: 210, image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=900&q=85' },
  { id: 'kashmiri', name: 'Kashmiri Red', note: 'Juicy, tart & mountain-grown', price: 250, image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=900&q=85' }
];

let cart = JSON.parse(localStorage.getItem('orchard-cart') || '[]');
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const cartCount = () => cart.reduce((total, item) => total + item.quantity, 0);
const saveCart = () => localStorage.setItem('orchard-cart', JSON.stringify(cart));

function shell() {
  document.querySelector('#root').innerHTML = `
    <header class="site-header">
      <a class="brand" href="#top" aria-label="Bhardwaj Orchards home"><span>✦</span> Bhardwaj's <em>Orchards</em></a>
      <nav aria-label="Primary navigation"><a href="#apples">Shop apples</a><a href="#experience">Farm tours</a><a href="#story">Our story</a><a href="#contact">Contact</a></nav>
      <button class="basket" id="open-cart" aria-label="Open basket">⌑ Basket <b id="cart-count">${cartCount()}</b></button>
    </header>
    <main id="top">
      <section class="hero">
        <div class="hero-copy"><p class="eyebrow">⌁ Grown high in the hills</p><h1>Good apples.<br><em>Good days.</em></h1><p class="lead">Hand-picked fruit and unhurried farm moments from our family orchard in the Himalayas.</p><div class="actions"><a href="#apples" class="button">Explore the harvest <span>→</span></a><a class="text-link" href="#experience">Plan a farm visit →</a></div></div>
        <div class="hero-image"><img src="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=1400&q=90" alt="Fresh red apple growing on an orchard tree"/><div class="image-label"><b>01</b><span>From our trees<br>to your table</span></div></div>
      </section>
      <section class="harvest" id="apples"><div class="section-title"><p class="eyebrow">This season's pick</p><h2>Fresh from the orchard</h2><p>Thoughtfully packed, naturally delicious apples delivered with care.</p></div><div class="product-grid">${products.map(productCard).join('')}</div></section>
      <section class="story" id="story"><div class="story-photo"><img src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1100&q=85" alt="Apple trees in a sunny orchard"/></div><div class="story-copy"><p class="eyebrow">Our promise</p><h2>Rooted in good growing.</h2><p>We believe apples taste better when they are given time. Our orchard is cared for season by season, with respect for the soil, the hills, and every person who enjoys its fruit.</p><ul><li>Hand-selected at peak ripeness</li><li>Carefully packed for freshness</li><li>Direct from grower to your doorstep</li></ul><a href="#contact" class="text-link">Talk to the orchard →</a></div></section>
      <section class="experience" id="experience"><div><p class="eyebrow">See the orchard</p><h2>A little closer to the harvest.</h2><p>Walk the rows, hear the leaves, and experience where your fruit begins.</p><a href="#contact" class="button light">Book a farm visit <span>→</span></a></div><div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/Mydli1F0Rdc?rel=0" title="Apple harvest at an orchard" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></section>
      <section class="contact" id="contact"><div class="contact-copy"><p class="eyebrow">Let's talk apples</p><h2>We would love to hear from you.</h2><p>For orders, farm visits, wholesale, or a simple question—send us a message and Ankush will get back to you.</p><a href="mailto:srinivasnankushbahrdwaj@gmail.com">srinivasnankushbahrdwaj@gmail.com</a><a href="tel:+918278867579">+91 82788 67579</a><p class="owner">Ankush Bhardwaj<br><span>Bhardwaj Orchards</span></p></div><form id="contact-form" novalidate><label>Name<input name="name" required minlength="2" autocomplete="name" placeholder="Your name"/></label><label>Email<input name="email" required type="email" autocomplete="email" placeholder="you@example.com"/></label><label>Phone number<input name="phone" required type="tel" autocomplete="tel" placeholder="Your phone number"/></label><label>I'm interested in<select name="interest"><option>Buying apples</option><option>Farm visit</option><option>Wholesale order</option><option>General enquiry</option></select></label><label class="wide">Message<textarea name="message" required minlength="10" placeholder="How can we help?"></textarea></label><button class="button wide" type="submit">Send message <span>→</span></button><p class="form-note" id="form-note" aria-live="polite"></p></form></section>
    </main>
    <footer><span>© ${new Date().getFullYear()} Bhardwaj Orchards</span><span>Grown with care in the Himalayas</span><a href="#top">Back to top ↑</a></footer>
    <aside class="cart-panel" id="cart-panel" aria-hidden="true"><div class="cart-head"><h2>Your basket</h2><button id="close-cart" aria-label="Close basket">×</button></div><div id="cart-items"></div><div class="cart-total"><span>Total</span><strong id="cart-total">${money(0)}</strong></div><a class="button checkout" href="#contact" id="checkout">Order by enquiry <span>→</span></a></aside><div class="overlay" id="overlay"></div>`;
  bind(); renderCart();
}
function productCard(product) { return `<article class="product"><img src="${product.image}" alt="${product.name} apples" loading="lazy"/><div><p>${product.note}</p><h3>${product.name}</h3><div class="product-bottom"><strong>${money(product.price)} <small>/ kg</small></strong><button class="add" data-id="${product.id}">Add +</button></div></div></article>`; }
function bind() {
  document.querySelectorAll('.add').forEach((button) => button.addEventListener('click', () => add(button.dataset.id)));
  document.querySelector('#open-cart').addEventListener('click', openCart);
  document.querySelector('#close-cart').addEventListener('click', closeCart);
  document.querySelector('#overlay').addEventListener('click', closeCart);
  document.querySelector('#checkout').addEventListener('click', closeCart);
  document.querySelector('#contact-form').addEventListener('submit', sendContact);
}
function add(id) { const found = cart.find((item) => item.id === id); if (found) found.quantity += 1; else cart.push({ id, quantity: 1 }); saveCart(); renderCart(); openCart(); }
function remove(id) { cart = cart.filter((item) => item.id !== id); saveCart(); renderCart(); }
function renderCart() { document.querySelector('#cart-count').textContent = cartCount(); const host = document.querySelector('#cart-items'); host.innerHTML = cart.length ? cart.map((item) => { const p = products.find((product) => product.id === item.id); return `<div class="cart-item"><img src="${p.image}" alt=""/><div><b>${p.name}</b><span>${item.quantity} kg · ${money(p.price * item.quantity)}</span></div><button class="remove" data-id="${item.id}" aria-label="Remove ${p.name}">×</button></div>`; }).join('') : '<p class="empty">Your basket is waiting for something delicious.</p>'; document.querySelector('#cart-total').textContent = money(cart.reduce((total, item) => total + products.find((p) => p.id === item.id).price * item.quantity, 0)); document.querySelectorAll('.remove').forEach((button) => button.addEventListener('click', () => remove(button.dataset.id))); }
function openCart() { document.querySelector('#cart-panel').classList.add('visible'); document.querySelector('#overlay').classList.add('visible'); document.querySelector('#cart-panel').setAttribute('aria-hidden', 'false'); }
function closeCart() { document.querySelector('#cart-panel').classList.remove('visible'); document.querySelector('#overlay').classList.remove('visible'); document.querySelector('#cart-panel').setAttribute('aria-hidden', 'true'); }
async function sendContact(event) { event.preventDefault(); const form = event.currentTarget; const note = document.querySelector('#form-note'); const button = form.querySelector('[type="submit"]'); if (!form.checkValidity()) { form.reportValidity(); return; } button.disabled = true; button.textContent = 'Sending…'; note.textContent = ''; try { const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) }); const result = await response.json(); if (!response.ok) throw new Error(result.error); note.textContent = result.message; note.className = 'form-note success'; form.reset(); } catch (error) { note.textContent = error.message || 'Something went wrong. Please call us instead.'; note.className = 'form-note error'; } finally { button.disabled = false; button.innerHTML = 'Send message <span>→</span>'; } }
shell();
