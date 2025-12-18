import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Welcome Pranathee</h1>
        <p className="app-subtitle">
          Capture all the key details for your upcoming Art workshop.
        </p>
      </header>

      <main className="form-card">
        <form className="event-form">
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="workshopType">Activity Type</label>
              <input
                id="workshopType"
                name="workshopType"
                type="text"
                placeholder="e.g. React Bootcamp, Design Sprint"
              />
            </div>

            <div className="form-field">
              <label htmlFor="workshopPoc">Host Details</label>
              <input
                id="workshopPoc"
                name="workshopPoc"
                type="text"
                placeholder="Point of contact name"
              />
            </div>
          </div>

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
                  placeholder="2500"
                />
              </div>
            </div>

            <div className="form-field form-field-full">
              <label htmlFor="workshopPlace">Venue</label>
              <input
                id="workshopPlace"
                name="workshopPlace"
                type="text"
                placeholder="Venue name or meeting link"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="workshopDate">Date</label>
              <input id="workshopDate" name="workshopDate" type="date" />
            </div>

            <div className="form-field">
              <label htmlFor="workshopTime">Time</label>
              <input id="workshopTime" name="workshopTime" type="time" />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="workshopNotes">Additional notes</label>
            <textarea
              id="workshopNotes"
              name="workshopNotes"
              rows="3"
              placeholder="Add any additional details"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default App
