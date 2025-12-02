/* ===== Dock Active on Scroll ===== */
const sections = document.querySelectorAll("section[id]");
const dockLinks = document.querySelectorAll(".dock a");
function setActiveOnScroll() {
  let current = "home";
  const y = window.scrollY + window.innerHeight*0.25;
  sections.forEach(sec=>{
    const top = sec.offsetTop;
    const bottom = top + sec.offsetHeight;
    if(y>=top && y<bottom) current = sec.id;
  });
  dockLinks.forEach(a=>{
    a.classList.toggle("active", a.getAttribute("href")==`#${current}`);
  });
}
setActiveOnScroll();
window.addEventListener("scroll",setActiveOnScroll);
window.addEventListener("resize",setActiveOnScroll);

/* ===== Smooth Transition per Dock ===== */
const transition = document.querySelector(".page-transition");
document.querySelectorAll(".dock a").forEach(link=>{
  link.addEventListener("click", e=>{
    e.preventDefault();
    const target = link.getAttribute("href");
    transition.classList.add("active");
    setTimeout(()=>{
      document.querySelector(target).scrollIntoView({ behavior:"smooth" });
      setTimeout(()=>transition.classList.remove("active"), 550);
    }, 220);
  });
});

/* ===== Re-trigger Home Anim (termasuk summary) ===== */
const home = document.getElementById("home");
const heroName = document.querySelector(".hero-name");
const roleBox  = document.querySelector(".role-box");
const summaryBox = document.querySelector(".text-single");
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      if(heroName){ heroName.classList.remove("animate"); void heroName.offsetWidth; heroName.classList.add("animate"); }
      if(roleBox){ roleBox.classList.remove("animate"); void roleBox.offsetWidth; roleBox.classList.add("animate"); }
      if(summaryBox){ summaryBox.classList.remove("animate"); void summaryBox.offsetWidth; summaryBox.classList.add("animate"); }
    }
  });
},{ threshold:0.6 });
if(home) observer.observe(home);

/* ===== Mode Toggle (Dark/Light) ===== */
(function(){
  const root = document.body;
  const btn  = document.getElementById("modeToggle");
  const label= btn?.querySelector(".toggle-label");
  if(!btn) return;

  const KEY="pref-theme";
  function apply(t){
    root.classList.toggle("dark", t==="dark");
    localStorage.setItem(KEY, t);
    if(label){
      if(window.__i18n__){
        const key = t==="dark" ? "toggle.light" : "toggle.dark";
        const txt = i18nResolve(window.__i18n__, key);
        if(typeof txt==="string") label.textContent = txt;
        else label.textContent = (t==="dark" ? "LIGHT MODE" : "DARK MODE");
      }else{
        label.textContent = (t==="dark" ? "LIGHT MODE" : "DARK MODE"); /* PATCH: fallback label */
      }
    }
  }
  function get(){ return localStorage.getItem(KEY) || "light"; }
  apply(get());
  btn.addEventListener("click", ()=>{
    const next = root.classList.contains("dark") ? "light" : "dark";
    apply(next);
  });
})();

/* ===== Helper i18n resolve ===== */
function i18nResolve(obj, path){
  try{
    return path.split(".").reduce((acc,k)=>{
      if(!acc || typeof acc!=="object") return undefined;
      if(k in acc) return acc[k];
      const kk = Object.keys(acc).find(x=>x.toLowerCase()===k.toLowerCase());
      return kk ? acc[kk] : undefined;
    }, obj);
  }catch{ return undefined; }
}

