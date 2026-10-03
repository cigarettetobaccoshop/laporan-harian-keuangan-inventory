"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3, Boxes, CalendarDays, ClipboardList, LayoutDashboard,
  PackageMinus, PackagePlus, Plus, Printer, LogOut, X
} from "lucide-react";
import { getSupabaseClient } from "../lib/supabase";
import AuthPanel from "./AuthPanel";

type Cash = { id:string; transaction_date:string; type:"in"|"out"; category:string; description:string; amount:number; party?:string|null };
type Item = { id:string; sku:string; name:string; unit:string; cost:number };
type Move = { id:string; movement_date:string; type:"in"|"out"; item_id:string; qty:number; unit_cost?:number|null; party?:string|null };
type Opening = { id:string; period_start:string; item_id:string; opening_qty:number };

const rupiah=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const number=(n:number)=>new Intl.NumberFormat("id-ID",{maximumFractionDigits:3}).format(n);
const today=()=>new Date().toLocaleDateString("en-CA");
const fmtDate=(v:string)=>new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(v+"T00:00:00"));

const tabs=[
 ["dashboard","Ringkasan",LayoutDashboard],["cash-in","Pemasukan",PackagePlus],
 ["cash-out","Pengeluaran",PackageMinus],["goods-in","Barang Masuk",PackagePlus],
 ["goods-out","Barang Keluar",PackageMinus],["stock","Rekap Gudang",Boxes],
 ["audit","Analisis & Audit",BarChart3]
] as const;

