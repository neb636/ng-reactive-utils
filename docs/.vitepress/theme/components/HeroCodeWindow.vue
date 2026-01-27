<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';

const { isDark } = useData();

// Theme-aware color palette
const colors = computed(() =>
  isDark.value
    ? {
        // Dark theme colors (VS Code Dark+)
        windowBg: '#1E1E1E',
        titleBar: '#2D2D2D',
        titleText: '#8B8B8B',
        border: '#3D3D3D',
        lineNumber: '#6A737D',
        keyword: '#C586C0', // import, from, new, this
        punctuation: '#D4D4D4', // brackets, semicolons
        variable: '#9CDCFE', // variable names
        string: '#CE9178', // string literals
        function: '#DCDCAA', // function calls
        className: '#4EC9B0', // class names
        number: '#B5CEA8', // numbers
        comment: '#6A9955', // comments
        shadowId: 'shadow-dark',
        shadowStdDev: 10,
        shadowOffset: 10,
        shadowSlope: 0.25,
        redGradient: ['#ED6A5E', '#E1564A'],
        yellowGradient: ['#F5BF4F', '#F0B429'],
        greenGradient: ['#61C554', '#4DB841'],
      }
    : {
        // Light theme colors (GitHub Light)
        windowBg: '#FFFFFF',
        titleBar: '#F6F6F6',
        titleText: '#86868B',
        border: '#E5E5E5',
        lineNumber: '#6B7280',
        keyword: '#CF222E', // import, from, new, this
        punctuation: '#24292F', // brackets, semicolons
        variable: '#953800', // variable names
        string: '#0A3069', // string literals
        function: '#8250DF', // function calls
        className: '#8250DF', // class names
        number: '#0550AE', // numbers
        comment: '#6E7781', // comments
        shadowId: 'shadow-light',
        shadowStdDev: 8,
        shadowOffset: 8,
        shadowSlope: 0.12,
        redGradient: ['#FF6B63', '#FF5F57'],
        yellowGradient: ['#FFC532', '#FEBC2E'],
        greenGradient: ['#32D74B', '#28C840'],
      }
);
</script>

