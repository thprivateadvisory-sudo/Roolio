import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, Trophy, Target, Zap, Heart, MessageCircle,
  Shield, Gauge, MapPin, Calendar, Fuel, TrendingDown, TrendingUp,
  Send, Mic, ChevronRight, Award, Gift, Home, Store, Bot,
  CheckCircle2, Star, Car, Ticket, X, Settings, Edit3,
  ArrowUpRight, Plus, Flame, Crown, Lock, ArrowRight,
  SlidersHorizontal, Upload, Camera, PlayCircle, ShieldCheck,
  Briefcase, User, ShoppingCart, PartyPopper, Check, Coins,
  Package, BadgeCheck, Rocket, Timer, Dice5, HelpCircle,
  Lightbulb, Menu, Wallet, CalendarDays, Bell, LogOut,
  Share2, Clock, AlertTriangle, Eye, EyeOff,
  Gem, TrendingUp as TrendUp, Percent, Flag, Medal, Sword, Tag
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════
const c = {
  bg: "#FAFBFC", bgAlt: "#F4F5F7", surface: "#FFFFFF",
  border: "#EEF0F3", borderStrong: "#E4E7EB",
  text: "#0A1628", textSoft: "#4B5563", textMute: "#8B93A8",
  brand: "#0066FF", brandSoft: "#E6F0FF", brandDark: "#0052CC",
  success: "#00A876", successSoft: "#E6F7F1",
  warning: "#E89D0F", warningSoft: "#FFF4E0",
  danger: "#E63946", dangerSoft: "#FFE8EA",
  gold: "#D4A017", goldSoft: "#FEF3C7",
  premium: "#7C3AED", premiumSoft: "#F3EEFF",
  shadow: "0 1px 3px rgba(10,22,40,0.04), 0 1px 2px rgba(10,22,40,0.03)",
  shadowMd: "0 4px 12px rgba(10,22,40,0.06), 0 2px 4px rgba(10,22,40,0.04)",
  shadowLg: "0 12px 32px rgba(10,22,40,0.08), 0 4px 8px rgba(10,22,40,0.04)",
  shadowXl: "0 24px 48px rgba(10,22,40,0.12), 0 8px 16px rgba(10,22,40,0.06)"
};

const spring = { type: "spring", damping: 28, stiffness: 180 };
const springSoft = { type: "spring", damping: 32, stiffness: 140 };
const ease = [0.16, 1, 0.3, 1];

const themes = {
  blue: { name: "Océan", grad: ["#0066FF", "#004BBB", "#1A1A3E"], locked: false },
  dark: { name: "Nuit", grad: ["#1F2937", "#111827", "#000000"], locked: false },
  red: { name: "Feu", grad: ["#DC2626", "#991B1B", "#450A0A"], locked: true, cost: 2500 },
  green: { name: "Forêt", grad: ["#059669", "#065F46", "#022C22"], locked: true, cost: 2500 },
  gold: { name: "Or", grad: ["#D4A017", "#92400E", "#451A03"], locked: true, premium: true },
  platinum: { name: "Platine", grad: ["#6366F1", "#4338CA", "#1E1B4B"], locked: true, premium: true },
};

// Plans Pass Concession
// ══════════════════════════════════════════════════════════════════
// STRIPE — Liens de paiement
// ══════════════════════════════════════════════════════════════════
const STRIPE_LINKS = {
  player_month: "https://buy.stripe.com/4gM8wRezggkAdfienfaVa06",
  player_year:  "https://buy.stripe.com/6oUaEZ1Mu5FWb7agvnaVa07",
  elite_month:  "https://buy.stripe.com/fZuaEZ62K3xOgrua6ZaVa08",
  elite_year:   "https://buy.stripe.com/dRm7sN0Iq0lCa36frjaVa09",
  pack_500:     "https://buy.stripe.com/5kQ14pbn45FWdfi92VaVa0a",
  pack_2000:    "https://buy.stripe.com/6oU00l0Iq3xO2AEdjbaVa0b",
  pack_5000:    "https://buy.stripe.com/eVq4gB1MugkAejm6UNaVa0c",
  pack_12000:   "https://buy.stripe.com/8x2fZj8aS9WcejmdjbaVa0d",
  battle_pass:  "https://buy.stripe.com/bJe14pfDk8S82AEbb3aVa0e",
  boost_7d:     "https://buy.stripe.com/8x2aEZgHofgw7UY4MFaVa0f",
};

const goToStripe = (key) => {
  const url = STRIPE_LINKS[key];
  if (!url) {
    console.warn("Lien Stripe manquant pour:", key);
    return false;
  }
  window.open(url, "_blank");
  return true;
};

const PASS_PLANS = {
  free: { name: "Explorateur", price: 0, color: c.textMute,
    limits: { dailyView: 10, canEarnPoints: false, canEnterContests: false, maxMissions: 2, ads: true } },
  player: { name: "Player", price: 4.99, yearly: 39, color: c.brand, popular: true,
    limits: { dailyView: "illimité", canEarnPoints: true, canEnterContests: true, maxMissions: 999, ads: false,
    pointsMultiplier: 1 } },
  elite: { name: "Elite", price: 9.99, yearly: 79, color: c.premium,
    limits: { dailyView: "illimité", canEarnPoints: true, canEnterContests: true, maxMissions: 999, ads: false,
    pointsMultiplier: 2, exclusiveContests: true, premiumBadges: true, bonusPointsMonthly: 1000 } }
};

const UserContext = createContext(null);
const useUser = () => useContext(UserContext);
const useMobile = () => {
  const [m, setM] = useState(false);
  useEffect(() => {
    const check = () => setM(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return m;
};

// ══════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════
const baseListings = [
  { id: 1, brand: "Porsche", model: "911 Carrera", year: 2019, km: 42000, price: 78500, delta: -8, city: "Lyon", dist: 12, seller: { name: "Garage Alpin", type: "pro", rating: 4.9, sales: 187 }, grad: ["#1a1a2e","#16213e"], tags: ["Pack Sport","Toit ouvrant"], fuel: "Essence", trans: "Auto", color: "Noir" },
  { id: 2, brand: "Peugeot", model: "208 GT Line", year: 2021, km: 28500, price: 14200, delta: -12, city: "Villeurbanne", dist: 8, seller: { name: "Marc D.", type: "trust", rating: 4.7, sales: 4 }, grad: ["#0066FF","#004BBB"], tags: ["1ère main"], fuel: "Essence", trans: "Manuelle", color: "Bleu" },
  { id: 3, brand: "Tesla", model: "Model 3 Long Range", year: 2022, km: 31000, price: 34900, delta: -5, city: "Écully", dist: 15, seller: { name: "EV Premium", type: "pro", rating: 5.0, sales: 62 }, grad: ["#DC2626","#991B1B"], tags: ["Autopilot"], fuel: "Électrique", trans: "Auto", color: "Rouge" },
  { id: 4, brand: "Volkswagen", model: "Golf 7 GTD", year: 2018, km: 89000, price: 18500, delta: -3, city: "Bron", dist: 6, seller: { name: "Karim B.", type: "trust", rating: 4.8, sales: 11 }, grad: ["#1E293B","#0F172A"], tags: ["Historique complet"], fuel: "Diesel", trans: "Manuelle", color: "Noir" },
  { id: 5, brand: "Renault", model: "Clio V", year: 2020, km: 52000, price: 11900, delta: -14, city: "Caluire", dist: 10, seller: { name: "Auto Est", type: "pro", rating: 4.6, sales: 89 }, grad: ["#DC2626","#991B1B"], tags: ["Garantie 12 mois"], fuel: "Essence", trans: "Manuelle", color: "Rouge" },
  { id: 6, brand: "BMW", model: "Série 3 320d", year: 2017, km: 112000, price: 16800, delta: 2, city: "Oullins", dist: 14, seller: { name: "Luc M.", type: null, rating: 4.2, sales: 1 }, grad: ["#1E40AF","#1E3A8A"], tags: ["Pack M"], fuel: "Diesel", trans: "Auto", color: "Bleu" },
  { id: 7, brand: "Audi", model: "A3 Sportback", year: 2020, km: 58000, price: 23400, delta: -6, city: "Lyon 3", dist: 4, seller: { name: "Prestige Auto", type: "pro", rating: 4.9, sales: 234 }, grad: ["#0F172A","#1E293B"], tags: ["S-Line"], fuel: "Essence", trans: "Auto", color: "Gris" },
  { id: 8, brand: "Fiat", model: "500 Hybrid", year: 2022, km: 18000, price: 13500, delta: -9, city: "Lyon 7", dist: 5, seller: { name: "Julie R.", type: "trust", rating: 4.8, sales: 2 }, grad: ["#EF4444","#B91C1C"], tags: ["Faible km"], fuel: "Hybride", trans: "Manuelle", color: "Rouge" },
];

const extraModels = [
  ["Mercedes", "Classe A 200", 24500, "Essence", "Auto", "Gris", ["#1F2937","#0F172A"]],
  ["Citroën", "C3 Aircross", 14900, "Essence", "Manuelle", "Blanc", ["#9CA3AF","#6B7280"]],
  ["Dacia", "Sandero Stepway", 12500, "Essence", "Manuelle", "Bleu", ["#0066FF","#004BBB"]],
  ["Toyota", "Yaris Hybrid", 17200, "Hybride", "Auto", "Rouge", ["#DC2626","#991B1B"]],
  ["Hyundai", "Tucson", 26800, "Diesel", "Auto", "Gris", ["#374151","#1F2937"]],
  ["Kia", "Picanto", 9800, "Essence", "Manuelle", "Blanc", ["#E5E7EB","#9CA3AF"]],
  ["Ford", "Fiesta ST", 19500, "Essence", "Manuelle", "Rouge", ["#EF4444","#B91C1C"]],
  ["Skoda", "Octavia Combi", 21300, "Diesel", "Auto", "Vert", ["#059669","#047857"]],
  ["Seat", "Leon FR", 22900, "Essence", "Manuelle", "Rouge", ["#DC2626","#991B1B"]],
  ["Mini", "Cooper S", 26500, "Essence", "Auto", "Noir", ["#0F172A","#1E293B"]],
  ["Volvo", "XC40", 31900, "Hybride", "Auto", "Blanc", ["#E5E7EB","#9CA3AF"]],
  ["Nissan", "Qashqai", 19800, "Diesel", "Manuelle", "Bleu", ["#1E40AF","#1E3A8A"]],
  ["Opel", "Corsa", 11500, "Essence", "Manuelle", "Jaune", ["#F59E0B","#D97706"]],
  ["Mazda", "MX-5", 27800, "Essence", "Manuelle", "Rouge", ["#DC2626","#991B1B"]],
  ["Renault", "Captur", 16400, "Essence", "Auto", "Orange", ["#F97316","#EA580C"]],
  ["Peugeot", "3008 GT Line", 28900, "Diesel", "Auto", "Gris", ["#374151","#1F2937"]],
  ["Volkswagen", "T-Roc", 24700, "Essence", "Manuelle", "Bleu", ["#0066FF","#004BBB"]],
  ["BMW", "X1 sDrive 18d", 32500, "Diesel", "Auto", "Noir", ["#1E293B","#0F172A"]],
  ["Audi", "Q3", 34800, "Essence", "Auto", "Blanc", ["#E5E7EB","#9CA3AF"]],
  ["Tesla", "Model Y", 49900, "Électrique", "Auto", "Bleu", ["#0066FF","#004BBB"]],
  ["Mercedes", "GLA 200", 38500, "Essence", "Auto", "Gris", ["#374151","#1F2937"]],
  ["Citroën", "C5 Aircross", 27200, "Hybride", "Auto", "Blanc", ["#E5E7EB","#9CA3AF"]],
  ["Renault", "Mégane E-Tech", 32400, "Électrique", "Auto", "Bleu", ["#1E40AF","#1E3A8A"]],
  ["Peugeot", "e-208", 23800, "Électrique", "Auto", "Vert", ["#059669","#047857"]],
  ["Hyundai", "Kona Electric", 29900, "Électrique", "Auto", "Rouge", ["#DC2626","#991B1B"]],
  ["Honda", "Jazz Hybrid", 18700, "Hybride", "Auto", "Blanc", ["#E5E7EB","#9CA3AF"]],
  ["Kia", "Niro Hybrid", 24500, "Hybride", "Auto", "Gris", ["#374151","#1F2937"]],
  ["Subaru", "Forester", 33200, "Hybride", "Auto", "Vert", ["#059669","#047857"]],
  ["Jeep", "Renegade", 22800, "Essence", "Manuelle", "Noir", ["#0F172A","#1E293B"]],
  ["Land Rover", "Evoque", 42500, "Diesel", "Auto", "Blanc", ["#E5E7EB","#9CA3AF"]],
  ["Porsche", "Macan", 58900, "Essence", "Auto", "Gris", ["#374151","#1F2937"]],
  ["Mini", "Countryman", 28700, "Essence", "Auto", "Bleu", ["#1E40AF","#1E3A8A"]],
  ["Ford", "Puma", 19400, "Essence", "Manuelle", "Bleu", ["#0066FF","#004BBB"]],
  ["Volkswagen", "Polo", 14800, "Essence", "Manuelle", "Rouge", ["#DC2626","#991B1B"]],
  ["Audi", "A1 Sportback", 19900, "Essence", "Manuelle", "Noir", ["#0F172A","#1E293B"]],
  ["Mercedes", "Classe C", 38900, "Diesel", "Auto", "Noir", ["#1F2937","#0F172A"]],
  ["BMW", "Série 1", 23500, "Essence", "Auto", "Bleu", ["#0066FF","#004BBB"]],
  ["Toyota", "Corolla TS", 21800, "Hybride", "Auto", "Gris", ["#374151","#1F2937"]],
  ["Suzuki", "Vitara", 17600, "Essence", "Manuelle", "Rouge", ["#DC2626","#991B1B"]],
  ["Alfa Romeo", "Giulia", 32500, "Diesel", "Auto", "Rouge", ["#DC2626","#991B1B"]],
  ["Cupra", "Formentor", 35800, "Essence", "Auto", "Bleu", ["#1E40AF","#1E3A8A"]],
  ["DS", "DS 7 Crossback", 31200, "Diesel", "Auto", "Noir", ["#0F172A","#1E293B"]],
];

const cities = [["Lyon", 4], ["Villeurbanne", 8], ["Bron", 6], ["Caluire", 10], ["Écully", 15], ["Oullins", 14], ["Lyon 3", 4], ["Lyon 7", 5], ["Vénissieux", 11], ["Saint-Priest", 13], ["Givors", 22], ["Tassin", 9]];
const sellersPro = [{ name: "Garage Alpin", rating: 4.9, sales: 187 }, { name: "EV Premium", rating: 5.0, sales: 62 }, { name: "Auto Est", rating: 4.6, sales: 89 }, { name: "Prestige Auto", rating: 4.9, sales: 234 }, { name: "Lyon Motors", rating: 4.7, sales: 142 }, { name: "Drive Concept", rating: 4.8, sales: 98 }];
const sellersTrust = [{ name: "Marc D.", rating: 4.7, sales: 4 }, { name: "Karim B.", rating: 4.8, sales: 11 }, { name: "Julie R.", rating: 4.8, sales: 2 }, { name: "Sophie L.", rating: 4.6, sales: 7 }, { name: "Thomas R.", rating: 4.9, sales: 5 }];
const tagsPool = [["1ère main"], ["Carnet à jour"], ["Garantie 12 mois"], ["Faible km"], ["Historique complet"], ["Toutes options"], ["Pack confort"], ["Sièges chauffants"], ["GPS intégré"], ["Bluetooth"]];

const listings = [
  ...baseListings,
  ...extraModels.map((m, i) => {
    const id = 9 + i;
    const [brand, model, basePrice, fuel, trans, color, grad] = m;
    const yearOffset = (id * 7) % 6;
    const year = 2018 + yearOffset;
    const km = 15000 + ((id * 4321) % 100000);
    const delta = -15 + ((id * 13) % 18);
    const cityData = cities[id % cities.length];
    const isPro = id % 3 !== 0;
    const seller = isPro ? { ...sellersPro[id % sellersPro.length], type: "pro" } : { ...sellersTrust[id % sellersTrust.length], type: id % 5 === 0 ? null : "trust" };
    return {
      id, brand, model, year, km, price: basePrice + ((id * 137) % 2000) - 1000,
      delta, city: cityData[0], dist: cityData[1],
      seller, grad, tags: tagsPool[id % tagsPool.length],
      fuel, trans, color
    };
  })
];

const contests = [
  { id: 1, title: "Peugeot 208 GT", year: 2023, value: 22500, totalEntries: 8420, endsIn: "7j 12h", grad: ["#0066FF","#0052CC"], ticketCost: 1000, featured: true },
  { id: 2, title: "Tesla Model 3", year: 2022, value: 34900, totalEntries: 15200, endsIn: "24j 4h", grad: ["#DC2626","#991B1B"], ticketCost: 2500 },
  { id: 3, title: "Renault Clio V", year: 2021, value: 11900, totalEntries: 3100, endsIn: "3j 8h", grad: ["#059669","#065F46"], ticketCost: 500, urgent: true },
  { id: 4, title: "BMW Série 1", year: 2020, value: 19800, totalEntries: 6800, endsIn: "15j 2h", grad: ["#1F2937","#111827"], ticketCost: 1500 },
  { id: 5, title: "Porsche Macan", year: 2022, value: 68000, totalEntries: 1200, endsIn: "28j", grad: ["#7C3AED","#4338CA"], ticketCost: 5000, elite: true },
];

const initialMissions = [
  { id: 1, label: "Visiter 5 annonces", xp: 30, points: 15, progress: 3, total: 5, icon: Search, type: "daily", locked: false },
  { id: 2, label: "Converser avec Sphera", xp: 40, points: 20, progress: 0, total: 1, icon: Bot, type: "daily", locked: false },
  { id: 3, label: "Ajouter un favori", xp: 20, points: 10, progress: 1, total: 1, done: true, icon: Heart, type: "daily", locked: false },
  { id: 4, label: "Partager une annonce", xp: 25, points: 15, progress: 0, total: 1, icon: Share2, type: "daily", locked: true, unlockCost: 99 },
  { id: 5, label: "Publier une annonce", xp: 150, points: 100, progress: 0, total: 1, icon: Plus, type: "weekly", locked: false },
  { id: 6, label: "Parrainer un ami", xp: 300, points: 200, progress: 0, total: 1, icon: User, type: "weekly", locked: false },
  { id: 7, label: "Consulter 20 annonces", xp: 100, points: 60, progress: 8, total: 20, icon: Store, type: "weekly", locked: true, unlockCost: 99 },
];

const leaderboardData = [
  { rank: 1, name: "Karim B.", points: 12840, avatar: "K", trend: "up", plan: "elite" },
  { rank: 2, name: "Sophie L.", points: 11205, avatar: "S", trend: "up", plan: "elite" },
  { rank: 3, name: "Thomas R.", points: 9870, avatar: "T", trend: "down", plan: "player" },
  { rank: 45, name: "Pierre M.", points: 5680, avatar: "P", trend: "up", plan: "player" },
  { rank: 46, name: "Léa F.", points: 5512, avatar: "L", trend: "up", plan: "elite" },
  { rank: 48, name: "Julien P.", points: 5398, avatar: "J", trend: "down", plan: "free" }
];

// BATTLE PASS — Saison actuelle
const seasonPass = {
  name: "Saison 1 · Printemps",
  endsIn: "18 jours",
  tiers: [
    { level: 1, free: { type: "points", value: 50 }, premium: { type: "points", value: 200 } },
    { level: 3, free: { type: "badge", value: "Débutant" }, premium: { type: "ticket", value: 1 } },
    { level: 5, free: { type: "points", value: 100 }, premium: { type: "theme", value: "Feu" } },
    { level: 10, free: { type: "ticket", value: 1 }, premium: { type: "ticket", value: 3 } },
    { level: 15, free: { type: "points", value: 200 }, premium: { type: "badge", value: "Chasseur Elite" } },
    { level: 20, free: { type: "badge", value: "Saison 1" }, premium: { type: "theme", value: "Or" } },
    { level: 30, free: { type: "ticket", value: 1 }, premium: { type: "ticket_rare", value: "Tesla" } },
  ],
  premiumCost: 14.99,
  currentLevel: 7
};

// Packs points — OFFRES
const pointPacks = [
  { id: 1, points: 500, price: 4.99, bonus: 0, label: "Essai" },
  { id: 2, points: 2000, price: 14.99, bonus: 15, label: "Populaire", popular: true },
  { id: 3, points: 5000, price: 29.99, bonus: 25, label: "Meilleure offre" },
  { id: 4, points: 12000, price: 59.99, bonus: 40, label: "Mega", mega: true },
];

const shopItems = [
  { id: 1, title: "Ticket Concours", desc: "1 ticket pour le tirage du mois", cost: 1000, icon: Ticket, popular: true, category: "contest" },
  { id: 2, title: "Pack 5 Tickets", desc: "5 tickets (économie 20%)", cost: 4000, icon: Package, category: "contest" },
  { id: 3, title: "Remontée 7j", desc: "Top de la liste 7 jours", cost: 2500, icon: Rocket, category: "boost" },
  { id: 4, title: "Thème Feu", desc: "Débloquez le thème rouge", cost: 2500, icon: Flame, category: "theme" },
  { id: 5, title: "Thème Forêt", desc: "Débloquez le thème vert", cost: 2500, icon: ShieldCheck, category: "theme" },
  { id: 6, title: "Rapport VIN", desc: "Historique complet d'un véhicule", cost: 1500, icon: Shield, category: "service" },
];

// BADGES — majoritairement payants pour pousser conversion
const badgesData = [
  { Icon: Flame, l: "Série 14j", unlocked: true, free: true },
  { Icon: Target, l: "Chasseur", unlocked: true, free: true },
  { Icon: BadgeCheck, l: "Vérifié", unlocked: true, free: true },
  { Icon: Rocket, l: "Démarrage", unlocked: true, free: true },
  { Icon: Crown, l: "VIP Elite", unlocked: false, requiresPlan: "elite" },
  { Icon: Trophy, l: "Top 10", unlocked: false, cost: 3500 },
  { Icon: Zap, l: "Éclair", unlocked: false, cost: 2000 },
  { Icon: Star, l: "100 ventes", unlocked: false, progress: true },
  { Icon: Medal, l: "Champion", unlocked: false, cost: 5000, rare: true },
  { Icon: Gem, l: "Diamant", unlocked: false, requiresPlan: "elite", rare: true },
  { Icon: Sword, l: "Conquérant", unlocked: false, cost: 4500 },
  { Icon: Flag, l: "Pionnier", unlocked: false, requiresPlan: "elite" },
];

// ══════════════════════════════════════════════════════════════════
// SPHERA IA
// ══════════════════════════════════════════════════════════════════
const callSpheraAI = async (userText, context) => {
  const systemContext = `Tu es Sphera, assistante auto française pour Roolio.

CONTEXTE:
- Concession: "${context.dealerName}" (${context.plan.toUpperCase()})
- Niveau ${context.level}, ${context.points} points, série ${context.streak}j

CATALOGUE:
${context.listings.slice(0, 8).map(l => `ID ${l.id}: ${l.brand} ${l.model} ${l.year}, ${l.km}km, ${l.price}€, ${l.color}, ${l.fuel}, ${l.city}, marché ${l.delta}%`).join("\n")}

RÈGLES:
1. Français, ton pro chaleureux
2. Réponses COURTES (4-5 lignes max)
3. Chat social: 1-2 phrases humaines
4. Recherche: propose 3 véhicules max, termine par "CARDS:[id1,id2,id3]"
5. Diagnostic: 2-3 questions ciblées
6. Jamais d'emojis
7. Follow-ups: "SUGGESTIONS:[q1|q2|q3]"
8. **mots** pour gras`;

  try {
    if (typeof window !== "undefined" && window.claude && window.claude.complete) {
      const response = await window.claude.complete(`${systemContext}\n\nUSER: ${userText}\n\nRÉPONSE:`);
      let cards = [], suggestions = [], text = response;
      const cm = text.match(/CARDS:\[([^\]]+)\]/);
      if (cm) { cards = cm[1].split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n)); text = text.replace(/CARDS:\[[^\]]+\]/, "").trim(); }
      const sm = text.match(/SUGGESTIONS:\[([^\]]+)\]/);
      if (sm) { suggestions = sm[1].split("|").map(s => s.trim()).filter(Boolean); text = text.replace(/SUGGESTIONS:\[[^\]]+\]/, "").trim(); }
      return { text: text.trim(), cards, suggestions };
    }
  } catch (e) {}
  return spheraFallback(userText, context);
};

