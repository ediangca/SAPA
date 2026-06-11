import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { StoreService } from "./store.service";

@Injectable({
  providedIn: 'root'
})
export class SettingsLoaderService {

  constructor(
    private api: ApiService,
    private store: StoreService
  ) {}

  load(): Promise<void> {
    return new Promise((resolve) => {

      this.api.getSettings().subscribe({
        next: (settings: any[]) => {

          const mapped: Record<string, string> = {};

          settings.forEach(setting => {
            mapped[setting.name] = setting.value;
          });

          this.store.setSettings(mapped);

          resolve();
        },
        error: () => resolve()
      });

    });
  }
}