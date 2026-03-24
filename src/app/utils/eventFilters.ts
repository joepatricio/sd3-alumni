export function isEventUpcoming(dateString: string): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);

    return eventDate.getTime() >= now.getTime();
}

export function filterUpcomingEvents(events: any[]) {
    return events.filter(e => isEventUpcoming(e.date));
}