const spheraFallback = (userText, context) => {
  const text = userText.toLowerCase().trim();
  if (/^(salut|bonjour|hello|coucou|hey|bonsoir)/.test(text)) return { text: "Bonjour, ravi de vous revoir. Comment puis-je vous aider ?", suggestions: ["Trouver une voiture", "Estimer un prix", "Diagnostic"] };
  if (/ça va|comment vas/.test(text)) return { text: "Tout va bien, merci. Votre recherche auto avance ?", suggestions: ["Voiture familiale", "Premier achat"] };
  if (/merci|super|parfait/.test(text)) return { text: "Avec plaisir." };
  if (/bruit|démarr|panne|fumée|voyant/.test(text)) return { text: "Pour diagnostiquer précisément, j'ai besoin de :\n\n**1.** À quel moment le problème survient ?\n**2.** Depuis combien de temps ?\n**3.** Voyant allumé ?" };
  if (/fiab|défaut/.test(text)) return { text: "Précisez-moi le modèle et l'année, je vous fais un rapport : points forts, faiblesses, coût d'entretien, conseil d'achat." };
  if (/premier achat|débutant/.test(text)) return { text: "Priorités : fiabilité, entretien peu coûteux, assurance abordable.\n\nRecommandations sous 12 000 € : Clio IV/V, Dacia Sandero, Peugeot 208.", cards: [5, 8] };

  const priceMatch = text.match(/(\d+[\s.,]?\d{3,})\s*(?:€|euros?)/);
  const colors = ["rouge", "noir", "blanc", "bleu", "gris"];
  const colorFound = colors.find(col => text.includes(col));
  if (priceMatch || colorFound) {
    let filtered = [...context.listings];
    let criteria = [];
    if (priceMatch) { const p = Number(priceMatch[1].replace(/[\s.,]/g, "")); filtered = filtered.filter(l => l.price <= p * 1.1); criteria.push(`${p.toLocaleString("fr-FR")} €`); }
    if (colorFound) { filtered = filtered.filter(l => l.color.toLowerCase() === colorFound); criteria.push(colorFound); }
    if (!filtered.length) return { text: `Aucune annonce (${criteria.join(", ")}). Élargissez un critère.` };
    return { text: `**${filtered.length} annonce${filtered.length > 1 ? "s" : ""}** (${criteria.join(", ")}) :`, cards: filtered.slice(0, 3).map(l => l.id) };
  }
  return { text: "Je peux vous aider sur :\n\n**Recherche** — en langage naturel\n**Diagnostic** — bruit, panne, voyant\n**Estimation** — prix juste\n**Conseil** — premier achat, familial", suggestions: ["Trouver une voiture", "Diagnostic panne", "Premier achat"] };
};

const welcomeMsg = (dealerName) => ({
  from: "sphera",
  text: `Bonjour${dealerName ? ` ${dealerName}` : ""}, je suis Sphera. Posez-moi vos questions auto.`,
  suggestions: ["Trouver une voiture", "Diagnostic panne", "Premier achat"]
});

// ══════════════════════════════════════════════════════════════════
// PRIMITIVES
// ══════════════════════════════════════════════════════════════════
const Button = ({ children, variant = "primary", onClick, icon: Icon, size = "md", fullWidth, iconRight, disabled, type }) => {
  const variants = {
    primary: { bg: c.text, color: "#fff", hover: "#1a2638" },
    brand: { bg: c.brand, color: "#fff", hover: c.brandDark },
    ghost: { bg: "transparent", color: c.text, hover: c.bgAlt, border: c.borderStrong },
    soft: { bg: c.brandSoft, color: c.brand, hover: "#d6e6ff" },
    success: { bg: c.success, color: "#fff", hover: "#008a61" },
    danger: { bg: c.danger, color: "#fff", hover: "#c42a36" },
    premium: { bg: c.premium, color: "#fff", hover: "#6D28D9" },
    gold: { bg: c.gold, color: "#fff", hover: "#B8860B" }
  };
  const v = variants[variant];
  const sizes = { sm: { py: 8, px: 14, fs: 13, gap: 6 }, md: { py: 11, px: 18, fs: 14, gap: 7 }, lg: { py: 14, px: 26, fs: 15, gap: 9 } };
  const s = sizes[size];
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.01 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      type={type || "button"}
      style={{
        background: disabled ? c.bgAlt : v.bg, color: disabled ? c.textMute : v.color,
        border: v.border ? `1px solid ${v.border}` : "none",
        padding: `${s.py}px ${s.px}px`, fontSize: s.fs, fontWeight: 600,
        borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", gap: s.gap,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: "inherit", letterSpacing: -0.1, width: fullWidth ? "100%" : undefined,
        transition: "background 0.2s", opacity: disabled ? 0.6 : 1
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hover; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.bg; }}
    >
      {Icon && !iconRight && <Icon size={s.fs + 2} strokeWidth={2.2} />}
      {children}
      {Icon && iconRight && <Icon size={s.fs + 2} strokeWidth={2.2} />}
    </motion.button>
  );
};

const Card = ({ children, hover = false, onClick, style = {} }) => (
  <motion.div
    whileHover={hover ? { y: -3 } : undefined}
    onClick={onClick}
    style={{
      background: c.surface, borderRadius: 16,
      border: `1px solid ${c.border}`, boxShadow: c.shadow,
      cursor: onClick ? "pointer" : "default", overflow: "hidden",
      transition: "box-shadow 0.3s, border-color 0.2s", ...style
    }}
    onMouseEnter={e => { if (hover) { e.currentTarget.style.boxShadow = c.shadowLg; e.currentTarget.style.borderColor = c.borderStrong; } }}
    onMouseLeave={e => { if (hover) { e.currentTarget.style.boxShadow = c.shadow; e.currentTarget.style.borderColor = c.border; } }}
  >{children}</motion.div>
);

const Badge = ({ children, tone = "brand", size = "sm", icon: Icon }) => {
  const tones = {
    brand: { bg: c.brandSoft, fg: c.brand }, success: { bg: c.successSoft, fg: c.success },
    warning: { bg: c.warningSoft, fg: c.warning }, danger: { bg: c.dangerSoft, fg: c.danger },
    neutral: { bg: c.bgAlt, fg: c.textSoft }, dark: { bg: c.text, fg: "#fff" },
    gold: { bg: c.goldSoft, fg: "#92400E" }, premium: { bg: c.premiumSoft, fg: c.premium }
  };
  const t = tones[tone];
  const sizes = { xs: { py: 2, px: 6, fs: 10 }, sm: { py: 3, px: 8, fs: 11 }, md: { py: 5, px: 10, fs: 12 } };
  const s = sizes[size];
  return (
    <span style={{
      background: t.bg, color: t.fg,
      padding: `${s.py}px ${s.px}px`, fontSize: s.fs, fontWeight: 600,
      borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4,
      letterSpacing: -0.05, lineHeight: 1.3, whiteSpace: "nowrap"
    }}>
      {Icon && <Icon size={s.fs} strokeWidth={2.5} />}
      {children}
    </span>
  );
};

const formatMsg = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((p, i) => p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>);
};

const CarSilhouette = ({ size = 60, color = "#fff", opacity = 0.25 }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 100 50" style={{ opacity }}>
    <path d="M10,35 Q10,28 18,28 L28,28 L35,18 Q38,15 45,15 L65,15 Q72,15 78,20 L88,28 L90,28 Q92,28 92,32 L92,38 Q92,40 88,40 L82,40 Q82,45 77,45 Q72,45 72,40 L28,40 Q28,45 23,45 Q18,45 18,40 L12,40 Q10,40 10,38 Z" fill={color} />
    <circle cx="23" cy="40" r="4" fill={color} />
    <circle cx="77" cy="40" r="4" fill={color} />
  </svg>
);

// Logo Roolio — wordmark + flèche stylisée au-dessus du i
const RoolioLogo = ({ height = 28, color = "#1E3A8A", accent = "#2563EB" }) => {
  // ratio largeur/hauteur du logo ≈ 3.4
  const w = height * 3.4;
  return (
    <svg
      width={w} height={height}
      viewBox="0 0 340 100"
      style={{ display: "block" }}
    >
      {/* wordmark "roolio" */}
      <text
        x="0" y="78"
        fontFamily="'Inter', -apple-system, sans-serif"
        fontWeight="800"
        fontSize="92"
        letterSpacing="-3"
        fill={color}
      >
        roolio
      </text>
      {/* flèche stylisée au-dessus du "i" final */}
      <g transform="translate(248, 8)">
        <path
          d="M 0 14 L 28 14 M 22 6 L 32 14 L 22 22"
          stroke={accent}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M -6 22 L 12 22"
          stroke={accent}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════
// UPGRADE MODAL — Upsell Pass Concession
// ══════════════════════════════════════════════════════════════════
const UpgradeModal = ({ open, onClose, trigger, onUpgrade }) => {
  const { user } = useUser();
  const [selected, setSelected] = useState("player");
  const [billing, setBilling] = useState("year");

  const triggers = {
    "daily_limit": { title: "Vous avez atteint votre limite", desc: "10 annonces vues aujourd'hui. Passez Player pour un accès illimité.", icon: EyeOff },
    "earn_points": { title: "Seuls les membres gagnent des points", desc: "Votre plan Explorateur ne permet pas de gagner de points. Passez Player pour participer aux concours.", icon: Coins },
    "contest": { title: "Concours réservés aux membres", desc: "Passez Player pour participer et gagner une voiture.", icon: Trophy },
    "badge": { title: "Badge réservé", desc: "Ce badge est exclusif aux membres Elite.", icon: Crown },
    "mission": { title: "Missions avancées bloquées", desc: "Les missions premium rapportent 3x plus de points. Débloquez avec Player.", icon: Target },
    "rank": { title: "Un concurrent vous a dépassé", desc: "Karim B. vient de prendre votre place au classement. Passez Player pour gagner des points x2.", icon: AlertTriangle }
  };
  const t = triggers[trigger] || triggers.daily_limit;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(10,22,40,0.7)",
          backdropFilter: "blur(12px)", zIndex: 500,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={spring}
          onClick={e => e.stopPropagation()}
          style={{
            background: c.surface, borderRadius: 20, maxWidth: 560, width: "100%",
            boxShadow: c.shadowXl, maxHeight: "92vh", overflow: "auto", position: "relative"
          }}
        >
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: 8,
            background: c.bgAlt, border: "none", cursor: "pointer", zIndex: 2,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <X size={15} strokeWidth={2.5} color={c.textSoft} />
          </button>

          {/* Trigger header */}
          <div style={{
            background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
            padding: "28px 24px 20px", color: "#fff", textAlign: "center"
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: "0 auto 12px",
              background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <t.icon size={28} color="#fff" strokeWidth={2} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", letterSpacing: -0.4 }}>{t.title}</h2>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.9, lineHeight: 1.5 }}>{t.desc}</p>
          </div>

          <div style={{ padding: 20 }}>
            {/* Billing toggle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{
                background: c.bgAlt, padding: 3, borderRadius: 999,
                display: "inline-flex", gap: 3
              }}>
                {[{ k: "month", l: "Mensuel" }, { k: "year", l: "Annuel · −35%" }].map(b => (
                  <button key={b.k} onClick={() => setBilling(b.k)}
                    style={{
                      background: billing === b.k ? c.text : "transparent",
                      color: billing === b.k ? "#fff" : c.textSoft,
                      border: "none", padding: "6px 14px", borderRadius: 999,
                      fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                    }}>
                    {b.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Plans */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {["player", "elite"].map(key => {
                const p = PASS_PLANS[key];
                const isSelected = selected === key;
                const price = billing === "year" ? p.yearly : p.price;
                const priceLabel = billing === "year" ? "/ an" : "/ mois";
                return (
                  <motion.div key={key}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => setSelected(key)}
                    style={{
                      padding: 14, borderRadius: 12, cursor: "pointer",
                      background: isSelected ? c.surface : c.bgAlt,
                      border: `2px solid ${isSelected ? p.color : "transparent"}`,
                      position: "relative"
                    }}
                  >
                    {p.popular && (
                      <div style={{
                        position: "absolute", top: -8, left: 12,
                        background: c.text, color: "#fff", fontSize: 9, fontWeight: 700,
                        padding: "2px 7px", borderRadius: 4
                      }}>
                        POPULAIRE
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: `2px solid ${isSelected ? p.color : c.borderStrong}`,
                        background: isSelected ? p.color : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{p.name}</div>
                          {key === "elite" && <Badge tone="premium" size="xs" icon={Crown}>Elite</Badge>}
                        </div>
                        <div style={{ fontSize: 11, color: c.textSoft }}>
                          {key === "player" ? "Points, concours, illimité" : "Tout + concours exclusifs + ×2"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: c.text }}>
                          {price} €
                        </div>
                        <div style={{ fontSize: 10, color: c.textMute }}>{priceLabel}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Features de la sélection */}
            <div style={{ background: c.bgAlt, padding: 12, borderRadius: 10, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.textSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.3 }}>
                Inclus dans {PASS_PLANS[selected].name}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  "Gain de points illimité",
                  "Participation à tous les concours",
                  "Missions premium débloquées",
                  selected === "elite" ? "Points x2 en permanence" : "Suppression des publicités",
                  selected === "elite" ? "Concours Elite exclusifs" : "Badge vérifié doré",
                  selected === "elite" ? "1 000 points offerts chaque mois" : "Support prioritaire"
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: c.text }}>
                    <Check size={13} color={PASS_PLANS[selected].color} strokeWidth={3} />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant={selected === "elite" ? "premium" : "brand"}
              size="lg" fullWidth icon={ArrowRight} iconRight
              onClick={() => {
                const stripeKey = `${selected}_${billing === "year" ? "year" : "month"}`;
                if (goToStripe(stripeKey)) {
                  onClose();
                }
              }}
            >
              Activer {PASS_PLANS[selected].name} · {billing === "year" ? PASS_PLANS[selected].yearly : PASS_PLANS[selected].price}€
            </Button>

            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button onClick={onClose} style={{
                background: "transparent", border: "none", color: c.textMute,
                fontSize: 11, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline"
              }}>
                Continuer en limité
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════
// DAILY REWARD
// ══════════════════════════════════════════════════════════════════
const DailyReward = ({ onClose, onClaim, day }) => {
  const [claimed, setClaimed] = useState(false);
  const rewards = [5, 10, 15, 20, 30, 50, 100];
  const todayReward = rewards[(day - 1) % 7];

  const claim = () => {
    setClaimed(true);
    setTimeout(() => { onClaim(todayReward); onClose(); }, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", backdropFilter: "blur(8px)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={spring}
          style={{ background: c.surface, borderRadius: 20, maxWidth: 440, width: "100%", padding: 28, boxShadow: c.shadowXl, textAlign: "center", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: 8, background: c.bgAlt, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} strokeWidth={2.5} color={c.textSoft} />
          </button>
          <motion.div animate={claimed ? { scale: [1, 1.15, 1] } : { y: [0, -4, 0] }}
            transition={claimed ? { duration: 0.8 } : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 72, height: 72, borderRadius: 18, margin: "0 auto 18px", background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 28px ${c.brand}35` }}>
            <Gift size={34} color="#fff" strokeWidth={2} />
          </motion.div>
          <Badge tone="brand" icon={Flame}>Jour {day} de connexion</Badge>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "12px 0 6px", letterSpacing: -0.4, color: c.text }}>
            {claimed ? "Récompense reçue" : "Bienvenue de retour"}
          </h2>
          <p style={{ fontSize: 13, color: c.textSoft, margin: "0 0 22px", lineHeight: 1.5 }}>
            {claimed ? `+${todayReward} points ajoutés` : `Récupérez vos ${todayReward} points`}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5, marginBottom: 22 }}>
            {rewards.map((r, i) => {
              const dayNum = i + 1;
              const isPast = dayNum < day, isToday = dayNum === day;
              return (
                <div key={i} style={{
                  aspectRatio: "1",
                  background: isToday ? (claimed ? c.success : c.brand) : isPast ? c.successSoft : c.bgAlt,
                  border: isToday ? `2px solid ${claimed ? c.success : c.brand}` : "2px solid transparent",
                  borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  color: isToday ? "#fff" : isPast ? c.success : c.textMute
                }}>
                  <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.8 }}>J{dayNum}</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>
                    {isPast ? <Check size={12} strokeWidth={3} /> : `+${r}`}
                  </div>
                </div>
              );
            })}
          </div>
          {!claimed ? (
            <Button variant="brand" size="md" fullWidth icon={Coins} onClick={claim}>Récupérer {todayReward} points</Button>
          ) : (
            <div style={{ background: c.successSoft, padding: 14, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: c.success, fontWeight: 700, fontSize: 14 }}>
              <CheckCircle2 size={18} /> +{todayReward} points
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════
// AD BANNER (inter-sections)
// ══════════════════════════════════════════════════════════════════
const AdBanner = ({ onDismiss, onUpgrade }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    style={{
      background: `linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)`,
      border: `1px solid ${c.gold}30`, borderRadius: 14,
      padding: 14, marginBottom: 18, display: "flex",
      alignItems: "center", gap: 12, position: "relative", flexWrap: "wrap"
    }}
  >
    <div style={{ fontSize: 9, fontWeight: 700, color: "#92400E", padding: "2px 6px", background: "rgba(255,255,255,0.5)", borderRadius: 4, position: "absolute", top: 8, right: 8 }}>
      PUBLICITÉ
    </div>
    <div style={{
      width: 40, height: 40, borderRadius: 10, background: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      boxShadow: c.shadow
    }}>
      <Car size={20} color={c.warning} strokeWidth={2.2} />
    </div>
    <div style={{ flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 2 }}>
        Financement Younited · 0% sur 24 mois
      </div>
      <div style={{ fontSize: 11, color: "#92400E", opacity: 0.85 }}>
        Partenaire officiel Roolio. Réponse en 48h.
      </div>
    </div>
    <Button variant="gold" size="sm" onClick={onUpgrade}>Masquer les pubs</Button>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════
// LISTING CARD
// ══════════════════════════════════════════════════════════════════
const ListingCard = ({ item, onClick, i = 0 }) => {
  const deal = item.delta <= -8 ? { tone: "success", label: `${item.delta}% affaire` } : item.delta < 0 ? { tone: "brand", label: `${item.delta}%` } : null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05, ease }}>
      <Card hover onClick={onClick}>
        <div style={{ height: 160, background: `linear-gradient(135deg, ${item.grad[0]} 0%, ${item.grad[1]} 100%)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CarSilhouette size={130} color="#fff" opacity={0.25} />
          <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {deal && <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", padding: "4px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: deal.tone === "success" ? c.success : c.brand, display: "flex", alignItems: "center", gap: 4 }}><TrendingDown size={11} strokeWidth={2.5} />{deal.label}</div>}
            <div style={{ display: "flex", gap: 5, marginLeft: "auto" }}>
              {item.seller.type && <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}><Shield size={13} strokeWidth={2.5} color={item.seller.type === "pro" ? c.brand : c.success} fill={item.seller.type === "pro" ? c.brand : c.success} /></div>}
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}><Heart size={13} strokeWidth={2.5} color={c.text} /></div>
            </div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
            <div style={{ fontSize: 11, color: c.textMute, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3 }}>{item.brand}</div>
            <div style={{ fontSize: 11, color: c.textMute, display: "flex", alignItems: "center", gap: 3 }}><MapPin size={10} /> {item.dist}km</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 10, letterSpacing: -0.3 }}>{item.model}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: c.textSoft, marginBottom: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Calendar size={11} /> {item.year}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Gauge size={11} /> {(item.km/1000).toFixed(0)}k km</span>
            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Fuel size={11} /> {item.fuel}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingTop: 12, borderTop: `1px solid ${c.border}` }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: c.text, letterSpacing: -0.5 }}>{item.price.toLocaleString("fr-FR")} €</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: c.textSoft }}>
              <Star size={11} fill={c.gold} color={c.gold} strokeWidth={0} />
              <span style={{ fontWeight: 600, color: c.text }}>{item.seller.rating}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════
