export type Message = { userId: string; msg: string; ts: Date };
export type RoomSessionData = { messages: Message[]; connectedUsers: string[] };

export class SessionClient {
  private socket: WebSocket;
  public host: string;
  private constructor(socket: WebSocket, host: string) {
    this.socket = socket;
    this.host = host;
  }
  public static async connect(host: string, token: string): Promise<SessionClient> {
    return new Promise<SessionClient>((resolve, reject) => {
      const scheme = import.meta.env.DEV ? "ws" : "wss";
      const socket = new WebSocket(`${scheme}://${host}/?token=${token}`);
      socket.onopen = () => {
        resolve(new SessionClient(socket, host));
      };
      socket.onerror = (error) => {
        reject(error);
      };
    });
  }
  public onMessage(callback: (data: RoomSessionData) => void): void {
    this.socket.onmessage = (event) => {
      callback(JSON.parse(event.data) as RoomSessionData);
    };
  }
  public sendMessage(msg: string): void {
    this.socket.send(msg);
  }
  public onClose(callback: () => void): void {
    this.socket.onclose = callback;
  }
  public close(): void {
    this.socket.close();
  }
}
