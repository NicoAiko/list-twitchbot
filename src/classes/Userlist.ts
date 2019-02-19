export class Userlist {
  private list: string[];

  constructor() {
    this.list = new Array();
  }

  public getList(): string[] {
    return this.list;
  }

  public add(username: string): boolean {
    if (username.length) {
      if (!this.isUserInList(username)) {
        this.list.push(username);

        return true;
      }
    }

    return false;
  }

  public remove(username: string): boolean {
    const index = this.list.indexOf(username);

    if (index !== -1) {
      this.list.splice(index, 1);

      return true;
    }

    return false;
  }

  public isUserInList(username: string): boolean {
    return this.list.indexOf(username) !== -1;
  }
}
