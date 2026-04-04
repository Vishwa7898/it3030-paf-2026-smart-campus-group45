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

export const createResource = async (data) => {
    const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create resource');
    return res.json();
}

export const createBooking = async (data) => {
    const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create booking');
    }
    return res.json();
}

export const getAllBookings = async () => {
    try {
        const res = await fetch(`${API_URL}/bookings`);
        if (!res.ok) return [];
        return res.json();
    } catch(err) {
        console.error(err);
        return [];
    }
}

export const getStudentBookings = async (studentId) => {
    try {
        const res = await fetch(`${API_URL}/bookings/student/${studentId}`);
        if (!res.ok) return [];
        return res.json();
    } catch(err) {
        console.error(err);
        return [];
    }
}

export const cancelBooking = async (id) => {
    const res = await fetch(`${API_URL}/bookings/${id}/cancel`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to cancel booking');
    return res.json();
}

export const approveBooking = async (id) => {
    const res = await fetch(`${API_URL}/bookings/${id}/approve`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to approve booking');
    return res.json();
}

export const rejectBooking = async (id, reason) => {
    const res = await fetch(`${API_URL}/bookings/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Failed to reject booking');
    return res.json();
}
