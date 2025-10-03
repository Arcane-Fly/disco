import { Server as SocketIOServer } from 'socket.io';
declare const dataPath: string;
declare const app: import("express-serve-static-core").Express;
declare const io: SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { app, io, dataPath };
//# sourceMappingURL=server.d.ts.map