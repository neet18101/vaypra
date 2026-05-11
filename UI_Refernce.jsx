import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Icons (Lucide) ───
import {
    LayoutDashboard, FileText, ShoppingCart, Package, Users, BarChart3,
    Settings, Bell, Search, Plus, ChevronDown, ChevronRight, ArrowUpRight,
    ArrowDownRight, IndianRupee, TrendingUp, Store, CreditCard, Truck,
    Receipt, PieChart, Calendar, Download, Filter, MoreHorizontal,
    Moon, Sun, Menu, X, LogOut, User, Building2, Globe, Heart,
    Star, ShoppingBag, Boxes, ClipboardList, Wallet, BanknoteIcon,
    CircleDollarSign, FileBarChart, Brain, Sparkles, Target, Award,
    GitBranch, MapPin, Phone, Mail, Edit, Trash2, Eye, Check,
    AlertCircle, Clock, Zap, Layers, Shield, Database, BarChart,
    Activity, RefreshCw, Send, MessageSquare, Gift, Percent, Tag,
    Bookmark, Archive, Copy, ExternalLink, Home, ChevronLeft,
    ReceiptText, BadgeIndianRupee, Landmark, HandCoins, WalletCards
} from "lucide-react";

// ─── Theme & Design Tokens ───
const theme = {
    colors: {
        primary: "#6C5CE7",
        primaryLight: "#A29BFE",
        primaryDark: "#5A4BD1",
        secondary: "#00CEC9",
        accent: "#FD79A8",
        success: "#00B894",
        warning: "#FDCB6E",
        danger: "#E17055",
        dark: "#2D3436",
        darkAlt: "#1E272E",
        gray: {
            50: "#F8F9FE",
            100: "#F1F2F8",
            200: "#E2E4F0",
            300: "#C4C7DB",
            400: "#9699B0",
            500: "#6C6F87",
            600: "#4A4D64",
            700: "#353849",
            800: "#252836",
            900: "#1A1C2E",
        }
    },
    fonts: {
        display: "'DM Sans', sans-serif",
        body: "'Plus Jakarta Sans', sans-serif",
        mono: "'JetBrains Mono', monospace",
    }
};

// ─── Sample Data ───
const dashboardStats = [
    { label: "Total Revenue", value: "₹12,45,890", change: "+12.5%", up: true, icon: IndianRupee, color: "#6C5CE7" },
    { label: "Total Orders", value: "1,847", change: "+8.3%", up: true, icon: ShoppingCart, color: "#00CEC9" },
    { label: "Products Sold", value: "3,429", change: "+15.7%", up: true, icon: Package, color: "#FD79A8" },
    { label: "Active Customers", value: "892", change: "-2.1%", up: false, icon: Users, color: "#FDCB6E" },
];

const recentTransactions = [
    { id: "INV-2024-001", customer: "Rajesh Electronics", amount: "₹24,500", status: "paid", date: "Today", type: "sale" },
    { id: "INV-2024-002", customer: "Sharma General Store", amount: "₹8,750", status: "pending", date: "Today", type: "sale" },
    { id: "PUR-2024-015", customer: "ABC Wholesalers", amount: "₹1,25,000", status: "paid", date: "Yesterday", type: "purchase" },
    { id: "INV-2024-003", customer: "Patel Traders", amount: "₹15,200", status: "overdue", date: "2 days ago", type: "sale" },
    { id: "INV-2024-004", customer: "City Mart", amount: "₹42,300", status: "paid", date: "3 days ago", type: "sale" },
    { id: "PUR-2024-016", customer: "Metro Supplies", amount: "₹67,800", status: "pending", date: "3 days ago", type: "purchase" },
];

const products = [
    { name: "Samsung Galaxy M14", sku: "SAM-M14", stock: 45, price: "₹12,999", category: "Mobile", status: "in-stock" },
    { name: "JBL Flip 6 Speaker", sku: "JBL-F6", stock: 12, price: "₹9,999", category: "Audio", status: "low-stock" },
    { name: "HP DeskJet 2820", sku: "HP-DJ28", stock: 0, price: "₹4,499", category: "Printer", status: "out-of-stock" },
    { name: "Boat Rockerz 450", sku: "BOT-R450", stock: 89, price: "₹1,499", category: "Audio", status: "in-stock" },
    { name: "Canon PIXMA G3000", sku: "CAN-PX3", stock: 8, price: "₹12,500", category: "Printer", status: "low-stock" },
    { name: "Realme Narzo 60x", sku: "RLM-N60", stock: 34, price: "₹8,999", category: "Mobile", status: "in-stock" },
];

const customers = [
    { name: "Rajesh Electronics", phone: "+91 98765 43210", email: "rajesh@electronics.in", balance: "₹24,500", loyalty: "Gold", orders: 47 },
    { name: "Sharma General Store", phone: "+91 87654 32109", email: "sharma@store.in", balance: "₹8,750", loyalty: "Silver", orders: 23 },
    { name: "Patel Traders", phone: "+91 76543 21098", email: "patel@traders.in", balance: "₹15,200", loyalty: "Gold", orders: 65 },
    { name: "City Mart", phone: "+91 65432 10987", email: "info@citymart.in", balance: "₹0", loyalty: "Platinum", orders: 112 },
    { name: "Metro Supplies", phone: "+91 54321 09876", email: "metro@supplies.in", balance: "₹67,800", loyalty: "Bronze", orders: 15 },
];

