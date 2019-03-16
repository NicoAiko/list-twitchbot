import { client as TMIClient } from 'tmi.js';
import { Userlist } from './Userlist';

interface IClient {
  username: string;
  password: string;
  channel: string;
}

enum Permissions {
  NORMAL,
  FOLLOWER,
  SUBSCRIBER,
  MOD,
  BROADCASTER,
}

export class Client {
  public client: any;
  private channel: string;
  private password: string;
  private username: string;
  private list: Userlist;
  private arenaId: string;
  private arenaPassword: string;

  constructor(options: IClient) {
    this.client = null;
    this.username = options.username;
    this.password = options.password;
    this.channel = options.channel;
    this.list = new Userlist();
    this.arenaId = '';
    this.arenaPassword = '';

    const opts = {
      identity: {
        username: this.username,
        password: this.password,
      },
      secure: true,
      reconnect: true,
      channels: [
        this.channel,
      ],
    };

    this.client = new TMIClient(opts);
    this.client.on('message', this.onMessage.bind(this));
    this.client.on('connected', this.onConnect.bind(this));
  }

  public connect(): void {
    if (this.isConnected()) {
      return;
    }

    this.client.connect();
  }

  public disconnect(): void {
    if (!this.isConnected()) {
      return;
    }

    this.client.disconnect();
  }

  public getUserlist(): Userlist {
    return this.list;
  }

  public getArenaId(): string {
    return this.arenaId;
  }

  public getArenaPassword(): string {
    return this.arenaPassword;
  }

  public setArenaData(id: string, password: string): void {
    this.arenaId = id;
    this.arenaPassword = password;
  }

  public isConnected(): boolean {
    return this.client.readyState() === 'OPEN';
  }

  private onMessage(target: any, context: any, message: string, self: any) {
    if (self) { return; } // Ignore messages from the bot

    const sender = context['display-name'];
    const isBroadcaster = context.badges && !!context.badges.broadcaster;
    const permissions = this.getSenderPermissions(context, isBroadcaster);
    // Remove whitespace from chat message
    const commandName = message.trim();

    if (!commandName.startsWith('!')) {
      return;
    }

    switch (commandName.toLowerCase()) {
      case '!ping':
        this.client.say(target, 'Pong');
        break;
      case '!join':
      case '!addme':
        if (!this.getUserlist().isUserInList(sender)) {
          if (this.getUserlist().getList().length === 20) {
            this.client.say(target, 'The queue is full. Please wait until a place gets free.');
            return;
          }
          this.getUserlist().add(sender);
          this.client.say(target, `@${sender}: You have successfully been added to the queue.`);
        } else {
          this.client.say(target, `@${sender}: You already are in the queue.`);
        }
        break;
      case '!leave':
      case '!removeme':
        if (this.getUserlist().isUserInList(sender)) {
          this.getUserlist().remove(sender);
          this.client.say(target, `@${sender}: You have been removed from the queue.`);
        } else {
          this.client.say(target, `@${sender}: You aren't in the queue.`);
        }
        break;
      case '!queue':
      case '!list':
        if (!this.getUserlist().getList().length) {
          this.client.say(target, 'The queue is currently empty.');
        } else {
          const me = this;
          this.client.say(target, 'Current queue:');
          this.getUserlist().getList().forEach((item, index) => {
            me.client.say(target, `#${index + 1}: @${item}`);
          });
        }
        break;
      case '!next':
        if (permissions < Permissions.MOD) {
          this.client.say(target, 'You do not have the permissions to use this command!');
        } else {
          if (!this.getUserlist().getList().length) {
            this.client.say(target, 'The queue is currently empty.');
            return;
          }
          const nextOne = this.getUserlist().getList().shift();
          this.client.say(target, `@${nextOne}: You're next! Get up in!`);
        }
        break;
      case '!pos':
        const position = this.getUserlist().getList().indexOf(sender);
        if (position === -1) {
          this.client.say(target, `@${sender}: You aren't in the queue yet.`);
          return;
        }

        this.client.say(target, `@${sender}: You are at position #${position + 1}.`);
        break;
      case '!arena':
        this.client.say(target, `ID: ${this.arenaId} - Passwort: ${this.arenaPassword}`);
        break;
      default:
        break;
    }
  }

  private onConnect(address: string, port: number) {
    // Hello, I'm the AikoBot, welcome to the stream!
    this.client.say(this.channel, `Hello, I'm the AikoBot, welcome to the stream!`);
  }

  private getSenderPermissions(context: any, isBroadcaster: boolean): Permissions {
    if (isBroadcaster) {
      return Permissions.BROADCASTER;
    } else if (context.mod) {
      return Permissions.MOD;
    } else if (context.subscriber) {
      return Permissions.SUBSCRIBER;
    } else {
      return Permissions.NORMAL;
    }
  }
}
