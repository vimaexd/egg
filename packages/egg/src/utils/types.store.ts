export interface IGuildStore<T> {
  [guildId: string]: T;
}

export interface IGuildUserStore<T> {
  [guildId: string]: {
    [userId: string]: T;
  }
}