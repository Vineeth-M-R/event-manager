import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import { openCalendarLink } from './calendarUtils'

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
  const [revenueInputs, setRevenueInputs] = useState({})
  const [savedRevenue, setSavedRevenue] = useState({})
  const [totalRevenue, setTotalRevenue] = useState(0)

  // Fetch total revenue on component mount
  useEffect(() => {
    fetchTotalRevenue()
  }, [])

  const fetchTotalRevenue = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('revenue')

      if (error) throw error

      const total = (data || []).reduce((sum, event) => {
        return sum + (event.revenue || 0)
      }, 0)

      setTotalRevenue(total)
    } catch (error) {
      console.error('Error fetching total revenue:', error)
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
        .order('created_at', { ascending: false })

      if (error) throw error

      setPreviousEvents(data || [])

      // Initialize revenue inputs from database
      const initialRevenue = {}
        ; (data || []).forEach(event => {
          initialRevenue[event.id] = event.revenue || ''
        })
      setRevenueInputs(initialRevenue)

      setShowResponses(true)
    } catch (error) {
      console.error('Error fetching events:', error)
      setSubmitMessage({ type: 'error', text: `Error loading events: ${error.message}` })
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const handleRevenueChange = (eventId, value) => {
    setRevenueInputs(prev => ({
      ...prev,
      [eventId]: value
    }))
  }

  const saveRevenue = async (eventId) => {
    try {
      const revenue = revenueInputs[eventId]
      const { error } = await supabase
        .from('events')
        .update({ revenue: revenue ? parseFloat(revenue) : null })
        .eq('id', eventId)

      if (error) throw error

      // Show success state on the button
      setSavedRevenue(prev => ({ ...prev, [eventId]: true }))

      // Refresh total revenue
      fetchTotalRevenue()

      // Reset success state after 2 seconds
      setTimeout(() => {
        setSavedRevenue(prev => ({ ...prev, [eventId]: false }))
      }, 2000)
    } catch (error) {
      console.error('Error saving revenue:', error)
      alert(`Error saving revenue: ${error.message}`)
    }
  }

  const closeResponsesModal = () => {
    setShowResponses(false)
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
          {isLoadingEvents ? 'Loading...' : 'View Responses'}
        </button>
      </header>

      <main className="form-card">
        {/* Revenue Summary */}
        <div className="revenue-summary">
          <div className="revenue-label">Total Revenue Earned</div>
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
                  <option value="onesie">Onesie</option>
                  <option value="fluid-art">Fluid Art</option>
                  <option value="canvas">Canvas</option>
                  <option value="mosaic">Mosaic</option>
                  <option value="photo-frame">Photo Frame</option>
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
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousEvents.map((event) => (
                        <tr key={event.id}>
                          <td>{event.activity_type}</td>
                          <td>{event.host_details || '-'}</td>
                          <td>{event.event_date}</td>
                          <td>{event.venue || '-'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div className="input-with-prefix" style={{ flex: 1 }}>
                                <span className="input-prefix">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="100"
                                  placeholder="0"
                                  value={revenueInputs[event.id] || ''}
                                  onChange={(e) => handleRevenueChange(event.id, e.target.value)}
                                  style={{ width: '100%' }}
                                />
                              </div>
                              <button
                                className={`btn ${savedRevenue[event.id] ? 'btn-success' : 'btn-primary'}`}
                                onClick={() => saveRevenue(event.id)}
                                style={{ padding: '6px 12px', fontSize: '14px', minWidth: '70px' }}
                              >
                                {savedRevenue[event.id] ? '✓ Saved' : 'Save'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
