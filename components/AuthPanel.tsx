"use client";

import { FormEvent, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function AuthPanel() {
  const [mode, setMode] = useState<"signin"|"signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const supabase = getSupabaseClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name.trim() || email } }
      });
      if (error) setError(error.message);
      else if (data.session) { await supabase.rpc("bootstrap_first_admin"); window.location.reload(); }
      else setMessage("Akun berhasil dibuat. Silakan cek email untuk verifikasi, lalu masuk.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else { await supabase.rpc("bootstrap_first_admin"); window.location.reload(); }
    }
    setBusy(false);
  }

  return <div className="authpage">
    <div className="authcard">
      <div className="authbrand"><span className="brandmark">LH</span><div><b>Laporan Harian</b><small>KEUANGAN · INVENTORY · AUDIT</small></div></div>
      <div className="authhero"><span className="eyebrow">SISTEM OPERASIONAL</span><h1>{mode === "signin" ? "Masuk ke sistem" : "Daftarkan akun"}</h1><p>{mode === "signin" ? "Kelola laporan kas, stok, transaksi, dan audit dalam satu dashboard terpusat." : "Akun pertama dapat dipromosikan sebagai admin setelah database production disiapkan."}</p></div>
      <form onSubmit={submit} className="authform">
        {mode === "signup" && <label>Nama pengguna<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama / operator" required /></label>}
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@perusahaan.id" required autoComplete="email" /></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimal 8 karakter" minLength={8} required autoComplete={mode==="signin"?"current-password":"new-password"} /></label>
        {error && <div className="formerror">{error}</div>}
        {message && <div className="formsuccess">{message}</div>}
        <button className="btn primary authsubmit" disabled={busy}>{busy ? "Memproses…" : mode === "signin" ? "Masuk aman" : "Buat akun"}</button>
      </form>
      <button className="authswitch" onClick={()=>{setMode(mode==="signin"?"signup":"signin");setError("");setMessage("")}}>
        {mode === "signin" ? "Belum punya akun? Daftar admin/operator pertama" : "Sudah punya akun? Masuk"}
      </button>
      <div className="authfoot"><span>RLS</span><span>Audit trail</span><span>Mobile ready</span></div>
    </div>
  </div>;
}
