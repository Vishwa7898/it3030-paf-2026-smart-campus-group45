const API_URL = 'http://localhost:8080/api';

export const getRooms = async () => {
    try {
        const res = await fetch(`${API_URL}/rooms`);
        if (!res.ok) return []; // return empty if backend fails for now
        return res.json();
    } catch(err) {
        console.error(err);
        return [];
    }
}

export const createBooking = async (data) => {
    const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create booking');
    return res.json();
}