// LISTING MODAL
// ══════════════════════════════════════════════════════════════════
const ListingModal = ({ item, onClose, onAskSphera }) => (
  <AnimatePresence>
    {item && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", backdropFilter: "blur(8px)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30 }} transition={spring}
          onClick={e => e.stopPropagation()}
          style={{ background: c.surface, borderRadius: 20, maxWidth: 680, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: c.shadowXl }}>
          <div style={{ height: 220, background: `linear-gradient(135deg, ${item.grad[0]} 0%, ${item.grad[1]} 100%)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CarSilhouette size={180} color="#fff" opacity={0.3} />
            <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={17} strokeWidth={2.5} />
            </button>
          </div>
          <div style={{ padding: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, gap: 14, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: c.textMute, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>{item.brand} · {item.year}</div>
                <h2 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.7, color: c.text }}>{item.model}</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: c.text, letterSpacing: -0.7 }}>{item.price.toLocaleString("fr-FR")} €</div>
                {item.delta < 0 && <Badge tone="success" icon={TrendingDown}>{item.delta}% sous le marché</Badge>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
              {[{ icon: Calendar, l: "Année", v: item.year }, { icon: Gauge, l: "Kilomètres", v: `${(item.km/1000).toFixed(0)}k` }, { icon: Fuel, l: "Énergie", v: item.fuel }, { icon: Settings, l: "Boîte", v: item.trans }].map((s, idx) => (
                <div key={idx} style={{ background: c.bgAlt, padding: 12, borderRadius: 10 }}>
                  <s.icon size={13} color={c.brand} strokeWidth={2.2} style={{ marginBottom: 5 }} />
                  <div style={{ fontSize: 11, color: c.textMute, fontWeight: 500, marginBottom: 2 }}>{s.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Avis Sphera automatique */}
            <div style={{
              background: `linear-gradient(135deg, ${c.brandSoft} 0%, #F0F7FF 100%)`,
              padding: 14, borderRadius: 12, marginBottom: 16,
              display: "flex", alignItems: "flex-start", gap: 11,
              border: `1px solid ${c.brand}25`
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Sparkles size={15} color="#fff" strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.brand, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  Avis de Sphera
                </div>
                <div style={{ fontSize: 13, color: c.text, lineHeight: 1.5 }}>
                  {item.delta <= -10 ? <><strong>Excellente affaire.</strong> Prix bien sous le marché ({item.delta}%)</>
                    : item.delta <= -5 ? <><strong>Bon prix.</strong> Légèrement sous le marché ({item.delta}%)</>
                    : item.delta <= 0 ? <>Prix dans la moyenne du marché.</>
                    : <><strong>Prix légèrement haut</strong> (+{item.delta}%). Négociation possible.</>}
                  {item.km > 100000 && <> Kilométrage élevé ({(item.km/1000).toFixed(0)}k), vérifiez l'historique d'entretien.</>}
                  {item.seller.type === "pro" && <> Vendeur professionnel certifié ({item.seller.rating}/5).</>}
                  {item.seller.type === null && <> Vendeur particulier non vérifié — prudence.</>}
                </div>
              </div>
            </div>

            {/* Partenaire financement (monétisation B2B) */}
            <div style={{ background: `linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)`, padding: 14, borderRadius: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#92400E", padding: "2px 6px", background: "rgba(255,255,255,0.5)", borderRadius: 4, position: "absolute", top: 6, right: 6 }}>PARTENAIRE</div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Wallet size={18} color={c.warning} strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>Financement Younited dès {Math.round(item.price / 48)} €/mois</div>
                <div style={{ fontSize: 11, color: "#92400E", opacity: 0.85 }}>0% sur 24 mois · Réponse immédiate</div>
              </div>
            </div>

            <div style={{ background: c.bgAlt, padding: 14, borderRadius: 12, display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{item.seller.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 3 }}>{item.seller.name}</div>
                <div style={{ display: "flex", gap: 5, alignItems: "center", fontSize: 12, color: c.textSoft, flexWrap: "wrap" }}>
                  {item.seller.type === "pro" && <Badge tone="brand" size="xs" icon={Shield}>Pro certifié</Badge>}
                  <span>{item.seller.rating} / 5 · {item.seller.sales} ventes</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18 }}>
              {item.tags.map(t => <Badge key={t} tone="neutral">{t}</Badge>)}
              <Badge tone="warning" icon={Shield}>Rapport VIN 9,99 €</Badge>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Button variant="brand" icon={MessageCircle} fullWidth>Contacter</Button>
              <Button variant="ghost" icon={Heart}>Sauver</Button>
              <Button variant="soft" icon={Bot} onClick={() => { onClose(); onAskSphera(`Votre avis sur cette ${item.brand} ${item.model} ${item.year} à ${item.price}€ avec ${(item.km/1000).toFixed(0)}k km ?`); }}>Sphera</Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ══════════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════════
const Toast = ({ show, children, icon: Icon = Zap }) => (
  <AnimatePresence>
    {show && (
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9 }} transition={spring}
        style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: c.text, color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: c.shadowXl, display: "flex", alignItems: "center", gap: 8, zIndex: 550, maxWidth: "90vw" }}>
        <Icon size={16} color={c.brand} strokeWidth={2.5} />
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// ══════════════════════════════════════════════════════════════════
// PRESSURE NOTIFICATION (modale qui apparaît contextuellement)
// ══════════════════════════════════════════════════════════════════
const PressurePopup = ({ data, onClose, onUpgrade }) => {
  if (!data) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, scale: 0.85, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 100 }} transition={spring}
        style={{
          position: "fixed", bottom: 90, right: 16, zIndex: 250,
          background: c.surface, borderRadius: 14, padding: 14,
          boxShadow: c.shadowXl, border: `1px solid ${c.border}`,
          maxWidth: 320, width: "calc(100% - 32px)",
          display: "flex", gap: 12, alignItems: "flex-start"
        }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: c.warningSoft, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <data.icon size={18} color={c.warning} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 2 }}>{data.title}</div>
          <div style={{ fontSize: 11, color: c.textSoft, lineHeight: 1.4, marginBottom: 8 }}>{data.desc}</div>
          <Button variant="brand" size="sm" onClick={() => { onUpgrade(); onClose(); }}>{data.cta}</Button>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: c.textMute, flexShrink: 0 }}>
          <X size={14} strokeWidth={2.2} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════════════════════════
