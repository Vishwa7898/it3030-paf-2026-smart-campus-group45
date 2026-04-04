import axios from 'axios';
import { readStoredUser } from '../auth/authStorage';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

function currentUser() {
    return readStoredUser();
}

function actorPayload() {
    const u = currentUser();
    return {
        actorId: u?.id ?? '',
        actorRole: u?.role ?? 'USER',
    };
}

function viewerParams() {
    const u = currentUser();
    if (!u?.id) return {};
    return { viewerId: u.id, viewerRole: u.role };
}

export const TicketService = {
    getAllTickets: async (options = {}) => {
        const params = {
            ...viewerParams(),
        };
        if (options.status) params.status = options.status;
        if (options.submitterId) params.submitterId = options.submitterId;
        if (options.assigneeId) params.assigneeId = options.assigneeId;
        if (options.priority) params.priority = options.priority;
        if (options.category) params.category = options.category;
        if (options.q) params.q = options.q;
        const response = await api.get('/tickets', { params });
        return response.data;
    },

    getTicketById: async (id) => {
        const response = await api.get(`/tickets/${id}`, { params: viewerParams() });
        return response.data;
    },

    createTicket: async (ticketData, images) => {
        const formData = new FormData();
        Object.keys(ticketData).forEach(key => {
            if (ticketData[key] != null && ticketData[key] !== '') {
                formData.append(key, ticketData[key]);
            }
        });

        if (images && images.length > 0) {
            images.forEach(img => {
                formData.append('images', img);
            });
        }

        const response = await api.post('/tickets', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    updateTicketDetails: async (id, fields) => {
        const response = await api.put(`/tickets/${id}`, {
            ...fields,
            ...actorPayload(),
        });
        return response.data;
    },

    updateTicketStatus: async (id, status, resolutionNotes = '') => {
        const response = await api.patch(`/tickets/${id}/status`, {
            status,
            resolutionNotes,
            ...actorPayload(),
        });
        return response.data;
    },

    assignTicket: async (id, assigneeId) => {
        const response = await api.patch(`/tickets/${id}/assign`, {
            assigneeId,
            ...actorPayload(),
        });
        return response.data;
    },

    deleteTicket: async (id) => {
        const u = currentUser();
        await api.delete(`/tickets/${id}`, {
            params: {
                actorId: u?.id,
                actorRole: u?.role,
            }
        });
    }
};

export const CommentService = {
    getComments: async (ticketId) => {
        const response = await api.get(`/tickets/${ticketId}/comments`);
        return response.data;
    },

    addComment: async (ticketId, content) => {
        const u = currentUser();
        const payload = {
            content,
            authorId: u?.id ?? '',
            authorRole: u?.role ?? 'USER'
        };
        const response = await api.post(`/tickets/${ticketId}/comments`, payload);
        return response.data;
    },

    updateComment: async (ticketId, commentId, content) => {
        const u = currentUser();
        const payload = {
            content,
            authorId: u?.id ?? '',
            authorRole: u?.role ?? 'USER'
        };
        const response = await api.put(`/tickets/${ticketId}/comments/${commentId}`, payload);
        return response.data;
    },

    deleteComment: async (ticketId, commentId) => {
        const u = currentUser();
        await api.delete(`/tickets/${ticketId}/comments/${commentId}`, {
            params: {
                userId: u?.id,
                userRole: u?.role
            }
        });
    }
};

export const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return `http://localhost:8080${imagePath}`;
};
