import { useState, useRef, useEffect } from "react";
import { redirectToCheckout } from "./stripe";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #0f0e0d; --cream: #f5f0e8; --sand: #e8dfc8;
    --gold: #c9a84c; --gold-light: #e8cc7a; --warm-gray: #8a8070; --white: #fdfaf5;
  }
  body { background: var(--cream); font-family: 'DM Sans', sans-serif; color: var(--ink); }
  .app { min-height: 100vh; background: var(--cream); background-image: radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 50%); }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 3rem; border-bottom: 1px solid rgba(201,168,76,0.2); background: rgba(245,240,232,0.9); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 100; flex-wrap: wrap; gap: .75rem; }
  .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; letter-spacing: 0.05em; color: var(--ink); }
  .nav-logo span { color: var(--gold); }
  .nav-right { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
  .nav-tab { padding: 0.5rem 1.25rem; border-radius: 2rem; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500; background: transparent; color: var(--warm-gray); transition: all 0.2s; }
  .nav-tab.active { background: var(--ink); color: var(--cream); }
  .nav-tab:hover:not(.active) { background: var(--sand); color: var(--ink); }
  .nav-plan-badge { font-size: 0.7rem; padding: 0.28rem 0.75rem; border-radius: 2rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }
  .nav-plan-badge.basic { background: var(--sand); color: var(--warm-gray); }
  .nav-plan-badge.premium { background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: var(--ink); }
  .hero { text-align: center; padding: 5rem 2rem 3rem; max-width: 700px; margin: 0 auto; }
  .hero-eyebrow { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); font-weight: 500; margin-bottom: 1.5rem; }
  .hero h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.8rem, 6vw, 4.5rem); font-weight: 300; line-height: 1.1; color: var(--ink); margin-bottom: 1.5rem; }
  .hero h1 em { font-style: italic; color: var(--gold); }
  .hero p { font-size: 1.05rem; color: var(--warm-gray); line-height: 1.7; max-width: 480px; margin: 0 auto 2.5rem; }
  .card { background: var(--white); border: 1px solid rgba(201,168,76,0.2); border-radius: 1.5rem; padding: 2.5rem; box-shadow: 0 4px 40px rgba(15,14,13,0.06); max-width: 680px; margin: 0 auto 2rem; }
  .card-title { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 600; margin-bottom: 0.4rem; }
  .card-subtitle { font-size: 0.9rem; color: var(--warm-gray); margin-bottom: 2rem; }
  .field { margin-bottom: 1.75rem; }
  .field label { display: block; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 0.6rem; }
  .field input, .field select { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--sand); border-radius: 0.75rem; background: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 0.95rem; color: var(--ink); outline: none; transition: border-color 0.2s; }
  .field input:focus, .field select:focus { border-color: var(--gold); }
  .chip-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .chip { padding: 0.5rem 1rem; border-radius: 2rem; border: 1.5px solid var(--sand); background: transparent; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; color: var(--ink); }
  .chip.selected { background: var(--ink); border-color: var(--ink); color: var(--cream); }
  .chip:hover:not(.selected) { border-color: var(--gold); color: var(--gold); }
  .slider-row { display: flex; align-items: center; gap: 1rem; }
  .slider-label { font-size: 0.8rem; color: var(--warm-gray); min-width: 80px; }
  .slider-label.right { text-align: right; }
  input[type=range] { flex: 1; accent-color: var(--gold); height: 4px; }
  .btn-primary { width: 100%; padding: 1rem; border-radius: 0.75rem; border: none; background: var(--ink); color: var(--cream); font-size: 1rem; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em; }
  .btn-primary:hover { background: #2a2520; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(15,14,13,0.15); }
  .btn-primary:disabled { background: var(--sand); color: var(--warm-gray); cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-gold { padding: 0.65rem 1.5rem; border-radius: 2rem; border: 1.5px solid var(--gold); background: transparent; color: var(--gold); font-size: 0.85rem; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-gold:hover { background: var(--gold); color: var(--white); }
  .btn-ghost { padding: 0.65rem 1.5rem; border-radius: 2rem; border: 1.5px solid var(--sand); background: transparent; color: var(--warm-gray); font-size: 0.85rem; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-ghost:hover { border-color: var(--warm-gray); color: var(--ink); }
  .steps { display: flex; align-items: center; gap: 0.5rem; justify-content: center; margin-bottom: 2.5rem; }
  .step-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--sand); transition: all 0.3s; }
  .step-dot.active { background: var(--gold); width: 24px; border-radius: 4px; }
  .step-dot.done { background: var(--ink); }
  .streaming-card { background: var(--white); border: 1px solid rgba(201,168,76,0.2); border-radius: 1.5rem; padding: 2.5rem; max-width: 680px; margin: 0 auto; box-shadow: 0 4px 40px rgba(15,14,13,0.06); }
  .stream-text { font-size: 0.95rem; line-height: 1.8; color: var(--ink); white-space: pre-wrap; min-height: 200px; }
  .cursor { display: inline-block; width: 2px; height: 1em; background: var(--gold); margin-left: 2px; animation: blink 0.8s steps(1) infinite; vertical-align: middle; }
  @keyframes blink { 50% { opacity: 0; } }
  .loading-bar { height: 2px; background: var(--sand); border-radius: 1px; overflow: hidden; margin-bottom: 1.5rem; }
  .loading-bar-fill { height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-light)); border-radius: 1px; animation: load 2.5s ease-in-out infinite; }
  @keyframes load { 0%{width:0%} 70%{width:85%} 100%{width:95%} }
  .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; max-width: 960px; margin: 0 auto 3rem; padding: 0 1.5rem; }
  .trip-card { background: var(--white); border: 1px solid rgba(201,168,76,0.15); border-radius: 1.25rem; overflow: hidden; cursor: pointer; transition: all 0.25s; box-shadow: 0 2px 16px rgba(15,14,13,0.04); }
  .trip-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(15,14,13,0.1); border-color: var(--gold); }
  .trip-card-img { height: 130px; display: flex; align-items: center; justify-content: center; font-size: 3.2rem; background: var(--sand); position: relative; }
  .trip-card-body { padding: 1.25rem; }
  .trip-card-dest { font-size: 0.7rem; color: var(--gold); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; margin-bottom: 0.3rem; }
  .trip-card-title { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 600; margin-bottom: 0.4rem; }
  .trip-card-meta { font-size: 0.8rem; color: var(--warm-gray); }
  .trip-card-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.75rem; }
  .tag { font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 1rem; background: var(--cream); color: var(--warm-gray); border: 1px solid var(--sand); }
  .premium-tag { background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: var(--ink); border: none; font-weight: 700; }
  .lock-overlay { position: absolute; inset: 0; background: rgba(15,14,13,0.35); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
  .gen-card { background: var(--white); border: 1px solid rgba(201,168,76,0.2); border-radius: 1.5rem; padding: 2rem 2.5rem; max-width: 680px; margin: 0 auto 2rem; box-shadow: 0 4px 40px rgba(15,14,13,0.06); }
  .gen-row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .gen-field { flex: 1; min-width: 180px; }
  .gen-field label { display: block; font-size: 0.75rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--warm-gray); margin-bottom: 0.5rem; }
  .gen-field input, .gen-field select { width: 100%; padding: 0.65rem 0.9rem; border: 1px solid var(--sand); border-radius: 0.65rem; background: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: var(--ink); outline: none; transition: border-color 0.2s; }
  .gen-field input:focus, .gen-field select:focus { border-color: var(--gold); }
  .usage-bar-track { height: 6px; background: var(--sand); border-radius: 3px; margin: 0.5rem 0; }
  .usage-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
  .usage-ok { background: var(--gold); }
  .usage-full { background: #c0392b; }
  .modal-backdrop { position: fixed; inset: 0; background: rgba(15,14,13,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
  .modal { background: var(--white); border-radius: 2rem; padding: 2.5rem; max-width: 520px; width: 100%; box-shadow: 0 24px 80px rgba(15,14,13,0.2); }
  .modal-close { float: right; background: none; border: none; cursor: pointer; color: var(--warm-gray); font-size: 1.3rem; margin-top: -0.5rem; line-height: 1; }
  .pricing-wrap { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 4rem; }
  .pricing-header { text-align: center; margin-bottom: 3rem; }
  .pricing-header h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem,4vw,3rem); font-weight: 300; margin-bottom: 0.75rem; }
  .pricing-header h2 em { font-style: italic; color: var(--gold); }
  .pricing-header p { color: var(--warm-gray); font-size: 1rem; }
  .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }
  @media(max-width:580px){ .pricing-grid{grid-template-columns:1fr} }
  .pricing-card { background: var(--white); border: 1.5px solid rgba(201,168,76,0.2); border-radius: 1.75rem; padding: 2.25rem; position: relative; transition: box-shadow 0.2s; }
  .pricing-card:hover { box-shadow: 0 12px 48px rgba(15,14,13,0.08); }
  .pricing-card.featured { border-color: var(--gold); background: var(--ink); color: var(--cream); }
  .popular-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: var(--ink); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.28rem 1rem; border-radius: 2rem; white-space: nowrap; }
  .pricing-tier { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; font-weight: 600; color: var(--gold); margin-bottom: 1rem; }
  .pricing-card.featured .pricing-tier { color: var(--gold-light); }
  .pricing-price { font-family: 'Cormorant Garamond', serif; font-size: 3.5rem; font-weight: 600; line-height: 1; margin-bottom: 0.25rem; }
  .pricing-price sup { font-size: 1.5rem; vertical-align: super; }
  .pricing-price-sub { font-size: 0.85rem; color: var(--warm-gray); margin-bottom: 1.75rem; }
  .pricing-card.featured .pricing-price-sub { color: rgba(245,240,232,0.45); }
  .p-divider { height: 1px; background: rgba(201,168,76,0.15); margin: 1.5rem 0; }
  .pricing-card.featured .p-divider { background: rgba(245,240,232,0.1); }
  .pricing-features { list-style: none; margin-bottom: 2rem; }
  .pricing-feature-item { display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.88rem; margin-bottom: 0.75rem; line-height: 1.4; }
  .feat-icon { color: var(--gold); flex-shrink: 0; margin-top: 0.05rem; }
  .pricing-card.featured .feat-icon { color: var(--gold-light); }
  .feat-muted { color: var(--warm-gray); }
  .btn-p { width: 100%; padding: 0.9rem; border-radius: 0.75rem; border: none; font-size: 0.95rem; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.2s; }
  .btn-p.dark { background: var(--ink); color: var(--cream); }
  .btn-p.dark:hover { background: #2a2520; transform: translateY(-1px); }
  .btn-p.gold-grad { background: linear-gradient(135deg, var(--gold), var(--gold-light)); color: var(--ink); }
  .btn-p.gold-grad:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(201,168,76,0.35); }
  .btn-p.outline { background: transparent; border: 1.5px solid rgba(245,240,232,0.3); color: var(--cream); }
  .btn-p:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }
  .current-plan-note { text-align: center; font-size: 0.78rem; color: var(--warm-gray); margin-top: 0.65rem; }
  .pricing-card.featured .current-plan-note { color: rgba(245,240,232,0.4); }
  .compare-wrap { overflow-x: auto; }
  .compare-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .compare-table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--warm-gray); border-bottom: 1px solid var(--sand); }
  .compare-table th:not(:first-child) { text-align: center; }
  .compare-table td { padding: 0.85rem 1rem; border-bottom: 1px solid rgba(232,223,200,0.5); color: var(--ink); }
  .compare-table td:not(:first-child) { text-align: center; }
  .compare-table tr:last-child td { border-bottom: none; }
  .c-check { color: var(--gold); }
  .c-cross { color: var(--sand); }
  .col-prem { background: rgba(201,168,76,0.05); }
  .guarantee { text-align: center; padding: 2rem; background: var(--white); border: 1px solid var(--sand); border-radius: 1.25rem; margin-top: 2rem; }
  .guarantee h4 { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; margin-bottom: 0.4rem; }
  .guarantee p { font-size: 0.85rem; color: var(--warm-gray); max-width: 380px; margin: 0 auto; line-height: 1.6; }
  .saved-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; max-width: 960px; margin: 0 auto 3rem; padding: 0 1.5rem; }
  .saved-card { background: var(--white); border: 1px solid rgba(201,168,76,0.15); border-radius: 1.25rem; padding: 1.5rem; cursor: pointer; transition: all 0.25s; box-shadow: 0 2px 16px rgba(15,14,13,0.04); }
  .saved-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(15,14,13,0.1); border-color: var(--gold); }
  .saved-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
  .saved-card-dest { font-size: 0.7rem; color: var(--gold); letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; margin-bottom: 0.3rem; }
  .saved-card-title { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-weight: 600; line-height: 1.3; }
  .saved-card-meta { font-size: 0.78rem; color: var(--warm-gray); margin-top: 0.5rem; }
  .saved-card-preview { font-size: 0.82rem; color: var(--warm-gray); line-height: 1.6; margin-top: 0.75rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .saved-card-actions { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
  .delete-btn { padding: 0.35rem 0.75rem; border-radius: 2rem; border: 1px solid var(--sand); background: transparent; color: var(--warm-gray); font-size: 0.75rem; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .delete-btn:hover { border-color: #c0392b; color: #c0392b; }
  .empty-state { text-align: center; padding: 4rem 2rem; max-width: 400px; margin: 0 auto; }
  .empty-state-icon { font-size: 3rem; margin-bottom: 1rem; }
  .empty-state h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; }
  .empty-state p { font-size: 0.9rem; color: var(--warm-gray); line-height: 1.6; margin-bottom: 1.5rem; }
  .itinerary-modal { position: fixed; inset: 0; background: rgba(15,14,13,0.7); backdrop-filter: blur(4px); z-index: 300; display: flex; align-items: flex-start; justify-content: center; padding: 2rem 1rem; overflow-y: auto; }
  .itinerary-modal-content { background: var(--white); border-radius: 1.5rem; padding: 2.5rem; max-width: 680px; width: 100%; box-shadow: 0 24px 80px rgba(15,14,13,0.2); margin: auto; }
  .itinerary-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--sand); }
  .itinerary-modal-text { font-size: 0.95rem; line-height: 1.8; color: var(--ink); white-space: pre-wrap; }
  .itinerary-modal-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--sand); }
  .booking-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--sand); }
  .booking-title { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 0.9rem; }
  .booking-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.6rem; }
  .booking-link { display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid var(--sand); background: var(--cream); text-decoration: none; color: var(--ink); font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
  .booking-link:hover { border-color: var(--gold); background: var(--white); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(201,168,76,0.15); }
  .booking-link-icon { font-size: 1.1rem; }
  .booking-disclaimer { font-size: 0.7rem; color: var(--warm-gray); margin-top: 0.75rem; font-style: italic; }
  .refine-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--sand); }
  .refine-title { font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: 0.5rem; }
  .refine-hint { font-size: 0.8rem; color: var(--warm-gray); margin-bottom: 0.75rem; line-height: 1.5; }
  .refine-row { display: flex; gap: 0.6rem; }
  .refine-row input { flex: 1; padding: 0.7rem 1rem; border: 1px solid var(--sand); border-radius: 0.65rem; background: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: var(--ink); outline: none; transition: border-color 0.2s; }
  .refine-row input:focus { border-color: var(--gold); }
  .refine-row button { padding: 0.7rem 1.4rem; border-radius: 0.65rem; border: none; background: var(--ink); color: var(--cream); font-size: 0.85rem; font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .refine-row button:hover:not(:disabled) { background: #2a2520; }
  .refine-row button:disabled { background: var(--sand); color: var(--warm-gray); cursor: not-allowed; }
  .refine-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.6rem; }
  .refine-chip { font-size: 0.75rem; padding: 0.3rem 0.75rem; border-radius: 1rem; border: 1px solid var(--sand); background: transparent; color: var(--warm-gray); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
  .refine-chip:hover { border-color: var(--gold); color: var(--gold); }
  @media(max-width:600px){ .nav{padding:1rem 1.25rem} .card,.streaming-card,.gen-card{padding:1.5rem;border-radius:1.25rem} .hero{padding:3rem 1.25rem 2rem} .modal{padding:2rem 1.5rem;border-radius:1.5rem} .itinerary-modal-content{padding:1.5rem} }
`;

const SAMPLE_TRIPS = [
  { emoji:"🇵🇹", dest:"Lisbon, Portugal",   title:"Golden Hour in Lisbon",      days:"5 days", tags:["Food","Walkable","Culture"],       meta:"April–June",  premium:false },
  { emoji:"🇯🇵", dest:"Kyoto, Japan",        title:"Temples & Kaiseki",          days:"7 days", tags:["Culture","Cuisine","Hidden Gems"], meta:"March–April", premium:false },
  { emoji:"🇲🇽", dest:"Oaxaca, Mexico",      title:"Mezcal & Markets",           days:"4 days", tags:["Food","Art","Local"],              meta:"Oct–Nov",     premium:false },
  { emoji:"🇮🇹", dest:"Bologna, Italy",      title:"Italy's Best Kept Secret",   days:"4 days", tags:["Food","Architecture","Walkable"],  meta:"May–June",    premium:true  },
  { emoji:"🇲🇦", dest:"Marrakech, Morocco",  title:"Medina & Mountains",         days:"5 days", tags:["Culture","Adventure","Food"],      meta:"March–May",   premium:true  },
  { emoji:"🇺🇾", dest:"Montevideo, Uruguay", title:"The Anti-Buenos Aires",      days:"4 days", tags:["Food","Local","Walkable"],         meta:"Dec–Feb",     premium:true  },
  { emoji:"🇬🇷", dest:"Athens, Greece",      title:"Beyond the Parthenon",       days:"5 days", tags:["Culture","Food","History"],        meta:"April–May",   premium:true  },
  { emoji:"🇹🇼", dest:"Taipei, Taiwan",      title:"Night Markets & Mountains",  days:"6 days", tags:["Food","Nature","City"],            meta:"Oct–Dec",     premium:true  },
];

const BASIC_LIMIT = 3;
const STORAGE_KEY = "pwv_saved_itineraries";
const PROFILE_KEY = "pwv_profile";

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveSaved(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}
function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveProfile(profile) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
}

const DEFAULT_PROFILE = { name:"", airport:"", budget:"2000-5000", styles:[], tripLength:"4-6", pace:50, crowds:30 };

export default function App() {
  const savedProfile = loadProfile();
  const [tab, setTab]                     = useState(savedProfile ? "dashboard" : "onboard");
  const [step, setStep]                   = useState(0);
  const [profile, setProfile]             = useState(savedProfile || DEFAULT_PROFILE);
  const [plan, setPlan]                   = useState("basic");
  const [usageCount, setUsageCount]       = useState(0);
  const [generating, setGenerating]       = useState(false);
  const [streamText, setStreamText]       = useState("");
  const [done, setDone]                   = useState(false);
  const [destination, setDestination]     = useState("");
  const [tripDays, setTripDays]           = useState("5");
  const [travelDate, setTravelDate]       = useState("");
  const [arrivalAirport, setArrivalAirport] = useState("");
  const [departureAirport, setDepartureAirport] = useState("");
  const [tripType, setTripType]           = useState("couples");
  const [multiMode, setMultiMode]           = useState(false);
  const [legs, setLegs]                     = useState([{ dest:"", days:"3" }, { dest:"", days:"3" }]);
  const [travelStyle, setTravelStyle]     = useState("food and culture");
  const [onboarded, setOnboarded]         = useState(!!savedProfile);
  const [showPaywall, setShowPaywall]     = useState(false);
  const [paywallReason, setPaywallReason] = useState("limit");
  const [savedTrips, setSavedTrips]       = useState(loadSaved);
  const [viewingTrip, setViewingTrip]     = useState(null);
  const [refineInput, setRefineInput]     = useState("");
  const [refining, setRefining]           = useState(false);
  const [savedTripId, setSavedTripId]     = useState(null);
  const [modalRefineInput, setModalRefineInput] = useState("");
  const [modalRefining, setModalRefining] = useState(false);
  const streamRef = useRef(null);

  const styleOptions = ["Food-Focused","Cultural","Adventure","Walkable Cities","Hidden Gems","Romantic","Art & Design","Nature","Beach","Active"];
  const isPremium = plan === "premium";
  const atLimit   = !isPremium && usageCount >= BASIC_LIMIT;

  useEffect(() => { saveSaved(savedTrips); }, [savedTrips]);
  useEffect(() => { if (onboarded) saveProfile(profile); }, [profile, onboarded]);

  // Check for successful upgrade from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      setPlan("premium");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  function addLeg() { setLegs(l => [...l, { dest:"", days:"3" }]); }
  function removeLeg(i) { setLegs(l => l.filter((_,idx) => idx !== i)); }
  function updateLeg(i, field, val) { setLegs(l => l.map((leg, idx) => idx === i ? { ...leg, [field]: val } : leg)); }
  const totalMultiDays = legs.reduce((sum, l) => sum + (parseInt(l.days,10) || 0), 0);

  function toggleStyle(s) {
    setProfile(p => ({ ...p, styles: p.styles.includes(s) ? p.styles.filter(x => x !== s) : [...p.styles, s] }));
  }

  function handleTripClick(trip) {
    if (trip.premium && !isPremium) { setPaywallReason("destination"); setShowPaywall(true); return; }
    setDestination(trip.dest); setTab("generate"); setStreamText(""); setDone(false);
  }

  function handleGenerateClick() {
    if (atLimit) { setPaywallReason("limit"); setShowPaywall(true); return; }
    generateItinerary();
  }

  function upgradeToPremium() {
    redirectToCheckout(process.env.REACT_APP_STRIPE_PREMIUM_PRICE_ID);
  }

  function saveItinerary(text, dest, days, style, tDate, arrival, departure, tType) {
    const trip = {
      id: Date.now(),
      destination: dest,
      days,
      style,
      text,
      travelDate: tDate || "",
      arrivalAirport: arrival || "",
      departureAirport: departure || "",
      tripType: tType || "couples",
      date: new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
      title: dest,
    };
    setSavedTrips(prev => [trip, ...prev]);
    return trip.id;
  }

  function deleteTrip(id) {
    setSavedTrips(prev => prev.filter(t => t.id !== id));
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  function formatItineraryHTML(text) {
    const lines = text.split("\n");
    let html = "";
    let inList = false;
    let titleUsed = false;
    for (let raw of lines) {
      const line = raw.trim();
      if (line === "") {
        if (inList) { html += "</ul>"; inList = false; }
        continue;
      }
      const headerMatch = line.match(/^\*\*(.+?)\*\*\s*(.*)$/);
      const italicMatch = line.match(/^\*(.+)\*$/);
      const bulletMatch = line.match(/^[•-]\s*(.+)$/);

      if (headerMatch) {
        if (inList) { html += "</ul>"; inList = false; }
        const headerText = headerMatch[1];
        const extra = headerMatch[2] || "";
        if (!titleUsed) {
          html += `<h1 class="pdf-title">${escapeHtml(headerText)}</h1>`;
          titleUsed = true;
        } else {
          html += `<h2 class="pdf-section">${escapeHtml(headerText)}${extra ? ` <span class="pdf-section-extra">${escapeHtml(extra)}</span>` : ""}</h2>`;
        }
      } else if (italicMatch) {
        html += `<p class="pdf-tagline">${escapeHtml(italicMatch[1])}</p>`;
      } else if (bulletMatch) {
        if (!inList) { html += "<ul class='pdf-list'>"; inList = true; }
        const item = bulletMatch[1];
        const dashIdx = item.indexOf(" — ");
        if (dashIdx > -1) {
          const lead = item.slice(0, dashIdx);
          const rest = item.slice(dashIdx + 3);
          html += `<li><strong>${escapeHtml(lead)}</strong> — ${escapeHtml(rest)}</li>`;
        } else {
          html += `<li>${escapeHtml(item)}</li>`;
        }
      } else {
        html += `<p class="pdf-body">${escapeHtml(line)}</p>`;
      }
    }
    if (inList) html += "</ul>";
    return html;
  }

  function downloadPDF(trip) {
    if (!trip || !trip.text) {
      alert("This itinerary couldn't be loaded for PDF export. Please try generating it again.");
      return;
    }
    const bodyHtml = formatItineraryHTML(trip.text);
    const tripTypeLabels = { couples:"Couples Trip", girls:"Girls' Trip", guys:"Guys' Trip", family:"Family Trip", solo:"Solo Trip" };

    const metaItems = [];
    metaItems.push(`<div><span class="meta-label">Destination</span><span class="meta-value">${escapeHtml(trip.destination || "")}</span></div>`);
    if (trip.days) metaItems.push(`<div><span class="meta-label">Duration</span><span class="meta-value">${escapeHtml(String(trip.days))} days</span></div>`);
    if (trip.travelDate) {
      const start = new Date(trip.travelDate + "T00:00:00");
      const end = new Date(start);
      end.setDate(end.getDate() + (parseInt(trip.days,10) || 0));
      const fmt = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
      metaItems.push(`<div><span class="meta-label">Travel Dates</span><span class="meta-value">${fmt(start)} – ${fmt(end)}</span></div>`);
    }
    if (trip.arrivalAirport) metaItems.push(`<div><span class="meta-label">Arrival</span><span class="meta-value">${escapeHtml(trip.arrivalAirport)}</span></div>`);
    if (trip.departureAirport) metaItems.push(`<div><span class="meta-label">Departure</span><span class="meta-value">${escapeHtml(trip.departureAirport)}</span></div>`);
    if (trip.style) metaItems.push(`<div><span class="meta-label">Focus</span><span class="meta-value">${escapeHtml(trip.style)}</span></div>`);
    if (trip.tripType && tripTypeLabels[trip.tripType]) metaItems.push(`<div><span class="meta-label">Trip Type</span><span class="meta-value">${tripTypeLabels[trip.tripType]}</span></div>`);

    const docHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(trip.destination || "Itinerary")} — PlanWithVoyage</title>
<style>
  @page { margin: 0.85in; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #0f0e0d; margin:0; padding:0; line-height:1.6; }
  .pdf-header { display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #c9a84c; padding-bottom: 14px; margin-bottom: 24px; }
  .pdf-brand { font-family: 'Helvetica Neue', Arial, sans-serif; letter-spacing: 0.18em; font-size: 13px; font-weight:700; color:#0f0e0d; text-transform:uppercase; }
  .pdf-brand span { color:#c9a84c; }
  .pdf-tag { font-family:'Helvetica Neue',Arial,sans-serif; font-size:10px; letter-spacing:0.15em; color:#8a8070; text-transform:uppercase; }
  .pdf-meta { display:flex; flex-wrap:wrap; gap:16px 28px; background:#f5f0e8; border:1px solid #e8dfc8; border-radius:10px; padding:14px 18px; margin-bottom:28px; }
  .pdf-meta > div { display:flex; flex-direction:column; }
  .meta-label { font-family:'Helvetica Neue',Arial,sans-serif; font-size:9px; letter-spacing:0.14em; text-transform:uppercase; color:#8a8070; margin-bottom:3px; }
  .meta-value { font-size:13px; font-weight:600; color:#0f0e0d; }
  .pdf-title { font-size:28px; font-weight:600; margin: 0 0 6px 0; color:#0f0e0d; }
  .pdf-tagline { font-style:italic; color:#8a8070; font-size:14px; margin: 0 0 22px 0; }
  .pdf-section { font-size:16px; font-weight:700; color:#0f0e0d; border-top:1px solid #e8dfc8; padding-top:14px; margin: 26px 0 10px 0; letter-spacing:0.02em; page-break-after: avoid; }
  .pdf-section-extra { font-size:11px; font-weight:400; color:#c9a84c; text-transform:uppercase; letter-spacing:0.1em; margin-left:8px; }
  .pdf-list { margin: 0 0 4px 0; padding-left: 22px; }
  .pdf-list li { font-size:13px; margin-bottom:8px; line-height:1.65; }
  .pdf-body { font-size:13px; margin: 4px 0 10px 0; }
  .pdf-footer { margin-top:40px; padding-top:14px; border-top:1px solid #e8dfc8; display:flex; justify-content:space-between; font-family:'Helvetica Neue',Arial,sans-serif; font-size:10px; color:#8a8070; letter-spacing:0.08em; text-transform:uppercase; }
</style>
</head>
<body>
  <div class="pdf-header">
    <div class="pdf-brand">PLAN WITH<span>VOYAGE</span></div>
    <div class="pdf-tag">Travel Itinerary</div>
  </div>
  <div class="pdf-meta">
    ${metaItems.join("\n")}
  </div>
  ${bodyHtml}
  <div class="pdf-footer">
    <span>planwithvoyage.com</span>
    <span>Curated by your AI travel concierge</span>
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups for planwithvoyage.com to download your PDF.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(docHtml);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }

  async function generateItinerary() {
    if (multiMode) {
      if (legs.some(l => !l.dest)) return;
    } else {
      if (!destination) return;
    }
    setGenerating(true); setStreamText(""); setDone(false);
    setUsageCount(c => c + 1);

    const dateContext = travelDate
      ? `The traveler plans to visit starting ${new Date(travelDate + "T00:00:00").toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}. Tailor the itinerary to this specific time of year — mention relevant weather, seasonal events, festivals, or holidays happening around this date, and note if this is peak or off-peak season for booking.`
      : `No specific dates given — include general best-time-to-visit guidance.`;

    const arrivalContext = arrivalAirport
      ? `CRITICAL: The traveler is flying into ${arrivalAirport}. Build the ENTIRE itinerary around this specific arrival point — routing, day order, and neighborhood/town recommendations must make sense starting from ${arrivalAirport}, not from any other airport or city in the region. Do not default to a different "main" airport or capital city if it doesn't match this arrival point.`
      : `No arrival airport specified — use the most logical/common entry point for this destination and mention it clearly.`;

    const departureContext = departureAirport
      ? `The traveler will depart for home from ${departureAirport} (which may be different from their arrival airport — this is an "open-jaw" trip). On the final day, route the itinerary so it realistically ends near ${departureAirport}, and mention this in the logistics section.`
      : "";

    const tripTypeContexts = {
      couples: "",
      girls: `This is a GIRLS' TRIP for a group of female friends. Emphasize: boutique spa days and wellness experiences, yoga or fitness classes, wine bars and rooftop cocktail spots, brunch spots with great photo opportunities, boutique shopping, and group-friendly dining (places good for sharing plates and lively conversation). Avoid overly romantic framing — focus on friendship, relaxation, and fun. When suggesting packing items, consider things relevant to spa/wellness days, photo-worthy outfits, and group activities.`,
      guys: `This is a GUYS' TRIP for a group of male friends. Emphasize: breweries, distilleries, and notable bars; sports viewing spots; golf, fishing, or active/adventure experiences where relevant to the destination; steakhouses and hearty local food; and any iconic "must-do" experiences for a group of friends. Keep the tone fun and high-energy. When suggesting packing items, consider gear relevant to any active/adventure plans.`,
      family: `This is a FAMILY TRIP that may include children. Emphasize: family-friendly activities and attractions, restaurants that welcome kids (with note on kid-friendly menu options), pacing that allows for rest/downtime, and practical tips for traveling with children (stroller-friendly areas, nap timing, etc.). When suggesting packing items, include family/kid-relevant essentials.`,
      solo: `This is a SOLO TRAVEL trip. Emphasize: safety-conscious recommendations, social opportunities (group tours, communal dining, social cafes), solo-friendly dining (counter seating, casual spots where dining alone feels natural), and experiences well-suited to a single traveler's pace and flexibility. When suggesting packing items, consider solo-travel practicalities (e.g. a doorstop alarm, portable charger for navigating alone).`,
    };
    const tripTypeContext = tripTypeContexts[tripType] || "";

    let prompt;
    if (multiMode) {
      const legSummary = legs.map((l,i) => `Leg ${i+1}: ${l.dest} (${l.days} days)`).join("\n");
      const totalDays = legs.reduce((sum,l) => sum + (parseInt(l.days,10)||0), 0);
      prompt = `You are a luxury travel concierge who creates curated, specific, insider-quality itineraries focused on food, walkability, and memorable experiences.
Create a detailed multi-destination itinerary for the following trip (${totalDays} days total) focused on ${travelStyle}:

${legSummary}

${dateContext}
${arrivalAirport ? arrivalContext : ""}
${departureContext}
${tripTypeContext}

For each destination leg, format it exactly like this:

**[Destination]: [Evocative Leg Title]** (Days X-Y)
*[One compelling sentence for this leg]*

**Day X — [Day Theme]**
• Morning (9:00 AM): [Activity] — [description with insider tip]
• Lunch (12:30 PM): [Restaurant] — [what to order, why it's special]
• Afternoon (2:30 PM): [Activity] — [description]
• Evening (7:00 PM): [Dinner restaurant] — [description]

[Repeat for each day of this leg]

**Getting to the next destination** (if not last leg)
• [Best way to travel between destinations — train, flight, car — with specific tips]

[Repeat format for each leg]

**Multi-Destination Insider Tips**
• [3 tips specific to traveling between these destinations]

**Overall Logistics**
• Total budget estimate: [per person excluding flights]
• Best way to book connecting transport: [advice]

Be specific — real restaurants, real transport options, real neighborhoods. No generic advice.`;
    } else {
      prompt = `You are a luxury travel concierge who creates curated, specific, insider-quality itineraries focused on food, walkability, and memorable experiences.
Create a detailed ${tripDays}-day itinerary for ${destination} focused on ${travelStyle}.
${dateContext}
${arrivalContext}
${departureContext}
${tripTypeContext}
Format it exactly like this:

**${destination}: [Evocative Trip Title]**
*[One compelling sentence that sells this trip]*

**Trip Overview**
[2-3 sentences: why this destination, why now, what makes this itinerary special]

**Day 1 — [Day Theme]**
• Morning (9:00 AM): [Activity] — [1-2 sentence description with insider tip]
• Lunch (12:30 PM): [Restaurant name] — [what to order, why it's special]
• Afternoon (2:30 PM): [Activity] — [description]
• Evening (7:00 PM): [Dinner restaurant] — [description, reservation notes]

[Continue for all ${tripDays} days in same format]

**Insider Tips**
• [3 specific, non-obvious tips]

**Logistics**
• Best time to book flights: [advice]
• Neighborhood to stay: [specific area and why]
• Budget estimate: [per-person for ${tripDays} days excluding flights]

Be specific — real restaurants, real neighborhoods, real experiences. No generic advice.`;
    }

    const saveDestination = multiMode ? legs.map(l => l.dest).join(" → ") : destination;
    const saveDays = multiMode ? String(totalMultiDays) : tripDays;

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await resp.json();
      if (data.text) {
        setStreamText(data.text);
        const newId = saveItinerary(data.text, saveDestination, saveDays, travelStyle, travelDate, arrivalAirport, departureAirport, tripType);
        setSavedTripId(newId);
        setRefineInput("");
      } else {
        setStreamText("Something went wrong. Please try again.");
      }
    } catch {
      setStreamText("Unable to reach the AI. Please try again.");
    }
    setGenerating(false); setDone(true);
  }

  async function refineItinerary() {
    if (!refineInput.trim() || !streamText) return;
    setRefining(true);

    const prompt = `Here is an existing travel itinerary:

${streamText}

The traveler has requested this change: "${refineInput.trim()}"

Update the itinerary to incorporate this request. Keep the same overall format and structure (headers with **, bullet points with •, day-by-day breakdown). Make only the changes needed to satisfy the request — keep everything else as similar as possible to the original. If the request is to add a packing list or travel essentials, append a new "**Packing & Travel Essentials**" section at the end with bullet points covering: specific packing items tailored to the destination's season/weather/activities, local currency and card acceptance, plug type & voltage, tipping norms, and any relevant dress code notes. Return the FULL updated itinerary in the same format, not just the changed section.`;

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await resp.json();
      if (data.text) {
        setStreamText(data.text);
        if (savedTripId) {
          setSavedTrips(prev => prev.map(t => t.id === savedTripId ? { ...t, text: data.text } : t));
        }
        setRefineInput("");
      }
    } catch {
      // keep existing itinerary if refinement fails
    }
    setRefining(false);
  }

  async function refineSavedTrip(trip) {
    if (!modalRefineInput.trim()) return;
    setModalRefining(true);

    const prompt = `Here is an existing travel itinerary:

${trip.text}

The traveler has requested this change: "${modalRefineInput.trim()}"

Update the itinerary to incorporate this request. Keep the same overall format and structure (headers with **, bullet points with •, day-by-day breakdown). Make only the changes needed to satisfy the request — keep everything else as similar as possible to the original. If the request is to add a packing list or travel essentials, append a new "**Packing & Travel Essentials**" section at the end with bullet points covering: specific packing items tailored to the destination's season/weather/activities, local currency and card acceptance, plug type & voltage, tipping norms, and any relevant dress code notes. Return the FULL updated itinerary in the same format, not just the changed section.`;

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await resp.json();
      if (data.text) {
        setSavedTrips(prev => prev.map(t => t.id === trip.id ? { ...t, text: data.text } : t));
        setViewingTrip(prev => prev ? { ...prev, text: data.text } : prev);
        setModalRefineInput("");
      }
    } catch {
      // keep existing itinerary if refinement fails
    }
    setModalRefining(false);
  }

  // Booking links — uses generic search URLs now, swap in affiliate IDs once approved
  const BookingLinks = ({ dest, checkin, days }) => {
    const q = encodeURIComponent(dest);
    let hotelUrl = `https://www.booking.com/searchresults.html?ss=${q}`;
    let flightUrl = `https://www.google.com/travel/flights?q=Flights+to+${q}`;
    if (checkin) {
      const inDate = new Date(checkin + "T00:00:00");
      const outDate = new Date(inDate);
      outDate.setDate(outDate.getDate() + (parseInt(days, 10) || 5));
      const fmt = d => d.toISOString().slice(0,10);
      hotelUrl += `&checkin=${fmt(inDate)}&checkout=${fmt(outDate)}`;
      flightUrl += `+on+${fmt(inDate)}+through+${fmt(outDate)}`;
    }
    const links = [
      { icon: "🏨", label: "Find hotels", url: hotelUrl },
      { icon: "✈️", label: "Search flights", url: flightUrl },
      { icon: "🍽️", label: "Book restaurants", url: `https://www.opentable.com/s?term=${q}` },
      { icon: "🎟️", label: "Find experiences", url: `https://www.viator.com/searchResults/all?text=${q}` },
    ];
    return (
      <div className="booking-section">
        <div className="booking-title">✦ Book This Trip</div>
        <div className="booking-grid">
          {links.map(l => (
            <a key={l.label} className="booking-link" href={l.url} target="_blank" rel="noopener noreferrer">
              <span className="booking-link-icon">{l.icon}</span>
              <span>{l.label}</span>
            </a>
          ))}
        </div>
        <p className="booking-disclaimer">Opens trusted booking partners in a new tab. PlanWithVoyage may earn a commission on bookings made through these links — at no extra cost to you.</p>
      </div>
    );
  };

  const PaywallModal = () => (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowPaywall(false); }}>
      <div className="modal">
        <button className="modal-close" onClick={() => setShowPaywall(false)}>✕</button>
        <div style={{ textAlign:"center", marginBottom:"1.75rem" }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.75rem" }}>✦</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.75rem", fontWeight:600, marginBottom:"0.5rem", lineHeight:1.2 }}>
            {paywallReason === "limit" ? "You've used your 3 itineraries this month" : "Premium destination"}
          </div>
          <p style={{ color:"var(--warm-gray)", fontSize:"0.88rem", lineHeight:1.65, maxWidth:380, margin:"0 auto" }}>
            {paywallReason === "limit"
              ? "Basic members get 3 AI itineraries per month. Upgrade to Premium for unlimited trips, exclusive destinations, and PDF exports."
              : "This destination is part of our Premium collection — unlocks with a Premium plan."}
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.5rem" }}>
          <div style={{ background:"var(--cream)", borderRadius:"1rem", padding:"1.25rem", border:"1px solid var(--sand)" }}>
            <div style={{ fontSize:"0.68rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--warm-gray)", marginBottom:"0.4rem" }}>Basic</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:600 }}>
              $29<span style={{ fontSize:"0.95rem", color:"var(--warm-gray)" }}>/mo</span>
            </div>
            <ul style={{ listStyle:"none", marginTop:"0.65rem", fontSize:"0.82rem", color:"var(--warm-gray)", lineHeight:1.8 }}>
              <li>✓ 3 itineraries/month</li>
              <li>✓ Core destinations</li>
              <li style={{ color:"var(--sand)" }}>✗ Premium destinations</li>
              <li style={{ color:"var(--sand)" }}>✗ PDF export</li>
            </ul>
            <div style={{ marginTop:"0.75rem", fontSize:"0.78rem", color:"var(--warm-gray)", fontStyle:"italic", textAlign:"center" }}>Your current plan</div>
          </div>
          <div style={{ background:"var(--ink)", color:"var(--cream)", borderRadius:"1rem", padding:"1.25rem", position:"relative" }}>
            <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,var(--gold),var(--gold-light))", color:"var(--ink)", fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"0.25rem 0.8rem", borderRadius:"2rem", whiteSpace:"nowrap" }}>Most Popular</div>
            <div style={{ fontSize:"0.68rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--gold-light)", marginBottom:"0.4rem" }}>Premium</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:600 }}>
              $79<span style={{ fontSize:"0.95rem", color:"rgba(245,240,232,0.45)" }}>/mo</span>
            </div>
            <ul style={{ listStyle:"none", marginTop:"0.65rem", fontSize:"0.82rem", color:"rgba(245,240,232,0.8)", lineHeight:1.8 }}>
              <li>✓ Unlimited itineraries</li>
              <li>✓ All destinations</li>
              <li>✓ Premium destinations</li>
              <li>✓ PDF export</li>
            </ul>
          </div>
        </div>
        <button className="btn-p gold-grad" style={{ width:"100%", padding:"1rem", marginBottom:"0.75rem" }} onClick={upgradeToPremium}>
          ✦ Upgrade to Premium — $79/month
        </button>
        <button className="btn-ghost" style={{ width:"100%" }} onClick={() => setShowPaywall(false)}>Stay on Basic</button>
        <p style={{ textAlign:"center", fontSize:"0.75rem", color:"var(--warm-gray)", marginTop:"0.75rem" }}>Cancel anytime · 7-day money-back guarantee</p>
      </div>
    </div>
  );

  const ItineraryModal = ({ trip }) => (
    <div className="itinerary-modal" onClick={e => { if (e.target === e.currentTarget) setViewingTrip(null); }}>
      <div className="itinerary-modal-content">
        <div className="itinerary-modal-header">
          <div>
            <div style={{ fontSize:"0.7rem", color:"var(--gold)", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:600, marginBottom:"0.25rem" }}>{trip.destination}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.4rem", fontWeight:600 }}>{trip.days} days · {trip.date}</div>
          </div>
          <button className="modal-close" onClick={() => setViewingTrip(null)}>✕</button>
        </div>
        <div className="itinerary-modal-text">{trip.text}</div>
        <BookingLinks dest={trip.destination} checkin={trip.travelDate} days={trip.days} />
        <div className="itinerary-modal-actions">
          <button className="btn-gold" onClick={() => navigator.clipboard.writeText(trip.text)}>Copy</button>
          {isPremium
            ? <button className="btn-gold" onClick={() => downloadPDF(trip)}>↓ Download PDF</button>
            : <button className="btn-gold" onClick={() => { setViewingTrip(null); setPaywallReason("limit"); setShowPaywall(true); }}>↓ PDF (Premium)</button>
          }
          <button className="btn-ghost" onClick={() => setViewingTrip(null)}>Close</button>
        </div>
        {!modalRefining ? (
          <div className="refine-section">
            <div className="refine-title">✦ Refine This Itinerary</div>
            <div className="refine-hint">Want any changes? Tell us what to adjust and we'll update this saved trip.</div>
            <div className="refine-row">
              <input
                placeholder="e.g. 'swap day 2 dinner for something casual' or 'add a day trip'"
                value={modalRefineInput}
                onChange={e => setModalRefineInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !modalRefining) refineSavedTrip(trip); }}
              />
              <button onClick={() => refineSavedTrip(trip)} disabled={!modalRefineInput.trim() || modalRefining}>✦ Update</button>
            </div>
            <div className="refine-chips">
              {["Add packing list & travel essentials","Make it more budget-friendly","Add more local/hidden gems","Make the pace more relaxed","Add a day trip option"].map(s => (
                <button key={s} className="refine-chip" onClick={() => setModalRefineInput(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="refine-section">
            <div className="loading-bar"><div className="loading-bar-fill" /></div>
            <div style={{ color:"var(--warm-gray)", fontSize:"0.9rem", marginTop:"0.75rem" }}>✦ Updating your itinerary…</div>
          </div>
        )}
      </div>
    </div>
  );

  const PricingPage = () => (
    <div className="pricing-wrap">
      <div className="pricing-header">
        <div className="hero-eyebrow">✦ Simple, honest pricing</div>
        <h2>Choose your <em>travel style</em></h2>
        <p>Start with Basic or go unlimited with Premium. Cancel anytime.</p>
      </div>
      <div className="pricing-grid">
        <div className="pricing-card">
          <div className="pricing-tier">Basic</div>
          <div className="pricing-price"><sup>$</sup>29</div>
          <div className="pricing-price-sub">per month · billed monthly</div>
          <div className="p-divider" />
          <ul className="pricing-features">
            {[["3 AI itineraries per month",false],["Core destination library (25+ cities)",false],["Day-by-day plan with dining & activities",false],["Insider tips & logistics",false],["Saved itinerary library",false],["Premium destinations",true],["Unlimited itinerary generation",true],["PDF export",true],["Flight deal alerts",true]].map(([feat,muted],i) => (
              <li key={i} className="pricing-feature-item">
                <span className="feat-icon">{muted ? "○" : "✦"}</span>
                <span className={muted ? "feat-muted" : ""}>{feat}</span>
              </li>
            ))}
          </ul>
          {isPremium
            ? <button className="btn-p dark" onClick={() => setPlan("basic")}>Switch to Basic</button>
            : <><button className="btn-p dark" disabled>Current Plan</button><div className="current-plan-note">You're on Basic</div></>
          }
        </div>
        <div className="pricing-card featured">
          <div className="popular-badge">Most Popular</div>
          <div className="pricing-tier">Premium</div>
          <div className="pricing-price"><sup>$</sup>79</div>
          <div className="pricing-price-sub">per month · billed monthly</div>
          <div className="p-divider" />
          <ul className="pricing-features">
            {["Unlimited AI itineraries","Full destination library (50+ cities)","Premium & off-the-beaten-path destinations","Day-by-day plan with dining & activities","Insider tips & logistics","Saved itinerary library","PDF download & export","Flight deal alerts","Priority access to new destinations"].map((feat,i) => (
              <li key={i} className="pricing-feature-item">
                <span className="feat-icon">✦</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
          {isPremium
            ? <><button className="btn-p outline" disabled>Current Plan</button><div className="current-plan-note">You're on Premium ✦</div></>
            : <button className="btn-p gold-grad" onClick={upgradeToPremium}>Upgrade to Premium →</button>
          }
        </div>
      </div>
      <div className="card">
        <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.3rem", fontWeight:600, marginBottom:"0.25rem" }}>Full comparison</div>
        <div style={{ fontSize:"0.85rem", color:"var(--warm-gray)", marginBottom:"1.25rem" }}>Every feature, side by side</div>
        <div className="compare-wrap">
          <table className="compare-table">
            <thead><tr><th>Feature</th><th>Basic · $29</th><th className="col-prem">Premium · $79</th></tr></thead>
            <tbody>
              {[["Monthly itineraries","3","Unlimited"],["Core destinations (25+)","✦","✦"],["Premium destinations","✕","✦"],["Day-by-day planning","✦","✦"],["Dining recommendations","✦","✦"],["Insider tips & logistics","✦","✦"],["Saved itinerary library","✦","✦"],["PDF export","✕","✦"],["Weekly email drops","✕","✦"],["Flight deal alerts","✕","✦"],["Cancel anytime","✦","✦"]].map(([feat,basic,prem]) => (
                <tr key={feat}>
                  <td>{feat}</td>
                  <td><span className={basic==="✦"?"c-check":basic==="✕"?"c-cross":""}>{basic}</span></td>
                  <td className="col-prem"><span className={prem==="✦"?"c-check":prem==="✕"?"c-cross":""}>{prem}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="guarantee">
        <h4>7-day money-back guarantee</h4>
        <p>Try Premium risk-free. Not right for you in the first 7 days? Full refund, no questions asked.</p>
      </div>
    </div>
  );

  const SavedTripsPage = () => (
    <div>
      <div className="hero" style={{ paddingBottom:"1.5rem" }}>
        <div className="hero-eyebrow">✦ Your travel library</div>
        <h1 style={{ fontSize:"clamp(2rem,4vw,3rem)" }}>Saved<br /><em>itineraries</em></h1>
        <p>Every trip you generate is saved here automatically.</p>
      </div>
      {savedTrips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗺️</div>
          <h3>No saved trips yet</h3>
          <p>Generate your first itinerary and it will appear here automatically — ready to view, copy, or download anytime.</p>
          <button className="btn-gold" onClick={() => setTab("generate")}>✦ Generate your first trip</button>
        </div>
      ) : (
        <div className="saved-grid">
          {savedTrips.map(trip => (
            <div key={trip.id} className="saved-card">
              <div className="saved-card-header">
                <div>
                  <div className="saved-card-dest">{trip.destination}</div>
                  <div className="saved-card-title">{trip.days} days · {trip.style}</div>
                  {trip.travelDate && <div style={{ fontSize:"0.75rem", color:"var(--gold)", marginTop:"0.2rem", fontWeight:600 }}>✈ {new Date(trip.travelDate + "T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>}
                </div>
                <span style={{ fontSize:"0.75rem", color:"var(--warm-gray)" }}>{trip.date}</span>
              </div>
              <div className="saved-card-preview">{trip.text}</div>
              <div className="saved-card-actions">
                <button className="btn-gold" style={{ padding:"0.4rem 0.9rem", fontSize:"0.8rem" }} onClick={() => { setModalRefineInput(""); setViewingTrip(trip); }}>View</button>
                <button className="btn-gold" style={{ padding:"0.4rem 0.9rem", fontSize:"0.8rem" }} onClick={() => navigator.clipboard.writeText(trip.text)}>Copy</button>
                {isPremium
                  ? <button className="btn-gold" style={{ padding:"0.4rem 0.9rem", fontSize:"0.8rem" }} onClick={() => downloadPDF(trip)}>↓ PDF</button>
                  : <button className="btn-ghost" style={{ padding:"0.4rem 0.9rem", fontSize:"0.8rem" }} onClick={() => { setPaywallReason("limit"); setShowPaywall(true); }}>↓ PDF ✦</button>
                }
                <button className="delete-btn" onClick={() => deleteTrip(trip.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const onboardSteps = [
    <div key={0}>
      <div className="card-title">Welcome. Let's set up your profile.</div>
      <div className="card-subtitle">Takes 2 minutes — we use this to tailor every trip we send you.</div>
      <div className="field"><label>Your first name</label><input placeholder="e.g. Sarah" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
      <div className="field"><label>Home airport (IATA code)</label><input placeholder="e.g. TPA, JFK, LAX" value={profile.airport} onChange={e => setProfile(p => ({ ...p, airport: e.target.value.toUpperCase() }))} /></div>
      <button className="btn-primary" onClick={() => setStep(1)} disabled={!profile.name || !profile.airport}>Continue →</button>
    </div>,
    <div key={1}>
      <div className="card-title">Travel preferences</div>
      <div className="card-subtitle">Help us calibrate the right trips for you.</div>
      <div className="field"><label>Per-trip budget (per person, excl. flights)</label>
        <select value={profile.budget} onChange={e => setProfile(p => ({ ...p, budget: e.target.value }))}>
          <option value="1000-2000">$1,000 – $2,000</option>
          <option value="2000-5000">$2,000 – $5,000</option>
          <option value="5000-10000">$5,000 – $10,000</option>
          <option value="10000+">$10,000+</option>
        </select>
      </div>
      <div className="field"><label>Preferred trip length</label>
        <select value={profile.tripLength} onChange={e => setProfile(p => ({ ...p, tripLength: e.target.value }))}>
          <option value="3-4">Long weekend (3–4 days)</option>
          <option value="4-6">Sweet spot (4–6 days)</option>
          <option value="7-10">Full week (7–10 days)</option>
          <option value="10+">Extended (10+ days)</option>
        </select>
      </div>
      <button className="btn-primary" onClick={() => setStep(2)}>Continue →</button>
    </div>,
    <div key={2}>
      <div className="card-title">What do you love about travel?</div>
      <div className="card-subtitle">Select everything that resonates.</div>
      <div className="field"><div className="chip-group">{styleOptions.map(s => (<button key={s} className={`chip ${profile.styles.includes(s) ? "selected" : ""}`} onClick={() => toggleStyle(s)}>{s}</button>))}</div></div>
      <button className="btn-primary" onClick={() => setStep(3)} disabled={profile.styles.length === 0}>Continue →</button>
    </div>,
    <div key={3}>
      <div className="card-title">Fine-tune your vibe</div>
      <div className="card-subtitle">Slide to tell us your travel personality.</div>
      <div className="field"><label>Travel pace</label>
        <div className="slider-row"><span className="slider-label">Relaxed</span><input type="range" min={0} max={100} value={profile.pace} onChange={e => setProfile(p => ({ ...p, pace: +e.target.value }))} /><span className="slider-label right">Packed</span></div>
      </div>
      <div className="field"><label>Crowd tolerance</label>
        <div className="slider-row"><span className="slider-label">Off beaten path</span><input type="range" min={0} max={100} value={profile.crowds} onChange={e => setProfile(p => ({ ...p, crowds: +e.target.value }))} /><span className="slider-label right">Iconic</span></div>
      </div>
      <button className="btn-primary" onClick={() => { setOnboarded(true); setTab("dashboard"); }}>✦ Launch my travel profile</button>
    </div>,
  ];

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        {showPaywall && <PaywallModal />}
        {viewingTrip && <ItineraryModal trip={viewingTrip} />}
        <nav className="nav">
          <div className="nav-logo">Plan With<span>Voyage</span></div>
          <div className="nav-right">
            {!onboarded ? (
              <button className="nav-tab active">Setup</button>
            ) : (
              <>
                <button className={`nav-tab ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>Explore</button>
                <button className={`nav-tab ${tab === "generate" ? "active" : ""}`} onClick={() => setTab("generate")}>Generate</button>
                <button className={`nav-tab ${tab === "saved" ? "active" : ""}`} onClick={() => setTab("saved")}>
                  Saved {savedTrips.length > 0 && <span style={{ background:"var(--gold)", color:"var(--ink)", borderRadius:"2rem", fontSize:"0.65rem", padding:"0.1rem 0.45rem", marginLeft:"0.3rem", fontWeight:700 }}>{savedTrips.length}</span>}
                </button>
                <button className={`nav-tab ${tab === "pricing" ? "active" : ""}`} onClick={() => setTab("pricing")}>Pricing</button>
                <span className={`nav-plan-badge ${isPremium ? "premium" : "basic"}`}>{isPremium ? "✦ Premium" : "Basic"}</span>
              </>
            )}
          </div>
        </nav>

        {!onboarded && (
          <div>
            <div className="hero">
              <div className="hero-eyebrow">✦ Your AI Travel Concierge</div>
              <h1>Travel more.<br /><em>Plan less.</em></h1>
              <p>PlanWithVoyage automatically delivers curated, ready-to-book itineraries tailored to you — no research required.</p>
            </div>
            <div className="steps">{[0,1,2,3].map(i => (<div key={i} className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`} />))}</div>
            <div className="card">{onboardSteps[step]}</div>
          </div>
        )}

        {onboarded && tab === "dashboard" && (
          <div>
            <div className="hero" style={{ paddingBottom:"1.5rem" }}>
              <div className="hero-eyebrow">✦ Welcome back{profile.name ? `, ${profile.name}` : ""}</div>
              <h1 style={{ fontSize:"clamp(2rem,4vw,3rem)" }}>Your curated<br /><em>trip collection</em></h1>
              <p>Click any destination to generate a full AI itinerary.</p>
              <button className="btn-ghost" style={{ marginTop:"0.75rem" }} onClick={() => { setStep(0); setOnboarded(false); setTab("onboard"); }}>Edit profile</button>
            </div>
            {!isPremium && (
              <div style={{ maxWidth:680, margin:"0 auto 1.5rem", padding:"0 1.5rem" }}>
                <div style={{ background:"var(--white)", border:"1px solid var(--sand)", borderRadius:"1rem", padding:"1.25rem 1.5rem" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
                    <span style={{ fontSize:"0.8rem", fontWeight:500 }}>Monthly itineraries used</span>
                    <span style={{ fontSize:"0.8rem", color: atLimit ? "#c0392b" : "var(--warm-gray)" }}>{usageCount} / {BASIC_LIMIT}</span>
                  </div>
                  <div className="usage-bar-track"><div className={`usage-bar-fill ${atLimit ? "usage-full" : "usage-ok"}`} style={{ width:`${Math.min((usageCount/BASIC_LIMIT)*100,100)}%` }} /></div>
                  <p style={{ fontSize:"0.8rem", color: atLimit ? "#c0392b" : "var(--warm-gray)", marginTop:"0.5rem" }}>
                    {atLimit ? "Limit reached — " : `${BASIC_LIMIT - usageCount} remaining · `}
                    <button style={{ background:"none", border:"none", color:"var(--gold)", cursor:"pointer", fontSize:"0.8rem", fontWeight:600, fontFamily:"inherit" }} onClick={() => setTab("pricing")}>
                      {atLimit ? "upgrade to Premium" : "see Premium"}
                    </button>
                  </p>
                </div>
              </div>
            )}
            <div style={{ textAlign:"center", marginBottom:"2rem" }}>
              <button className="btn-gold" onClick={() => setTab("generate")}>✦ Generate a custom trip</button>
            </div>
            <div className="dashboard-grid">
              {SAMPLE_TRIPS.map((trip, i) => (
                <div key={i} className="trip-card" onClick={() => handleTripClick(trip)}>
                  <div className="trip-card-img">
                    {trip.emoji}
                    {trip.premium && !isPremium && <div className="lock-overlay">🔒</div>}
                  </div>
                  <div className="trip-card-body">
                    <div className="trip-card-dest">{trip.dest}</div>
                    <div className="trip-card-title">{trip.title}</div>
                    <div className="trip-card-meta">{trip.days} · Best time: {trip.meta}</div>
                    <div className="trip-card-tags">
                      {trip.tags.map(t => <span key={t} className="tag">{t}</span>)}
                      {trip.premium && !isPremium && <span className="tag premium-tag">✦ Premium</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {onboarded && tab === "generate" && (
          <div style={{ paddingTop:"2.5rem", paddingBottom:"3rem" }}>
            <div className="gen-card">
              <div style={{ marginBottom:"1.25rem" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:600, marginBottom:"0.3rem" }}>Generate an itinerary</div>
                <div style={{ fontSize:"0.85rem", color:"var(--warm-gray)", marginBottom:"0.75rem" }}>{isPremium ? "✦ Unlimited · Premium plan" : `${Math.max(0, BASIC_LIMIT - usageCount)} of ${BASIC_LIMIT} remaining this month`}</div>
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  <button onClick={() => setMultiMode(false)} style={{ padding:"0.4rem 1rem", borderRadius:"2rem", border:"1.5px solid", borderColor: !multiMode ? "var(--ink)" : "var(--sand)", background: !multiMode ? "var(--ink)" : "transparent", color: !multiMode ? "var(--cream)" : "var(--warm-gray)", fontSize:"0.8rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Single destination</button>
                  <button onClick={() => setMultiMode(true)} style={{ padding:"0.4rem 1rem", borderRadius:"2rem", border:"1.5px solid", borderColor: multiMode ? "var(--ink)" : "var(--sand)", background: multiMode ? "var(--ink)" : "transparent", color: multiMode ? "var(--cream)" : "var(--warm-gray)", fontSize:"0.8rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✦ Multi-destination</button>
                </div>
              </div>

              <div style={{ marginBottom:"1.25rem" }}>
                <label style={{ display:"block", fontSize:"0.75rem", fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--warm-gray)", marginBottom:"0.6rem" }}>Trip type</label>
                <div className="chip-group">
                  {[
                    { id:"couples", label:"💑 Couples" },
                    { id:"girls", label:"💅 Girls' Trip" },
                    { id:"guys", label:"🍻 Guys' Trip" },
                    { id:"family", label:"👨‍👩‍👧 Family" },
                    { id:"solo", label:"🎒 Solo" },
                  ].map(t => (
                    <button key={t.id} className={`chip ${tripType === t.id ? "selected" : ""}`} onClick={() => setTripType(t.id)}>{t.label}</button>
                  ))}
                </div>
              </div>

              {multiMode ? (
                <>
                  {legs.map((leg, i) => (
                    <div key={i} style={{ background:"var(--cream)", border:"1px solid var(--sand)", borderRadius:"0.75rem", padding:"1rem", marginBottom:"0.75rem", position:"relative" }}>
                      <div style={{ fontSize:"0.7rem", color:"var(--gold)", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.6rem" }}>Leg {i+1}</div>
                      <div className="gen-row" style={{ marginBottom:0 }}>
                        <div className="gen-field"><label>Destination</label><input placeholder="e.g. Amalfi Coast, Italy" value={leg.dest} onChange={e => updateLeg(i,"dest",e.target.value)} /></div>
                        <div className="gen-field" style={{ maxWidth:100 }}><label>Days</label>
                          <select value={leg.days} onChange={e => updateLeg(i,"days",e.target.value)}>{["1","2","3","4","5","6","7","8","9","10","14"].map(d => <option key={d}>{d}</option>)}</select>
                        </div>
                        {legs.length > 2 && <button onClick={() => removeLeg(i)} style={{ alignSelf:"flex-end", padding:"0.65rem 0.75rem", background:"none", border:"1px solid var(--sand)", borderRadius:"0.65rem", cursor:"pointer", color:"var(--warm-gray)", fontSize:"0.85rem" }}>✕</button>}
                      </div>
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:"0.75rem", marginBottom:"1rem", alignItems:"center" }}>
                    <button className="btn-ghost" style={{ padding:"0.5rem 1rem", fontSize:"0.85rem" }} onClick={addLeg}>+ Add destination</button>
                    <span style={{ fontSize:"0.8rem", color:"var(--warm-gray)" }}>Total: {totalMultiDays} days</span>
                  </div>
                  <div className="gen-row">
                    <div className="gen-field">
                      <label>Travel dates (optional)</label>
                      <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} />
                      {travelDate && (
                        <div style={{ fontSize:"0.75rem", color:"var(--warm-gray)", marginTop:"0.4rem" }}>
                          Return: {(() => { const s = new Date(travelDate+"T00:00:00"); const e = new Date(s); e.setDate(e.getDate()+totalMultiDays); return e.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); })()}
                        </div>
                      )}
                    </div>
                    <div className="gen-field"><label>Focus</label><input placeholder="food, wine, architecture, hiking..." value={travelStyle} onChange={e => setTravelStyle(e.target.value)} /></div>
                  </div>
                  <div className="gen-row" style={{ marginBottom:0 }}>
                    <div className="gen-field">
                      <label>Arrival airport / first city (optional)</label>
                      <input placeholder="e.g. Naples, NAP" value={arrivalAirport} onChange={e => setArrivalAirport(e.target.value)} />
                    </div>
                    <div className="gen-field">
                      <label>Departure airport (optional)</label>
                      <input placeholder="e.g. Madrid, MAD — if different" value={departureAirport} onChange={e => setDepartureAirport(e.target.value)} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                <div className="gen-row">
                  <div className="gen-field"><label>Destination</label><input placeholder="e.g. Lisbon, Portugal" value={destination} onChange={e => setDestination(e.target.value)} /></div>
                  <div className="gen-field" style={{ maxWidth:120 }}><label>Days</label>
                    <select value={tripDays} onChange={e => setTripDays(e.target.value)}>{["3","4","5","6","7","8","9","10","11","12","13","14","21","28"].map(d => <option key={d}>{d}</option>)}</select>
                  </div>
                </div>
                <div className="gen-row">
                  <div className="gen-field">
                    <label>Travel dates (optional)</label>
                    <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} />
                    {travelDate && (
                      <div style={{ fontSize:"0.75rem", color:"var(--warm-gray)", marginTop:"0.4rem" }}>
                        Return: {(() => {
                          const start = new Date(travelDate + "T00:00:00");
                          const end = new Date(start);
                          end.setDate(end.getDate() + (parseInt(tripDays,10) || 5));
                          return end.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="gen-field"><label>Focus</label><input placeholder="food, wine, architecture, hiking..." value={travelStyle} onChange={e => setTravelStyle(e.target.value)} /></div>
                </div>
                <div className="gen-row" style={{ marginBottom:0 }}>
                  <div className="gen-field">
                    <label>Arrival airport / city (optional)</label>
                    <input placeholder="e.g. Olbia, OLB, or 'flying into Nice'" value={arrivalAirport} onChange={e => setArrivalAirport(e.target.value)} />
                  </div>
                  <div className="gen-field">
                    <label>Departure airport (optional)</label>
                    <input placeholder="e.g. Rome, FCO — if different from arrival" value={departureAirport} onChange={e => setDepartureAirport(e.target.value)} />
                  </div>
                </div>
                </>
              )}
              <div style={{ marginTop:"1.25rem" }}>
                <button className="btn-primary" onClick={handleGenerateClick} disabled={generating || (!multiMode && !destination) || (multiMode && legs.some(l => !l.dest))}>
                  {generating ? "Crafting your itinerary…" : atLimit ? "✦ Upgrade to generate more" : multiMode ? `✦ Generate ${totalMultiDays}-day multi-destination trip` : "✦ Generate itinerary"}
                </button>
              </div>
            </div>
            {(generating || streamText) && (
              <div className="streaming-card">
                {generating && <div className="loading-bar"><div className="loading-bar-fill" /></div>}
                {generating && !streamText && <div style={{ color:"var(--warm-gray)", fontSize:"0.9rem", marginBottom:"1rem" }}>✦ {multiMode ? `Planning your ${totalMultiDays}-day multi-destination trip…` : `Researching ${destination}…`}</div>}
                <div ref={streamRef} className="stream-text">{streamText}{generating && <span className="cursor" />}</div>
                {done && <BookingLinks dest={multiMode ? legs[0].dest : destination} checkin={travelDate} days={multiMode ? String(totalMultiDays) : tripDays} />}
                {done && (
                  <div style={{ marginTop:"2rem", paddingTop:"1.5rem", borderTop:"1px solid var(--sand)", display:"flex", gap:"0.75rem", flexWrap:"wrap" }}>
                    <button className="btn-gold" onClick={() => navigator.clipboard.writeText(streamText)}>Copy</button>
                    {isPremium
                      ? <button className="btn-gold" onClick={() => downloadPDF({ text:streamText, destination: multiMode ? legs.map(l=>l.dest).join(" → ") : destination, days: multiMode ? String(totalMultiDays) : tripDays, date:new Date().toLocaleDateString(), travelDate, arrivalAirport, departureAirport, tripType, style: travelStyle })}>↓ PDF</button>
                      : <button className="btn-ghost" onClick={() => { setPaywallReason("limit"); setShowPaywall(true); }}>↓ PDF (Premium)</button>
                    }
                    <button className="btn-gold" onClick={() => setTab("saved")}>View saved trips →</button>
                    <button className="btn-gold" onClick={() => { setStreamText(""); setDone(false); setSavedTripId(null); setRefineInput(""); }}>Generate another</button>
                    <button className="btn-ghost" onClick={() => setTab("dashboard")}>← Back</button>
                  </div>
                )}
                {done && !refining && (
                  <div className="refine-section">
                    <div className="refine-title">✦ Refine This Itinerary</div>
                    <div className="refine-hint">Want any changes? Tell us what to adjust and we'll update the itinerary above.</div>
                    <div className="refine-row">
                      <input
                        placeholder="e.g. 'swap day 2 dinner for something casual' or 'add a day trip to Versailles'"
                        value={refineInput}
                        onChange={e => setRefineInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !refining) refineItinerary(); }}
                      />
                      <button onClick={refineItinerary} disabled={!refineInput.trim() || refining}>✦ Update</button>
                    </div>
                    <div className="refine-chips">
                      {["Add packing list & travel essentials","Make it more budget-friendly","Add more local/hidden gems","Make the pace more relaxed","Add a day trip option"].map(s => (
                        <button key={s} className="refine-chip" onClick={() => setRefineInput(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {refining && (
                  <div className="refine-section">
                    <div className="loading-bar"><div className="loading-bar-fill" /></div>
                    <div style={{ color:"var(--warm-gray)", fontSize:"0.9rem", marginTop:"0.75rem" }}>✦ Updating your itinerary…</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {onboarded && tab === "saved" && <SavedTripsPage />}
        {onboarded && tab === "pricing" && <PricingPage />}
      </div>
    </>
  );
}
