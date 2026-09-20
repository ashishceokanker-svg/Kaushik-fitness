import React, { useState } from 'react';
import { useGymData } from '../../context/GymDataContext';
import { useAuth } from '../../context/AuthContext';
import { SupplementItem, SupplementSaleTransaction, SupplementCategory } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  User,
  CreditCard,
  Printer,
  DollarSign,
  Boxes,
  Sparkles,
  ArrowRight,
  Clock,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { ExcelImportModal } from '../common/ExcelImportModal';

interface SupplementManagementProps {
  onBack?: () => void;
}

const CATEGORY_LABELS: Record<SupplementCategory, { label: string; color: string }> = {
  whey_protein: { label: 'Whey Protein', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  creatine: { label: 'Creatine', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  bcaa: { label: 'BCAA & EAA', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  pre_workout: { label: 'Pre-Workout', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  mass_gainer: { label: 'Mass Gainer', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  vitamins: { label: 'Vitamins & Minerals', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  peanut_butter: { label: 'Peanut Butter', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  other: { label: 'Other', color: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export const SupplementManagement: React.FC<SupplementManagementProps> = ({ onBack }) => {
  const { role, currentUser } = useAuth();
  const { supplements, supplementSales, addSupplementStock, sellSupplement, saveSupplementProduct, members } = useGymData();

  const [activeTab, setActiveTab] = useState<'sell' | 'stock' | 'reports'>('sell');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // --- SELL / POS FORM STATE ---
  const [selectedSupId, setSelectedSupId] = useState<string>(supplements[0]?.id || '');
  const [buyerType, setBuyerType] = useState<'member' | 'walk_in'>('member');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [saleQuantity, setSaleQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('upi');
  const [saleNotes, setSaleNotes] = useState('');
  const [activeReceipt, setActiveReceipt] = useState<SupplementSaleTransaction | null>(null);
  const [saleSuccessMessage, setSaleSuccessMessage] = useState<string>('');

  // --- RESTOCK MODAL STATE ---
  const [restockModalItem, setRestockModalItem] = useState<SupplementItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(5);
  const [restockCostPrice, setRestockCostPrice] = useState<number>(0);

  // --- NEW PRODUCT MODAL STATE ---
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdBrand, setNewProdBrand] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<SupplementCategory>('whey_protein');
  const [newProdCostPrice, setNewProdCostPrice] = useState<number>(2000);
  const [newProdSellingPrice, setNewProdSellingPrice] = useState<number>(2600);
  const [newProdQty, setNewProdQty] = useState<number>(10);
  const [newProdUnit, setNewProdUnit] = useState('Tub');
  const [newProdAlert, setNewProdAlert] = useState<number>(3);
  const [newProdBatch, setNewProdBatch] = useState('KF-SUP-2026');
  const [newProdExpiry, setNewProdExpiry] = useState('2027-12-31');
  const [newProdFlavor, setNewProdFlavor] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Selected item for Sell Tab
  const activeSellItem = supplements.find((s) => s.id === selectedSupId) || supplements[0];

  // Selected Member for Sell Tab
  const activeMember = members.find((m) => m.id === selectedMemberId);

  // Aggregate Metrics
  const totalStockUnits = supplements.reduce((acc, s) => acc + s.stockQuantity, 0);
  const lowStockCount = supplements.filter((s) => s.stockQuantity <= s.minStockAlert).length;
  const totalSalesRevenue = supplementSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalProfit = supplementSales.reduce((acc, s) => acc + s.profit, 0);

  // Filtered Supplements
  const filteredSupplements = supplements.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.flavor?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Handle Submit Sale
  const handleProcessSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSellItem) return;

    if (activeSellItem.stockQuantity < saleQuantity) {
      alert(`स्टॉक में केवल ${activeSellItem.stockQuantity} ${activeSellItem.unit} उपलब्ध है!`);
      return;
    }

    if (buyerType === 'walk_in' && !walkInName.trim()) {
      alert('कृपया ग्राहक का नाम दर्ज करें!');
      return;
    }

    const bName = buyerType === 'member' ? (activeMember?.name || 'Gym Member') : walkInName.trim();
    const bPhone = buyerType === 'member' ? activeMember?.phone : walkInPhone.trim();
    const total = activeSellItem.sellingPrice * saleQuantity;
    const totalCost = activeSellItem.costPrice * saleQuantity;
    const profit = total - totalCost;

    const staffId = currentUser?.staffId || currentUser?.id || 'usr-3';
    const staffName = currentUser?.name || 'Ramesh Verma (Staff)';

    const newSale = sellSupplement({
      supplementId: activeSellItem.id,
      supplementName: activeSellItem.name,
      brand: activeSellItem.brand,
      category: activeSellItem.category,
      quantity: saleQuantity,
      unitPrice: activeSellItem.sellingPrice,
      costPrice: activeSellItem.costPrice,
      totalAmount: total,
      profit,
      date: new Date().toISOString(),
      buyerType,
      buyerName: bName,
      buyerMemberId: buyerType === 'member' ? activeMember?.id : undefined,
      buyerPhone: bPhone,
      paymentMethod,
      soldByStaffId: staffId,
      soldByStaffName: staffName,
      notes: saleNotes.trim() || undefined,
    });

    setActiveReceipt(newSale);
    setSaleSuccessMessage(`सप्लीमेंट बिक्री सफल! रसीद संख्या: ${newSale.invoiceNumber}`);
    setSaleQuantity(1);
    setSaleNotes('');
    if (buyerType === 'walk_in') {
      setWalkInName('');
      setWalkInPhone('');
    }
  };

  // Handle Restock Submit
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem || restockQty <= 0) return;

    addSupplementStock(restockModalItem.id, restockQty, restockCostPrice > 0 ? restockCostPrice : undefined);
    setRestockModalItem(null);
  };

  // Handle Add New Product Submit
  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const newProd: SupplementItem = {
      id: `sup-${Date.now()}`,
      name: newProdName.trim(),
      brand: newProdBrand.trim() || 'Kaushik Nutrition',
      category: newProdCategory,
      costPrice: Number(newProdCostPrice),
      sellingPrice: Number(newProdSellingPrice),
      stockQuantity: Number(newProdQty),
      unit: newProdUnit.trim() || 'Tub',
      minStockAlert: Number(newProdAlert),
      batchNumber: newProdBatch.trim() || undefined,
      expiryDate: newProdExpiry || undefined,
      flavor: newProdFlavor.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    saveSupplementProduct(newProd);
    setIsAddProductModalOpen(false);
    // Reset form
    setNewProdName('');
    setNewProdBrand('');
    setNewProdFlavor('');
  };

  // Bulk Import Supplements from Excel
  const handleBulkImportSupplements = (importedSupplements: any[]) => {
    importedSupplements.forEach((item, idx) => {
      let category: SupplementCategory = 'other';
      const cat = (item.category || '').toLowerCase();
      if (cat.includes('whey') || cat.includes('protein')) category = 'whey_protein';
      else if (cat.includes('creatine')) category = 'creatine';
      else if (cat.includes('bcaa') || cat.includes('eaa')) category = 'bcaa';
      else if (cat.includes('pre') || cat.includes('workout')) category = 'pre_workout';
      else if (cat.includes('mass') || cat.includes('gainer')) category = 'mass_gainer';
      else if (cat.includes('vitamin') || cat.includes('mineral')) category = 'vitamins';
      else if (cat.includes('butter') || cat.includes('peanut')) category = 'peanut_butter';

      const newSup: SupplementItem = {
        id: `sup-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        name: item.name || 'सप्लीमेंट',
        brand: item.brand || 'Kaushik Nutrition',
        category: category,
        costPrice: Number(item.costPrice) || 1000,
        sellingPrice: Number(item.sellingPrice) || 1500,
        stockQuantity: Number(item.currentStock ?? item.stockQuantity ?? 10),
        unit: item.unit || 'Jar',
        minStockAlert: 3,
        batchNumber: `IMP-${new Date().getFullYear()}-${idx + 1}`,
        expiryDate: item.expiryDate || '2027-12-31',
        flavor: item.flavor || undefined,
        updatedAt: new Date().toISOString(),
      };
      saveSupplementProduct(newSup);
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with KPI Metric Badges */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Package className="w-4 h-4 text-cyan-600" />
            Supplement Inventory & POS Counter
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-amber-500" />
            सप्लीमेंट स्टोर एवं स्टॉक प्रबंधन
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            कौशिक फिटनेस कांकेर - न्यूट्रिशन स्टॉक एंट्री, काउंटर बिलिंग व बिक्री लेजर
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            ← वापस डैशबोर्ड
          </button>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Products */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">कुल सप्लीमेंट्स</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {supplements.length} <span className="text-xs font-medium text-slate-500">प्रकार</span>
          </div>
          <div className="text-[11px] text-cyan-700 font-medium mt-0.5">
            100% ओरिजिनल व लैब टेस्टेड
          </div>
        </div>

        {/* Total Stock in Hand */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">उपलब्ध कुल स्टॉक</span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {totalStockUnits} <span className="text-xs font-medium text-slate-500">यूनिट्स</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            स्टॉक रूम कांकेर
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">कम स्टॉक चेतावनी</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1 flex items-center gap-1.5">
            {lowStockCount}
            {lowStockCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">
            {lowStockCount > 0 ? 'रीफिल की आवश्यकता' : 'सभी स्टॉक सुरक्षित'}
          </div>
        </div>

        {/* Total Sales Revenue */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">कुल सप्लीमेंट बिक्री</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {formatINR(totalSalesRevenue)}
          </div>
          <div className="text-[11px] text-purple-700 font-bold mt-0.5">
            {role === 'admin' ? `शुद्ध लाभ: ${formatINR(totalProfit)}` : `${supplementSales.length} बिलिंग दर्ज`}
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('sell')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sell'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>सप्लीमेंट बेचें (POS Billing)</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stock'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>स्टॉक प्रबंधन (Stock Entry & Refill)</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
              {lowStockCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>बिक्री रिपोर्ट व लेजर ({supplementSales.length})</span>
        </button>
      </div>

      {/* =============================================================== */}
      {/* TAB 1: SELL & POS BILLING COUNTER */}
      {/* =============================================================== */}
      {activeTab === 'sell' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Selection & Catalog (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  सप्लीमेंट चुनें (Select Product to Sell)
                </h3>
                {/* Search */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="प्रोडक्ट खोजें..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredSupplements.map((item) => {
                  const isSelected = selectedSupId === item.id;
                  const isOutOfStock = item.stockQuantity <= 0;
                  const isLowStock = item.stockQuantity <= item.minStockAlert && !isOutOfStock;

                  return (
                    <div
                      key={item.id}
                      onClick={() => !isOutOfStock && setSelectedSupId(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-2 border-amber-500 bg-amber-50/50 shadow-sm'
                          : isOutOfStock
                          ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${CATEGORY_LABELS[item.category].color}`}>
                          {CATEGORY_LABELS[item.category].label}
                        </span>
                        <span className="text-xs font-mono font-black text-slate-900">
                          {formatINR(item.sellingPrice)}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Brand: <strong className="text-slate-700">{item.brand}</strong>
                        {item.flavor && ` • ${item.flavor}`}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500">
                          स्टॉक:
                        </span>
                        <span
                          className={`font-mono font-black text-[11px] px-2 py-0.5 rounded ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-800'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.stockQuantity} {item.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout & Billing Desk (5 cols) */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleProcessSale}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 sticky top-20"
            >
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 text-cyan-700 text-[11px] font-black uppercase">
                  <CreditCard className="w-3.5 h-3.5" />
                  काउंटर बिलिंग (Checkout Desk)
                </div>
                <h4 className="text-base font-black text-slate-900">
                  {activeSellItem ? activeSellItem.name : 'सप्लीमेंट चुनें'}
                </h4>
                {activeSellItem && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>मूल्य: <strong className="text-slate-900 font-mono">{formatINR(activeSellItem.sellingPrice)}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">स्टॉक: {activeSellItem.stockQuantity} {activeSellItem.unit}</span>
                  </div>
                )}
              </div>

              {/* 1. Buyer Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  ग्राहक प्रकार (Buyer Type) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBuyerType('member')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      buyerType === 'member'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    जिम मेंबर
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuyerType('walk_in')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      buyerType === 'walk_in'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    बाहरी ग्राहक (Walk-in)
                  </button>
                </div>
              </div>

              {/* Buyer Input */}
              {buyerType === 'member' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    जिम मेंबर चुनें (Select Member) *
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.memberCode}) • {m.phone}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      ग्राहक का नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. रमेश कुमार साहू"
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      मोबाइल नंबर (Phone)
                    </label>
                    <input
                      type="tel"
                      placeholder="उदा. 98261XXXXX"
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  मात्रा (Quantity) *
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setSaleQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-base font-black hover:bg-slate-200 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={activeSellItem?.stockQuantity || 1}
                      value={saleQuantity}
                      onChange={(e) => setSaleQuantity(Math.max(1, Math.min(activeSellItem?.stockQuantity || 1, parseInt(e.target.value) || 1)))}
                      className="w-14 text-center font-mono font-black text-sm bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSaleQuantity((q) => Math.min(activeSellItem?.stockQuantity || 1, q + 1))}
                      className="px-3 py-2 text-base font-black hover:bg-slate-200 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {activeSellItem?.unit || 'Unit'} (उपलब्ध: {activeSellItem?.stockQuantity || 0})
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  भुगतान माध्यम (Payment Method) *
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'upi', label: 'UPI (GPay)' },
                    { id: 'cash', label: 'Cash (नकद)' },
                    { id: 'card', label: 'Card / POS' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`py-2 rounded-xl font-bold transition-all cursor-pointer text-center ${
                        paymentMethod === pm.id
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  रिमार्क / टिप्पणी (Optional)
                </label>
                <input
                  type="text"
                  placeholder="उदा. डिस्काउंट या विशेष निर्देश"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              {/* Total Calculation Card */}
              {activeSellItem && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>इकाई मूल्य:</span>
                    <span className="font-mono">{formatINR(activeSellItem.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>मात्रा:</span>
                    <span className="font-mono">{saleQuantity} {activeSellItem.unit}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                    <span>कुल देय राशि (Total):</span>
                    <span className="text-emerald-700 font-mono text-base">
                      {formatINR(activeSellItem.sellingPrice * saleQuantity)}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!activeSellItem || activeSellItem.stockQuantity <= 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-105 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Receipt className="w-4 h-4" />
                <span>बिल बनाएं व बिक्री दर्ज करें</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 2: STOCK INVENTORY MANAGEMENT & RESTOCK ENTRY */}
      {/* =============================================================== */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                स्टॉक इन्वेंटरी रजिस्टर (Supplement Stock Register)
              </h3>
              <p className="text-xs text-slate-500">
                वर्तमान में उपलब्ध स्टॉक, खरीद लागत, बिक्री दर व न्यूनतम स्टॉक अलर्ट
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>📥 एक्सेल स्टॉक इम्पोर्ट</span>
              </button>
              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + नया सप्लीमेंट जोड़ें
              </button>
            </div>
          </div>

          {/* Supplements Inventory Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold">
                    <th className="py-3 px-4">सप्लीमेंट / ब्रांड</th>
                    <th className="py-3 px-3">कैटेगरी</th>
                    {role === 'admin' && <th className="py-3 px-3">लागत (Cost)</th>}
                    <th className="py-3 px-3">बिक्री दर (Price)</th>
                    {role === 'admin' && <th className="py-3 px-3">मार्जिन %</th>}
                    <th className="py-3 px-3">उपलब्ध स्टॉक</th>
                    <th className="py-3 px-3">स्थिति (Status)</th>
                    <th className="py-3 px-4 text-right">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplements.map((item) => {
                    const isOutOfStock = item.stockQuantity <= 0;
                    const isLowStock = item.stockQuantity <= item.minStockAlert && !isOutOfStock;
                    const marginPct = Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-500">
                            ब्रांड: <strong className="text-slate-700">{item.brand}</strong>
                            {item.flavor && ` • स्वाद: ${item.flavor}`}
                            {item.batchNumber && ` • बैच: ${item.batchNumber}`}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${CATEGORY_LABELS[item.category].color}`}>
                            {CATEGORY_LABELS[item.category].label}
                          </span>
                        </td>
                        {role === 'admin' && (
                          <td className="py-3.5 px-3 font-mono text-slate-600 font-bold">
                            {formatINR(item.costPrice)}
                          </td>
                        )}
                        <td className="py-3.5 px-3 font-mono font-black text-slate-900">
                          {formatINR(item.sellingPrice)}
                        </td>
                        {role === 'admin' && (
                          <td className="py-3.5 px-3 font-bold text-emerald-700">
                            +{marginPct}%
                          </td>
                        )}
                        <td className="py-3.5 px-3">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {item.stockQuantity}
                          </span>{' '}
                          <span className="text-[11px] text-slate-500">{item.unit}</span>
                        </td>
                        <td className="py-3.5 px-3">
                          {isOutOfStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                              आउट ऑफ स्टॉक
                            </span>
                          ) : isLowStock ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              कम स्टॉक ({item.stockQuantity})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              उपलब्ध ✓
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setRestockModalItem(item);
                              setRestockQty(5);
                              setRestockCostPrice(item.costPrice);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase shadow-xs transition-all cursor-pointer"
                          >
                            + रीफिल (Stock Entry)
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* TAB 3: SALES REPORT & LEDGER */}
      {/* =============================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                सप्लीमेंट बिक्री लेजर एवं इनवॉइस रिपोर्ट
              </h3>
              <p className="text-xs text-slate-500">
                कौशिक फिटनेस कांकेर द्वारा बेचे गए सभी न्यूट्रिशन प्रोडक्ट्स का आधिकारिक रिकॉर्ड
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
              कुल लेनदेन: {supplementSales.length}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold">
                    <th className="py-3 px-4">तारीख व इनवॉइस</th>
                    <th className="py-3 px-3">प्रोडक्ट विवरण</th>
                    <th className="py-3 px-3">मात्रा</th>
                    <th className="py-3 px-3">ग्राहक (Buyer)</th>
                    <th className="py-3 px-3">माध्यम</th>
                    <th className="py-3 px-3">कुल राशि</th>
                    {role === 'admin' && <th className="py-3 px-3">मुनाफा (Profit)</th>}
                    <th className="py-3 px-3">स्टाफ</th>
                    <th className="py-3 px-4 text-right">रसीद</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {supplementSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 font-sans">
                          {formatDate(sale.date)}
                        </div>
                        <div className="font-mono text-[10px] text-cyan-800 font-bold">
                          {sale.invoiceNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{sale.supplementName}</div>
                        <div className="text-[10px] text-slate-500">{sale.brand}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        {sale.quantity}x
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{sale.buyerName}</div>
                        <div className="text-[10px] text-slate-500">
                          {sale.buyerType === 'member' ? 'जिम मेंबर' : 'Walk-in'} • {sale.buyerPhone || '—'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-black text-sm text-slate-900">
                        {formatINR(sale.totalAmount)}
                      </td>
                      {role === 'admin' && (
                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-700">
                          +{formatINR(sale.profit)}
                        </td>
                      )}
                      <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                        {sale.soldByStaffName}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveReceipt(sale)}
                          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="रसीद देखें"
                        >
                          <Receipt className="w-4 h-4 text-amber-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* RESTOCK ENTRY MODAL */}
      {/* =============================================================== */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  <Boxes className="w-5 h-5 text-amber-500" />
                  स्टॉक एंट्री (Refill Stock)
                </h4>
                <p className="text-xs text-slate-500">{restockModalItem.name}</p>
              </div>
              <button
                onClick={() => setRestockModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">वर्तमान उपलब्ध स्टॉक:</span>
                  <strong className="text-slate-900 font-mono">{restockModalItem.stockQuantity} {restockModalItem.unit}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">वर्तमान लागत:</span>
                  <span className="font-mono">{formatINR(restockModalItem.costPrice)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  नया स्टॉक जोड़ें (Quantity to Add) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-black font-mono text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  नई ख़रीद लागत प्रति यूनिट (Cost Price INR - Optional)
                </label>
                <input
                  type="number"
                  value={restockCostPrice}
                  onChange={(e) => setRestockCostPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm cursor-pointer uppercase tracking-wider"
                >
                  स्टॉक अपडेट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* ADD NEW PRODUCT MODAL */}
      {/* =============================================================== */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  <Package className="w-5 h-5 text-cyan-600" />
                  नया सप्लीमेंट प्रोडक्ट जोड़ें
                </h4>
                <p className="text-xs text-slate-500">इन्वेंटरी में नया प्रोडक्ट कैटलॉग दर्ज करें</p>
              </div>
              <button
                onClick={() => setIsAddProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewProductSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  प्रोडक्ट का नाम (Product Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Dymatize ISO 100 Whey Hydrolyzed 5 lbs"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    ब्रांड (Brand) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Dymatize, ON, MB"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    कैटेगरी (Category) *
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    ख़रीद लागत (Cost Price INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    बिक्री मूल्य (Selling Price INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdSellingPrice}
                    onChange={(e) => setNewProdSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    आरंभिक स्टॉक *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newProdQty}
                    onChange={(e) => setNewProdQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    यूनिट प्रकार
                  </label>
                  <input
                    type="text"
                    placeholder="Tub / Jar / Box"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    न्यूनतम अलर्ट
                  </label>
                  <input
                    type="number"
                    value={newProdAlert}
                    onChange={(e) => setNewProdAlert(parseInt(e.target.value) || 3)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    स्वाद / फ्लेवर (Flavor)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. Gourmet Chocolate"
                    value={newProdFlavor}
                    onChange={(e) => setNewProdFlavor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    एक्सपायरी तारीख (Expiry)
                  </label>
                  <input
                    type="date"
                    value={newProdExpiry}
                    onChange={(e) => setNewProdExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-sm cursor-pointer uppercase tracking-wider"
                >
                  सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =============================================================== */}
      {/* PRINTABLE RECEIPT MODAL */}
      {/* =============================================================== */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4 print:border-none print:shadow-none print:w-full">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 print:hidden">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                सप्लीमेंट बिक्री रसीद (Cash Memo)
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Body */}
            <div id="printable-supplement-receipt" className="border border-slate-200 rounded-xl p-5 space-y-4 text-xs font-sans bg-white">
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  KAUSHIK FITNESS GYM
                </h3>
                <p className="text-[11px] text-slate-600">
                  नया बस स्टैंड के पास, कांकेर (छ.ग.) • मो. 98261-89001
                </p>
                <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-700">
                  SUPPLEMENT CASH INVOICE: {activeReceipt.invoiceNumber}
                </div>
              </div>

              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>दिनांक (Date):</span>
                  <span className="font-bold text-slate-900">{formatDate(activeReceipt.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ग्राहक का नाम (Customer):</span>
                  <span className="font-bold text-slate-900">{activeReceipt.buyerName}</span>
                </div>
                {activeReceipt.buyerPhone && (
                  <div className="flex justify-between">
                    <span>मोबाइल नंबर:</span>
                    <span className="font-mono text-slate-900">{activeReceipt.buyerPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>भुगतान माध्यम (Method):</span>
                  <span className="font-bold text-slate-900 uppercase">{activeReceipt.paymentMethod}</span>
                </div>
              </div>

              {/* Item Details */}
              <div className="border-t border-b border-slate-200 py-3 space-y-2">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{activeReceipt.supplementName}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{activeReceipt.quantity} x {formatINR(activeReceipt.unitPrice)}</span>
                  <span className="font-mono font-bold text-slate-900">{formatINR(activeReceipt.totalAmount)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-slate-900">
                <span>कुल प्राप्त राशि (Net Paid):</span>
                <span className="text-base font-mono text-emerald-700">{formatINR(activeReceipt.totalAmount)}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 text-center space-y-0.5">
                <p>Authorized Signature: {activeReceipt.soldByStaffName}</p>
                <p className="italic">Thank you for working out at Kaushik Fitness Kanker! Stay Strong! 💪</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 print:hidden">
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                बंद करें (Close)
              </button>
              <button
                type="button"
                onClick={() => {
                  const prev = document.body.style.overflow;
                  document.body.style.overflow = 'visible';
                  window.print();
                  document.body.style.overflow = prev;
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                रसीद प्रिंट करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Import Modal for Supplements */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type="supplements"
        onImportSupplements={handleBulkImportSupplements}
      />
    </div>
  );
};
