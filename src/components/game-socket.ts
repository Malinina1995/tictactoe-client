import {io, Socket} from "socket.io-client";
import {DefaultEventsMap} from "socket.io-client/build/typed-events";

export class GameSocket {
    private socket: Socket<DefaultEventsMap, DefaultEventsMap>;
    constructor(wsAddress: string = "ws://localhost:3001") {
        this.socket = io(wsAddress, {reconnection: false});
    }

    start() {
        this.socket.on('connect', () => {})
    }
}
