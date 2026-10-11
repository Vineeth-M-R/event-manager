import { useState, useEffect } from 'react';
import { ACTIVITIES, getDefaultChecklistForActivity } from './checklistData';

const STORAGE_KEY = 'event_manager_activity_checklists_v2';

export default function ChecklistModal({ isOpen, onClose }) {
  const [selectedActivity, setSelectedActivity] = useState(ACTIVITIES[0].id);
  const [checklists, setChecklists] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load checklists from localStorage:', e);
    }
    // Default initial state: map each activity to its items with must-have and specific items
    const initial = {};
    ACTIVITIES.forEach(act => {
      initial[act.id] = getDefaultChecklistForActivity(act.id);
    });
    return initial;
  });




  // Persist to localStorage whenever checklists state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checklists));
    } catch (e) {
      console.error('Failed to save checklists to localStorage:', e);
    }
  }, [checklists]);

  if (!isOpen) return null;

  // Active items for selected activity
  const isValidActivity = ACTIVITIES.some(act => act.id === selectedActivity);
  const activeActivityId = isValidActivity ? selectedActivity : ACTIVITIES[0].id;

  const currentItems = checklists[activeActivityId] || [];
  const completedCount = currentItems.filter(item => item.checked).length;
  const totalCount = currentItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const mustHaveItems = currentItems.filter(i => i.category === 'Must Have');
  const specificItems = currentItems.filter(i => i.category !== 'Must Have');

  const handleToggleItem = (itemId) => {
    setChecklists(prev => {
      const items = prev[activeActivityId] || [];
      return {
        ...prev,
        [activeActivityId]: items.map(item =>
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
      };
    });
  };

  const handleDeleteItem = (itemId) => {
    setChecklists(prev => ({
      ...prev,
      [activeActivityId]: (prev[activeActivityId] || []).filter(item => item.id !== itemId)
    }));
  };

  const renderItemRow = (item) => (
    <li
      key={item.id}
      className={`checklist-item-row ${item.checked ? 'is-checked' : ''}`}
      onClick={() => handleToggleItem(item.id)}
    >
      <label className="checkbox-container" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => handleToggleItem(item.id)}
        />
        <span className="checkbox-checkmark"></span>
      </label>
      <span className="checklist-item-text">{item.text}</span>
      <button
        type="button"
        className="item-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteItem(item.id);
        }}
        title="Remove item"
        aria-label="Remove item"
      >
        ×
      </button>
    </li>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content checklist-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Activity Checklist</h2>
            <p className="checklist-subtitle">Prep and packing essentials for workshop events</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <div className="modal-body checklist-modal-body">
          {/* Dropdown Selector */}
          <div className="checklist-selector-section">
            <label htmlFor="checklistActivitySelect" className="checklist-selector-label">
              Select Activity
            </label>
            <div className="select-wrapper">
              <select
                id="checklistActivitySelect"
                value={activeActivityId}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="checklist-dropdown"
              >
                {ACTIVITIES.map(act => (
                  <option key={act.id} value={act.id}>
                    {act.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Progress Section */}
          <div className="checklist-progress-card">
            <div className="progress-info-row">
              <span className="progress-status-text">
                {totalCount === 0 ? 'No items in checklist' : (
                  progressPercent === 100
                    ? 'All items checked! Ready for workshop 🎉'
                    : `${completedCount} of ${totalCount} items packed (${progressPercent}%)`
                )}
              </span>
            </div>
            {totalCount > 0 && (
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>

          {/* Checklist Items */}
          <div className="checklist-items-container">
            {currentItems.length === 0 ? (
              <div className="checklist-empty">
                <p>No checklist items for this activity.</p>
              </div>
            ) : (
              <div className="checklist-sections">
                {mustHaveItems.length > 0 && (
                  <div className="checklist-section-group">
                    <div className="checklist-group-header">
                      <span>Must Have (All Activities)</span>
                      <span className="group-count">
                        {mustHaveItems.filter(i => i.checked).length}/{mustHaveItems.length}
                      </span>
                    </div>
                    <ul className="checklist-ul">
                      {mustHaveItems.map(renderItemRow)}
                    </ul>
                  </div>
                )}

                {specificItems.length > 0 && (
                  <div className="checklist-section-group">
                    <div className="checklist-group-header">
                      <span>Activity Supplies</span>
                      <span className="group-count">
                        {specificItems.filter(i => i.checked).length}/{specificItems.length}
                      </span>
                    </div>
                    <ul className="checklist-ul">
                      {specificItems.map(renderItemRow)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
