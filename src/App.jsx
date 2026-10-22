import { useEffect, useRef, useState } from "react";
import {
  ShoppingCart, Play, Swords, Skull, Sparkles, ChevronDown, Menu, X,
  Building2, Trophy, Users, Flame, MessageCircle, Twitter, Youtube,
} from "lucide-react";

const NAV = [
  ["Об игре", "#hero"],
  ["Сакура", "#vortex"],
  ["Особенности", "#features"],
  ["FAQ", "#faq"],
];

const FACTS = [
  { icon: Users, big: "20 млн+", small: "проданных копий" },
  { icon: Trophy, big: "GOTY", small: "Golden Joystick Awards 2024" },
  { icon: Building2, big: "2014", small: "год основания Game Science" },
];

const FEATURES = [
  {
    icon: Swords,
    title: "Боевые формы и Посох",
    text: "Три боевые стойки посоха — лёгкая, тяжёлая и стойка-столб. Читайте ритм противника, копите концентрацию и обрушивайте на врагов мощные серии ударов.",
    glow: "hover:shadow-[0_0_40px_rgba(255,215,0,0.45)]",
    ring: "from-amber-300 via-amber-500 to-red-600",
    text2: "text-amber-300",
  },
  {
    icon: Skull,
    title: "Сражения с Боссами",
    text: "Каждый босс — самостоятельная легенда из «Путешествия на Запад»: гигантские демоны, мудрецы и воины, которых придётся изучать и побеждать с нескольких попыток.",
    glow: "hover:shadow-[0_0_40px_rgba(255,30,60,0.5)]",
    ring: "from-red-500 via-red-700 to-purple-800",
    text2: "text-red-400",
  },
  {
    icon: Sparkles,
    title: "Превращения (Transfiguration)",
    text: "Принимайте облик побеждённых существ и используйте их силу в бою. Магия трансфигурации открывает новые стили и неожиданные тактики.",
    glow: "hover:shadow-[0_0_40px_rgba(168,50,255,0.5)]",
    ring: "from-fuchsia-400 via-purple-600 to-amber-400",
    text2: "text-fuchsia-300",
  },
];

const FAQ = [
  ["Системные требования", "Минимум (по данным страницы игры в Steam): Windows 10, Intel Core i5-8400 или AMD Ryzen 5 1600, 16 ГБ ОЗУ, GeForce GTX 1060 6 ГБ или Radeon RX 580 8 ГБ, около 130 ГБ на SSD. Для высоких настроек и трассировки лучей нужна более мощная видеокарта. Перед покупкой сверьтесь с актуальными требованиями в магазине."],
  ["На каких платформах доступна игра?", "ПК (Steam, Epic Games Store, WeGame), PlayStation 5 и Xbox Series X|S. Актуальный список платформ и региональные особенности смотрите на страницах магазинов."],
  ["Будут ли DLC?", "Студия Game Science сообщает о планах по дополнительному контенту в официальных каналах. Не доверяйте слухам: новости о DLC, датах и ценах публикуются в соцсетях студии и в магазинах."],
  ["Нужно ли знать «Путешествие на Запад»?", "Нет. Игра рассказывает самостоятельную историю Избранного, но знакомство с романом добавляет много деталей: имён, мест и отсылок."],
  ["Есть ли в игре русский язык?", "Проверьте список поддерживаемых языков на странице игры в вашем магазине: он может меняться с патчами."],
];

const SOCIAL = [
  [MessageCircle, "Discord", "#"],
  [Twitter, "X / Twitter", "#"],
  [Youtube, "YouTube", "#"],
];

/* ───────── Reveal: появление при скролле ───────── */
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="h-full" style={{
      opacity: on ? 1 : 0, filter: on ? "none" : "blur(6px)",
      transform: on ? "none" : "translateY(56px) scale(.96)",
      transition: `opacity .9s ease ${delay}ms, filter .9s ease ${delay}ms, transform .9s cubic-bezier(.2,.8,.2,1) ${delay}ms`,
    }}>{children}</div>
  );
}

/* ───────── Canvas: 3D-вихрь сакуры + пагода, управляется скроллом ───────── */
const STAGES = [
  ["Лепестки против судьбы", "Вихрь только набирает силу. Листайте вниз — мир оживает."],
  ["Пагода пробуждается", "Неоновые ярусы поднимаются из тьмы, а вихрь сжимается вокруг них."],
  ["Путь Избранного начинается", "Ещё немного — и вы окажетесь среди легенд."],
];