const HomePage = ({ onGo, onOpen, onOpenSphera, onTriggerUpgrade }) => {
  const { user } = useUser();
  const [placeholder, setPlaceholder] = useState("");
  const phrases = ["une voiture familiale fiable autour de Lyon...", "ma voiture fait un bruit au démarrage...", "un break essence sous 15 000 €...", "la meilleure affaire diesel cette semaine..."];

  useEffect(() => {
    let i = 0, j = 0, deleting = false, timeout;
    const type = () => {
      const full = phrases[i];
      if (!deleting) { j++; setPlaceholder(full.slice(0, j)); if (j === full.length) { deleting = true; timeout = setTimeout(type, 1800); return; } }
      else { j--; setPlaceholder(full.slice(0, j)); if (j === 0) { deleting = false; i = (i + 1) % phrases.length; } }
      timeout = setTimeout(type, deleting ? 30 : 65);
    };
    type();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div>
      {/* Free users voient une pub */}
      {user.plan === "free" && <AdBanner onUpgrade={() => onTriggerUpgrade("daily_limit")} />}

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} style={{ marginBottom: 44 }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "36px auto 28px" }}>
          <Badge tone="brand" icon={Sparkles} size="md">Intelligence artificielle automobile</Badge>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 700, letterSpacing: -1.4, margin: "18px 0 14px", color: c.text, lineHeight: 1.1 }}>
            Votre prochaine voiture,<br/>
            <span style={{ color: c.brand }}>en toute sécurité.</span>
          </h1>
          <p style={{ fontSize: 15, color: c.textSoft, margin: 0, lineHeight: 1.55 }}>
            Marketplace vérifiée, assistant IA, et concours pour remporter une vraie voiture chaque mois.
          </p>
          <div style={{ marginTop: 18 }}>
            <LiveCounter />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease }} style={{ maxWidth: 640, margin: "0 auto" }}>
          <div onClick={onOpenSphera} style={{ background: c.surface, borderRadius: 14, padding: 6, boxShadow: c.shadowLg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="#fff" strokeWidth={2.2} />
            </div>
            <div style={{ flex: 1, fontSize: 14, color: c.textMute, padding: "0 4px", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ color: c.textSoft }}>{placeholder}</span>
              <span style={{ color: c.brand, animation: "blink 1s infinite" }}>|</span>
            </div>
            <Button variant="brand" size="md" icon={ArrowRight} iconRight>Demander</Button>
          </div>
        </motion.div>
      </motion.div>

      {/* DASHBOARD PERSONNEL */}
      {user.plan !== "free" && (() => {
        const dailyMissions = user.missions.filter(m => m.type === "daily");
        const remaining = dailyMissions.filter(m => !m.done);
        const totalXp = remaining.reduce((s, m) => s + m.xp, 0);
        const myRank = 47;
        const aboveMe = leaderboardData.find(u => u.rank === myRank - 1);
        const ptsToCatch = aboveMe ? Math.max(1, aboveMe.points - user.points) : 0;
        const featured = contests.find(ct => ct.featured);

        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{ marginBottom: 44 }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.5, color: c.text }}>
                Bonjour {user.dealerName.split(" ")[0]}
              </h2>
              <p style={{ fontSize: 13, color: c.textSoft, margin: 0 }}>Voici votre activité du jour</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
              {/* Missions du jour */}
              <Card hover onClick={() => onGo("dealership")}>
                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: c.brandSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Target size={17} color={c.brand} strokeWidth={2.2} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.textSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>Missions</div>
                  </div>
                  {remaining.length > 0 ? (
                    <>
                      <div style={{ fontSize: 17, fontWeight: 700, color: c.text, letterSpacing: -0.3, marginBottom: 4 }}>
                        {remaining.length} à compléter
                      </div>
                      <div style={{ fontSize: 12, color: c.textSoft, marginBottom: 12 }}>
                        +{totalXp} XP en jeu aujourd'hui
                      </div>
                      <div style={{ height: 5, background: c.bgAlt, borderRadius: 999, overflow: "hidden" }}>
                        <motion.div
                          animate={{ width: `${((dailyMissions.length - remaining.length) / dailyMissions.length) * 100}%` }}
                          transition={{ type: "spring", damping: 26, stiffness: 120 }}
                          style={{ height: "100%", background: c.brand, borderRadius: 999 }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 17, fontWeight: 700, color: c.success, letterSpacing: -0.3, marginBottom: 4 }}>
                        Toutes complétées
                      </div>
                      <div style={{ fontSize: 12, color: c.textSoft }}>Reviens demain</div>
                    </>
                  )}
                </div>
              </Card>

              {/* Classement */}
              <Card hover onClick={() => onGo("dealership")}>
                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: c.warningSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Trophy size={17} color={c.warning} strokeWidth={2.2} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.textSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>Classement</div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: c.text, letterSpacing: -0.3, marginBottom: 4 }}>
                    {myRank}<span style={{ fontSize: 13, color: c.textMute, fontWeight: 500 }}>ᵉ en France</span>
                  </div>
                  <div style={{ fontSize: 12, color: c.textSoft, marginBottom: 12 }}>
                    {ptsToCatch} pts pour passer {myRank - 1}ᵉ
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: c.success, fontWeight: 600 }}>
                    <TrendingUp size={11} strokeWidth={2.5} />
                    +3 places cette semaine
                  </div>
                </div>
              </Card>

              {/* Concours featured */}
              {featured && (
                <Card hover onClick={() => onGo("contests")}>
                  <div style={{ padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: c.dangerSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PartyPopper size={17} color={c.danger} strokeWidth={2.2} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: c.textSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>Concours</div>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: c.text, letterSpacing: -0.3, marginBottom: 4 }}>
                      {featured.title}
                    </div>
                    <div style={{ fontSize: 12, color: c.textSoft, marginBottom: 12 }}>
                      Tirage dans {featured.endsIn}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: c.danger, fontWeight: 600 }}>
                      <Timer size={11} strokeWidth={2.5} />
                      {(featured.totalEntries / 1000).toFixed(1)}k participants
                    </div>
                  </div>
                </Card>
              )}

              {/* Sphera widget */}
              <Card hover onClick={() => onOpenSphera()}>
                <div style={{ padding: 18, background: `linear-gradient(135deg, ${c.brandSoft} 0%, ${c.surface} 100%)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Sparkles size={17} color="#fff" strokeWidth={2.2} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.textSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>Sphera</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 4, lineHeight: 1.4 }}>
                    J'ai repéré 3 affaires pour vous
                  </div>
                  <div style={{ fontSize: 11, color: c.textSoft, marginBottom: 12 }}>
                    Sous le prix marché ce matin
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: c.brand, fontWeight: 600 }}>
                    Voir les recommandations <ArrowRight size={11} strokeWidth={2.5} />
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        );
      })()}

      <div style={{ marginBottom: 44 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 18px", letterSpacing: -0.5, color: c.text }}>Quatre univers complémentaires</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 14 }}>
          {[
            { icon: Store, title: "Marketplace", desc: "47 000 annonces scannées chaque jour.", tab: "marketplace", stat: "47k annonces" },
            { icon: Trophy, title: "Concession", desc: user.plan === "free" ? "Débloquez pour gagner des voitures." : "Vos missions et votre progression.", tab: "dealership", stat: user.plan === "free" ? "Pass requis" : `Nv. ${user.level}`, locked: user.plan === "free" },
            { icon: PartyPopper, title: "Concours", desc: "Gagnez une vraie voiture avec vos points.", tab: "contests", stat: "5 en cours" },
            { icon: Bot, title: "Sphera IA", desc: "Assistant conversationnel automobile.", action: "sphera", stat: "24 / 7" }
          ].map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06, ease }}>
              <Card hover onClick={() => p.action === "sphera" ? onOpenSphera() : onGo(p.tab)}>
                <div style={{ padding: 20, position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: c.brandSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p.icon size={19} color={c.brand} strokeWidth={2.2} />
                    </div>
                    <Badge tone={p.locked ? "premium" : "neutral"} size="sm" icon={p.locked ? Lock : undefined}>{p.stat}</Badge>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 5px", letterSpacing: -0.3 }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: c.textSoft, lineHeight: 1.5, margin: "0 0 12px" }}>{p.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: c.brand }}>
                    Découvrir <ArrowRight size={13} strokeWidth={2.2} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Affaires du jour</h2>
            <p style={{ fontSize: 13, color: c.textSoft, margin: "3px 0 0" }}>Détectées par Sphera.</p>
          </div>
          <Button variant="ghost" icon={ArrowRight} iconRight size="sm" onClick={() => onGo("marketplace")}>Tout voir</Button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {listings.filter(l => l.delta <= -8).slice(0, 4).map((item, i) => <ListingCard key={item.id} item={item} i={i} onClick={() => onOpen(item)} />)}
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// MARKETPLACE
// ══════════════════════════════════════════════════════════════════
const Marketplace = ({ onOpen, onGo, onTriggerUpgrade }) => {
  const { user } = useUser();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [priceMax, setPriceMax] = useState(100000);
  const [showFilters, setShowFilters] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  let filtered = listings;
  if (filter === "deals") filtered = filtered.filter(l => l.delta < -8);
  if (filter === "pro") filtered = filtered.filter(l => l.seller.type === "pro");
  if (filter === "electric") filtered = filtered.filter(l => l.fuel === "Électrique" || l.fuel === "Hybride");
  if (search) filtered = filtered.filter(l => (l.brand + " " + l.model).toLowerCase().includes(search.toLowerCase()));
  filtered = filtered.filter(l => l.price <= priceMax);

  // Free: limite à 10 vues
  const isLimited = user.plan === "free" && viewCount >= 10;

  const handleOpen = (item) => {
    if (user.plan === "free" && viewCount >= 10) {
      onTriggerUpgrade("daily_limit");
      return;
    }
    setViewCount(v => v + 1);
    onOpen(item);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.6 }}>Marketplace</h1>
          <p style={{ fontSize: 13, color: c.textSoft, margin: "5px 0 0" }}>
            {filtered.length} annonces · triées par pertinence
            {user.plan === "free" && <span style={{ color: c.warning, marginLeft: 6, fontWeight: 600 }}>
              · {10 - viewCount} vues restantes aujourd'hui
            </span>}
          </p>
        </div>
        <Button variant="brand" icon={Plus} onClick={() => onGo("sell")}>Déposer une annonce</Button>
      </div>

      {user.plan === "free" && <AdBanner onUpgrade={() => onTriggerUpgrade("daily_limit")} />}

      <div style={{ background: c.surface, borderRadius: 14, padding: 10, marginBottom: 16, boxShadow: c.shadow, border: `1px solid ${c.border}`, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px", display: "flex", alignItems: "center", gap: 8, background: c.bgAlt, borderRadius: 10, padding: "9px 12px" }}>
          <Search size={15} color={c.textMute} strokeWidth={2.2} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Marque, modèle..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, flex: 1, fontFamily: "inherit", color: c.text, minWidth: 0 }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[{ k: "all", l: "Tout", n: listings.length }, { k: "deals", l: "Affaires", n: listings.filter(l => l.delta < -8).length }, { k: "pro", l: "Pros", n: listings.filter(l => l.seller.type === "pro").length }, { k: "electric", l: "Électrique", n: listings.filter(l => l.fuel === "Électrique" || l.fuel === "Hybride").length }].map(f => (
            <motion.button key={f.k} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setFilter(f.k)}
              style={{ background: filter === f.k ? c.text : c.bgAlt, color: filter === f.k ? "#fff" : c.textSoft, border: "none", padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
              {f.l}
              <span style={{ background: filter === f.k ? "rgba(255,255,255,0.2)" : c.surface, padding: "1px 5px", borderRadius: 6, fontSize: 10 }}>{f.n}</span>
            </motion.button>
          ))}
        </div>
        <Button variant="ghost" icon={SlidersHorizontal} size="sm" onClick={() => setShowFilters(!showFilters)}>Filtres</Button>
      </div>

      <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => <ListingCard key={item.id} item={item} i={i} onClick={() => handleOpen(item)} />)}
        </AnimatePresence>
      </motion.div>

      {isLimited && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 20, padding: 20, borderRadius: 16,
            background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
            color: "#fff", textAlign: "center"
          }}>
          <EyeOff size={28} style={{ marginBottom: 10 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>Limite quotidienne atteinte</h3>
          <p style={{ fontSize: 13, margin: "0 0 14px", opacity: 0.9 }}>
            Vous avez consulté 10 annonces aujourd'hui. Passez Player pour un accès illimité dès 4,99 €/mois.
          </p>
          <Button variant="gold" onClick={() => onTriggerUpgrade("daily_limit")}>Passer Player</Button>
        </motion.div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// DEALERSHIP (cœur monétisé)
// ══════════════════════════════════════════════════════════════════
const Dealership = ({ onGo, triggerGain, onShowSettings, onTriggerUpgrade }) => {
  const { user, updateUser } = useUser();
  const [missionTab, setMissionTab] = useState("daily");
  const level = user.level;
  const xpToNext = 3000;
  const theme = themes[user.theme];

  const plan = PASS_PLANS[user.plan];
  const isFree = user.plan === "free";

  const claimMission = (m) => {
    if (m.done) return;
    if (m.locked) { onTriggerUpgrade("mission"); return; }
    if (isFree) { onTriggerUpgrade("earn_points"); return; }
    const multiplier = plan.limits.pointsMultiplier || 1;
    updateUser({
      xp: user.xp + m.xp,
      points: user.points + (m.points * multiplier),
      missions: user.missions.map(x => x.id === m.id ? { ...x, done: true, progress: x.total } : x)
    });
    triggerGain({ xp: m.xp, points: m.points * multiplier });
  };

  const dailyMissions = user.missions.filter(m => m.type === "daily");
  const weeklyMissions = user.missions.filter(m => m.type === "weekly");
  const activeList = missionTab === "daily" ? dailyMissions : weeklyMissions;
  const leaderboard = [...leaderboardData, { rank: 47, name: user.dealerName, points: user.points, avatar: user.avatar, me: true, trend: "up", plan: user.plan }].sort((a, b) => a.rank - b.rank);

  return (
    <div>
      {/* BANDEAU STATUS PLAN (toujours visible) */}
      {isFree && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, ${c.warning} 0%, ${c.gold} 100%)`,
            color: "#fff", padding: 14, borderRadius: 14, marginBottom: 18,
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"
          }}>
          <AlertTriangle size={20} strokeWidth={2.2} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Mode Explorateur limité</div>
            <div style={{ fontSize: 12, opacity: 0.95 }}>Vous ne gagnez pas de points, vous ne pouvez pas participer aux concours.</div>
          </div>
          <Button variant="gold" size="sm" icon={Rocket} onClick={() => onTriggerUpgrade("earn_points")}>
            Activer le Pass
          </Button>
        </motion.div>
      )}

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <Badge tone={isFree ? "neutral" : user.plan === "elite" ? "premium" : "brand"} icon={isFree ? User : user.plan === "elite" ? Crown : ShieldCheck}>
            Pass {plan.name}
          </Badge>
          {!isFree && user.plan === "player" && <Badge tone="premium" size="sm">Upgrader Elite →</Badge>}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.6, color: c.text }}>Ma Concession</h1>
        <p style={{ fontSize: 13, color: c.textSoft, margin: "5px 0 0", lineHeight: 1.5 }}>
          {isFree ? "Activez votre Pass pour commencer à gagner des points." : "Gagnez des points, participez, remportez."}
        </p>
      </div>

      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} style={{ marginBottom: 18 }}>
        <Card>
          <div style={{ background: `linear-gradient(135deg, ${theme.grad[0]} 0%, ${theme.grad[1]} 50%, ${theme.grad[2]} 100%)`, padding: 26, color: "#fff", position: "relative", overflow: "hidden" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%)", borderRadius: "50%", pointerEvents: "none" }} />
            <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, marginBottom: 22, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", flex: "1 1 240px" }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, flexShrink: 0, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700 }}>
                  {user.avatar || user.dealerName[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    <Badge tone="dark" size="sm" icon={Crown}>Niveau {level}</Badge>
                    <Badge tone="warning" size="sm" icon={Flame}>{user.streak}j</Badge>
                  </div>
                  <h2 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 700, margin: 0, letterSpacing: -0.7, lineHeight: 1.1 }}>{user.dealerName}</h2>
                  <p style={{ fontSize: 12, opacity: 0.85, margin: "4px 0 0" }}>{user.bio || "Rang #47 en France"}</p>
                </div>
              </div>
              <Button variant="soft" size="sm" icon={Edit3} onClick={onShowSettings}>Modifier</Button>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.85 }}>
                <span>Niveau {level + 1}</span>
                <span style={{ fontWeight: 600 }}>{user.xp} / {xpToNext} XP</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 999, overflow: "hidden" }}>
                <motion.div animate={{ width: `${Math.min((user.xp / xpToNext) * 100, 100)}%` }} transition={{ type: "spring", damping: 26, stiffness: 120 }} style={{ height: "100%", background: "#fff", borderRadius: 999 }} />
              </div>
            </div>
            <div style={{ position: "relative", marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.12)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 10 }}>
              {[{ l: "Points", v: user.points.toLocaleString("fr-FR"), Icon: Coins }, { l: "Followers", v: "284", Icon: User }, { l: "Annonces", v: "12", Icon: Store }, { l: "Rang FR", v: "#47", Icon: Trophy }].map((s, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ fontSize: 10, opacity: 0.75, display: "flex", alignItems: "center", gap: 4 }}><s.Icon size={10} strokeWidth={2.2} /> {s.l}</div>
                  <motion.div key={s.v} initial={{ scale: 1.15 }} animate={{ scale: 1 }} style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>{s.v}</motion.div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* BOUTON ACTIVATION CONCESSION */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease }}
        style={{ marginBottom: 18 }}
      >
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => {
            updateUser({ points: user.points + 250 });
            triggerGain({ text: "+250 pts · Concession activée", icon: TrendingUp, points: 250 });
          }}
          style={{
            width: "100%",
            background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
            border: "none",
            padding: "18px 22px",
            borderRadius: 14,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 14,
            color: "#fff",
            boxShadow: `0 8px 24px ${c.brand}40`,
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Halo animé */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              pointerEvents: "none"
            }}
          />
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}>
            <Rocket size={22} color="#fff" strokeWidth={2.4} />
          </div>
          <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, letterSpacing: -0.3 }}>
              Faire fructifier ma flotte
            </div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>
              Gagne 250 pts toutes les heures
            </div>
          </div>
          <ArrowRight size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
        </motion.button>
      </motion.div>

      {/* VALEUR DE LA CONCESSION (jeu de gestion) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        style={{ marginBottom: 18 }}
      >
        <Card>
          <div style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: c.successSoft,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <TrendingUp size={16} color={c.success} strokeWidth={2.4} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.textSoft, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Valeur totale de ma Concession
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <motion.div
                initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={springSoft}
                style={{ fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 700, color: c.text, letterSpacing: -1 }}
              >
                87 450 €
              </motion.div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: c.successSoft, color: c.success,
                padding: "4px 9px", borderRadius: 6,
                fontSize: 12, fontWeight: 700
              }}>
                <TrendingUp size={12} strokeWidth={2.5} />
                +12,4 %
              </div>
            </div>

            <div style={{ fontSize: 13, color: c.textSoft, display: "flex", alignItems: "center", gap: 6 }}>
              <Coins size={13} color={c.gold} strokeWidth={2.2} />
              Bénéfice cette semaine : <strong style={{ color: c.success }}>+1 240 pts</strong>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* CATALOGUE CONCESSION (achats véhicules) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease }}
        style={{ marginBottom: 18 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <ShoppingCart size={16} color={c.brand} strokeWidth={2.4} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0, letterSpacing: -0.3 }}>
            Catalogue Concession
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { id: "v1", title: "1 véhicule", count: 1, price: 2500, discount: null, popular: false },
            { id: "v5", title: "Pack 5 véhicules", count: 5, price: 11000, discount: 12, popular: true },
            { id: "v10", title: "Pack 10 véhicules", count: 10, price: 20000, discount: 20, popular: false }
          ].map(pack => (
            <motion.div
              key={pack.id}
              whileHover={{ y: -3 }}
              transition={springSoft}
            >
              <Card style={{ position: "relative", height: "100%", border: pack.popular ? `2px solid ${c.brand}` : undefined }}>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", height: "100%" }}>
                  {pack.popular && (
                    <div style={{
                      display: "inline-block",
                      alignSelf: "flex-start",
                      background: c.brand, color: "#fff",
                      padding: "3px 9px", borderRadius: 6,
                      fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                      marginBottom: 10
                    }}>
                      POPULAIRE
                    </div>
                  )}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: c.brandSoft,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 10
                  }}>
                    <Car size={18} color={c.brand} strokeWidth={2.2} />
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 4 }}>
                    {pack.title}
                  </div>
                  <div style={{ fontSize: 11, color: c.textSoft, marginBottom: 14 }}>
                    {pack.count === 1 ? "Achat unitaire" : `${pack.count} véhicules ajoutés à votre concession`}
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
                    <Coins size={14} color={c.gold} strokeWidth={2.4} />
                    <span style={{ fontSize: 18, fontWeight: 700, color: c.text, letterSpacing: -0.4 }}>
                      {pack.price.toLocaleString("fr-FR")}
                    </span>
                    <span style={{ fontSize: 11, color: c.textSoft, fontWeight: 500 }}>pts</span>
                    {pack.discount && (
                      <span style={{
                        marginLeft: "auto",
                        background: c.successSoft, color: c.success,
                        padding: "2px 7px", borderRadius: 5,
                        fontSize: 10, fontWeight: 700
                      }}>
                        −{pack.discount}%
                      </span>
                    )}
                  </div>

                  <Button
                    variant={pack.popular ? "brand" : "soft"}
                    size="sm"
                    fullWidth
                    icon={Plus}
                    onClick={() => triggerGain({ text: `Pack acheté ! ${pack.count} véhicule${pack.count > 1 ? "s" : ""} ajouté${pack.count > 1 ? "s" : ""}`, icon: Car })}
                    style={{ marginTop: "auto" }}
                  >
                    Acheter
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* MON STOCK */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        style={{ marginBottom: 18 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Car size={16} color={c.brand} strokeWidth={2.4} />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: 0, letterSpacing: -0.3 }}>
              Mon Stock
            </h3>
            <Badge tone="neutral" size="sm">4 véhicules</Badge>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {[
            { id: "s1", brand: "Peugeot", model: "208 GT Line", year: 2021, value: 14200, grad: ["#0066FF","#004BBB"] },
            { id: "s2", brand: "Renault", model: "Clio V", year: 2020, value: 11900, grad: ["#DC2626","#991B1B"] },
            { id: "s3", brand: "Volkswagen", model: "Golf 7 GTD", year: 2018, value: 18500, grad: ["#1E293B","#0F172A"] },
            { id: "s4", brand: "Fiat", model: "500 Hybrid", year: 2022, value: 13500, grad: ["#EF4444","#B91C1C"] }
          ].map(car => (
            <motion.div key={car.id} whileHover={{ y: -3 }} transition={springSoft}>
              <Card style={{ overflow: "hidden", height: "100%" }}>
                {/* Visuel voiture */}
                <div style={{
                  height: 100,
                  background: `linear-gradient(135deg, ${car.grad[0]} 0%, ${car.grad[1]} 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative"
                }}>
                  <Car size={44} color="rgba(255,255,255,0.85)" strokeWidth={1.5} />
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
                    color: "#fff", padding: "3px 8px", borderRadius: 5,
                    fontSize: 10, fontWeight: 700
                  }}>
                    {car.year}
                  </div>
                </div>

                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 2 }}>
                    {car.brand} {car.model}
                  </div>
                  <div style={{ fontSize: 11, color: c.textSoft, marginBottom: 10 }}>
                    Valeur estimée : <strong style={{ color: c.text }}>{car.value.toLocaleString("fr-FR")} €</strong>
                  </div>

                  <Button
                    variant="brand"
                    size="sm"
                    fullWidth
                    icon={Tag}
                    onClick={() => triggerGain({ text: `${car.brand} ${car.model} mise en vente`, icon: Tag })}
                  >
                    Mettre en vente
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* QUICK ACTIONS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, marginBottom: 18 }}>
        {[
          { l: "Battle Pass", d: `Saison ${seasonPass.currentLevel}/30`, icon: Flag, tab: "season", highlight: true },
          { l: "Concours", d: "5 en cours", icon: PartyPopper, tab: "contests" },
          { l: "Packs Points", d: "Jusqu'à +40%", icon: Coins, tab: "packs", offer: true },
          { l: "Boutique", d: "Acheter", icon: ShoppingCart, tab: "shop" }
        ].map((a, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, ease }}>
            <Card hover onClick={() => onGo(a.tab)} style={a.highlight ? { border: `2px solid ${c.warning}` } : {}}>
              <div style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: a.highlight ? c.warningSoft : a.offer ? c.successSoft : c.brandSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <a.icon size={18} color={a.highlight ? c.warning : a.offer ? c.success : c.brand} strokeWidth={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.text, display: "flex", alignItems: "center", gap: 4 }}>
                    {a.l}
                    {a.offer && <Badge tone="success" size="xs">PROMO</Badge>}
                  </div>
                  <div style={{ fontSize: 11, color: c.textSoft }}>{a.d}</div>
                </div>
                <ChevronRight size={14} color={c.textMute} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* MISSIONS + LEADERBOARD */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, marginBottom: 18 }}>
        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>Missions</h3>
              <Target size={18} color={c.brand} strokeWidth={2.2} />
            </div>
            <div style={{ display: "flex", gap: 4, background: c.bgAlt, padding: 3, borderRadius: 8, marginBottom: 14 }}>
              {[{ k: "daily", l: "Quotidiennes", icon: CalendarDays }, { k: "weekly", l: "Hebdomadaires", icon: Calendar }].map(t => (
                <button key={t.k} onClick={() => setMissionTab(t.k)}
                  style={{ flex: 1, background: missionTab === t.k ? c.surface : "transparent", color: missionTab === t.k ? c.text : c.textSoft, border: "none", padding: "6px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, boxShadow: missionTab === t.k ? c.shadow : "none" }}>
                  <t.icon size={12} strokeWidth={2.2} />{t.l}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeList.map(m => {
                const isLocked = m.locked || isFree;
                return (
                  <motion.div key={m.id}
                    whileHover={!m.done ? { x: 2 } : undefined}
                    onClick={() => claimMission(m)}
                    style={{
                      background: m.done ? c.successSoft : isLocked ? c.bgAlt : c.bgAlt,
                      borderRadius: 10, padding: 12, cursor: m.done ? "default" : "pointer",
                      opacity: isLocked ? 0.7 : 1, position: "relative",
                      border: isLocked && !isFree ? `1px dashed ${c.borderStrong}` : "none"
                    }}>
                    {isLocked && (
                      <div style={{ position: "absolute", top: 8, right: 8 }}>
                        <Lock size={12} color={c.warning} strokeWidth={2.5} />
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: m.done ? c.success : isLocked ? c.bgAlt : c.brandSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {m.done ? <CheckCircle2 size={16} color="#fff" strokeWidth={2.5} /> : <m.icon size={14} color={isLocked ? c.textMute : c.brand} strokeWidth={2.2} />}
                      </div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: c.text }}>{m.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: m.done ? c.success : isLocked ? c.textMute : c.brand }}>+{m.xp} XP</div>
                    </div>
                    <div style={{ height: 4, background: "rgba(10,22,40,0.06)", borderRadius: 999, overflow: "hidden" }}>
                      <motion.div animate={{ width: `${(m.progress / m.total) * 100}%` }} transition={{ type: "spring", damping: 26, stiffness: 120 }} style={{ height: "100%", background: m.done ? c.success : isLocked ? c.textMute : c.brand, borderRadius: 999 }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>Classement France</h3>
              <Trophy size={18} color={c.warning} strokeWidth={2.2} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {leaderboard.map(u => {
                const rankColors = { 1: c.gold, 2: "#B8B8B8", 3: "#CD7F32" };
                const rankColor = rankColors[u.rank] || c.textMute;
                return (
                  <div key={u.rank} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", background: u.me ? c.brandSoft : "transparent", borderRadius: 8, border: u.me ? `1.5px solid ${c.brand}40` : "1.5px solid transparent" }}>
                    <div style={{ minWidth: 26, fontSize: 12, fontWeight: 700, color: rankColor, textAlign: "center" }}>#{u.rank}</div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: u.me ? `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)` : `linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, position: "relative" }}>
                      {u.avatar}
                      {u.plan === "elite" && (
                        <div style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: c.premium, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Crown size={6} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: u.me ? 700 : 500, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name} {u.me && "(vous)"}</div>
                    </div>
                    <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.text }}>{u.points.toLocaleString("fr-FR")}</div>
                      {u.trend === "up" ? <TrendingUp size={10} color={c.success} strokeWidth={2.5} /> : <TrendingDown size={10} color={c.danger} strokeWidth={2.5} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* BADGES — majoritairement payants */}
      <Card>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: -0.3 }}>Badges</h3>
              <p style={{ fontSize: 11, color: c.textSoft, margin: "2px 0 0" }}>4 débloqués · {badgesData.length - 4} à conquérir</p>
            </div>
            <Award size={18} color={c.warning} strokeWidth={2.2} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(85px, 1fr))", gap: 8 }}>
            {badgesData.map((b, i) => {
              const canClick = !b.unlocked;
              return (
                <motion.div key={i}
                  whileHover={canClick || b.unlocked ? { y: -2 } : undefined}
                  onClick={() => {
                    if (b.unlocked) return;
                    if (b.requiresPlan) { onTriggerUpgrade("badge"); return; }
                    if (b.cost) {
                      if (user.points >= b.cost) {
                        updateUser({ points: user.points - b.cost });
                        triggerGain({ text: `Badge ${b.l} débloqué` });
                      } else {
                        onTriggerUpgrade("badge");
                      }
                    }
                  }}
                  style={{
                    aspectRatio: "1",
                    background: b.unlocked ? c.brandSoft : b.rare ? `linear-gradient(135deg, ${c.goldSoft} 0%, ${c.warningSoft} 100%)` : c.bgAlt,
                    borderRadius: 10, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 3,
                    opacity: b.unlocked ? 1 : 0.85,
                    border: b.unlocked ? `1px solid ${c.brand}30` : b.rare ? `1px solid ${c.gold}50` : `1px solid ${c.border}`,
                    position: "relative", cursor: canClick ? "pointer" : "default"
                  }}>
                  <b.Icon size={22} color={b.unlocked ? c.brand : b.rare ? c.gold : c.textMute} strokeWidth={1.8} />
                  <div style={{ fontSize: 9, fontWeight: 600, color: c.textSoft, textAlign: "center", padding: "0 3px" }}>{b.l}</div>
                  {!b.unlocked && (
                    <>
                      {b.requiresPlan && (
                        <div style={{ position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", background: c.premium, color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>
                          ELITE
                        </div>
                      )}
                      {b.cost && (
                        <div style={{ position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)", background: c.text, color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3, display: "flex", alignItems: "center", gap: 2, whiteSpace: "nowrap" }}>
                          <Coins size={7} /> {b.cost >= 1000 ? (b.cost/1000).toFixed(1) + "k" : b.cost}
                        </div>
                      )}
                      <Lock size={8} color={c.textMute} style={{ position: "absolute", top: 4, right: 4 }} />
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// BATTLE PASS (saison)
// ══════════════════════════════════════════════════════════════════
const SeasonPass = ({ onTriggerUpgrade }) => {
  const { user, updateUser } = useUser();
  const hasPremium = user.seasonPassPremium === true;

  const rewardIcon = (type) => {
    const icons = { points: Coins, ticket: Ticket, badge: Award, theme: Sparkles, ticket_rare: Star };
    return icons[type] || Gift;
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Badge tone="warning" icon={Flag}>{seasonPass.name}</Badge>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 0", letterSpacing: -0.6 }}>Battle Pass</h1>
        <p style={{ fontSize: 13, color: c.textSoft, margin: "5px 0 0" }}>
          30 paliers de récompenses · Fin dans {seasonPass.endsIn}
        </p>
      </div>

      {/* Bandeau premium */}
      {!hasPremium && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: `linear-gradient(135deg, ${c.gold} 0%, #B8860B 100%)`,
            padding: 20, borderRadius: 14, color: "#fff", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap"
          }}>
          <Crown size={32} strokeWidth={1.8} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Activez le Pass Premium</div>
            <div style={{ fontSize: 12, opacity: 0.95, lineHeight: 1.5 }}>
              Doublez vos récompenses à chaque palier. Inclus : 10 tickets concours, 2 thèmes rares, badge Saison 1, ticket Tesla exclusif au palier 30.
            </div>
          </div>
          <Button variant="primary" icon={Rocket} onClick={() => goToStripe("battle_pass")}>
            14,99 €
          </Button>
        </motion.div>
      )}

      {/* Progress overall */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12, color: c.textSoft }}>
            <span>Palier actuel</span>
            <span style={{ fontWeight: 700, color: c.text }}>{seasonPass.currentLevel} / 30</span>
          </div>
          <div style={{ height: 8, background: c.bgAlt, borderRadius: 999, overflow: "hidden", marginBottom: 14 }}>
            <motion.div animate={{ width: `${(seasonPass.currentLevel / 30) * 100}%` }} transition={{ type: "spring", damping: 26, stiffness: 120 }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${c.brand} 0%, ${c.gold} 100%)`, borderRadius: 999 }} />
          </div>
          <div style={{ fontSize: 12, color: c.textSoft }}>Complétez des missions pour gagner des paliers. Chaque 500 XP = 1 palier.</div>
        </div>
      </Card>

      {/* Tiers */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {seasonPass.tiers.map((t, i) => {
          const isUnlocked = t.level <= seasonPass.currentLevel;
          const FreeIcon = rewardIcon(t.free.type);
          const PremIcon = rewardIcon(t.premium.type);
          return (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, ease }}>
              <Card>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 0, alignItems: "stretch" }}>
                  <div style={{
                    background: isUnlocked ? c.brand : c.bgAlt,
                    color: isUnlocked ? "#fff" : c.textMute,
                    padding: "16px 18px", minWidth: 60,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <div style={{ fontSize: 10, opacity: 0.85 }}>PALIER</div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{t.level}</div>
                  </div>

                  <div style={{ padding: 14, display: "flex", alignItems: "center", gap: 10, borderRight: `1px solid ${c.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: isUnlocked ? c.successSoft : c.bgAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: isUnlocked ? 1 : 0.5 }}>
                      <FreeIcon size={16} color={isUnlocked ? c.success : c.textMute} strokeWidth={2} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: c.textMute, marginBottom: 2 }}>GRATUIT</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>
                        {t.free.type === "points" && `+${t.free.value} pts`}
                        {t.free.type === "ticket" && `${t.free.value} ticket`}
                        {t.free.type === "badge" && `Badge ${t.free.value}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: 14, display: "flex", alignItems: "center", gap: 10, background: hasPremium ? c.goldSoft : c.bgAlt }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: hasPremium && isUnlocked ? c.gold : "rgba(212,160,23,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                      <PremIcon size={16} color={hasPremium && isUnlocked ? "#fff" : c.gold} strokeWidth={2} />
                      {!hasPremium && <Lock size={8} color={c.gold} style={{ position: "absolute", bottom: -2, right: -2, background: "#fff", borderRadius: "50%", padding: 1 }} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: "#92400E", fontWeight: 700, marginBottom: 2 }}>PREMIUM</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>
                        {t.premium.type === "points" && `+${t.premium.value} pts`}
                        {t.premium.type === "ticket" && `${t.premium.value} ticket${t.premium.value > 1 ? "s" : ""}`}
                        {t.premium.type === "badge" && `Badge ${t.premium.value}`}
                        {t.premium.type === "theme" && `Thème ${t.premium.value}`}
                        {t.premium.type === "ticket_rare" && `Ticket ${t.premium.value}`}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// POINT PACKS (monétisation directe)
// ══════════════════════════════════════════════════════════════════
const PointPacks = ({ triggerGain }) => {
  const { user, updateUser } = useUser();

  const buy = (pack) => {
    const stripeKey = `pack_${pack.points}`;
    goToStripe(stripeKey);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Badge tone="success" icon={Percent}>Offres limitées</Badge>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 0", letterSpacing: -0.6 }}>Packs de points</h1>
        <p style={{ fontSize: 13, color: c.textSoft, margin: "5px 0 0" }}>
          Achetez directement des points pour participer aux concours ou acheter dans la boutique.
        </p>
      </div>

      {/* Timer promo */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{
          background: `linear-gradient(135deg, ${c.danger} 0%, #B91C1C 100%)`,
          padding: 12, borderRadius: 12, color: "#fff", marginBottom: 18,
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap"
        }}>
        <Timer size={18} strokeWidth={2.2} />
        <div style={{ fontSize: 12, fontWeight: 700, flex: 1, minWidth: 180 }}>
          Promo Spring : bonus jusqu'à +40% sur tous les packs
        </div>
        <div style={{ fontSize: 11, opacity: 0.9 }}>Fin dans 47h 23min</div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {pointPacks.map((p, i) => {
          const totalPoints = p.points + Math.round(p.points * p.bonus / 100);
          return (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ease }} style={{ position: "relative" }}>
              {p.popular && (
                <div style={{
                  position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                  background: c.brand, color: "#fff", fontSize: 10, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 6, zIndex: 2
                }}>
                  POPULAIRE
                </div>
              )}
              {p.mega && (
                <div style={{
                  position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                  background: c.premium, color: "#fff", fontSize: 10, fontWeight: 700,
                  padding: "3px 10px", borderRadius: 6, zIndex: 2
                }}>
                  MEGA OFFRE
                </div>
              )}
              <Card style={{ border: p.popular || p.mega ? `2px solid ${p.mega ? c.premium : c.brand}` : `1px solid ${c.border}` }}>
                <div style={{ padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: c.textMute, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.3 }}>{p.label}</div>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14, margin: "0 auto 12px",
                    background: p.mega ? `linear-gradient(135deg, ${c.premium} 0%, #6D28D9 100%)` : p.popular ? `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)` : c.brandSoft,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: p.mega ? `0 8px 20px ${c.premium}40` : p.popular ? `0 8px 20px ${c.brand}40` : "none"
                  }}>
                    <Coins size={28} color={p.mega || p.popular ? "#fff" : c.brand} strokeWidth={2} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: c.text, letterSpacing: -0.7, marginBottom: 4 }}>
                    {totalPoints.toLocaleString("fr-FR")}
                  </div>
                  <div style={{ fontSize: 12, color: c.textSoft, marginBottom: 2 }}>points</div>
                  {p.bonus > 0 && (
                    <Badge tone="success" size="xs">+{p.bonus}% bonus</Badge>
                  )}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${c.border}` }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: c.text, marginBottom: 10 }}>{p.price} €</div>
                    <Button variant={p.mega ? "premium" : p.popular ? "brand" : "soft"} size="md" fullWidth onClick={() => buy(p)}>
                      Acheter
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: 22, padding: 14, background: c.bgAlt, borderRadius: 10, fontSize: 11, color: c.textSoft, textAlign: "center" }}>
        Paiement sécurisé · Points crédités instantanément · Valables sans expiration
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// CONTESTS
// ══════════════════════════════════════════════════════════════════
const Contests = ({ triggerGain, onTriggerUpgrade }) => {
  const { user, updateUser } = useUser();
  const [contestList, setContestList] = useState(contests);

  const buyTicket = (contest) => {
    if (user.plan === "free") { onTriggerUpgrade("contest"); return; }
    if (contest.elite && user.plan !== "elite") { onTriggerUpgrade("badge"); return; }
    if (user.points < contest.ticketCost) return;
    updateUser({ points: user.points - contest.ticketCost });
    setContestList(list => list.map(ct => ct.id === contest.id ? { ...ct, tickets: (ct.tickets || 0) + 1, totalEntries: ct.totalEntries + 1 } : ct));
    triggerGain({ text: `+1 ticket pour ${contest.title}`, icon: Ticket });
  };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <Badge tone="danger" icon={PartyPopper}>Concours certifiés huissier</Badge>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 0", letterSpacing: -0.6 }}>Gagnez une vraie voiture</h1>
        <p style={{ fontSize: 13, color: c.textSoft, margin: "5px 0 0" }}>
          {user.plan === "free" ? "Activez votre Pass pour participer." : "Utilisez vos points comme tickets."}
        </p>
      </div>

      {contestList.filter(ct => ct.featured).map(contest => (
        <motion.div key={contest.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} style={{ marginBottom: 18 }}>
          <Card>
            <div style={{ background: `linear-gradient(135deg, ${contest.grad[0]} 0%, ${contest.grad[1]} 100%)`, padding: 26, color: "#fff", position: "relative", overflow: "hidden" }}>
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
              <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr auto", gap: 18, alignItems: "center" }}>
                <div>
                  <Badge tone="gold" size="sm" icon={Star}>À la une</Badge>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 12, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Gagnez une</div>
                  <h2 style={{ fontSize: "clamp(24px, 4.5vw, 34px)", fontWeight: 700, margin: 0, letterSpacing: -1, lineHeight: 1 }}>{contest.title}</h2>
                  <div style={{ fontSize: 14, opacity: 0.9, marginTop: 6 }}>Année {contest.year} · Valeur {contest.value.toLocaleString("fr-FR")} €</div>
                  <div style={{ marginTop: 16, padding: 12, background: "rgba(255,255,255,0.15)", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    <div><div style={{ fontSize: 10, opacity: 0.85, marginBottom: 3 }}>Tickets</div><div style={{ fontSize: 18, fontWeight: 700 }}>{contest.tickets || 0}</div></div>
                    <div><div style={{ fontSize: 10, opacity: 0.85, marginBottom: 3 }}>Joueurs</div><div style={{ fontSize: 18, fontWeight: 700 }}>{(contest.totalEntries/1000).toFixed(1)}k</div></div>
                    <div><div style={{ fontSize: 10, opacity: 0.85, marginBottom: 3 }}>Fin</div><div style={{ fontSize: 18, fontWeight: 700 }}>{contest.endsIn}</div></div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => buyTicket(contest)}
                      disabled={user.points < contest.ticketCost && user.plan !== "free"}
                      style={{ background: "#fff", color: contest.grad[0], border: "none", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <Ticket size={15} strokeWidth={2.2} />
                      Participer · {contest.ticketCost} pts
                    </motion.button>
                  </div>
                </div>
                <CarSilhouette size={160} color="#fff" opacity={0.4} />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}

      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", letterSpacing: -0.3 }}>Autres tirages</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 20 }}>
        {contestList.filter(ct => !ct.featured).map((ct, i) => (
          <motion.div key={ct.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06, ease }}>
            <Card>
              <div style={{ background: `linear-gradient(135deg, ${ct.grad[0]} 0%, ${ct.grad[1]} 100%)`, padding: 18, color: "#fff", position: "relative", minHeight: 110 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  {ct.elite ? <Badge tone="premium" size="sm" icon={Crown}>ELITE ONLY</Badge>
                    : ct.urgent ? <Badge tone="gold" size="sm" icon={Timer}>Bientôt fini</Badge>
                    : <Badge tone="dark" size="sm">{(ct.totalEntries/1000).toFixed(1)}k joueurs</Badge>}
                </div>
                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.3 }}>
                  <CarSilhouette size={90} color="#fff" opacity={1} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 3px", letterSpacing: -0.4, position: "relative" }}>{ct.title}</h3>
                <div style={{ fontSize: 12, opacity: 0.9, position: "relative" }}>{ct.year} · {ct.value.toLocaleString("fr-FR")} €</div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${c.border}` }}>
                  <div>
                    <div style={{ fontSize: 10, color: c.textMute, marginBottom: 1 }}>Tickets</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{ct.tickets || 0}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: c.textMute, marginBottom: 1 }}>Fin</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: ct.urgent ? c.danger : c.text }}>{ct.endsIn}</div>
                  </div>
                </div>
                <Button variant={ct.elite ? "premium" : "brand"} size="sm" fullWidth icon={ct.elite ? Crown : Ticket} onClick={() => buyTicket(ct)}
                  disabled={user.plan !== "free" && user.points < ct.ticketCost}>
                  {ct.ticketCost} pts
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// SHOP
// ══════════════════════════════════════════════════════════════════
const Shop = ({ triggerGain, onGo }) => {
  const { user, updateUser } = useUser();

  const buy = (item) => {
    if (user.points < item.cost) return;
    updateUser({ points: user.points - item.cost });
    triggerGain({ text: `${item.title} acquis`, icon: CheckCircle2 });
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Badge tone="brand" icon={ShoppingCart}>Boutique</Badge>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 0", letterSpacing: -0.6 }}>Utiliser mes points</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
          padding: 20, borderRadius: 14, color: "#fff", marginBottom: 18,
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12
        }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 3 }}>Solde</div>
          <motion.div key={user.points} initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={springSoft}
            style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 700, letterSpacing: -1, display: "flex", alignItems: "center", gap: 8 }}>
            <Wallet size={24} strokeWidth={2} />
            {user.points.toLocaleString("fr-FR")} pts
          </motion.div>
        </div>
        <Button variant="gold" icon={Plus} onClick={() => onGo("packs")}>Acheter des points</Button>
      </motion.div>

      {/* Achats directs en € (sans points) */}
      <Card style={{ marginBottom: 18, border: `2px solid ${c.brand}` }}>
        <div style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <Rocket size={20} color="#fff" strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.brand, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>Sans abonnement</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 2 }}>Booster mon annonce 7 jours</div>
            <div style={{ fontSize: 12, color: c.textSoft }}>Top de la liste, +5x plus de vues estimées</div>
          </div>
          <Button variant="brand" icon={ArrowRight} iconRight onClick={() => goToStripe("boost_7d")}>
            4,99 €
          </Button>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
        {shopItems.map((item, i) => {
          const canAfford = user.points >= item.cost;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ease }}>
              <Card hover>
                <div style={{ padding: 16, position: "relative" }}>
                  {item.popular && <div style={{ position: "absolute", top: 8, right: 8, background: c.warning, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>POPULAIRE</div>}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: c.brandSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <item.icon size={20} color={c.brand} strokeWidth={2.2} />
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 3px" }}>{item.title}</h3>
                  <p style={{ fontSize: 11, color: c.textSoft, margin: "0 0 12px", lineHeight: 1.5 }}>{item.desc}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Coins size={13} color={c.gold} strokeWidth={2.2} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: c.text }}>{item.cost.toLocaleString("fr-FR")}</span>
                    </div>
                    <Button variant={canAfford ? "brand" : "ghost"} size="sm" onClick={() => buy(item)} disabled={!canAfford}>
                      {canAfford ? "Acquérir" : "Manque"}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// PROFILE SETTINGS
// ══════════════════════════════════════════════════════════════════
const ProfileSettings = ({ onClose, onTriggerUpgrade }) => {
  const { user, updateUser } = useUser();
  const [form, setForm] = useState({
    dealerName: user.dealerName, bio: user.bio, theme: user.theme, avatar: user.avatar
  });

  const save = () => { updateUser(form); onClose(); };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.55)", backdropFilter: "blur(8px)", zIndex: 380, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30 }} transition={spring}
          onClick={e => e.stopPropagation()}
          style={{ background: c.surface, borderRadius: 20, maxWidth: 520, width: "100%", maxHeight: "92vh", overflow: "auto", boxShadow: c.shadowXl }}>
          <div style={{ padding: 22, borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Personnaliser ma concession</h2>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: c.bgAlt, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} strokeWidth={2.5} color={c.textSoft} />
            </button>
          </div>
          <div style={{ padding: 22 }}>
            <div style={{ height: 110, borderRadius: 14, marginBottom: 22, position: "relative", overflow: "hidden",
              background: `linear-gradient(135deg, ${themes[form.theme].grad[0]} 0%, ${themes[form.theme].grad[1]} 100%)`,
              display: "flex", alignItems: "center", padding: 16, gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700 }}>
                {form.avatar || form.dealerName[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ color: "#fff", minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{form.dealerName || "Ma concession"}</div>
                <div style={{ fontSize: 11, opacity: 0.9 }}>{form.bio || "Votre bio"}</div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>Nom de la concession</label>
              <input value={form.dealerName} maxLength={30} onChange={e => setForm({...form, dealerName: e.target.value})}
                style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 14, fontFamily: "inherit", outline: "none", color: c.text }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>Description</label>
              <textarea value={form.bio} maxLength={140} onChange={e => setForm({...form, bio: e.target.value})} rows={2}
                style={{ width: "100%", padding: "10px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 13, fontFamily: "inherit", outline: "none", color: c.text, resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>Initiale</label>
              <input value={form.avatar} maxLength={1} onChange={e => setForm({...form, avatar: e.target.value.toUpperCase()})}
                style={{ width: 56, padding: "10px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 17, fontWeight: 700, fontFamily: "inherit", outline: "none", color: c.text, textAlign: "center" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 8 }}>Thème</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {Object.entries(themes).map(([k, t]) => {
                  const locked = t.locked && form.theme !== k;
                  return (
                    <motion.button key={k} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { if (t.locked) { if (t.premium) { onTriggerUpgrade("badge"); return; } else { alert("Disponible dans la boutique pour " + t.cost + " pts"); return; } } setForm({...form, theme: k}); }}
                      style={{
                        aspectRatio: "1.4", borderRadius: 10,
                        background: `linear-gradient(135deg, ${t.grad[0]} 0%, ${t.grad[1]} 100%)`,
                        border: form.theme === k ? `3px solid ${c.text}` : `3px solid transparent`,
                        cursor: "pointer", position: "relative",
                        display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 5
                      }}>
                      <span style={{ color: "#fff", fontSize: 10, fontWeight: 600 }}>{t.name}</span>
                      {form.theme === k && (
                        <div style={{ position: "absolute", top: 5, right: 5, width: 16, height: 16, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check size={10} color={c.text} strokeWidth={3} />
                        </div>
                      )}
                      {locked && (
                        <div style={{ position: "absolute", top: 5, right: 5, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Lock size={9} color="#fff" strokeWidth={2.5} />
                        </div>
                      )}
                      {t.premium && locked && (
                        <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", background: c.premium, color: "#fff", fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3 }}>
                          ELITE
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="ghost" onClick={onClose}>Annuler</Button>
              <Button variant="brand" icon={Check} fullWidth onClick={save} disabled={!form.dealerName.trim()}>Enregistrer</Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════
// SUBSCRIPTIONS
// ══════════════════════════════════════════════════════════════════
const SubscriptionsPage = ({ onTriggerUpgrade }) => {
  const { user, updateUser } = useUser();
  const [tab, setTab] = useState("perso");
  const [billing, setBilling] = useState("year");

  const perso = [
    PASS_PLANS.free,
    PASS_PLANS.player,
    PASS_PLANS.elite
  ];

  const pro = [
    { name: "Pro Starter", price: 39, yearly: 390, features: ["20 véhicules max", "25 leads / mois", "CRM basique", "Badge Pro"] },
    { name: "Pro Business", price: 119, yearly: 1190, popular: true, features: ["60 véhicules max", "Remontées quotidiennes", "150 leads / mois", "CRM avancé", "Mini-site", "Certification", "Stats avancées"] },
    { name: "Pro Elite", price: 299, yearly: 2990, features: ["Stock illimité", "Leads illimités", "API & DMS", "Domaine personnalisé", "Account manager", "Formation équipe"] }
  ];

  const plans = tab === "perso" ? perso : pro;

  const selectPlan = (planName) => {
    const keyMap = { "Explorateur": "free", "Player": "player", "Elite": "elite" };
    const key = keyMap[planName];
    if (!key) return;

    // Plan gratuit → activation directe
    if (key === "free") {
      updateUser({ plan: "free" });
      return;
    }

    // Plan payant → redirection Stripe
    const stripeKey = `${key}_${billing === "year" ? "year" : "month"}`;
    goToStripe(stripeKey);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <Badge tone="brand" icon={Sparkles}>Rejoignez 150 000 membres actifs</Badge>
        <h1 style={{ fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, margin: "10px 0 6px", letterSpacing: -1 }}>Choisir mon Pass</h1>
        <p style={{ fontSize: 14, color: c.textSoft, margin: 0 }}>Débloquez concession, concours et missions premium.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div style={{ background: c.bgAlt, padding: 3, borderRadius: 10, display: "inline-flex", gap: 3 }}>
          {[{ k: "perso", l: "Particulier", icon: User }, { k: "pro", l: "Professionnel", icon: Briefcase }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ background: tab === t.k ? c.surface : "transparent", color: tab === t.k ? c.text : c.textSoft, border: "none", padding: "9px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, boxShadow: tab === t.k ? c.shadow : "none" }}>
              <t.icon size={14} strokeWidth={2.2} />
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
        <div style={{ background: c.surface, border: `1px solid ${c.border}`, padding: 3, borderRadius: 999, display: "inline-flex", gap: 3 }}>
          {[{ k: "month", l: "Mensuel" }, { k: "year", l: "Annuel −35%" }].map(b => (
            <button key={b.k} onClick={() => setBilling(b.k)}
              style={{ background: billing === b.k ? c.text : "transparent", color: billing === b.k ? "#fff" : c.textSoft, border: "none", padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {b.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, alignItems: "stretch" }}>
        {plans.map((p, i) => {
          const price = billing === "year" ? (p.yearly || 0) : (p.price || 0);
          const isFree = p.name === "Explorateur";
          const isCurrent = tab === "perso" && user.plan === { "Explorateur": "free", "Player": "player", "Elite": "elite" }[p.name];
          return (
            <motion.div key={p.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, ease }} style={{ position: "relative" }}>
              {p.popular && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: c.text, color: "#fff", padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, zIndex: 2 }}>POPULAIRE</div>}
              <Card style={{ height: "100%", border: p.popular ? `2px solid ${c.text}` : isCurrent ? `2px solid ${c.success}` : `1px solid ${c.border}` }}>
                <div style={{ padding: 22, display: "flex", flexDirection: "column", height: "100%" }}>
                  {isCurrent && <Badge tone="success" size="xs" icon={CheckCircle2}>PLAN ACTUEL</Badge>}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: c.brandSoft, display: "flex", alignItems: "center", justifyContent: "center", marginTop: isCurrent ? 10 : 0, marginBottom: 12 }}>
                    {isFree ? <User size={18} color={c.brand} strokeWidth={2.2} />
                      : p.name.includes("Elite") ? <Crown size={18} color={c.brand} strokeWidth={2.2} />
                      : <Target size={18} color={c.brand} strokeWidth={2.2} />}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 6px", letterSpacing: -0.3 }}>{p.name}</h3>
                  <div style={{ marginBottom: 16, minHeight: 50 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: c.text, letterSpacing: -0.8 }}>
                      {price === 0 ? "Gratuit" : `${price} €`}
                    </span>
                    {price !== 0 && <span style={{ fontSize: 12, color: c.textMute, marginLeft: 3 }}>{billing === "year" ? "/ an" : "/ mois"}</span>}
                    {billing === "year" && price > 0 && (
                      <div style={{ fontSize: 11, color: c.success, fontWeight: 600, marginTop: 3 }}>
                        Soit {(price / 12).toFixed(2)} €/mois
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16, flex: 1 }}>
                    {(p.features || (p.limits ? [
                      p.limits.dailyView === "illimité" ? "Annonces illimitées" : `${p.limits.dailyView} annonces / jour`,
                      p.limits.canEarnPoints ? "Gain de points illimité" : "Pas de points",
                      p.limits.canEnterContests ? "Accès aux concours" : "Concours bloqués",
                      !p.limits.ads ? "Sans publicité" : "Avec publicité",
                      p.limits.pointsMultiplier === 2 ? "Points ×2" : "Points standard",
                      p.limits.exclusiveContests ? "Concours Elite exclusifs" : null,
                      p.limits.bonusPointsMonthly ? `+${p.limits.bonusPointsMonthly} pts/mois` : null
                    ].filter(Boolean) : [])).map((f, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12, color: c.text }}>
                        <Check size={12} color={c.brand} strokeWidth={3} style={{ marginTop: 3, flexShrink: 0 }} />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant={isCurrent ? "success" : p.popular ? "primary" : isFree ? "ghost" : "soft"}
                    size="md" fullWidth
                    onClick={() => selectPlan(p.name)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Plan actuel" : isFree ? "Basculer gratuit" : `Choisir ${p.name}`}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// SPHERA CHAT
// ══════════════════════════════════════════════════════════════════
const SpheraChat = ({ open, onClose, onOpenListing, initialPrompt }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState([welcomeMsg(user.dealerName)]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const isMobile = useMobile();

  useEffect(() => {
    if (open) {
      setMessages([welcomeMsg(user.dealerName)]);
      if (initialPrompt) setTimeout(() => send(initialPrompt), 400);
    }
  }, [open, initialPrompt]);

  useEffect(() => {
    if (open && inputRef.current && !isMobile) setTimeout(() => inputRef.current?.focus(), 400);
  }, [open, isMobile]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { from: "user", text: text.trim() }]);
    setInput("");
    setTyping(true);
    const context = { dealerName: user.dealerName, level: user.level, points: user.points, streak: user.streak, plan: user.plan, listings };
    try {
      const response = await callSpheraAI(text, context);
      setTyping(false);
      setMessages(m => [...m, { from: "sphera", ...response }]);
    } catch (e) {
      setTyping(false);
      setMessages(m => [...m, { from: "sphera", text: "Désolée, souci technique. Réessayez ?" }]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.5)", backdropFilter: "blur(8px)", zIndex: 350, display: "flex", alignItems: isMobile ? "stretch" : "center", justifyContent: "center", padding: isMobile ? 0 : 16 }}>
          <motion.div initial={{ opacity: 0, y: 30, scale: isMobile ? 1 : 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: isMobile ? 1 : 0.96 }} transition={spring}
            onClick={e => e.stopPropagation()}
            style={{ background: c.surface, borderRadius: isMobile ? 0 : 20, width: "100%", maxWidth: isMobile ? "100%" : 540, height: isMobile ? "100%" : "85vh", maxHeight: isMobile ? "100%" : 700, display: "flex", flexDirection: "column", boxShadow: c.shadowXl, overflow: "hidden" }}>
            <div style={{ padding: 14, borderBottom: `1px solid ${c.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
                <Sparkles size={18} color="#fff" strokeWidth={2.2} />
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 11, height: 11, borderRadius: "50%", background: c.success, border: "2px solid #fff" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.text }}>Sphera</div>
                <div style={{ fontSize: 11, color: c.success, fontWeight: 500 }}>Assistante · En ligne</div>
              </div>
              <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: c.bgAlt, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <X size={16} strokeWidth={2.5} color={c.textSoft} />
              </button>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: 14, background: c.bgAlt, WebkitOverflowScrolling: "touch" }}>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}
                  style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                  <div style={{ maxWidth: "85%", minWidth: 0 }}>
                    <div style={{ background: m.from === "user" ? c.brand : c.surface, color: m.from === "user" ? "#fff" : c.text, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.55, borderRadius: m.from === "user" ? "16px 16px 3px 16px" : "16px 16px 16px 3px", whiteSpace: "pre-wrap", boxShadow: c.shadow, border: m.from === "user" ? "none" : `1px solid ${c.border}`, wordBreak: "break-word" }}>
                      {formatMsg(m.text)}
                    </div>
                    {m.cards && m.cards.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                        {m.cards.map(id => {
                          const l = listings.find(x => x.id === id);
                          if (!l) return null;
                          return (
                            <motion.div key={id} whileHover={{ x: 2 }} onClick={() => { onClose(); setTimeout(() => onOpenListing(l), 150); }}
                              style={{ background: c.surface, borderRadius: 12, padding: 9, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", boxShadow: c.shadow, border: `1px solid ${c.border}` }}>
                              <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${l.grad[0]} 0%, ${l.grad[1]} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <CarSilhouette size={34} color="#fff" opacity={0.5} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.brand} {l.model}</div>
                                <div style={{ fontSize: 11, color: c.textSoft, marginTop: 1 }}>{l.year} · {(l.km/1000).toFixed(0)}k · {l.city}</div>
                              </div>
                              <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{l.price.toLocaleString("fr-FR")} €</div>
                                {l.delta < -8 && <div style={{ fontSize: 10, color: c.success, fontWeight: 700 }}>{l.delta}%</div>}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {m.suggestions.map((s, j) => (
                          <motion.button key={j} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => send(s)}
                            style={{ background: c.surface, border: `1px solid ${c.brand}35`, color: c.brand, padding: "6px 11px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                            {s}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: c.surface, borderRadius: "16px 16px 16px 3px", padding: "12px 16px", width: "fit-content", boxShadow: c.shadow, border: `1px solid ${c.border}`, display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: 7, height: 7, background: c.brand, borderRadius: "50%" }} />
                  ))}
                </motion.div>
              )}
            </div>

            <div style={{ borderTop: `1px solid ${c.border}`, padding: 11, background: c.surface, display: "flex", gap: 7, flexShrink: 0 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 7, background: c.bgAlt, borderRadius: 12, padding: "9px 13px", minWidth: 0 }}>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)}
                  placeholder="Écrivez votre message..."
                  style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", fontFamily: "inherit", color: c.text, minWidth: 0 }} />
                <Mic size={17} color={c.textMute} strokeWidth={2.2} style={{ cursor: "pointer", flexShrink: 0 }} />
              </div>
              <motion.button whileHover={input.trim() ? { scale: 1.04 } : undefined} whileTap={input.trim() ? { scale: 0.96 } : undefined}
                onClick={() => send(input)} disabled={!input.trim() || typing}
                style={{ background: (input.trim() && !typing) ? c.brand : c.bgAlt, border: "none", width: 42, height: 42, borderRadius: 12, cursor: (input.trim() && !typing) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Send size={16} color={(input.trim() && !typing) ? "#fff" : c.textMute} strokeWidth={2.2} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SpheraFloatingButton = ({ onClick }) => (
  <motion.button
    initial={{ scale: 0, y: 80 }} animate={{ scale: 1, y: 0 }}
    transition={{ ...spring, delay: 0.6 }}
    whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 200,
      width: 56, height: 56, borderRadius: "50%",
      background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
      border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 24px ${c.brand}55`
    }}>
    <Sparkles size={24} color="#fff" strokeWidth={2.2} />
    <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2.2, repeat: Infinity }}
      style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${c.brand}`, pointerEvents: "none" }} />
  </motion.button>
);

// ══════════════════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════
// AUTH SCREEN — Inscription / Connexion
// ══════════════════════════════════════════════════════════════════
const AuthScreen = ({ onAuth, accounts, setAccounts }) => {
  const [mode, setMode] = useState("signup"); // signup | login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");

  // Génère un code court unique
  const genCode = (n) => (n.replace(/\s/g, "").slice(0, 4).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase());

  const submit = () => {
    setError("");
    if (!email.includes("@") || !email.includes(".")) {
      setError("Email invalide"); return;
    }
    if (password.length < 6) {
      setError("Mot de passe : 6 caractères minimum"); return;
    }

    if (mode === "signup") {
      if (!name.trim()) { setError("Nom requis"); return; }
      if (accounts[email]) { setError("Un compte existe déjà avec cet email"); return; }

      // Vérifier code parrainage si saisi
      let referredBy = null;
      if (referralCode.trim()) {
        const code = referralCode.trim().toUpperCase();
        const referrer = Object.values(accounts).find(a => a.referralCode === code);
        if (!referrer) { setError("Code de parrainage invalide"); return; }
        referredBy = referrer.email;
      }

      const newAccount = {
        email, password, name: name.trim(), verified: false,
        referralCode: genCode(name),
        referredBy,
        referredUsers: []
      };

      const updatedAccounts = { ...accounts, [email]: newAccount };
      // Ajouter ce nouvel utilisateur à la liste du parrain
      if (referredBy && updatedAccounts[referredBy]) {
        updatedAccounts[referredBy] = {
          ...updatedAccounts[referredBy],
          referredUsers: [...(updatedAccounts[referredBy].referredUsers || []), email]
        };
      }
      setAccounts(updatedAccounts);
      onAuth(newAccount);
    } else {
      const acc = accounts[email];
      if (!acc) { setError("Aucun compte avec cet email"); return; }
      if (acc.password !== password) { setError("Mot de passe incorrect"); return; }
      onAuth(acc);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: c.bg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}
        style={{
          background: c.surface, borderRadius: 20, padding: 32,
          maxWidth: 420, width: "100%", boxShadow: c.shadowXl,
          border: `1px solid ${c.border}`
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <RoolioLogo height={36} color={c.text} accent={c.brand} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px", letterSpacing: -0.5, color: c.text }}>
            {mode === "signup" ? "Bienvenue" : "Bon retour"}
          </h1>
          <p style={{ fontSize: 13, color: c.textSoft, margin: 0 }}>
            {mode === "signup" ? "Créez votre compte en 30 secondes" : "Connectez-vous à votre compte"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 4, background: c.bgAlt, padding: 3, borderRadius: 10, marginBottom: 22 }}>
          {[{ k: "signup", l: "Inscription" }, { k: "login", l: "Connexion" }].map(t => (
            <button key={t.k} onClick={() => { setMode(t.k); setError(""); }}
              style={{
                flex: 1, background: mode === t.k ? c.surface : "transparent",
                color: mode === t.k ? c.text : c.textSoft,
                border: "none", padding: "9px 14px", borderRadius: 7,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                boxShadow: mode === t.k ? c.shadow : "none"
              }}>
              {t.l}
            </button>
          ))}
        </div>

        {mode === "signup" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>
              Votre nom
            </label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Jean Dupont"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                border: `1px solid ${c.borderStrong}`, fontSize: 14,
                fontFamily: "inherit", outline: "none", color: c.text
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: `1px solid ${c.borderStrong}`, fontSize: 14,
              fontFamily: "inherit", outline: "none", color: c.text
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>
            Mot de passe
          </label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
            onKeyDown={e => e.key === "Enter" && submit()}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: `1px solid ${c.borderStrong}`, fontSize: 14,
              fontFamily: "inherit", outline: "none", color: c.text
            }}
          />
        </div>

        {mode === "signup" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>
              Code de parrainage <span style={{ color: c.textMute, fontWeight: 400 }}>(optionnel)</span>
            </label>
            <input
              value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Ex: JEAN3F2A"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                border: `1px solid ${c.borderStrong}`, fontSize: 14,
                fontFamily: "inherit", outline: "none", color: c.text,
                letterSpacing: 1, textTransform: "uppercase"
              }}
            />
          </div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: c.dangerSoft, color: c.danger,
              padding: "10px 12px", borderRadius: 8, fontSize: 12,
              fontWeight: 600, marginBottom: 14, display: "flex", alignItems: "center", gap: 6
            }}>
            <AlertTriangle size={14} strokeWidth={2.5} />
            {error}
          </motion.div>
        )}

        <Button variant="brand" size="lg" fullWidth icon={ArrowRight} iconRight onClick={submit}>
          {mode === "signup" ? "Créer mon compte" : "Se connecter"}
        </Button>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
            style={{
              background: "transparent", border: "none", fontSize: 12, color: c.textSoft,
              cursor: "pointer", fontFamily: "inherit"
            }}
          >
            {mode === "signup" ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
          </button>
        </div>

        {/* Mode démo */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
          <button
            onClick={() => {
              const demo = {
                email: "demo@roolio.fr",
                password: "demo",
                name: "Visiteur Démo",
                verified: true,
                referralCode: "DEMO0000",
                referredUsers: [],
                isDemo: true
              };
              onAuth(demo);
            }}
            style={{
              width: "100%", background: c.bgAlt, border: `1px solid ${c.borderStrong}`,
              padding: "11px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: c.text, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7
            }}
          >
            <PlayCircle size={15} strokeWidth={2.2} />
            Essayer sans inscription
          </button>
          <div style={{ fontSize: 10, color: c.textMute, textAlign: "center", marginTop: 6 }}>
            Mode démo · données non sauvegardées
          </div>
        </div>

        <div style={{ marginTop: 18, padding: 12, background: c.bgAlt, borderRadius: 8, fontSize: 11, color: c.textMute, textAlign: "center" }}>
          Stockage temporaire en mémoire · Aucun backend
        </div>
      </motion.div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// ROUE DE LA CHANCE — Récompense aléatoire quotidienne
// ══════════════════════════════════════════════════════════════════
const SpinWheel = ({ onClose, onWin }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);

  const segments = [
    { label: "+10", value: 10, color: "#94A3B8", weight: 30 },
    { label: "+50", value: 50, color: c.brand, weight: 25 },
    { label: "+100", value: 100, color: c.success, weight: 20 },
    { label: "Rien", value: 0, color: "#64748B", weight: 15 },
    { label: "+250", value: 250, color: c.warning, weight: 7 },
    { label: "+500", value: 500, color: c.danger, weight: 2 },
    { label: "Ticket", value: "ticket", color: c.gold, weight: 0.9 },
    { label: "JACKPOT", value: 1000, color: c.premium, weight: 0.1 },
  ];

  const pickSegment = () => {
    const total = segments.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (let i = 0; i < segments.length; i++) {
      r -= segments[i].weight;
      if (r <= 0) return i;
    }
    return 0;
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const winIdx = pickSegment();
    const segAngle = 360 / segments.length;
    const turns = 6;
    const finalRotation = turns * 360 + (360 - winIdx * segAngle - segAngle / 2);
    setRotation(finalRotation);
    setTimeout(() => {
      setSpinning(false);
      setResult(segments[winIdx]);
      if (segments[winIdx].value && segments[winIdx].value !== "ticket") {
        onWin(segments[winIdx].value);
      } else if (segments[winIdx].value === "ticket") {
        onWin(0, true);
      }
    }, 4500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, background: "rgba(10,22,40,0.7)",
          backdropFilter: "blur(10px)", zIndex: 450,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={spring}
          style={{
            background: c.surface, borderRadius: 20, padding: 24,
            maxWidth: 400, width: "100%", boxShadow: c.shadowXl, textAlign: "center", position: "relative"
          }}
        >
          <button onClick={onClose} disabled={spinning} style={{
            position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: 8,
            background: c.bgAlt, border: "none", cursor: spinning ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", opacity: spinning ? 0.4 : 1
          }}>
            <X size={15} strokeWidth={2.5} color={c.textSoft} />
          </button>

          <Badge tone="gold" icon={Gift}>Roue quotidienne</Badge>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "12px 0 6px", letterSpacing: -0.4 }}>
            Tente ta chance
          </h2>
          <p style={{ fontSize: 12, color: c.textSoft, margin: "0 0 20px" }}>
            1 spin gratuit toutes les 24h
          </p>

          {/* Roue */}
          <div style={{ position: "relative", width: 260, height: 260, margin: "0 auto 20px" }}>
            {/* Pointeur */}
            <div style={{
              position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: `18px solid ${c.text}`, zIndex: 3
            }} />
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 4.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: "100%", height: "100%", filter: `drop-shadow(0 8px 24px rgba(0,0,0,0.15))` }}
            >
              <svg viewBox="0 0 200 200" width="100%" height="100%">
                <circle cx="100" cy="100" r="98" fill={c.text} />
                {segments.map((s, i) => {
                  const segAngle = 360 / segments.length;
                  const startAngle = i * segAngle - 90;
                  const endAngle = startAngle + segAngle;
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  const r = 94;
                  const x1 = 100 + r * Math.cos(startRad);
                  const y1 = 100 + r * Math.sin(startRad);
                  const x2 = 100 + r * Math.cos(endRad);
                  const y2 = 100 + r * Math.sin(endRad);
                  const labelAngle = startAngle + segAngle / 2;
                  const labelRad = (labelAngle * Math.PI) / 180;
                  const labelR = 62;
                  const lx = 100 + labelR * Math.cos(labelRad);
                  const ly = 100 + labelR * Math.sin(labelRad);
                  return (
                    <g key={i}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                        fill={s.color}
                        stroke="#fff"
                        strokeWidth="1"
                      />
                      <text
                        x={lx} y={ly}
                        fill="#fff"
                        fontSize={s.label === "JACKPOT" ? "8" : "11"}
                        fontWeight="800"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${labelAngle + 90}, ${lx}, ${ly})`}
                        style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.3px" }}
                      >
                        {s.label}
                      </text>
                    </g>
                  );
                })}
                {/* Centre */}
                <circle cx="100" cy="100" r="22" fill={c.text} />
              </svg>
            </motion.div>
            {/* Logo central par-dessus (statique) */}
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: 44, height: 44, borderRadius: "50%", background: c.text,
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
              pointerEvents: "none"
            }}>
              <Sparkles size={20} color={c.gold} strokeWidth={2.4} />
            </div>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              style={{
                background: result.value === 0 ? c.bgAlt : c.successSoft,
                color: result.value === 0 ? c.textSoft : c.success,
                padding: 12, borderRadius: 10, marginBottom: 14,
                fontWeight: 700, fontSize: 14
              }}
            >
              {result.value === 0 ? "Pas de chance, reviens demain" :
               result.value === "ticket" ? "+1 ticket concours" :
               `+${result.value} points`}
            </motion.div>
          )}

          {!result ? (
            <Button variant="brand" size="lg" fullWidth icon={Sparkles} onClick={spin} disabled={spinning}>
              {spinning ? "..." : "Lancer la roue"}
            </Button>
          ) : (
            <Button variant="ghost" fullWidth onClick={onClose}>Fermer</Button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════
// FLASH EVENT BANNER — Événement éclair en navbar
// ══════════════════════════════════════════════════════════════════
const flashEvents = [
  { id: 1, label: "Happy Hour", desc: "×3 points sur visites", icon: Zap, color: c.warning },
  { id: 2, label: "Mega Boost", desc: "×5 sur les missions", icon: Rocket, color: c.danger },
  { id: 3, label: "Soirée Tickets", desc: "Tickets concours −50%", icon: Ticket, color: c.brand },
];

const FlashEventBar = ({ event, secondsLeft, onClick }) => {
  if (!event) return null;
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
      onClick={onClick}
      style={{
        background: `linear-gradient(90deg, ${event.color} 0%, ${event.color}dd 100%)`,
        color: "#fff", padding: "8px 14px", display: "flex", alignItems: "center",
        gap: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, justifyContent: "center"
      }}
    >
      <event.icon size={14} strokeWidth={2.5} />
      <span><strong>{event.label}</strong> · {event.desc}</span>
      <span style={{
        background: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: 4,
        fontFamily: "monospace", fontSize: 11
      }}>
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </span>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════
// SOCIAL TOAST — Notifications fantômes d'autres utilisateurs
// ══════════════════════════════════════════════════════════════════
const socialEvents = [
  { name: "Sophie L.", action: "vient de gagner +340 points", icon: Coins, color: c.brand },
  { name: "Karim B.", action: "a remporté un ticket Tesla", icon: Ticket, color: c.danger },
  { name: "Thomas R.", action: "vient de te dépasser", icon: TrendingUp, color: c.warning },
  { name: "Julie M.", action: "a publié 3 annonces", icon: Plus, color: c.success },
  { name: "Pierre D.", action: "a obtenu le badge Champion", icon: Award, color: c.gold },
  { name: "Léa F.", action: "est en série de 30 jours", icon: Flame, color: c.warning },
];

const SocialToast = ({ event, onClose }) => {
  if (!event) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
        transition={spring}
        style={{
          position: "fixed", top: 80, right: 16, zIndex: 220,
          background: c.surface, borderRadius: 12, padding: 11,
          boxShadow: c.shadowLg, border: `1px solid ${c.border}`,
          maxWidth: 280, display: "flex", gap: 10, alignItems: "center"
        }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: event.color + "20",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <event.icon size={15} color={event.color} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: c.text, lineHeight: 1.4 }}>
            <strong>{event.name}</strong> {event.action}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "transparent", border: "none", cursor: "pointer", padding: 2, color: c.textMute
        }}>
          <X size={12} strokeWidth={2.5} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════
// PAGE PROFIL UTILISATEUR
// ══════════════════════════════════════════════════════════════════
const ProfilePage = ({ authedUser, onLogout, onShowSettings }) => {
  const { user, updateUser } = useUser();
  const plan = PASS_PLANS[user.plan];
  const [activationCode, setActivationCode] = useState("");
  const [activationMsg, setActivationMsg] = useState(null);

  const tryActivate = () => {
    const code = activationCode.trim().toUpperCase();
    // Codes manuels que tu donneras à un user qui a payé
    const codes = {
      "ROOLIO-PLAYER-2024": { plan: "player", label: "Pass Player activé" },
      "ROOLIO-ELITE-2024":  { plan: "elite",  label: "Pass Elite activé" },
      "ROOLIO-BATTLE-2024": { battlePass: true, label: "Battle Pass Premium activé" }
    };
    const match = codes[code];
    if (!match) {
      setActivationMsg({ ok: false, text: "Code invalide ou expiré" });
      return;
    }
    if (match.plan) updateUser({ plan: match.plan });
    if (match.battlePass) updateUser({ seasonPassPremium: true });
    setActivationMsg({ ok: true, text: match.label });
    setActivationCode("");
    setTimeout(() => setActivationMsg(null), 4000);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <Badge tone="brand" icon={User}>Mon compte</Badge>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 0", letterSpacing: -0.6 }}>Profil et paramètres</h1>
      </div>

      {/* Carte identité */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ padding: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, flexShrink: 0,
            background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 26, fontWeight: 700
          }}>
            {user.avatar || user.dealerName[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", letterSpacing: -0.3 }}>{user.dealerName}</h2>
            <div style={{ fontSize: 13, color: c.textSoft, marginBottom: 6 }}>{authedUser?.email}</div>
            <Badge tone={user.plan === "elite" ? "premium" : user.plan === "player" ? "brand" : "neutral"} size="sm" icon={user.plan === "elite" ? Crown : user.plan === "player" ? ShieldCheck : User}>
              Pass {plan.name}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" icon={Edit3} onClick={onShowSettings}>Modifier</Button>
        </div>
      </Card>

      {/* Code parrainage */}
      {authedUser?.referralCode && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.textSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
              Code de parrainage
            </div>
            <div style={{
              background: c.bgAlt, padding: 14, borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: c.brand, letterSpacing: 2, fontFamily: "monospace" }}>
                {authedUser.referralCode}
              </div>
              <Button variant="soft" size="sm" icon={Share2} onClick={() => {
                if (navigator.clipboard) navigator.clipboard.writeText(authedUser.referralCode);
              }}>Copier</Button>
            </div>
            <div style={{ fontSize: 12, color: c.textSoft, marginTop: 10, lineHeight: 1.5 }}>
              Partagez ce code avec un ami. À son inscription, vous recevez tous les deux <strong>500 points bonus</strong>.
            </div>
          </div>
        </Card>
      )}

      {/* Statistiques */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.textSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Statistiques
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10 }}>
            {[
              { l: "Niveau", v: user.level, Icon: Crown },
              { l: "Points", v: user.points.toLocaleString("fr-FR"), Icon: Coins },
              { l: "Série", v: `${user.streak}j`, Icon: Flame },
              { l: "Filleuls", v: authedUser?.referredUsers?.length || 0, Icon: User }
            ].map((s, i) => (
              <div key={i} style={{ background: c.bgAlt, padding: 12, borderRadius: 10 }}>
                <s.Icon size={14} color={c.brand} strokeWidth={2.2} style={{ marginBottom: 5 }} />
                <div style={{ fontSize: 11, color: c.textMute, marginBottom: 2 }}>{s.l}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: c.text }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Sécurité */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.textSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
            Sécurité
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { l: "Email vérifié", v: authedUser?.verified ? "Vérifié" : "Non vérifié", Icon: CheckCircle2, status: authedUser?.verified ? "ok" : "warn" },
              { l: "Mot de passe", v: "Modifier", Icon: Lock, action: true },
              { l: "Authentification 2FA", v: "Activer", Icon: Shield, action: true }
            ].map((s, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 12px", background: c.bgAlt, borderRadius: 10,
                cursor: s.action ? "pointer" : "default"
              }}>
                <s.Icon size={16} color={s.status === "ok" ? c.success : s.status === "warn" ? c.warning : c.textSoft} strokeWidth={2.2} />
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: c.text }}>{s.l}</div>
                <div style={{ fontSize: 12, color: s.action ? c.brand : c.textSoft, fontWeight: s.action ? 600 : 500 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Activation manuelle */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: c.textSoft, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            Activer un Pass
          </div>
          <div style={{ fontSize: 12, color: c.textSoft, marginBottom: 12, lineHeight: 1.5 }}>
            Vous avez payé sur Stripe ? Entrez le code reçu par email pour activer votre Pass.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={activationCode}
              onChange={e => setActivationCode(e.target.value.toUpperCase())}
              placeholder="ROOLIO-XXX-2024"
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 10,
                border: `1px solid ${c.borderStrong}`, fontSize: 13,
                fontFamily: "monospace", outline: "none", color: c.text,
                letterSpacing: 1
              }}
            />
            <Button variant="brand" size="sm" onClick={tryActivate} disabled={!activationCode.trim()}>
              Activer
            </Button>
          </div>
          {activationMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 10, padding: 10, borderRadius: 8,
                background: activationMsg.ok ? c.successSoft : c.dangerSoft,
                color: activationMsg.ok ? c.success : c.danger,
                fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              {activationMsg.ok ? <CheckCircle2 size={14} strokeWidth={2.5} /> : <AlertTriangle size={14} strokeWidth={2.5} />}
              {activationMsg.text}
            </motion.div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div style={{ padding: 20 }}>
          <Button variant="ghost" icon={LogOut} onClick={onLogout} fullWidth>Se déconnecter</Button>
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// FAQ
// ══════════════════════════════════════════════════════════════════
const FAQPage = () => {
  const [open, setOpen] = useState(0);
  const faqs = [
    { q: "Comment fonctionne Roolio ?", a: "Roolio est une plateforme automobile qui combine une marketplace de voitures vérifiées, un assistant IA (Sphera) et un système de gamification permettant de gagner de vraies voitures via des concours mensuels." },
    { q: "Les concours sont-ils certifiés ?", a: "Oui, tous nos tirages au sort sont certifiés par huissier de justice. Le règlement complet est disponible sur la page Mentions légales." },
    { q: "Comment gagner des points ?", a: "En vous connectant chaque jour, en complétant les missions quotidiennes et hebdomadaires, en publiant des annonces, en parrainant des amis. Les abonnés Player et Elite gagnent 2 à 3 fois plus de points." },
    { q: "Quelle est la différence entre les Pass ?", a: "Le Pass Explorer est gratuit avec un accès limité (10 annonces/jour, pas de gain de points). Le Pass Player (4,99 €/mois) débloque les points et les concours. Le Pass Elite (9,99 €/mois) ajoute le multiplicateur ×2, les concours exclusifs et 1 000 points/mois." },
    { q: "Puis-je annuler mon abonnement ?", a: "Oui, à tout moment depuis votre espace personnel. L'abonnement reste actif jusqu'à la fin de la période payée." },
    { q: "Comment vérifier la fiabilité d'un vendeur ?", a: "Chaque vendeur est noté par les acheteurs. Les badges Pro Certifié et Vendeur Vérifié indiquent une vérification d'identité. Sphera vous donne aussi un avis automatique sur chaque annonce." },
    { q: "Que se passe-t-il si je gagne une voiture ?", a: "Vous êtes contacté par notre équipe sous 48h. La voiture est livrée à votre domicile, immatriculée à votre nom, avec carte grise et garantie de 6 mois minimum." },
    { q: "Mes données sont-elles protégées ?", a: "Conformément au RGPD, vos données sont stockées en France et chiffrées. Voir notre politique de confidentialité pour les détails." },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 22, textAlign: "center" }}>
        <Badge tone="brand" icon={HelpCircle}>Centre d'aide</Badge>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "10px 0 6px", letterSpacing: -0.7 }}>Questions fréquentes</h1>
        <p style={{ fontSize: 14, color: c.textSoft, margin: 0 }}>Trouvez rapidement une réponse à vos questions</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {faqs.map((f, i) => (
          <Card key={i}>
            <div onClick={() => setOpen(open === i ? -1 : i)}
              style={{ padding: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: c.text }}>{f.q}</div>
              <motion.div animate={{ rotate: open === i ? 180 : 0 }}>
                <ChevronRight size={16} color={c.textMute} strokeWidth={2.2} style={{ transform: "rotate(90deg)" }} />
              </motion.div>
            </div>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ padding: "0 16px 16px", fontSize: 13, color: c.textSoft, lineHeight: 1.6 }}>
                    {f.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 22, padding: 18, background: c.brandSoft, borderRadius: 12, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 6 }}>Vous n'avez pas trouvé votre réponse ?</div>
        <div style={{ fontSize: 12, color: c.textSoft, marginBottom: 12 }}>Notre équipe vous répond sous 24h ouvrées</div>
        <Button variant="brand" size="sm" icon={MessageCircle}>Contacter le support</Button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// À PROPOS
// ══════════════════════════════════════════════════════════════════
const AboutPage = () => {
  const team = [
    { name: "Alexandre Marchand", role: "CEO & Co-fondateur", initial: "AM" },
    { name: "Camille Rivière", role: "CTO & Co-fondatrice", initial: "CR" },
    { name: "Yannis Bouvier", role: "Head of Product", initial: "YB" },
    { name: "Léa Fontana", role: "Head of Design", initial: "LF" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Badge tone="brand" icon={Sparkles}>Notre histoire</Badge>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 700, margin: "10px 0 12px", letterSpacing: -1 }}>
          Roolio change l'achat automobile
        </h1>
        <p style={{ fontSize: 16, color: c.textSoft, margin: 0, lineHeight: 1.6 }}>
          Fondée en 2024 à Lyon, Roolio est une plateforme automobile nouvelle génération qui combine intelligence artificielle, marketplace sécurisée et expérience gamifiée.
        </p>
      </div>

      {/* Chiffres clés */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 30 }}>
        {[
          { v: "47k", l: "Annonces vérifiées" },
          { v: "150k", l: "Membres actifs" },
          { v: "12", l: "Voitures gagnées" },
          { v: "4,8/5", l: "Note moyenne" }
        ].map((s, i) => (
          <Card key={i}>
            <div style={{ padding: 18, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: c.brand, letterSpacing: -0.8, marginBottom: 4 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: c.textSoft }}>{s.l}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Mission */}
      <Card style={{ marginBottom: 22 }}>
        <div style={{ padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px", letterSpacing: -0.4 }}>Notre mission</h2>
          <p style={{ fontSize: 14, color: c.textSoft, lineHeight: 1.7, margin: 0 }}>
            Acheter ou vendre une voiture reste aujourd'hui une expérience anxiogène : risque d'arnaque, manque de transparence, prix opaques. Nous construisons la première plateforme automobile où chaque utilisateur peut <strong style={{ color: c.text }}>acheter en toute confiance</strong>, grâce à la vérification systématique des annonces, un assistant IA expert et un système qui récompense la fidélité avec de vraies voitures.
          </p>
        </div>
      </Card>

      {/* Équipe */}
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 14px", letterSpacing: -0.4 }}>L'équipe</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 30 }}>
        {team.map((t, i) => (
          <Card key={i}>
            <div style={{ padding: 18, textAlign: "center" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, margin: "0 auto 10px",
                background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 18, fontWeight: 700
              }}>
                {t.initial}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: c.textSoft }}>{t.role}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Coordonnées */}
      <Card>
        <div style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px", letterSpacing: -0.3 }}>Roolio SAS</h3>
          <div style={{ fontSize: 12, color: c.textSoft, lineHeight: 1.7 }}>
            Capital : 50 000 €<br/>
            RCS Lyon : 932 487 561<br/>
            Siège : 23 rue de la République, 69002 Lyon, France<br/>
            TVA : FR 12 932487561
          </div>
        </div>
      </Card>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// CONTACT
// ══════════════════════════════════════════════════════════════════
const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", subject: "general", message: "" });
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: 22, textAlign: "center" }}>
        <Badge tone="brand" icon={MessageCircle}>Contact</Badge>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "10px 0 6px", letterSpacing: -0.6 }}>Une question ?</h1>
        <p style={{ fontSize: 14, color: c.textSoft, margin: 0 }}>Réponse sous 24h ouvrées</p>
      </div>

      <Card>
        <div style={{ padding: 24 }}>
          {sent && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: c.successSoft, color: c.success, padding: 12, borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} strokeWidth={2.5} />
              Message envoyé. Nous vous répondons sous 24h.
            </motion.div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>Nom</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 14, fontFamily: "inherit", outline: "none", color: c.text }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 14, fontFamily: "inherit", outline: "none", color: c.text }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>Sujet</label>
            <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 14, fontFamily: "inherit", outline: "none", color: c.text, background: c.surface }}>
              <option value="general">Question générale</option>
              <option value="account">Mon compte</option>
              <option value="billing">Abonnement / Facturation</option>
              <option value="contest">Concours</option>
              <option value="bug">Signaler un bug</option>
              <option value="press">Presse / Partenariat</option>
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>Message</label>
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5}
              style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 14, fontFamily: "inherit", outline: "none", color: c.text, resize: "vertical" }} />
          </div>
          <Button variant="brand" icon={Send} fullWidth onClick={submit} disabled={!form.name || !form.email || !form.message}>
            Envoyer le message
          </Button>
        </div>
      </Card>

      <div style={{ marginTop: 20, padding: 16, background: c.bgAlt, borderRadius: 12, fontSize: 12, color: c.textSoft, lineHeight: 1.7 }}>
        <strong style={{ color: c.text }}>Coordonnées</strong><br/>
        Email : contact@roolio.fr<br/>
        Téléphone : 04 78 00 00 00 (lun-ven, 9h-18h)<br/>
        Adresse : 23 rue de la République, 69002 Lyon
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// PAGES LÉGALES
// ══════════════════════════════════════════════════════════════════
const LegalPage = ({ section = "cgu" }) => {
  const sections = {
    cgu: {
      title: "Conditions Générales d'Utilisation",
      content: [
        ["Article 1 — Objet", "Les présentes CGU régissent l'utilisation de la plateforme Roolio, éditée par Roolio SAS, accessible via le site web et l'application mobile."],
        ["Article 2 — Inscription", "L'inscription est ouverte à toute personne physique majeure ou personne morale. Les informations fournies doivent être exactes et à jour."],
        ["Article 3 — Abonnements", "Les abonnements Player (4,99 €/mois) et Elite (9,99 €/mois) sont reconductibles tacitement. Résiliation possible à tout moment sans frais depuis l'espace personnel."],
        ["Article 4 — Système de points", "Les points accumulés n'ont aucune valeur monétaire et ne sont ni remboursables ni transférables. Ils servent exclusivement à participer aux concours et achats internes."],
        ["Article 5 — Concours", "Les concours sont ouverts aux abonnés Player et Elite. Le règlement complet est déposé chez Maître Bernard, huissier de justice à Lyon."],
        ["Article 6 — Responsabilité", "Roolio agit comme intermédiaire et n'est pas partie aux transactions entre acheteurs et vendeurs. Les transactions s'effectuent sous la responsabilité des parties."],
        ["Article 7 — Modification", "Roolio se réserve le droit de modifier les CGU. Les utilisateurs sont informés par email 30 jours avant toute modification substantielle."]
      ]
    },
    privacy: {
      title: "Politique de confidentialité (RGPD)",
      content: [
        ["Responsable du traitement", "Roolio SAS, 23 rue de la République, 69002 Lyon. Email : dpo@roolio.fr"],
        ["Données collectées", "Email, nom, mot de passe (chiffré), historique de navigation, interactions avec la plateforme, données de transaction."],
        ["Finalités", "Fourniture du service, personnalisation, communications marketing (avec consentement), prévention de la fraude, obligations légales."],
        ["Base légale", "Exécution du contrat, consentement, intérêt légitime, obligation légale."],
        ["Durée de conservation", "Compte actif : durée de la relation contractuelle. Compte inactif : 3 ans après dernière connexion. Données comptables : 10 ans."],
        ["Vos droits", "Accès, rectification, effacement, portabilité, opposition, limitation. Pour exercer vos droits : dpo@roolio.fr"],
        ["Cookies", "Cookies techniques (obligatoires), cookies analytiques (avec consentement), cookies publicitaires (avec consentement)."],
        ["Hébergement", "Vos données sont hébergées en France par OVHcloud, certifié ISO 27001."]
      ]
    },
    legal: {
      title: "Mentions légales",
      content: [
        ["Éditeur", "Roolio SAS\nCapital : 50 000 €\nRCS Lyon : 932 487 561\nSiège : 23 rue de la République, 69002 Lyon\nTVA intracommunautaire : FR 12 932487561\nDirecteur de la publication : Alexandre Marchand"],
        ["Hébergeur", "OVH SAS\n2 rue Kellermann, 59100 Roubaix, France\nTéléphone : 09 72 10 10 07"],
        ["Propriété intellectuelle", "L'ensemble du contenu de la plateforme (textes, images, logo, code) est protégé par le droit d'auteur. Toute reproduction non autorisée est interdite."],
        ["Médiation", "Conformément à l'article L. 612-1 du Code de la consommation, le consommateur peut recourir gratuitement au service de médiation MEDICYS : www.medicys.fr"]
      ]
    },
    contest: {
      title: "Règlement des concours",
      content: [
        ["Article 1 — Organisation", "Roolio SAS organise des tirages au sort mensuels permettant aux participants de gagner des véhicules. Le règlement complet est déposé chez Maître Bernard, huissier de justice à Lyon."],
        ["Article 2 — Participation", "La participation est réservée aux abonnés Player ou Elite, majeurs et résidents en France métropolitaine. Un participant peut acquérir plusieurs tickets pour augmenter ses chances."],
        ["Article 3 — Tirage", "Le tirage est effectué par tirage aléatoire certifié, sous contrôle d'huissier, le dernier jour ouvré du mois."],
        ["Article 4 — Lots", "Les voitures gagnées sont neuves ou récentes (moins de 3 ans), avec carte grise au nom du gagnant et garantie minimum 6 mois."],
        ["Article 5 — Frais", "Aucun frais à la charge du gagnant. Carte grise, livraison et taxes prises en charge par Roolio."],
        ["Article 6 — Annonce", "Le gagnant est contacté par email et téléphone dans les 48h suivant le tirage. À défaut de réponse sous 7 jours, un nouveau tirage est effectué."]
      ]
    }
  };

  const data = sections[section] || sections.cgu;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 22px", letterSpacing: -0.6 }}>{data.title}</h1>
      <Card>
        <div style={{ padding: 24 }}>
          {data.content.map(([title, body], i) => (
            <div key={i} style={{ marginBottom: i < data.content.length - 1 ? 22 : 0 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: c.text, margin: "0 0 8px", letterSpacing: -0.2 }}>{title}</h2>
              <p style={{ fontSize: 13, color: c.textSoft, lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>{body}</p>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ marginTop: 16, fontSize: 11, color: c.textMute, textAlign: "center" }}>
        Dernière mise à jour : 15 mars 2024
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════════════════════════
const Footer = ({ onGo }) => (
  <footer style={{
    borderTop: `1px solid ${c.border}`, background: c.surface,
    padding: "32px 16px 24px", marginTop: 40
  }}>
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24, marginBottom: 24 }}>
        <div>
          <div style={{ marginBottom: 10 }}>
            <RoolioLogo height={26} color={c.text} accent={c.brand} />
          </div>
          <div style={{ fontSize: 12, color: c.textSoft, lineHeight: 1.6 }}>
            La plateforme automobile nouvelle génération. Achat sécurisé, IA experte, concours certifiés.
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Produit</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[["marketplace", "Marketplace"], ["dealership", "Concession"], ["contests", "Concours"], ["subscriptions", "Abonnements"]].map(([k, l]) => (
              <button key={k} onClick={() => onGo(k)} style={{ background: "transparent", border: "none", padding: 0, fontSize: 12, color: c.textSoft, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>{l}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Entreprise</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[["about", "À propos"], ["contact", "Contact"], ["faq", "Aide / FAQ"]].map(([k, l]) => (
              <button key={k} onClick={() => onGo(k)} style={{ background: "transparent", border: "none", padding: 0, fontSize: 12, color: c.textSoft, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>{l}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Légal</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[["legal", "Mentions légales"], ["cgu", "CGU"], ["privacy", "RGPD"], ["contest_rules", "Règlement concours"]].map(([k, l]) => (
              <button key={k} onClick={() => onGo(k)} style={{ background: "transparent", border: "none", padding: 0, fontSize: 12, color: c.textSoft, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>{l}</button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Partenaires</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: c.textSoft }}>
            <span>Younited Credit</span>
            <span>AXA Assurance</span>
            <span>Histovec</span>
            <span>Roole</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 11, color: c.textMute }}>© 2024 Roolio SAS. Tous droits réservés.</div>
        <div style={{ display: "flex", gap: 14, fontSize: 11, color: c.textMute }}>
          <span>Made in Lyon, France</span>
          <span>·</span>
          <span>Données hébergées en France</span>
        </div>
      </div>
    </div>
  </footer>
);

// ══════════════════════════════════════════════════════════════════
// SPLASH SCREEN — Animation au démarrage
// ══════════════════════════════════════════════════════════════════
const SplashScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.5, ease } }}
    style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}
  >
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

    {/* Halo pulsant en arrière-plan */}
    <motion.div
      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: 280, height: 280, borderRadius: "50%",
        background: "rgba(255,255,255,0.15)",
        pointerEvents: "none"
      }}
    />
    <motion.div
      animate={{ scale: [1, 1.7, 1], opacity: [0.2, 0, 0.2] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      style={{
        position: "absolute",
        width: 280, height: 280, borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        pointerEvents: "none"
      }}
    />

    {/* Logo container */}
    <motion.div
      initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ ...spring, delay: 0.1 }}
      style={{ position: "relative", zIndex: 1 }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 96, height: 96, borderRadius: 24,
          background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25), 0 0 80px rgba(255,255,255,0.3)",
          marginBottom: 24
        }}
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.4 }}
        >
          <Car size={48} color={c.brand} strokeWidth={2.4} />
        </motion.div>
      </motion.div>
    </motion.div>

    {/* Nom de la marque (lettres qui apparaissent une par une) */}
    <div style={{ display: "flex", gap: 2, marginBottom: 14, position: "relative", zIndex: 1 }}>
      {"Roolio".split("").map((letter, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.07, ...springSoft }}
          style={{
            fontSize: 38, fontWeight: 700, color: "#fff",
            letterSpacing: -1.2
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>

    {/* Tagline */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      style={{
        fontSize: 13, color: "rgba(255,255,255,0.85)",
        fontWeight: 500, letterSpacing: 0.3, marginBottom: 40,
        position: "relative", zIndex: 1
      }}
    >
      Plateforme automobile nouvelle génération
    </motion.div>

    {/* Loader fin en bas */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.4 }}
      style={{
        width: 120, height: 3, background: "rgba(255,255,255,0.2)",
        borderRadius: 999, overflow: "hidden",
        position: "relative", zIndex: 1
      }}
    >
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "60%", height: "100%", background: "#fff", borderRadius: 999 }}
      />
    </motion.div>

    {/* Footer */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.4 }}
      style={{
        position: "absolute", bottom: 32,
        fontSize: 11, color: "rgba(255,255,255,0.6)",
        fontWeight: 500, letterSpacing: 0.5
      }}
    >
      Made in Lyon, France
    </motion.div>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════
// THANK YOU MODAL — après paiement Stripe
// ══════════════════════════════════════════════════════════════════
const ThankYouModal = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(10,22,40,0.7)",
          backdropFilter: "blur(10px)", zIndex: 600,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={spring}
          onClick={e => e.stopPropagation()}
          style={{
            background: c.surface, borderRadius: 20, padding: 32,
            maxWidth: 440, width: "100%", boxShadow: c.shadowXl, textAlign: "center"
          }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.2 }}
            style={{
              width: 72, height: 72, borderRadius: 18, margin: "0 auto 18px",
              background: `linear-gradient(135deg, ${c.success} 0%, #008a61 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 12px 28px ${c.success}40`
            }}
          >
            <CheckCircle2 size={38} color="#fff" strokeWidth={2.2} />
          </motion.div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.4, color: c.text }}>
            Paiement reçu, merci.
          </h2>
          <p style={{ fontSize: 13, color: c.textSoft, margin: "0 0 20px", lineHeight: 1.6 }}>
            Votre paiement Stripe a bien été enregistré. Vous allez recevoir un <strong>email de confirmation avec un code d'activation</strong> sous quelques minutes.
          </p>
          <div style={{
            background: c.brandSoft, padding: 14, borderRadius: 12,
            textAlign: "left", marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 10
          }}>
            <Lightbulb size={16} color={c.brand} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12, color: c.text, lineHeight: 1.55 }}>
              <strong>Comment activer votre Pass :</strong><br/>
              Rendez-vous dans <strong>Mon profil</strong> → <strong>Activer un Pass</strong> et entrez le code reçu par email.
            </div>
          </div>
          <Button variant="brand" size="lg" fullWidth icon={ArrowRight} iconRight onClick={onClose}>
            Continuer
          </Button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ══════════════════════════════════════════════════════════════════
// TRACKING — Comptage des actions clés (localStorage)
// ══════════════════════════════════════════════════════════════════
const trackEvent = (action) => {
  try {
    const raw = localStorage.getItem("roolio_tracking") || "{}";
    const data = JSON.parse(raw);
    data[action] = (data[action] || 0) + 1;
    data._lastEvent = new Date().toISOString();
    localStorage.setItem("roolio_tracking", JSON.stringify(data));
  } catch {}
};

// ══════════════════════════════════════════════════════════════════
// LIVE COUNTER — "X personnes testent en ce moment"
// ══════════════════════════════════════════════════════════════════
const LiveCounter = () => {
  const [count, setCount] = useState(247);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = c + delta;
        return Math.max(200, Math.min(350, next));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: c.successSoft, padding: "6px 12px", borderRadius: 999,
        fontSize: 12, fontWeight: 600, color: c.success
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        style={{ width: 7, height: 7, borderRadius: "50%", background: c.success }}
      />
      <motion.span key={count} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
        {count} personnes testent Roolio en ce moment
      </motion.span>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════
// FEEDBACK MODAL — Collecter les avis testeurs
// ══════════════════════════════════════════════════════════════════
const FeedbackModal = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [liked, setLiked] = useState("");
  const [improve, setImprove] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    try {
      const raw = localStorage.getItem("roolio_feedback") || "[]";
      const list = JSON.parse(raw);
      list.push({
        rating, liked, improve,
        date: new Date().toISOString()
      });
      localStorage.setItem("roolio_feedback", JSON.stringify(list));
      trackEvent("feedback_submitted");
    } catch {}
    setSent(true);
    setTimeout(() => {
      onClose();
      setStep(0); setRating(0); setLiked(""); setImprove(""); setSent(false);
    }, 2000);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)",
          backdropFilter: "blur(8px)", zIndex: 450,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={spring}
          onClick={e => e.stopPropagation()}
          style={{
            background: c.surface, borderRadius: 20, maxWidth: 460, width: "100%",
            padding: 28, boxShadow: c.shadowXl, position: "relative"
          }}
        >
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: 8,
            background: c.bgAlt, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <X size={15} strokeWidth={2.5} color={c.textSoft} />
          </button>

          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring}
                style={{
                  width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
                  background: c.successSoft,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <CheckCircle2 size={32} color={c.success} strokeWidth={2.2} />
              </motion.div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: c.text }}>
                Merci pour ton retour
              </h2>
              <p style={{ fontSize: 13, color: c.textSoft, margin: 0 }}>
                Ton avis nous aide à améliorer Roolio
              </p>
            </div>
          ) : (
            <>
              <Badge tone="brand" icon={MessageCircle}>Ton avis compte</Badge>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "10px 0 6px", letterSpacing: -0.4, color: c.text }}>
                Aide-nous à améliorer Roolio
              </h2>
              <p style={{ fontSize: 12, color: c.textSoft, margin: "0 0 22px" }}>
                Réponse en 30 secondes — anonyme
              </p>

              {/* Note */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 10 }}>
                  Ton expérience globale
                </label>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <motion.button
                      key={n}
                      whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: "transparent", border: "none", cursor: "pointer", padding: 4
                      }}
                    >
                      <Star
                        size={32}
                        color={(hoverRating || rating) >= n ? c.gold : c.borderStrong}
                        fill={(hoverRating || rating) >= n ? c.gold : "transparent"}
                        strokeWidth={2}
                      />
                    </motion.button>
                  ))}
                </div>
                {rating > 0 && (
                  <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: c.textSoft }}>
                    {["", "À retravailler", "Mitigée", "Correcte", "Bonne", "Excellente"][rating]}
                  </div>
                )}
              </div>

              {/* Liked */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>
                  Qu'est-ce que tu as aimé ?
                </label>
                <textarea
                  value={liked} onChange={e => setLiked(e.target.value)}
                  placeholder="Le concept, le design, Sphera..."
                  rows={2} maxLength={300}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10,
                    border: `1px solid ${c.borderStrong}`, fontSize: 13,
                    fontFamily: "inherit", outline: "none", color: c.text, resize: "vertical"
                  }}
                />
              </div>

              {/* Improve */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: c.text, display: "block", marginBottom: 6 }}>
                  Qu'est-ce qu'il faudrait améliorer ?
                </label>
                <textarea
                  value={improve} onChange={e => setImprove(e.target.value)}
                  placeholder="Ce qui te manque, ce qui ne va pas..."
                  rows={2} maxLength={300}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 10,
                    border: `1px solid ${c.borderStrong}`, fontSize: 13,
                    fontFamily: "inherit", outline: "none", color: c.text, resize: "vertical"
                  }}
                />
              </div>

              <Button variant="brand" size="lg" fullWidth icon={Send} onClick={submit} disabled={rating === 0}>
                Envoyer mon avis
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════
// FEEDBACK BUTTON — Bouton flottant
// ══════════════════════════════════════════════════════════════════
const FeedbackButton = ({ onClick }) => {
  const isMobile = useMobile();
  return (
    <motion.button
      initial={{ scale: 0, x: -80 }}
      animate={{ scale: 1, x: 0 }}
      transition={{ ...spring, delay: 0.8 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        position: "fixed", bottom: 20, left: 16, zIndex: 200,
        background: c.surface, border: `1.5px solid ${c.borderStrong}`,
        padding: isMobile ? 0 : "10px 14px",
        width: isMobile ? 44 : "auto",
        height: isMobile ? 44 : "auto",
        borderRadius: 999,
        cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        fontSize: 12, fontWeight: 600, color: c.text,
        boxShadow: c.shadowLg
      }}
    >
      <MessageCircle size={isMobile ? 18 : 14} color={c.brand} strokeWidth={2.2} />
      {!isMobile && "Donner mon avis"}
    </motion.button>
  );
};

