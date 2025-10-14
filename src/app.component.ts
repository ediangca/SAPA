import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AsyncPipe } from '@angular/common';
import { NgToastModule, ToasterPosition } from 'ng-angular-popup'
import { LoadingService } from '@/services/loading.service';
import AOS from 'aos';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, ProgressSpinnerModule, AsyncPipe, NgToastModule],
  template: `
    <router-outlet></router-outlet>
    <ng-toast [width]="400"[position]="ToasterPosition.TOP_RIGHT" /> <!-- configure width with position   -->
    <!-- Fullscreen Loading Overlay -->
    @if (isLoading | async) {
      <div class="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
        <!-- 🔥 Custom Loading GIF -->
        <img src="assets/images/hospital-loading.gif" alt="Loading..." class="w-64 h-64 mb-0" />
        
        <!-- Text + Bouncing dots -->
        <div class="flex items-center text-white text-2xl font-semibold" style="margin-top: -50px;">
          <span class="ml-2 flex space-x-4">
            <!-- <span class="w-4 h-4 bg-sky-500/50 rounded-full animate-bounce-high delay-0"></span>
            <span class="w-4 h-4 bg-sky-500/50 rounded-full animate-bounce-high delay-200"></span>
            <span class="w-4 h-4 bg-sky-500/50 rounded-full animate-bounce-high delay-400"></span>
            <span class="w-4 h-4 bg-sky-500/50 rounded-full animate-bounce-high delay-600"></span> -->
            <span class="w-4 h-4 bg-red-500 rounded-full animate-bounce-high delay-0"></span>
            <span class="w-4 h-4 bg-blue-500 rounded-full animate-bounce-high delay-200"></span>
            <span class="w-4 h-4 bg-green-500 rounded-full animate-bounce-high delay-400"></span>
            <span class="w-4 h-4 bg-yellow-500 rounded-full animate-bounce-high delay-600"></span>
          </span>
        </div>
      </div>
    }
  `,
  styles: [`
  
    @keyframes bounce-high {
      0%, 100% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      }
      50% {
        transform: translateY(-1rem); /* 👈 adjust bounce height */
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
    }
    .animate-bounce-high {
      animation: bounce-high 1s infinite;
    }
    /* Custom stagger delays */
    .delay-0 { animation-delay: 0s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-600 { animation-delay: 0.6s; }
  `]
})

export class AppComponent implements OnInit {


  ToasterPosition = ToasterPosition

  constructor(private loadingService: LoadingService) { }

  get isLoading() {
    return this.loadingService.loading$; // observable<boolean>
  }

  ngOnInit() {
    AOS.init({ disable: 'mobile' });
    AOS.refresh();
  }
}
