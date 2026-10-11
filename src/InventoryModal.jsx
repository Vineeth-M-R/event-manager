import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Tracked inventory items catalog
const INVENTORY_ITEMS = [
  { key: 'canvas',      label: 'Canvas',        unit: 'pcs' },
  { key: 'onesie',      label: 'Onesie',        unit: 'pcs' },
  { key: 'bear',        label: 'Bears',          unit: 'pcs' },
  { key: 'toteBag',     label: 'Tote Bags',      unit: 'pcs' },
  { key: 'wax',         label: 'Wax',            unit: 'g'   },
  { key: 'apron',       label: 'Aprons',         unit: 'pcs' },
  { key: 'jellyBag',    label: 'Jelly Bags',     unit: 'pcs' },
  { key: 'photoFrame',  label: 'Photo frame',    unit: 'pcs' },
  { key: 'servingTray', label: 'Serving tray',   unit: 'pcs' },
  { key: 'tumbler',     label: 'Tumbler',        unit: 'pcs' },
];

// Display helper: converts grams to kg
const formatQty = (value, unit) => {
  const v = Math.max(0, value);
  if (unit === 'g') {
    return v >= 1000
      ? `${(v / 1000).toFixed(2).replace(/\.?0+$/, '')} kg`
      : `${v} g`;
  }
  return `${v}`;
};

// Deduction per participant per activity type
const DEDUCTIONS_PER_PAX = {
  'onesie-generic':  { onesie: 1,      apron: 1 },
  'fluid-art':       { bear: 1,        apron: 1 },
  'canvas-regular':  { canvas: 1,      apron: 1 },
  'canvas-kit':      { canvas: 1,      apron: 1 },
  'photo-frame':     { photoFrame: 1,  apron: 1 },
  'serving-tray':    { servingTray: 1, apron: 1 },
  'tote-bags':       { toteBag: 1,     apron: 1 },
  'jelly-bag':       { jellyBag: 1,    apron: 1 },
  'tumbler':         { tumbler: 1,     apron: 1 },
  'candle':          { wax: 100,       apron: 1 }, // 100g wax per pax
};

// Tracking inventory from now (events recorded before this are not deducted)
const INVENTORY_START_TIME = '2026-10-11T12:26:00.000Z';

