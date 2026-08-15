export interface GameEvent {
  type: string;
}

export class EventBus {
  private readonly queue: GameEvent[] = [];

  public emit(event: GameEvent): void {
    this.queue.push(event);
  }

  public drain(): GameEvent[] {
    return this.queue.splice(0, this.queue.length);
  }
}
