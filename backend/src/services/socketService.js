const { Server } = require('socket.io');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      path: "/socket.io/"
    });

    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (data) => {
        if (data.userId) {
          this.connectedUsers.set(socket.id, data.userId);
          socket.join(`user_${data.userId}`);
          console.log(`✅ User ${data.userId} authenticated`);
        }
      });

      // Handle joining chat rooms
      socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`👥 User ${socket.id} joined room ${roomId}`);
      });

      // Handle leaving chat rooms
      socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        console.log(`👋 User ${socket.id} left room ${roomId}`);
      });

      // Handle chat messages
      socket.on('send_message', (data) => {
        const { roomId, message, sender } = data;
        
        // Broadcast message to all users in the room
        this.io.to(roomId).emit('new_message', {
          roomId,
          message,
          sender,
          timestamp: new Date().toISOString()
        });
      });

      // Handle game invitations
      socket.on('game_invitation', (data) => {
        const { recipientId, gameDetails, sender } = data;
        
        // Send invitation to specific user
        this.io.to(`user_${recipientId}`).emit('game_invitation_received', {
          gameDetails,
          sender,
          timestamp: new Date().toISOString()
        });
      });

      // Handle game invitation responses
      socket.on('game_invitation_response', (data) => {
        const { senderId, accepted, gameId } = data;
        
        this.io.to(`user_${senderId}`).emit('game_invitation_response', {
          accepted,
          gameId,
          timestamp: new Date().toISOString()
        });
      });

      // Handle booking notifications
      socket.on('booking_update', (data) => {
        const { userId, bookingDetails, type } = data;
        
        this.io.to(`user_${userId}`).emit('booking_notification', {
          type, // 'confirmed', 'cancelled', 'reminder'
          bookingDetails,
          timestamp: new Date().toISOString()
        });
      });

      // Handle WebRTC signaling for video calls
      socket.on('webrtc_offer', (data) => {
        const { targetUserId, offer } = data;
        socket.to(`user_${targetUserId}`).emit('webrtc_offer', {
          offer,
          callerId: this.connectedUsers.get(socket.id)
        });
      });

      socket.on('webrtc_answer', (data) => {
        const { targetUserId, answer } = data;
        socket.to(`user_${targetUserId}`).emit('webrtc_answer', {
          answer,
          calleeId: this.connectedUsers.get(socket.id)
        });
      });

      socket.on('webrtc_ice_candidate', (data) => {
        const { targetUserId, candidate } = data;
        socket.to(`user_${targetUserId}`).emit('webrtc_ice_candidate', {
          candidate
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const userId = this.connectedUsers.get(socket.id);
        this.connectedUsers.delete(socket.id);
        console.log(`🔌 User disconnected: ${socket.id} (${userId})`);
      });
    });

    console.log('✅ Socket.IO server initialized');
  }

  // Utility methods
  emitToUser(userId, event, data) {
    if (this.io) {
      this.io.to(`user_${userId}`).emit(event, data);
    }
  }

  emitToRoom(roomId, event, data) {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }
  }

  broadcastToAll(event, data) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  getConnectedUserCount() {
    return this.connectedUsers.size;
  }
}

module.exports = new SocketService();
