/* This is free and unencumbered software released into the public domain. */

export class Account {
  constructor(public readonly id: string) {}

  toString(): string {
    return this.id;
  }
}
