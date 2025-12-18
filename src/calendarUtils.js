/**
 * Generate Google Calendar deep link from event data
 * @param {Object} eventData - Event details from form
 * @returns {string} - Google Calendar URL
 */
export function generateCalendarLink(eventData) {
    const {
        activity_type,
        host_details,
        participants_count,
        per_person_charge,
        venue,
        event_date,
        event_time,
        additional_notes
    } = eventData

    // Create event title: Activity Type + Host Details
    const activityNames = {
        'onesie': 'Onesie Workshop',
        'fluid-art': 'Fluid Art Workshop',
        'canvas': 'Canvas Workshop'
    }
    const activityName = activityNames[activity_type] || 'Art Workshop'
    const title = host_details
        ? `${activityName} - ${host_details}`
        : activityName

    // Format dates (YYYYMMDDTHHMMSSZ format)
    // Parse DD/MM and time HH:MM
    const [day, month] = event_date.split('/')
    const [hours, minutes] = event_time.split(':')

    // Create date object in IST (UTC+5:30)
    // Note: JavaScript Date months are 0-indexed
    const istDate = new Date(2025, parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0)

    // Convert to UTC by subtracting IST offset (5 hours 30 minutes = 330 minutes)
    const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000))

    // Format start date in UTC
    const startYear = utcDate.getFullYear()
    const startMonth = String(utcDate.getMonth() + 1).padStart(2, '0')
    const startDay = String(utcDate.getDate()).padStart(2, '0')
    const startHours = String(utcDate.getHours()).padStart(2, '0')
    const startMinutes = String(utcDate.getMinutes()).padStart(2, '0')
    const startDate = `${startYear}${startMonth}${startDay}T${startHours}${startMinutes}00Z`

    // Create end date (assume 2 hours duration)
    const endDateObj = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000))
    const endYear = endDateObj.getFullYear()
    const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0')
    const endDay = String(endDateObj.getDate()).padStart(2, '0')
    const endHours = String(endDateObj.getHours()).padStart(2, '0')
    const endMinutes = String(endDateObj.getMinutes()).padStart(2, '0')
    const endDate = `${endYear}${endMonth}${endDay}T${endHours}${endMinutes}00Z`

    // Create description with all details
    let description = ''
    if (participants_count) {
        description += `Number of Participants: ${participants_count}\n`
    }
    if (per_person_charge) {
        description += `Per Person Charge: ₹${per_person_charge}\n`
    }
    if (venue) {
        description += `Venue: ${venue}\n`
    }
    if (additional_notes) {
        description += `\nAdditional Notes:\n${additional_notes}`
    }

    // Build the URL with proper encoding
    const baseUrl = 'https://calendar.google.com/calendar/render'
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${startDate}/${endDate}`,
        details: description,
        location: venue || ''
    })

    return `${baseUrl}?${params.toString()}`
}

/**
 * Open Google Calendar with pre-filled event data
 * @param {Object} eventData - Event details from form
 */
export function openCalendarLink(eventData) {
    const calendarUrl = generateCalendarLink(eventData)
    window.open(calendarUrl, '_blank')
}