/* ===== Language & i18n ===== */
async function fetchLang(lang="id"){
  try{
    const res = await fetch("lang.json");
    if(!res.ok) throw new Error("Failed to load lang.json");
    const data = await res.json();
    return (data && (data[lang] || data["id"])) || {};
  }catch(err){
    console.error("Failed to load language file:", err);
    return {};
  }
}
function applyLanguage(obj){
  window.__i18n__ = obj;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.dataset.i18n;
    const val = i18nResolve(obj, key);
    if(typeof val==="string") el.textContent = val;
  });
  const roles = obj.roles || [];
  if(roles.length) window.__ROLES__ = roles;

  const btn = document.getElementById("modeToggle");
  const label = btn?.querySelector(".toggle-label");
  if(label){
    const isDark = document.body.classList.contains("dark");
    const key = isDark ? "toggle.light" : "toggle.dark";
    const txt = i18nResolve(obj, key);
    if(typeof txt==="string") label.textContent = txt;
  }
}
(function(){
  const wrap = document.getElementById("langSwitch");
  if(!wrap) return;
  async function setLang(lang){
    wrap.querySelectorAll(".lang-btn").forEach(b=>b.classList.toggle("active", b.dataset.lang===lang));
    const obj = await fetchLang(lang);
    applyLanguage(obj);
  }
  wrap.addEventListener("click", (e)=>{
    const btn = e.target.closest(".lang-btn");
    if(!btn) return;
    setLang(btn.dataset.lang);
  });
  setLang("id");
})();

/* ===== Role Rotator ===== */
(function () {
  const el  = document.getElementById("roleText");
  const box = document.querySelector(".role-box");
  if(!el || !box) return;

  const DURATION = 600;  // ms
  const PAUSE    = 4000; // ms
  let idx = 0;
  const roles = window.__ROLES__ || [
    "Data Science & Data Wrangling",
    "Coding & Design",
    "Atmospheric Research & Numerical Modelling",
    "Environmental Data Analysis",
    "Air Quality Modelling",
  ];

  el.textContent = roles[0];
  el.style.transition = "none";
  el.style.transform  = "translateX(0)";

  function nextSlide(){
    idx = (idx+1) % roles.length;
    el.style.transition = `transform ${DURATION}ms ease`;
    el.style.transform  = "translateX(-100%)";

    setTimeout(()=>{
      el.style.transition = "none";
      el.style.transform  = "translateX(100%)";
      el.textContent = roles[idx];
      void el.offsetWidth;
      el.style.transition = `transform ${DURATION}ms ease`;
      el.style.transform  = "translateX(0)";
    }, DURATION);
  }

  setTimeout(()=>{
    nextSlide();
    setInterval(nextSlide, PAUSE + DURATION*2);
  }, PAUSE);
})();