export default function InventoryModal({ isOpen, onClose }) {
  const [events, setEvents] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Add purchase form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [purchaseItem, setPurchaseItem] = useState(INVENTORY_ITEMS[0].key);
  const [purchaseQty, setPurchaseQty] = useState('');
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);
  const [purchaseFeedback, setPurchaseFeedback] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchInventoryData = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Fetch new events and purchases in parallel from Supabase
        const [eventsRes, purchasesRes] = await Promise.all([
          supabase
            .from('events')
            .select('activity_type, participants_count, created_at')
            .gte('created_at', INVENTORY_START_TIME),
          supabase
            .from('inventory_purchases')
            .select('id, item_key, quantity, created_at')
        ]);

        if (eventsRes.error) {
          console.error('Error fetching events:', eventsRes.error);
        } else {
          setEvents(eventsRes.data || []);
        }

        if (purchasesRes.error) {
          console.error('Error fetching purchases:', purchasesRes.error);
        } else {
          setPurchases(purchasesRes.data || []);
        }
      } catch (err) {
        console.error('Error loading inventory data:', err);
        setError('Failed to load inventory data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventoryData();
  }, [isOpen]);

  if (!isOpen) return null;

  // Save new purchased inventory directly to Supabase
  const handleAddPurchase = async (e) => {
    e.preventDefault();
    const qtyNum = parseFloat(purchaseQty);
    if (!qtyNum || qtyNum <= 0) return;

    const targetItem = INVENTORY_ITEMS.find(item => item.key === purchaseItem);
    // Wax is stored in grams (e.g. 2 kg entered = 2000 g stored)
    const storedQty = purchaseItem === 'wax' ? Math.round(qtyNum * 1000) : Math.round(qtyNum);

    setIsSubmittingPurchase(true);
    setPurchaseFeedback('');

    try {
      const { data, error: insertError } = await supabase
        .from('inventory_purchases')
        .insert([
          {
            item_key: purchaseItem,
            quantity: storedQty
          }
        ])
        .select();

      if (insertError) throw insertError;

      const insertedRecord = data && data[0] ? data[0] : {
        id: Date.now(),
        item_key: purchaseItem,
        quantity: storedQty
      };

      setPurchases(prev => [...prev, insertedRecord]);
      setPurchaseFeedback(`Added ${qtyNum}${purchaseItem === 'wax' ? ' kg' : ''} to ${targetItem?.label || 'inventory'}!`);
      setPurchaseQty('');

      setTimeout(() => {
        setPurchaseFeedback('');
      }, 3000);
    } catch (err) {
      console.error('Error saving purchase to Supabase:', err);
      setPurchaseFeedback(`Error: ${err.message}`);
    } finally {
      setIsSubmittingPurchase(false);
    }
  };

  // Calculate total deductions from new events recorded from now
  const deductions = {};
  events.forEach(ev => {
    const pax = parseInt(ev.participants_count, 10) || 0;
    if (pax <= 0) return;
    const rules = DEDUCTIONS_PER_PAX[ev.activity_type];
    if (!rules) return;
    Object.entries(rules).forEach(([item, qty]) => {
      deductions[item] = (deductions[item] || 0) + qty * pax;
    });
  });

  // Calculate total stock from Supabase (baseline opening stock + all purchases)
  const purchasedTotals = {};
  purchases.forEach(p => {
    purchasedTotals[p.item_key] = (purchasedTotals[p.item_key] || 0) + (Number(p.quantity) || 0);
  });

  // Build final inventory list: totalPurchasedFromSupabase - used
  const inventoryRows = INVENTORY_ITEMS.map(item => {
    const totalStock = purchasedTotals[item.key] || 0;
    const used = deductions[item.key] || 0;
    const remaining = totalStock - used;
    return { ...item, totalStock, used, remaining };
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content inventory-modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Inventory</h2>
          <div className="modal-header-actions">
            <button
              type="button"
              className="add-purchase-btn"
              onClick={() => {
                setShowAddForm(v => !v);
                setPurchaseFeedback('');
              }}
            >
              {showAddForm ? '✕ Close' : '+ Add Purchase'}
            </button>
            <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        <div className="modal-body inventory-modal-body">
          {error && <p className="inventory-error">{error}</p>}

          {/* Add Purchased Inventory Form */}
          {showAddForm && (
            <form onSubmit={handleAddPurchase} className="add-inventory-card">
              <div className="add-inventory-card-title">Record Newly Purchased Inventory</div>
              <div className="add-inventory-form-row">
                <select
                  value={purchaseItem}
                  onChange={(e) => setPurchaseItem(e.target.value)}
                  className="add-inventory-select"
                >
                  {INVENTORY_ITEMS.map(item => (
                    <option key={item.key} value={item.key}>
                      {item.label} {item.unit === 'g' ? '(kg)' : ''}
                    </option>
                  ))}
                </select>
                <div className="add-inventory-input-wrapper">
                  <input
                    type="number"
                    min={purchaseItem === 'wax' ? '0.01' : '1'}
                    step="any"
                    placeholder={purchaseItem === 'wax' ? 'Qty (kg)' : 'Qty'}
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(e.target.value)}
                    className="add-inventory-input"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingPurchase || !purchaseQty || parseFloat(purchaseQty) <= 0}
                  className="add-inventory-submit-btn"
                >
                  {isSubmittingPurchase ? 'Adding...' : 'Add Stock'}
                </button>
              </div>
              {purchaseFeedback && (
                <div className={`purchase-feedback-msg ${purchaseFeedback.startsWith('Error') ? 'error' : ''}`}>
                  {purchaseFeedback}
                </div>
              )}
            </form>
          )}

          {isLoading ? (
            <div className="inventory-loading">Loading inventory…</div>
          ) : (
            <div className="inventory-list">
              {inventoryRows.map(item => (
                <div key={item.key} className="inventory-row">
                  <span className="inventory-item-name">{item.label}</span>
                  <span className="inventory-count-value">
                    {formatQty(item.remaining, item.unit)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
