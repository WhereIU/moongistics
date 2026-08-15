export interface GameCommand {
  type: string;
}

export class CommandBus {
  private readonly queue: GameCommand[] = [];

  public enqueue(command: GameCommand): void {
    this.queue.push(command);
  }

  public drain(): GameCommand[] {
    return this.queue.splice(0, this.queue.length);
  }
}
