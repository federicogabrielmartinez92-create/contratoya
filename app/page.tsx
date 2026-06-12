'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  useEffect(() => {
    const fields = [
      { id: 'f1', value: 'Martín González', delay: 600 },
      { id: 'f2', value: 'Estudio Creativo SRL', delay: 2200 },
      { id: 'f3', value: 'Diseño de identidad visual', delay: 3900 },
      { id: 'f4', value: '$ 280.000 ARS', delay: 5400 },
    ];
    function typeText(el: HTMLElement, text: string, cb?: () => void) {
      el.classList.add('typing');
      let i = 0;
      const iv = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i === text.length) { clearInterval(iv); el.classList.remove('typing'); cb?.(); }
      }, 38);
    }
    function showClause() {
      const clause = document.getElementById('clause');
      const badge = document.getElementById('badge');
      const btn = document.getElementById('dlbtn');
      const timer = document.getElementById('timer');
      const cn = document.getElementById('cn');
      const ca = document.getElementById('ca');
      if (cn) cn.textContent = 'Martín González';
      if (ca) ca.textContent = '$ 280.000 ARS';
      if (clause) clause.style.opacity = '1';
      setTimeout(() => {
        if (badge) badge.style.opacity = '1';
        if (btn) btn.style.opacity = '1';
        if (timer) timer.textContent = 'Generado en 8 segundos';
        setTimeout(reset, 5000);
      }, 800);
    }
    function reset() {
      fields.forEach(f => { const el = document.getElementById(f.id); if (el) el.textContent = ''; });
      ['clause','badge','dlbtn'].forEach(id => { const el = document.getElementById(id); if (el) el.style.opacity = '0'; });
      const timer = document.getElementById('timer'); if (timer) timer.textContent = 'Generando…';
      setTimeout(run, 800);
    }
    function run() {
      fields.forEach((f, i) => {
        const el = document.getElementById(f.id);
        if (el) setTimeout(() => typeText(el, f.value, i === fields.length - 1 ? showClause : undefined), f.delay);
      });
    }
    run();
    document.querySelectorAll('.faq-q').forEach(q => {
      q.addEventListener('click', () => {
        const item = q.parentElement;
        if (!item) return;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',sans-serif;color:#111827;background:#fff;-webkit-font-smoothing:antialiased}
        nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:0 5%;display:flex;align-items:center;justify-content:space-between;height:64px;background:rgba(10,22,40,0.92);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.06)}
        .logo{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:20px;color:#fff;text-decoration:none}
        .logo span{color:#F5A623}
        .nav-links{display:flex;align-items:center;gap:28px;list-style:none}
        .nav-links a{font-size:14px;color:rgba(255,255,255,0.7);text-decoration:none;transition:color .2s}
        .nav-links a:hover{color:#fff}
        .btn{display:inline-flex;align-items:center;gap:8px;font-family:'Inter',sans-serif;font-size:14px;font-weight:500;padding:10px 22px;border-radius:10px;border:none;cursor:pointer;text-decoration:none;transition:background .18s,transform .12s}
        .btn:active{transform:scale(0.97)}
        .btn-gold{background:#F5A623;color:#0A1628}
        .btn-gold:hover{background:#D4891A}
        .btn-outline{background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.25)}
        .btn-outline:hover{border-color:rgba(255,255,255,0.6)}
        .btn-lg{font-size:16px;padding:14px 32px}
        .hero{background:#0A1628;padding:140px 5% 100px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;min-height:100vh}
        .eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:'DM Mono',monospace;font-size:12px;color:#F5A623;letter-spacing:.08em;padding:6px 14px;border-radius:100px;border:1px solid rgba(245,166,35,0.3);background:rgba(245,166,35,0.08);margin-bottom:24px}
        .eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:#F5A623;animation:pulse 2s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(36px,4.5vw,58px);font-weight:700;color:#fff;line-height:1.08;letter-spacing:-1.5px;margin-bottom:20px}
        h1 em{font-style:normal;color:#F5A623}
        .hero-sub{font-size:17px;line-height:1.65;color:rgba(255,255,255,0.62);margin-bottom:40px;max-width:480px}
        .hero-ctas{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:48px}
        .trust{display:flex;gap:24px;flex-wrap:wrap}
        .trust-item{display:flex;align-items:center;gap:6px;font-size:13px;color:rgba(255,255,255,0.5)}
        .contract-preview{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.5)}
        .topbar{background:#F1F3F5;padding:10px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #E5E7EB}
        .dot{width:10px;height:10px;border-radius:50%}
        .url{flex:1;background:#fff;border-radius:6px;padding:4px 10px;font-family:'DM Mono',monospace;font-size:11px;color:#5C6370;text-align:center}
        .pbody{padding:24px 28px}
        .ph{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:#111827;text-align:center;letter-spacing:.05em;margin-bottom:18px;padding-bottom:14px;border-bottom:2px solid #111827}
        .pfield{margin-bottom:12px}
        .pl{font-size:9px;font-weight:500;color:#9AA1AD;letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px}
        .pv{font-family:'DM Mono',monospace;font-size:12px;color:#111827;min-height:16px;border-bottom:1px solid #F1F3F5;padding-bottom:4px}
        .pv.typing::after{content:'|';animation:blink .7s step-end infinite;color:#F5A623}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .pclause{margin-top:16px;padding:12px;background:#F8F9FB;border-radius:8px;border-left:3px solid #F5A623;opacity:0;transition:opacity .5s}
        .pct{font-size:10px;font-weight:600;color:#111827;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
        .pctxt{font-size:11px;line-height:1.6;color:#5C6370}
        .pctxt span{background:rgba(245,166,35,0.18);border-radius:2px;padding:0 2px}
        .pbadge{display:inline-flex;align-items:center;gap:6px;margin-top:16px;font-size:11px;color:#16A34A;font-weight:500;opacity:0;transition:opacity .5s}
        .pfoot{margin-top:20px;padding-top:16px;border-top:1px solid #F1F3F5;display:flex;justify-content:space-between;align-items:center}
        .pdl{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:#0A1628;padding:8px 16px;border-radius:8px;background:#F5A623;border:none;cursor:pointer;font-family:'Inter',sans-serif;opacity:0;transition:opacity .4s}
        .ptimer{font-size:11px;color:#9AA1AD}
        .stats{background:#0F1F38;padding:32px 5%;display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid rgba(255,255,255,0.06)}
        .stat{text-align:center;padding:16px;border-right:1px solid rgba(255,255,255,0.08)}
        .stat:last-child{border-right:none}
        .stat-n{font-family:'Space Grotesk',sans-serif;font-size:32px;font-weight:700;color:#F5A623;line-height:1}
        .stat-l{font-size:13px;color:rgba(255,255,255,0.5);margin-top:6px}
        section{padding:96px 5%}
        .sec-eye{font-family:'DM Mono',monospace;font-size:12px;color:#F5A623;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
        .sec-title{font-family:'Space Grotesk',sans-serif;font-size:clamp(28px,3vw,40px);font-weight:700;color:#111827;letter-spacing:-1px;line-height:1.15;margin-bottom:16px}
        .sec-sub{font-size:17px;line-height:1.65;color:#5C6370;max-width:520px;margin:0 auto}
        .sec-hdr{margin-bottom:64px;text-align:center}
        .how{background:#F8F9FB}
        .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
        .step{background:#fff;border-radius:16px;padding:32px;border:1px solid #EEF0F3;position:relative}
        .step-n{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:#F5A623;letter-spacing:.06em;margin-bottom:16px}
        .step-ico{width:48px;height:48px;border-radius:12px;background:rgba(245,166,35,0.1);display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:26px}
        .step h3{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;color:#111827;margin-bottom:10px}
        .step p{font-size:15px;line-height:1.6;color:#5C6370}
        .feats{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
        .feat{padding:28px 32px;border-radius:16px;border:1px solid #EEF0F3;display:flex;gap:20px;transition:border-color .2s,transform .2s}
        .feat:hover{border-color:#F5A623;transform:translateY(-2px)}
        .feat-ico{width:44px;height:44px;border-radius:10px;background:rgba(245,166,35,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px}
        .feat h3{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#111827;margin-bottom:8px}
        .feat p{font-size:14px;line-height:1.6;color:#5C6370}
        .pricing{background:#F8F9FB}
        .plans{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto;width:100%}
        .plan{background:#fff;border-radius:20px;padding:32px;border:1.5px solid #EEF0F3;position:relative}
        .plan.feat-plan{background:#0A1628;border-color:#0A1628}
        .plan-badge{position:absolute;top:-12px;left:28px;background:#F5A623;color:#0A1628;font-size:11px;font-weight:700;letter-spacing:.06em;padding:4px 14px;border-radius:100px;font-family:'Space Grotesk',sans-serif}
        .plan-name{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;letter-spacing:.04em;color:#5C6370;margin-bottom:12px;text-transform:uppercase}
        .feat-plan .plan-name{color:rgba(255,255,255,0.5)}
        .plan-price{font-family:'Space Grotesk',sans-serif;font-size:40px;font-weight:700;color:#111827;line-height:1;margin-bottom:4px}
        .feat-plan .plan-price{color:#fff}
        .plan-price span{font-size:16px;font-weight:400;color:#9AA1AD}
        .feat-plan .plan-price span{color:rgba(255,255,255,0.5)}
        .plan-desc{font-size:13px;color:#5C6370;margin-bottom:24px;line-height:1.5}
        .feat-plan .plan-desc{color:rgba(255,255,255,0.6)}
        .plan-features{list-style:none;margin-bottom:28px}
        .plan-features li{display:flex;align-items:center;gap:10px;font-size:13px;color:#111827;padding:6px 0;border-bottom:1px solid #EEF0F3}
        .feat-plan .plan-features li{color:rgba(255,255,255,0.85);border-color:rgba(255,255,255,0.1)}
        .plan-features li::before{content:'✓';color:#16A34A;font-weight:700;flex-shrink:0}
        .plan-features li:last-child{border-bottom:none}
        .plan-cta{display:block;text-align:center;padding:13px;border-radius:10px;font-size:14px;font-weight:600;font-family:'Space Grotesk',sans-serif;text-decoration:none;transition:all .18s}
        .cta-light{background:#EEF0F3;color:#111827}
        .cta-gold{background:#F5A623;color:#0A1628}
        .cta-gold:hover{background:#D4891A}
        .faq-list{max-width:100%}
        .faq-item{border-bottom:1px solid #EEF0F3;padding:20px 0}
        .faq-q{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:600;color:#111827;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;background:none;border:none;width:100%;text-align:left}
        .faq-q::after{content:'+';font-size:20px;color:#F5A623;flex-shrink:0}
        .faq-a{font-size:15px;line-height:1.7;color:#5C6370;margin-top:12px;display:none}
        .faq-item.open .faq-q::after{content:'−'}
        .faq-item.open .faq-a{display:block}
        .cta-final{background:#0A1628;text-align:center;padding:100px 5%}
        .cta-final h2{font-family:'Space Grotesk',sans-serif;font-size:clamp(28px,3.5vw,46px);font-weight:700;color:#fff;letter-spacing:-1px;margin-bottom:16px}
        .cta-final h2 em{font-style:normal;color:#F5A623}
        .cta-final p{font-size:17px;color:rgba(255,255,255,0.55);margin-bottom:40px;max-width:480px;margin-inline:auto}
        footer{background:#0F1F38;padding:32px 5%;display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.06);flex-wrap:wrap;gap:16px}
        .foot-logo{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#fff}
        .foot-logo span{color:#F5A623}
        footer p{font-size:13px;color:rgba(255,255,255,0.35)}
        .foot-links{display:flex;gap:20px}
        .foot-links a{font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none}
        .foot-links a:hover{color:rgba(255,255,255,0.7)}
        @media(max-width:900px){.hero{grid-template-columns:1fr;padding-top:110px}.steps{grid-template-columns:1fr}.feats{grid-template-columns:1fr}.plans{grid-template-columns:1fr}.stats{grid-template-columns:1fr}.stat{border-right:none;border-bottom:1px solid rgba(255,255,255,0.08)}.stat:last-child{border-bottom:none}.nav-links{display:none}}
      `}</style>

      <nav>
        <a href="/" className="logo">Contrato<span>Ya</span></a>
        <ul className="nav-links">
          <li><a href="#como-funciona">Cómo funciona</a></li>
          <li><a href="#precios">Precios</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <Link href="/generar" className="btn btn-gold">Empezar gratis</Link>
      </nav>

      <section className="hero">
        <div>
          <div className="eyebrow">Contratos para freelancers argentinos</div>
          <h1>Tu contrato listo<br/>en <em>2 minutos.</em></h1>
          <p className="hero-sub">Generá contratos profesionales para tus servicios freelance, adaptados a la ley argentina. Sin abogados. Sin plantillas genéricas. Con IA.</p>
          <div className="hero-ctas">
            <Link href="/generar" className="btn btn-gold btn-lg">Generá tu primer contrato gratis →</Link>
            <a href="#como-funciona" className="btn btn-outline btn-lg">Ver cómo funciona</a>
          </div>
          <div className="trust">
            <div className="trust-item">✓ Adaptado a la ley argentina</div>
            <div className="trust-item">✓ PDF listo para firmar</div>
            <div className="trust-item">✓ 1 contrato gratis, sin tarjeta</div>
          </div>
        </div>
        <div className="contract-preview">
          <div className="topbar">
            <div className="dot" style={{background:'#FF5F57'}}/>
            <div className="dot" style={{background:'#FEBC2E'}}/>
            <div className="dot" style={{background:'#28C840'}}/>
            <div className="url">contratoya.app/generar</div>
          </div>
          <div className="pbody">
            <div className="ph">CONTRATO DE PRESTACIÓN DE SERVICIOS</div>
            <div className="pfield"><div className="pl">Prestador de servicios</div><div className="pv" id="f1"/></div>
            <div className="pfield"><div className="pl">Cliente</div><div className="pv" id="f2"/></div>
            <div className="pfield"><div className="pl">Servicio contratado</div><div className="pv" id="f3"/></div>
            <div className="pfield"><div className="pl">Monto acordado</div><div className="pv" id="f4"/></div>
            <div className="pclause" id="clause">
              <div className="pct">Cláusula de pago</div>
              <div className="pctxt">El cliente abonará a <span id="cn">—</span> la suma de <span id="ca">—</span> dentro de los 5 días hábiles. Mora: 2% mensual.</div>
            </div>
            <div className="pbadge" id="badge">✓ Contrato generado · Conforme a la ley argentina</div>
            <div className="pfoot">
              <div className="ptimer" id="timer">Generando…</div>
              <button className="pdl" id="dlbtn">↓ Descargar PDF</button>
            </div>
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="stat"><div className="stat-n">+500K</div><div className="stat-l">Freelancers en Argentina</div></div>
        <div className="stat"><div className="stat-n">30%</div><div className="stat-l">Sufren impagos sin contrato</div></div>
        <div className="stat"><div className="stat-n">2 min</div><div className="stat-l">Para generar tu contrato</div></div>
      </div>

      <section className="how" id="como-funciona">
        <div className="sec-hdr">
          <div className="sec-eye">Cómo funciona</div>
          <h2 className="sec-title">Tres pasos y listo</h2>
          <p className="sec-sub">Sin terminología legal confusa. Sin idas y vueltas con abogados. Solo completás, generás y enviás.</p>
        </div>
        <div className="steps">
          <div className="step"><div className="step-n">01</div><div className="step-ico">📝</div><h3>Completás el formulario</h3><p>Cargás tus datos, los del cliente, el servicio, el monto y los plazos. Menos de 2 minutos.</p></div>
          <div className="step"><div className="step-n">02</div><div className="step-ico">⚡</div><h3>La IA genera el contrato</h3><p>Nuestro sistema crea un contrato profesional con todas las cláusulas legales, adaptado a tu situación.</p></div>
          <div className="step"><div className="step-n">03</div><div className="step-ico">📄</div><h3>Descargás y enviás</h3><p>Obtenés un PDF listo para firmar. Lo mandás a tu cliente y arrancás el proyecto protegido.</p></div>
        </div>
      </section>

      <section>
        <div className="sec-hdr">
          <div className="sec-eye">Por qué ContratoYa</div>
          <h2 className="sec-title">No es una plantilla genérica</h2>
          <p className="sec-sub">Cada contrato es generado específicamente para tu caso, con cláusulas pensadas para freelancers argentinos.</p>
        </div>
        <div className="feats">
          <div className="feat"><div className="feat-ico">🇦🇷</div><div><h3>Adaptado a Argentina</h3><p>Las cláusulas respetan el marco legal argentino. No es una traducción de un template americano.</p></div></div>
          <div className="feat"><div className="feat-ico">🛡️</div><div><h3>Protección ante impagos</h3><p>Incluye cláusulas de mora, interés por demora y condiciones de pago claras. El 30% de los freelancers sufren impagos.</p></div></div>
          <div className="feat"><div className="feat-ico">🎨</div><div><h3>Para cualquier servicio</h3><p>Diseño, desarrollo web, fotografía, redacción, marketing, consultoría. El contrato se adapta a tu rubro.</p></div></div>
          <div className="feat"><div className="feat-ico">✍️</div><div><h3>Firma digital incluida</h3><p>En el plan Por Contrato y Pro, ambas partes pueden firmar digitalmente con validez legal en Argentina.</p></div></div>
        </div>
      </section>

      <section className="pricing" id="precios">
        <div className="sec-hdr">
          <div className="sec-eye">Precios</div>
          <h2 className="sec-title">Simple y transparente</h2>
          <p className="sec-sub">Empezá gratis. Pagá solo cuando lo necesites.</p>
        </div>
        <div className="plans">
          <div className="plan">
            <div className="plan-name">Gratis</div>
            <div className="plan-price">$0 <span>/ siempre</span></div>
            <p className="plan-desc">Para que pruebes el producto sin compromiso.</p>
            <ul className="plan-features">
              <li>1 contrato de por vida</li>
              <li>Descarga en PDF</li>
              <li>Cláusulas esenciales</li>
              <li>Sin tarjeta de crédito</li>
            </ul>
            <Link href="/generar" className="plan-cta cta-light">Empezar gratis</Link>
          </div>
          <div className="plan feat-plan">
            <div className="plan-badge">MÁS POPULAR</div>
            <div className="plan-name">Por contrato</div>
            <div className="plan-price">$3.50 <span>USD / doc</span></div>
            <p className="plan-desc">Pagás solo cuando generás. Sin suscripción.</p>
            <ul className="plan-features">
              <li>Contrato completo en PDF</li>
              <li>Firma digital incluida</li>
              <li>Válido legalmente en Argentina</li>
              <li>Audit trail y certificado</li>
            </ul>
            <Link href="/generar" className="plan-cta cta-gold">Generar contrato →</Link>
          </div>
          <div className="plan">
            <div className="plan-name">Pro</div>
            <div className="plan-price">$12 <span>USD / mes</span></div>
            <p className="plan-desc">Para freelancers con múltiples clientes.</p>
            <ul className="plan-features">
              <li>Contratos ilimitados</li>
              <li>Hasta 15 firmas digitales/mes</li>
              <li>Historial de contratos</li>
              <li>Todos los rubros</li>
            </ul>
            <Link href="/generar" className="plan-cta cta-light">Suscribirme al Pro</Link>
          </div>
        </div>
      </section>

      <section id="faq">
        <div className="sec-hdr">
          <div className="sec-eye">FAQ</div>
          <h2 className="sec-title">Preguntas frecuentes</h2>
        </div>
        <div className="faq-list">
          {[
            ['¿El contrato tiene validez legal en Argentina?', 'Sí. Los contratos de prestación de servicios entre privados tienen validez legal conforme al Código Civil y Comercial argentino. Para casos complejos o montos muy altos, recomendamos consultar con un abogado.'],
            ['¿Necesito tarjeta de crédito para el plan gratuito?', 'No. Podés generar tu primer contrato sin registrar ningún método de pago.'],
            ['¿Qué es la firma digital y tiene validez legal?', 'La firma electrónica tiene validez legal en Argentina bajo la Ley 25.506. Ambas partes reciben un link para firmar desde cualquier dispositivo, y el sistema genera un certificado con fecha, hora e IP de cada firma.'],
            ['¿Puedo cancelar el plan Pro cuando quiera?', 'Sí, sin penalidades. Cancelás desde tu cuenta y no se te cobra el mes siguiente.'],
            ['¿Funciona para servicios en el exterior?', 'Sí. El plan Por Contrato y Pro permiten generar contratos para clientes internacionales, con cláusulas sobre moneda extranjera y jurisdicción aplicable.'],
          ].map(([q, a]) => (
            <div className="faq-item" key={q}>
              <button className="faq-q">{q}</button>
              <div className="faq-a">{a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-final">
        <h2>¿Cuánto te salió el último <em>impago?</em></h2>
        <p>Un contrato no te garantiza cobrar siempre, pero sí te da el respaldo para reclamar. Generá el tuyo ahora, gratis.</p>
        <Link href="/generar" className="btn btn-gold btn-lg">Generá tu primer contrato gratis →</Link>
      </section>

      <footer>
        <div className="foot-logo">Contrato<span>Ya</span>.app</div>
        <p>© 2026 ContratoYa. Hecho para freelancers argentinos.</p>
        <div className="foot-links">
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
          <a href="#">Contacto</a>
        </div>
      </footer>
    </>
  );
}