// ══════════════════════════════════════════════════════════════════
// ADMIN PANEL — Accessible avec ?admin=roolio2024
// ══════════════════════════════════════════════════════════════════
const AdminPanel = ({ onClose }) => {
  const [accounts, setAccounts] = useState({});
  const [feedback, setFeedback] = useState([]);
  const [tracking, setTracking] = useState({});

  useEffect(() => {
    try {
      setAccounts(JSON.parse(localStorage.getItem("roolio_accounts") || "{}"));
      setFeedback(JSON.parse(localStorage.getItem("roolio_feedback") || "[]"));
      setTracking(JSON.parse(localStorage.getItem("roolio_tracking") || "{}"));
    } catch {}
  }, []);

  const exportData = () => {
    const data = {
      accounts: Object.values(accounts).map(a => ({ ...a, password: "***" })),
      feedback,
      tracking,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roolio-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (!confirm("Effacer toutes les données locales ? (comptes, feedback, tracking)")) return;
    try {
      localStorage.removeItem("roolio_accounts");
      localStorage.removeItem("roolio_session");
      localStorage.removeItem("roolio_feedback");
      localStorage.removeItem("roolio_tracking");
    } catch {}
    window.location.reload();
  };

  const accountsList = Object.values(accounts);
  const sortedTracking = Object.entries(tracking)
    .filter(([k]) => !k.startsWith("_"))
    .sort((a, b) => b[1] - a[1]);

  return (
    <div style={{
      minHeight: "100vh", background: c.bg,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: "20px 16px"
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; } body { margin: 0; }`}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
          <div>
            <Badge tone="danger" icon={Lock}>Mode admin</Badge>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 0", letterSpacing: -0.6 }}>Tableau de bord Roolio</h1>
            <p style={{ fontSize: 12, color: c.textSoft, margin: "4px 0 0" }}>
              Données locales · Snapshot du {new Date().toLocaleString("fr-FR")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" size="sm" icon={Upload} onClick={exportData}>Exporter</Button>
            <Button variant="danger" size="sm" onClick={clearAll}>Réinitialiser</Button>
            <Button variant="primary" size="sm" icon={X} onClick={onClose}>Fermer</Button>
          </div>
        </div>

        {/* Stats globales */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 22 }}>
          {[
            { l: "Utilisateurs", v: accountsList.length, Icon: User, color: c.brand },
            { l: "Vérifiés", v: accountsList.filter(a => a.verified).length, Icon: CheckCircle2, color: c.success },
            { l: "Avis collectés", v: feedback.length, Icon: MessageCircle, color: c.warning },
            { l: "Avec parrain", v: accountsList.filter(a => a.referredBy).length, Icon: Share2, color: c.premium }
          ].map((s, i) => (
            <Card key={i}>
              <div style={{ padding: 16 }}>
                <s.Icon size={18} color={s.color} strokeWidth={2.2} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 11, color: c.textSoft, marginBottom: 2 }}>{s.l}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: c.text, letterSpacing: -0.5 }}>{s.v}</div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))", gap: 14 }}>
          {/* Comptes */}
          <Card>
            <div style={{ padding: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Comptes inscrits</h2>
              {accountsList.length === 0 ? (
                <div style={{ fontSize: 13, color: c.textMute, textAlign: "center", padding: 20 }}>Aucun compte pour l'instant</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 400, overflow: "auto" }}>
                  {accountsList.map((a, i) => (
                    <div key={i} style={{ background: c.bgAlt, padding: 10, borderRadius: 8, fontSize: 12 }}>
                      <div style={{ fontWeight: 700, color: c.text, marginBottom: 2 }}>{a.name}</div>
                      <div style={{ color: c.textSoft, fontSize: 11 }}>{a.email}</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                        {a.verified ? <Badge tone="success" size="xs">Vérifié</Badge> : <Badge tone="warning" size="xs">Non vérifié</Badge>}
                        {a.referralCode && <Badge tone="neutral" size="xs">{a.referralCode}</Badge>}
                        {a.referredBy && <Badge tone="brand" size="xs">Parrainé</Badge>}
                        {a.isDemo && <Badge tone="neutral" size="xs">Démo</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Feedback */}
          <Card>
            <div style={{ padding: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Avis testeurs</h2>
              {feedback.length === 0 ? (
                <div style={{ fontSize: 13, color: c.textMute, textAlign: "center", padding: 20 }}>Aucun avis pour l'instant</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflow: "auto" }}>
                  {feedback.slice().reverse().map((f, i) => (
                    <div key={i} style={{ background: c.bgAlt, padding: 12, borderRadius: 8 }}>
                      <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={13} color={c.gold} fill={n <= f.rating ? c.gold : "transparent"} strokeWidth={2} />
                        ))}
                      </div>
                      {f.liked && <div style={{ fontSize: 12, color: c.text, marginBottom: 4 }}><strong>+ </strong>{f.liked}</div>}
                      {f.improve && <div style={{ fontSize: 12, color: c.text, marginBottom: 4 }}><strong>− </strong>{f.improve}</div>}
                      <div style={{ fontSize: 10, color: c.textMute, marginTop: 4 }}>
                        {new Date(f.date).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Tracking */}
          <Card>
            <div style={{ padding: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Actions tracées</h2>
              {sortedTracking.length === 0 ? (
                <div style={{ fontSize: 13, color: c.textMute, textAlign: "center", padding: 20 }}>Aucune action tracée</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflow: "auto" }}>
                  {sortedTracking.map(([action, count], i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 11px", background: c.bgAlt, borderRadius: 8, fontSize: 12
                    }}>
                      <span style={{ color: c.text, fontWeight: 500 }}>{action}</span>
                      <Badge tone="brand" size="sm">{count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [stripeSuccess, setStripeSuccess] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  // Détecte mode admin
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "roolio2024") {
        setAdminMode(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2400);
    return () => clearTimeout(t);
  }, []);

  // Détecte un retour de paiement Stripe
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("stripe_success") === "true" || params.get("session_id")) {
        setStripeSuccess(true);
        // Nettoie l'URL
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch {}
  }, []);
  const [accounts, setAccounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("roolio_accounts") || "{}"); }
    catch { return {}; }
  });
  const [authedUser, setAuthedUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("roolio_session") || "null"); }
    catch { return null; }
  });

  useEffect(() => {
    try { localStorage.setItem("roolio_accounts", JSON.stringify(accounts)); } catch {}
  }, [accounts]);

  useEffect(() => {
    try {
      if (authedUser) localStorage.setItem("roolio_session", JSON.stringify(authedUser));
      else localStorage.removeItem("roolio_session");
    } catch {}
  }, [authedUser]);

  const [tab, setTab] = useState("home");
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState({
    dealerName: "Garage Hypnose",
    bio: "Chasseur de bonnes affaires à Lyon.",
    avatar: "M",
    theme: "blue",
    plan: "free",
    seasonPassPremium: false,
    level: 12,
    xp: 2340,
    points: 5420,
    streak: 14,
    missions: initialMissions
  });

  const updateUser = (updates) => setUser(u => ({ ...u, ...updates }));

  const [showDaily, setShowDaily] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [spheraOpen, setSpheraOpen] = useState(false);
  const [spheraPrompt, setSpheraPrompt] = useState(null);
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState({ open: false, trigger: null });
  const [pressure, setPressure] = useState(null);
  const [actionCount, setActionCount] = useState(0);
  const [showWheel, setShowWheel] = useState(false);
  const [flashEvent, setFlashEvent] = useState(null);
  const [flashSeconds, setFlashSeconds] = useState(0);
  const [socialEvent, setSocialEvent] = useState(null);
  const isMobile = useMobile();

  // Flash event aléatoire toutes les 3 minutes (durée 2 min)
  useEffect(() => {
    const trigger = () => {
      const ev = flashEvents[Math.floor(Math.random() * flashEvents.length)];
      setFlashEvent(ev);
      setFlashSeconds(120);
    };
    const timer = setTimeout(trigger, 8000); // premier event après 8s
    const interval = setInterval(trigger, 180000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  // Décrémente le timer flash event
  useEffect(() => {
    if (!flashEvent) return;
    if (flashSeconds <= 0) { setFlashEvent(null); return; }
    const t = setTimeout(() => setFlashSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [flashEvent, flashSeconds]);

  // Social toasts récurrents (toutes les 25s, après 15s d'attente initiale)
  useEffect(() => {
    const trigger = () => {
      const ev = socialEvents[Math.floor(Math.random() * socialEvents.length)];
      setSocialEvent(ev);
      setTimeout(() => setSocialEvent(null), 5000);
    };
    const initial = setTimeout(trigger, 15000);
    const interval = setInterval(trigger, 25000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowDaily(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Pressure popup contextuel pour les free
  useEffect(() => {
    if (user.plan === "free" && actionCount > 0 && actionCount % 5 === 0) {
      const pressures = [
        { icon: AlertTriangle, title: "Karim vient de vous dépasser", desc: "Il a gagné 340 pts aujourd'hui. Passez Player pour gagner ×1.", cta: "Voir Player" },
        { icon: Trophy, title: "Concours Porsche dans 3j", desc: "Réservé aux membres Elite. Rejoignez-les.", cta: "Voir Elite" },
        { icon: Flame, title: "Série de 14 jours en danger", desc: "Perdez votre série demain si vous ne gagnez pas de points.", cta: "Maintenir série" }
      ];
      const random = pressures[Math.floor(Math.random() * pressures.length)];
      setPressure(random);
    }
  }, [actionCount, user.plan]);

  // Track navigation
  useEffect(() => {
    if (authedUser && tab) trackEvent(`view_${tab}`);
  }, [tab, authedUser]);

  const triggerGain = (data) => {
    setToast(data);
    setTimeout(() => setToast(null), 2400);
    setActionCount(a => a + 1);
  };

  const triggerUpgrade = (trigger) => {
    setUpgradeModal({ open: true, trigger });
  };

  const handleUpgrade = (plan) => {
    updateUser({ plan });
    triggerGain({ text: `Pass ${PASS_PLANS[plan].name} activé`, icon: Crown });
  };

  const openSphera = (prompt = null) => {
    setSpheraPrompt(prompt);
    setSpheraOpen(true);
  };

  const tabs = [
    { k: "home", l: "Accueil", icon: Home },
    { k: "marketplace", l: "Marketplace", icon: Store },
    { k: "dealership", l: "Concession", icon: Trophy },
    { k: "contests", l: "Concours", icon: PartyPopper },
    { k: "subscriptions", l: "Abonnements", icon: Crown }
  ];

  // GUARD : mode admin
  if (adminMode) {
    return <AdminPanel onClose={() => {
      setAdminMode(false);
      window.history.replaceState({}, "", window.location.pathname);
    }} />;
  }

  // GUARD : si pas connecté → écran d'inscription
  if (!authedUser) {
    return (
      <>
        <AnimatePresence>
          {showSplash && <SplashScreen key="splash" />}
        </AnimatePresence>
        <AuthScreen
          accounts={accounts}
          setAccounts={setAccounts}
          onAuth={(acc) => {
            setAuthedUser(acc);
            updateUser({ dealerName: acc.name, avatar: acc.name[0]?.toUpperCase() || "U" });
          }}
        />
      </>
    );
  }

  // GUARD : si email pas vérifié → écran de vérification
  if (!authedUser.verified) {
    return (
      <div style={{
        minHeight: "100vh", background: c.bg,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; } body { margin: 0; }`}</style>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}
          style={{
            background: c.surface, borderRadius: 20, padding: 32,
            maxWidth: 420, width: "100%", boxShadow: c.shadowXl,
            border: `1px solid ${c.border}`, textAlign: "center"
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: "0 auto 18px",
            background: c.warningSoft, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Bell size={30} color={c.warning} strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.4, color: c.text }}>
            Vérifiez votre email
          </h1>
          <p style={{ fontSize: 13, color: c.textSoft, margin: "0 0 4px", lineHeight: 1.5 }}>
            Un lien de validation a été envoyé à
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: c.text, margin: "0 0 22px" }}>
            {authedUser.email}
          </p>
          <Button variant="brand" size="lg" fullWidth icon={CheckCircle2} onClick={() => {
            const updated = { ...authedUser, verified: true };
            setAccounts({ ...accounts, [authedUser.email]: updated });
            setAuthedUser(updated);
          }}>
            Valider mon email (simulation)
          </Button>
          <button onClick={() => setAuthedUser(null)} style={{
            background: "transparent", border: "none", marginTop: 14,
            fontSize: 12, color: c.textSoft, cursor: "pointer", fontFamily: "inherit"
          }}>
            Se déconnecter
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>
      <div style={{
        minHeight: "100vh", background: c.bg,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: c.text, WebkitFontSmoothing: "antialiased"
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          body { margin: 0; }
          @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${c.borderStrong}; border-radius: 999px; }
        `}</style>

        <div style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(250,251,252,0.9)",
          borderBottom: `1px solid ${c.border}`,
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)"
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "11px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div onClick={() => setTab("home")} style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
              <RoolioLogo height={28} color={c.text} accent={c.brand} />
            </div>

            {!isMobile ? (
              <div style={{ display: "flex", gap: 2, flex: 1, minWidth: 0, marginLeft: 6 }}>
                {tabs.map(t => (
                  <button key={t.k} onClick={() => setTab(t.k)}
                    style={{ background: tab === t.k ? c.text : "transparent", color: tab === t.k ? "#fff" : c.textSoft, border: "none", padding: "8px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
                    onMouseEnter={e => { if (tab !== t.k) { e.currentTarget.style.background = c.bgAlt; e.currentTarget.style.color = c.text; } }}
                    onMouseLeave={e => { if (tab !== t.k) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = c.textSoft; } }}>
                    <t.icon size={13} strokeWidth={2.2} />
                    {t.l}
                  </button>
                ))}
              </div>
            ) : <div style={{ flex: 1 }} />}

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {user.plan === "free" && !isMobile && (
                <Button variant="gold" size="sm" icon={Rocket} onClick={() => triggerUpgrade("earn_points")}>
                  Activer Pass
                </Button>
              )}
              {user.plan === "free" && isMobile && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => triggerUpgrade("earn_points")}
                  style={{ background: `linear-gradient(135deg, ${c.gold} 0%, #B8860B 100%)`, border: "none", width: 32, height: 32, borderRadius: 8, color: "#fff", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Rocket size={14} strokeWidth={2.5} />
                </motion.button>
              )}
              {!isMobile && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowWheel(true)}
                  style={{ background: `linear-gradient(135deg, ${c.gold} 0%, #B8860B 100%)`, border: "none", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, position: "relative" }}>
                  <Gift size={13} strokeWidth={2.5} />
                  Roue
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.8, repeat: Infinity }}
                    style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: c.danger }} />
                </motion.button>
              )}
              {!isMobile && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowDaily(true)}
                  style={{ background: c.warningSoft, border: `1px solid ${c.warning}40`, padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: c.warning, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
                  <Flame size={13} strokeWidth={2.5} fill={c.warning} />
                  {user.streak}j
                </motion.button>
              )}
              <div onClick={() => setTab("profile")} style={{ display: "flex", alignItems: "center", gap: 7, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 10, padding: isMobile ? "3px 8px 3px 8px" : "3px 3px 3px 10px", boxShadow: c.shadow, cursor: "pointer" }}>
                {!isMobile && (
                  <div style={{ textAlign: "right" }}>
                    <motion.div key={user.points} initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={springSoft}
                      style={{ fontSize: 11, fontWeight: 700, color: c.brand }}>{user.points.toLocaleString("fr-FR")} pts</motion.div>
                    <div style={{ fontSize: 9, color: c.textMute, fontWeight: 500 }}>Nv.{user.level}</div>
                  </div>
                )}
                {isMobile && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.brand, paddingRight: 4 }}>
                    {user.points >= 1000 ? `${(user.points/1000).toFixed(1)}k` : user.points}
                  </div>
                )}
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${c.brand} 0%, ${c.brandDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, position: "relative" }}>
                  {user.avatar || user.dealerName[0]?.toUpperCase()}
                  {user.plan === "elite" && (
                    <div style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: c.premium, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Crown size={6} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
              {!isMobile && (
                <button onClick={() => setAuthedUser(null)} title="Déconnexion"
                  style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: c.bgAlt, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LogOut size={15} color={c.textSoft} strokeWidth={2.2} />
                </button>
              )}
              {isMobile && (
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: mobileMenuOpen ? c.text : c.bgAlt, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {mobileMenuOpen ? <X size={17} color="#fff" strokeWidth={2.2} /> : <Menu size={17} color={c.text} strokeWidth={2.2} />}
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isMobile && mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden", borderTop: `1px solid ${c.border}` }}>
                <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                  {tabs.map(t => (
                    <button key={t.k} onClick={() => { setTab(t.k); setMobileMenuOpen(false); }}
                      style={{ background: tab === t.k ? c.text : "transparent", color: tab === t.k ? "#fff" : c.text, border: "none", padding: "11px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 9, textAlign: "left" }}>
                      <t.icon size={15} strokeWidth={2.2} />
                      {t.l}
                    </button>
                  ))}
                  <div style={{ borderTop: `1px solid ${c.border}`, marginTop: 4, paddingTop: 4 }}>
                    <button onClick={() => { setShowWheel(true); setMobileMenuOpen(false); }}
                      style={{ width: "100%", background: "transparent", color: c.gold, border: "none", padding: "11px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 9, textAlign: "left" }}>
                      <Gift size={15} strokeWidth={2.2} />
                      Roue de la chance
                    </button>
                    <button onClick={() => { setShowDaily(true); setMobileMenuOpen(false); }}
                      style={{ width: "100%", background: "transparent", color: c.warning, border: "none", padding: "11px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 9, textAlign: "left" }}>
                      <Flame size={15} strokeWidth={2.2} fill={c.warning} />
                      Récompense quotidienne ({user.streak}j)
                    </button>
                  </div>
                  <button onClick={() => { setAuthedUser(null); setMobileMenuOpen(false); }}
                    style={{ background: "transparent", color: c.danger, border: "none", padding: "11px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 9, textAlign: "left", borderTop: `1px solid ${c.border}`, marginTop: 4, paddingTop: 12 }}>
                    <LogOut size={15} strokeWidth={2.2} />
                    Se déconnecter
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {flashEvent && (
              <FlashEventBar event={flashEvent} secondsLeft={flashSeconds} onClick={() => triggerGain({ text: `${flashEvent.label} · ${flashEvent.desc}` })} />
            )}
          </AnimatePresence>
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "18px 14px 80px" : "28px 20px 80px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease }}>
              {tab === "home" && <HomePage onGo={setTab} onOpen={setModal} onOpenSphera={() => openSphera()} onTriggerUpgrade={triggerUpgrade} />}
              {tab === "marketplace" && <Marketplace onOpen={setModal} onGo={setTab} onTriggerUpgrade={triggerUpgrade} />}
              {tab === "sell" && <SellPage onGo={setTab} onSuccess={() => {
                triggerGain({ text: "Annonce publiée · +150 XP · +100 pts" });
                updateUser({ xp: user.xp + 150, points: user.points + 100 });
                setTab("marketplace");
              }} />}
              {tab === "dealership" && <Dealership onGo={setTab} triggerGain={triggerGain} onShowSettings={() => setShowSettings(true)} onTriggerUpgrade={triggerUpgrade} />}
              {tab === "season" && <SeasonPass onTriggerUpgrade={triggerUpgrade} />}
              {tab === "packs" && <PointPacks triggerGain={triggerGain} />}
              {tab === "contests" && <Contests triggerGain={triggerGain} onTriggerUpgrade={triggerUpgrade} />}
              {tab === "shop" && <Shop triggerGain={triggerGain} onGo={setTab} />}
              {tab === "subscriptions" && <SubscriptionsPage onTriggerUpgrade={triggerUpgrade} />}
              {tab === "profile" && <ProfilePage authedUser={authedUser} onLogout={() => setAuthedUser(null)} onShowSettings={() => setShowSettings(true)} />}
              {tab === "faq" && <FAQPage />}
              {tab === "about" && <AboutPage />}
              {tab === "contact" && <ContactPage />}
              {tab === "cgu" && <LegalPage section="cgu" />}
              {tab === "privacy" && <LegalPage section="privacy" />}
              {tab === "legal" && <LegalPage section="legal" />}
              {tab === "contest_rules" && <LegalPage section="contest" />}
            </motion.div>
          </AnimatePresence>
          <Footer onGo={setTab} />
        </div>

        <ListingModal item={modal} onClose={() => setModal(null)} onAskSphera={openSphera} />
        {showDaily && <DailyReward day={user.streak} onClose={() => setShowDaily(false)} onClaim={(amount) => updateUser({ points: user.points + amount })} />}
        {showSettings && <ProfileSettings onClose={() => setShowSettings(false)} onTriggerUpgrade={triggerUpgrade} />}
        <SpheraChat open={spheraOpen} onClose={() => { setSpheraOpen(false); setSpheraPrompt(null); }} onOpenListing={setModal} initialPrompt={spheraPrompt} />
        <SpheraFloatingButton onClick={() => openSphera()} />
        <FeedbackButton onClick={() => setShowFeedback(true)} />
        <FeedbackModal open={showFeedback} onClose={() => setShowFeedback(false)} />
        <UpgradeModal open={upgradeModal.open} trigger={upgradeModal.trigger} onClose={() => setUpgradeModal({ open: false, trigger: null })} onUpgrade={handleUpgrade} />
        <PressurePopup data={pressure} onClose={() => setPressure(null)} onUpgrade={() => triggerUpgrade("rank")} />
        {showWheel && (
          <SpinWheel
            onClose={() => setShowWheel(false)}
            onWin={(points, isTicket) => {
              if (isTicket) triggerGain({ text: "+1 ticket concours", icon: Ticket });
              else if (points > 0) updateUser({ points: user.points + points });
            }}
          />
        )}
        <SocialToast event={socialEvent} onClose={() => setSocialEvent(null)} />
        <ThankYouModal open={stripeSuccess} onClose={() => setStripeSuccess(false)} />
        <Toast show={!!toast} icon={toast?.icon || Zap}>
          {toast?.text || (toast ? `+${toast.xp} XP · +${toast.points} pts` : "")}
        </Toast>
      </div>
    </UserContext.Provider>
  );
}

// Note: SellPage importé du précédent
function SellPage({ onGo, onSuccess }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ plate: "", km: "", price: "", city: "", photos: 0 });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <button onClick={() => onGo("marketplace")} style={{ background: "transparent", border: "none", fontSize: 13, color: c.textSoft, display: "flex", alignItems: "center", gap: 5, cursor: "pointer", padding: 0, fontFamily: "inherit", marginBottom: 8 }}>
          ← Retour
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.6 }}>Déposer une annonce</h1>
        <p style={{ fontSize: 13, color: c.textSoft, margin: "5px 0 0" }}>3 minutes, Sphera remplit la majorité.</p>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
        {[1, 2, 3, 4].map(s => <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? c.brand : c.bgAlt }} />)}
      </div>
      <Card>
        <div style={{ padding: 26 }}>
          {step === 1 && (
            <>
              <Badge tone="brand" size="sm">Étape 1</Badge>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "10px 0 5px" }}>Identification</h2>
              <p style={{ fontSize: 13, color: c.textSoft, margin: "0 0 22px" }}>Saisissez la plaque, Sphera récupère tout.</p>
              <input value={data.plate} onChange={e => setData({...data, plate: e.target.value.toUpperCase()})} placeholder="AA-123-BB"
                style={{ width: "100%", padding: "13px 14px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 15, fontWeight: 600, fontFamily: "inherit", outline: "none", textAlign: "center", letterSpacing: 2, color: c.text, marginBottom: 20 }} />
              <Button variant="brand" size="lg" fullWidth icon={ArrowRight} iconRight onClick={() => setStep(2)} disabled={!data.plate}>Continuer</Button>
            </>
          )}
          {step === 2 && (
            <>
              <Badge tone="brand" size="sm">Étape 2</Badge>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "10px 0 5px" }}>Photos</h2>
              <p style={{ fontSize: 13, color: c.textSoft, margin: "0 0 22px" }}>Au moins 5 photos.</p>
              <div onClick={() => setData({...data, photos: Math.min(data.photos + 1, 8)})}
                style={{ border: `2px dashed ${c.borderStrong}`, borderRadius: 12, padding: 36, textAlign: "center", background: c.bgAlt, cursor: "pointer" }}>
                <Upload size={28} color={c.textMute} strokeWidth={1.8} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 3 }}>Cliquez pour ajouter</div>
                <div style={{ fontSize: 12, color: c.textSoft }}>{data.photos} photo{data.photos > 1 ? "s" : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
                <Button variant="ghost" onClick={() => setStep(1)}>Retour</Button>
                <Button variant="brand" icon={ArrowRight} iconRight fullWidth onClick={() => setStep(3)} disabled={data.photos < 1}>Continuer</Button>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <Badge tone="brand" size="sm">Étape 3</Badge>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "10px 0 5px" }}>Détails</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <input value={data.km} onChange={e => setData({...data, km: e.target.value.replace(/\D/g, "")})} placeholder="Km"
                  style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 14, fontFamily: "inherit", outline: "none", color: c.text }} />
                <input value={data.price} onChange={e => setData({...data, price: e.target.value.replace(/\D/g, "")})} placeholder="Prix €"
                  style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 14, fontFamily: "inherit", outline: "none", color: c.text }} />
              </div>
              <input value={data.city} onChange={e => setData({...data, city: e.target.value})} placeholder="Ville"
                style={{ width: "100%", padding: "11px 13px", borderRadius: 10, border: `1px solid ${c.borderStrong}`, fontSize: 14, fontFamily: "inherit", outline: "none", color: c.text, marginBottom: 20 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="ghost" onClick={() => setStep(2)}>Retour</Button>
                <Button variant="brand" icon={ArrowRight} iconRight fullWidth onClick={() => setStep(4)} disabled={!data.km || !data.price || !data.city}>Continuer</Button>
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <Badge tone="success" size="sm" icon={Sparkles}>Prêt</Badge>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: "10px 0 5px" }}>Publier</h2>
              <div style={{ background: c.bgAlt, padding: 16, borderRadius: 12, marginBottom: 18 }}>
                <div style={{ fontSize: 13, color: c.text, lineHeight: 1.55 }}>Véhicule en excellent état, carnet à jour, non fumeur.</div>
              </div>
              <div style={{ background: c.brandSoft, padding: 12, borderRadius: 10, marginBottom: 20, display: "flex", gap: 8 }}>
                <Zap size={16} color={c.brand} strokeWidth={2.2} />
                <div style={{ fontSize: 12, color: c.text }}><strong>+150 XP · +100 points</strong></div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="ghost" onClick={() => setStep(3)}>Retour</Button>
                <Button variant="success" icon={CheckCircle2} fullWidth onClick={onSuccess}>Publier</Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
