import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client — reads keys from .env file ────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Emoji helper ────────────────────────────────────────────────────────────
const FOOD_EMOJIS = {
  chicken:"🍗",beef:"🥩",fish:"🐟",salmon:"🐟",tuna:"🐟",egg:"🥚",eggs:"🥚",
  shrimp:"🦐",pork:"🥩",lamb:"🥩",tofu:"🧀",turkey:"🦃",
  carrot:"🥕",tomato:"🍅",onion:"🧅",garlic:"🧄",broccoli:"🥦",
  spinach:"🥬",lettuce:"🥬",pepper:"🫑",potato:"🥔",corn:"🌽",
  mushroom:"🍄",cucumber:"🥒",zucchini:"🥒",eggplant:"🍆",
  avocado:"🥑",celery:"🥬",asparagus:"🥦",cauliflower:"🥦",
  lemon:"🍋",lime:"🍋",apple:"🍎",banana:"🍌",orange:"🍊",
  berry:"🫐",strawberry:"🍓",mango:"🥭",pineapple:"🍍",grape:"🍇",
  rice:"🍚",pasta:"🍝",noodle:"🍜",bread:"🍞",flour:"🌾",cheese:"🧀",
  milk:"🥛",butter:"🧈",cream:"🥛",yogurt:"🥛",oat:"🌾",
  oil:"🫙",salt:"🧂",sugar:"🍬",honey:"🍯",sauce:"🫙",
  soup:"🍲",stew:"🍲",curry:"🍛",salad:"🥗",sandwich:"🥪",
  pizza:"🍕",burger:"🍔",cake:"🎂",cookie:"🍪",pie:"🥧",
  default:"🍽️"
};
function getEmoji(text) {
  if (!text) return FOOD_EMOJIS.default;
  const lower = text.toLowerCase();
  for (const [key, emoji] of Object.entries(FOOD_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return FOOD_EMOJIS.default;
}

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const CATEGORIES = ["Breakfast","Lunch","Dinner","Snack","Dessert","Drinks","Other"];
const DIFFICULTIES = ["Easy","Medium","Hard"];

// ── Claude API ──────────────────────────────────────────────────────────────
async function callClaude(messages, systemPrompt) {
  const res = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ system:systemPrompt, messages }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data.content?.[0]?.text || "";
}

// ── Design tokens — Fresh Green + Saffron on White ─────────────────────────
const c = {
  bg:        "#f5f9f0",           // soft natural white-green
  bgCard:    "#ffffff",
  bgHero:    "#edf5e5",           // light sage header
  border:    "#d4e8c2",
  borderDark:"#b5d499",
  green:     "#2e7d32",           // deep forest green
  greenMid:  "#4caf50",           // medium green
  greenL:    "#81c784",           // light green
  greenXL:   "#e8f5e9",           // near-white green tint
  saffron:   "#e6a817",           // surprise accent — saffron yellow
  saffronL:  "#fbc02d",
  saffronXL: "#fff8e1",
  text:      "#1b3a1f",           // very dark green-black
  textMid:   "#3d6b42",
  textMuted: "#7a9e7e",
  white:     "#ffffff",
  shadow:    "0 2px 12px rgba(46,125,50,0.10)",
  shadowMd:  "0 4px 24px rgba(46,125,50,0.13)",
};
const serif = "'Playfair Display', serif";
const sans  = "'DM Sans', sans-serif";

// ── Style helpers ───────────────────────────────────────────────────────────
function btnStyle(variant="primary", extra={}) {
  const base = { border:"none", borderRadius:10, cursor:"pointer", fontFamily:sans, fontWeight:700, fontSize:14, transition:"all .18s", padding:"10px 20px", letterSpacing:"0.01em" };
  if (variant==="primary")  return { ...base, background:`linear-gradient(135deg, ${c.green}, ${c.greenMid})`, color:"#fff", boxShadow:`0 2px 8px ${c.greenL}88`, ...extra };
  if (variant==="saffron")  return { ...base, background:`linear-gradient(135deg, ${c.saffron}, ${c.saffronL})`, color:"#fff", boxShadow:`0 2px 8px ${c.saffronL}88`, ...extra };
  if (variant==="ghost")    return { ...base, background:c.greenXL, color:c.green, border:`1.5px solid ${c.border}`, ...extra };
  if (variant==="danger")   return { ...base, background:"#fdecea", color:"#c62828", border:"1.5px solid #ffcdd2", ...extra };
  if (variant==="outline")  return { ...base, background:"transparent", color:c.green, border:`1.5px solid ${c.borderDark}`, ...extra };
}
const inputCss = (extra={}) => ({
  width:"100%", padding:"11px 14px",
  background:c.white, border:`1.5px solid ${c.border}`,
  borderRadius:10, color:c.text, outline:"none",
  fontFamily:sans, fontSize:14, boxSizing:"border-box",
  transition:"border-color .15s",
  ...extra
});
const cardCss = (extra={}) => ({
  background:c.bgCard, border:`1.5px solid ${c.border}`,
  borderRadius:18, overflow:"hidden",
  boxShadow:c.shadow, ...extra
});

// ── Reusable tiny components ────────────────────────────────────────────────
function Tag({ children, col, bg }) {
  return (
    <span style={{
      background: bg || `${col||c.green}18`,
      color: col || c.green,
      padding:"3px 11px", borderRadius:20,
      fontSize:12, fontFamily:sans, fontWeight:600,
      border:`1px solid ${col||c.green}30`
    }}>{children}</span>
  );
}

function Panel({ children, style={} }) {
  return <div style={{ ...cardCss(), padding:26, ...style }}>{children}</div>;
}

function Spinner({ label }) {
  return (
    <div style={{ textAlign:"center", padding:52 }}>
      <div style={{ fontSize:44, marginBottom:12, display:"inline-block", animation:"spin 1.4s linear infinite" }}>🌿</div>
      <p style={{ color:c.textMuted, fontFamily:sans, fontSize:14 }}>{label||"Loading..."}</p>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function ErrBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background:"#fdecea", border:"1.5px solid #ffcdd2", borderRadius:10, padding:"12px 16px", color:"#c62828", fontFamily:sans, fontSize:14, marginBottom:16 }}>
      ⚠️ {msg}
    </div>
  );
}

