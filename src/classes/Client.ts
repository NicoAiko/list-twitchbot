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
  private tournamentBracketLink: string;

  constructor(options: IClient) {
    this.client = null;
    this.username = options.username;
    this.password = options.password;
    this.channel = options.channel;
    this.list = new Userlist();
    this.arenaId = '';
    this.arenaPassword = '';
    this.tournamentBracketLink = '';

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

  public getTournamentBracketLink(): string {
    return this.tournamentBracketLink;
  }

  public setArenaData(id: string, password: string): void {
    this.arenaId = id;
    this.arenaPassword = password;
  }

  public setTournamentBracketLink(link: string): void {
    this.tournamentBracketLink = link;
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
      case '!commands':
      case '!kommandos':
        this.client.say(target, 'Hier sind die aktuell verfügbaren Kommandos');
        this.client.say(target, 'Alle Kommandos starten mit einem !-Zeichen!');
        this.client.say(target, 'join - Fügt den Anwender in die Smash-Warteliste ein.');
        this.client.say(target, 'leave - Entfernt den Anwender aus der Smash-Warteliste.');
        this.client.say(target, 'queue - Zeigt die aktuelle Liste der Teilnehmer in der Smash-Warteliste.'); // tslint:disable-line max-line-length
        this.client.say(target, 'pos - Zeigt die aktuelle Position des Anwenders in der Smash-Warteliste.');
        this.client.say(target, 'arena / id - Zeigt die aktuelle Smash-Arena-ID und das dazugehörige Passwort.');
        this.client.say(target, 'bracket - Gibt den Link des aktuellen Turnierbaums wieder.');
        this.client.say(target, 'discord - Gibt den Link zum LiveHouse-Discord-Server wieder.');
        this.client.say(target, 'fc - Gibt den Freundescode von Nico wieder.');
        this.client.say(target, 'twitter - Gibt den Link zu Nicos Twitter wieder.');
        this.client.say(target, 'youtube - Gibt den Link zu Nicos YouTube-Kanal wieder.');
        break;
      case '!ping':
        if (permissions < Permissions.MOD) {
          break;
        }
        this.client.say(target, 'Pong');
        break;
      case '!join':
      case '!addme':
      case '!add':
      case '!teilnehmen':
      case '!rein':
        if (!this.getUserlist().isUserInList(sender)) {
          if (this.getUserlist().getList().length === 20) {
            this.client.say(target, 'Die Liste ist voll. Bitte warte, bis ein Platz frei wird.');
            return;
          }
          this.getUserlist().add(sender);
          this.client.say(target, `@${sender}: Du wurdest erfolgreich zur Liste hinzugefügt.`);
        } else {
          this.client.say(target, `@${sender}: Du bist bereits in der Liste.`);
        }
        break;
      case '!leave':
      case '!removeme':
      case '!remove':
      case '!absagen':
      case '!raus':
        if (this.getUserlist().isUserInList(sender)) {
          this.getUserlist().remove(sender);
          this.client.say(target, `@${sender}: Du wurdest aus der Liste entfernt.`);
        } else {
          this.client.say(target, `@${sender}: Du warst nicht in der Liste.`);
        }
        break;
      case '!queue':
      case '!list':
      case '!liste':
        if (!this.getUserlist().getList().length) {
          this.client.say(target, 'Die Liste ist leer.');
        } else {
          const me = this;
          this.client.say(target, 'Aktuelle Liste:');
          this.getUserlist().getList().forEach((item, index) => {
            me.client.say(target, `#${index + 1}: @${item}`);
          });
        }
        break;
      case '!next':
      case '!weiter':
        if (permissions < Permissions.MOD) {
          this.client.say(target, 'Du darfst dieses Kommando nicht verwenden!');
        } else {
          if (!this.getUserlist().getList().length) {
            this.client.say(target, 'Die Liste ist aktuell leer.');
            return;
          }
          const nextOne = this.getUserlist().getList().shift();
          this.client.say(target, `Auf geht's! Ich wähle dich, @${nextOne}!`);
        }
        break;
      case '!pos':
        const position = this.getUserlist().getList().indexOf(sender);
        if (position === -1) {
          this.client.say(target, `@${sender}: Du bist nicht in der Liste.`);
          return;
        }

        this.client.say(target, `@${sender}: Du bist auf Position #${position + 1}.`);
        break;
      case '!arena':
      case '!id':
        this.client.say(target, `ID: ${this.arenaId} - Passwort: ${this.arenaPassword}`);
        break;
      case '!bracket':
      case '!baum':
      case '!turnier':
        if (!this.tournamentBracketLink.length) {
          this.client.say(target, 'Aktuell gibt es kein Turnier bzw. keinen Turnierbaum!');
        } else {
          this.client.say(target, `Hier hast du den aktuellen Turnierbaum: ${this.tournamentBracketLink}`);
        }
        break;
      case '!discord':
        this.client.say(target, `Hier ist der Discord-Link zum LiveHouse: https://discord.gg/dSDD5yN`);
        break;
      case '!fc':
        this.client.say(target, `Hier ist Nicos Nintendo Switch Freundescode: SW-3816-1824-4790`);
        break;
      case '!twitter':
        this.client.say(target, `Hier ist der Link zu Nicos Twitter: https://twitter.com/Aikochanchen`);
        break;
      case '!youtube':
        this.client.say(target, `Hier ist der Link zu Nicos YouTube-Kanal: https://www.youtube.com/NicoAiko`);
      default:
        break;
    }
  }

  private onConnect() {
    this.client.say(this.channel, 'Hi, Leute! Ich bin der AikoBot! Willkommen im Live-Stream!');
    // tslint:disable-next-line max-line-length
    this.client.say(this.channel, 'Seid ihr noch kein Teil der LiveHouse-Community? Die Tür steht offen! Hier ist der Discord-Link: https://discord.gg/dSDD5yN');
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