function SakuraVortex({ outerRef, onStage }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf, stage = -1, lastP = 0, boost = 0, spin = 0, last = performance.now();
    const m = { x: 0, y: 0, tx: 0, ty: 0 };
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const COLORS = ["#ff4fa3", "#ff7ab8", "#ffd700", "#ffb347", "#ff2d6f"];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const onMove = (e) => { m.tx = e.clientX / window.innerWidth - 0.5; m.ty = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener("pointermove", onMove);

    const spawn = (p = {}) => Object.assign(p, {
      ph: Math.random(), a: rand(0, 6.283), wob: rand(0, 6.283), size: rand(6, 13),
      rot: rand(0, 6.283), vr: rand(-2, 2), flip: rand(0, 6.283), vf: rand(1.5, 4),
      c: COLORS[(Math.random() * COLORS.length) | 0], k: 1, sx: 0, sy: 0, z: 0,
    });
    const petals = Array.from({ length: 320 }, () => spawn());

    const drawPetal = (q) => {
      const s = q.size * q.k * 1.3;
      ctx.save();
      ctx.translate(q.sx, q.sy); ctx.rotate(q.rot); ctx.scale(1, Math.cos(q.flip));
      ctx.globalAlpha = clamp(0.25 + q.k * 0.55, 0, 1);
      ctx.fillStyle = q.c; ctx.shadowColor = q.c; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s, -s * 0.8, s * 0.9, s * 0.7, 0, s);
      ctx.bezierCurveTo(-s * 0.9, s * 0.7, -s, -s * 0.8, 0, -s);
      ctx.fill();
      ctx.restore();
    };

    const pagoda = (cx, baseY, u, t, alpha) => {
      ctx.save();
      ctx.globalAlpha = alpha; ctx.lineWidth = 1.8; ctx.fillStyle = "rgba(60,0,40,0.4)";
      let y = baseY;
      for (let i = 0; i < 6; i++) {
        const k = 1 - i * 0.13;
        const bw = 110 * u * k, bh = 40 * u * k, rw = 190 * u * k, rh = 30 * u * k;
        ctx.strokeStyle = "#ffd700"; ctx.shadowColor = "#ffd700"; ctx.shadowBlur = 12;
        ctx.fillRect(cx - bw / 2, y - bh, bw, bh); ctx.strokeRect(cx - bw / 2, y - bh, bw, bh);
        ctx.save();
        ctx.fillStyle = "#ff2d6f"; ctx.shadowColor = "#ff2d6f";
        for (let j = -1; j <= 1; j++) {
          ctx.globalAlpha = alpha * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.002 + i * 1.7 + j * 3)));
          ctx.fillRect(cx + j * bw * 0.28 - 3 * u, y - bh * 0.7, 6 * u, 15 * u * k);
        }
        ctx.restore();
        const ry = y - bh;
        ctx.strokeStyle = "#ff2d6f"; ctx.shadowColor = "#ff2d6f"; ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(cx - rw / 2 - 16 * u, ry - 12 * u);
        ctx.quadraticCurveTo(cx - rw / 2 + 22 * u, ry + 4 * u, cx - rw * 0.3, ry);
        ctx.lineTo(cx - bw * 0.2, ry - rh); ctx.lineTo(cx + bw * 0.2, ry - rh); ctx.lineTo(cx + rw * 0.3, ry);
        ctx.quadraticCurveTo(cx + rw / 2 - 22 * u, ry + 4 * u, cx + rw / 2 + 16 * u, ry - 12 * u);
        ctx.quadraticCurveTo(cx, ry - 6 * u, cx - rw / 2 - 16 * u, ry - 12 * u);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        y = ry - rh + 6 * u;
      }
      ctx.strokeStyle = "#ffd700"; ctx.shadowColor = "#ffd700";
      ctx.beginPath(); ctx.moveTo(cx, y); ctx.lineTo(cx, y - 55 * u); ctx.stroke();
      ctx.restore();
    };

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;

      // прогресс скролла внутри секции (0…1)
      const r = outerRef.current.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
      const st = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
      if (st !== stage) { stage = st; onStage(st); }
      boost += (clamp((Math.abs(p - lastP) / Math.max(dt, 0.001)) * 4, 0, 5) - boost) * 0.1;
      lastP = p;

      m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06;
      if (!reduce) spin += dt * (0.3 + boost * 0.8);

      // камера: орбита + наклон, зависят от скролла и мыши
      const yaw = spin + p * 6.283 + m.x * 0.9;
      const tilt = 0.28 + m.y * 0.4 + p * 0.15;
      const cyw = Math.cos(yaw), syw = Math.sin(yaw), ct = Math.cos(tilt), sn = Math.sin(tilt);
      const D = 1100, Rmax = Math.min(w * 0.46, 560) * (1.1 - 0.5 * p), Hh = h * 0.95;
      const cx = w / 2 + m.x * 40, cy = h * 0.5;

      petals.forEach((q) => {
        const R = Rmax * (0.14 + 0.86 * q.ph) * (1 + 0.12 * Math.sin(now * 0.001 + q.wob));
        const X = Math.cos(q.a) * R, Z = Math.sin(q.a) * R, Y = (0.5 - q.ph) * Hh;
        const X2 = X * cyw - Z * syw, Z2 = X * syw + Z * cyw;
        const Y2 = Y * ct - Z2 * sn, Z3 = Y * sn + Z2 * ct;
        q.k = D / (D + Z3); q.z = Z3; q.sx = cx + X2 * q.k; q.sy = cy + Y2 * q.k;
      });

      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w / 2, h * 0.45, 10, w / 2, h * 0.45, Math.min(w, h) * 0.55);
      g.addColorStop(0, `rgba(170,20,80,${0.25 + 0.3 * p})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      petals.forEach((q) => q.z > 0 && drawPetal(q));                       // дальние лепестки
      pagoda(w / 2 - m.x * 30, h * (1.12 - 0.22 * p), (Math.min(w, h) / 560) * (0.6 + 0.6 * p), now, 0.3 + 0.55 * p);
      petals.forEach((q) => q.z <= 0 && drawPetal(q));                      // ближние лепестки

      if (!reduce) {
        petals.forEach((q) => {
          q.a += dt * (0.8 + boost * 1.2) * (1.5 - q.ph);
          q.ph += dt * 0.05; q.rot += q.vr * dt; q.flip += q.vf * dt;
          if (q.ph > 1) { spawn(q); q.ph = 0; }
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [outerRef, onStage]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* ───────── UI ───────── */
const cut = { clipPath: "polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px)" };

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-amber-400/20 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#hero" className="flex items-center gap-2 font-title text-lg font-bold text-amber-300 [text-shadow:0_0_12px_rgba(255,215,0,0.8)]">
          <Flame size={20} className="text-red-500" /> BLACK MYTH
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map(([l, h]) => (
            <a key={h} href={h} className="text-zinc-300 transition hover:text-amber-300 hover:[text-shadow:0_0_10px_rgba(255,215,0,0.9)]">{l}</a>
          ))}
        </nav>
        <button className="text-amber-300 md:hidden" onClick={() => setOpen(!open)} aria-label="Меню" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-4 border-t border-amber-400/20 bg-black/90 px-6 py-5 md:hidden">
          {NAV.map(([l, h]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="text-lg text-zinc-200 hover:text-amber-300">{l}</a>
          ))}
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden bg-black px-6 pb-28 pt-36">
      <div className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 top-72 h-80 w-80 rounded-full bg-purple-700/25 blur-[120px]" />
      <div className="relative mx-auto max-w-5xl text-center">
        <p className="text-amber-300/90">Dark Fantasy Action RPG по мотивам «Путешествия на Запад»</p>
        <h1 className="animate-glow mt-5 font-title text-5xl font-black leading-tight text-amber-300 sm:text-7xl lg:text-8xl">
          BLACK MYTH:<br />WUKONG
        </h1>
        <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-zinc-200">
          Вы — Избранный, Король Обезьян, что отказался принять судьбу. Посох в руках, пепел небес
          за спиной, а впереди тёмный мир, где боги жестоки, а демоны помнят всё.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-5">
          <a href="#" style={cut} className="inline-flex items-center gap-3 bg-amber-400 px-9 py-4 font-title text-lg font-black text-black shadow-[0_0_30px_rgba(255,215,0,0.7)] transition duration-300 hover:-translate-y-1 hover:bg-amber-300 hover:shadow-[0_0_60px_rgba(255,215,0,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <ShoppingCart size={20} /> КУПИТЬ СЕЙЧАС
          </a>
          <a href="#" style={cut} className="inline-flex items-center gap-3 border border-red-500 bg-red-600/10 px-9 py-4 font-title text-lg font-bold text-red-400 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-red-600/25 hover:text-white hover:shadow-[0_0_40px_rgba(255,30,60,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <Play size={20} /> СМОТРЕТЬ ТРЕЙЛЕР
          </a>
        </div>

        <div className="mt-20 grid gap-6 text-left lg:grid-cols-[1.4fr_1fr]">
          <Reveal><article className="h-full rounded-2xl bg-gradient-to-br from-amber-300/70 via-red-600/50 to-purple-700/70 p-px">
            <div className="h-full rounded-2xl bg-black/70 p-8 backdrop-blur-xl">
              <h2 className="font-title text-2xl font-bold text-white">Игра, о которой заговорил весь мир</h2>
              <p className="mt-4 leading-relaxed text-zinc-300">
                С момента выхода в августе 2024 года игра стала мировым феноменом и одним из самых
                громких релизов года. Тёмная китайская мифология, где каждый монстр взят из древних
                легенд; боевая система тёмного кунг-фу с точными уклонениями и мощными связками;
                магия трансфигурации, позволяющая принимать облик поверженных врагов.
              </p>
            </div>
          </article></Reveal>
          <Reveal delay={200}><article className="h-full rounded-2xl bg-gradient-to-br from-purple-600/70 via-red-600/40 to-amber-300/70 p-px">
            <div className="h-full rounded-2xl bg-black/70 p-8 backdrop-blur-xl">
              <h2 className="font-title text-2xl font-bold text-amber-300">Game Science</h2>
              <p className="mt-4 leading-relaxed text-zinc-300">
                Китайская студия, основанная в 2014 году выходцами из индустрии. Путь от небольшой
                команды до мирового успеха занял десять лет: дебютный трейлер 2020 года взорвал сеть,
                а релиз закрепил за студией репутацию создателей «китайского ААА».
              </p>
              <ul className="mt-6 space-y-4">
                {FACTS.map(({ icon: Icon, big, small }) => (
                  <li key={small} className="flex items-center gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-400/10 text-amber-300 shadow-[0_0_16px_rgba(255,215,0,0.3)]"><Icon size={20} /></span>
                    <span><span className="block font-title font-bold text-white">{big}</span><span className="text-sm text-zinc-400">{small}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </article></Reveal>
        </div>
      </div>
    </section>
  );
}

function VortexSection() {
  const outer = useRef(null);
  const [stage, setStage] = useState(0);
  return (
    <section id="vortex" ref={outer} className="relative h-[320vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden">
        <SakuraVortex outerRef={outer} onStage={setStage} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
        {STAGES.map(([t, d], i) => (
          <div key={t} className="pointer-events-none absolute inset-x-0 top-28 mx-auto max-w-2xl px-6 text-center transition-all duration-700"
            style={{ opacity: stage === i ? 1 : 0, transform: stage === i ? "none" : "translateY(30px)" }}>
            <h2 className="font-title text-4xl font-black text-white sm:text-6xl [text-shadow:0_0_14px_rgba(255,79,163,0.9),0_0_50px_rgba(255,215,0,0.5)]">{t}</h2>
            <p className="mt-4 text-zinc-200">{d}</p>
          </div>
        ))}
        <div className={`pointer-events-none absolute inset-x-0 bottom-10 flex justify-center text-amber-300 transition-opacity duration-500 ${stage === 0 ? "opacity-100" : "opacity-0"}`}>
          <ChevronDown size={36} className="animate-bounce drop-shadow-[0_0_10px_rgba(255,215,0,0.9)]" />
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-black px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-title text-4xl font-black text-white sm:text-5xl [text-shadow:0_0_20px_rgba(255,215,0,0.35)]">Путь Избранного</h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text, glow, ring, text2 }, i) => (
            <Reveal key={title} delay={i * 150}><article className={`group h-full rounded-2xl bg-gradient-to-br ${ring} p-px transition-all duration-500 hover:-translate-y-2 ${glow}`}>
              <div className="h-full rounded-2xl bg-black/85 p-8 backdrop-blur-xl transition group-hover:bg-black/70">
                <Icon size={38} className={`${text2} transition group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_currentColor]`} />
                <h3 className={`mt-6 font-title text-2xl font-bold ${text2}`}>{title}</h3>
                <p className="mt-4 leading-relaxed text-zinc-400 transition group-hover:text-zinc-200">{text}</p>
              </div>
            </article></Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="bg-black px-6 py-28">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-title text-4xl font-black text-white sm:text-5xl">Частые вопросы</h2>
        <div className="mt-12 space-y-4">
          {FAQ.map(([q, a], i) => {
            const on = open === i;
            return (
              <Reveal key={q} delay={i * 80}><div className={`rounded-xl border backdrop-blur-xl transition-all duration-300 ${on ? "border-amber-400 bg-amber-400/5 shadow-[0_0_30px_rgba(255,215,0,0.3)]" : "border-zinc-800 bg-zinc-950/60 hover:border-amber-400/50"}`}>
                <button onClick={() => setOpen(on ? -1 : i)} aria-expanded={on}
                  className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-title text-lg font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 ${on ? "text-amber-300 [text-shadow:0_0_10px_rgba(255,215,0,0.6)]" : "text-white"}`}>
                  {q}
                  <ChevronDown className={`shrink-0 transition-transform duration-300 ${on ? "rotate-180 text-amber-300" : "text-zinc-500"}`} />
                </button>
                <div className={`grid transition-all duration-300 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden"><p className="px-6 pb-6 leading-relaxed text-zinc-400">{a}</p></div>
                </div>
              </div></Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-amber-400/20 bg-black px-6 py-14">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 text-center">
        <p className="animate-glow font-title text-3xl font-black text-amber-300">BLACK MYTH: WUKONG</p>
        <div className="flex gap-4">
          {SOCIAL.map(([Icon, name, href]) => (
            <a key={name} href={href} aria-label={name}
              className="grid h-12 w-12 place-items-center rounded-xl border border-zinc-700 bg-white/5 text-zinc-300 backdrop-blur transition hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_24px_rgba(255,215,0,0.6)]">
              <Icon size={20} />
            </a>
          ))}
        </div>
        <p className="max-w-xl text-sm text-zinc-500">
          © Game Science. Все права на игру и связанные материалы принадлежат их владельцам.
          Эта страница — фанатская концепция и не является официальным сайтом.
        </p>
        <div className="flex gap-6 text-sm text-zinc-500">
          <a href="#" className="hover:text-amber-300">Политика конфиденциальности</a>
          <a href="#" className="hover:text-amber-300">Условия использования</a>
        </div>
      </div>
    </footer>
  );
}

/* ───────── App ───────── */
export default function App() {
  const bar = useRef(null);
  const onScroll = (e) => {
    const el = e.currentTarget, max = el.scrollHeight - el.clientHeight;
    if (bar.current && max > 0) bar.current.style.transform = `scaleX(${el.scrollTop / max})`;
  };
  return (
    <div onScroll={onScroll} className="fixed inset-0 overflow-y-auto overflow-x-hidden scroll-smooth bg-black font-body text-zinc-200 selection:bg-amber-400 selection:text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Rajdhani:wght@400;500;600&display=swap');
        .font-title { font-family: 'Cinzel', 'Noto Serif SC', serif; }
        .font-body { font-family: 'Rajdhani', system-ui, sans-serif; font-size: 1.05rem; }
        @keyframes glow {
          from { text-shadow: 0 0 10px rgba(255,215,0,.7), 0 0 30px rgba(255,215,0,.5), 0 0 70px rgba(255,30,60,.4); }
          to   { text-shadow: 0 0 18px rgba(255,215,0,1), 0 0 55px rgba(255,215,0,.8), 0 0 120px rgba(255,30,60,.7); }
        }
        .animate-glow { animation: glow 2.2s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) { .scroll-smooth { scroll-behavior: auto; } .animate-glow { animation: none; } }
      `}</style>
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5">
        <div ref={bar} className="h-full origin-left bg-amber-300 shadow-[0_0_12px_rgba(255,215,0,1)]" style={{ transform: "scaleX(0)" }} />
      </div>
      <Header />
      <main>
        <Hero />
        <VortexSection />
        <Features />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}