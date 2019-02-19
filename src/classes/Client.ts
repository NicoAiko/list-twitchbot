import { client as TMIClient } from 'tmi.js';
import { Userlist } from './Userlist';

interface IClient {
  username: string;
  password: string;
  channel: string;
}

export class Client {
  private channel: string;
  private password: string;
  private username: string;
  private client: any;
  private list: Userlist;

  public constructor(options: IClient) {
    this.username = options.username;
    this.password = options.password;
    this.channel = options.channel;
    this.list = new Userlist();

    const opts = {
      identity: {
        username: this.username,
        password: this.password,
      },
      channels: [
        this.channel,
      ],
    };

    this.client = new TMIClient(opts);
    this.client.on('message', this.onMessage.bind(this));
    this.client.on('connected', this.onConnect.bind(this));
    this.client.connect();
  }

  public getUserlist(): Userlist {
    return this.list;
  }

  private onMessage(target: any, context: any, message: string, self: any) {
    if (self) { return; } // Ignore messages from the bot

    const sender = context['display-name'];
    const isBroadcaster = !!context.badges.broadcaster;
    // Remove whitespace from chat message
    const commandName = message.trim();

    if (!commandName.startsWith('!')) {
      return;
    }

    switch (commandName) {
      case '!ping':
        this.client.say(target, 'Pong');
        break;
      case '!join':
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
        if (this.getUserlist().isUserInList(sender)) {
          this.getUserlist().remove(sender);
          this.client.say(target, `@${sender}: You have been removed from the queue.`);
        } else {
          this.client.say(target, `@${sender}: You aren't in the queue.`);
        }
        break;
      case '!queue':
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
        if (!context.mod && !isBroadcaster) {
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
      default:
        break;
    }
  }

  private onConnect(address: string, port: number) {
    console.log(`* Connected to: ${address}:${port}`);
  }
}
