import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import { openCalendarLink } from './calendarUtils'

// Material costs per activity type
const MATERIAL_COSTS = {
  'onesie-branded': 257,
  'onesie-generic': 180,
  'fluid-art': 282,
  'canvas-regular': 150,
  'canvas-kit': 200,
  'mosaic-article': 490,
  'mosaic-serving-tray': 835,
  'mosaic-coasters': 625,
  'mosaic-shapes': 350,
  'photo-frame': 300,
  'no-base': 100
}

function App() {
  const [dateValue, setDateValue] = useState('')
  const [dateError, setDateError] = useState('')
  const [formData, setFormData] = useState({
    activityType: '',
    hostDetails: '',
    participantsCount: '',
    perPersonCharge: '',
    venue: '',
    time: '',
    additionalNotes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' })
  const [showResponses, setShowResponses] = useState(false)
  const [previousEvents, setPreviousEvents] = useState([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)

  const [totalRevenue, setTotalRevenue] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventDetails, setShowEventDetails] = useState(false)
  const [eventDetailsForm, setEventDetailsForm] = useState({
    participants: '',
    moneyCollected: ''
  })

  // Fetch total profit on component mount
  useEffect(() => {
    fetchTotalRevenue()
  }, [])

  // Fetch total profit (revenue - material costs)
  const fetchTotalRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('revenue, participants_count, activity_type')

      if (error) throw error

      const total = (data || []).reduce((sum, event) => {
        // Only calculate profit if revenue has been set (event has been edited)
        if (!event.revenue) {
          return sum // Return 0 profit for events without revenue data
        }
        const revenue = event.revenue
        const participants = event.participants_count || 0
        const materialCost = MATERIAL_COSTS[event.activity_type] || 0
        const profit = revenue - (participants * materialCost)
        return sum + profit
      }, 0)

      setTotalRevenue(total)
    } catch (error) {
      console.error('Error fetching total profit:', error)
    }
  }


  const handleDateChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '') // Remove non-digits

    if (value.length >= 2) {
      const day = value.slice(0, 2)
      const month = value.slice(2, 4)

      // Validate day (01-31)
      if (parseInt(day) < 1 || parseInt(day) > 31) {
        setDateError('Day must be between 01 and 31')
        return
      }

      // Validate month if entered (01-12)
      if (month && (parseInt(month) < 1 || parseInt(month) > 12)) {
        setDateError('Month must be between 01 and 12')
        return
      }

      // Format with slash
      value = day + (month ? '/' + month : '')
    }

    setDateError('')
    setDateValue(value)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.activityType || !dateValue || !formData.time) {
      setSubmitMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    if (dateError) {
      setSubmitMessage({ type: 'error', text: 'Please fix the date error before submitting' })
      return
    }

    setIsSubmitting(true)
    setSubmitMessage({ type: '', text: '' })

    try {
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            activity_type: formData.activityType,
            host_details: formData.hostDetails,
            participants_count: formData.participantsCount ? parseInt(formData.participantsCount) : null,
            per_person_charge: formData.perPersonCharge ? parseFloat(formData.perPersonCharge) : null,
            venue: formData.venue,
            event_date: dateValue,
            event_time: formData.time,
            additional_notes: formData.additionalNotes
          }
        ])

      if (error) throw error

      setSubmitMessage({ type: 'success', text: 'Event saved successfully in database' })

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitMessage({ type: '', text: '' })
      }, 3000)

      // Open Google Calendar with event details
      openCalendarLink({
        activity_type: formData.activityType,
        host_details: formData.hostDetails,
        participants_count: formData.participantsCount,
        per_person_charge: formData.perPersonCharge,
        venue: formData.venue,
        event_date: dateValue,
        event_time: formData.time,
        additional_notes: formData.additionalNotes
      })

      // Reset form
      setFormData({
        activityType: '',
        hostDetails: '',
        participantsCount: '',
        perPersonCharge: '',
        venue: '',
        time: '',
        additionalNotes: ''
      })
      setDateValue('')

    } catch (error) {
      console.error('Error saving event:', error)
      setSubmitMessage({ type: 'error', text: `Error: ${error.message}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchPreviousEvents = async () => {
    setIsLoadingEvents(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')

      if (error) throw error

      // Sort by event_date (DD/MM format) - latest dates first
      const sortedData = (data || []).sort((a, b) => {
        const parseDate = (dateStr) => {
          if (!dateStr) return new Date(0)
          const [day, month] = dateStr.split('/').map(Number)
          // Assuming current year 2026
          return new Date(2026, month - 1, day)
        }
        return parseDate(b.event_date) - parseDate(a.event_date)
      })

      setPreviousEvents(sortedData)
      setShowResponses(true)
    } catch (error) {
      console.error('Error fetching events:', error)
      setSubmitMessage({ type: 'error', text: `Error loading events: ${error.message}` })
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const closeResponsesModal = () => {
    setShowResponses(false)
  }

  const openEventDetails = (event) => {
    setSelectedEvent(event)
    setEventDetailsForm({
      participants: event.participants_count || '',
      moneyCollected: event.revenue || ''
    })
    setShowEventDetails(true)
  }

  const closeEventDetails = () => {
    setShowEventDetails(false)
    setSelectedEvent(null)
  }

  const handleEventDetailsChange = (e) => {
    const { name, value } = e.target
    setEventDetailsForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const saveEventDetails = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('events')
        .update({
          participants_count: eventDetailsForm.participants ? parseInt(eventDetailsForm.participants) : null,
          revenue: eventDetailsForm.moneyCollected ? parseFloat(eventDetailsForm.moneyCollected) : null
        })
        .eq('id', selectedEvent.id)

      if (error) throw error

      // Refresh the events list and total revenue
      await fetchPreviousEvents()
      await fetchTotalRevenue()

      closeEventDetails()
    } catch (error) {
      console.error('Error saving event details:', error)
      alert(`Error saving details: ${error.message}`)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Welcome Pranathee</h1>
        <button
          type="button"
          className="view-responses-btn"
          onClick={fetchPreviousEvents}
          disabled={isLoadingEvents}
        >
          {isLoadingEvents ? 'Loading...' : 'View Events'}
        </button>
      </header>

      <main className="form-card">
        {/* Profit Summary */}
        <div className="revenue-summary">
          <div className="revenue-label">Total Profit</div>
          <div className="revenue-amount">₹{totalRevenue.toLocaleString('en-IN')}</div>
        </div>

        <form className="event-form" onSubmit={handleSubmit}>
          {/* Workshop Details Section */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="workshopType">Activity Type</label>
                <select
                  id="workshopType"
                  name="activityType"
                  value={formData.activityType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select an activity</option>
                  <option value="onesie-branded">Onesie Branded</option>
                  <option value="onesie-generic">Onesie Generic</option>
                  <option value="fluid-art">Fluid Art</option>
                  <option value="canvas-regular">Canvas Regular</option>
                  <option value="canvas-kit">Canvas Kit</option>
                  <option value="mosaic-article">Mosaic Article</option>
                  <option value="mosaic-serving-tray">Mosaic Serving Tray</option>
                  <option value="mosaic-coasters">Mosaic Coasters</option>
                  <option value="mosaic-shapes">Mosaic Shapes</option>
                  <option value="photo-frame">Photo Frame</option>
                  <option value="no-base">No Base</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="workshopPoc">Host Details</label>
                <input
                  id="workshopPoc"
                  name="hostDetails"
                  type="text"
                  placeholder="Point of contact name"
                  value={formData.hostDetails}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="workshopDate">Date</label>
                <input
                  id="workshopDate"
                  name="workshopDate"
                  type="text"
                  placeholder="DD/MM"
                  maxLength="5"
                  value={dateValue}
                  onChange={handleDateChange}
                />
                {dateError && <span className="field-error">{dateError}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="workshopTime">Time</label>
                <input
                  id="workshopTime"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="workshopPlace">Venue</label>
              <input
                id="workshopPlace"
                name="venue"
                type="text"
                placeholder="Venue name"
                value={formData.venue}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Participants & Pricing Section */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="participantsCount">Number of participants</label>
                <input
                  id="participantsCount"
                  name="participantsCount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 20"
                  value={formData.participantsCount}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="perPersonCharge">Per person charge</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">₹</span>
                  <input
                    id="perPersonCharge"
                    name="perPersonCharge"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="1000"
                    value={formData.perPersonCharge}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="form-section">
            <div className="form-field">
              <label htmlFor="workshopNotes">Additional notes</label>
              <textarea
                id="workshopNotes"
                name="additionalNotes"
                rows="3"
                placeholder="Add any additional details"
                value={formData.additionalNotes}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add to calendar'}
            </button>
            {submitMessage.text && (
              <div className={`submit-message ${submitMessage.type}`}>
                {submitMessage.text}
              </div>
            )}
          </div>
        </form>
      </main>

      {/* Responses Modal */}
      {showResponses && (
        <div className="modal-overlay" onClick={closeResponsesModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Previous Responses</h2>
              <button className="modal-close" onClick={closeResponsesModal}>×</button>
            </div>
            <div className="modal-body">
              {previousEvents.length === 0 ? (
                <p className="no-events">No events found</p>
              ) : (
                <div className="table-container">
                  <table className="events-table">
                    <thead>
                      <tr>
                        <th>Activity Type</th>
                        <th>Host</th>
                        <th>Date</th>
                        <th>Venue</th>
                        <th>Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousEvents.map((event) => {
                        // Show 0 profit for events without revenue data
                        let profit = 0
                        if (event.revenue) {
                          const revenue = event.revenue
                          const participants = event.participants_count || 0
                          const materialCost = MATERIAL_COSTS[event.activity_type] || 0
                          profit = revenue - (participants * materialCost)
                        }

                        return (
                          <tr
                            key={event.id}
                            onClick={() => openEventDetails(event)}
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{event.activity_type}</td>
                            <td>{event.host_details || '-'}</td>
                            <td>{event.event_date}</td>
                            <td>{event.venue || '-'}</td>
                            <td style={{ fontWeight: '600', color: profit >= 0 ? '#059669' : '#DC2626' }}>
                              ₹{profit.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="modal-overlay" onClick={closeEventDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Event Details</h2>
              <button className="modal-close" onClick={closeEventDetails}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={saveEventDetails}>
                <div className="form-section">
                  <div className="form-field">
                    <label htmlFor="participants">Number of participants</label>
                    <input
                      id="participants"
                      name="participants"
                      type="number"
                      min="1"
                      step="1"
                      placeholder={selectedEvent.participants_count || 'e.g. 20'}
                      value={eventDetailsForm.participants}
                      onChange={handleEventDetailsChange}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="moneyCollected">Money collected</label>
                    <div className="input-with-prefix">
                      <span className="input-prefix">₹</span>
                      <input
                        id="moneyCollected"
                        name="moneyCollected"
                        type="number"
                        min="0"
                        step="100"
                        placeholder="0"
                        value={eventDetailsForm.moneyCollected}
                        onChange={handleEventDetailsChange}
                      />
                    </div>
                  </div>

                  {/* Profit Calculation Display */}
                  {eventDetailsForm.participants && eventDetailsForm.moneyCollected && selectedEvent.activity_type && (
                    <div className="form-field">
                      <label>Calculated Profit</label>
                      <div style={{
                        padding: '1rem',
                        background: '#EEF2FF',
                        borderRadius: '8px',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1E3A8A'
                      }}>
                        ₹{(
                          parseFloat(eventDetailsForm.moneyCollected) -
                          (parseInt(eventDetailsForm.participants) * (MATERIAL_COSTS[selectedEvent.activity_type] || 0))
                        ).toLocaleString('en-IN')}
                      </div>
                      <span className="helper-text">
                        Money Collected - (Participants × Material Cost of ₹{MATERIAL_COSTS[selectedEvent.activity_type] || 0})
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
