import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Logger, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PresenceService } from './presence.service';
import { SessionsService } from '../sessions/sessions.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('WebsocketGateway');

    constructor(
        private jwtService: JwtService,
        private presenceService: PresenceService,
        @Inject(forwardRef(() => SessionsService))
        private sessionsService: SessionsService,
    ) { }

    afterInit(server: Server) {
        this.logger.log('Websocket Gateway Initialized');
    }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new Error('No token provided');
            }

            const payload = await this.jwtService.verifyAsync(token);
            client.data.user = payload;

            const userId = payload.sub;
            const orgId = payload.orgId;

            // Join per-user and per-org rooms
            client.join(`user:${userId}`);
            if (orgId) {
                client.join(`org:${orgId}`);

                // Presence tracking
                await this.presenceService.setUserOnline(userId, orgId);

                // Notify organization that user is online
                this.server.to(`org:${orgId}`).emit('USER_ONLINE', { userId });

                // Sync current session state back to browser on reconnect
                const activeSession = await this.sessionsService.getActiveSession(userId);
                if (activeSession) {
                    client.emit('SESSION_SYNC', activeSession);
                }
            }

            this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
        } catch (error: any) {
            this.logger.error(`Connection unauthorized: ${error.message}`);
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        const user = client.data.user;
        if (user) {
            const userId = user.sub;
            const orgId = user.orgId;

            await this.presenceService.setUserOffline(userId);

            if (orgId) {
                this.server.to(`org:${orgId}`).emit('USER_OFFLINE', { userId });
            }

            this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
        }
    }

    // Helper methods for other services to emit events
    emitSessionUpdate(orgId: string, data: any) {
        this.server.to(`org:${orgId}`).emit('SESSION_UPDATE', data);
    }

    emitInactiveAlert(userId: string, data: any) {
        this.server.to(`user:${userId}`).emit('INACTIVE_ALERT', data);
    }

    emitOvertimeAlert(userId: string, data: any) {
        this.server.to(`user:${userId}`).emit('OVERTIME_ALERT', data);
    }

    emitAdminAlert(orgId: string, data: any) {
        this.server.to(`org:${orgId}`).emit('ADMIN_NOTIFICATION', data);
    }

    @SubscribeMessage('productivity:update')
    handleProductivityUpdate(client: Socket, data: any) {
        const user = client.data.user;
        if (user?.orgId) {
            this.server.to(`org:${user.orgId}`).emit('dashboard:stats-update', {
                ...data,
                userId: user.sub
            });
        }
    }

    @SubscribeMessage('activity:ping')
    async handleActivityPing(client: Socket) {
        const user = client.data.user;
        if (user) {
            const userId = user.sub;
            const orgId = user.orgId;

            // Pulse the active session's lastActivityTimestamp
            await this.sessionsService.updateLastActivity(userId);

            this.logger.debug(`Activity ping from user: ${userId}`);
        }
    }
}
