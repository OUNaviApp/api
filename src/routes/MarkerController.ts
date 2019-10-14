import { JsonController, Post, Get } from 'routing-controllers';
// Elevator Ramp Hazard

@JsonController('/marker')
export class MarkerController {
  @Post('/create')
  public create(): void {
    return;
  }
}