const installmentData = [
    { customer: "Rajesh Electronics", total: "₹1,20,000", paid: "₹80,000", remaining: "₹40,000", nextDue: "May 15, 2026", emis: 6, paidEmis: 4, status: "on-track" },
    { customer: "Patel Traders", total: "₹2,50,000", paid: "₹50,000", remaining: "₹2,00,000", nextDue: "May 20, 2026", emis: 10, paidEmis: 2, status: "on-track" },
    { customer: "Sharma General Store", total: "₹45,000", paid: "₹30,000", remaining: "₹15,000", nextDue: "May 10, 2026", emis: 3, paidEmis: 2, status: "overdue" },
    { customer: "Metro Supplies", total: "₹3,00,000", paid: "₹75,000", remaining: "₹2,25,000", nextDue: "Jun 01, 2026", emis: 12, paidEmis: 3, status: "on-track" },
];

const branches = [
    { name: "Main Branch - Delhi", manager: "Amit Kumar", revenue: "₹8,45,000", orders: 892, status: "active" },
    { name: "Mumbai Outlet", manager: "Priya Singh", revenue: "₹6,23,000", orders: 654, status: "active" },
    { name: "Bangalore Store", manager: "Ravi Reddy", revenue: "₹4,12,000", orders: 423, status: "active" },
    { name: "Kolkata Branch", manager: "Suman Das", revenue: "₹2,87,000", orders: 298, status: "maintenance" },
];

const aiInsights = [
    { type: "revenue", title: "Revenue Prediction", desc: "Expected 18% growth next month based on seasonal trends and current order pipeline.", icon: TrendingUp, color: "#6C5CE7" },
    { type: "stock", title: "Stock Alert", desc: "JBL Flip 6 and Canon PIXMA G3000 will run out in ~5 days. Reorder recommended.", icon: AlertCircle, color: "#E17055" },
    { type: "customer", title: "Churn Risk", desc: "3 Gold customers haven't ordered in 30+ days. Send re-engagement offers.", icon: Users, color: "#FDCB6E" },
    { type: "pricing", title: "Price Optimization", desc: "Boat Rockerz 450 can be priced ₹200 higher based on market demand analysis.", icon: Target, color: "#00CEC9" },
];

