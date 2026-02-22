import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '@/services/api.service';
import { LogsService } from '@/services/logs.service';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-announcements-widget',
    imports: [CommonModule, FormsModule, ButtonModule, MenuModule],
    template: ` 
    <!-- <div class="card">
        <div class="flex justify-between items-center mb-6">
            <div class="font-semibold text-xl">Best Selling Products</div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain" (click)="menu.toggle($event)"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>
    </div> -->
    <div class="card h-[740px]">

        <div class="font-bold text-primary text-xl mb-6">
            Announcements
        </div>

    <div class="announcement bg-transparent h-[650px] overflow-auto bg-gray-50 rounded-xl">

        <div *ngFor="let post of posts" 
            class="mb-3 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">

            <!-- HEADER -->
            <div class="p-5">
                <div class="flex justify-between items-start">

                    <div>
                        <h2 class="font-semibold text-lg text-gray-800">
                            {{ post.title }}
                        </h2>

                        <p class="text-xs text-gray-400 mt-1">
                            {{ post.createdAt | date:'medium' }}
                        </p>
                    </div>

                    <!-- Badge Group -->
                    <div class="flex gap-2">
                        <!-- 
                        <span class="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
                            👍 {{ post.likeCount || 0 }}
                        </span>
                        <span class="flex items-center gap-1 bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full font-medium">
                            🔄 {{ post.shareCount || 0 }}
                        </span>
                        <span class="flex items-center gap-1 bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full font-medium">
                            💬 {{ post.commentCount || 0 }}
                        </span>
                    -->
                    </div>
                </div>

                <!-- CONTENT -->
                <div class="mt-4 text-gray-700 leading-relaxed text-sm">
                    {{ post.content }}
                </div>

                <!-- IMAGE -->
                <img *ngIf="post.imageUrl"
                    [src]="post.imageUrl"
                    class="mt-4 rounded-xl max-h-72 object-cover w-full border border-gray-200" />

            </div>

            <!-- ACTION BAR -->
            <div class="border-t border-gray-100 px-5 py-3 bg-gray-50 rounded-b-2xl">

                <div class="flex justify-between items-center text-sm">

                    <div class="flex gap-6">

                        <button class="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                            👍 <span>Like</span>
                            <span class="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
                            {{ post.likeCount || 0 }}
                            </span>
                        </button>

                        <button class="flex items-center gap-2 text-gray-600 hover:text-green-600 transition">
                            🔄 <span>Share</span>
                            <span class="flex items-center gap-1 bg-green-50 text-green-600 text-xs px-3 py-1 rounded-full font-medium">
                            {{ post.shareCount || 0 }}
                            </span>
                        </button>

                        <button 
                            (click)="post.showComments = !post.showComments"
                            class="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition">
                            💬 <span>Comments</span>
                            <span class="flex items-center gap-1 bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full font-medium">
                            {{ post.commentCount || 0 }}
                            </span>
                        </button>

                    </div>

                </div>

                <!-- COMMENTS DROPDOWN -->
                <div *ngIf="post.showComments" 
                    class="mt-4 bg-white border border-gray-200 rounded-xl p-4 space-y-3">

                    <div *ngFor="let comment of post.comments" 
                        class="bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700">

                        <span class="font-semibold text-gray-800">
                            {{ comment.user }}
                        </span>
                        <span class="ml-2">
                            {{ comment.text }}
                        </span>
                    </div>

                    <!-- Add Comment -->
                    <div class="flex mt-3 gap-2">
                        <input type="text"
                            [(ngModel)]="post.newComment"
                            placeholder="Write a comment..."
                            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none" />

                        <button class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90 transition">
                            Post
                        </button>
                    </div>

                </div>

            </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="text-center py-4 text-gray-400">
            Loading more posts...
        </div>

        <div *ngIf="noMoreData" class="text-center py-4 text-gray-300 text-sm">
            No more posts.
        </div>

        <div #scrollAnchor></div>
    </div>

    </div>

    `,
    styles: `
    /* Custom scrollbar for WebKit browsers */
    .announcement::-webkit-scrollbar {
        width: 8px;
    }
    .announcement::-webkit-scrollbar-track {
        background: transparent;
    }
    .announcement::-webkit-scrollbar-thumb {
        background-color: transparent;
        border-radius: 10px;
    }
    .announcement::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
    `
})
export class AnnouncementWidget implements OnInit, OnDestroy {
    menu = null;

    // items = [
    //     { label: 'Add New', icon: 'pi pi-fw pi-plus' },
    //     { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    // ];


    posts: any[] = [];
    page = 1;
    pageSize = 5;
    loading = false;
    noMoreData = false;

    private destroy$ = new Subject<void>();


    @ViewChild('scrollAnchor', { static: true })
    scrollAnchor!: ElementRef;

    constructor(private api: ApiService, private logger: LogsService) { }

    ngOnInit() {
        this.loadPosts();
        this.initIntersectionObserver();
    }

    loadPosts() {

        if (this.loading || this.noMoreData) return;

        this.loading = true;

        this.api.getAdminPosts(this.page, this.pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (post) => {
                    if (post.length < this.pageSize) {
                        this.noMoreData = true;
                    }

                    const enriched = post.map(p => ({
                        ...p,
                        showComments: false,
                        comments: p.comments || [],  // optional if coming from API
                        newComment: ''
                    }));

                    this.logger.printLogs('i', 'fetch posts', post)

                    this.posts = [...this.posts, ...post];
                    this.page++;
                    this.loading = false;
                },
                error: (err) => this.logger.printLogs('e', 'Failed to fetch posts', err)
            });


        this.api.getHospitals()
    }

    initIntersectionObserver() {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                this.loadPosts();
            }
        });

        observer.observe(this.scrollAnchor.nativeElement);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

}
