"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  PackageMinus,
  PackagePlus,
  Plus,
  Printer,
  WalletCards,
  X,
} from "lucide-react";

type CashType = "in" | "out";
type MoveType = "in" | "out";

type Cash = {
  id: number;
  date: string;
  type: CashType;
  category: string;
  description: string;
  amount: number;
  party?: string;
};

type Move = {
  id: number;
  date: string;
  type: MoveType;
  item: string;
  qty: number;
  unit: string;
  party: string;
  unitValue?: number;
};

type Opening = { item: string; qty: number; unit: string };

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const number = (n: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(n);
const localToday = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const seedOpening: Opening[] = [
  { item: "TM", qty: 19, unit: "box" },
  { item: "Kuning", qty: 5, unit: "pot" },
  { item: "Tri", qty: 8, unit: "box" },
];

const seedCash: Cash[] = [
  { id: 1001, date: "2024-10-01", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 1 Oktober", amount: 4000000 },
  { id: 1002, date: "2024-10-02", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 2 Oktober", amount: 4100000 },
  { id: 1003, date: "2024-10-03", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 3 Oktober", amount: 3800000 },
  { id: 1004, date: "2024-10-04", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 4 Oktober", amount: 4650000 },
  { id: 1005, date: "2024-10-05", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 5 Oktober", amount: 5900000 },
  { id: 1006, date: "2024-10-06", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 6 Oktober", amount: 6000000 },
  { id: 1007, date: "2024-10-07", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 7 Oktober", amount: 6000000 },
  { id: 1008, date: "2024-10-08", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 8 Oktober", amount: 7000000 },
  { id: 1009, date: "2024-10-09", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 9 Oktober", amount: 5800000 },
  { id: 1010, date: "2024-10-10", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 10 Oktober", amount: 6050000 },
  { id: 1011, date: "2024-10-11", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 11 Oktober", amount: 5800000 },
  { id: 1012, date: "2024-10-12", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 12 Oktober", amount: 6150000 },
  { id: 1013, date: "2024-10-13", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 13 Oktober", amount: 5000000 },
  { id: 1014, date: "2024-10-14", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 14 Oktober", amount: 5100000 },
  { id: 1015, date: "2024-10-15", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 15 Oktober", amount: 5250000 },
  { id: 1016, date: "2024-10-16", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 16 Oktober", amount: 5500000 },
  { id: 1017, date: "2024-10-17", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 17 Oktober", amount: 5150000 },
  { id: 1018, date: "2024-10-18", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 18 Oktober", amount: 6150000 },
  { id: 1019, date: "2024-10-19", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 19 Oktober", amount: 7600000 },
  { id: 1020, date: "2024-10-20", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 20 Oktober", amount: 4750000 },
  { id: 1021, date: "2024-10-21", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 21 Oktober", amount: 3850000 },
  { id: 1022, date: "2024-10-22", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 22 Oktober", amount: 4400000 },
  { id: 1023, date: "2024-10-23", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 23 Oktober", amount: 3500000 },
  { id: 1024, date: "2024-10-24", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 24 Oktober", amount: 5350000 },
  { id: 1025, date: "2024-10-25", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 25 Oktober", amount: 5200000 },
  { id: 1026, date: "2024-10-26", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 26 Oktober", amount: 5450000 },
  { id: 1027, date: "2024-10-27", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 27 Oktober", amount: 4100000 },
  { id: 1028, date: "2024-10-28", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 28 Oktober", amount: 4300000 },
  { id: 1029, date: "2024-10-29", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 29 Oktober", amount: 4500000 },
  { id: 1030, date: "2024-10-30", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 30 Oktober", amount: 4550000 },
  { id: 1031, date: "2024-10-31", type: "in", category: "Pemasukan gudang", description: "Pemasukan tanggal 31 Oktober", amount: 0 },
  { id: 1, date: "2024-10-01", type: "out", category: "Gaji", description: "Gaji Rop", amount: 4000000 },
  { id: 2, date: "2024-10-01", type: "out", category: "Transfer", description: "TF BG Narsin", amount: 350000 },
  { id: 3, date: "2024-10-02", type: "out", category: "Gaji", description: "Gaji Wan", amount: 2700000 },
  { id: 4, date: "2024-10-02", type: "out", category: "Gaji", description: "Gaji Obat", amount: 1400000 },
  { id: 5, date: "2024-10-03", type: "out", category: "Gaji", description: "Gaji Wan", amount: 1300000 },
  { id: 6, date: "2024-10-03", type: "out", category: "Transfer", description: "TF Basyir", amount: 200000 },
  { id: 7, date: "2024-10-03", type: "out", category: "Kasbon", description: "Kasbon Del", amount: 100000 },
  { id: 8, date: "2024-10-05", type: "out", category: "Gaji", description: "Gaji Rop", amount: 3600000 },
  { id: 9, date: "2024-10-05", type: "out", category: "Transfer", description: "TF Basyir", amount: 1000000 },
  { id: 10, date: "2024-10-06", type: "out", category: "Transfer", description: "TF Basyir", amount: 700000 },
  { id: 11, date: "2024-10-06", type: "out", category: "Gaji", description: "Gaji Andre", amount: 250000 },
  { id: 12, date: "2024-10-06", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 5600000 },
  { id: 13, date: "2024-10-08", type: "out", category: "Pinjaman", description: "Pinjaman Andre", amount: 300000 },
  { id: 14, date: "2024-10-08", type: "out", category: "Transfer", description: "TF Kak Ir", amount: 6050000 },
  { id: 15, date: "2024-10-09", type: "out", category: "Gaji", description: "Gaji Rop", amount: 100000 },
  { id: 16, date: "2024-10-09", type: "out", category: "Gaji", description: "Andre", amount: 200000 },
  { id: 17, date: "2024-10-09", type: "out", category: "Kasbon", description: "Kess ambil obat", amount: 5500000 },
  { id: 18, date: "2024-10-10", type: "out", category: "Gaji", description: "Del", amount: 150000 },
  { id: 19, date: "2024-10-10", type: "out", category: "Pinjaman", description: "Pinjaman Wan", amount: 2000000 },
  { id: 20, date: "2024-10-10", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 5700000 },
  { id: 21, date: "2024-10-11", type: "out", category: "Transfer", description: "TF Kordi Arif", amount: 3000000 },
  { id: 22, date: "2024-10-11", type: "out", category: "Gaji", description: "Andre", amount: 100000 },
  { id: 23, date: "2024-10-11", type: "out", category: "Gaji", description: "Del", amount: 100000 },
  { id: 24, date: "2024-10-11", type: "out", category: "Kasbon", description: "Ambil obat basyir", amount: 2600000 },
  { id: 25, date: "2024-10-11", type: "out", category: "Kasbon", description: "Kasih Kess Basyir", amount: 4500000 },
  { id: 26, date: "2024-10-12", type: "out", category: "Gaji", description: "Andre", amount: 300000 },
  { id: 27, date: "2024-10-12", type: "out", category: "Pinjaman", description: "Pinjaman Wan", amount: 10000000 },
  { id: 28, date: "2024-10-12", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 4800000 },
  { id: 29, date: "2024-10-13", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 3000000 },
  { id: 30, date: "2024-10-13", type: "out", category: "Transfer", description: "TF Kordi Arif", amount: 2000000 },
  { id: 31, date: "2024-10-14", type: "out", category: "Gaji", description: "Andre", amount: 300000 },
  { id: 32, date: "2024-10-14", type: "out", category: "Transfer", description: "TF Andre", amount: 1000000 },
  { id: 33, date: "2024-10-14", type: "out", category: "Gaji", description: "TF Kak Ir", amount: 2500000 },
  { id: 34, date: "2024-10-14", type: "out", category: "Transfer", description: "TF Obat Basyir", amount: 1300000 },
  { id: 35, date: "2024-10-15", type: "out", category: "Gaji", description: "Anggota Andre", amount: 350000 },
  { id: 36, date: "2024-10-15", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 4900000 },
  { id: 37, date: "2024-10-16", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 5500000 },
  { id: 38, date: "2024-10-17", type: "out", category: "Gaji", description: "Anggota Andre", amount: 300000 },
  { id: 39, date: "2024-10-17", type: "out", category: "Kasbon", description: "Delo", amount: 200000 },
  { id: 40, date: "2024-10-17", type: "out", category: "Pinjaman", description: "Pinjaman Wan", amount: 1000000 },
  { id: 41, date: "2024-10-17", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 3650000 },
  { id: 42, date: "2024-10-18", type: "out", category: "Gaji", description: "Anggota Andre", amount: 250000 },
  { id: 43, date: "2024-10-18", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 5900000 },
  { id: 44, date: "2024-10-19", type: "out", category: "Gaji", description: "Andre", amount: 100000 },
  { id: 45, date: "2024-10-19", type: "out", category: "Transfer", description: "BG BG Erik", amount: 1000000 },
  { id: 46, date: "2024-10-19", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 6500000 },
  { id: 47, date: "2024-10-20", type: "out", category: "Gaji", description: "bn Erik", amount: 500000 },
  { id: 48, date: "2024-10-20", type: "out", category: "Transfer", description: "bayar obat Rp", amount: 4250000 },
  { id: 49, date: "2024-10-21", type: "out", category: "Gaji", description: "TF BG Nasir", amount: 350000 },
  { id: 50, date: "2024-10-21", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 2300000 },
  { id: 51, date: "2024-10-21", type: "out", category: "Kasbon", description: "Andre", amount: 100000 },
  { id: 52, date: "2024-10-21", type: "out", category: "Kasbon", description: "Delo", amount: 200000 },
  { id: 53, date: "2024-10-22", type: "out", category: "Pinjaman", description: "Pinjaman Wan", amount: 500000 },
  { id: 54, date: "2024-10-22", type: "out", category: "Gaji", description: "TF BG Nasir", amount: 220000 },
  { id: 55, date: "2024-10-23", type: "out", category: "Transfer", description: "TF BG Nasir", amount: 500000 },
  { id: 56, date: "2024-10-23", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 3500000 },
  { id: 57, date: "2024-10-24", type: "out", category: "Gaji", description: "Anggota BG Andre", amount: 50000 },
  { id: 58, date: "2024-10-24", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 5300000 },
  { id: 59, date: "2024-10-25", type: "out", category: "Gaji", description: "BG andre", amount: 100000 },
  { id: 60, date: "2024-10-25", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 5100000 },
  { id: 61, date: "2024-10-26", type: "out", category: "Gaji", description: "TF bg nasir", amount: 350000 },
  { id: 62, date: "2024-10-26", type: "out", category: "Kasbon", description: "Tiso dan grab", amount: 300000 },
  { id: 63, date: "2024-10-26", type: "out", category: "Gaji", description: "Anggota bg andre", amount: 100000 },
  { id: 64, date: "2024-10-26", type: "out", category: "Pinjaman", description: "Pinjaman wan", amount: 200000 },
  { id: 65, date: "2024-10-26", type: "out", category: "Gaji", description: "Gembok ippo", amount: 100000 },
  { id: 66, date: "2024-10-26", type: "out", category: "Transfer", description: "TF bg nasir", amount: 3900000 },
  { id: 67, date: "2024-10-27", type: "out", category: "Gaji", description: "Anggota BG Andre", amount: 200000 },
  { id: 68, date: "2024-10-27", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 3900000 },
  { id: 69, date: "2024-10-28", type: "out", category: "Gaji", description: "TF BG Jeck", amount: 150000 },
  { id: 70, date: "2024-10-28", type: "out", category: "Gaji", description: "Anggota BG Andre", amount: 100000 },
  { id: 71, date: "2024-10-28", type: "out", category: "Pinjaman", description: "Pinjaman Wan", amount: 300000 },
  { id: 72, date: "2024-10-28", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 3700000 },
  { id: 73, date: "2024-10-29", type: "out", category: "Gaji", description: "TF BG Nasir", amount: 220000 },
  { id: 74, date: "2024-10-29", type: "out", category: "Transfer", description: "TF Obat Syarif", amount: 4000000 },
  { id: 75, date: "2024-10-30", type: "out", category: "Transfer", description: "TF BG andre", amount: 1500000 },
  { id: 76, date: "2024-10-30", type: "out", category: "Gaji", description: "TF BG Nasir", amount: 300000 },
  { id: 77, date: "2024-10-30", type: "out", category: "Transfer", description: "TF Kak Irma", amount: 2900000 },
];

const seedMove: Move[] = [
  { id: 1, date: "2024-10-01", type: "in", item: "TM", qty: 220, unit: "box", party: "Gudang", unitValue: 95000 },
  { id: 2, date: "2024-10-01", type: "in", item: "Kuning", qty: 7, unit: "pot", party: "Gudang", unitValue: 650 },
  { id: 3, date: "2024-10-01", type: "in", item: "Tri", qty: 10, unit: "box", party: "Gudang", unitValue: 800 },
  { id: 4, date: "2024-10-01", type: "in", item: "YY", qty: 12, unit: "pot", party: "Gudang", unitValue: 700 },
  { id: 5, date: "2024-10-09", type: "in", item: "TM", qty: 150, unit: "box", party: "Gudang", unitValue: 93000 },
  { id: 6, date: "2024-10-09", type: "in", item: "Kuning", qty: 6, unit: "pot", party: "Gudang", unitValue: 600 },
  { id: 7, date: "2024-10-11", type: "in", item: "TM", qty: 170, unit: "box", party: "Gudang", unitValue: 94000 },
  { id: 8, date: "2024-10-11", type: "in", item: "Kuning", qty: 30, unit: "pot", party: "Gudang", unitValue: 700 },
  { id: 9, date: "2024-10-11", type: "in", item: "Tri", qty: 5, unit: "box", party: "Gudang", unitValue: 65000 },
  { id: 10, date: "2024-10-11", type: "in", item: "YY", qty: 30, unit: "pot", party: "Gudang", unitValue: 700 },
  { id: 11, date: "2024-10-20", type: "in", item: "TM", qty: 250, unit: "box", party: "Gudang", unitValue: 90000 },
  { id: 12, date: "2024-10-20", type: "in", item: "Kuning", qty: 23, unit: "pot", party: "Gudang", unitValue: 650 },
  { id: 13, date: "2024-10-20", type: "in", item: "Tri", qty: 18, unit: "box", party: "Gudang", unitValue: 65000 },
  { id: 14, date: "2024-10-20", type: "in", item: "YY", qty: 2, unit: "pot", party: "Gudang", unitValue: 700 },
  { id: 15, date: "2024-10-05", type: "out", item: "TM", qty: 40, unit: "box", party: "Toko Kuning" },
  { id: 16, date: "2024-10-05", type: "out", item: "Kuning", qty: 11, unit: "pot", party: "Toko Kuning" },
  { id: 17, date: "2024-10-05", type: "out", item: "Tri", qty: 5, unit: "box", party: "Toko Kuning" },
  { id: 18, date: "2024-10-13", type: "out", item: "TM", qty: 20, unit: "box", party: "Toko Pintu 10" },
  { id: 19, date: "2024-10-16", type: "out", item: "TM", qty: 30, unit: "box", party: "Toko Pintu 10" },
  { id: 20, date: "2024-10-16", type: "out", item: "Kuning", qty: 2, unit: "pot", party: "Toko Pintu 10" },
  { id: 21, date: "2024-10-16", type: "out", item: "Tri", qty: 1, unit: "box", party: "Toko Pintu 10" },
  { id: 22, date: "2024-10-20", type: "out", item: "TM", qty: 30, unit: "box", party: "Toko Pintu 10" },
  { id: 23, date: "2024-10-20", type: "out", item: "Kuning", qty: 2, unit: "pot", party: "Toko Pintu 10" },
  { id: 24, date: "2024-10-20", type: "out", item: "Tri", qty: 1, unit: "box", party: "Toko Pintu 10" },
];

const tabs = [
  ["dashboard", "Ringkasan", LayoutDashboard],
  ["cash-in", "Pemasukan", PackagePlus],
  ["cash-out", "Pengeluaran", PackageMinus],
  ["goods-in", "Barang Masuk", PackagePlus],
  ["goods-out", "Barang Keluar", PackageMinus],
  ["stock", "Rekap Gudang", Boxes],
  ["audit", "Analisis & Audit", BarChart3],
] as const;

const fmtDate = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));

export default function Dashboard() {
  const [tab, setTab] = useState("dashboard");
  const [cash, setCash] = useState<Cash[]>(seedCash);
  const [moves, setMoves] = useState<Move[]>(seedMove);
  const [opening] = useState(seedOpening);
  const [from, setFrom] = useState("2024-10-01");
  const [to, setTo] = useState("2024-10-31");
  const [showForm, setShowForm] = useState(false);
  const [formKind, setFormKind] = useState<"cash" | "move">("cash");

  const periodCash = useMemo(() => cash.filter((x) => x.date >= from && x.date <= to), [cash, from, to]);
  const periodMoves = useMemo(() => moves.filter((x) => x.date >= from && x.date <= to), [moves, from, to]);
  const cashIn = useMemo(() => periodCash.filter((x) => x.type === "in").reduce((a, b) => a + b.amount, 0), [periodCash]);
  const cashOut = useMemo(() => periodCash.filter((x) => x.type === "out").reduce((a, b) => a + b.amount, 0), [periodCash]);
  const goodsIn = useMemo(() => periodMoves.filter((x) => x.type === "in").reduce((a, b) => a + b.qty, 0), [periodMoves]);
  const goodsOut = useMemo(() => periodMoves.filter((x) => x.type === "out").reduce((a, b) => a + b.qty, 0), [periodMoves]);
  const balance = cashIn - cashOut;

  const stockRows = useMemo(() => {
    const names = [...new Set([...opening.map((x) => x.item), ...periodMoves.map((x) => x.item)])];
    return names.map((item) => {
      const open = opening.find((x) => x.item === item);
      const ins = periodMoves.filter((x) => x.item === item && x.type === "in").reduce((a, b) => a + b.qty, 0);
      const outs = periodMoves.filter((x) => x.item === item && x.type === "out").reduce((a, b) => a + b.qty, 0);
      return { item, unit: open?.unit ?? periodMoves.find((x) => x.item === item)?.unit ?? "unit", open: open?.qty ?? 0, ins, outs, close: (open?.qty ?? 0) + ins - outs };
    });
  }, [opening, periodMoves]);

  const groupedCash = useMemo(() => {
    const groups = new Map<string, Cash[]>();
    periodCash.filter((x) => (tab === "cash-in" ? x.type === "in" : tab === "cash-out" ? x.type === "out" : true)).forEach((row) => groups.set(row.date, [...(groups.get(row.date) ?? []), row]));
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [periodCash, tab]);

  const groupedMoves = useMemo(() => {
    const groups = new Map<string, Move[]>();
    periodMoves.filter((x) => (tab === "goods-in" ? x.type === "in" : tab === "goods-out" ? x.type === "out" : true)).forEach((row) => groups.set(row.date, [...(groups.get(row.date) ?? []), row]));
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [periodMoves, tab]);

  const addCash = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setCash((current) => [...current, { id: Date.now(), date: String(form.get("date")), type: String(form.get("type")) as CashType, category: String(form.get("category")), description: String(form.get("description")), amount: Number(form.get("amount")), party: String(form.get("party") ?? "") }]);
    setShowForm(false);
  };

  const addMove = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMoves((current) => [...current, { id: Date.now(), date: String(form.get("date")), type: String(form.get("type")) as MoveType, item: String(form.get("item")), qty: Number(form.get("qty")), unit: String(form.get("unit")), party: String(form.get("party")) }]);
    setShowForm(false);
  };

  const openForm = (kind: "cash" | "move") => { setFormKind(kind); setShowForm(true); };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">LAPORAN HARIAN<small>KEUANGAN & INVENTORY</small></div>
        <div className="nav">{tabs.map(([id, label, Icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={16} />{label}</button>)}</div>
        <div className="sidefoot"><ClipboardList size={15} /> Rekap gudang harian</div>
      </aside>

      <main className="main">
        <header className="top">
          <div><div className="eyebrow">REKAP BY RJ · SISTEM GUDANG</div><h1 className="title">{tabs.find(([id]) => id === tab)?.[1]}</h1><div className="date"><CalendarDays size={14} /> {fmtDate(from)} — {fmtDate(to)}</div></div>
          <button className="btn primary" onClick={() => window.print()}><Printer size={16} /> Cetak</button>
        </header>

        <div className="period card">
          <div><span className="label">Dari</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><span className="label">Sampai</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <div className="periodnote">Semua rekap, stok dan analisis mengikuti periode ini.</div>
        </div>

        <div className="notice"><strong>Mode demo aman.</strong> Struktur ini sudah mengikuti pola kerja pada foto: stok awal bulan → barang masuk → barang keluar → pemasukan → pengeluaran → total → stok akhir. Saat Supabase production tersedia, data akan dipindahkan ke database dengan RLS dan audit trail.</div>

        {tab === "dashboard" && <>
          <div className="grid">
            <div className="card"><div className="label">Total Pemasukan</div><div className="value positive">{rupiah(cashIn)}</div><div className="muted">{periodCash.filter((x) => x.type === "in").length} transaksi</div></div>
            <div className="card"><div className="label">Total Pengeluaran</div><div className="value negative">{rupiah(cashOut)}</div><div className="muted">{periodCash.filter((x) => x.type === "out").length} transaksi</div></div>
            <div className="card"><div className="label">Saldo Bersih</div><div className={"value " + (balance >= 0 ? "positive" : "negative")}>{rupiah(balance)}</div><div className="muted">Pemasukan − pengeluaran</div></div>
            <div className="card"><div className="label">Barang Bersih</div><div className="value">{number(goodsIn - goodsOut)} unit</div><div className="muted">Masuk − keluar</div></div>
          </div>
          <section className="section card"><div className="sectionhead"><div><h2>Alur kerja laporan</h2><div className="muted">Persis mengikuti logika buku gudang pada referensi.</div></div></div><div className="workflow"><span>1. Stok awal</span><b>→</b><span>2. Barang masuk</span><b>→</b><span>3. Barang keluar</span><b>→</b><span>4. Stok akhir</span><b>·</b><span>Kas masuk − kas keluar = saldo</span></div></section>
          <section className="section card"><div className="sectionhead"><h2>Ringkasan stok akhir</h2><button className="btn" onClick={() => setTab("stock")}>Buka rekap</button></div><StockTable rows={stockRows} /></section>
        </>}

        {(tab === "cash-in" || tab === "cash-out") && <section className="section card"><div className="sectionhead"><div><h2>{tab === "cash-in" ? "Masuk / Pemasukan" : "Keluar / Pengeluaran"}</h2><div className="muted">Entri boleh lebih dari satu dalam satu tanggal, lalu dijumlahkan otomatis.</div></div><button className="btn primary" onClick={() => openForm("cash")}><Plus size={15} /> Tambah</button></div><div className="daylist">{groupedCash.map(([date, rows]) => <div className="dayblock" key={date}><div className="daytitle"><strong>{fmtDate(date)}</strong><span>{rupiah(rows.reduce((a, b) => a + b.amount, 0))}</span></div>{rows.map((x) => <div className="entry" key={x.id}><div><b>{x.description}</b><small>{x.category}{x.party ? ` · ${x.party}` : ""}</small></div><strong>{rupiah(x.amount)}</strong></div>)}</div>)}</div><div className="grandtotal">TOTAL {tab === "cash-in" ? "PEMASUKAN" : "PENGELUARAN"}<strong>{rupiah(tab === "cash-in" ? cashIn : cashOut)}</strong></div></section>}

        {(tab === "goods-in" || tab === "goods-out") && <section className="section card"><div className="sectionhead"><div><h2>{tab === "goods-in" ? "Barang Gudang Masuk" : "Barang Gudang Keluar"}</h2><div className="muted">Setiap tanggal dapat memiliki beberapa item dan pihak/toko tujuan.</div></div><button className="btn primary" onClick={() => openForm("move")}><Plus size={15} /> Tambah</button></div><div className="daylist">{groupedMoves.map(([date, rows]) => <div className="dayblock" key={date}><div className="daytitle"><strong>{fmtDate(date)}</strong><span>{number(rows.reduce((a, b) => a + b.qty, 0))} unit</span></div>{rows.map((x) => <div className="entry" key={x.id}><div><b>{x.item} · {number(x.qty)} {x.unit}</b><small>{x.party}</small></div><strong>{x.unitValue ? rupiah(x.qty * x.unitValue) : "—"}</strong></div>)}</div>)}</div><div className="grandtotal">TOTAL BARANG {tab === "goods-in" ? "MASUK" : "KELUAR"}<strong>{number(tab === "goods-in" ? goodsIn : goodsOut)} unit</strong></div></section>}

        {tab === "stock" && <section className="section card"><div className="sectionhead"><div><h2>Total Barang Masuk / Keluar</h2><div className="muted">Rumus: stok awal + masuk − keluar = stok akhir.</div></div></div><StockTable rows={stockRows} /><div className="stocksummary"><div><span>Masuk</span><b>{number(goodsIn)}</b></div><div><span>Keluar</span><b>{number(goodsOut)}</b></div><div><span>Sisa bersih</span><b>{number(goodsIn - goodsOut)}</b></div></div></section>}

        {tab === "audit" && <section className="section"><div className="grid"><div className="card"><div className="label">Arus Kas</div><div className="value">{rupiah(balance)}</div><div className="muted">{rupiah(cashIn)} − {rupiah(cashOut)}</div></div><div className="card"><div className="label">Pergerakan Barang</div><div className="value">{number(goodsIn + goodsOut)} unit</div><div className="muted">Total aktivitas stok</div></div><div className="card"><div className="label">Nilai Barang Masuk</div><div className="value">{rupiah(periodMoves.filter(x => x.type === "in").reduce((a,b)=>a + b.qty*(b.unitValue ?? 0),0))}</div><div className="muted">Estimasi berdasarkan harga/unit yang dicatat</div></div><div className="card"><div className="label">Kontrol</div><div className="value">Aktif</div><div className="muted">Validasi tanggal, qty dan nominal wajib</div></div></div><section className="card section"><h2>Checklist audit</h2><ul className="checks"><li>✓ Stok awal bulan tercatat per item.</li><li>✓ Barang masuk dan barang keluar dipisahkan.</li><li>✓ Pemasukan dan pengeluaran memiliki tanggal, kategori, uraian dan nominal.</li><li>✓ Total per tanggal dan total periode dihitung otomatis.</li><li>✓ Stok akhir dihitung dari pergerakan, bukan angka manual.</li><li>✓ Production nantinya wajib memakai autentikasi + RLS + audit log.</li></ul></section></section>}
      </main>

      <div className="mobilebar">{tabs.slice(0, 5).map(([id, label, Icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon size={17}/><span>{label}</span></button>)}</div>

      {showForm && <div className="modalback" onMouseDown={() => setShowForm(false)}><div className="modal" onMouseDown={(e) => e.stopPropagation()}><div className="modalhead"><div><b>Tambah {formKind === "cash" ? "Transaksi Kas" : "Pergerakan Barang"}</b><small>Data hanya berada di browser pada mode demo.</small></div><button className="iconbtn" onClick={() => setShowForm(false)}><X size={18}/></button></div>{formKind === "cash" ? <form onSubmit={addCash} className="formgrid"><label>Tanggal<input name="date" type="date" defaultValue={localToday()} required/></label><label>Jenis<select name="type" defaultValue={tab === "cash-out" ? "out" : "in"}><option value="in">Pemasukan</option><option value="out">Pengeluaran</option></select></label><label>Kategori<input name="category" placeholder="Penjualan / Gaji / Transfer" required/></label><label>Nominal<input name="amount" type="number" min="0" step="1" placeholder="0" required/></label><label className="wide">Uraian<input name="description" placeholder="Contoh: Penerimaan penjualan" required/></label><label>Pihak<input name="party" placeholder="Opsional"/></label><button className="btn primary wide" type="submit">Simpan transaksi</button></form> : <form onSubmit={addMove} className="formgrid"><label>Tanggal<input name="date" type="date" defaultValue={localToday()} required/></label><label>Jenis<select name="type" defaultValue={tab === "goods-out" ? "out" : "in"}><option value="in">Barang masuk</option><option value="out">Barang keluar</option></select></label><label>Nama barang<input name="item" placeholder="TM / Kuning / Tri" required/></label><label>Qty<input name="qty" type="number" min="0.001" step="0.001" required/></label><label>Satuan<input name="unit" defaultValue="box" required/></label><label>Pihak / toko<input name="party" placeholder="Supplier / Toko tujuan" required/></label><button className="btn primary wide" type="submit">Simpan pergerakan</button></form>}</div></div>}
    </div>
  );
}

function StockTable({ rows }: { rows: { item: string; unit: string; open: number; ins: number; outs: number; close: number }[] }) {
  return <div className="tablewrap"><table className="table"><thead><tr><th>Barang</th><th>Sisa bulan lalu</th><th>Masuk</th><th>Keluar</th><th>Sisa</th></tr></thead><tbody>{rows.map((row) => <tr key={row.item}><td><b>{row.item}</b><small>{row.unit}</small></td><td>{number(row.open)}</td><td className="positive">+{number(row.ins)}</td><td className="negative">−{number(row.outs)}</td><td><b>{number(row.close)}</b></td></tr>)}</tbody></table></div>;
}