// ─── Mini Chart Component ───
const MiniChart = ({ data, color, height = 40 }) => {
    const points = data || [30, 45, 35, 55, 40, 60, 50, 70, 55, 75, 65, 80];
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const w = 120;
    const h = height;
    const path = points.map((p, i) => {
        const x = (i / (points.length - 1)) * w;
        const y = h - ((p - min) / range) * h;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    const areaPath = path + ` L ${w} ${h} L 0 ${h} Z`;

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#grad-${color.replace('#', '')})`} />
            <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

// ─── Revenue Bar Chart ───
const RevenueChart = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const values = [45, 62, 58, 73, 68, 82, 79, 91, 85, 95, 88, 100];
    const max = Math.max(...values);

    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, padding: "0 8px" }}>
            {months.map((m, i) => (
                <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(values[i] / max) * 130}px` }}
                        transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                        style={{
                            width: "100%",
                            borderRadius: 6,
                            background: i === 11 ? "linear-gradient(180deg, #6C5CE7, #A29BFE)" : "linear-gradient(180deg, #E2E4F0, #F1F2F8)",
                            minHeight: 4,
                        }}
                    />
                    <span style={{ fontSize: 10, color: "#9699B0", fontWeight: 500 }}>{m}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Donut Chart ───
const DonutChart = ({ segments }) => {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let cumulative = 0;
    const size = 120;
    const stroke = 20;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {segments.map((seg, i) => {
                    const pct = seg.value / total;
                    const offset = (cumulative / total) * circumference;
                    cumulative += seg.value;
                    return (
                        <circle
                            key={i}
                            cx={size / 2} cy={size / 2} r={radius}
                            fill="none" stroke={seg.color} strokeWidth={stroke}
                            strokeDasharray={`${pct * circumference} ${circumference}`}
                            strokeDashoffset={-offset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                    );
                })}
                <text x="50%" y="50%" textAnchor="middle" dy=".3em" style={{ fontSize: 14, fontWeight: 700, fill: "#2D3436" }}>
                    {total}
                </text>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {segments.map((seg, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: seg.color }} />
                        <span style={{ color: "#6C6F87" }}>{seg.label}</span>
                        <span style={{ fontWeight: 600, color: "#2D3436", marginLeft: "auto" }}>{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Status Badge ───
const StatusBadge = ({ status }) => {
    const config = {
        "paid": { bg: "#E8F8F0", color: "#00B894", label: "Paid" },
        "pending": { bg: "#FEF5E7", color: "#F39C12", label: "Pending" },
        "overdue": { bg: "#FDECEA", color: "#E17055", label: "Overdue" },
        "in-stock": { bg: "#E8F8F0", color: "#00B894", label: "In Stock" },
        "low-stock": { bg: "#FEF5E7", color: "#F39C12", label: "Low Stock" },
        "out-of-stock": { bg: "#FDECEA", color: "#E17055", label: "Out of Stock" },
        "active": { bg: "#E8F8F0", color: "#00B894", label: "Active" },
        "maintenance": { bg: "#FEF5E7", color: "#F39C12", label: "Maintenance" },
        "on-track": { bg: "#E8F8F0", color: "#00B894", label: "On Track" },
        "Gold": { bg: "#FFF8E1", color: "#F39C12", label: "Gold" },
        "Silver": { bg: "#F1F2F8", color: "#6C6F87", label: "Silver" },
        "Platinum": { bg: "#EDE7F6", color: "#6C5CE7", label: "Platinum" },
        "Bronze": { bg: "#FBE9E7", color: "#E17055", label: "Bronze" },
    };
    const c = config[status] || { bg: "#F1F2F8", color: "#6C6F87", label: status };
    return (
        <span style={{
            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: c.bg, color: c.color, whiteSpace: "nowrap",
        }}>
            {c.label}
        </span>
    );
};

// ─── Sidebar Navigation ───
const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "invoices", label: "Invoices & Billing", icon: FileText },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "customers", label: "Customers & CRM", icon: Users },
    { id: "installments", label: "Installment Reports", icon: WalletCards },
    { id: "ecommerce", label: "Online Store", icon: Globe },
    { id: "branches", label: "Multi-Branch", icon: GitBranch },
    { id: "ai-insights", label: "AI Insights", icon: Brain },
    { id: "reports", label: "Reports & GST", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
];

// ─── Main App ───
export default function VyaparPro() {
    const [activePage, setActivePage] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showNotif, setShowNotif] = useState(false);

    const pageVariants = {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: -12, transition: { duration: 0.15 } }
    };

    return (
        <div style={{
            fontFamily: theme.fonts.body,
            display: "flex",
            height: "100vh",
            background: "#F4F5FB",
            color: theme.colors.dark,
            overflow: "hidden",
        }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

            {/* ─── Sidebar ─── */}
            <motion.aside
                animate={{ width: sidebarOpen ? 260 : 72 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                    background: "linear-gradient(195deg, #1A1C2E 0%, #252836 100%)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    flexShrink: 0,
                    position: "relative",
                }}
            >
                {/* Logo */}
                <div style={{
                    padding: sidebarOpen ? "24px 20px" : "24px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <Zap size={20} color="#fff" />
                    </div>
                    {sidebarOpen && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: theme.fonts.display, letterSpacing: "-0.02em" }}>
                                BizFlow<span style={{ color: "#A29BFE" }}>Pro</span>
                            </div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                                Business Suite
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Nav Items */}
                <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePage === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActivePage(item.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: sidebarOpen ? "11px 14px" : "11px 0",
                                    justifyContent: sidebarOpen ? "flex-start" : "center",
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    background: isActive ? "linear-gradient(135deg, rgba(108,92,231,0.2), rgba(108,92,231,0.08))" : "transparent",
                                    color: isActive ? "#A29BFE" : "rgba(255,255,255,0.5)",
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: 13.5,
                                    fontFamily: theme.fonts.body,
                                    transition: "all 0.2s",
                                    position: "relative",
                                }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            width: 3,
                                            height: 20,
                                            borderRadius: 4,
                                            background: "#6C5CE7",
                                        }}
                                    />
                                )}
                                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                                {sidebarOpen && <span>{item.label}</span>}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* User */}
                <div style={{
                    padding: sidebarOpen ? "16px 16px" : "16px 10px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "linear-gradient(135deg, #00CEC9, #00B894)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, fontSize: 14, fontWeight: 700, color: "#fff",
                    }}>
                        AK
                    </div>
                    {sidebarOpen && (
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Amit Kumar</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Admin</div>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* ─── Main Content ─── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Top Bar */}
                <header style={{
                    height: 64,
                    background: "#fff",
                    borderBottom: "1px solid #E2E4F0",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 24px",
                    gap: 16,
                    flexShrink: 0,
                }}>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "#6C6F87", padding: 4, borderRadius: 8, display: "flex",
                        }}
                    >
                        <Menu size={20} />
                    </button>

                    {/* Search */}
                    <div style={{
                        flex: 1,
                        maxWidth: 480,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#F4F5FB",
                        borderRadius: 10,
                        padding: "8px 14px",
                    }}>
                        <Search size={16} color="#9699B0" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search invoices, products, customers..."
                            style={{
                                border: "none",
                                background: "none",
                                outline: "none",
                                fontSize: 13.5,
                                color: "#2D3436",
                                fontFamily: theme.fonts.body,
                                width: "100%",
                            }}
                        />
                        <kbd style={{
                            fontSize: 10, padding: "2px 6px", background: "#E2E4F0",
                            borderRadius: 4, color: "#9699B0", fontFamily: theme.fonts.mono,
                        }}>⌘K</kbd>
                    </div>

                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Notif */}
                        <button
                            onClick={() => setShowNotif(!showNotif)}
                            style={{
                                position: "relative", background: "none", border: "none",
                                cursor: "pointer", padding: 8, borderRadius: 10, color: "#6C6F87",
                                display: "flex",
                            }}
                        >
                            <Bell size={20} />
                            <span style={{
                                position: "absolute", top: 6, right: 6,
                                width: 8, height: 8, borderRadius: "50%",
                                background: "#E17055", border: "2px solid #fff",
                            }} />
                        </button>

                        {/* Quick Add */}
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "8px 16px", borderRadius: 10,
                                background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)",
                                color: "#fff", border: "none", cursor: "pointer",
                                fontSize: 13, fontWeight: 600, fontFamily: theme.fonts.body,
                                boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
                            }}
                        >
                            <Plus size={16} />
                            New Invoice
                        </motion.button>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
                    <AnimatePresence mode="wait">
                        <motion.div key={activePage} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                            {activePage === "dashboard" && <DashboardPage />}
                            {activePage === "invoices" && <InvoicesPage />}
                            {activePage === "inventory" && <InventoryPage />}
                            {activePage === "customers" && <CustomersPage />}
                            {activePage === "installments" && <InstallmentsPage />}
                            {activePage === "ecommerce" && <EcommercePage />}
                            {activePage === "branches" && <BranchesPage />}
                            {activePage === "ai-insights" && <AIInsightsPage />}
                            {activePage === "reports" && <ReportsPage />}
                            {activePage === "settings" && <SettingsPage />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

// ─── Card Component ───
const Card = ({ children, style, ...props }) => (
    <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)",
        border: "1px solid #E2E4F0",
        ...style,
    }} {...props}>
        {children}
    </div>
);

const SectionTitle = ({ icon: Icon, title, action }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Icon && <Icon size={20} color="#6C5CE7" />}
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{title}</h2>
        </div>
        {action}
    </div>
);

// ──────────────────────
// DASHBOARD PAGE
// ──────────────────────
function DashboardPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Greeting */}
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    Good Morning, Amit 👋
                </h1>
                <p style={{ color: "#9699B0", fontSize: 14, margin: "4px 0 0" }}>
                    Here's what's happening with your business today
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {dashboardStats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Card style={{ position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <p style={{ fontSize: 12, color: "#9699B0", margin: 0, fontWeight: 500 }}>{stat.label}</p>
                                        <h3 style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 6px", fontFamily: "'DM Sans', sans-serif" }}>{stat.value}</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            {stat.up ? <ArrowUpRight size={14} color="#00B894" /> : <ArrowDownRight size={14} color="#E17055" />}
                                            <span style={{ fontSize: 12, fontWeight: 600, color: stat.up ? "#00B894" : "#E17055" }}>{stat.change}</span>
                                            <span style={{ fontSize: 11, color: "#9699B0" }}>vs last month</span>
                                        </div>
                                    </div>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: `${stat.color}15`, display: "flex",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Icon size={22} color={stat.color} />
                                    </div>
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    <MiniChart color={stat.color} />
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Card>
                    <SectionTitle icon={BarChart3} title="Revenue Overview" action={
                        <select style={{
                            border: "1px solid #E2E4F0", borderRadius: 8, padding: "6px 12px",
                            fontSize: 12, color: "#6C6F87", background: "#F8F9FE", outline: "none",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    } />
                    <RevenueChart />
                </Card>

                <Card>
                    <SectionTitle icon={PieChart} title="Sales by Category" />
                    <DonutChart segments={[
                        { label: "Mobile", value: 45, color: "#6C5CE7" },
                        { label: "Audio", value: 28, color: "#00CEC9" },
                        { label: "Printer", value: 18, color: "#FD79A8" },
                        { label: "Other", value: 9, color: "#FDCB6E" },
                    ]} />
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <SectionTitle icon={Receipt} title="Recent Transactions" action={
                    <button style={{
                        fontSize: 13, color: "#6C5CE7", background: "none",
                        border: "none", cursor: "pointer", fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>View All →</button>
                } />
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #F1F2F8" }}>
                                {["Invoice", "Customer", "Amount", "Status", "Date", "Type"].map(h => (
                                    <th key={h} style={{
                                        textAlign: "left", padding: "10px 12px", color: "#9699B0",
                                        fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em",
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.map((t, i) => (
                                <tr key={i} style={{ borderBottom: "1px solid #F4F5FB" }}>
                                    <td style={{ padding: "12px", fontWeight: 600, color: "#6C5CE7", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{t.id}</td>
                                    <td style={{ padding: "12px", fontWeight: 500 }}>{t.customer}</td>
                                    <td style={{ padding: "12px", fontWeight: 700 }}>{t.amount}</td>
                                    <td style={{ padding: "12px" }}><StatusBadge status={t.status} /></td>
                                    <td style={{ padding: "12px", color: "#9699B0" }}>{t.date}</td>
                                    <td style={{ padding: "12px" }}>
                                        <span style={{
                                            padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                                            background: t.type === "sale" ? "#E8F8F0" : "#EDE7F6",
                                            color: t.type === "sale" ? "#00B894" : "#6C5CE7",
                                        }}>
                                            {t.type === "sale" ? "↑ Sale" : "↓ Purchase"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* AI Quick Insights */}
            <Card>
                <SectionTitle icon={Sparkles} title="AI Quick Insights" />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {aiInsights.slice(0, 2).map((ins, i) => {
                        const Icon = ins.icon;
                        return (
                            <div key={i} style={{
                                padding: 16, borderRadius: 12,
                                background: `${ins.color}08`, border: `1px solid ${ins.color}20`,
                                display: "flex", gap: 12, alignItems: "flex-start",
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: `${ins.color}15`, display: "flex",
                                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                                }}>
                                    <Icon size={18} color={ins.color} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{ins.title}</div>
                                    <div style={{ fontSize: 12.5, color: "#6C6F87", lineHeight: 1.5 }}>{ins.desc}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

// ──────────────────────
// INVOICES PAGE
// ──────────────────────
function InvoicesPage() {
    const [tab, setTab] = useState("all");
    const tabs = [
        { id: "all", label: "All Invoices", count: 247 },
        { id: "paid", label: "Paid", count: 189 },
        { id: "pending", label: "Pending", count: 42 },
        { id: "overdue", label: "Overdue", count: 16 },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Invoices & Billing</h1>
                <div style={{ display: "flex", gap: 10 }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                        padding: "10px 18px", borderRadius: 10, border: "1px solid #E2E4F0",
                        background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: 6, color: "#4A4D64",
                    }}><Download size={15} /> Export</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                        padding: "10px 18px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)", color: "#fff",
                        cursor: "pointer", fontSize: 13, fontWeight: 600,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: 6,
                        boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
                    }}><Plus size={16} /> Create Invoice</motion.button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, background: "#F4F5FB", borderRadius: 12, padding: 4 }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                        background: tab === t.id ? "#fff" : "transparent",
                        boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                        fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                        color: tab === t.id ? "#2D3436" : "#9699B0",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        display: "flex", alignItems: "center", gap: 6,
                    }}>
                        {t.label}
                        <span style={{
                            padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                            background: tab === t.id ? "#6C5CE715" : "#E2E4F0",
                            color: tab === t.id ? "#6C5CE7" : "#9699B0",
                        }}>{t.count}</span>
                    </button>
                ))}
            </div>

            <Card style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #F1F2F8" }}>
                            {["Invoice #", "Customer", "Amount", "GST", "Status", "Date", "Actions"].map(h => (
                                <th key={h} style={{
                                    textAlign: "left", padding: "14px 16px", color: "#9699B0",
                                    fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em",
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransactions.map((t, i) => (
                            <motion.tr key={i}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                style={{ borderBottom: "1px solid #F4F5FB", cursor: "pointer" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#F8F9FE"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <td style={{ padding: "14px 16px", fontWeight: 600, color: "#6C5CE7", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{t.id}</td>
                                <td style={{ padding: "14px 16px", fontWeight: 500 }}>{t.customer}</td>
                                <td style={{ padding: "14px 16px", fontWeight: 700 }}>{t.amount}</td>
                                <td style={{ padding: "14px 16px", color: "#9699B0" }}>18%</td>
                                <td style={{ padding: "14px 16px" }}><StatusBadge status={t.status} /></td>
                                <td style={{ padding: "14px 16px", color: "#9699B0" }}>{t.date}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9699B0", padding: 4, borderRadius: 6 }}><Eye size={16} /></button>
                                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9699B0", padding: 4, borderRadius: 6 }}><Edit size={16} /></button>
                                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9699B0", padding: 4, borderRadius: 6 }}><Send size={16} /></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

// ──────────────────────
// INVENTORY PAGE
// ──────────────────────
function InventoryPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Inventory Management</h1>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                    padding: "10px 18px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)", color: "#fff",
                    cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
                }}><Plus size={16} /> Add Product</motion.button>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                    { label: "Total Products", value: "486", icon: Package, color: "#6C5CE7" },
                    { label: "Low Stock Items", value: "12", icon: AlertCircle, color: "#FDCB6E" },
                    { label: "Out of Stock", value: "3", icon: X, color: "#E17055" },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Card key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: `${s.color}15`, display: "flex",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <Icon size={22} color={s.color} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 12, color: "#9699B0" }}>{s.label}</p>
                                <h3 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>{s.value}</h3>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #F1F2F8" }}>
                            {["Product", "SKU", "Category", "Stock", "Price", "Status", "Actions"].map(h => (
                                <th key={h} style={{
                                    textAlign: "left", padding: "14px 16px", color: "#9699B0",
                                    fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em",
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p, i) => (
                            <motion.tr key={i}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                style={{ borderBottom: "1px solid #F4F5FB" }}
                            >
                                <td style={{ padding: "14px 16px", fontWeight: 600 }}>{p.name}</td>
                                <td style={{ padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#6C6F87" }}>{p.sku}</td>
                                <td style={{ padding: "14px 16px", color: "#6C6F87" }}>{p.category}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{
                                            width: 60, height: 6, borderRadius: 3, background: "#F1F2F8",
                                        }}>
                                            <div style={{
                                                height: "100%", borderRadius: 3,
                                                width: `${Math.min(p.stock / 100 * 100, 100)}%`,
                                                background: p.stock > 20 ? "#00B894" : p.stock > 0 ? "#FDCB6E" : "#E17055",
                                            }} />
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: 12 }}>{p.stock}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "14px 16px", fontWeight: 700 }}>{p.price}</td>
                                <td style={{ padding: "14px 16px" }}><StatusBadge status={p.status} /></td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9699B0", padding: 4 }}><Edit size={16} /></button>
                                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9699B0", padding: 4 }}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

// ──────────────────────
// CUSTOMERS & CRM PAGE
// ──────────────────────
function CustomersPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Customers & CRM</h1>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                    padding: "10px 18px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)", color: "#fff",
                    cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
                }}><Plus size={16} /> Add Customer</motion.button>
            </div>

            {/* Loyalty Overview */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                    { label: "Platinum", value: 28, color: "#6C5CE7", icon: Award },
                    { label: "Gold", value: 145, color: "#F39C12", icon: Star },
                    { label: "Silver", value: 312, color: "#9699B0", icon: Shield },
                    { label: "Bronze", value: 407, color: "#E17055", icon: Heart },
                ].map((tier, i) => {
                    const Icon = tier.icon;
                    return (
                        <Card key={i} style={{ textAlign: "center", padding: 20 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: `${tier.color}12`, display: "flex",
                                alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
                            }}>
                                <Icon size={24} color={tier.color} />
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>{tier.value}</div>
                            <div style={{ fontSize: 12, color: "#9699B0", fontWeight: 500 }}>{tier.label} Members</div>
                        </Card>
                    );
                })}
            </div>

            <Card style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #F1F2F8" }}>
                            {["Customer", "Phone", "Email", "Balance", "Loyalty", "Orders", "Actions"].map(h => (
                                <th key={h} style={{
                                    textAlign: "left", padding: "14px 16px", color: "#9699B0",
                                    fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em",
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((c, i) => (
                            <motion.tr key={i}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                style={{ borderBottom: "1px solid #F4F5FB" }}
                            >
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 10,
                                            background: `hsl(${i * 60}, 60%, 92%)`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 13, fontWeight: 700, color: `hsl(${i * 60}, 50%, 45%)`,
                                        }}>
                                            {c.name.charAt(0)}
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#6C6F87", fontSize: 12.5 }}>{c.phone}</td>
                                <td style={{ padding: "14px 16px", color: "#6C6F87", fontSize: 12.5 }}>{c.email}</td>
                                <td style={{ padding: "14px 16px", fontWeight: 700 }}>{c.balance}</td>
                                <td style={{ padding: "14px 16px" }}><StatusBadge status={c.loyalty} /></td>
                                <td style={{ padding: "14px 16px", fontWeight: 600 }}>{c.orders}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", gap: 4 }}>
                                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9699B0", padding: 4 }}><MessageSquare size={16} /></button>
                                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9699B0", padding: 4 }}><Eye size={16} /></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

// ──────────────────────
// INSTALLMENTS PAGE
// ──────────────────────
function InstallmentsPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Installment Reports</h1>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                    padding: "10px 18px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)", color: "#fff",
                    cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
                }}><Plus size={16} /> New Installment Plan</motion.button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                    { label: "Total Receivable", value: "₹4,80,000", icon: HandCoins, color: "#6C5CE7" },
                    { label: "Collected", value: "₹2,35,000", icon: BadgeIndianRupee, color: "#00B894" },
                    { label: "Overdue", value: "₹15,000", icon: AlertCircle, color: "#E17055" },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Card key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: `${s.color}12`, display: "flex",
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <Icon size={24} color={s.color} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 12, color: "#9699B0" }}>{s.label}</p>
                                <h3 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>{s.value}</h3>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card style={{ padding: 0 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #F1F2F8" }}>
                            {["Customer", "Total Amount", "Paid", "Remaining", "EMIs", "Next Due", "Status"].map(h => (
                                <th key={h} style={{
                                    textAlign: "left", padding: "14px 16px", color: "#9699B0",
                                    fontWeight: 600, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em",
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {installmentData.map((inst, i) => (
                            <motion.tr key={i}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                style={{ borderBottom: "1px solid #F4F5FB" }}
                            >
                                <td style={{ padding: "14px 16px", fontWeight: 600 }}>{inst.customer}</td>
                                <td style={{ padding: "14px 16px", fontWeight: 700 }}>{inst.total}</td>
                                <td style={{ padding: "14px 16px", color: "#00B894", fontWeight: 600 }}>{inst.paid}</td>
                                <td style={{ padding: "14px 16px", color: "#E17055", fontWeight: 600 }}>{inst.remaining}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ display: "flex", gap: 3 }}>
                                            {Array.from({ length: inst.emis }).map((_, j) => (
                                                <div key={j} style={{
                                                    width: 8, height: 8, borderRadius: "50%",
                                                    background: j < inst.paidEmis ? "#00B894" : "#E2E4F0",
                                                }} />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: 11, color: "#9699B0" }}>{inst.paidEmis}/{inst.emis}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#6C6F87", fontSize: 12.5 }}>{inst.nextDue}</td>
                                <td style={{ padding: "14px 16px" }}><StatusBadge status={inst.status} /></td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

// ──────────────────────
// E-COMMERCE PAGE
// ──────────────────────
function EcommercePage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Online Store</h1>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                    { label: "Online Orders", value: "324", icon: ShoppingBag, color: "#6C5CE7" },
                    { label: "Visitors Today", value: "1,208", icon: Eye, color: "#00CEC9" },
                    { label: "Conversion Rate", value: "3.8%", icon: Target, color: "#FD79A8" },
                    { label: "Avg Order Value", value: "₹2,340", icon: IndianRupee, color: "#FDCB6E" },
                ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Card key={i} style={{ textAlign: "center", padding: 20 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: `${s.color}12`, display: "flex",
                                alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
                            }}>
                                <Icon size={24} color={s.color} />
                            </div>
                            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: "#9699B0", fontWeight: 500, marginTop: 4 }}>{s.label}</div>
                        </Card>
                    );
                })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Card>
                    <SectionTitle icon={Store} title="Store Status" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {[
                            { label: "Store URL", value: "shop.bizflowpro.in", active: true },
                            { label: "Payment Gateway", value: "Razorpay", active: true },
                            { label: "Shipping Partner", value: "Delhivery", active: true },
                            { label: "WhatsApp Orders", value: "Enabled", active: true },
                        ].map((item, i) => (
                            <div key={i} style={{
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                padding: "12px 16px", borderRadius: 10, background: "#F8F9FE",
                            }}>
                                <span style={{ fontSize: 13, color: "#6C6F87" }}>{item.label}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</span>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: "50%",
                                        background: item.active ? "#00B894" : "#E17055",
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <SectionTitle icon={ShoppingCart} title="Recent Online Orders" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            { id: "#ORD-501", customer: "Ankit J.", items: 3, amount: "₹4,599", status: "paid" },
                            { id: "#ORD-500", customer: "Meena R.", items: 1, amount: "₹12,999", status: "pending" },
                            { id: "#ORD-499", customer: "Suresh K.", items: 2, amount: "₹2,998", status: "paid" },
                            { id: "#ORD-498", customer: "Divya P.", items: 5, amount: "₹8,450", status: "paid" },
                        ].map((order, i) => (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "12px 14px", borderRadius: 10, background: "#F8F9FE",
                            }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{order.id}</span>
                                    <span style={{ color: "#9699B0", fontSize: 12, marginLeft: 8 }}>{order.customer}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13 }}>{order.amount}</span>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// ──────────────────────
// BRANCHES PAGE
// ──────────────────────
function BranchesPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Multi-Branch Management</h1>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                    padding: "10px 18px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)", color: "#fff",
                    cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                    display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
                }}><Plus size={16} /> Add Branch</motion.button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {branches.map((branch, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Card style={{ position: "relative", overflow: "hidden" }}>
                            <div style={{
                                position: "absolute", top: 0, right: 0, width: 120, height: 120,
                                background: `linear-gradient(135deg, ${["#6C5CE7", "#00CEC9", "#FD79A8", "#FDCB6E"][i]}10, transparent)`,
                                borderRadius: "0 16px 0 120px",
                            }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <MapPin size={16} color="#6C5CE7" />
                                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{branch.name}</h3>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 12.5, color: "#9699B0" }}>Manager: {branch.manager}</p>
                                </div>
                                <StatusBadge status={branch.status} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div style={{ padding: "12px 14px", borderRadius: 10, background: "#F8F9FE" }}>
                                    <p style={{ margin: 0, fontSize: 11, color: "#9699B0" }}>Revenue</p>
                                    <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>{branch.revenue}</p>
                                </div>
                                <div style={{ padding: "12px 14px", borderRadius: 10, background: "#F8F9FE" }}>
                                    <p style={{ margin: 0, fontSize: 11, color: "#9699B0" }}>Orders</p>
                                    <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>{branch.orders}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ──────────────────────
// AI INSIGHTS PAGE
// ──────────────────────
function AIInsightsPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    <Sparkles size={24} style={{ verticalAlign: "middle", marginRight: 8, color: "#6C5CE7" }} />
                    AI-Powered Insights
                </h1>
                <p style={{ color: "#9699B0", fontSize: 14, margin: "6px 0 0" }}>Smart predictions and recommendations for your business</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {aiInsights.map((ins, i) => {
                    const Icon = ins.icon;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <Card style={{ position: "relative", overflow: "hidden", height: "100%" }}>
                                <div style={{
                                    position: "absolute", top: -20, right: -20, width: 80, height: 80,
                                    borderRadius: "50%", background: `${ins.color}08`,
                                }} />
                                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 14,
                                        background: `${ins.color}12`, display: "flex",
                                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    }}>
                                        <Icon size={24} color={ins.color} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", fontFamily: "'DM Sans', sans-serif" }}>{ins.title}</h3>
                                        <p style={{ fontSize: 13, color: "#6C6F87", lineHeight: 1.6, margin: 0 }}>{ins.desc}</p>
                                        <button style={{
                                            marginTop: 12, padding: "6px 14px", borderRadius: 8,
                                            border: `1px solid ${ins.color}30`, background: `${ins.color}08`,
                                            color: ins.color, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                                        }}>
                                            Take Action →
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* AI Chat */}
            <Card>
                <SectionTitle icon={Brain} title="Ask AI About Your Business" />
                <div style={{
                    padding: 20, borderRadius: 12, background: "#F8F9FE",
                    border: "2px dashed #E2E4F0", textAlign: "center",
                }}>
                    <Brain size={32} color="#A29BFE" style={{ margin: "0 auto 10px" }} />
                    <p style={{ fontSize: 14, color: "#6C6F87", margin: "0 0 12px" }}>
                        Ask questions like "What products should I restock?" or "Which customers are most profitable?"
                    </p>
                    <div style={{
                        display: "flex", gap: 8, maxWidth: 500, margin: "0 auto",
                    }}>
                        <input placeholder="Ask anything about your business..." style={{
                            flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #E2E4F0",
                            fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none",
                            background: "#fff",
                        }} />
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{
                            padding: "10px 20px", borderRadius: 10, border: "none",
                            background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)", color: "#fff",
                            cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}>
                            <Sparkles size={16} />
                        </motion.button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ──────────────────────
// REPORTS PAGE
// ──────────────────────
function ReportsPage() {
    const reports = [
        { name: "GSTR-1 Report", desc: "Outward supplies return", icon: FileBarChart, color: "#6C5CE7" },
        { name: "GSTR-3B Summary", desc: "Monthly summary return", icon: ClipboardList, color: "#00CEC9" },
        { name: "Profit & Loss", desc: "Income vs expenses analysis", icon: TrendingUp, color: "#00B894" },
        { name: "Balance Sheet", desc: "Assets, liabilities & equity", icon: Layers, color: "#FD79A8" },
        { name: "Stock Report", desc: "Current inventory valuation", icon: Package, color: "#FDCB6E" },
        { name: "Party Ledger", desc: "Customer/supplier balances", icon: Users, color: "#E17055" },
        { name: "Cash Flow", desc: "Money in vs money out", icon: Activity, color: "#6C5CE7" },
        { name: "Sales by Category", desc: "Revenue breakdown", icon: PieChart, color: "#00CEC9" },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Reports & GST</h1>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {reports.map((r, i) => {
                    const Icon = r.icon;
                    return (
                        <motion.div key={i}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}
                            style={{ cursor: "pointer" }}
                        >
                            <Card style={{ textAlign: "center", padding: 24, height: "100%", transition: "box-shadow 0.2s" }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 16,
                                    background: `${r.color}12`, display: "flex",
                                    alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
                                }}>
                                    <Icon size={26} color={r.color} />
                                </div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>{r.name}</h3>
                                <p style={{ fontSize: 12, color: "#9699B0", margin: 0 }}>{r.desc}</p>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

// ──────────────────────
// SETTINGS PAGE
// ──────────────────────
function SettingsPage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 700 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Settings</h1>

            <Card>
                <SectionTitle icon={Building2} title="Business Profile" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                        { label: "Business Name", value: "Amit Electronics" },
                        { label: "GSTIN", value: "09AAACH7409R1ZE" },
                        { label: "Phone", value: "+91 98765 43210" },
                        { label: "Email", value: "amit@electronics.in" },
                        { label: "Address", value: "Shop 12, Main Market, Delhi" },
                        { label: "State", value: "Delhi" },
                    ].map((field, i) => (
                        <div key={i}>
                            <label style={{ fontSize: 12, color: "#9699B0", fontWeight: 500, display: "block", marginBottom: 6 }}>{field.label}</label>
                            <input defaultValue={field.value} style={{
                                width: "100%", padding: "10px 14px", borderRadius: 10,
                                border: "1px solid #E2E4F0", fontSize: 13.5,
                                fontFamily: "'Plus Jakarta Sans', sans-serif", outline: "none",
                                background: "#F8F9FE", boxSizing: "border-box",
                            }} />
                        </div>
                    ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                    marginTop: 20, padding: "10px 24px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)", color: "#fff",
                    cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>Save Changes</motion.button>
            </Card>

            <Card>
                <SectionTitle icon={Shield} title="Security & Preferences" />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                        { label: "Two-Factor Authentication", desc: "Extra security for your account", enabled: true },
                        { label: "Email Notifications", desc: "Get notified about important updates", enabled: true },
                        { label: "WhatsApp Alerts", desc: "Payment & order alerts via WhatsApp", enabled: false },
                        { label: "Auto Backup", desc: "Daily cloud backup of all data", enabled: true },
                    ].map((pref, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "14px 16px", borderRadius: 10, background: "#F8F9FE",
                        }}>
                            <div>
                                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{pref.label}</div>
                                <div style={{ fontSize: 12, color: "#9699B0", marginTop: 2 }}>{pref.desc}</div>
                            </div>
                            <div style={{
                                width: 44, height: 24, borderRadius: 12, cursor: "pointer",
                                background: pref.enabled ? "#6C5CE7" : "#E2E4F0",
                                position: "relative", transition: "background 0.2s",
                            }}>
                                <div style={{
                                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                                    position: "absolute", top: 3,
                                    left: pref.enabled ? 23 : 3,
                                    transition: "left 0.2s",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}