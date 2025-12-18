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
 * Detect if user is on a mobile device
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Generate ICS file content for calendar apps
 * @param {Object} eventData - Event details
 * @returns {string} - ICS file content
 */
function generateICSFile(eventData) {
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

    // Parse date and time
    const [day, month] = event_date.split('/')
    const [hours, minutes] = event_time.split(':')

    // Create date object in IST
    const istDate = new Date(2025, parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), 0)

    // Convert to UTC
    const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000))

    // Format start date
    const formatDate = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}${month}${day}T${hours}${minutes}00Z`
    }

    const startDate = formatDate(utcDate)

    // End date (2 hours later)
    const endDateObj = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000))
    const endDate = formatDate(endDateObj)

    // Create event title
    const activityNames = {
        'onesie': 'Onesie Workshop',
        'fluid-art': 'Fluid Art Workshop',
        'canvas': 'Canvas Workshop'
    }
    const activityName = activityNames[activity_type] || 'Art Workshop'
    const title = host_details ? `${activityName} - ${host_details}` : activityName

    // Create description
    let description = `Activity: ${activityName}\\n`
    if (host_details) description += `Host: ${host_details}\\n`
    if (participants_count) description += `Participants: ${participants_count}\\n`
    if (per_person_charge) description += `Per Person Charge: ₹${per_person_charge}\\n`
    if (additional_notes) description += `\\nNotes: ${additional_notes}`

    // Generate unique ID
    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@event-manager`

    // Create ICS content
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Event Manager//Art Workshop//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        venue ? `LOCATION:${venue}` : '',
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(line => line !== '').join('\r\n')

    return icsContent
}

/**
 * Download ICS file for mobile devices
 * @param {Object} eventData - Event details
 */
function downloadICSFile(eventData) {
    const icsContent = generateICSFile(eventData)

    // Create blob
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })

    // Create download link
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)

    // Generate filename
    const activityType = eventData.activity_type.replace('-', '_')
    const date = eventData.event_date.replace('/', '_')
    link.download = `${activityType}_workshop_${date}.ics`

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up
    URL.revokeObjectURL(link.href)
}

/**
 * Open Google Calendar with pre-filled event data
 * Uses .ics file download for mobile, web deep link for desktop
 * @param {Object} eventData - Event details from form
 */
export function openCalendarLink(eventData) {
    if (isMobileDevice()) {
        // For mobile devices, download .ics file
        // This works with both Google Calendar and Apple Calendar on iOS
        downloadICSFile(eventData)
    } else {
        // For desktop, open web version directly
        const webCalendarUrl = generateCalendarLink(eventData)
        window.open(webCalendarUrl, '_blank')
    }
}