/* ===== Pendidikan Modal ===== */
(function(){
  const container = document.querySelector(".edu-scroll");
  const modal = document.getElementById("eduModal");
  if(!container || !modal) return;

  const titleEl = modal.querySelector("#eduModalTitle");
  const descEl  = modal.querySelector("#eduModalDesc");
  const galEl   = modal.querySelector(".edu-modal-gallery");
  const btnClose= modal.querySelector(".edu-close");

  function openModal(card){
    const title = card.dataset.title || "";
    const desc  = card.dataset.desc  || "";
    // Support 3 images; fallback to single data-img
    const imgs = [card.dataset.img1, card.dataset.img2, card.dataset.img3].filter(Boolean);
    if(imgs.length===0 && card.dataset.img){ imgs.push(card.dataset.img, card.dataset.img, card.dataset.img); }
    while(imgs.length<3) imgs.push(imgs[imgs.length-1] || "");

    titleEl.textContent = title;
    descEl.textContent  = desc;
    galEl.innerHTML = "";
    imgs.slice(0,3).forEach((src,i)=>{
      if(!src) return;
      const im = document.createElement("img");
      im.src = src;
      im.alt = "Gambar " + (i+1);
      galEl.appendChild(im);
    });

    modal.style.display="flex";
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("modal-open");
  }

  function closeModal(){
    modal.style.display="none";
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("modal-open");
  }

  container.addEventListener("click", e=>{
    const card = e.target.closest(".edu-card");
    if(card) openModal(card);
  });
  btnClose.addEventListener("click", closeModal);
  modal.addEventListener("click", e=>{ if(e.target===modal) closeModal(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeModal(); });
})();
/* ===== Modal untuk Projects & Pengalaman ===== */
(function () {
  const modal = document.getElementById("itemModal");
  if (!modal) return;

  const titleEl    = modal.querySelector("#itemModalTitle");
  const subtitleEl = modal.querySelector("#itemModalSubtitle");
  const descEl     = modal.querySelector("#itemModalDesc");
  const mediaWrap  = modal.querySelector(".item-modal-media");
  const btnClose   = modal.querySelector(".item-close");

  function openItemModal(card) {
    // PATCH v5: inject signature bar into modal
    const sigText = card.querySelector('.sig-bar')?.textContent?.trim();
    const existingSig = modal.querySelector('.sig-bar');
    if(existingSig) existingSig.remove();
    if(sigText){
      const bar = document.createElement('span');
      bar.className = 'sig-bar sig-modal';
      bar.textContent = sigText;
      modal.querySelector('.item-modal-content').appendChild(bar);
    }
    titleEl.textContent    = card.dataset.title || "";
    subtitleEl.textContent = card.dataset.subtitle || "";
    descEl.textContent     = card.dataset.body || "";

    mediaWrap.innerHTML = "";
    [card.dataset.img1, card.dataset.img2, card.dataset.img3].forEach((src,i)=>{
      if(src){
        const img=document.createElement("img");
        img.src=src;
        img.alt="Gambar "+(i+1);
        mediaWrap.appendChild(img);
      }
    });

    modal.style.display="flex";
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("modal-open");
  }
  function closeItemModal(){
    modal.style.display="none";
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("modal-open");
  }

    document.querySelector(".proj-scroll")?.addEventListener("click", e=>{
    const card = e.target.closest(".proj-card");
    if(card) openItemModal(card);
  });
  document.querySelector(".exp-scroll")?.addEventListener("click", e=>{
    const card = e.target.closest(".exp-card");
    if(card) openItemModal(card);
  });
  // Signature rows (top, non-scroll)
  document.querySelector(".proj-row-top")?.addEventListener("click", e=>{
    const card = e.target.closest(".proj-card");
    if(card) openItemModal(card);
  });
  document.querySelector(".exp-row-top")?.addEventListener("click", e=>{
    const card = e.target.closest(".exp-card");
    if(card) openItemModal(card);
  });
  // Pelatihan & Sertifikat
  document.querySelectorAll(".list-scroll").forEach(list=>{
    list.addEventListener("click", e=>{
      const card = e.target.closest(".list-card");
      if(card) openItemModal(card);
    });
  });
  btnClose.addEventListener("click", closeItemModal);
  modal.addEventListener("click", e=>{ if(e.target===modal) closeItemModal(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeItemModal(); });
})();


/* ===== Hero Background Slideshow ===== */
(function(){
  const el = document.querySelector(".hero-photo");
  if(!el) return;

  const images = [
    'assets/background.jpg','assets/background2.jpg','assets/background3.jpg',
    'assets/background4.jpg','assets/background5.jpg','assets/background6.jpg',
    'assets/background7.jpg','assets/background8.jpg','assets/background9.jpg',
    'assets/background10.jpg'
  ];
  images.forEach(src=>{ const i=new Image(); i.src=src; });

  const DURATION = 1500;
  const PAUSE    = 6000;
  let idx = 0;

  el.style.setProperty('--img-current', `url(${images[idx]})`);
  el.style.setProperty('--img-next',    `url(${images[(idx+1)%images.length]})`);
  el.style.setProperty('--slide-duration', DURATION+'ms');

  function slide(){
    el.classList.add('is-sliding');
    setTimeout(()=>{
      idx = (idx+1) % images.length;
      el.style.setProperty('--img-current', `url(${images[idx]})`);
      el.style.setProperty('--img-next',    `url(${images[(idx+1)%images.length]})`);
      el.classList.add('no-animate');
      el.classList.remove('is-sliding');
      void el.offsetWidth;
      el.classList.remove('no-animate');
      setTimeout(slide, PAUSE);
    }, DURATION);
  }
  setTimeout(slide, PAUSE);
})();

/* ===== Equalize card heights ===== */
(function(){
  function equalize(selector){
    const cards = Array.from(document.querySelectorAll(selector));
    if(!cards.length) return;
    cards.forEach(c=>{ c.style.height = ''; });
    const max = Math.max(...cards.map(c=>c.offsetHeight));
    cards.forEach(c=>{ c.style.height = max + 'px'; });
  }
  function run(){ equalize('.proj-card'); equalize('.exp-card'); }
  let t;
  function debounce(){ clearTimeout(t); t=setTimeout(run, 120); }

  window.addEventListener('load', run);
  window.addEventListener('resize', debounce);
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.proj-img,.exp-img').forEach(img=>{
      img.addEventListener('load', debounce);
    });
  });
})();
// PATCH v6: signature listeners on DOMContentLoaded
window.addEventListener("DOMContentLoaded", ()=>{
  document.querySelector(".proj-row-top")?.addEventListener("click", e=>{
    const card = e.target.closest(".proj-card");
    if(card) openItemModal(card);
  });
  document.querySelector(".exp-row-top")?.addEventListener("click", e=>{
    const card = e.target.closest(".exp-card");
    if(card) openItemModal(card);
  });
});

