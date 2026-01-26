import { Component, viewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { useElementBounding } from './use-element-bounding.composable';

/**
 * Example component demonstrating useElementBounding usage
 * This is not part of the library, just an example for testing/documentation
 */
@Component({
  selector: 'use-element-bounding-example',
  imports: [CommonModule],
  template: `
    <div class="container">
      <div 
        #box 
        class="box"
        [style.width.px]="boxWidth"
        [style.height.px]="boxHeight"
      >
        <h3>Tracked Element</h3>
        <p>Resize me or scroll the page!</p>
      </div>

      <div class="info">
        <h4>Bounding Information</h4>
        <ul>
          <li><strong>Position:</strong> ({{ bounding().x }}, {{ bounding().y }})</li>
          <li><strong>Size:</strong> {{ bounding().width }} × {{ bounding().height }}</li>
          <li><strong>Top:</strong> {{ bounding().top }}px</li>
          <li><strong>Right:</strong> {{ bounding().right }}px</li>
          <li><strong>Bottom:</strong> {{ bounding().bottom }}px</li>
          <li><strong>Left:</strong> {{ bounding().left }}px</li>
          <li><strong>In Viewport:</strong> {{ isInViewport() ? 'Yes' : 'No' }}</li>
        </ul>

        <div class="controls">
          <button (click)="increaseSize()">Increase Size</button>
          <button (click)="decreaseSize()">Decrease Size</button>
          <button (click)="bounding().update()">Force Update</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }

    .box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
    }

    .box h3 {
      margin: 0 0 10px 0;
    }

    .box p {
      margin: 0;
      opacity: 0.9;
    }

    .info {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .info h4 {
      margin: 0 0 15px 0;
      color: #2d3748;
    }

    .info ul {
      list-style: none;
      padding: 0;
      margin: 0 0 20px 0;
    }

    .info li {
      padding: 5px 0;
      color: #4a5568;
    }

    .controls {
      display: flex;
      gap: 10px;
    }

    .controls button {
      padding: 8px 16px;
      background: #4299e1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    .controls button:hover {
      background: #3182ce;
    }

    .controls button:active {
      background: #2c5282;
    }
  `],
})
export class UseElementBoundingExampleComponent {
  boxRef = viewChild<ElementRef>('box');
  bounding = useElementBounding(this.boxRef);

  boxWidth = 300;
  boxHeight = 150;

  isInViewport = computed(() => {
    const { top, bottom, left, right } = this.bounding();
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
    
    return (
      top >= 0 &&
      left >= 0 &&
      bottom <= windowHeight &&
      right <= windowWidth
    );
  });

  increaseSize() {
    this.boxWidth += 50;
    this.boxHeight += 25;
  }

  decreaseSize() {
    this.boxWidth = Math.max(100, this.boxWidth - 50);
    this.boxHeight = Math.max(50, this.boxHeight - 25);
  }
}