export default function Dashboard(){
 const [session,setSession]=useState<any>(null);
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [authError,setAuthError]=useState("");
 const [tab,setTab]=useState("dashboard");
 const [cash,setCash]=useState<Cash[]>([]); const [items,setItems]=useState<Item[]>([]);
 const [moves,setMoves]=useState<Move[]>([]); const [opening,setOpening]=useState<Opening[]>([]);
 const [from,setFrom]=useState(new Date().toLocaleDateString("en-CA").slice(0,8)+"01");
 const [to,setTo]=useState(today()); const [showForm,setShowForm]=useState(false);
 const [kind,setKind]=useState<"cash"|"move"|"item">("cash"); const [busy,setBusy]=useState(false); const [error,setError]=useState("");

 useEffect(()=>{ getSupabaseClient().auth.getSession().then(({data})=>setSession(data.session)); const {data:{subscription}}=getSupabaseClient().auth.onAuthStateChange((_e,s)=>setSession(s)); return()=>subscription.unsubscribe(); },[]);
 useEffect(()=>{ if(session) load(); },[session,from,to]);

 async function load(){
   setError("");
   const [c,i,m,o]=await Promise.all([
    getSupabaseClient().from("cash_transactions").select("id,transaction_date,type,category,description,amount,party").gte("transaction_date",from).lte("transaction_date",to).order("transaction_date",{ascending:true}),
    getSupabaseClient().from("inventory_items").select("id,sku,name,unit,cost").order("name"),
    getSupabaseClient().from("inventory_movements").select("id,movement_date,type,item_id,qty,unit_cost,party").gte("movement_date",from).lte("movement_date",to).order("movement_date",{ascending:true}),
    getSupabaseClient().from("inventory_opening_balances").select("id,period_start,item_id,opening_qty").eq("period_start",from)
   ]);
   const first=[c,i,m,o].find(x=>x.error); if(first?.error){setError(first.error.message);return;}
   setCash(c.data??[]); setItems(i.data??[]); setMoves(m.data??[]); setOpening(o.data??[]);
 }
 async function signIn(e:FormEvent){e.preventDefault();setAuthError("");const {data,error}=await getSupabaseClient().auth.signInWithPassword({email,password});if(error)setAuthError(error.message);else setSession(data.session);}
 async function signOut(){await getSupabaseClient().auth.signOut();setSession(null);}

 const cashIn=useMemo(()=>cash.filter(x=>x.type==="in").reduce((a,b)=>a+Number(b.amount),0),[cash]);
 const cashOut=useMemo(()=>cash.filter(x=>x.type==="out").reduce((a,b)=>a+Number(b.amount),0),[cash]);
 const goodsIn=useMemo(()=>moves.filter(x=>x.type==="in").reduce((a,b)=>a+Number(b.qty),0),[moves]);
 const goodsOut=useMemo(()=>moves.filter(x=>x.type==="out").reduce((a,b)=>a+Number(b.qty),0),[moves]);
 const stock=useMemo(()=>items.map(item=>{
   const open=opening.find(x=>x.item_id===item.id)?.opening_qty??0;
   const ins=moves.filter(x=>x.item_id===item.id&&x.type==="in").reduce((a,b)=>a+Number(b.qty),0);
   const outs=moves.filter(x=>x.item_id===item.id&&x.type==="out").reduce((a,b)=>a+Number(b.qty),0);
   return {item,open,ins,outs,close:open+ins-outs};
 }),[items,opening,moves]);

 async function addCash(e:FormEvent<HTMLFormElement>){
   e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);
   const payload={transaction_date:String(f.get("date")),type:String(f.get("type")),category:String(f.get("category")),description:String(f.get("description")),amount:Number(f.get("amount")),party:String(f.get("party")||"")};
   const {data,error}=await getSupabaseClient().from("cash_transactions").insert({...payload,created_by:session.user.id}).select("id,transaction_date,type,category,description,amount,party").single();
   if(error)setError(error.message);else{setShowForm(false);await load();}setBusy(false);
 }
 async function addMove(e:FormEvent<HTMLFormElement>){
   e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);
   const payload={movement_date:String(f.get("date")),type:String(f.get("type")),item_id:String(f.get("item_id")),qty:Number(f.get("qty")),unit_cost:Number(f.get("unit_cost")||0),party:String(f.get("party")||"")};
   const {data,error}=await getSupabaseClient().from("inventory_movements").insert({...payload,created_by:session.user.id}).select("id,movement_date,type,item_id,qty,unit_cost,party").single();
   if(error)setError(error.message);else{setShowForm(false);await load();}setBusy(false);
 }
 async function addItem(e:FormEvent<HTMLFormElement>){
   e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);
   const payload={sku:String(f.get("sku")).trim(),name:String(f.get("name")).trim(),unit:String(f.get("unit")).trim(),cost:Number(f.get("cost")||0)};
   const {data,error}=await getSupabaseClient().from("inventory_items").insert(payload).select("id,sku,name,unit,cost").single();
   if(error)setError(error.message);else{setShowForm(false);await load();}setBusy(false);
 }

 if(!session)return <AuthPanel />;

 const cashRows=cash.filter(x=>tab==="cash-in"?x.type==="in":tab==="cash-out"?x.type==="out":true);
 const moveRows=moves.filter(x=>tab==="goods-in"?x.type==="in":tab==="goods-out"?x.type==="out":true);
 const grouped=(rows:any[],dateKey:string)=>Object.entries(rows.reduce((a,r)=>{(a[r[dateKey]]??=[]).push(r);return a},{} as Record<string,any[]>));
 const open=(k:"cash"|"move"|"item")=>{setKind(k);setShowForm(true);};

 return <div className="app">
  <aside className="sidebar"><div className="brand">LAPORAN HARIAN<small>KEUANGAN & INVENTORY</small></div><div className="nav">{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={16}/>{label}</button>)}</div><div className="sidefoot"><ClipboardList size={15}/> Data tersimpan · RLS aktif</div></aside>
  <main className="main">
   <header className="top"><div><div className="eyebrow">SISTEM GUDANG · TERHUBUNG SUPABASE</div><h1 className="title">{tabs.find(([id])=>id===tab)?.[1]}</h1><div className="date"><CalendarDays size={14}/> {fmtDate(from)} — {fmtDate(to)}</div></div><div className="topactions"><button className="btn" onClick={load}>Muat ulang</button><button className="btn" onClick={()=>window.print()}><Printer size={16}/> Cetak</button><button className="iconbtn" title="Keluar" onClick={signOut}><LogOut size={17}/></button></div></header>
   <div className="period card"><div><span className="label">Dari</span><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></div><div><span className="label">Sampai</span><input type="date" value={to} onChange={e=>setTo(e.target.value)}/></div><div className="periodnote">Semua rekap mengikuti periode aktif.</div></div>
   {error&&<div className="formerror globalerror">{error}</div>}
   {tab==="dashboard"&&<><div className="grid"><Metric label="Total Pemasukan" value={rupiah(cashIn)} note={cash.filter(x=>x.type==="in").length+" transaksi"} cls="positive"/><Metric label="Total Pengeluaran" value={rupiah(cashOut)} note={cash.filter(x=>x.type==="out").length+" transaksi"} cls="negative"/><Metric label="Saldo Bersih" value={rupiah(cashIn-cashOut)} note="Pemasukan − pengeluaran" cls={cashIn-cashOut>=0?"positive":"negative"}/><Metric label="Pergerakan Barang" value={number(goodsIn-goodsOut)+" unit"} note="Masuk − keluar"/></div><section className="section card"><div className="sectionhead"><div><h2>Kontrol periode</h2><div className="muted">Data aktual dari database, bukan data contoh.</div></div></div><div className="workflow"><span>1. Stok awal</span><b>→</b><span>2. Barang masuk</span><b>→</b><span>3. Barang keluar</span><b>→</b><span>4. Stok akhir</span><b>·</b><span>Kas masuk − kas keluar</span></div></section><section className="section card"><div className="sectionhead"><h2>Rekap stok</h2><button className="btn" onClick={()=>setTab("stock")}>Buka rekap</button></div><StockTable rows={stock}/></section></>}
   {(tab==="cash-in"||tab==="cash-out")&&<section className="section card"><div className="sectionhead"><div><h2>{tab==="cash-in"?"Pemasukan":"Pengeluaran"}</h2><div className="muted">Transaksi tersimpan permanen setelah berhasil disimpan.</div></div><button className="btn primary" onClick={()=>open("cash")}><Plus size={15}/> Tambah</button></div><div className="daylist">{grouped(cashRows,"transaction_date").map(([d,rows])=><div className="dayblock" key={d as string}><div className="daytitle"><strong>{fmtDate(d as string)}</strong><span>{rupiah((rows as Cash[]).reduce((a,b)=>a+Number(b.amount),0))}</span></div>{(rows as Cash[]).map(x=><div className="entry" key={x.id}><div><b>{x.description}</b><small>{x.category}{x.party?" · "+x.party:""}</small></div><strong>{rupiah(Number(x.amount))}</strong></div>)}</div>)}</div><div className="grandtotal">TOTAL <strong>{rupiah(tab==="cash-in"?cashIn:cashOut)}</strong></div></section>}
   {(tab==="goods-in"||tab==="goods-out")&&<section className="section card"><div className="sectionhead"><div><h2>{tab==="goods-in"?"Barang Gudang Masuk":"Barang Gudang Keluar"}</h2><div className="muted">Pergerakan stok tersimpan dengan item dan pengguna.</div></div><button className="btn primary" onClick={()=>open("move")}><Plus size={15}/> Tambah</button></div><div className="daylist">{grouped(moveRows,"movement_date").map(([d,rows])=><div className="dayblock" key={d as string}><div className="daytitle"><strong>{fmtDate(d as string)}</strong><span>{number((rows as Move[]).reduce((a,b)=>a+Number(b.qty),0))} unit</span></div>{(rows as Move[]).map(x=>{const it=items.find(i=>i.id===x.item_id);return <div className="entry" key={x.id}><div><b>{it?.name??"Item tidak ditemukan"} · {number(Number(x.qty))} {it?.unit??""}</b><small>{x.party??"—"}</small></div><strong>{x.unit_cost?rupiah(Number(x.qty)*Number(x.unit_cost)):"—"}</strong></div>})}</div>)}</div><div className="grandtotal">TOTAL BARANG <strong>{number(tab==="goods-in"?goodsIn:goodsOut)} unit</strong></div></section>}
   {tab==="stock"&&<section className="section card"><div className="sectionhead"><div><h2>Rekap Gudang</h2><div className="muted">Tambahkan master barang sebelum mencatat pergerakan.</div></div><button className="btn primary" onClick={()=>open("item")}><Plus size={15}/> Master Barang</button></div><StockTable rows={stock}/><div className="stocksummary"><div><span>Masuk</span><b>{number(goodsIn)}</b></div><div><span>Keluar</span><b>{number(goodsOut)}</b></div><div><span>Sisa bersih</span><b>{number(goodsIn-goodsOut)}</b></div></div></section>}
   {tab==="audit"&&<section className="section"><div className="grid"><Metric label="Arus Kas" value={rupiah(cashIn-cashOut)} note={rupiah(cashIn)+" − "+rupiah(cashOut)}/><Metric label="Aktivitas Stok" value={number(goodsIn+goodsOut)+" unit"} note="Total pergerakan"/><Metric label="Nilai Barang Masuk" value={rupiah(moves.filter(x=>x.type==="in").reduce((a,b)=>a+Number(b.qty)*Number(b.unit_cost??0),0))} note="Berdasarkan unit cost"/><Metric label="Kontrol" value="RLS aktif" note="Akses hanya user terautentikasi"/></div><section className="card section"><h2>Checklist audit</h2><ul className="checks"><li>✓ Data periode diambil langsung dari Supabase.</li><li>✓ Pemasukan dan pengeluaran dipisahkan.</li><li>✓ Barang masuk dan keluar dipisahkan.</li><li>✓ Stok akhir dihitung: saldo awal + masuk − keluar.</li><li>✓ Setiap entri mencatat created_by.</li><li>✓ Perubahan yang dibuat aplikasi dicatat ke audit_logs.</li></ul></section></section>}
  </main>
  <div className="mobilebar">{tabs.slice(0,5).map(([id,label,Icon])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={17}/><span>{label}</span></button>)}</div>
  {showForm&&<div className="modalback" onMouseDown={()=>!busy&&setShowForm(false)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modalhead"><div><b>{kind==="cash"?"Tambah Transaksi Kas":kind==="move"?"Tambah Pergerakan Barang":"Tambah Master Barang"}</b><small>Perubahan akan tersimpan ke Supabase.</small></div><button className="iconbtn" onClick={()=>setShowForm(false)}><X size={18}/></button></div>{kind==="cash"?<form onSubmit={addCash} className="formgrid"><label>Tanggal<input name="date" type="date" defaultValue={today()} required/></label><label>Jenis<select name="type" defaultValue={tab==="cash-out"?"out":"in"}><option value="in">Pemasukan</option><option value="out">Pengeluaran</option></select></label><label>Kategori<input name="category" required/></label><label>Nominal<input name="amount" type="number" min="0" required/></label><label className="wide">Uraian<input name="description" required/></label><label>Pihak<input name="party"/></label><button className="btn primary wide" disabled={busy}>{busy?"Menyimpan…":"Simpan transaksi"}</button></form>:kind==="move"?<form onSubmit={addMove} className="formgrid"><label>Tanggal<input name="date" type="date" defaultValue={today()} required/></label><label>Jenis<select name="type" defaultValue={tab==="goods-out"?"out":"in"}><option value="in">Barang masuk</option><option value="out">Barang keluar</option></select></label><label className="wide">Barang<select name="item_id" required><option value="">Pilih barang</option>{items.map(i=><option value={i.id} key={i.id}>{i.name} · {i.sku}</option>)}</select></label><label>Qty<input name="qty" type="number" min="0.001" step="0.001" required/></label><label>Harga modal<input name="unit_cost" type="number" min="0" step="0.01"/></label><label className="wide">Pihak / toko<input name="party"/></label><button className="btn primary wide" disabled={busy}>{busy?"Menyimpan…":"Simpan pergerakan"}</button></form>:<form onSubmit={addItem} className="formgrid"><label>SKU<input name="sku" required/></label><label>Satuan<input name="unit" defaultValue="pcs" required/></label><label className="wide">Nama barang<input name="name" required/></label><label className="wide">Harga modal<input name="cost" type="number" min="0" step="0.01"/></label><button className="btn primary wide" disabled={busy}>{busy?"Menyimpan…":"Simpan master barang"}</button></form>}</div></div>}
 </div>
}

function Metric({label,value,note,cls=""}:{label:string,value:string,note:string,cls?:string}){return <div className="card"><div className="label">{label}</div><div className={"value "+cls}>{value}</div><div className="muted">{note}</div></div>}
function StockTable({rows}:{rows:{item:Item;open:number;ins:number;outs:number;close:number}[]}){return <div className="tablewrap"><table className="table"><thead><tr><th>Barang</th><th>Sisa awal</th><th>Masuk</th><th>Keluar</th><th>Sisa</th></tr></thead><tbody>{rows.length?rows.map(r=><tr key={r.item.id}><td><b>{r.item.name}</b><small>{r.item.sku} · {r.item.unit}</small></td><td>{number(r.open)}</td><td className="positive">+{number(r.ins)}</td><td className="negative">−{number(r.outs)}</td><td><b>{number(r.close)}</b></td></tr>):<tr><td colSpan={5} className="muted">Belum ada master barang.</td></tr>}</tbody></table></div>}