// PATCH v8: signature and list-card listeners
window.addEventListener("DOMContentLoaded", ()=>{
  document.querySelector(".proj-row-top")?.addEventListener("click", e=>{
    const card = e.target.closest(".proj-card");
    if(card) openItemModal(card);
  });
  document.querySelector(".exp-row-top")?.addEventListener("click", e=>{
    const card = e.target.closest(".exp-card");
    if(card) openItemModal(card);
  });
  document.querySelector("#pelatihanList")?.addEventListener("click", e=>{
    const card = e.target.closest(".list-card");
    if(card) openItemModal(card);
  });
  document.querySelector("#sertifikatList")?.addEventListener("click", e=>{
    const card = e.target.closest(".list-card");
    if(card) openItemModal(card);
  });
});

// PATCH v9: modal type detection for Pelatihan & Sertifikat
const origOpenItemModal = openItemModal;
openItemModal = function(card){
  // remove previous type classes
  modal.querySelector('.item-modal-content')?.classList.remove('modal-cert','modal-train');
  // detect type by parent container id
  const parentId = card.parentElement?.id;
  if(parentId==="sertifikatList"){
    modal.querySelector('.item-modal-content')?.classList.add('modal-cert');
  } else if(parentId==="pelatihanList"){
    modal.querySelector('.item-modal-content')?.classList.add('modal-train');
  }
  origOpenItemModal(card);
}

// PATCH v10: clock updater


// PATCH v10: direct listeners for all cards
window.addEventListener("DOMContentLoaded", ()=>{
  document.querySelectorAll('.proj-card, .exp-card, .list-card')
    .forEach(card=>{
      card.addEventListener('click', ()=> openItemModal(card));
    });
});

// PATCH v11: comprehensive listener removed

// PATCH v14: Two-line clock (24h + localized date), rebuilt clean
(function(){
  const dayNames = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const pad = n => String(n).padStart(2,'0');
  function render(){
    const el = document.getElementById('clock'); if(!el) return;
    const t = el.querySelector('.clk-time'); const d = el.querySelector('.clk-date');
    const now = new Date();
    const hh = pad(now.getHours()), mm = pad(now.getMinutes()), ss = pad(now.getSeconds());
    const day = dayNames[now.getDay()]; const date = now.getDate();
    const month = monthNames[now.getMonth()]; const year = now.getFullYear();
    if(t) t.textContent = `${hh}:${mm}:${ss}`;
    if(d) d.textContent = `${day}, ${date} ${month} ${year}`;
  }
  document.addEventListener('DOMContentLoaded', ()=>{ render(); setInterval(render, 1000); });
})();