// ── Chip input ──────────────────────────────────────────────────────────────
function ChipInput({ label, placeholder, items, setItems }) {
  const [val, setVal] = useState("");
  const add = () => { const t=val.trim(); if(t&&!items.includes(t)) setItems([...items,t]); setVal(""); };
  return (
    <div>
      {label && <label style={{ display:"block", color:c.textMid, fontSize:13, fontFamily:sans, fontWeight:600, marginBottom:7 }}>{label}</label>}
      <div style={{
        display:"flex", flexWrap:"wrap", gap:7, minHeight:46,
        padding:"8px 12px", background:c.white, border:`1.5px solid ${c.border}`,
        borderRadius:10, alignItems:"center", marginBottom:8,
        boxShadow:"inset 0 1px 3px rgba(0,0,0,0.04)"
      }}>
        {!items.length && <span style={{ color:c.textMuted, fontSize:13, fontFamily:sans }}>{placeholder}</span>}
        {items.map((item,i) => (
          <span key={i} style={{
            background:`linear-gradient(135deg,${c.green},${c.greenMid})`,
            color:"#fff", padding:"5px 11px", borderRadius:20, fontSize:13,
            fontFamily:sans, fontWeight:600, display:"flex", alignItems:"center", gap:6,
            boxShadow:"0 1px 4px rgba(46,125,50,0.2)"
          }}>
            {item}
            <button onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{
              background:"rgba(255,255,255,0.3)", border:"none", borderRadius:"50%",
              width:16, height:16, cursor:"pointer", color:"#fff", fontSize:10,
              display:"flex", alignItems:"center", justifyContent:"center", padding:0, lineHeight:1
            }}>✕</button>
          </span>
        ))}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <input value={val} onChange={e=>setVal(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"||e.key===","){e.preventDefault();add();} }}
          placeholder="Type and press Enter"
          style={inputCss()} />
        <button onClick={add} style={btnStyle("primary")}>+ Add</button>
      </div>
    </div>
  );
}

// ── AI Recipe Card ──────────────────────────────────────────────────────────
function AICard({ r }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={cardCss({ transition:"transform .2s, box-shadow .2s" })}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=c.shadowMd;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=c.shadow;}}
    >
      <div style={{ background:`linear-gradient(135deg, ${c.greenXL}, #d4edda)`, padding:"20px 22px 16px", borderBottom:`1.5px solid ${c.border}` }}>
        <div style={{ fontSize:34, marginBottom:8 }}>{r.emoji||getEmoji(r.name)}</div>
        <h3 style={{ fontFamily:serif, color:c.text, fontSize:18, margin:"0 0 10px", lineHeight:1.3 }}>{r.name}</h3>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          {r.time      && <Tag>⏱ {r.time}</Tag>}
          {r.difficulty && <Tag>📊 {r.difficulty}</Tag>}
          {r.servings   && <Tag>👥 {r.servings}</Tag>}
        </div>
      </div>
      <div style={{ padding:"16px 22px" }}>
        <p style={{ color:c.textMuted, fontSize:13, fontFamily:sans, lineHeight:1.7, margin:"0 0 14px" }}>{r.description}</p>
        <button onClick={()=>setOpen(!open)} style={btnStyle("ghost",{fontSize:13,padding:"7px 16px"})}>
          {open ? "Hide ▲" : "View Full Recipe ▼"}
        </button>
        {open && (
          <div style={{ marginTop:16, paddingTop:16, borderTop:`1.5px solid ${c.border}` }}>
            <h4 style={{ fontFamily:serif, color:c.text, fontSize:15, margin:"0 0 10px" }}>Ingredients</h4>
            <ul style={{ margin:"0 0 16px", paddingLeft:20 }}>
              {r.ingredients?.map((ing,i)=>(
                <li key={i} style={{ color:c.textMid, fontFamily:sans, fontSize:13, marginBottom:4, lineHeight:1.5 }}>{ing}</li>
              ))}
            </ul>
            <h4 style={{ fontFamily:serif, color:c.text, fontSize:15, margin:"0 0 10px" }}>Steps</h4>
            {r.steps?.map((step,i)=>(
              <div key={i} style={{ display:"flex", gap:10, marginBottom:10 }}>
                <span style={{
                  minWidth:24, height:24, borderRadius:"50%",
                  background:`linear-gradient(135deg,${c.green},${c.greenMid})`,
                  color:"#fff", fontSize:11, fontWeight:700, flexShrink:0, marginTop:1,
                  display:"flex", alignItems:"center", justifyContent:"center", fontFamily:sans,
                  boxShadow:`0 1px 4px ${c.greenL}88`
                }}>{i+1}</span>
                <p style={{ color:c.textMid, fontFamily:sans, fontSize:13, margin:0, lineHeight:1.65 }}>{step}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── My Recipe Card ──────────────────────────────────────────────────────────
function MyCard({ r, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={cardCss({ transition:"transform .2s, box-shadow .2s" })}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=c.shadowMd;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=c.shadow;}}
    >
      <div style={{ background:`linear-gradient(135deg,${c.saffronXL},#fff8dc)`, padding:"20px 22px 16px", borderBottom:`1.5px solid ${c.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ fontSize:34, marginBottom:8 }}>{getEmoji(r.name)}</div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={()=>onEdit(r)} style={btnStyle("ghost",{padding:"5px 10px",fontSize:12})}>✏️ Edit</button>
            <button onClick={()=>onDelete(r.id)} style={btnStyle("danger",{padding:"5px 10px",fontSize:12})}>🗑️</button>
          </div>
        </div>
        <h3 style={{ fontFamily:serif, color:c.text, fontSize:18, margin:"0 0 10px" }}>{r.name}</h3>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
          {r.category  && <Tag col={c.saffron} bg={c.saffronXL}>📂 {r.category}</Tag>}
          {r.time      && <Tag>⏱ {r.time}</Tag>}
          {r.difficulty && <Tag>📊 {r.difficulty}</Tag>}
          {r.servings   && <Tag>👥 {r.servings}</Tag>}
          <Tag col={c.saffron} bg={c.saffronXL}>⭐ My Recipe</Tag>
          {r.added_by && <Tag col={c.green} bg={c.greenXL}>👤 {r.added_by}</Tag>}
        </div>
      </div>
      <div style={{ padding:"16px 22px" }}>
        {r.description && <p style={{ color:c.textMuted, fontSize:13, fontFamily:sans, lineHeight:1.7, margin:"0 0 14px" }}>{r.description}</p>}
        <button onClick={()=>setOpen(!open)} style={btnStyle("ghost",{fontSize:13,padding:"7px 16px"})}>
          {open ? "Hide ▲" : "View Full Recipe ▼"}
        </button>
        {open && (
          <div style={{ marginTop:16, paddingTop:16, borderTop:`1.5px solid ${c.border}` }}>
            {r.ingredients?.length > 0 && <>
              <h4 style={{ fontFamily:serif, color:c.text, fontSize:15, margin:"0 0 10px" }}>Ingredients</h4>
              <ul style={{ margin:"0 0 16px", paddingLeft:20 }}>
                {r.ingredients.map((ing,i)=>(
                  <li key={i} style={{ color:c.textMid, fontFamily:sans, fontSize:13, marginBottom:4 }}>{ing}</li>
                ))}
              </ul>
            </>}
            {r.steps?.length > 0 && <>
              <h4 style={{ fontFamily:serif, color:c.text, fontSize:15, margin:"0 0 10px" }}>Steps</h4>
              {r.steps.map((step,i)=>(
                <div key={i} style={{ display:"flex", gap:10, marginBottom:10 }}>
                  <span style={{
                    minWidth:24, height:24, borderRadius:"50%",
                    background:`linear-gradient(135deg,${c.saffron},${c.saffronL})`,
                    color:"#fff", fontSize:11, fontWeight:700, flexShrink:0, marginTop:1,
                    display:"flex", alignItems:"center", justifyContent:"center", fontFamily:sans
                  }}>{i+1}</span>
                  <p style={{ color:c.textMid, fontFamily:sans, fontSize:13, margin:0, lineHeight:1.65 }}>{step}</p>
                </div>
              ))}
            </>}
            {r.notes && (
              <div style={{ background:c.saffronXL, border:`1.5px solid ${c.saffron}33`, borderRadius:10, padding:"11px 15px", marginTop:12 }}>
                <span style={{ color:c.saffron, fontFamily:sans, fontSize:13 }}>📝 <strong>Notes:</strong> {r.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add / Edit Recipe Form ──────────────────────────────────────────────────
function RecipeForm({ initial, onSave, onCancel }) {
  const blank = { name:"", category:"Dinner", time:"", difficulty:"Easy", servings:"", description:"", ingredients:[], steps:[], notes:"", added_by:"" };
  const [form, setForm] = useState(initial || blank);
  const [stepInput, setStepInput] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const addStep = () => { if(stepInput.trim()){ set("steps",[...(form.steps||[]),stepInput.trim()]); setStepInput(""); } };
  const save = () => { if(!form.name.trim()){ alert("Please enter a recipe name!"); return; } onSave({...form, id:form.id||Date.now().toString()}); };

  const FLabel = ({children, required}) => (
    <label style={{ display:"block", color:c.textMid, fontSize:13, fontFamily:sans, fontWeight:600, marginBottom:6 }}>
      {children}{required && <span style={{ color:"#e53935" }}> *</span>}
    </label>
  );

  return (
    <div style={{ background:"#f9fff5", border:`2px solid ${c.border}`, borderRadius:20, padding:28, marginBottom:26, boxShadow:c.shadowMd }}>
      {/* Form header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22, paddingBottom:16, borderBottom:`1.5px solid ${c.border}` }}>
        <div style={{ width:42, height:42, borderRadius:12, background:`linear-gradient(135deg,${c.saffron},${c.saffronL})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
          {initial?.id ? "✏️" : "➕"}
        </div>
        <div>
          <h2 style={{ fontFamily:serif, color:c.text, fontSize:21, margin:0 }}>{initial?.id ? "Edit Recipe" : "Add Your Recipe"}</h2>
          <p style={{ color:c.textMuted, fontFamily:sans, fontSize:13, margin:0 }}>Fill in as much or as little as you like</p>
        </div>
      </div>

      {/* Name */}
      <div style={{ marginBottom:16 }}>
        <FLabel required>Recipe Name</FLabel>
        <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Grandma's Chicken Soup" style={inputCss()} />
      </div>

      {/* Grid row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
        <div>
          <FLabel>Category</FLabel>
          <select value={form.category} onChange={e=>set("category",e.target.value)} style={inputCss()}>
            {CATEGORIES.map(cat=><option key={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <FLabel>Difficulty</FLabel>
          <select value={form.difficulty} onChange={e=>set("difficulty",e.target.value)} style={inputCss()}>
            {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <FLabel>Cook Time</FLabel>
          <input value={form.time} onChange={e=>set("time",e.target.value)} placeholder="e.g. 30 mins" style={inputCss()} />
        </div>
        <div>
          <FLabel>Servings</FLabel>
          <input value={form.servings} onChange={e=>set("servings",e.target.value)} placeholder="e.g. 4 servings" style={inputCss()} />
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom:16 }}>
        <FLabel>Short Description</FLabel>
        <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="A short description of this dish..." rows={2} style={{ ...inputCss(), resize:"vertical" }} />
      </div>

      {/* Ingredients */}
      <div style={{ marginBottom:16 }}>
        <ChipInput label="Ingredients — press Enter after each one" placeholder="e.g. 2 cups flour, 1 tsp salt..." items={form.ingredients||[]} setItems={v=>set("ingredients",v)} />
      </div>

      {/* Steps */}
      <div style={{ marginBottom:16 }}>
        <FLabel>Cooking Steps</FLabel>
        {(form.steps||[]).map((step,i)=>(
          <div key={i} style={{ display:"flex", gap:8, marginBottom:7, alignItems:"flex-start" }}>
            <span style={{ minWidth:24, height:24, borderRadius:"50%", background:`linear-gradient(135deg,${c.saffron},${c.saffronL})`, color:"#fff", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:sans, flexShrink:0, marginTop:9 }}>{i+1}</span>
            <span style={{ flex:1, background:c.saffronXL, border:`1.5px solid ${c.saffron}33`, borderRadius:9, padding:"9px 13px", color:c.text, fontFamily:sans, fontSize:13, lineHeight:1.5 }}>{step}</span>
            <button onClick={()=>set("steps",form.steps.filter((_,j)=>j!==i))} style={btnStyle("danger",{padding:"6px 10px",fontSize:12,marginTop:4})}>✕</button>
          </div>
        ))}
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <textarea value={stepInput} onChange={e=>setStepInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();addStep();} }} placeholder="Describe a step, then press Enter or click Add" rows={2} style={{ ...inputCss(), resize:"vertical", flex:1 }} />
          <button onClick={addStep} style={btnStyle("ghost",{alignSelf:"flex-end",whiteSpace:"nowrap"})}>+ Add Step</button>
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom:16 }}>
        <FLabel>Extra Notes / Tips (optional)</FLabel>
        <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Any special tips, substitutions, or storage advice..." rows={2} style={{ ...inputCss(), resize:"vertical" }} />
      </div>

      <div style={{ marginBottom:24 }}>
        <FLabel>Added by (your name)</FLabel>
        <input value={form.added_by||""} onChange={e=>set("added_by",e.target.value)} placeholder="e.g. Mum, Dad, Sarah..." style={inputCss()} />
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button onClick={save} style={btnStyle("saffron",{padding:"12px 28px",fontSize:15})}>💾 Save Recipe</button>
        <button onClick={onCancel} style={btnStyle("outline",{padding:"12px 20px"})}>Cancel</button>
      </div>
    </div>
  );
}

// ── Grocery PDF ─────────────────────────────────────────────────────────────
function openGroceryPDF(list, plan) {
  const grouped = list.reduce((acc,item)=>{ const k=item.category||"Other"; if(!acc[k])acc[k]=[]; acc[k].push(item); return acc; },{});
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Grocery List</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#f5f9f0;color:#1b3a1f;padding:32px;max-width:900px;margin:0 auto}
.hdr{text-align:center;margin-bottom:28px;padding-bottom:18px;border-bottom:3px solid #2e7d32}
.ttl{font-family:'Playfair Display',serif;font-size:34px;color:#2e7d32;margin-bottom:4px}
.sub{font-size:13px;color:#7a9e7e}
.days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:26px}
.day{border:1.5px solid #d4e8c2;border-radius:9px;padding:7px;background:#fff}
.dn{font-size:10px;font-weight:700;color:#2e7d32;text-transform:uppercase;margin-bottom:4px}
.meal{font-size:9.5px;color:#3d6b42;margin-bottom:2px}.ml{font-weight:700;color:#e6a817}
.sec-ttl{font-family:'Playfair Display',serif;font-size:19px;color:#2e7d32;margin:0 0 14px}
.cat{margin-bottom:18px}
.cat-hd{font-size:11px;font-weight:700;color:#e6a817;text-transform:uppercase;letter-spacing:.6px;padding-bottom:5px;border-bottom:1.5px solid #d4e8c2;margin:0 0 9px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.item{display:flex;align-items:center;gap:9px;background:#fff;border:1.5px solid #d4e8c2;border-radius:10px;padding:9px 11px}
.em{font-size:22px}.iname{font-size:12px;font-weight:600;color:#1b3a1f}.iamt{font-size:10px;color:#7a9e7e}
.cb{width:14px;height:14px;border:1.5px solid #2e7d32;border-radius:4px;margin-left:auto;flex-shrink:0}
.footer{margin-top:28px;text-align:center;font-size:11px;color:#7a9e7e;border-top:1px solid #d4e8c2;padding-top:14px}
@media print{.noprint{display:none}}</style></head><body>
<div class="hdr"><div style="font-size:38px;margin-bottom:8px">🛒</div>
<div class="ttl">Weekly Grocery List</div>
<div class="sub">${new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div></div>
${plan?`<div class="sec-ttl">📅 Meal Plan Overview</div><div class="days">${DAYS.filter(d=>plan[d]).map(day=>`<div class="day"><div class="dn">${day.substring(0,3)}</div>${["Breakfast","Lunch","Dinner"].map(m=>`<div class="meal"><span class="ml">${m[0]}:</span> ${plan[day][m]||"—"}</div>`).join("")}</div>`).join("")}</div>`:""}
<div class="sec-ttl">🛍️ Shopping List (${list.length} items)</div>
${Object.entries(grouped).map(([cat,items])=>`<div class="cat"><div class="cat-hd">${cat}</div><div class="grid">${items.map(it=>`<div class="item"><div class="em">${getEmoji(it.name)}</div><div><div class="iname">${it.name}</div>${it.amount?`<div class="iamt">${it.amount}</div>`:""}</div><div class="cb"></div></div>`).join("")}</div></div>`).join("")}
<div class="footer">🌿 Happy cooking! • RecipeAI</div>
<div class="noprint" style="text-align:center;margin-top:20px"><button onclick="window.print()" style="padding:12px 28px;background:#2e7d32;color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:700">🖨️ Print / Save as PDF</button></div>
</body></html>`;
  const w = window.open("","_blank"); w.document.write(html); w.document.close();
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  { id:"recipe",    label:"🔍 Recipe Finder" },
  { id:"myrecipes", label:"⭐ My Recipes" },
  { id:"planner",   label:"📅 Meal Planner" },
];

export default function App() {
  const [tab, setTab] = useState("recipe");

  // Recipe Finder
  const [ingredients, setIngredients] = useState([]);
  const [aiRecipes, setAiRecipes]     = useState([]);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeErr, setRecipeErr]     = useState("");

  // My Recipes
  const [myRecipes, setMyRecipes] = useState([]);
  const [ready, setReady]         = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [search, setSearch]       = useState("");
  const [filterCat, setFilterCat] = useState("All");

  // Meal Planner
  const [mealPlan, setMealPlan]       = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);
  const [preferences, setPreferences] = useState("");
  const [planErr, setPlanErr]         = useState("");

  // Load saved recipes
  // ── Load all recipes from shared Supabase database ──────────────────────
  const loadRecipes = useCallback(async () => {
    setReady(false);
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setMyRecipes(data);
    setReady(true);
  }, []);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);

  // ── Real-time listener — updates instantly when anyone adds/edits/deletes ─
  useEffect(() => {
    const channel = supabase
      .channel("recipes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "recipes" }, () => {
        loadRecipes();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadRecipes]);

  // ── Save (insert or update) ───────────────────────────────────────────────
  const handleSave = async (recipe) => {
    const row = {
      name:        recipe.name,
      category:    recipe.category,
      time:        recipe.time,
      difficulty:  recipe.difficulty,
      servings:    recipe.servings,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps:       recipe.steps,
      notes:       recipe.notes,
      added_by:    recipe.added_by || "Family",
    };
    const isUUID = recipe.id && /^[0-9a-f-]{36}$/i.test(recipe.id.toString());
    if (isUUID) {
      await supabase.from("recipes").update(row).eq("id", recipe.id);
    } else {
      await supabase.from("recipes").insert(row);
    }
    setShowForm(false); setEditing(null);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe for everyone?")) return;
    await supabase.from("recipes").delete().eq("id", id);
  };

  const handleEdit = (r) => { setEditing(r); setShowForm(true); window.scrollTo({top:0,behavior:"smooth"}); };

  const suggestRecipes = async () => {
    if (!ingredients.length) return;
    setRecipeLoading(true); setRecipeErr(""); setAiRecipes([]);
    try {
      const text = await callClaude(
        [{role:"user",content:`I have: ${ingredients.join(", ")}. Suggest 3 creative recipes.`}],
        `You are a world-class chef. Return ONLY a JSON array of exactly 3 recipes. Each: {"name":string,"emoji":string,"time":string,"difficulty":string,"servings":string,"description":string,"ingredients":string[],"steps":string[]}. No markdown.`
      );
      setAiRecipes(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(_) { setRecipeErr("Something went wrong. Please try again."); }
    setRecipeLoading(false);
  };

  const generatePlan = async () => {
    setPlanLoading(true); setPlanErr(""); setMealPlan(null); setGroceryList([]);
    try {
      const pref = preferences ? ` Preferences: ${preferences}.` : "";
      const text = await callClaude(
        [{role:"user",content:`Create a 7-day meal plan.${pref}`}],
        `Return ONLY this JSON: {"Monday":{"Breakfast":"...","Lunch":"...","Dinner":"..."},...,"Sunday":{...},"grocery":[{"name":"...","amount":"...","category":"Produce|Protein|Dairy|Grains & Bread|Pantry|Other"}]}. No markdown.`
      );
      const { grocery, ...plan } = JSON.parse(text.replace(/```json|```/g,"").trim());
      setMealPlan(plan); setGroceryList(grocery||[]);
    } catch(_) { setPlanErr("Failed to generate. Please try again."); }
    setPlanLoading(false);
  };

  const filtered = myRecipes.filter(r => {
    const matchC = filterCat==="All" || r.category===filterCat;
    const matchS = r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    return matchC && matchS;
  });

  const tabBtn = (active) => ({
    padding:"10px 22px", border:"none", cursor:"pointer",
    fontFamily:sans, fontWeight:700, fontSize:14, borderRadius:10,
    background: active ? `linear-gradient(135deg,${c.green},${c.greenMid})` : c.white,
    color: active ? "#fff" : c.textMid,
    border: active ? "none" : `1.5px solid ${c.border}`,
    boxShadow: active ? `0 2px 8px ${c.greenL}88` : "none",
    transition:"all .2s"
  });

  return (
    <div style={{ minHeight:"100vh", background:c.bg, fontFamily:sans }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Nunito:wght@700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      {/* Subtle leaf-dot texture */}
      <div style={{ position:"fixed", inset:0, opacity:.04, backgroundImage:"radial-gradient(circle, #2e7d32 1px, transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none" }}/>

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <header style={{ background:`linear-gradient(160deg, #e8f5e9 0%, #f1f8f2 60%, #fff8e1 100%)`, borderBottom:`2px solid ${c.border}`, padding:"52px 24px 36px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        {/* decorative circles */}
        <div style={{ position:"absolute", top:-40, left:-40, width:180, height:180, borderRadius:"50%", background:`${c.greenL}22`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-60, right:-30, width:220, height:220, borderRadius:"50%", background:`${c.saffron}18`, pointerEvents:"none" }}/>

        <div style={{ position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:14 }}>
            <div style={{ fontSize:"clamp(40px,6vw,64px)", filter:"drop-shadow(0 4px 10px rgba(46,125,50,0.18))", lineHeight:1 }}>🍃</div>
            <h1 style={{
              fontFamily:"Nunito, sans-serif",
              fontSize:"clamp(52px,10vw,90px)",
              fontWeight:900,
              color:c.green,
              margin:0,
              letterSpacing:"-2px",
              lineHeight:1,
              textShadow:"0 3px 16px rgba(46,125,50,0.12)",
            }}>
              Recipe<span style={{ color:c.saffron }}>AI</span>
            </h1>
          </div>
          <p style={{ color:c.textMuted, fontSize:15, margin:0 }}>
            AI-powered recipes · your personal cookbook · weekly meal planning
          </p>
          {/* gradient underline accent */}
          <div style={{ width:80, height:5, borderRadius:4, background:`linear-gradient(90deg,${c.green},${c.saffron},${c.saffronL})`, margin:"16px auto 0" }}/>
        </div>
      </header>

      {/* ── TABS ──────────────────────────────────────────────────────── */}
      <div style={{ background:c.white, borderBottom:`1.5px solid ${c.border}`, padding:"14px 24px", display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap", boxShadow:"0 2px 8px rgba(46,125,50,0.06)" }}>
        {TABS.map(t => <button key={t.id} style={tabBtn(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>)}
      </div>

      {/* ── MAIN ──────────────────────────────────────────────────────── */}
      <main style={{ maxWidth:940, margin:"0 auto", padding:"30px 20px 80px" }}>

        {/* ── RECIPE FINDER ─────────────────────────────────────────── */}
        {tab==="recipe" && (
          <>
            <Panel>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${c.green},${c.greenMid})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, boxShadow:`0 2px 8px ${c.greenL}88` }}>🥦</div>
                <div>
                  <h2 style={{ fontFamily:serif, color:c.text, fontSize:22, margin:"0 0 3px" }}>What's in your fridge?</h2>
                  <p style={{ color:c.textMuted, fontSize:13, margin:0 }}>Add your available ingredients and we'll suggest recipes you can make right now.</p>
                </div>
              </div>
              <ChipInput placeholder="e.g. chicken, garlic, tomato..." items={ingredients} setItems={setIngredients} />
              <button onClick={suggestRecipes} disabled={!ingredients.length||recipeLoading}
                style={btnStyle("primary",{ width:"100%", marginTop:14, padding:"13px", fontSize:15, opacity:!ingredients.length||recipeLoading?.5:1, cursor:!ingredients.length||recipeLoading?"not-allowed":"pointer" })}>
                {recipeLoading ? "🌿 Finding recipes..." : "✨ Suggest Recipes"}
              </button>
            </Panel>

            {recipeLoading && <Spinner label="Crafting the perfect recipes for you..."/>}
            <ErrBox msg={recipeErr}/>

            {aiRecipes.length > 0 && (
              <div style={{ marginTop:26 }}>
                <h2 style={{ fontFamily:serif, color:c.text, fontSize:20, margin:"0 0 16px" }}>🍽️ Suggested Recipes</h2>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
                  {aiRecipes.map((r,i) => <AICard key={i} r={r}/>)}
                </div>
                <div style={{ marginTop:16, padding:"14px 18px", background:c.saffronXL, border:`1.5px solid ${c.saffron}44`, borderRadius:12 }}>
                  <p style={{ color:c.textMid, fontFamily:sans, fontSize:13, margin:0 }}>
                    💡 <strong style={{ color:c.text }}>Like one of these?</strong> Head to <strong style={{ color:c.saffron }}>⭐ My Recipes</strong> to save your own version to your personal cookbook!
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── MY RECIPES ────────────────────────────────────────────── */}
        {tab==="myrecipes" && (
          <>
            {showForm && <RecipeForm initial={editing} onSave={handleSave} onCancel={()=>{setShowForm(false);setEditing(null);}}/>}

            {!showForm && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:22 }}>
                <div>
                  <h2 style={{ fontFamily:serif, color:c.text, fontSize:22, margin:0 }}>⭐ My Recipe Library</h2>
                  <p style={{ color:c.textMuted, fontFamily:sans, fontSize:13, margin:"4px 0 0" }}>Your personal cookbook — saved forever</p>
                </div>
                <button onClick={()=>{setShowForm(true);setEditing(null);}} style={btnStyle("saffron",{padding:"12px 22px",fontSize:15})}>
                  ➕ Add My Recipe
                </button>
              </div>
            )}

            {!showForm && myRecipes.length > 0 && (
              <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search your recipes..." style={inputCss({flex:"1",minWidth:180})}/>
                <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={inputCss({width:"auto"})}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat=><option key={cat}>{cat}</option>)}
                </select>
              </div>
            )}

            {!showForm && !ready && <Spinner label="Loading your recipes..."/>}

            {!showForm && ready && myRecipes.length === 0 && (
              <Panel style={{ textAlign:"center", padding:"56px 24px" }}>
                <div style={{ fontSize:64, marginBottom:14 }}>📖</div>
                <h3 style={{ fontFamily:serif, color:c.text, fontSize:23, margin:"0 0 10px" }}>Your cookbook is empty</h3>
                <p style={{ color:c.textMuted, fontFamily:sans, fontSize:14, margin:"0 0 26px", lineHeight:1.75 }}>
                  Start adding your favourite recipes here — family dishes,<br/>
                  secret sauces, anything you love to cook!<br/>
                  <strong style={{ color:c.text }}>They'll be saved and always available.</strong>
                </p>
                <button onClick={()=>setShowForm(true)} style={btnStyle("saffron",{padding:"13px 30px",fontSize:15})}>➕ Add My First Recipe</button>
              </Panel>
            )}

            {!showForm && filtered.length > 0 && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
                {filtered.map(r => <MyCard key={r.id} r={r} onDelete={handleDelete} onEdit={handleEdit}/>)}
              </div>
            )}
            {!showForm && myRecipes.length > 0 && filtered.length === 0 && (
              <Panel style={{ textAlign:"center", padding:40 }}>
                <p style={{ color:c.textMuted, fontFamily:sans }}>No recipes match your search. Try different keywords.</p>
              </Panel>
            )}
          </>
        )}

        {/* ── MEAL PLANNER ──────────────────────────────────────────── */}
        {tab==="planner" && (
          <>
            <Panel style={{ marginBottom:26 }}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${c.saffron},${c.saffronL})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, boxShadow:`0 2px 8px ${c.saffronL}88` }}>📅</div>
                <div>
                  <h2 style={{ fontFamily:serif, color:c.text, fontSize:22, margin:"0 0 3px" }}>Plan Your Week</h2>
                  <p style={{ color:c.textMuted, fontSize:13, margin:0 }}>Get a personalized 7-day meal plan with a printable grocery list.</p>
                </div>
              </div>
              <label style={{ display:"block", color:c.textMid, fontSize:13, fontFamily:sans, fontWeight:600, marginBottom:7 }}>Dietary preferences or restrictions (optional)</label>
              <input value={preferences} onChange={e=>setPreferences(e.target.value)} placeholder="e.g. vegetarian, gluten-free, low-carb, halal..." style={inputCss({marginBottom:14})}/>
              <button onClick={generatePlan} disabled={planLoading}
                style={btnStyle("primary",{ width:"100%", padding:"13px", fontSize:15, opacity:planLoading?.5:1, cursor:planLoading?"not-allowed":"pointer" })}>
                {planLoading ? "🌿 Building your meal plan..." : "✨ Generate Meal Plan"}
              </button>
            </Panel>

            {planLoading && <Spinner label="Creating your personalized meal plan..."/>}
            <ErrBox msg={planErr}/>

            {mealPlan && (
              <>
                <h2 style={{ fontFamily:serif, color:c.text, fontSize:20, margin:"0 0 16px" }}>📅 Your Week</h2>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(245px,1fr))", gap:13, marginBottom:26 }}>
                  {DAYS.filter(d=>mealPlan[d]).map(day => (
                    <div key={day} style={cardCss()}>
                      <div style={{ background:`linear-gradient(135deg,${c.greenXL},#d9edd9)`, padding:"11px 17px", borderBottom:`1.5px solid ${c.border}` }}>
                        <h3 style={{ fontFamily:serif, color:c.green, fontSize:17, margin:0 }}>{day}</h3>
                      </div>
                      <div style={{ padding:"13px 17px", display:"flex", flexDirection:"column", gap:8 }}>
                        {["Breakfast","Lunch","Dinner"].map(m => (
                          <div key={m} style={{ display:"flex", gap:8 }}>
                            <span style={{ color:c.saffron, fontSize:11, fontFamily:sans, fontWeight:700, minWidth:58, paddingTop:2 }}>{m}</span>
                            <span style={{ color:c.textMid, fontSize:13, fontFamily:sans, lineHeight:1.45 }}>{mealPlan[day][m]||"—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {groceryList.length > 0 && (
                  <Panel>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:22 }}>
                      <div>
                        <h2 style={{ fontFamily:serif, color:c.text, fontSize:20, margin:0 }}>🛒 Grocery List</h2>
                        <p style={{ color:c.textMuted, fontFamily:sans, fontSize:13, margin:"3px 0 0" }}>{groceryList.length} items across all meals</p>
                      </div>
                      <button onClick={()=>openGroceryPDF(groceryList,mealPlan)} style={btnStyle("saffron")}>📄 Download PDF</button>
                    </div>
                    {Object.entries(
                      groceryList.reduce((acc,item)=>{ const k=item.category||"Other"; if(!acc[k])acc[k]=[]; acc[k].push(item); return acc; },{})
                    ).map(([cat,items]) => (
                      <div key={cat} style={{ marginBottom:20 }}>
                        <h3 style={{ fontFamily:sans, fontWeight:700, color:c.saffron, fontSize:11, textTransform:"uppercase", letterSpacing:"0.8px", margin:"0 0 9px", paddingBottom:5, borderBottom:`1.5px solid ${c.border}` }}>{cat}</h3>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(168px,1fr))", gap:8 }}>
                          {items.map((item,i) => (
                            <div key={i} style={{ display:"flex", alignItems:"center", gap:9, background:c.greenXL, border:`1.5px solid ${c.border}`, borderRadius:10, padding:"9px 12px" }}>
                              <span style={{ fontSize:22 }}>{getEmoji(item.name)}</span>
                              <div>
                                <div style={{ color:c.text, fontSize:13, fontFamily:sans, fontWeight:600 }}>{item.name}</div>
                                {item.amount && <div style={{ color:c.textMuted, fontSize:11 }}>{item.amount}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </Panel>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign:"center", padding:"20px 24px 32px", borderTop:`1.5px solid ${c.border}`, background:c.white }}>
        <p style={{ color:c.textMuted, fontFamily:sans, fontSize:13, margin:0 }}>🌿 RecipeAI · Made with love for healthy eating</p>
      </footer>
    </div>
  );
}