<template>
  <div class="hero-code-window">
    <svg
      class="code-window"
      width="520"
      height="340"
      viewBox="0 0 520 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Shadow -->
      <g :filter="`url(#${colors.shadowId})`">
        <!-- Window Background -->
        <rect x="10" y="10" width="500" height="320" rx="12" :fill="colors.windowBg" />
      </g>

      <!-- Title Bar -->
      <rect x="10" y="10" width="500" height="36" rx="12" :fill="colors.titleBar" />
      <rect x="10" y="34" width="500" height="12" :fill="colors.titleBar" />

      <!-- Traffic Lights -->
      <circle cx="30" cy="28" r="6" fill="url(#redGradient)" />
      <circle cx="50" cy="28" r="6" fill="url(#yellowGradient)" />
      <circle cx="70" cy="28" r="6" fill="url(#greenGradient)" />

      <!-- Window Title -->
      <text
        x="260"
        y="32"
        font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        font-size="12"
        :fill="colors.titleText"
        text-anchor="middle"
        font-weight="500"
      >
        search.component.ts
      </text>

      <!-- Code Content -->
      <g font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="11.5">
        <!-- Line 1: import { computed } from '@angular/core'; -->
        <text x="24" y="68" :fill="colors.lineNumber">1</text>
        <text x="48" y="68">
          <tspan :fill="colors.keyword">import</tspan>
          <tspan :fill="colors.punctuation"> { </tspan>
          <tspan :fill="colors.variable">computed</tspan>
          <tspan :fill="colors.punctuation"> } </tspan>
          <tspan :fill="colors.keyword">from</tspan>
          <tspan :fill="colors.string"> '@angular/core'</tspan>
          <tspan :fill="colors.punctuation">;</tspan>
        </text>

        <!-- Line 2: import { -->
        <text x="24" y="86" :fill="colors.lineNumber">2</text>
        <text x="48" y="86">
          <tspan :fill="colors.keyword">import</tspan>
          <tspan :fill="colors.punctuation"> {</tspan>
        </text>

        <!-- Line 3: useControlValue, useDebouncedSignal, useWindowSize -->
        <text x="24" y="104" :fill="colors.lineNumber">3</text>
        <text x="48" y="104">
          <tspan :fill="colors.punctuation">  </tspan>
          <tspan :fill="colors.variable">useControlValue</tspan>
          <tspan :fill="colors.punctuation">, </tspan>
          <tspan :fill="colors.variable">useDebouncedSignal</tspan>
          <tspan :fill="colors.punctuation">, </tspan>
          <tspan :fill="colors.variable">useWindowSize</tspan>
        </text>

        <!-- Line 4: } from 'ng-reactive-utils'; -->
        <text x="24" y="122" :fill="colors.lineNumber">4</text>
        <text x="48" y="122">
          <tspan :fill="colors.punctuation">} </tspan>
          <tspan :fill="colors.keyword">from</tspan>
          <tspan :fill="colors.string"> 'ng-reactive-utils'</tspan>
          <tspan :fill="colors.punctuation">;</tspan>
        </text>

        <!-- Line 5: empty -->
        <text x="24" y="140" :fill="colors.lineNumber">5</text>

        <!-- Line 6: // Convert FormControl to reactive signal -->
        <text x="24" y="158" :fill="colors.lineNumber">6</text>
        <text x="48" y="158">
          <tspan :fill="colors.comment">// Convert FormControl to reactive signal</tspan>
        </text>

        <!-- Line 7: searchControl = new FormControl(''); -->
        <text x="24" y="176" :fill="colors.lineNumber">7</text>
        <text x="48" y="176">
          <tspan :fill="colors.variable">searchControl</tspan>
          <tspan :fill="colors.punctuation"> = </tspan>
          <tspan :fill="colors.keyword">new</tspan>
          <tspan :fill="colors.className"> FormControl</tspan>
          <tspan :fill="colors.punctuation">(</tspan>
          <tspan :fill="colors.string">''</tspan>
          <tspan :fill="colors.punctuation">);</tspan>
        </text>

        <!-- Line 8: searchValue = useControlValue(this.searchControl); -->
        <text x="24" y="194" :fill="colors.lineNumber">8</text>
        <text x="48" y="194">
          <tspan :fill="colors.variable">searchValue</tspan>
          <tspan :fill="colors.punctuation"> = </tspan>
          <tspan :fill="colors.function">useControlValue</tspan>
          <tspan :fill="colors.punctuation">(</tspan>
          <tspan :fill="colors.keyword">this</tspan>
          <tspan :fill="colors.punctuation">.searchControl);</tspan>
        </text>

        <!-- Line 9: empty -->
        <text x="24" y="212" :fill="colors.lineNumber">9</text>

        <!-- Line 10: // Debounce for API calls, track window size -->
        <text x="24" y="230" :fill="colors.lineNumber">10</text>
        <text x="48" y="230">
          <tspan :fill="colors.comment">// Debounce for API calls, track window size</tspan>
        </text>

        <!-- Line 11: debouncedSearch = useDebouncedSignal(this.searchValue, 300); -->
        <text x="24" y="248" :fill="colors.lineNumber">11</text>
        <text x="48" y="248">
          <tspan :fill="colors.variable">debouncedSearch</tspan>
          <tspan :fill="colors.punctuation"> = </tspan>
          <tspan :fill="colors.function">useDebouncedSignal</tspan>
          <tspan :fill="colors.punctuation">(</tspan>
          <tspan :fill="colors.keyword">this</tspan>
          <tspan :fill="colors.punctuation">.searchValue, </tspan>
          <tspan :fill="colors.number">300</tspan>
          <tspan :fill="colors.punctuation">);</tspan>
        </text>

        <!-- Line 12: windowSize = useWindowSize(); -->
        <text x="24" y="266" :fill="colors.lineNumber">12</text>
        <text x="48" y="266">
          <tspan :fill="colors.variable">windowSize</tspan>
          <tspan :fill="colors.punctuation"> = </tspan>
          <tspan :fill="colors.function">useWindowSize</tspan>
          <tspan :fill="colors.punctuation">();</tspan>
        </text>

        <!-- Line 13: empty -->
        <text x="24" y="284" :fill="colors.lineNumber">13</text>

        <!-- Line 14: // Compose into derived state -->
        <text x="24" y="302" :fill="colors.lineNumber">14</text>
        <text x="48" y="302">
          <tspan :fill="colors.comment">// Compose into derived state</tspan>
        </text>

        <!-- Line 15: isMobile = computed(() => this.windowSize().width < 768); -->
        <text x="24" y="320" :fill="colors.lineNumber">15</text>
        <text x="48" y="320">
          <tspan :fill="colors.variable">isMobile</tspan>
          <tspan :fill="colors.punctuation"> = </tspan>
          <tspan :fill="colors.function">computed</tspan>
          <tspan :fill="colors.punctuation">(() => </tspan>
          <tspan :fill="colors.keyword">this</tspan>
          <tspan :fill="colors.punctuation">.windowSize().width &lt; </tspan>
          <tspan :fill="colors.number">768</tspan>
          <tspan :fill="colors.punctuation">);</tspan>
        </text>
      </g>

      <!-- Outer Border -->
      <rect x="10" y="10" width="500" height="320" rx="12" :stroke="colors.border" stroke-width="1" fill="none" />

      <!-- Defs -->
      <defs>
        <filter :id="colors.shadowId" x="-10" y="-5" width="540" height="360" filterUnits="userSpaceOnUse">
          <feGaussianBlur in="SourceAlpha" :stdDeviation="colors.shadowStdDev" />
          <feOffset dx="0" :dy="colors.shadowOffset" />
          <feComponentTransfer>
            <feFuncA type="linear" :slope="colors.shadowSlope" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="redGradient" cx="0.3" cy="0.3">
          <stop offset="0%" :stop-color="colors.redGradient[0]" />
          <stop offset="100%" :stop-color="colors.redGradient[1]" />
        </radialGradient>

        <radialGradient id="yellowGradient" cx="0.3" cy="0.3">
          <stop offset="0%" :stop-color="colors.yellowGradient[0]" />
          <stop offset="100%" :stop-color="colors.yellowGradient[1]" />
        </radialGradient>

        <radialGradient id="greenGradient" cx="0.3" cy="0.3">
          <stop offset="0%" :stop-color="colors.greenGradient[0]" />
          <stop offset="100%" :stop-color="colors.greenGradient[1]" />
        </radialGradient>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
.hero-code-window {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.code-window {
  width: 100%;
  height: auto;
  max-width: 600px;
}

@media (max-width: 960px) {
  .hero-code-window {
    max-width: 100%;
    padding: 0 24px;
  }

  .code-window {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .hero-code-window {
    padding: 0 16px;
  }
}
</style>
